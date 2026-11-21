// This file is a modified version of the original file from the readline module of Node.js
// Copyright Joyent, Inc. and other Node contributors.
// SPDX-License-Identifier: MIT
import { StringDecoder } from 'node:string_decoder';
import { clearTimeout, setTimeout } from 'node:timers';
import { charLengthAt, CSI, emitKeys } from '~/keypress';

const { kEscape } = CSI;
const KEYPRESS_DECODER = Symbol('keypress-decoder');
const ESCAPE_DECODER = Symbol('escape-decoder');
const kSawKeyPress = Symbol('saw-key-press');

// GNU readline library - keyseq-timeout is 500ms (default)
const ESCAPE_CODE_TIMEOUT = 500;

/**
 * accepts a readable Stream instance and makes it emit "keypress" events
 */

export function emitKeypressEvents(stream: NodeJS.ReadableStream & {
  [KEYPRESS_DECODER]?: StringDecoder;
  [ESCAPE_DECODER]?: ReturnType<typeof emitKeys>;
}, iface: {
  escapeCodeTimeout?: number;
  isCompletionEnabled?: boolean;
  [kSawKeyPress]?: boolean;
} = {}) {
  if (stream[KEYPRESS_DECODER]) return;

  const decoder = stream[KEYPRESS_DECODER] = new StringDecoder('utf8');
  let keys = stream[ESCAPE_DECODER] = emitKeys(stream);
  keys.next();

  const { escapeCodeTimeout = ESCAPE_CODE_TIMEOUT } = iface;
  let timeoutId;
  let disposed = false;

  function readCharacter(character: string) {
    try {
      keys.next(character);
    } catch (err) {
      if (!disposed) {
        keys = stream[ESCAPE_DECODER] = emitKeys(stream);
        keys.next();
      }

      throw err;
    }
  }

  function onData(input) {
    if (stream.listenerCount('keypress') > 0) {
      const string = typeof input === 'string' ? input : decoder.write(input);
      if (string) {
        clearTimeout(timeoutId);

        // This supports characters of length 2.
        iface[kSawKeyPress] = charLengthAt(string, 0) === string.length;
        iface.isCompletionEnabled = false;

        let length = 0;
        for (const character of string) {
          length += character.length;

          if (length === string.length) {
            iface.isCompletionEnabled = true;
          }

          readCharacter(character);
          if (disposed) {
            return;
          }

          if (length === string.length && character === kEscape) {
            timeoutId = setTimeout(readCharacter, escapeCodeTimeout, '');
          }
        }
      }
    } else {
      // Nobody's watching anyway
      stream.off('data', onData);
      stream.on('newListener', onNewListener);
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

  return () => {
    if (disposed) {
      return;
    }

    disposed = true;
    clearTimeout(timeoutId);
    stream.off('data', onData);
    stream.off('newListener', onNewListener);
    delete stream[KEYPRESS_DECODER];
    delete stream[ESCAPE_DECODER];
  };
}

