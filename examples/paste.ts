import { emitKeypress, keycodes } from '../index';

emitKeypress({
  keymap: keycodes,
  enablePasteMode: true,
  onKeypress: async (input, key, close) => {
    console.log({ input, key });

    if (input === '\x03' || input === '\r') {
      close();
    }
  }
});
