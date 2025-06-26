import colors, { cyan, dim, green, symbols } from 'ansi-colors';
import { emitKeypress } from '../index';
import { keymap } from './keycodes';

const pointer = cyan('❯');
const bell = '\x07';

const state = {
  index: 0,
  margin: { top: 0, bottom: 1, left: 0, right: 15 },
  pos: { x: 0, y: 0 },
  checked: false
};

const check = () => state.checked ? green(symbols.check) : dim.gray(symbols.check);

const center = (text: string, width: number) => {
  const raw = colors.unstyle(text);
  const len = raw.length;
  const pad = Math.floor((width - len) / 2);
  return ' '.repeat(pad) + text + ' '.repeat(pad);
};

export const box = ({ indent = 0, text, width = text.length, color }) => {
  const hline = '─'.repeat(width + 2);
  const pad = ' '.repeat(indent);

  const lines = text.split('\n');
  const output = [`${pad}${color(`╭${hline}╮`)}`];

  const render = (text: string) => {
    return `${pad}${color(`│ ${center(text, width)} │`)}`;
  };

  for (const line of lines) {
    output.push(render(line));
  }

  output.push(`${pad}${color(`└${hline}╯`)}`);
  return output.join('\n');
};

const button = (text, active) => {
  return box({ text, width: text.length + 4, color: active ? cyan : dim });
};

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

const longest = choices.reduce((acc, c) => (c.length > acc ? c.length : acc), 0) + state.margin.right;

const render = () => {
  const pos = { ...state.pos };
  state.pos = { x: null, y: null };
  const isHovered = i => pos.y === i && pos.x <= longest;

  const list = choices.map((choice, index) => {
    if (isHovered(index) && state.action === 'mousemove' && state.index !== index) {
      return `  ${cyan(choice)}`;
    }

    if (state.index === index) {
      return `${pointer} ${cyan.underline(choice)}`;
    }

    return `  ${choice}`;
  });

  clear();
  console.log(list.join('\n'));
  console.log(check(), 'are you sure?');
  console.log(button('Click me', pos.y > choices.length + 1));
  state.action = null;
  state.key = null;
};

render();

emitKeypress({
  keymap,
  hideCursor: true,
  bufferTimeout: 20,
  enableMouseEvents: true,
  onMousepress: key => {
    state.key = key;
    state.pos.x = key.x;
    state.pos.y = key.y - 1;
    state.action = key.action;
    let shouldRender = false;

    if (state.pos.x < longest && state.pos.y < choices.length + 5) {
      if (state.action === 'mouseup' && state.pos.y < choices.length) {
        state.index = state.pos.y + state.margin.top;
      }

      shouldRender = true;
    }

    if (state.action === 'mouseup' && state.pos.y === choices.length) {
      state.checked = !state.checked;
      shouldRender = true;
    }

    if (shouldRender) {
      render();
    }
  },
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
