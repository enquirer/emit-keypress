import { emitKeypress } from '../index';

const close = emitKeypress({
  input: process.stdin,
  keymap: [
    { sequence: '\x03', shortcut: 'ctrl+c' },
    { sequence: '\r', shortcut: 'return' }
  ],
  onKeypress: async (input, key) => {
    console.log(key);

    if (key.shortcut === 'return' || key.shortcut === 'ctrl+c') {
      close();
      process.exit(-1);
    }
  }
});

