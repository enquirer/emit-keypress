import type readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import { createShortcut, isMousepress, isPrintableCharacter, parsePosition } from './src/utils';
import { emitKeypressEvents } from './src/emit-keypress';
import { mousepress } from './src/mousepress';
import { keycodes } from './src/keycodes';
import { sortKeys } from './src/utils';
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

  // eslint-disable-next-line complexity
  function handleKeypress(input: string = '', key: readline.Key) {
    if (initialPosition) {
      const parsed = parsePosition(key.sequence);
      if (parsed) {
        onKeypress('', parsed, close);
        return;
      }
    }

    closed = false;

    if (isMousepress(key.sequence, key)) {
      const key = mousepress(key.sequence, Buffer.from(key.sequence));
      key.mouse = true;
      onMousepress?.(sortKeys(key), close);
    } else {
      const binding = keymap.find(k => k.sequence === key.sequence);

      if (binding) {
        key = { ...key, ...binding };
      }

      onKeypress(input, sortKeys(key), close);
    }
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
