/* eslint-disable no-control-regex */
import type readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import { createShortcut, isMousepress, isPrintableCharacter, parsePosition } from './src/utils';
import { emitKeypressEvents } from './src/emit-keypress';
import { mousepress } from './src/mousepress';
import { keycodes } from './src/keycodes';
export * from './src/utils';

const ESC = '\x1b';
const ENABLE_PASTE_BRACKET_MODE = `${ESC}[?2004h`;
const DISABLE_PASTE_BRACKET_MODE = `${ESC}[?2004l`;

const isWindows = globalThis.process.platform === 'win32';

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

export const emitKeypress = ({
  input = stdin,
  output = stdout,
  keymap = [],
  onKeypress,
  onMousepress,
  onExit,
  hideCursor = false,
  initialPosition = false,
  enablePasteMode = false
}: {
  // eslint-disable-next-line no-undef
  input?: NodeJS.ReadStream;
  keymap?: Array<{ sequence: string; shortcut: string }>;
  // eslint-disable-next-line no-unused-vars
  onKeypress: (input: string, key: readline.Key, close: () => void) => void;
  // eslint-disable-next-line no-unused-vars
  onMousepress?: (input: string, key: any, close: () => void) => void;
}) => {
  if (!input || (input !== process.stdin && !input.isTTY)) {
    throw new Error('Invalid stream passed');
  }

  const isRaw = input.isRaw;
  let closed = false;
  let pasting = false;
  let buffer = '';

  // eslint-disable-next-line complexity
  async function handleKeypress(input: string, key: readline.Key) {
    if (initialPosition) {
      const parsed = parsePosition(key.sequence);
      if (parsed) {
        onKeypress('', parsed, close);
        return;
      }
    }

    if (key.name === 'paste-start' || /\x1B\[200~/.test(key.sequence)) {
      pasting = true;
      buffer = '';
      return;
    }

    if (key.name === 'paste-end' || /\x1B\[201~/.test(key.sequence)) {
      key.name = 'paste';
      key.sequence = buffer.replace(/\x1B\[201~/g, '');
      key.ctrl = false;
      key.shift = false;
      key.meta = false;
      key.fn = false;
      key.printable = true;
      onKeypress(buffer, key, close);
      pasting = false;
      buffer = '';
      return;
    }

    if (pasting) {
      buffer += key.sequence?.replace(/\r/g, '\n') || '';
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

      for (const mapping of keymap) {
        if (mapping.sequence) {
          if (key.sequence === mapping.sequence) {
            key = { ...key, ...mapping };
            addShortcut = false;
            break;
          }

          continue;
        }

        // Only continue comparison if the custom key mapping does not have a sequence
        if ((key.shortcut && key.shortcut === mapping.shortcut) || (key.name && key.name === mapping.shortcut)) {
          key = { ...key, ...mapping };
          addShortcut = false;
          break;
        }
      }

      if (/^f[0-9]+$/.test(key.name)) {
        addShortcut = true;
      }

      if (addShortcut) {
        key.shortcut ||= createShortcut(key);
      }

      key.printable ||= isPrintableCharacter(key.sequence);
      onKeypress(key.sequence, key, close);
    }
  }

  emitKeypressEvents(input);

  if (onMousepress) {
    enableMouse(output);
  }

  if (enablePasteMode === true) {
    enablePaste(output);
  }

  function close() {
    if (closed) return;
    if (!isWindows && input.isTTY) input.setRawMode(isRaw);
    if (onKeypress) input.off('keypress', handleKeypress);
    if (onMousepress) disableMouse(output);
    if (hideCursor) cursor.show(output);
    closed = true;
    input.pause();
    onExit?.();
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

  return close;
};

export {
  keycodes,
  createShortcut,
  emitKeypressEvents,
  isMousepress,
  isPrintableCharacter,
  mousepress
};

export default emitKeypress;
