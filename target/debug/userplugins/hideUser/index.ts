import * as vencord from "./imports.ts"

// global-externals:@utils/types
var types_default = vencord;
var { types } = vencord;

// global-externals:@utils/api/ContextMenu
var { addGlobalContextMenuPatch, GlobalContextMenuPatchCallback, removeContextMenuPatch } = vencord.ContextMenu;

// src/index.ts
var patchContextMenu = (navId, children) => () => {
  const targetElement = children.find(
    (child) => child?.props?.className?.includes("peopleList_e0840f")
  );
  console.log(parentDir);
  if (targetElement) {
    console.log("Found the element with class peopleList_e0840f:", targetElement);
  } else {
    console.log("Element with class peopleList_e0840f not found in this context menu.");
  }
};
var src_default = types_default({
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
  }
});
export {
  src_default as default
};
