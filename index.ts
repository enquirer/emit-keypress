import type readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import { createShortcut, isMousepress, isPrintableCharacter, parsePosition } from './src/utils';
import { emitKeypressEvents } from './src/emit-keypress';
import { mousepress } from './src/mousepress';
import { keycodes } from './src/keycodes';
export * from './src/utils';

const isWindows = globalThis.process.platform === 'win32';

export const enableMouse = (stdout: NodeJS.WriteStream) => {
  stdout.write('\x1b[?1003h');
};

export const disableMouse = (stdout: NodeJS.WriteStream) => {
  stdout.write('\x1b[?1003l');
};

export const hideCursor = (stdout: NodeJS.WriteStream) => {
  stdout.write('\u001b[?25l');
};

export const showCursor = (stdout: NodeJS.WriteStream) => {
  stdout.write('\u001b[?25h');
};

export const cursorPosition = (stdout: NodeJS.WriteStream) => {
  stdout.write('\x1b[6n');
};

export const emitKeypress = ({
  input = stdin,
  output = stdout,
  keymap = [],
  onKeypress,
  onMousepress,
  onExit,
  bufferTimeout = 20,
  hideCursor = false,
  initialPosition = false
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
  let ms = 0;

  // Buffering keypress events
  let keyBuffer: Array<{ input: string; key: readline.Key }> = [];
  // eslint-disable-next-line no-undef
  let timeout: NodeJS.Timeout | null = null;

  function emitBufferedKeypress() {
    ms = 0;

    if (keyBuffer.length > 0) {
      // Combine buffered keypress events into a single event
      // eslint-disable-next-line complexity
      let combinedKey = keyBuffer.reduce((acc, event) => {
        if (acc.name === 'undefined') {
          acc.name = '';
        }

        return {
          sequence: acc.sequence + event.key.sequence,
          code: acc.code || event.key.code,
          name: (acc.name || '') + (event.key.name || '') || (isPrintableCharacter(event.key.sequence) ? event.key.sequence : ''),
          shortcut: '',
          ctrl: acc.ctrl || event.key.ctrl,
          shift: acc.shift || event.key.shift,
          meta: acc.meta || event.key.meta || false,
          fn: acc.fn || event.key.fn,
          printable: acc.printable ?? event.key.printable ?? true
        };
      },
      {
        sequence: '',
        code: '',
        name: '',
        shortcut: '',
        ctrl: false,
        shift: false,
        meta: false,
        fn: false,
        printable: undefined
      });

      let addShortcut = keyBuffer.length < 3;

      if (typeof keymap === 'function') {
        keymap = keymap();
      }

      for (const mapping of keymap) {
        if (mapping.sequence) {
          if (combinedKey.sequence === mapping.sequence) {
            combinedKey = { ...combinedKey, ...mapping };
            addShortcut = false;

            break;
          }

          continue;
        }

        // Only continue comparison if the custom key mapping does not have a sequence
        if (
          combinedKey.shortcut === mapping.shortcut ||
          combinedKey.name === mapping.shortcut
        ) {
          combinedKey = { ...combinedKey, ...mapping };
          addShortcut = false;
          break;
        }
      }

      if (/^f[0-9]+$/.test(combinedKey.name)) {
        addShortcut = true;
      }

      if (addShortcut) {
        combinedKey.shortcut ||= createShortcut(combinedKey);
      } else {
        combinedKey.name = '';
      }

      combinedKey.printable = isPrintableCharacter(combinedKey.sequence);
      combinedKey.pasted = keyBuffer.length > 2;
      keyBuffer = [];

      if (isMousepress(combinedKey.sequence, combinedKey)) {
        const key = mousepress(combinedKey.sequence, Buffer.from(combinedKey.sequence));
        key.mouse = true;
        onMousepress?.(key, close);
      } else {
        onKeypress(combinedKey.sequence, combinedKey, close);
      }
    }
  }

  function handleKeypress(input: string, key: readline.Key) {
    if (initialPosition) {
      const parsed = parsePosition(key.sequence);
      if (parsed) {
        onKeypress('', parsed, close);
        return;
      }
    }

    closed = false;

    const total = bufferTimeout + ms;
    const first = keyBuffer[0];
    key.printable = isPrintableCharacter(input);

    if (!key.printable && !first) {
      keyBuffer.push({ input, key });
      emitBufferedKeypress();
      return;
    }

    const printable = first && first.key.printable || !first && key.printable;

    if (total < 200 && printable) {
      ms++;
    }

    keyBuffer.push({ input, key });
    clearTimeout(timeout);
    timeout = setTimeout(emitBufferedKeypress, bufferTimeout + ms);
  }

  emitKeypressEvents(input);

  if (onMousepress) {
    enableMouse(output);
  }

  function close() {
    if (closed) return;
    if (!isWindows && input.isTTY) input.setRawMode(isRaw);
    if (onKeypress) input.off('keypress', handleKeypress);
    if (onMousepress) disableMouse(output);
    if (hideCursor) showCursor(output);
    closed = true;
    input.pause();
    onExit?.();
  }

  // Disable automatic character echoing
  if (!isWindows && input.isTTY) input.setRawMode(true);
  if (hideCursor) hideCursor(output);
  if (onKeypress) input.on('keypress', handleKeypress);

  input.setEncoding('utf8');
  input.once('pause', close);
  input.resume();

  if (initialPosition) {
    cursorPosition(output);
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
