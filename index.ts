/* eslint-disable no-control-regex */
import type readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import { emitKeypressEvents } from '~/emit-keypress';
import { mousepress } from '~/mousepress';
import { keycodes } from '~/keycodes';
import {
  createShortcut,
  isMousepress,
  isPrintableCharacter,
  parsePosition,
  prioritizeKeymap,
  sortShortcutModifier
} from '~/utils';

export * from '~/utils';

const ESC = '\x1b';
const isWindows = globalThis.process.platform === 'win32';

const MAX_PASTE_BUFFER = 1024 * 1024; // 1MB limit for paste buffer
const ENABLE_PASTE_BRACKET_MODE = `${ESC}[?2004h`;
const DISABLE_PASTE_BRACKET_MODE = `${ESC}[?2004l`;

export const enablePaste = (stdout: NodeJS.WriteStream) => {
  stdout.write(ENABLE_PASTE_BRACKET_MODE);
};

export const disablePaste = (stdout: NodeJS.WriteStream) => {
  stdout.write(DISABLE_PASTE_BRACKET_MODE);
};

export const enableMouse = (stdout: NodeJS.WriteStream) => {
  stdout.write(`${ESC}[?1003h`);
};

export const disableMouse = (stdout: NodeJS.WriteStream) => {
  stdout.write(`${ESC}[?1003l`);
};

export const cursor = {
  hide: (stdout: NodeJS.WriteStream) => {
    stdout.write(`${ESC}[?25l`);
  },
  show: (stdout: NodeJS.WriteStream) => {
    stdout.write(`${ESC}[?25h`);
  },
  position: (stdout: NodeJS.WriteStream) => {
    stdout.write(`${ESC}[6n`);
  }
};

export const hasMatchingModifiers = (a: readline.Key, b) => {
  return a.ctrl === b.ctrl && a.shift === b.shift && a.meta === b.meta && a.fn === b.fn;
};

export const hasModifier = (key: readline.Key) => {
  return key.ctrl || key.shift || key.meta || key.fn;
};

const onExitHandlers = globalThis.onExitHandlers ||= [];
const onExitHandler = () => {
  for (const fn of onExitHandlers) {
    if (!fn.called) {
      fn.called = true;
      fn();
    }
  }
};

if (!globalThis.exitHandlers) {
  globalThis.exitHandlers = onExitHandlers;
  process.once('uncaughtException', onExitHandler);
  process.once('SIGINT', onExitHandler);
  process.once('exit', onExitHandler);
}

export const emitKeypress = ({
  input = stdin,
  output = stdout,
  keymap = [],
  onKeypress,
  onMousepress,
  onExit,
  escapeCodeTimeout = 500,
  handleClose = true,
  hideCursor = false,
  initialPosition = false,
  enablePasteMode = false,
  pasteModeTimeout = 100
}: {
  // eslint-disable-next-line no-undef
  input?: NodeJS.ReadStream;
  keymap?: Array<{ sequence: string; shortcut: string }>;
  // eslint-disable-next-line no-unused-vars
  onKeypress: (input: string, key: readline.Key, close: () => void) => void;
  // eslint-disable-next-line no-unused-vars
  onMousepress?: (input: string, key: any, close: () => void) => void;
  onExit?: () => void;
}) => {
  if (!input || (input !== process.stdin && !input.isTTY)) {
    throw new Error('Invalid stream passed');
  }

  const isRaw = input.isRaw;
  const sortedShorcuts = new Set();
  let closed = false;
  let pasting = false;
  let initial = true;
  let sorted = false;
  let buffer = '';
  let pasteTimeout: NodeJS.Timeout | null = null;

  const clearPasteState = () => {
    pasting = false;
    buffer = '';

    if (pasteTimeout) {
      clearTimeout(pasteTimeout);
      pasteTimeout = null;
    }
  };

  // eslint-disable-next-line complexity
  async function handleKeypress(input: string, key: readline.Key) {
    if (initialPosition && initial) {
      const parsed = parsePosition(key.sequence);
      if (parsed) {
        initial = false;
        onKeypress('', parsed, close);
        return;
      }
    }

    if (key.name === 'paste-start' || /\x1B\[200~/.test(key.sequence)) {
      clearPasteState();
      pasting = true;
      pasteTimeout = setTimeout(clearPasteState, pasteModeTimeout);
      return;
    }

    if (key.name === 'paste-end' || /\x1B\[201~/.test(key.sequence)) {
      clearTimeout(pasteTimeout!);
      pasteTimeout = null;

      if (pasting) {
        key.name = 'paste';
        key.sequence = buffer.replace(/\x1B\[201~/g, '');
        key.ctrl = false;
        key.shift = false;
        key.meta = false;
        key.fn = false;
        key.printable = true;
        onKeypress(buffer, key, close);
        clearPasteState();
      }
      return;
    }

    if (pasting) {
      if (buffer.length < MAX_PASTE_BUFFER) {
        buffer += key.sequence?.replace(/\r/g, '\n') || '';
      } else {
        clearPasteState();
      }
      return;
    }

    if (!buffer && isMousepress(key.sequence, key)) {
      const k = mousepress(key.sequence, Buffer.from(key.sequence));
      k.mouse = true;
      onMousepress?.(k, close);
    } else {
      let addShortcut = false;

      if (typeof keymap === 'function') {
        keymap = keymap();
      }

      if (!sorted) {
        keymap = prioritizeKeymap(keymap);
        sorted = true;
      }

      const shortcut = key.shortcut ? sortShortcutModifier(key.shortcut) : createShortcut(key);

      if (!key.shortcut && hasModifier(key)) {
        key.shortcut = shortcut;
      }

      for (const mapping of keymap) {
        if (mapping.sequence) {
          if (key.sequence === mapping.sequence && hasMatchingModifiers(key, mapping)) {
            key = { ...key, ...mapping };
            addShortcut = false;
            break;
          }

          continue;
        }

        if (mapping.shortcut && !sortedShorcuts.has(mapping.shortcut)) {
          sortedShorcuts.add(mapping.shortcut);
          mapping.shortcut = sortShortcutModifier(mapping.shortcut);
        }

        // Only continue comparison if the custom key mapping does not have a sequence
        if (
          (shortcut === mapping.shortcut) ||
          (key.name && key.name === mapping.shortcut && hasMatchingModifiers(key, mapping))
        ) {
          key = { ...key, ...mapping };
          addShortcut = false;
          break;
        }
      }

      if (/^f[0-9]+$/.test(key.name)) {
        addShortcut = true;
      }

      if (addShortcut) {
        key.shortcut ||= shortcut;
      }

      key.printable ||= isPrintableCharacter(key.sequence);
      onKeypress(key.sequence, key, close);
    }
  }

  function close() {
    if (closed) return;
    if (!isWindows && input.isTTY) input.setRawMode(isRaw);
    if (hideCursor) cursor.show(output);
    if (onMousepress) disableMouse(output);
    if (enablePasteMode) disablePaste(output);
    if (onKeypress) input.off('keypress', handleKeypress);
    if (pasteTimeout) clearTimeout(pasteTimeout);
    closed = true;
    input.pause();
    onExit?.();
  }

  emitKeypressEvents(input, { escapeCodeTimeout });

  if (onMousepress) {
    enableMouse(output);
  }

  if (enablePasteMode === true) {
    enablePaste(output);
  }

  // Disable automatic character echoing
  if (!isWindows && input.isTTY) input.setRawMode(true);
  if (hideCursor) cursor.hide(output);
  if (onKeypress) input.on('keypress', handleKeypress);

  input.setEncoding('utf8');
  input.once('pause', close);
  input.resume();

  if (initialPosition) {
    cursor.position(output);
  }

  if (handleClose !== false) {
    onExitHandlers.push(close);
  }

  return close;
};

export {
  createShortcut,
  emitKeypressEvents,
  isMousepress,
  isPrintableCharacter,
  keycodes,
  mousepress
};

export default emitKeypress;
