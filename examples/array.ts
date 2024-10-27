import { emitKeypress, keycodes } from '../index';

const items = [
  'Item 1',
  'Item 2',
  'Item 3',
  'Item 4',
  'Item 5',
  'Item 6',
  'Item 7',
  'Item 8',
  'Item 9',
  'Item 10'
  // 'Item 11',
  // 'Item 12',
  // 'Item 13',
  // 'Item 14',
  // 'Item 15',
  // 'Item 16',
  // 'Item 17',
  // 'Item 18',
  // 'Item 19',
  // 'Item 20'
];

class Prompt {
  constructor(options) {
    this.items = options.items.slice();
    this.offset = 0;
    this.index = 0;
  }

  up() {
    this.index = Math.max(0, this.index - 1);
  }
  down() {
    this.index = Math.min(this.items.length - 1, this.index + 1);
  }

  render() {
    const visible = this.visible();

    for (let i = 0; i < visible.length; i++) {
      if (i === this.index) {
        console.log('> ' + visible[i]);
      } else {
        console.log('  ' + visible[i]);
      }
    }
  }

  visible() {
    return this.items;
  }
}

const prompt = new Prompt({ items });

prompt.render();

emitKeypress({
  keymap: keycodes,
  hideCursor: true,
  enableMouseEvents: true,
  onKeypress: (input, key, close) => {
    console.clear();

    if (prompt[key.command]) {
      prompt[key.command]();
      prompt.render();
      return;
    }

    if (prompt[key.name]) {
      prompt[key.name]();
      prompt.render();
      return;
    }

    if (input === '\x03' || input === '\r') {
      console.log(prompt.render());
      close();
    }
  }
});
