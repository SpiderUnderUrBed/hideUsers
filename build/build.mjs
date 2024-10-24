import { context } from "esbuild";
import alias from 'esbuild-plugin-alias';
import { cpSync, existsSync, readdirSync, rmSync, mkdirSync } from "fs"; // Import mkdirSync
import vencordDep from "./vencordDeps.mjs";
import Config from "../config.json" with { type: "json" };
import path, { join, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);
const parentDir = path.dirname(__dirname);

const plugins = readdirSync("./src");

const isDev = process.argv.includes("--dev");
const watch = process.argv.includes("--watch");

const contexts = await Promise.all(
    plugins.map(p => {
        return context({
            entryPoints: [`./src/${p}`],
            outfile: `dist/${p}`,
            format: "esm",
            //esm and ejs work
            globalName: "VencordPlugin",
            jsxFactory: "Vencord.Webpack.Common.React.createElement",
            jsxFragment: "Vencord.Webpack.Common.React.Fragment",
            packages: 'external',
            external: [
                "@vencord/types/*", 
                "@utils/api/ContextMenu/*", 
                "@webpack",
                // "@utils/*",
                "@utils/types/webpack/common",
                //"../Vencord/src/webpack/index.ts"
            ],
            plugins: [
                vencordDep,
                alias({
                    '@utils/types': resolve(parentDir, '../Vencord/src/utils/types.ts'),
                    '@utils': resolve(parentDir, '../Vencord/src/utils'),
                    '@utils/api': resolve(parentDir, '../Vencord/src/api'),
                    "@utils/api/ContextMenu": resolve(parentDir, '../Vencord/src/api/ContextMenu.ts'),
                    "@utils/types/webpack/common": resolve(parentDir, '../Vencord/src/webpack/common/index.ts'),
                    '@webpack': resolve(parentDir, '../Vencord/src/webpack/index.ts'),
                    '@webpack/common': resolve(parentDir, '../Vencord/src/webpack/common/index.ts'),
                })
            ],
            // footer: { 
            //     js: `
            //         return VencordPlugin;\n//# sourceURL=${encodeURI(p)}
            //     `
            // },
            minify: false,
            bundle: true,
            sourcemap: "linked",
            logLevel: "info",
            tsconfig: "./build/tsconfig.json"
        });
    })
);

function deploy() {
    const { autoDeploy, vencordDataDir, pluginName } = Config; // Get pluginName from config
    if (!autoDeploy) return;

    if (!existsSync(vencordDataDir)) {
        console.warn("Vencord data directory does not exist:", vencordDataDir);
        console.warn("Thus, deployment is skipped");
        console.warn("You can fix this by editing config.json");
        return;
    }

    if (autoDeploy && existsSync(vencordDataDir)) {
        const pluginDir = join(vencordDataDir, "userplugins");
        const pluginFolder = join(pluginDir, pluginName); // Create a new folder with pluginName

        // Create the plugin folder if it doesn't exist
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
