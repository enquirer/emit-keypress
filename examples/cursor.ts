import { emitKeypress } from '../index';

emitKeypress({
  initialPosition: true,
  onKeypress: (input, key, close) => {
    if (input === '\x03' || input === '\r') {
      close();
    }
  }
});
