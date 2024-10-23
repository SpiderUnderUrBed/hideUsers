// import definePlugin from "@utils/types";
//import { definePluginSettings } from "@vencord/types/api/settings";
import definePlugin, { OptionType } from "@utils/types";
import { addGlobalContextMenuPatch, GlobalContextMenuPatchCallback, removeContextMenuPatch } from "@utils/types/api/ContextMenu";

// const myGlobalContextMenuPatch: removeContextMenuPatch = (navId, children, ...args) => {
//     // You can log navId, args, or manipulate children here
//     console.log('Nav ID:', navId);
//     console.log('Arguments:', args);

//     // Modify or enhance the context menu items
//     const modifiedChildren = [...children];
// }
const patchContextMenu: GlobalContextMenuPatchCallback = (navId, children) => () => {
    console.log(navId)
};
export default definePlugin({
    name: "hideUser",
    description: "This hides a user like friend from DM's and friends page",
    authors: [{
        name: "SpiderUnderUrBed",
        id: 0n
    }],

    patches: [],
    start() {
        console.log(this.name, "just started");
        addGlobalContextMenuPatch(patchContextMenu);

    },
    stop() {

    },
});