/* eslint-disable no-await-in-loop */
import { StringDecoder } from 'node:string_decoder';
import { emitKeypress, keycodes } from '../index';
import { sequences } from './sequences';

const pause = (ms = 1000) => new Promise(res => setTimeout(res, ms));
let expected;

function emitKeyCode(escapeCode) {
  const decoder = new StringDecoder('utf8');
  const buffer = Buffer.from(escapeCode, 'ascii');
  const decoded = decoder.write(buffer);
  process.stdin.push(decoded);
}

const close = emitKeypress({
  input: process.stdin,
  keymap: keycodes,
  onKeypress: async (input, key) => {
    if (![].concat(expected).includes(key.shortcut)) {
      console.log([expected, key.shortcut]);
    }

    if (key.shortcut === 'return' || key.shortcut === 'ctrl+c') {
      close();
      process.exit(-1);
    }
  }
});

(async () => {
  for (const [escapeCode, shortcut] of Object.entries(sequences)) {
    expected = shortcut;
    emitKeyCode(escapeCode);
    await pause(10);
  }

  console.log('finished');
  expected = 'return';
})();
