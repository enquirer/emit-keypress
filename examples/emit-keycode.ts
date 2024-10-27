/* eslint-disable no-await-in-loop */
import { StringDecoder } from 'node:string_decoder';
import { emitKeypress, keycodes } from '../index';

const pause = (ms = 1000) => new Promise(res => setTimeout(res, ms));
let expected;

function emitKeyCode(escapeCode) {
  const decoder = new StringDecoder('utf8');
  const buffer = Buffer.from(escapeCode, 'ascii');
  const decoded = decoder.write(buffer);
  process.stdin.push(decoded);
}

emitKeypress({
  input: process.stdin,
  keymap: [
    ...keycodes,
    { sequence: '\x1B\x1C', shortcut: 'ctrl+4', ctrl: true }
  ],
  onKeypress: async (input, key, close) => {
    if (![].concat(expected).includes(key.shortcut)) {
      console.log({ expected, input, key });
    }

    if (key.shortcut === 'return' || key.shortcut === 'ctrl+c') {
      close();
      process.exit(-1);
    }
  }
});

(async () => {
  for (const { sequence, shortcut } of keycodes) {
    if (shortcut === 'return') continue;
    expected = shortcut;
    emitKeyCode(sequence);
    await pause(10);
  }

  emitKeyCode('\r');
  console.log('finished');
  expected = 'return';
})();
