// import definePlugin from "@utils/types";
//import { definePluginSettings } from "@vencord/types/api/settings";
import definePlugin, { OptionType } from "@utils/types";
//import { addGlobalContextMenuPatch, GlobalContextMenuPatchCallback, removeContextMenuPatch } from "@utils/api/ContextMenu/removeContextMenuPatch";
import  { addGlobalContextMenuPatch, GlobalContextMenuPatchCallback, removeContextMenuPatch } from "@utils/api/ContextMenu";
import { Menu } from "@utils/types/webpack/common";

// const myGlobalContextMenuPatch: removeContextMenuPatch = (navId, children, ...args) => {
//     // You can log navId, args, or manipulate children here
//     console.log('Nav ID:', navId);
//     console.log('Arguments:', args);

//     // Modify or enhance the context menu items
//     const modifiedChildren = [...children];
// }

// const patchContextMenu: GlobalContextMenuPatchCallback = (navId, children) => () => {
//     console.log("entry " + navId + " " + children)
// };
// const patchContextMenu: GlobalContextMenuPatchCallback = (navId, children) => () => {
//     children.unshift((
//         <Menu.MenuItem
//             id="example-context-menu-item"
//             label="read if cute"
//             action={() => {
//                 alert(":3");
//             }}
//         />
//     ));
// };
const patchContextMenu: GlobalContextMenuPatchCallback = (navId, children) => () => {
    // Search for the element with the class 'peopleList_e0840f'
    const targetElement = children.find(child =>
      child?.props?.className?.includes('peopleList_e0840f')
    );
    console.log("test")
    // Log the target element if found
    if (targetElement) {
      console.log('Found the element with class peopleList_e0840f:', targetElement);
    } else {
      console.log('Element with class peopleList_e0840f not found in this context menu.');
    }
  };
export default definePlugin({
    name: "hideUser",   
    description: "This hides a user like friend from DM's and friends page",
    authors: [{
        name: "SpiderUnderUrBed",
        id: 0n
    }],

    patches: [
    ],
    start() {
        console.log(this.name, "just started");

        addGlobalContextMenuPatch(patchContextMenu);
    },
    stop() {
        //removeContextMenuPatch("example-context-menu-item", patchContextMenu);
    },
});