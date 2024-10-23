"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// ../Vencord/src/utils/types.ts
function definePlugin(p) {
  return p;
}

// ../Vencord/src/utils/Logger.ts
var Logger = class {
  constructor(name, color = "white") {
    this.name = name;
    this.color = color;
  }
  /**
   * Returns the console format args for a title with the specified background colour and black text
   * @param color Background colour
   * @param title Text
   * @returns Array. Destructure this into {@link Logger}.errorCustomFmt or console.log
   *
   * @example logger.errorCustomFmt(...Logger.makeTitleElements("white", "Hello"), "World");
   */
  static makeTitle(color, title) {
    return ["%c %c %s ", "", `background: ${color}; color: black; font-weight: bold; border-radius: 5px;`, title];
  }
  _log(level, levelColor, args, customFmt = "") {
    if (IS_REPORTER && IS_WEB) {
      console[level]("[Vencord]", this.name + ":", ...args);
      return;
    }
    console[level](
      `%c Vencord %c %c ${this.name} ${customFmt}`,
      `background: ${levelColor}; color: black; font-weight: bold; border-radius: 5px;`,
      "",
      `background: ${this.color}; color: black; font-weight: bold; border-radius: 5px;`,
      ...args
    );
  }
  log(...args) {
    this._log("log", "#a6d189", args);
  }
  info(...args) {
    this._log("info", "#a6d189", args);
  }
  error(...args) {
    this._log("error", "#e78284", args);
  }
  errorCustomFmt(fmt, ...args) {
    this._log("error", "#e78284", args, fmt);
  }
  warn(...args) {
    this._log("warn", "#e5c890", args);
  }
  debug(...args) {
    this._log("debug", "#eebebe", args);
  }
};

// ../Vencord/src/utils/lazy.ts
function makeLazy(factory, attempts = 5) {
  let tries = 0;
  let cache2;
  return () => {
    if (!cache2 && attempts > tries++) {
      cache2 = factory();
      if (!cache2 && attempts === tries)
        console.error("Lazy factory failed:", factory);
    }
    return cache2;
  };
}
var unconfigurable = ["arguments", "caller", "prototype"];
var handler = {};
var SYM_LAZY_GET = Symbol.for("vencord.lazy.get");
var SYM_LAZY_CACHED = Symbol.for("vencord.lazy.cached");
for (const method of [
  "apply",
  "construct",
  "defineProperty",
  "deleteProperty",
  "getOwnPropertyDescriptor",
  "getPrototypeOf",
  "has",
  "isExtensible",
  "ownKeys",
  "preventExtensions",
  "set",
  "setPrototypeOf"
]) {
  handler[method] = (target, ...args) => Reflect[method](target[SYM_LAZY_GET](), ...args);
}
handler.ownKeys = (target) => {
  const v = target[SYM_LAZY_GET]();
  const keys = Reflect.ownKeys(v);
  for (const key of unconfigurable) {
    if (!keys.includes(key))
      keys.push(key);
  }
  return keys;
};
handler.getOwnPropertyDescriptor = (target, p) => {
  if (typeof p === "string" && unconfigurable.includes(p))
    return Reflect.getOwnPropertyDescriptor(target, p);
  const descriptor = Reflect.getOwnPropertyDescriptor(target[SYM_LAZY_GET](), p);
  if (descriptor)
    Object.defineProperty(target, p, descriptor);
  return descriptor;
};
function proxyLazy(factory, attempts = 5, isChild = false) {
  let isSameTick = true;
  if (!isChild)
    setTimeout(() => isSameTick = false, 0);
  let tries = 0;
  const proxyDummy = Object.assign(function() {
  }, {
    [SYM_LAZY_CACHED]: void 0,
    [SYM_LAZY_GET]() {
      if (!proxyDummy[SYM_LAZY_CACHED] && attempts > tries++) {
        proxyDummy[SYM_LAZY_CACHED] = factory();
        if (!proxyDummy[SYM_LAZY_CACHED] && attempts === tries)
          console.error("Lazy factory failed:", factory);
      }
      return proxyDummy[SYM_LAZY_CACHED];
    }
  });
  return new Proxy(proxyDummy, {
    ...handler,
    get(target, p, receiver) {
      if (p === SYM_LAZY_CACHED || p === SYM_LAZY_GET)
        return Reflect.get(target, p, receiver);
      if (!isChild && isSameTick)
        return proxyLazy(
          () => Reflect.get(target[SYM_LAZY_GET](), p, receiver),
          attempts,
          true
        );
      const lazyTarget = target[SYM_LAZY_GET]();
      if (typeof lazyTarget === "object" || typeof lazyTarget === "function") {
        return Reflect.get(lazyTarget, p, receiver);
      }
      throw new Error("proxyLazy called on a primitive value");
    }
  });
}

// ../Vencord/src/utils/lazyReact.tsx
var NoopComponent = () => null;
function LazyComponent(factory, attempts = 5) {
  const get = makeLazy(factory, attempts);
  const LazyComponent2 = (props) => {
    const Component = get() ?? NoopComponent;
    return /* @__PURE__ */ Vencord.Webpack.Common.React.createElement(Component, { ...props });
  };
  LazyComponent2.$$vencordInternal = get;
  return LazyComponent2;
}

// ../Vencord/src/utils/patches.ts
function canonicalizeMatch(match2) {
  if (typeof match2 === "string")
    return match2;
  const canonSource = match2.source.replaceAll("\\i", "[A-Za-z_$][\\w$]*");
  return new RegExp(canonSource, match2.flags);
}

// ../Vencord/src/debug/Tracer.ts
if (IS_DEV || IS_REPORTER) {
  traces = {};
  logger2 = new Logger("Tracer", "#FFD166");
}
var traces;
var logger2;
var noop = function() {
};
var beginTrace = !(IS_DEV || IS_REPORTER) ? noop : function beginTrace2(name, ...args) {
  if (name in traces)
    throw new Error(`Trace ${name} already exists!`);
  traces[name] = [performance.now(), args];
};
var finishTrace = !(IS_DEV || IS_REPORTER) ? noop : function finishTrace2(name) {
  const end = performance.now();
  const [start, args] = traces[name];
  delete traces[name];
  logger2.debug(`${name} took ${end - start}ms`, args);
};
var noopTracer = (name, f, mapper) => f;
var traceFunction = !(IS_DEV || IS_REPORTER) ? noopTracer : function traceFunction2(name, f, mapper) {
  return function(...args) {
    const traceName = mapper?.(...args) ?? name;
    beginTrace(traceName, ...arguments);
    try {
      return f.apply(this, args);
    } finally {
      finishTrace(traceName);
    }
  };
};

// ../Vencord/src/webpack/webpack.ts
var logger = new Logger("Webpack");
var _resolveReady;
var onceReady = new Promise((r) => _resolveReady = r);
var wreq;
var cache;
var stringMatches = (s, filter) => filter.every(
  (f) => typeof f === "string" ? s.includes(f) : (f.global && (f.lastIndex = 0), f.test(s))
);
var filters = {
  byProps: (...props) => props.length === 1 ? (m) => m[props[0]] !== void 0 : (m) => props.every((p) => m[p] !== void 0),
  byCode: (...code) => {
    code = code.map(canonicalizeMatch);
    return (m) => {
      if (typeof m !== "function")
        return false;
      return stringMatches(Function.prototype.toString.call(m), code);
    };
  },
  byStoreName: (name) => (m) => m.constructor?.displayName === name,
  componentByCode: (...code) => {
    const filter = filters.byCode(...code);
    return (m) => {
      if (filter(m))
        return true;
      if (!m.$$typeof)
        return false;
      if (m.type)
        return m.type.render ? filter(m.type.render) : filter(m.type);
      if (m.render)
        return filter(m.render);
      return false;
    };
  }
};
var subscriptions = /* @__PURE__ */ new Map();
var devToolsOpen = false;
if (IS_DEV && IS_DISCORD_DESKTOP) {
  setTimeout(() => {
    DiscordNative?.window.setDevtoolsCallbacks(() => devToolsOpen = true, () => devToolsOpen = false);
  }, 0);
}
function handleModuleNotFound(method, ...filter) {
  const err = new Error(`webpack.${method} found no module`);
  logger.error(err, "Filter:", filter);
  if (IS_DEV && !devToolsOpen)
    throw err;
}
var find = traceFunction("find", function find2(filter, { isIndirect = false, isWaitFor = false } = {}) {
  if (typeof filter !== "function")
    throw new Error("Invalid filter. Expected a function got " + typeof filter);
  for (const key in cache) {
    const mod = cache[key];
    if (!mod.loaded || !mod?.exports)
      continue;
    if (filter(mod.exports)) {
      return isWaitFor ? [mod.exports, key] : mod.exports;
    }
    if (typeof mod.exports !== "object")
      continue;
    if (mod.exports.default && filter(mod.exports.default)) {
      const found = mod.exports.default;
      return isWaitFor ? [found, key] : found;
    }
    for (const nestedMod in mod.exports)
      if (nestedMod.length <= 3) {
        const nested = mod.exports[nestedMod];
        if (nested && filter(nested)) {
          return isWaitFor ? [nested, key] : nested;
        }
      }
  }
  if (!isIndirect) {
    handleModuleNotFound("find", filter);
  }
  return isWaitFor ? [null, null] : null;
});
var findBulk = traceFunction("findBulk", function findBulk2(...filterFns) {
  if (!Array.isArray(filterFns))
    throw new Error("Invalid filters. Expected function[] got " + typeof filterFns);
  const { length } = filterFns;
  if (length === 0)
    throw new Error("Expected at least two filters.");
  if (length === 1) {
    if (IS_DEV) {
      throw new Error("bulk called with only one filter. Use find");
    }
    return find(filterFns[0]);
  }
  const filters2 = filterFns;
  let found = 0;
  const results = Array(length);
  outer:
    for (const key in cache) {
      const mod = cache[key];
      if (!mod.loaded || !mod?.exports)
        continue;
      for (let j = 0; j < length; j++) {
        const filter = filters2[j];
        if (filter === void 0)
          continue;
        if (filter(mod.exports)) {
          results[j] = mod.exports;
          filters2[j] = void 0;
          if (++found === length)
            break outer;
          break;
        }
        if (typeof mod.exports !== "object")
          continue;
        if (mod.exports.default && filter(mod.exports.default)) {
          results[j] = mod.exports.default;
          filters2[j] = void 0;
          if (++found === length)
            break outer;
          break;
        }
        for (const nestedMod in mod.exports)
          if (nestedMod.length <= 3) {
            const nested = mod.exports[nestedMod];
            if (nested && filter(nested)) {
              results[j] = nested;
              filters2[j] = void 0;
              if (++found === length)
                break outer;
              continue outer;
            }
          }
      }
    }
  if (found !== length) {
    const err = new Error(`Got ${length} filters, but only found ${found} modules!`);
    if (IS_DEV) {
      if (!devToolsOpen)
        throw err;
    } else {
      logger.warn(err);
    }
  }
  return results;
});
var findModuleId = traceFunction("findModuleId", function findModuleId2(...code) {
  code = code.map(canonicalizeMatch);
  for (const id in wreq.m) {
    if (stringMatches(wreq.m[id].toString(), code))
      return id;
  }
  const err = new Error("Didn't find module with code(s):\n" + code.join("\n"));
  if (IS_DEV) {
    if (!devToolsOpen)
      throw err;
  } else {
    logger.warn(err);
  }
  return null;
});
var lazyWebpackSearchHistory = [];
function findLazy(filter) {
  if (IS_REPORTER)
    lazyWebpackSearchHistory.push(["find", [filter]]);
  return proxyLazy(() => find(filter));
}
function findByProps(...props) {
  const res = find(filters.byProps(...props), { isIndirect: true });
  if (!res)
    handleModuleNotFound("findByProps", ...props);
  return res;
}
function findByPropsLazy(...props) {
  if (IS_REPORTER)
    lazyWebpackSearchHistory.push(["findByProps", props]);
  return proxyLazy(() => findByProps(...props));
}
function findByCode(...code) {
  const res = find(filters.byCode(...code), { isIndirect: true });
  if (!res)
    handleModuleNotFound("findByCode", ...code);
  return res;
}
function findByCodeLazy(...code) {
  if (IS_REPORTER)
    lazyWebpackSearchHistory.push(["findByCode", code]);
  return proxyLazy(() => findByCode(...code));
}
var mapMangledModule = traceFunction("mapMangledModule", function mapMangledModule2(code, mappers) {
  const exports = {};
  const id = findModuleId(...Array.isArray(code) ? code : [code]);
  if (id === null)
    return exports;
  const mod = wreq(id);
  outer:
    for (const key in mod) {
      const member = mod[key];
      for (const newName in mappers) {
        if (mappers[newName](member)) {
          exports[newName] = member;
          continue outer;
        }
      }
    }
  return exports;
});
function mapMangledModuleLazy(code, mappers) {
  if (IS_REPORTER)
    lazyWebpackSearchHistory.push(["mapMangledModule", [code, mappers]]);
  return proxyLazy(() => mapMangledModule(code, mappers));
}
function waitFor(filter, callback, { isIndirect = false } = {}) {
  if (IS_REPORTER && !isIndirect)
    lazyWebpackSearchHistory.push(["waitFor", Array.isArray(filter) ? filter : [filter]]);
  if (typeof filter === "string")
    filter = filters.byProps(filter);
  else if (Array.isArray(filter))
    filter = filters.byProps(...filter);
  else if (typeof filter !== "function")
    throw new Error("filter must be a string, string[] or function, got " + typeof filter);
  if (cache != null) {
    const [existing, id] = find(filter, { isIndirect: true, isWaitFor: true });
    if (existing)
      return void callback(existing, id);
  }
  subscriptions.set(filter, callback);
}

// ../Vencord/src/webpack/common/classes.ts
var ModalImageClasses = findLazy((m) => m.image && m.modal && !m.applicationIcon);
var ButtonWrapperClasses = findByPropsLazy("buttonWrapper", "buttonContent");

// ../Vencord/src/utils/misc.ts
var isMobile = navigator.userAgent.includes("Mobi");

// ../Vencord/src/webpack/common/internal.tsx
function waitForComponent(name, filter) {
  if (IS_REPORTER)
    lazyWebpackSearchHistory.push(["waitForComponent", Array.isArray(filter) ? filter : [filter]]);
  let myValue = function() {
    throw new Error(`Vencord could not find the ${name} Component`);
  };
  const lazyComponent = LazyComponent(() => myValue);
  waitFor(filter, (v) => {
    myValue = v;
    Object.assign(lazyComponent, v);
  }, { isIndirect: true });
  return lazyComponent;
}
function waitForStore(name, cb) {
  if (IS_REPORTER)
    lazyWebpackSearchHistory.push(["waitForStore", [name]]);
  waitFor(filters.byStoreName(name), cb, { isIndirect: true });
}

// ../Vencord/src/webpack/common/components.ts
var Forms = {};
var Icons = {};
var Card;
var Button;
var Switch;
var Tooltip;
var TooltipContainer;
var TextInput;
var TextArea;
var Text;
var Heading;
var Select;
var SearchableSelect;
var Slider;
var ButtonLooks;
var Popout;
var Dialog;
var TabBar;
var Paginator;
var ScrollerThin;
var Clickable;
var Avatar;
var FocusLock;
var useToken;
var MaskedLink = waitForComponent("MaskedLink", filters.componentByCode("MASKED_LINK)"));
var Timestamp = waitForComponent("Timestamp", filters.byCode(".Messages.MESSAGE_EDITED_TIMESTAMP_A11Y_LABEL.format"));
var Flex = waitForComponent("Flex", ["Justify", "Align", "Wrap"]);
var { OAuth2AuthorizeModal } = findByPropsLazy("OAuth2AuthorizeModal");
waitFor(["FormItem", "Button"], (m) => {
  ({
    useToken,
    Card,
    Button,
    FormSwitch: Switch,
    Tooltip,
    TooltipContainer,
    TextInput,
    TextArea,
    Text,
    Select,
    SearchableSelect,
    Slider,
    ButtonLooks,
    TabBar,
    Popout,
    Dialog,
    Paginator,
    ScrollerThin,
    Clickable,
    Avatar,
    FocusLock,
    Heading
  } = m);
  Forms = m;
  Icons = m;
});

// ../Vencord/src/webpack/common/menu.ts
var Menu = {};
waitFor(["MenuItem", "MenuSliderControl"], (m) => Menu = m);
var ContextMenuApi = mapMangledModuleLazy('type:"CONTEXT_MENU_OPEN', {
  closeContextMenu: filters.byCode("CONTEXT_MENU_CLOSE"),
  openContextMenu: filters.byCode("renderLazy:"),
  openContextMenuLazy: (e) => typeof e === "function" && e.toString().length < 100
});

// ../Vencord/src/webpack/common/react.ts
var React;
var useState;
var useEffect;
var useMemo;
var useRef;
var useReducer;
var useCallback;
var ReactDOM = findByPropsLazy("createPortal", "render");
waitFor("useState", (m) => {
  React = m;
  ({ useEffect, useState, useMemo, useRef, useReducer, useCallback } = React);
});

// ../Vencord/src/webpack/common/stores.ts
var Flux = findByPropsLazy("connectStores");
var DraftType = findByPropsLazy("ChannelMessage", "SlashCommand");
var MessageStore;
var PrivateChannelsStore = findByPropsLazy("openPrivateChannel");
var PermissionStore;
var GuildChannelStore;
var ReadStateStore;
var PresenceStore;
var GuildStore;
var UserStore;
var UserProfileStore;
var SelectedChannelStore;
var SelectedGuildStore;
var ChannelStore;
var GuildMemberStore;
var RelationshipStore;
var EmojiStore;
var ThemeStore;
var WindowStore;
var DraftStore;
var useStateFromStores = findByCodeLazy("useStateFromStores");
waitForStore("DraftStore", (s) => DraftStore = s);
waitForStore("UserStore", (s) => UserStore = s);
waitForStore("UserProfileStore", (m) => UserProfileStore = m);
waitForStore("ChannelStore", (m) => ChannelStore = m);
waitForStore("SelectedChannelStore", (m) => SelectedChannelStore = m);
waitForStore("SelectedGuildStore", (m) => SelectedGuildStore = m);
waitForStore("GuildStore", (m) => GuildStore = m);
waitForStore("GuildMemberStore", (m) => GuildMemberStore = m);
waitForStore("RelationshipStore", (m) => RelationshipStore = m);
waitForStore("PermissionStore", (m) => PermissionStore = m);
waitForStore("PresenceStore", (m) => PresenceStore = m);
waitForStore("ReadStateStore", (m) => ReadStateStore = m);
waitForStore("GuildChannelStore", (m) => GuildChannelStore = m);
waitForStore("MessageStore", (m) => MessageStore = m);
waitForStore("WindowStore", (m) => WindowStore = m);
waitForStore("EmojiStore", (m) => EmojiStore = m);
waitForStore("ThemeStore", (m) => ThemeStore = m);

// ../Vencord/src/webpack/common/userSettings.ts
var UserSettingsActionCreators = {
  FrecencyUserSettingsActionCreators: findLazy((m) => m.ProtoClass?.typeName?.endsWith(".FrecencyUserSettings")),
  PreloadedUserSettingsActionCreators: findLazy((m) => m.ProtoClass?.typeName?.endsWith(".PreloadedUserSettings"))
};

// ../Vencord/src/webpack/common/utils.ts
var FluxDispatcher;
waitFor(["dispatch", "subscribe"], (m) => {
  FluxDispatcher = m;
  Vencord.Plugins.subscribeAllPluginsFluxEvents(m);
  const cb = () => {
    m.unsubscribe("CONNECTION_OPEN", cb);
    _resolveReady();
  };
  m.subscribe("CONNECTION_OPEN", cb);
});
var ComponentDispatch;
waitFor(["dispatchToLastSubscribed"], (m) => ComponentDispatch = m);
var Constants = mapMangledModuleLazy('ME:"/users/@me"', {
  Endpoints: filters.byProps("USER", "ME"),
  UserFlags: filters.byProps("STAFF", "SPAMMER"),
  FriendsSections: (m) => m.PENDING === "PENDING" && m.ADD_FRIEND
});
var RestAPI = findLazy((m) => typeof m === "object" && m.del && m.put);
var moment = findByPropsLazy("parseTwoDigitYear");
var hljs = findByPropsLazy("highlight", "registerLanguage");
var { match, P } = mapMangledModuleLazy("@ts-pattern/matcher", {
  match: filters.byCode("return new"),
  P: filters.byProps("when")
});
var lodash = findByPropsLazy("debounce", "cloneDeep");
var i18n = findLazy((m) => m.Messages?.["en-US"]);
var SnowflakeUtils;
waitFor(["fromTimestamp", "extractTimestamp"], (m) => SnowflakeUtils = m);
var Parser;
waitFor("parseTopic", (m) => Parser = m);
var Alerts;
waitFor(["show", "close"], (m) => Alerts = m);
var ToastType = {
  MESSAGE: 0,
  SUCCESS: 1,
  FAILURE: 2,
  CUSTOM: 3
};
var ToastPosition = {
  TOP: 0,
  BOTTOM: 1
};
var Toasts = {
  Type: ToastType,
  Position: ToastPosition,
  // what's less likely than getting 0 from Math.random()? Getting it twice in a row
  genId: () => (Math.random() || Math.random()).toString(36).slice(2),
  // hack to merge with the following interface, dunno if there's a better way
  ...{}
};
waitFor("showToast", (m) => {
  Toasts.show = m.showToast;
  Toasts.pop = m.popToast;
  Toasts.create = m.createToast;
});
var UserUtils = {
  getUser: findByCodeLazy(".USER(")
};
var UploadManager = findByPropsLazy("clearAll", "addFile");
var UploadHandler = {
  promptToUpload: findByCodeLazy(".ATTACHMENT_TOO_MANY_ERROR_TITLE,")
};
var ApplicationAssetUtils = findByPropsLazy("fetchAssetIds", "getAssetImage");
var Clipboard = mapMangledModuleLazy('queryCommandEnabled("copy")', {
  copy: filters.byCode(".copy("),
  SUPPORTS_COPY: (e) => typeof e === "boolean"
});
var NavigationRouter = mapMangledModuleLazy("Transitioning to ", {
  transitionTo: filters.byCode("transitionTo -"),
  transitionToGuild: filters.byCode("transitionToGuild -"),
  back: filters.byCode("goBack()"),
  forward: filters.byCode("goForward()")
});
var ChannelRouter = mapMangledModuleLazy('"Thread must have a parent ID."', {
  transitionToChannel: filters.byCode(".preload"),
  transitionToThread: filters.byCode('"Thread must have a parent ID."')
});
var SettingsRouter;
waitFor(["open", "saveAccountChanges"], (m) => SettingsRouter = m);
var PermissionsBits = findLazy((m) => typeof m.ADMINISTRATOR === "bigint");
var zustandCreate = findByCodeLazy("will be removed in v4");
var zustandPersist = findByCodeLazy("[zustand persist middleware]");
var MessageActions = findByPropsLazy("editMessage", "sendMessage");
var MessageCache = findByPropsLazy("clearCache", "_channelMessages");
var UserProfileActions = findByPropsLazy("openUserProfileModal", "closeUserProfileModal");
var InviteActions = findByPropsLazy("resolveInvite");
var IconUtils = findByPropsLazy("getGuildBannerURL", "getUserAvatarURL");
var ExpressionPickerStore = mapMangledModuleLazy("expression-picker-last-active-view", {
  openExpressionPicker: filters.byCode(/setState\({activeView:(?:(?!null)\i),activeViewType:/),
  closeExpressionPicker: filters.byCode("setState({activeView:null"),
  toggleMultiExpressionPicker: filters.byCode(".EMOJI,"),
  toggleExpressionPicker: filters.byCode(/getState\(\)\.activeView===\i\?\i\(\):\i\(/),
  setExpressionPickerView: filters.byCode(/setState\({activeView:\i,lastActiveView:/),
  setSearchQuery: filters.byCode("searchQuery:"),
  useExpressionPickerStore: filters.byCode("Object.is")
});
var PopoutActions = mapMangledModuleLazy('type:"POPOUT_WINDOW_OPEN"', {
  open: filters.byCode('type:"POPOUT_WINDOW_OPEN"'),
  close: filters.byCode('type:"POPOUT_WINDOW_CLOSE"'),
  setAlwaysOnTop: filters.byCode('type:"POPOUT_WINDOW_SET_ALWAYS_ON_TOP"')
});
var UsernameUtils = findByPropsLazy("useName", "getGlobalName");
var DisplayProfileUtils = mapMangledModuleLazy(/=\i\.getUserProfile\(\i\),\i=\i\.getGuildMemberProfile\(/, {
  getDisplayProfile: filters.byCode(".getGuildMemberProfile("),
  useDisplayProfile: filters.byCode(/\[\i\.\i,\i\.\i],\(\)=>/)
});

// ../Vencord/src/api/ContextMenu.ts
var ContextMenuLogger = new Logger("ContextMenu");
var globalPatches = /* @__PURE__ */ new Set();
function addGlobalContextMenuPatch(patch) {
  globalPatches.add(patch);
}

// src/index.ts
var patchContextMenu = (navId, children) => () => {
  console.log(navId);
};
var src_default = definePlugin({
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
//# sourceMappingURL=index.ts.map
