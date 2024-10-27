
const isDev = process.argv.includes("--dev");
const watch = process.argv.includes("--watch");

import { context } from "esbuild";
import alias from 'esbuild-plugin-alias';
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

// Define path mappings with support for multiple paths
const pathMappings = [
    {
        alias: '@utils/types',
        paths: [
            { path: resolve(primaryDir, 'utils/types.ts') },
            { path: resolve(fallbackDir, 'utils/types.ts') }
        ]
    },
    {
        alias: '@utils',
        paths: [
            { path: resolve(primaryDir, 'utils') },
            { path: resolve(fallbackDir, 'utils') }
        ]
    },
    {
        alias: '@utils/api',
        paths: [
            {  path: resolve(primaryDir, 'api') },
            {  path: resolve(fallbackDir, 'api') }
        ]
    },
    {
        alias: '@utils/api/ContextMenu',
        paths: [
            { path: resolve(primaryDir, 'api/ContextMenu.ts') },
            { path: resolve(fallbackDir, 'api/ContextMenu.ts') }
        ]
    },
    {
        alias: '@utils/types/webpack/common',
        paths: [
            { path: resolve(primaryDir, 'webpack/common/index.ts') },
            { path: resolve(fallbackDir, 'webpack/common/index.ts') }
        ]
    },
    {
        alias: '@webpack',
        paths: [
            { path: resolve(primaryDir, 'webpack/index.ts') },
            { path: resolve(fallbackDir, 'webpack/index.ts') }
        ]
    },
    {
        alias: '@webpack/common',
        paths: [
            { path: resolve(primaryDir, 'webpack/common/index.ts') },
            { path: resolve(fallbackDir, 'webpack/common/index.ts') }
        ]
    }
];

// Function to resolve the first existing path
function resolvePath(paths) {
    for (const { path } of paths) {
        if (existsSync(path)) {
            return path; // Return the first path that exists
        }
    }
    throw new Error("No valid path found for alias."); // Handle if no paths exist
}

// Setup esbuild context
const plugins = readdirSync("./src");

const contexts = await Promise.all(
    plugins.map(p => {
        return context({
            entryPoints: [`./src/${p}`],
            outfile: `dist/${p}`,
            format: "esm",
            globalName: "VencordPlugin",
            jsxFactory: "Vencord.Webpack.Common.React.createElement",
            jsxFragment: "Vencord.Webpack.Common.React.Fragment",
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
            plugins: [
                vencordDep,
                alias(
                    Object.fromEntries(
                        pathMappings.map(({ alias, paths }) => [
                            alias,
                            resolvePath(paths) // Resolve the first existing path
                        ])
                    )
                )
            ],
            minify: false,
            bundle: true,
            sourcemap: false,
            logLevel: "info",
            tsconfig: "./build/tsconfig.json"
        });
    })
);

// Additional logic for watching or deploying as needed...


function deploy() {
    const { autoDeploy, vencordDataDir, pluginName } = Config;
    if (!autoDeploy) return;

    if (!existsSync(vencordDataDir)) {
        console.warn("Vencord data directory does not exist:", vencordDataDir);
        console.warn("Thus, deployment is skipped");
        console.warn("You can fix this by editing config.json");
        return;
    }

    if (autoDeploy && existsSync(vencordDataDir)) {
        const pluginDir = join(vencordDataDir, "userplugins");
        const pluginFolder = join(pluginDir, pluginName);

        if (!existsSync(pluginFolder)) {
            mkdirSync(pluginFolder, { recursive: true });
            console.log(`Created plugin folder: ${pluginFolder}`);
        }

        rmSync(pluginFolder, {
            recursive: true,
            force: true
        });

        cpSync("dist", pluginFolder, {
            recursive: true
        });

        console.log("Deployed Plugins to", pluginFolder);
    }
}

if (watch) {
    await Promise.all(contexts.map(ctx => ctx.watch()));
} else {
    await Promise.all(
        contexts.map(async ctx => {
            await ctx.rebuild();
            await ctx.dispose();
        })
    );
    deploy();
}
