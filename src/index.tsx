//import { definePlugin } from "@vencord/types/Vencord";
// import definePlugin from "@vencord/types/utils/types";
// import { definePluginSettings } from "@vencord/types/api/Settings";
// import { addGlobalContextMenuPatch, GlobalContextMenuPatchCallback, removeContextMenuPatch } from "@vencord/types/api/ContextMenu"
//import { addGlobalContextMenuPatch, GlobalContextMenuPatchCallback, removeContextMenuPatch } from "@utils/api/ContextMenu/removeContextMenuPatch";

// import definePlugin, { OptionType } from "@utils/types";
// import  { addGlobalContextMenuPatch, GlobalContextMenuPatchCallback, removeContextMenuPatch } from "@utils/api/ContextMenu";
// import { Menu } from "@utils/types/webpack/common";

// import definePlugin from "../../types/utils/types";
// import { definePluginSettings } from "../../types/utils/types";
// import { addGlobalContextMenuPatch, GlobalContextMenuPatchCallback, removeContextMenuPatch } from "../../types/utils/types"
//C:\Users\SpiderUnderUrBed.DaSpiderCave\Documents\Vencord\src

//import definePlugin from "C:/Users/SpiderUnderUrBed.DaSpiderCave/Documents/Vencord/src/types/utils/types";
import definePlugin, { definePluginSettings } from "C:/Users/SpiderUnderUrBed.DaSpiderCave/Documents/Vencord/src/utils/types";
import { addGlobalContextMenuPatch, GlobalContextMenuPatchCallback, removeContextMenuPatch } from "C:/Users/SpiderUnderUrBed.DaSpiderCave/Documents/Vencord/src/api/ContextMenu"

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