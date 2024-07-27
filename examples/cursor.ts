import { emitKeypress } from '../index';

emitKeypress({
  initialPosition: true,
  onKeypress: (input, key, close) => {
    console.log({ input, key });

    if (input === '\x03' || input === '\r') {
      close();
    }
  }
});
