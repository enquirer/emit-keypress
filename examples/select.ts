import { cyan } from 'ansi-colors';
import { emitKeypress } from '../index';
import { keymap } from './keymap copy';

const state = { index: 0 };
const pointer = cyan('❯');
const bell = '\x07';
const choices = [
  'apple',
  'banana',
  'cherry',
  'date',
  'elderberry',
  'fig',
  'grape',
  'honeydew',
  'kiwi'
];

const clear = () => {
  process.stdout.write('\x1b[2J\x1b[0;0H');
};

const render = () => {
  const list = choices.map((choice, index) => {
    if (state.index === index) {
      return `${pointer} ${cyan(choice)}`;
    }

    return `  ${choice}`;
  });

  clear();
  console.log(list.join('\n'));
};

render();

emitKeypress({
  keymap,
  bufferTimeout: 20,
  onKeypress: async (input, key, close) => {
    switch (key.shortcut) {
      case 'up':
        if (state.index === 0) {
          state.index = choices.length - 1;
        } else {
          state.index--;
        }
        break;
      case 'down':
        if (state.index === choices.length - 1) {
          state.index = 0;
        } else {
          state.index++;
        }
        break;
      default: {
        process.stdout.write(bell);
        break;
      }
    }

    render();

    if (input === '\x03' || input === '\r') {
      close();
      clear();
      console.log(choices[state.index]);
    }
  }
});
