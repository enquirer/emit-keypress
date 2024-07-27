import { emitKeypress } from '../index';

const state = { input: '' };
const render = (input: string) => {
  process.stdout.write(`\r${input}`);
};

render('Name? ');

emitKeypress({
  onKeypress: async (input, key, close) => {
    if (input === '\x03' || input === '\r') {
      close();
      console.log();
      console.log([state.input]);
    } else if (input === '\x7f') {
      state.input = state.input.slice(0, -1);
    } else {
      state.input += input;
      render(`Name? ${state.input}`);
    }
  }
});
