// This file is a modified version of the original file from the readline module of Node.js
// Copyright Joyent, Inc. and other Node contributors.
// SPDX-License-Identifier: MIT
import { StringDecoder } from 'node:string_decoder';
import { clearTimeout, setTimeout } from 'node:timers';
import { charLengthAt, emitKeys, kEscape } from '~/keypress';

const KEYPRESS_DECODER = Symbol('keypress-decoder');
const PASTE_END = '\x1b[201~';
const CONTROL_LIMIT = 64 * 1024;
const CONTROL_IDLE_TIMEOUT = 5000;
const kSawKeyPress = Symbol('saw-key-press');

// GNU readline library - keyseq-timeout is 500ms (default)
const ESCAPE_CODE_TIMEOUT = 500;

/**
 * accepts a readable Stream instance and makes it emit "keypress" events
 */

export function emitKeypressEvents(stream: NodeJS.ReadableStream & {
  [KEYPRESS_DECODER]?: StringDecoder;
}, iface: {
  escapeCodeTimeout?: number;
  isCompletionEnabled?: boolean;
  [kSawKeyPress]?: boolean;
} = {}) {
  if (stream[KEYPRESS_DECODER]) return;

  const decoder = stream[KEYPRESS_DECODER] = new StringDecoder('utf8');
  const { escapeCodeTimeout = ESCAPE_CODE_TIMEOUT } = iface;
  let state = 'text';
  let pending = '';
  let remaining = 0;
  let discarded = false;
  let previousEscape = false;
  let timeoutId;
  let disposed = false;

  function finish(nextState = 'text') {
    const sequence = pending;
    pending = '';
    state = nextState;
    if (!discarded && sequence) {
      emitKeys(stream, sequence);
    }
    discarded = false;
  }

  function readCharacter(ch: string) {
    if (state === 'paste') {
      const candidate = pending + ch;
      if (candidate === PASTE_END) {
        pending = candidate;
        finish();
      } else if (PASTE_END.startsWith(candidate)) {
        pending = candidate;
      } else {
        pending = ch === kEscape ? ch : '';
        const literal = pending ? candidate.slice(0, -1) : candidate;
        emitKeys(stream, literal, true);
      }
      return;
    }

    if (state === 'text') {
      if (ch === kEscape) {
        pending = ch;
        state = 'escape';
      } else {
        emitKeys(stream, ch);
      }
      return;
    }

    if (state === 'escape') {
      const first = pending === kEscape;
      pending += ch;
      if (ch === '[' || ch === 'O') {
        state = ch === '[' ? 'csi' : 'ss3';
      } else if (ch === ']' || ch === 'P') {
        state = ch === ']' ? 'osc' : 'dcs';
        previousEscape = false;
      } else if (!(first && ch === kEscape)) {
        finish();
      }
      return;
    }

    if (state === 'x10') {
      pending += ch;
      if (--remaining === 0) {
        finish();
      }
      return;
    }

    const controlString = state === 'osc' || state === 'dcs';
    if (!controlString && ch === kEscape) {
      pending = ch;
      discarded = false;
      state = 'escape';
      return;
    }

    if (pending.length >= CONTROL_LIMIT) {
      discarded = true;
      pending = '';
    }
    if (!discarded) {
      pending += ch;
    }
    if (controlString) {
      if ((state === 'osc' && ch === '\x07') || (previousEscape && ch === '\\')) {
        finish();
      }
      previousEscape = ch === kEscape;
    } else if (state === 'vt300') {
      if (ch === '\r') {
        finish();
      }
    } else if (pending === '\x1b[M') {
      state = 'x10';
      remaining = 3;
    } else if (/^\x1b\[24[0135]~$/.test(pending)) {
      state = 'vt300';
    } else if ((ch >= '@' && ch <= '~') || (ch === '$' && /^\x1b\[[235678]\$$/.test(pending))) {
      if (!/^\x1b{1,2}\[\[$/.test(pending)) {
        finish(pending === '\x1b[200~' ? 'paste' : 'text');
      }
    }
  }

  function onData(input) {
    if (!stream.listenerCount('keypress')) {
      stream.off('data', onData);
      stream.on('newListener', onNewListener);
      return;
    }

    clearTimeout(timeoutId);
    iface[kSawKeyPress] = false;
    iface.isCompletionEnabled = false;
    if (typeof input === 'string') {
      iface[kSawKeyPress] = charLengthAt(input, 0) === input.length;
      let offset = 0;
      for (const ch of input) {
        offset += ch.length;
        iface.isCompletionEnabled = offset === input.length;
        readCharacter(ch);
        if (disposed) return;
      }
    } else {
      let count = 0;
      for (let i = 0; i < input.length; i++) {
        const byte = input[i];
        const decoded = state === 'x10' ? String.fromCharCode(byte) : decoder.write(input.subarray(i, i + 1));
        for (const ch of decoded) {
          count++;
          iface.isCompletionEnabled = i + 1 === input.length;
          iface[kSawKeyPress] = iface.isCompletionEnabled && count === 1;
          readCharacter(ch);
          if (disposed) return;
        }
      }
    }

    if (state === 'escape') {
      timeoutId = setTimeout(finish, escapeCodeTimeout);
    } else if (state === 'osc' || state === 'dcs' || discarded) {
      timeoutId = setTimeout(() => {
        pending = '';
        discarded = false;
        state = 'text';
      }, CONTROL_IDLE_TIMEOUT);
    }
  }

  function onEnd() {
    try {
      for (const ch of decoder.end()) {
        readCharacter(ch);
      }
      if (state === 'escape') {
        finish();
      } else if (state === 'paste' && pending) {
        emitKeys(stream, pending, true);
      }
    } finally {
      dispose();
    }
  }

  function onNewListener(event) {
    if (event === 'keypress') {
      stream.on('data', onData);
      stream.off('newListener', onNewListener);
    }
  }

  if (stream.listenerCount('keypress') > 0) {
    stream.on('data', onData);
  } else {
    stream.on('newListener', onNewListener);
  }

  stream.once('end', onEnd);
  stream.once('close', dispose);
  return dispose;

  function dispose() {
    if (disposed) {
      return;
    }

    disposed = true;
    clearTimeout(timeoutId);
    stream.off('data', onData);
    stream.off('newListener', onNewListener);
    delete stream[KEYPRESS_DECODER];
    pending = '';
    stream.off('end', onEnd);
    stream.off('close', dispose);
  }
}

