"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });

  // ../../utils/types.ts
  function definePlugin(p) {
    return p;
  }

  // index.ts
  var import_ContextMenu = __require("@utils/api/ContextMenu");
  var patchContextMenu = (navId, children) => () => {
    console.log(navId);
  };
  var hideUsers_default = definePlugin({
    name: "hideUser",
    description: "This hides a user like friend from DM's and friends page",
    authors: [{
      name: "SpiderUnderUrBed",
      id: 0n
    }],
    patches: [],
    start() {
      console.log(this.name, "just started");
      (0, import_ContextMenu.addGlobalContextMenuPatch)(patchContextMenu);
    },
    stop() {
    }
  });
})();
