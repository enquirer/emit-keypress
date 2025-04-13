import type { Key } from 'node:readline';
import colors from 'ansi-colors';
import { emitKeypress } from '../index';
import { keycodes } from '~/keycodes';

const { cyan, dim } = colors;

const options = {
  type: 'autocomplete',
  name: 'fruit',
  message: 'Select an item',
  limit: 10,
  nodes: [
    { name: 'apple' },
    { name: 'orange' },
    { name: 'banana', disabled: true },
    { name: 'pear', disabled: true },
    { name: 'kiwi' },
    { name: 'strawberry' },
    { name: 'grape' },
    { name: 'watermelon' },
    { name: 'blueberry', disabled: true },
    { name: 'mango' },
    { name: 'pineapple', disabled: true },
    { name: 'cherry' },
    { name: 'peach' },
    { name: 'blackberry' },
    { name: 'apricot' },
    { name: 'papaya' },
    { name: 'cantaloupe' },
    { name: 'honeydew' }
  ]
};

class Choice {
  name: string;
  disabled: boolean;

  constructor(options: { name: string; disabled?: boolean }, parent: Prompt) {
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

class Prompt {
  private nodes: Choice[];
  private maxVisible: number;
  private maxOffset: number;
  private offset: number;
  private index: number;

  constructor(options: { nodes: { name: string; disabled?: boolean }[] }) {
    this.options = { scroll: true, rotate: true, ...options };
    this.state = { collapsed: false, maxVisible: 7, maxOffset: 0, offset: 0, index: 0 };
    this.nodes = options.nodes.map(item => new Choice(item, this));
    this.print = options.print || (() => '');

    if (!this.nodes.some(item => item.isFocusable())) {
      throw new Error('At least one item must be focusable');
    }

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  async init() {
    if (!this.initialized) {
      this.initialized = true;
      const { createLogUpdate } = await import('log-update');
      this.print = createLogUpdate(process.stdout, { showCursor: false });
    }
  }

  indicator() {
    // const indicator = this.isCollapsible() ? this.state.collapsed ? '+' : '-' : '';

  }

  async render() {
    await this.init();

    const output = [this.options.message];

    for (let i = 0; i < this.currentVisible; i++) {
      const item = this.nodes[(this.state.offset + i) % this.nodes.length];
      output.push(item.render());
    }

    output.push('', 'Max Offset: ' + this.state.maxOffset);
    this.print(output.join('\n'));
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

  home() {
    this.state.offset = 0;
    this.first();
  }

  end() {
    this.state.offset = this.nodes.length - this.currentVisible;
    this.last();
  }

  first() {
    this.state.index = 0;

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  last() {
    this.state.index = this.currentVisible - 1;

    if (!this.focused.isFocusable()) {
      this.up();
    }
  }

  up(key: Key) {
    if (this.state.index > 0) {
      this.state.index--;
    } else if (this.isScrollable()) {
      this.scroll_up(key);
    } else {
      this.rotate_up(key);
    }

    if (!this.focused.isFocusable()) {
      this.up();
    }
  }

  down(key: Key) {
    if (this.state.index < this.currentVisible - 1) {
      this.state.index++;
    } else if (this.isScrollable()) {
      this.scroll_down(key);
    } else {
      this.rotate_down(key);
    }

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  scroll_up(key: Key) {
    if (this.options.scroll !== false) {
      this.state.index--;

      if (this.state.index < 0) {
        this.last(key);

      } else if (!this.focused?.isFocusable()) {
        this.scroll_up(key);
      }
    } else {
      this.alert();
    }
  }

  scroll_down(key: Key) {
    if (this.options.scroll !== false) {
      this.state.index++;

      if (this.state.index > this.currentVisible - 1) {
        this.first(key);

      } else if (!this.focused?.isFocusable()) {
        this.scroll_down(key);
      }
    } else {
      this.alert();
    }
  }

  rotate_up(key: Key, n: number = 1) {
    if (this.options.rotate !== false) {
      this.state.offset = (this.state.offset - n + this.nodes.length) % this.nodes.length;

      if (!this.focused?.isFocusable()) {
        this.rotate_up(key);
      }
    } else {
      this.alert();
    }
  }

  rotate_down(key: Key, n: number = 1) {
    if (this.options.rotate !== false) {
      this.state.offset = (this.state.offset + n) % this.nodes.length;

      if (!this.focused?.isFocusable()) {
        this.rotate_down(key);
      }
    } else {
      this.alert();
    }
  }

  expand_up() {
    if (this.currentVisible > 1) {
      this.state.maxOffset--;
    }

    if (this.state.index >= this.currentVisible) {
      this.state.index = this.currentVisible - 1;
    }

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  expand_down() {
    if (this.currentVisible < this.nodes.length) {
      this.state.maxOffset++;
    }
  }

  visible() {
    const nodes = [];

    for (let i = 0; i < this.currentVisible; i++) {
      nodes.push(this.nodes[(this.state.offset + i) % this.nodes.length]);
    }

    return nodes;
  }

  isCollapsible() {
    return this.options.collapsible !== false && this.nodes.some(item => item.disabled);
  }

  isScrollable() {
    return this.options.scroll !== false && this.currentVisible > this.nodes.length - 1;
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
      (this.state.offset + this.currentVisible - 1) % this.nodes.length
    ];
  }

  get currentVisible() {
    return Math.max(1, Math.min(this.state.maxOffset + this.state.maxVisible, this.nodes.length));
  }

  get focused() {
    return this.nodes[(this.state.offset + this.state.index) % this.nodes.length];
  }
}

console.clear();
const prompt = new Prompt(options);

prompt.render();

emitKeypress({
  enableMouseEvents: true,
  hideCursor: true,
  keymap: [
    ...keycodes,
    { shortcut: 'meta+up', command: 'expand_up', weight: 1 },
    { shortcut: 'meta+down', command: 'expand_down', weight: 1 },
    { shortcut: 'return', command: 'submit', weight: 1 },
    { shortcut: 'ctrl+c', command: 'cancel', weight: 1 },
    { shortcut: 'space', command: 'toggle', weight: 1 }
  ],
  onKeypress: async (input, key, close) => {
    // console.log(key);
    // console.log(key);
    // console.log(key);
    // process.exit();

    if (prompt.dispatch(key)) {
      prompt.render();
      return;
    }

    if (key.shortcut === 'ctrl+c') {
      prompt.canceled = true;
      prompt.print(prompt.render());
      close();
    }

    if (input === '\r') {
      prompt.submitted = true;
      prompt.print(prompt.render());
      close();
    }
  }
});
