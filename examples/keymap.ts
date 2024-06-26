import { emitKeypress } from '../index';

emitKeypress({
  input: process.stdin,
  keymap: [
    { sequence: '\x03', shortcut: 'ctrl+c', command: 'cancel' },
    { sequence: '\r', shortcut: 'return', command: 'submit' }
  ],
  onKeypress: async (input, key, close) => {
    console.log({ input, key });

    if (key.shortcut === 'return' || key.shortcut === 'ctrl+c') {
      close();
      process.exit(-1);
    }
  }
});
