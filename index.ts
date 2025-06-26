/* eslint-disable no-control-regex  */
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
const ENABLE_MOUSE = `${ESC}[?1003h`;
const DISABLE_MOUSE = `${ESC}[?1003l`;

export const enablePaste = (stdout: NodeJS.WriteStream) => {
  stdout.write(ENABLE_PASTE_BRACKET_MODE);
};

export const disablePaste = (stdout: NodeJS.WriteStream) => {
  stdout.write(DISABLE_PASTE_BRACKET_MODE);
};

export const enableMouse = (stdout: NodeJS.WriteStream) => {
  stdout.write(ENABLE_MOUSE);
};

export const disableMouse = (stdout: NodeJS.WriteStream) => {
  stdout.write(DISABLE_MOUSE);
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
  return (
    (!hasModifier(a) && !hasModifier(b)) ||
    (a.ctrl === b.ctrl && a.shift === b.shift && a.meta === b.meta && a.fn === b.fn)
  );
};

export const hasModifier = (key: readline.Key) => {
  return key.ctrl || key.shift || key.meta || key.fn;
};

export const createEmitKeypress = (config?: { setupProcessHandlers?: boolean }) => {
  const sessionCounts = new WeakMap<NodeJS.ReadStream, number>();

  function acquireInput(input) {
    sessionCounts.set(input, (sessionCounts.get(input) || 0) + 1);
  }

  function releaseInput(input) {
    const count = sessionCounts.get(input) || 0;
    if (count > 1) {
      sessionCounts.set(input, count - 1);
    } else {
      sessionCounts.delete(input);
      input.pause(); // actually pause only when last session closes
    }
  }

  // If this is the singleton, use the (possibly global) handlers array
  const setupProcessHandlers = config?.setupProcessHandlers === true;
  let onExitHandlers: Set<() => void>;

  // If not explicitly told to skip, AND we are the singleton (first created),
  // use the process global array
  if (setupProcessHandlers || !config) {
    // Use process-global handlers for the singleton instance only
    onExitHandlers = globalThis.onExitHandlers ||= new Set();

    if (!globalThis.exitHandlers) {
      globalThis.exitHandlers = onExitHandlers;
    }

    const hasListener = (name, fn) => {
      return process.listeners(name).includes(fn);
    };

    // Register process listeners ONLY ONCE (singleton)
    if (!hasListener('uncaughtException', onExitHandler)) {
      process.once('uncaughtException', onExitHandler);
    }

    if (!hasListener('SIGINT', onExitHandler)) {
      process.once('SIGINT', onExitHandler);
    }

    if (!hasListener('exit', onExitHandler)) {
      process.once('exit', onExitHandler);
    }

  } else {
    // For non-singleton, just use a local handlers array
    onExitHandlers = new Set();
  }

  function onExitHandler() {
    for (const fn of onExitHandlers) {
      try {
        fn();
        onExitHandlers.delete(fn);
      } catch (err) {
        console.error('Error in exit handler:', err);
      }
    }
  }

  const emitKeypress = ({
    input = stdin,
    output = stdout,
    keymap: customKeymap = [],
    onKeypress,
    onMousepress,
    onExit,
    maxPasteBuffer = MAX_PASTE_BUFFER,
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
      if (initialPosition && initial && key.name === 'position') {
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
        clearTimeout(pasteTimeout);
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
        if (buffer.length < maxPasteBuffer) {
          buffer += key.sequence?.replace(/\r/g, '\n') || '';
        }

        // Ignore any more characters, but don't clear state yet!
        return;
      }

      if (!buffer && isMousepress(key.sequence, key)) {
        const k = mousepress(key.sequence, Buffer.from(key.sequence));
        k.mouse = true;
        onMousepress?.(k, close);
      } else {
        let addShortcut = false;

        let keymap = typeof customKeymap === 'function' ? customKeymap() : customKeymap;

        if (!sorted) {
          keymap = prioritizeKeymap(keymap);
          sorted = true;
        }

        const shortcut = key.shortcut
          ? sortShortcutModifier(key.shortcut)
          : createShortcut(key);

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

          // Only continue comparison if the custom key mapping does not have a sequence
          if (
            shortcut === mapping.shortcut ||
            (key.name &&
              key.name === mapping.shortcut &&
              hasMatchingModifiers(key, mapping))
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

    acquireInput(input);

    function close() {
      if (closed) return;
      closed = true;

      onExitHandlers.delete(close);
      if (!isWindows && input.isTTY) input.setRawMode(isRaw);
      if (hideCursor) cursor.show(output);
      if (onMousepress) disableMouse(output);
      if (enablePasteMode) disablePaste(output);
      if (onKeypress) input.off('keypress', handleKeypress);
      if (pasteTimeout) clearTimeout(pasteTimeout);
      input.off('pause', close);
      releaseInput(input);
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

    if (handleClose !== false && !onExitHandlers.has(close)) {
      onExitHandlers.add(close);
    }

    return close;
  };

  return {
    emitKeypress,
    onExitHandlers
  };
};

export declare global {
  var onExitHandlers: Set<() => void>; // eslint-disable-line no-var
  var exitHandlers: Array<() => void>; // eslint-disable-line no-var
}

export const { emitKeypress } = createEmitKeypress();

export {
  createShortcut,
  emitKeypressEvents,
  isMousepress,
  isPrintableCharacter,
  keycodes,
  mousepress
};

export default emitKeypress;
