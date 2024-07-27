import { emitKeypress } from '../index';

emitKeypress({
  enableMouseEvents: true,
  onKeypress: (input, key, close) => {
    console.log('keypress:', { input, key });

    if (input === '\x03' || input === '\r') {
      console.log('cleared');
      close();
    }
  },
  onMousepress: key => {
    console.log(key);
  }
});
