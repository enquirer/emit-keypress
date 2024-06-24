import { emitKeypress } from '../index';

emitKeypress({
  onKeypress: async (input, key, close) => {
    console.log({ input, key });

    if (input === '\x03' || input === '\r') {
      close();
    }
  }
});
