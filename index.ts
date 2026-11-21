/* eslint-disable no-control-regex  */
import type { KeyBinding, Keypress } from '~/types';
import { stdin, stdout } from 'node:process';
import { detectTerminal } from 'detect-terminal';
import { emitKeypressEvents } from '~/emit-keypress';
import { mousepress } from '~/mousepress';
import { keycodes } from '~/keycodes';
import { kEscape } from '~/keypress';
import { enableKeyboardProtocol, resetKeyboardProtocol } from '~/keyboard-protocol';
import {
  createShortcut,
  isMousepress,
  isPrintableCharacter,
  parsePosition,
  prioritizeKeymap,
  sortShortcutModifier
} from '~/utils';

export const isWindows = globalThis.process.platform === 'win32';
export const MAX_PASTE_BUFFER = 1024 * 1024; // 1MB limit for paste buffer
export const ENABLE_PASTE_BRACKET_MODE = `${kEscape}[?2004h`;
export const DISABLE_PASTE_BRACKET_MODE = `${kEscape}[?2004l`;
export const ENABLE_MOUSE = `${kEscape}[?1003h`;
export const DISABLE_MOUSE = `${kEscape}[?1003l`;
export * from '~/utils';

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
    stdout.write(`${kEscape}[?25l`);
  },
  show: (stdout: NodeJS.WriteStream) => {
    stdout.write(`${kEscape}[?25h`);
  },
  position: (stdout: NodeJS.WriteStream) => {
    stdout.write(`${kEscape}[6n`);
  }
};

export const hasMatchingModifiers = (a: Keypress, b: Keypress) => {
  return (
    (!hasModifier(a) && !hasModifier(b)) ||
    (a.ctrl === b.ctrl && a.shift === b.shift && a.meta === b.meta && a.fn === b.fn)
  );
};

export const hasModifier = (key: Keypress) => {
  return key.ctrl || key.shift || key.meta || key.fn;
};

type RawModeStream = NodeJS.ReadableStream & {
  readableFlowing?: boolean | null;
  isRaw?: boolean;
  setRawMode?: (mode: boolean) => void;
};

const isReadableStream = (stream: NodeJS.ReadableStream) => {
  if (!stream || typeof stream !== 'object') return false;

  return (
    typeof stream.on === 'function' &&
    typeof stream.off === 'function' &&
    typeof stream.once === 'function' &&
    typeof stream.pause === 'function' &&
    typeof stream.resume === 'function' &&
    typeof stream.setEncoding === 'function'
  );
};

const inputSessions = new WeakMap<NodeJS.ReadableStream, { count: number; wasFlowing: boolean; dispose?: () => void; restoreRaw?: () => void }>();
const outputModes = new WeakMap<NodeJS.WriteStream, Map<string, { count: number; disable?: () => void }>>();

function acquireOutputMode(output: NodeJS.WriteStream, name: string, enable: () => (() => void) | null) {
  const modes = outputModes.get(output) ?? new Map();
  let mode = modes.get(name);

  if (!mode) {
    mode = { count: 0, disable: enable() ?? undefined };
    modes.set(name, mode);
    outputModes.set(output, modes);
  }

  mode.count++;
  return () => {
    if (--mode.count === 0) {
      modes.delete(name);
      if (modes.size === 0) outputModes.delete(output);
      mode.disable?.();
    }
  };
}

export const createEmitKeypress = (config?: { setupProcessHandlers?: boolean }) => {

  function acquireInput(input, escapeCodeTimeout) {
    let session = inputSessions.get(input);

    if (!session) {
      session = { count: 0, wasFlowing: input.readableFlowing === true, dispose: emitKeypressEvents(input, { escapeCodeTimeout: escapeCodeTimeout }) };
      if (typeof input.setRawMode === 'function' && !input.isRaw) {
        try {
          input.setRawMode(true);
        } catch (error) {
          session.dispose?.();
          throw error;
        }
        session.restoreRaw = () => input.setRawMode?.(false);
      }
      inputSessions.set(input, session);
    }

    session.count++;
  }

  function releaseInput(input) {
    const session = inputSessions.get(input);
    if (session && --session.count === 0) {
      inputSessions.delete(input);
      session.restoreRaw?.();
      session.dispose?.();
      if (!session.wasFlowing) {
        input.pause();
      }
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

    // Register process listeners ONLY ONCE (singleton)
    if (!process.listeners('uncaughtExceptionMonitor').includes(onExitHandler)) {
      process.once('uncaughtExceptionMonitor', onExitHandler);
    }

    if (setupProcessHandlers && !process.listeners('SIGINT').includes(onExitHandler)) {
      process.once('SIGINT', onExitHandler);
    }

    if (!process.listeners('exit').includes(onExitHandler)) {
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
    keymap = [],
    onKeypress,
    onMousepress,
    onExit,
    maxPasteBuffer = MAX_PASTE_BUFFER,
    escapeCodeTimeout = 500,
    handleClose = true,
    hideCursor = false,
    initialPosition = false,
    enablePasteMode = false,
    pasteModeTimeout = 100,
    keyboardProtocol = false
  }: {

    input?: RawModeStream;
    output?: NodeJS.WriteStream;
    keymap?: readonly KeyBinding[] | (() => readonly KeyBinding[]);
    // eslint-disable-next-line no-unused-vars
    onKeypress: (input: string, key: Keypress, close: () => void) => void;
    // eslint-disable-next-line no-unused-vars
    onMousepress?: (key: ReturnType<typeof mousepress> & { mouse: true }, close: () => void) => void;
    onExit?: () => void;
    maxPasteBuffer?: number;
    escapeCodeTimeout?: number;
    handleClose?: boolean;
    hideCursor?: boolean;
    initialPosition?: boolean;
    enablePasteMode?: boolean;
    pasteModeTimeout?: number;
    keyboardProtocol?: boolean;
  }) => {
    if (!isReadableStream(input)) {
      throw new Error('Invalid stream passed');
    }

    const releaseModes = [];
    let closed = false;
    let pasting = false;
    let initial = true;
    let sorted = false;
    let buffer = '';
    let pasteTimeout = null;

    const clearPasteState = () => {
      pasting = false;
      buffer = '';

      if (pasteTimeout) {
        clearTimeout(pasteTimeout);
        pasteTimeout = null;
      }
    };

    let bindings = typeof keymap === 'function' ? keymap() : keymap;

    function normalizedShortcut(key: Keypress) {
      return key.shortcut ? sortShortcutModifier(key.shortcut) : createShortcut(key);
    }

    function deliverKeypress(input: string, key: Keypress) {
      onKeypress(input, { ...key, shortcut: normalizedShortcut(key) }, close);
    }

    function handleKeypress(input, event) {
      let key = { ...event };
      if (!pasting && (key.name === 'paste-start' || /\x1B\[200~/.test(key.sequence))) {
        clearPasteState();
        pasting = true;
        pasteTimeout = setTimeout(() => {
          buffer = '';
          pasteTimeout = null;
        }, pasteModeTimeout);
        return;
      }

      if (key.name === 'paste-end' || /\x1B\[201~/.test(key.sequence)) {
        const deliver = pasteTimeout !== null;
        const sequence = buffer;
        clearPasteState();

        if (deliver) {
          key.name = 'paste';
          key.sequence = sequence;
          key.ctrl = false;
          key.shift = false;
          key.meta = false;
          key.fn = false;
          key.printable = true;
          deliverKeypress(sequence, key);
        }
        return;
      }

      if (pasting) {
        if (!pasteTimeout) return;
        pasteTimeout.refresh();
        if (buffer.length < maxPasteBuffer) {
          buffer += key.sequence?.replace(/\r/g, '\n') || '';
        }

        // Ignore any more characters, but don't clear state yet!
        return;
      }
      if (input === undefined && key.sequence === '\x1B[27u' && keyboardProtocol === true) {
        key.name = 'esc';
        key.sequence = '\x1B';
        key.ctrl = false;
        key.meta = false;
        key.shift = false;
        key.printable = false;
        deliverKeypress('', key);
        return;
      }

      if (initialPosition && initial && key.name === 'position') {
        const parsed = parsePosition(key.sequence);
        if (parsed) {
          initial = false;
          deliverKeypress('', parsed);
          return;
        }
      }

      if (!buffer && isMousepress(key.sequence, key)) {
        const k = mousepress(key.sequence, Buffer.from(key.sequence));
        const mouse = Object.assign(k, { mouse: true as const });
        onMousepress?.(mouse, close);
      } else {
        if (!sorted) {
          bindings = prioritizeKeymap(bindings);
          sorted = true;
        }

        const found = bindings.filter(k => k.sequence === key.sequence);

        if (found.length === 1) {
          key = { ...key, ...found[0] };
        }

        const shortcut = normalizedShortcut(key);

        for (const mapping of bindings) {
          if (mapping.sequence) {
            if (key.sequence === mapping.sequence && hasMatchingModifiers(key, mapping)) {
              key = { ...key, ...mapping };
              break;
            }

            continue;
          }

          // Only continue comparison if the custom key mapping does not have a sequence
          if (
            shortcut === mapping.shortcut ||
            (key.name && key.name === mapping.shortcut && hasMatchingModifiers(key, mapping))
          ) {
            key = { ...key, ...mapping };
            break;
          }
        }

        key.printable ||= isPrintableCharacter(key.sequence);
        deliverKeypress(key.sequence, key);
      }
    }

    acquireInput(input, escapeCodeTimeout);

    function close() {
      if (closed) return;
      closed = true;

      onExitHandlers.delete(close);
      for (const release of releaseModes) {
        release();
      }
      if (onKeypress) input.off('keypress', handleKeypress);
      if (pasteTimeout) clearTimeout(pasteTimeout);
      input.off('end', close);
      input.off('close', close);
      releaseInput(input);
      onExit?.();
    }

    try {
      if (onMousepress) {
        releaseModes.push(acquireOutputMode(output, 'mouse', () => {
          enableMouse(output);
          return () => disableMouse(output);
        }));
      }

      if (enablePasteMode) {
        releaseModes.push(acquireOutputMode(output, 'paste', () => {
          enablePaste(output);
          return () => disablePaste(output);
        }));
      }

      if (keyboardProtocol) {
        releaseModes.push(acquireOutputMode(output, 'keyboard', () => {
          resetKeyboardProtocol(output);
          return enableKeyboardProtocol(detectTerminal(), output);
        }));
      }

      if (hideCursor) {
        releaseModes.push(acquireOutputMode(output, 'cursor', () => {
          cursor.hide(output);
          return () => cursor.show(output);
        }));
      }
    } catch (error) {
      close();
      throw error;
    }

    if (onKeypress) input.on('keypress', handleKeypress);

    input.setEncoding('utf8');
    input.once('end', close);
    input.once('close', close);
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

declare global {
  var onExitHandlers: Set<() => void>;
  var exitHandlers: Set<() => void>;
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
