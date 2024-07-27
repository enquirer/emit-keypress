import { emitKeypress } from '../index';

emitKeypress({
  input: process.stdin,
  keymap: [
    { shortcut: 'escape', action: 'cancel' },
    { shortcut: 'ctrl+c', action: 'cancel' },
    { shortcut: 'return', action: 'submit' }
  ],
  onKeypress: async (input, key, close) => {
    console.log({ input, key });

    if (key.action === 'submit' || key.action === 'cancel') {
      close();
      process.exit(-1);
    }
  }
});
