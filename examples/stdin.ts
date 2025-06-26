import { emitKeypress } from '../index';

const state = { input: '' };

emitKeypress({ input: process.stdin });

console.clear();
console.log(state.input);

process.stdin.on('keypress', (input, key) => {
  if (input === '\x7f') {
    state.input = state.input.slice(0, -1);
  } else {
    state.input += input;
  }

  console.clear();
  console.log(state.input);

  if (input === '\x03' || input === '\r') {
    process.stdin.pause();
  }
});
