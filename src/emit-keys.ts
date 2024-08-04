/* eslint-disable no-control-regex */
// This file is a modified version of the original file from the readline module of Node.js
// Copyright Joyent, Inc. and other Node contributors.
// SPDX-License-Identifier: MIT
export const kEscape = '\x1b';
export const kSubstringSearch = Symbol('kSubstringSearch');
export const kUTF16SurrogateThreshold = 0x10000; // 2 ** 16

export function CSI(strings, ...args) {
  let ret = `${kEscape}[`;
  for (let n = 0; n < strings.length; n++) {
    ret += strings[n];
    if (n < args.length) { ret += args[n]; }
  }
  return ret;
}

CSI.kEscape = kEscape;
CSI.kClearToLineBeginning = CSI`1K`;
CSI.kClearToLineEnd = CSI`0K`;
CSI.kClearLine = CSI`2K`;
CSI.kClearScreenDown = CSI`0J`;

// TODO(BridgeAR): Treat combined characters as single character, i.e,
// 'a\u0301' and '\u0301a' (both have the same visual output).
// Check Canonical_Combining_Class in
// http://userguide.icu-project.org/strings/properties
export function charLengthLeft(str, i) {
  if (i <= 0) { return 0; }
  if ((i > 1 &&
      str.codePointAt(i - 2) >= kUTF16SurrogateThreshold) ||
      str.codePointAt(i - 1) >= kUTF16SurrogateThreshold) {
    return 2;
  }
  return 1;
}

export function charLengthAt(str, i) {
  if (str.length <= i) {
    // Pretend to move to the right. This is necessary to autocomplete while
    // moving to the right.
    return 1;
  }
  return str.codePointAt(i) >= kUTF16SurrogateThreshold ? 2 : 1;
}

/*
  Some patterns seen in terminal key escape codes, derived from combos seen
  at http://www.midnight-commander.org/browser/lib/tty/key.c

  ESC letter
  ESC [ letter
  ESC [ modifier letter
  ESC [ 1 ; modifier letter
  ESC [ num char
  ESC [ num ; modifier char
  ESC O letter
  ESC O modifier letter
  ESC O 1 ; modifier letter
  ESC N letter
  ESC [ [ num ; modifier char
  ESC [ [ 1 ; modifier letter
  ESC ESC [ num char
  ESC ESC O letter

  - char is usually ~ but $ and ^ also happen with rxvt
  - modifier is 1 +
                (shift     * 1) +
                (left_alt  * 2) +
                (ctrl      * 4) +
                (right_alt * 8)
  - two leading ESCs apparently mean the same as one leading ESC
*/

// eslint-disable-next-line complexity
export function * emitKeys(stream) {
  while (true) {
    let ch = yield;
    let s = ch;
    let escaped = false;

    const key = {
      sequence: null,
      name: undefined,
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

    if (escaped && (ch === 'O' || ch === '[')) {
      // ANSI escape sequence
      let code = ch;
      let modifier = 0;

      if (ch === 'O') {
        // ESC O letter
        // ESC O modifier letter
        s += ch = yield;

        if (ch >= '0' && ch <= '9') {
          modifier = (ch >> 0) - 1;
          s += ch = yield;
        }

        code += ch;
      } else if (ch === '[') {
        // ESC [ letter
        // ESC [ modifier letter
        // ESC [ [ modifier letter
        // ESC [ [ num char
        s += ch = yield;

        if (ch === '[') {
          // \x1b[[A
          //      ^--- escape codes might have a second bracket
          code += ch;
          s += ch = yield;
        }

        /*
         * Here and later we try to buffer just enough data to get
         * a complete ascii sequence.
         *
         * We have basically two classes of ascii characters to process:
         *
         *
         * 1. `\x1b[24;5~` should be parsed as { code: '[24~', modifier: 5 }
         *
         * This particular example is featuring Ctrl+F12 in xterm.
         *
         *  - `;5` part is optional, e.g. it could be `\x1b[24~`
         *  - first part can contain one or two digits
         *  - there is also special case when there can be 3 digits
         *    but without modifier. They are the case of paste bracket mode
         *
         * So the generic regexp is like /^(?:\d\d?(;\d)?[~^$]|\d{3}~)$/
         *
         *
         * 2. `\x1b[1;5H` should be parsed as { code: '[H', modifier: 5 }
         *
         * This particular example is featuring Ctrl+Home in xterm.
         *
         *  - `1;5` part is optional, e.g. it could be `\x1b[H`
         *  - `1;` part is optional, e.g. it could be `\x1b[5H`
         *
         * So the generic regexp is like /^((\d;)?\d)?[A-Za-z]$/
         *
         */
        const cmdStart = s.length - 1;

        // Skip one or two leading digits
        if (ch >= '0' && ch <= '9') {
          s += ch = yield;

          if (ch >= '0' && ch <= '9') {
            s += ch = yield;

            if (ch >= '0' && ch <= '9') {
              s += ch = yield;
            }
          }
        }

        // skip modifier
        if (ch === ';') {
          s += ch = yield;

          if (ch >= '0' && ch <= '9') {
            s += yield;
          }
        }

        /*
         * We buffered enough data, now trying to extract code
         * and modifier from it
         */
        const cmd = s.slice(cmdStart);
        let match;

        if ((match = /^(?:(\d\d?)(?:;(\d))?([~^$])|(\d{3}~))$/.exec(cmd))) {
          if (match[4]) {
            code += match[4];
          } else {
            code += match[1] + match[3];
            modifier = (match[2] || 1) - 1;
          }
        } else if ((match = /^((\d;)?(\d))?([A-Za-z])$/.exec(cmd))) {
          code += match[4];
          modifier = (match[3] || 1) - 1;
        } else {
          code += cmd;
        }
      }

      // Parse the key modifier
      key.ctrl = Boolean(modifier & 4);
      key.meta = Boolean(modifier & 10);
      key.shift = Boolean(modifier & 1);
      key.code = code;

      if (!key.meta) {
        const parts = [...s];

        if (parts[0] === '\u001b' && parts[1] === '\u001b') {
          key.meta = true;
        }
      }

      // Parse the key itself
      switch (code) {
        /* xterm/gnome ESC [ letter (with modifier) */
        case '[P': key.name = 'f1'; key.fn = true; break;
        case '[Q': key.name = 'f2'; key.fn = true; break;
        case '[R': key.name = 'f3'; key.fn = true; break;
        case '[S': key.name = 'f4'; key.fn = true; break;

        /* xterm/gnome ESC O letter (without modifier) */
        case 'OP': key.name = 'f1'; key.fn = true; break;
        case 'OQ': key.name = 'f2'; key.fn = true; break;
        case 'OR': key.name = 'f3'; key.fn = true; break;
        case 'OS': key.name = 'f4'; key.fn = true; break;

        /* xterm/rxvt ESC [ number ~ */
        case '[11~': key.name = 'f1'; key.fn = true; break;
        case '[12~': key.name = 'f2'; key.fn = true; break;
        case '[13~': key.name = 'f3'; key.fn = true; break;
        case '[14~': key.name = 'f4'; key.fn = true; break;

        /* paste bracket mode */
        case '[200~': key.name = 'paste-start'; break;
        case '[201~': key.name = 'paste-end'; break;

        /* from Cygwin and used in libuv */
        case '[[A': key.name = 'f1'; key.fn = true; break;
        case '[[B': key.name = 'f2'; key.fn = true; break;
        case '[[C': key.name = 'f3'; key.fn = true; break;
        case '[[D': key.name = 'f4'; key.fn = true; break;
        case '[[E': key.name = 'f5'; key.fn = true; break;

        /* common */
        case '[15~': key.name = 'f5'; key.fn = true; break;
        case '[17~': key.name = 'f6'; key.fn = true; break;
        case '[18~': key.name = 'f7'; key.fn = true; break;
        case '[19~': key.name = 'f8'; key.fn = true; break;
        case '[20~': key.name = 'f9'; key.fn = true; break;
        case '[21~': key.name = 'f10'; key.fn = true; break;
        case '[23~': key.name = 'f11'; key.fn = true; break;
        case '[24~': key.name = 'f12'; key.fn = true; break;

        /* xterm ESC [ letter */
        case '[A': key.name = 'up'; break;
        case '[B': key.name = 'down'; break;
        case '[C': key.name = 'right'; break;
        case '[D': key.name = 'left'; break;
        case '[E': key.name = 'clear'; break;
        case '[F': key.name = 'end'; break;
        case '[H': key.name = 'home'; break;

        /* xterm/gnome ESC O letter */
        case 'OA': key.name = 'up'; break;
        case 'OB': key.name = 'down'; break;
        case 'OC': key.name = 'right'; break;
        case 'OD': key.name = 'left'; break;
        case 'OE': key.name = 'clear'; break;
        case 'OF': key.name = 'end'; break;
        case 'OH': key.name = 'home'; break;

        /* xterm/rxvt ESC [ number ~ */
        case '[1~': key.name = 'home'; break;
        case '[2~': key.name = 'insert'; break;
        case '[3~':
          key.name = 'delete';
          console.log([s.slice(1), key, code]);

          key.shift = !s.includes('3;5~');
          key.fn = /^\[3;[256]~$/.test(s.slice(1));
          break;

        case '[4~': key.name = 'end'; break;
        case '[5~': key.name = 'pageup'; break;
        case '[6~': key.name = 'pagedown'; break;

        /* putty */
        case '[[5~': key.name = 'pageup'; break;
        case '[[6~': key.name = 'pagedown'; break;

        /* rxvt */
        case '[7~': key.name = 'home'; break;
        case '[8~': key.name = 'end'; break;

        /* rxvt keys with modifiers */
        case '[a': key.name = 'up'; key.shift = true; break;
        case '[b': key.name = 'down'; key.shift = true; break;
        case '[c': key.name = 'right'; key.shift = true; break;
        case '[d': key.name = 'left'; key.shift = true; break;
        case '[e': key.name = 'clear'; key.shift = true; break;

        case '[2$': key.name = 'insert'; key.shift = true; break;
        case '[3$': key.name = 'delete'; key.shift = true; break;
        case '[5$': key.name = 'pageup'; key.shift = true; break;
        case '[6$': key.name = 'pagedown'; key.shift = true; break;
        case '[7$': key.name = 'home'; key.shift = true; break;
        case '[8$': key.name = 'end'; key.shift = true; break;

        case 'Oa': key.name = 'up'; key.ctrl = true; break;
        case 'Ob': key.name = 'down'; key.ctrl = true; break;
        case 'Oc': key.name = 'right'; key.ctrl = true; break;
        case 'Od': key.name = 'left'; key.ctrl = true; break;
        case 'Oe': key.name = 'clear'; key.ctrl = true; break;

        case '[2^': key.name = 'insert'; key.ctrl = true; break;
        case '[3^': key.name = 'delete'; key.ctrl = true; break;
        case '[5^': key.name = 'pageup'; key.ctrl = true; break;
        case '[6^': key.name = 'pagedown'; key.ctrl = true; break;
        case '[7^': key.name = 'home'; key.ctrl = true; break;
        case '[8^': key.name = 'end'; key.ctrl = true; break;

        case '[3;5~':
          key.name = 'delete';
          key.ctrl = true;
          key.fn = true;
          break;

        case '[1;13':
        case '[1;14':
          if ((ch = yield)) {
            s += ch;
            key.name = ch === 'H' ? 'left' : 'right';
            key.ctrl = true;
            key.shift = code === '[1;14';
            key.meta = true;
            key.fn = true;
          }
          break;

        case '[3;10':
          if ((ch = yield)) {
            s += ch;
            key.name = 'delete';
            key.shift = true;
            key.meta = true;
            key.fn = true;
          }
          break;

        case '[3;13':
        case '[3;14':
          if ((ch = yield)) {
            s += ch;
            key.name = 'delete';
            key.ctrl = true;
            key.shift = code === '[3;14';
            key.meta = true;
            key.fn = true;
          }
          break;

        case '[5;14':
        case '[6;14':
          if ((ch = yield)) {
            s += ch;
            key.name = code === '[5;14' ? 'up' : 'down';
            key.ctrl = true;
            key.shift = true;
            key.meta = true;
            key.fn = true;
          }
          break;

        case '[1;10':
          if ((ch = yield)) {
            s += ch;
          }

          switch (ch) {
            case 'A': key.name = 'up'; break;
            case 'B': key.name = 'down'; break;
            case 'C': key.name = 'right'; break;
            case 'D': key.name = 'left'; break;
            case 'F': key.name = 'right'; key.fn = true; break;
            case 'H': key.name = 'left'; key.fn = true; break;
            default: break;
          }

          key.shift = true;
          key.meta = true;
          break;

        case '[5;10':
        case '[6;10':
          if ((ch = yield)) {
            s += ch;
            key.name = code === '[5;10' ? 'up' : 'down';
            key.shift = true;
            key.fn = true;
          }

          key.meta = true;
          break;

        /* misc. */
        case '[Z': key.name = 'tab'; key.shift = true; break;
        default: key.name = undefined; break;
      }

    } else if (ch === '\r') {
      // carriage return
      key.name = 'return';
      key.meta = escaped;
    } else if (ch === '\n') {
      // Enter, should have been called linefeed
      key.name = 'enter';
      key.meta = escaped;
    } else if (ch === '\t') {
      // tab
      key.name = 'tab';
      key.meta = escaped;
    } else if (ch === '\b') {
      // ctrl+backspace or ctrl+h
      key.name = 'backspace';
      key.ctrl = true;
      key.meta = escaped;
    } else if (ch === '\x7f') {
      // backspace
      key.name = 'backspace';
      key.meta = escaped;
    } else if (ch === kEscape) {
      // escape key
      key.name = 'escape';
      key.meta = escaped;
    } else if (ch === ' ') {
      key.name = 'space';
      key.meta = escaped;
    } else if (!escaped && ch <= '\x1a') {
      // ctrl+letter
      key.name = String.fromCharCode(ch.charCodeAt(0) + 'a'.charCodeAt(0) - 1);
      key.ctrl = true;
    } else if (/^[0-9A-Za-z]$/.exec(ch) !== null) {
      // Letter, number, shift+letter
      key.name = ch;
      key.shift = /^[A-Z]$/.exec(ch) !== null;
      key.meta = escaped;
    } else if (escaped) {
      // Escape sequence timeout
      key.name = ch.length ? undefined : 'escape';
      key.meta = false;
    }

    key.sequence = s;

    if (s.length !== 0 && (key.name !== undefined || escaped)) {
      /* Named character or sequence */
      stream.emit('keypress', escaped ? undefined : s, key);
    } else if (charLengthAt(s, 0) === s.length) {
      /* Single unnamed character, e.g. "." */
      stream.emit('keypress', s, key);
    }

    /* Unrecognized or broken escape sequence, don't emit anything */
  }
}

// This runs in O(n log n).
export function commonPrefix(strings) {
  if (strings.length === 0) {
    return '';
  }
  if (strings.length === 1) {
    return strings[0];
  }

  const sorted = strings.slice().sort();
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  for (let i = 0; i < min.length; i++) {
    if (min[i] !== max[i]) {
      return min.slice(0, i);
    }
  }
  return min;
}
