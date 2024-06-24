var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/emit-keypress.ts
import { StringDecoder } from "node:string_decoder";
import { clearTimeout as clearTimeout2, setTimeout as setTimeout2 } from "node:timers";

// src/emit-keys.ts
var kEscape = "\x1B";
var kSubstringSearch = Symbol("kSubstringSearch");
var kUTF16SurrogateThreshold = 65536;
function CSI(strings, ...args) {
  let ret = `${kEscape}[`;
  for (let n = 0; n < strings.length; n++) {
    ret += strings[n];
    if (n < args.length) {
      ret += args[n];
    }
  }
  return ret;
}
__name(CSI, "CSI");
CSI.kEscape = kEscape;
CSI.kClearToLineBeginning = CSI`1K`;
CSI.kClearToLineEnd = CSI`0K`;
CSI.kClearLine = CSI`2K`;
CSI.kClearScreenDown = CSI`0J`;
function charLengthAt(str, i) {
  if (str.length <= i) {
    return 1;
  }
  return str.codePointAt(i) >= kUTF16SurrogateThreshold ? 2 : 1;
}
__name(charLengthAt, "charLengthAt");
function* emitKeys(stream) {
  while (true) {
    let ch = yield;
    let s = ch;
    let escaped = false;
    const key = {
      sequence: null,
      name: void 0,
      ctrl: false,
      meta: false,
      shift: false,
      fn: false
    };
    if (ch === kEscape) {
      escaped = true;
      s += ch = yield;
      if (ch === kEscape) {
        s += ch = yield;
      }
    }
    if (escaped && (ch === "O" || ch === "[")) {
      let code = ch;
      let modifier = 0;
      if (ch === "O") {
        s += ch = yield;
        if (ch >= "0" && ch <= "9") {
          modifier = (ch >> 0) - 1;
          s += ch = yield;
        }
        code += ch;
      } else if (ch === "[") {
        s += ch = yield;
        if (ch === "[") {
          code += ch;
          s += ch = yield;
        }
        const cmdStart = s.length - 1;
        if (ch >= "0" && ch <= "9") {
          s += ch = yield;
          if (ch >= "0" && ch <= "9") {
            s += ch = yield;
            if (ch >= "0" && ch <= "9") {
              s += ch = yield;
            }
          }
        }
        if (ch === ";") {
          s += ch = yield;
          if (ch >= "0" && ch <= "9") {
            s += yield;
          }
        }
        const cmd = s.slice(cmdStart);
        let match;
        if (match = /^(?:(\d\d?)(?:;(\d))?([~^$])|(\d{3}~))$/.exec(cmd)) {
          if (match[4]) {
            code += match[4];
          } else {
            code += match[1] + match[3];
            modifier = (match[2] || 1) - 1;
          }
        } else if (match = /^((\d;)?(\d))?([A-Za-z])$/.exec(cmd)) {
          code += match[4];
          modifier = (match[3] || 1) - 1;
        } else {
          code += cmd;
        }
      }
      key.ctrl = Boolean(modifier & 4);
      key.meta = Boolean(modifier & 10);
      key.shift = Boolean(modifier & 1);
      key.code = code;
      if (!key.meta) {
        const parts = [...s];
        if (parts[0] === "\x1B" && parts[1] === "\x1B") {
          key.meta = true;
        }
      }
      switch (code) {
        case "[P":
          key.name = "f1";
          key.fn = true;
          break;
        case "[Q":
          key.name = "f2";
          key.fn = true;
          break;
        case "[R":
          key.name = "f3";
          key.fn = true;
          break;
        case "[S":
          key.name = "f4";
          key.fn = true;
          break;
        case "OP":
          key.name = "f1";
          key.fn = true;
          break;
        case "OQ":
          key.name = "f2";
          key.fn = true;
          break;
        case "OR":
          key.name = "f3";
          key.fn = true;
          break;
        case "OS":
          key.name = "f4";
          key.fn = true;
          break;
        case "[11~":
          key.name = "f1";
          key.fn = true;
          break;
        case "[12~":
          key.name = "f2";
          key.fn = true;
          break;
        case "[13~":
          key.name = "f3";
          key.fn = true;
          break;
        case "[14~":
          key.name = "f4";
          key.fn = true;
          break;
        case "[200~":
          key.name = "paste-start";
          break;
        case "[201~":
          key.name = "paste-end";
          break;
        case "[[A":
          key.name = "f1";
          key.fn = true;
          break;
        case "[[B":
          key.name = "f2";
          key.fn = true;
          break;
        case "[[C":
          key.name = "f3";
          key.fn = true;
          break;
        case "[[D":
          key.name = "f4";
          key.fn = true;
          break;
        case "[[E":
          key.name = "f5";
          key.fn = true;
          break;
        case "[15~":
          key.name = "f5";
          key.fn = true;
          break;
        case "[17~":
          key.name = "f6";
          key.fn = true;
          break;
        case "[18~":
          key.name = "f7";
          key.fn = true;
          break;
        case "[19~":
          key.name = "f8";
          key.fn = true;
          break;
        case "[20~":
          key.name = "f9";
          key.fn = true;
          break;
        case "[21~":
          key.name = "f10";
          key.fn = true;
          break;
        case "[23~":
          key.name = "f11";
          key.fn = true;
          break;
        case "[24~":
          key.name = "f12";
          key.fn = true;
          break;
        case "[A":
          key.name = "up";
          break;
        case "[B":
          key.name = "down";
          break;
        case "[C":
          key.name = "right";
          break;
        case "[D":
          key.name = "left";
          break;
        case "[E":
          key.name = "clear";
          break;
        case "[F":
          key.name = "end";
          break;
        case "[H":
          key.name = "home";
          break;
        case "OA":
          key.name = "up";
          break;
        case "OB":
          key.name = "down";
          break;
        case "OC":
          key.name = "right";
          break;
        case "OD":
          key.name = "left";
          break;
        case "OE":
          key.name = "clear";
          break;
        case "OF":
          key.name = "end";
          break;
        case "OH":
          key.name = "home";
          break;
        case "[1~":
          key.name = "home";
          break;
        case "[2~":
          key.name = "insert";
          break;
        case "[3~":
          key.name = "delete";
          break;
        case "[4~":
          key.name = "end";
          break;
        case "[5~":
          key.name = "pageup";
          break;
        case "[6~":
          key.name = "pagedown";
          break;
        case "[[5~":
          key.name = "pageup";
          break;
        case "[[6~":
          key.name = "pagedown";
          break;
        case "[7~":
          key.name = "home";
          break;
        case "[8~":
          key.name = "end";
          break;
        case "[a":
          key.name = "up";
          key.shift = true;
          break;
        case "[b":
          key.name = "down";
          key.shift = true;
          break;
        case "[c":
          key.name = "right";
          key.shift = true;
          break;
        case "[d":
          key.name = "left";
          key.shift = true;
          break;
        case "[e":
          key.name = "clear";
          key.shift = true;
          break;
        case "[2$":
          key.name = "insert";
          key.shift = true;
          break;
        case "[3$":
          key.name = "delete";
          key.shift = true;
          break;
        case "[5$":
          key.name = "pageup";
          key.shift = true;
          break;
        case "[6$":
          key.name = "pagedown";
          key.shift = true;
          break;
        case "[7$":
          key.name = "home";
          key.shift = true;
          break;
        case "[8$":
          key.name = "end";
          key.shift = true;
          break;
        case "Oa":
          key.name = "up";
          key.ctrl = true;
          break;
        case "Ob":
          key.name = "down";
          key.ctrl = true;
          break;
        case "Oc":
          key.name = "right";
          key.ctrl = true;
          break;
        case "Od":
          key.name = "left";
          key.ctrl = true;
          break;
        case "Oe":
          key.name = "clear";
          key.ctrl = true;
          break;
        case "[2^":
          key.name = "insert";
          key.ctrl = true;
          break;
        case "[3^":
          key.name = "delete";
          key.ctrl = true;
          break;
        case "[5^":
          key.name = "pageup";
          key.ctrl = true;
          break;
        case "[6^":
          key.name = "pagedown";
          key.ctrl = true;
          break;
        case "[7^":
          key.name = "home";
          key.ctrl = true;
          break;
        case "[8^":
          key.name = "end";
          key.ctrl = true;
          break;
        case "[1;10":
          key.meta = true;
          break;
        case "[Z":
          key.name = "tab";
          key.shift = true;
          break;
        default:
          key.name = "undefined";
          break;
      }
    } else if (ch === "\r") {
      key.name = "return";
      key.meta = escaped;
    } else if (ch === "\n") {
      key.name = "enter";
      key.meta = escaped;
    } else if (ch === "	") {
      key.name = "tab";
      key.meta = escaped;
    } else if (ch === "\b" || ch === "\x7F") {
      key.name = "backspace";
      key.meta = escaped;
    } else if (ch === kEscape) {
      key.name = "escape";
      key.meta = escaped;
    } else if (ch === " ") {
      key.name = "space";
      key.meta = escaped;
    } else if (!escaped && ch <= "") {
      key.name = String.fromCharCode(ch.charCodeAt(0) + "a".charCodeAt(0) - 1);
      key.ctrl = true;
    } else if (/^[0-9A-Za-z]$/.exec(ch) !== null) {
      key.name = ch.toLowerCase();
      key.shift = /^[A-Z]$/.exec(ch) !== null;
      key.meta = escaped;
    } else if (escaped) {
      key.name = ch.length ? void 0 : "escape";
      key.meta = false;
    }
    key.sequence = s;
    if (s.length !== 0 && (key.name !== void 0 || escaped)) {
      stream.emit("keypress", escaped ? void 0 : s, key);
    } else if (charLengthAt(s, 0) === s.length) {
      stream.emit("keypress", s, key);
    }
  }
}
__name(emitKeys, "emitKeys");

// src/emit-keypress.ts
var { kEscape: kEscape2 } = CSI;
var KEYPRESS_DECODER = Symbol("keypress-decoder");
var ESCAPE_DECODER = Symbol("escape-decoder");
var kSawKeyPress = Symbol("saw-key-press");
var ESCAPE_CODE_TIMEOUT = 500;
function emitKeypressEvents(stream, iface = {}) {
  if (stream[KEYPRESS_DECODER]) return;
  stream[KEYPRESS_DECODER] = new StringDecoder("utf8");
  stream[ESCAPE_DECODER] = emitKeys(stream);
  stream[ESCAPE_DECODER].next();
  const triggerEscape = /* @__PURE__ */ __name(() => stream[ESCAPE_DECODER].next(""), "triggerEscape");
  const { escapeCodeTimeout = ESCAPE_CODE_TIMEOUT } = iface;
  let timeoutId;
  function onData(input) {
    if (stream.listenerCount("keypress") > 0) {
      const string = stream[KEYPRESS_DECODER].write(input);
      if (string) {
        clearTimeout2(timeoutId);
        iface[kSawKeyPress] = charLengthAt(string, 0) === string.length;
        iface.isCompletionEnabled = false;
        let length = 0;
        for (const character of string) {
          length += character.length;
          if (length === string.length) {
            iface.isCompletionEnabled = true;
          }
          try {
            stream[ESCAPE_DECODER].next(character);
            if (length === string.length && character === kEscape2) {
              timeoutId = setTimeout2(triggerEscape, escapeCodeTimeout);
            }
          } catch (err) {
            stream[ESCAPE_DECODER] = emitKeys(stream);
            stream[ESCAPE_DECODER].next();
            throw err;
          }
        }
      }
    } else {
      stream.removeListener("data", onData);
      stream.on("newListener", onNewListener);
    }
  }
  __name(onData, "onData");
  function onNewListener(event) {
    if (event === "keypress") {
      stream.on("data", onData);
      stream.removeListener("newListener", onNewListener);
    }
  }
  __name(onNewListener, "onNewListener");
  if (stream.listenerCount("keypress") > 0) {
    stream.on("data", onData);
  } else {
    stream.on("newListener", onNewListener);
  }
}
__name(emitKeypressEvents, "emitKeypressEvents");

// src/utils.ts
var PRINTABLE_CHAR_REGEX = /^[\p{L}\p{N}\p{P}\p{S}\p{Z}\p{Sm}]+$/u;
var NON_PRINTABLE_CHAR_REGEX = /[^\P{Cc}\P{Cf}\p{L}\p{N}\p{P}\p{S}\p{Z}]/u;
var createShortcut = /* @__PURE__ */ __name((key) => {
  const modifiers = [];
  if (key.fn) modifiers.push("fn");
  if (key.ctrl) modifiers.push("ctrl");
  if (key.shift) modifiers.push("shift");
  if (key.meta) modifiers.push("meta");
  let keyName = key.name || (isPrintableCharacter(key.sequence) ? key.sequence : "");
  if (keyName === "undefined") keyName = "";
  return modifiers.length > 0 ? `${modifiers.join("+")}+${keyName}` : keyName;
}, "createShortcut");
var isPrintableCharacter = /* @__PURE__ */ __name((s) => {
  return PRINTABLE_CHAR_REGEX.test(s) && !NON_PRINTABLE_CHAR_REGEX.test(s);
}, "isPrintableCharacter");

// src/keycodes.ts
var keycodes = [
  { sequence: "\r", shortcut: "return" },
  { sequence: "", shortcut: "ctrl+c", ctrl: true },
  { sequence: "", shortcut: "ctrl+4", ctrl: true },
  { sequence: "", shortcut: "ctrl+5", ctrl: true },
  { sequence: "", shortcut: "ctrl+6", ctrl: true },
  { sequence: "", shortcut: "ctrl+7", ctrl: true },
  { sequence: "\x1B[1;10A", shortcut: "shift+meta+up", code: "[1;10A", name: "up", meta: true, shift: true },
  { sequence: "\x1B[1;10B", shortcut: "shift+meta+down", code: "[1;10B", name: "down", meta: true, shift: true },
  { sequence: "\x1B[1;10C", shortcut: "shift+meta+right", code: "[1;10C", name: "left", meta: true, shift: true },
  { sequence: "\x1B[1;10D", shortcut: "shift+meta+left", code: "[1;10D", name: "right", meta: true, shift: true },
  { sequence: "\x1B[1;2A", shortcut: "shift+up", code: "[1;2A", shift: true },
  { sequence: "\x1B[1;2B", shortcut: "shift+down", code: "[1;2B", shift: true },
  { sequence: "\x1B[1;2C", shortcut: "shift+right", code: "[1;2C", shift: true },
  { sequence: "\x1B[1;2D", shortcut: "shift+left", code: "[1;2D", shift: true },
  { sequence: "\x1B[1;2F", shortcut: "fn+shift+right", code: "[1;2F", fn: true, shift: true },
  { sequence: "\x1B[1;2H", shortcut: "fn+shift+left", code: "[1;2H", fn: true, shift: true },
  { sequence: "\x1B[1;9F", shortcut: "fn+meta+right", code: "[1;9F", fn: true, meta: true },
  { sequence: "\x1B[1;9H", shortcut: "fn+meta+left", code: "[1;9H", fn: true, meta: true },
  { sequence: "\x1B[1;10F", shortcut: "fn+shift+meta+right", code: "[1;10F", name: "right", fn: true, meta: true, shift: true },
  { sequence: "\x1B[1;10H", shortcut: "fn+shift+meta+left", code: "[1;10H", name: "left", fn: true, meta: true, shift: true },
  { sequence: "\x1B[11~", shortcut: "f1", fn: true },
  { sequence: "\x1B[12~", shortcut: "f2", fn: true },
  { sequence: "\x1B[13~", shortcut: "f3", fn: true },
  { sequence: "\x1B[14~", shortcut: "f4", fn: true },
  { sequence: "\x1B[15~", shortcut: "f5", fn: true },
  { sequence: "\x1B[17~", shortcut: "f6", fn: true },
  { sequence: "\x1B[18~", shortcut: "f7", fn: true },
  { sequence: "\x1B[19~", shortcut: "f8", fn: true },
  { sequence: "\x1B[20~", shortcut: "f9", fn: true },
  { sequence: "\x1B[21~", shortcut: "f10", fn: true },
  { sequence: "\x1B[23~", shortcut: "f11", fn: true },
  { sequence: "\x1B[24~", shortcut: "f12", fn: true },
  { sequence: "\x1B[25~", shortcut: "f13", fn: true },
  { sequence: "\x1B[26~", shortcut: "f14", fn: true },
  { sequence: "\x1B[28~", shortcut: "f15", fn: true },
  { sequence: "\x1B[29~", shortcut: "f16", fn: true },
  { sequence: "\x1B[31~", shortcut: "f17", fn: true },
  { sequence: "\x1B[32~", shortcut: "f18", fn: true },
  { sequence: "\x1B[33~", shortcut: "f19", fn: true },
  { sequence: "\x1B[34~", shortcut: "f20", fn: true },
  { sequence: "\x1BOP", shortcut: "f1", fn: true },
  { sequence: "\x1BOQ", shortcut: "f2", fn: true },
  { sequence: "\x1BOR", shortcut: "f3", fn: true },
  { sequence: "\x1BOS", shortcut: "f4", fn: true },
  { sequence: "\x1B\x1B[5~", shortcut: "fn+meta+up", code: "[5~", meta: true, fn: true },
  { sequence: "\x1B\x1B[6~", shortcut: "fn+meta+down", code: "[6~", meta: true, fn: true },
  { sequence: "\x1BOl", shortcut: "num_key_comma" },
  { sequence: "\x1BOm", shortcut: "num_key_minus" },
  { sequence: "\x1BOn", shortcut: "num_key_period" },
  { sequence: "\x1BOp", shortcut: "num_key_0" },
  { sequence: "\x1BOq", shortcut: "num_key_1" },
  { sequence: "\x1BOr", shortcut: "num_key_2" },
  { sequence: "\x1BOs", shortcut: "num_key_3" },
  { sequence: "\x1BOt", shortcut: "num_key_4" },
  { sequence: "\x1BOu", shortcut: "num_key_5" },
  { sequence: "\x1BOv", shortcut: "num_key_6" },
  { sequence: "\x1BOw", shortcut: "num_key_7" },
  { sequence: "\x1BOx", shortcut: "num_key_8" },
  { sequence: "\x1BOy", shortcut: "num_key_9" }
];

// index.ts
var emitKeypress = /* @__PURE__ */ __name(({
  input = process.stdin,
  keymap = [],
  onKeypress,
  bufferTimeout = 3
}) => {
  if (!input || input !== process.stdin && !input.isTTY) {
    throw new Error("Invalid stream passed");
  }
  const isRaw = input.isRaw;
  let keyBuffer = [];
  let timeout = null;
  function emitBufferedKeypress() {
    if (keyBuffer.length > 0) {
      const combinedKey = keyBuffer.reduce((acc, event) => {
        if (acc.name === "undefined") {
          acc.name = "";
        }
        return {
          sequence: acc.sequence + event.key.sequence,
          printable: acc.printable ?? event.key.printable ?? true,
          name: (acc.name || "") + (event.key.name || ""),
          ctrl: acc.ctrl || event.key.ctrl,
          shift: acc.shift || event.key.shift,
          meta: acc.meta || event.key.meta || false,
          fn: acc.fn || event.key.fn,
          shortcut: ""
        };
      }, {
        name: "",
        sequence: "",
        printable: void 0,
        ctrl: false,
        shift: false,
        meta: false,
        fn: false,
        shortcut: ""
      });
      let addShortcut = true;
      for (const ele of keymap) {
        if (combinedKey.sequence === ele.sequence) {
          Object.assign(combinedKey, ele);
          addShortcut = false;
          break;
        }
      }
      if (/f[0-9]/.test(combinedKey.name)) {
        combinedKey.shortcut = combinedKey.name;
        addShortcut = false;
      }
      if (addShortcut) {
        combinedKey.shortcut ||= createShortcut(combinedKey);
      }
      combinedKey.printable = isPrintableCharacter(combinedKey.sequence);
      keyBuffer = [];
      return onKeypress(combinedKey.sequence, combinedKey, close);
    }
  }
  __name(emitBufferedKeypress, "emitBufferedKeypress");
  function handleKeypress(input2, key) {
    keyBuffer.push({ input: input2, key });
    clearTimeout(timeout);
    timeout = setTimeout(emitBufferedKeypress, bufferTimeout);
  }
  __name(handleKeypress, "handleKeypress");
  emitKeypressEvents(input);
  function close() {
    if (input.isTTY) input.setRawMode(isRaw);
    input.off("keypress", handleKeypress);
    input.pause();
  }
  __name(close, "close");
  if (input.isTTY) input.setRawMode(true);
  input.setEncoding("utf8");
  input.on("keypress", handleKeypress);
  input.resume();
  return close;
}, "emitKeypress");
var emit_keypress_default = emitKeypress;
export {
  createShortcut,
  emit_keypress_default as default,
  emitKeypress,
  emitKeypressEvents,
  keycodes
};
//# sourceMappingURL=index.mjs.map