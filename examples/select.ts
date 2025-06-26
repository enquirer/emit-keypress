import type { Key } from 'node:readline';
import colors from 'ansi-colors';
import { emitKeypress } from '../index';
import { keycodes } from '~/keycodes';

const { cyan, dim } = colors;

const options = {
  type: 'autocomplete',
  name: 'fruit',
  message: 'Select an item',
  maxVisible: 5,
  nodes: [
    { name: 'apple' },
    { name: 'orange' },
    { name: 'banana' },
    { name: 'pear' },
    { name: 'kiwi' },
    { name: 'strawberry' },
    { name: 'grape' },
    { name: 'watermelon' },
    { name: 'blueberry' },
    { name: 'mango' },
    { name: 'pineapple' },
    { name: 'cherry' },
    { name: 'peach' },
    { name: 'blackberry' },
    { name: 'apricot' },
    { name: 'papaya' },
    { name: 'cantaloupe' },
    { name: 'honeydew' }
    // { name: 'dragonfruit' },
    // { name: 'lychee' },
    // { name: 'pomegranate' },
    // { name: 'fig' },
    // { name: 'date' },
    // { name: 'jackfruit' },
    // { name: 'passionfruit' },
    // { name: 'tangerine' }
  ]
};

class Choice {
  name: string;
  disabled: boolean;

  constructor(options: { name: string; disabled?: boolean }, parent: Select) {
    this.parent = parent;
    this.name = options.name;
    this.disabled = options.disabled || false;
  }

  pointer() {
    return this.active ? cyan('❯') : ' ';
  }

  message() {
    const color = this.active ? cyan.underline : v => v;
    return this.disabled ? dim(`${this.name} (disabled)`) : color(this.name);
  }

  render() {
    return this.pointer() + ' ' + this.message();
  }

  isFocusable() {
    return !this.disabled;
  }

  get active() {
    return this.parent.focused === this;
  }
}

class Select {
  private nodes: Choice[];
  private maxVisible: number;
  private adjustment: number;
  private offset: number;
  private index: number;

  constructor(options: { nodes: { name: string; disabled?: boolean }[] }) {
    this.options = { cycle: true, scroll: true, ...options };
    this.state = {
      collapsed: false,
      maxVisible: options.maxVisible || 7,
      adjustment: 0,
      offset: 0,
      index: options.index || 0,
      append: []
    };

    this.nodes = options.nodes.map(item => new Choice(item, this));

    if (!this.nodes.some(item => item.isFocusable())) {
      throw new Error('At least one item must be focusable');
    }

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  indicator() {
    // const indicator = this.isCollapsible() ? this.state.collapsed ? '+' : '-' : '';
  }

  footer() {
    const output = [];
    const start = this.state.offset + 1;
    const end = Math.min(this.state.offset + this.pageSize, this.nodes.length);
    const remaining = Math.max(0, this.nodes.length - this.pageSize) - this.state.offset;

    output.push('');
    output.push(['', 'Showing', start, 'to', end, 'of', this.nodes.length].join(' '));
    output.push(['', 'Offset:', this.state.offset].join(' '));
    output.push(['', 'Adjustment:', this.state.adjustment].join(' '));
    output.push(['', 'Remaining Items:', remaining].join(' '));
    return output.join('\n');
  }

  async render() {
    const output = [this.options.message];
    const items = this.visible();

    for (const item of items) {
      output.push(item.render());
    }

    output.push(this.footer());
    output.push('');
    output.push(this.state.append.join('\n'));
    this.state.append = [];
    return output.join('\n');
  }

  dispatch(key: Key) {
    if (this[key.command]) {
      this[key.command](key);
      return true;
    }

    if (this[key.name]) {
      this[key.name](key);
      return true;
    }

    this.alert();
    return false;
  }

  toggle() {
    if (this.isCollapsible()) {
      this.state.collapsed = !this.state.collapsed;
    } else {
      this.alert();
    }
  }

  collapse() {
    this.state.collapsed = true;
  }

  expand() {
    this.state.collapsed = false;
  }

  focus(index: number) {
    this.state.index = Math.max(0, Math.min(index, this.nodes.length - 1));
  }

  home() {
    this.state.offset = 0;
    this.first();
  }

  end() {
    this.state.offset = Math.max(0, this.nodes.length - this.pageSize);
    this.last();
  }

  first() {
    this.state.index = 0;

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  last() {
    this.state.index = this.pageSize - 1;

    if (!this.focused.isFocusable()) {
      this.up();
    }
  }

  up(key: Key) {
    if (this.state.index > 0) {
      this.state.index--;
    } else if (this.isScrollable()) {
      this.cycle_up(key);
    } else {
      this.scroll_up(key);
    }

    if (!this.focused.isFocusable()) {
      this.up();
    }
  }

  down(key: Key) {
    if (this.state.index < this.pageSize - 1) {
      this.state.index++;
    } else if (this.isScrollable()) {
      this.cycle_down(key);
    } else {
      this.scroll_down(key);
    }

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  cycle_up(key: Key) {
    if (this.options.cycle !== false) {
      this.state.append.push('cycle_up');
      this.state.index--;

      if (this.state.index < 0) {
        this.last(key);

      } else if (!this.focused?.isFocusable()) {
        this.cycle_up(key);
      }
    } else {
      this.alert();
    }
  }

  cycle_down(key: Key) {
    if (this.options.cycle !== false) {
      this.state.append.push('cycle_down');
      this.state.index++;

      if (this.state.index > this.pageSize - 1) {
        this.first(key);

      } else if (!this.focused?.isFocusable()) {
        this.cycle_down(key);
      }
    } else {
      this.alert();
    }
  }

  scroll_up(key: Key, n: number = 1) {
    if (this.options.scroll !== false) {
      this.state.append.push('scroll_up');
      this.state.offset = (this.state.offset - n + this.nodes.length) % this.nodes.length;

      if (!this.focused?.isFocusable()) {
        this.scroll_up(key);
      }
    } else {
      this.alert();
    }
  }

  scroll_down(key: Key, n: number = 1) {
    if (this.options.scroll !== false) {
      this.state.append.push('scroll_down');
      this.state.offset = (this.state.offset + n) % this.nodes.length;

      if (!this.focused?.isFocusable()) {
        this.scroll_down(key);
      }
    } else {
      this.alert();
    }
  }

  page_left() {
    if (this.state.offset > 0) {
      this.scroll_up(null, Math.min(this.pageSize, this.state.offset));
    } else {
      this.alert();
    }
  }

  page_right() {
    const remaining = Math.max(0, this.nodes.length - (this.state.offset + this.pageSize));
    const offset = this.nodes.length - remaining;
    // const offset = Math.min(this.pageSize, remaining);
    // this.state.append.push('offset: ' + offset);

    // if (offset === 0) {
    //   this.alert();
    // } else {
    //   this.state.offset = offset;
    // }

    // const remaining = Math.max(0, this.nodes.length - this.pageSize) - this.state.offset;
    if (offset > 0) {
      this.scroll_down(null, Math.min(this.pageSize, offset));
    } else {
      this.alert();
    }
  }

  show_fewer() {
    if (this.pageSize > 1) {
      this.state.adjustment--;
    }

    if (this.state.index >= this.pageSize) {
      this.state.index = this.pageSize - 1;
    }

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  show_more() {
    if (this.pageSize < this.nodes.length) {
      this.state.adjustment++;
    }
  }

  visible() {
    const nodes = [];

    for (let i = 0; i < this.pageSize; i++) {
      nodes.push(this.nodes[(this.state.offset + i) % this.nodes.length]);
    }

    return nodes;
  }

  isCollapsible() {
    return this.options.collapsible !== false && this.nodes.some(item => item.disabled);
  }

  isScrollable() {
    return this.options.cycle !== false && this.pageSize > this.nodes.length - 1;
  }

  isFocusable() {
    return this.focused.disabled !== true;
  }

  alert() {
    process.stdout.write('\u0007');
  }

  get range(): [number, number] {
    return [
      this.state.offset,
      (this.state.offset + this.pageSize - 1) % this.nodes.length
    ];
  }

  get pageSize() {
    return Math.max(1, Math.min(this.state.adjustment + this.state.maxVisible, this.nodes.length));
  }

  get focused() {
    return this.nodes[(this.state.offset + this.state.index) % this.nodes.length];
  }
}

console.clear();
const prompt = new Select(options);

const print = (output: string = '') => {
  console.clear();
  console.log(output);
};

prompt.render().then(v => print(v));

emitKeypress({
  enableMouseEvents: true,
  hideCursor: true,
  keymap: [
    ...keycodes,
    { shortcut: 'meta+up', command: 'show_fewer', weight: 1 },
    { shortcut: 'meta+down', command: 'show_more', weight: 1 },
    { shortcut: 'meta+b', command: 'page_left', weight: 1 },
    { shortcut: 'meta+f', command: 'page_right', weight: 1 },
    { shortcut: 'return', command: 'submit', weight: 1 },
    { shortcut: 'ctrl+c', command: 'cancel', weight: 1 },
    { shortcut: 'space', command: 'toggle', weight: 1 }
  ],
  onKeypress: async (input, key, close) => {
    if (prompt.dispatch(key)) {
      print(await prompt.render());
      return;
    }

    if (key.shortcut === 'ctrl+c') {
      prompt.canceled = true;
      print(await prompt.render());
      close();
    }

    if (input === '\r') {
      prompt.submitted = true;
      print(await prompt.render());
      await close();

      console.log(prompt.focused.name);
    }
  }
});
