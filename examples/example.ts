import { emitKeypress, keycodes } from '../index';

emitKeypress({
  keymap: keycodes,
  escapeCodeTimeout: 100,
  onKeypress: async (input, key, close) => {
    console.log({ input, key });

    if (input === '\x03' || input === '\r') {
      close();
    }
  }
});
