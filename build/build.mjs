// import 'module-alias/register.js';
import { context } from "esbuild";
import alias from 'esbuild-plugin-alias-path';
import { copy } from 'esbuild-plugin-copy';
//@spiderunderurbed/esbuild-plugin-global-externals
//import importDirectory from 'esm-import-directory';
//const globalExternals = importDirectory("./lib/modules/esbuild-plugin-global-externals")
//import { globalExternals } from "../lib/modules/esbuild-plugin-global-externals";
//import { globalExternals } from "@spiderunderurbed/esbuild-plugin-global-externals";
import { globalExternals } from "@fal-works/esbuild-plugin-global-externals";
import { cpSync, existsSync, readdirSync, rmSync, mkdirSync } from "fs";
import vencordDep from "./vencordDeps.mjs";
import path, { join, resolve } from "path";
import { fileURLToPath } from "url";
import simpleGit from 'simple-git';
import Config from "../config.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.dirname(__dirname);

const primaryDir = resolve(parentDir, '../Vencord/src');
const fallbackDir = resolve(parentDir, './lib/Vencord/src');

// Define path mappings
const pathMappings = [
    {
        alias: '@utils/types',
        paths: [
            { path: resolve(primaryDir, 'utils/types.ts') },
            { path: resolve(fallbackDir, 'utils/types.ts') }
        ]
    },
    // Add other mappings similarly...
];

// Resolve the first valid path
function resolvePath(paths) {
    for (const { path } of paths) {
        if (existsSync(path)) {
            return path;
        }
    }
    throw new Error("No valid path found for alias.");
}

// Initialize plugins
const plugins = readdirSync("./src");

const contexts = await Promise.all(
    plugins.map(p => context({
        entryPoints: [`./src/${p}`],
        outfile: `dist/${p}`,
        format: "esm",
        globalName: "VencordPlugin",
        jsxFactory: "Vencord.Webpack.Common.React.createElement",
        jsxFragment: "Vencord.Webpack.Common.React.Fragment",
        plugins: [
           // vencordDep,
            alias(
                Object.fromEntries(
                    pathMappings.map(({ alias, paths }) => [
                        alias,
                        resolvePath(paths)
                    ])
                )
            ),
            globalExternals({
                "@utils/types": {
                    varName: "vencord",
                    namedExports: ["types"],
                    type: "esm",
                    defaultExport: true
                },
                "@utils/api/ContextMenu": {
                    varName: "vencord.ContextMenu",
                    namedExports: ["addGlobalContextMenuPatch", "GlobalContextMenuPatchCallback", "removeContextMenuPatch"],
                    type: "esm",
                    defaultExport: false
                }
            }),
            copy({
                resolveFrom: 'cwd',
                assets: { from: ['./assets/*'], to: ['./dist'] },
                watch: true,
            }),
        ],
        external: [
            "@vencord/types/*",
            "@utils/api/ContextMenu/*",
            "@webpack",
            "@utils/types/webpack/common",
            "@utils/patches",
            "@utils/Logger",
            "@utils/lazyReact",
            "@utils/react",
            "@utils/lazy"
        ],
        banner: {
            js: `import * as vencord from "./imports.ts"`
        },
        minify: false,
        bundle: true,
        sourcemap: false,
        logLevel: "info",
        tsconfig: "./build/tsconfig.json"
    }))
);

// Deploy function
function deploy() {
    const { autoDeploy, vencordDataDir, pluginName } = Config;
    if (!autoDeploy) return;
    if (!existsSync(vencordDataDir)) {
        console.warn("Vencord data directory does not exist:", vencordDataDir);
        return;
    }
    const pluginDir = join(vencordDataDir, "userplugins");
    const pluginFolder = join(pluginDir, pluginName);
    rmSync(pluginFolder, { recursive: true, force: true });
    cpSync("dist", pluginFolder, { recursive: true });
    console.log("Deployed Plugins to", pluginFolder);
}

// Start watching or deploy
if (false) {
    await Promise.all(contexts.map(ctx => ctx.watch()));
} else {
    await Promise.all(contexts.map(async ctx => {
        await ctx.rebuild();
        await ctx.dispose();
    }));
    deploy();
}
