import { emitKeypress } from '../index';

emitKeypress({
  input: process.stdin,
  keymap: [
    { shortcut: 'space', command: 'toggle' },
    { shortcut: 'escape', command: 'cancel' },
    { shortcut: 'ctrl+c', command: 'cancel' },
    { shortcut: 'ctrl+o', command: 'open' },
    { shortcut: 'return', command: 'submit' }
  ],
  onKeypress: async (input, key, close) => {
    console.log({ input, key });

    if (key.command === 'submit' || key.command === 'cancel') {
      close();
      process.exit(-1);
    }
  }
});
