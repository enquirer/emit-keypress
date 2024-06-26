import { emitKeypress } from '../index';

emitKeypress({ input: process.stdin });

process.stdin.on('keypress', (input, key) => {
  console.log({ input, key });

  if (input === '\x03' || input === '\r') {
    process.stdin.pause();
  }
});
