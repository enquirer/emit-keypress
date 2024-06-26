import type readline from 'node:readline';
import { emitKeypressEvents } from './src/emit-keypress';
import { createShortcut, isPrintableCharacter } from './src/utils';
import { keycodes } from './src/keycodes';

export const emitKeypress = ({
  input = process.stdin,
  keymap = [],
  onKeypress,
  bufferTimeout = 3
}: {
  // eslint-disable-next-line no-undef
  input?: NodeJS.ReadStream;
  keymap?: Array<{ sequence: string; shortcut: string }>;
  // eslint-disable-next-line no-unused-vars
  onKeypress: (input: string, key: readline.Key, close: () => void) => void;
}) => {
  if (!input || (input !== process.stdin && !input.isTTY)) {
    throw new Error('Invalid stream passed');
  }

  const isRaw = input.isRaw;
  let closed = false;

  // Buffering keypress events
  let keyBuffer: Array<{ input: string; key: readline.Key }> = [];
  // eslint-disable-next-line no-undef
  let timeout: NodeJS.Timeout | null = null;

  function emitBufferedKeypress() {
    if (keyBuffer.length > 0) {
      // Combine buffered keypress events into a single event
      // eslint-disable-next-line complexity
      const combinedKey = keyBuffer.reduce((acc, event) => {
        if (acc.name === 'undefined') {
          acc.name = '';
        }

        return {
          sequence: acc.sequence + event.key.sequence,
          printable: acc.printable ?? event.key.printable ?? true,
          name: (acc.name || '') + (event.key.name || ''),
          ctrl: acc.ctrl || event.key.ctrl,
          shift: acc.shift || event.key.shift,
          meta: acc.meta || event.key.meta || false,
          fn: acc.fn || event.key.fn,
          shortcut: ''
        };
      }, {
        name: '',
        sequence: '',
        printable: undefined,
        ctrl: false,
        shift: false,
        meta: false,
        fn: false,
        shortcut: ''
      });

      let addShortcut = true;

      if (typeof keymap === 'function') {
        keymap = keymap();
      }

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

  function handleKeypress(input: string, key: readline.Key) {
    closed = false;
    keyBuffer.push({ input, key });
    clearTimeout(timeout);
    timeout = setTimeout(emitBufferedKeypress, bufferTimeout);
  }

  emitKeypressEvents(input);

  function close() {
    if (closed) return;
    if (input.isTTY) input.setRawMode(isRaw);
    if (onKeypress) input.off('keypress', handleKeypress);
    closed = true;
    input.pause();
  }

  // Disable automatic character echoing
  if (input.isTTY) input.setRawMode(true);
  input.setEncoding('utf8');
  if (onKeypress) input.on('keypress', handleKeypress);
  input.once('pause', close);
  input.resume();
  return close;
};

export { keycodes, createShortcut, emitKeypressEvents };
export default emitKeypress;
