import type { Key } from 'node:readline';
import colors from 'ansi-colors';
import { emitKeypress } from '../index';
import { keycodes } from '~/keycodes';

const { cyan, dim } = colors;

export const options = {
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

export class Choice {
  name: string;
  disabled: boolean;
  parent: Select;

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

export class SelectModel {
  static Option = Choice;

  constructor(
    options: {
      nodes: { name: string; disabled?: boolean }[];
      maxVisible?: number;
      index?: number;
    },
    parent: Select
  ) {
    this.options = { cycle: true, scroll: true, ...options };
    this.collapsed = false;
    this.maxVisible = options.maxVisible || 7;
    this.index = options.index || 0;
    this.nodes = options.nodes.map(item => new SelectModel.Option(item, parent));
    this.append = [];
    this.adjustment = 0;
    this.offset = 0;

    if (!this.nodes.some(item => item.isFocusable())) {
      throw new Error('At least one item must be focusable');
    }
  }

  visible() {
    const nodes = [];

    for (let i = 0; i < this.pageSize; i++) {
      nodes.push(this.nodes[(this.offset + i) % this.nodes.length]);
    }

    return nodes;
  }

  isScrollable() {
    return this.options.cycle !== false && this.pageSize > this.nodes.length - 1;
  }

  isCollapsible() {
    return this.options.collapsible !== false && this.nodes.some(item => item.disabled);
  }

  get pageSize() {
    return Math.max(1, Math.min(this.adjustment + this.maxVisible, this.nodes.length));
  }

  get focused() {
    return this.nodes[(this.offset + this.index) % this.nodes.length];
  }

  get range(): [number, number] {
    return [this.offset, (this.offset + this.pageSize - 1) % this.nodes.length];
  }
}

export class SelectView {
  private control: Select;
  private model: SelectModel;

  constructor(control: Select) {
    this.control = control;
    this.model = this.control.model;
  }

  header() {
    return this.model.options.message;
  }

  body() {
    const items = this.model.visible();
    return items.map(item => item.render()).join('\n');
  }

  footer() {
    const output = [];
    const start = this.model.offset + 1;
    const end = Math.min(
      this.model.offset + this.model.pageSize,
      this.model.nodes.length
    );

    const remaining = Math.max(0, this.model.nodes.length - this.model.pageSize) - this.model.offset;

    output.push('');
    output.push(['', 'Showing', start, 'to', end, 'of', this.model.nodes.length].join(' '));
    output.push(['', 'Offset:', this.model.offset].join(' '));
    output.push(['', 'Adjustment:', this.model.adjustment].join(' '));
    output.push(['', 'Remaining Items:', remaining].join(' '));
    return output.join('\n');
  }

  input() {
    return this.model.append.join('\n');
  }

  render() {
    const output = [this.header()];
    output.push(this.body());
    output.push(this.footer());
    output.push('');
    output.push(this.input());
    this.model.append = [];
    return output.join('\n');
  }
}

export class Select {
  model: SelectModel;
  view: SelectView;
  canceled?: boolean;
  submitted?: boolean;

  constructor(options: {
    nodes: { name: string; disabled?: boolean }[];
    maxVisible?: number;
    index?: number;
  }) {
    this.model = new SelectModel(options, this);
    this.view = new SelectView(this);

    if (!this.focused.isFocusable()) {
      this.down();
    }
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
    if (this.model.isCollapsible()) {
      this.model.collapsed = !this.model.collapsed;
    } else {
      this.alert();
    }
  }

  collapse() {
    this.model.collapsed = true;
  }

  expand() {
    this.model.collapsed = false;
  }

  focus(index: number) {
    this.model.index = Math.max(0, Math.min(index, this.model.nodes.length - 1));
  }

  home() {
    this.model.offset = 0;
    this.first();
  }

  end() {
    this.model.offset = Math.max(0, this.model.nodes.length - this.model.pageSize);
    this.last();
  }

  first() {
    this.model.index = 0;

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  last() {
    this.model.index = this.model.pageSize - 1;

    if (!this.focused.isFocusable()) {
      this.up();
    }
  }

  up(key?: Key) {
    if (this.model.index > 0) {
      this.model.index--;
    } else if (this.model.isScrollable()) {
      this.cycle_up(key);
    } else {
      this.scroll_up(key);
    }

    if (!this.focused.isFocusable()) {
      this.up();
    }
  }

  down(key?: Key) {
    if (this.model.index < this.model.pageSize - 1) {
      this.model.index++;
    } else if (this.model.isScrollable()) {
      this.cycle_down(key);
    } else {
      this.scroll_down(key);
    }

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  cycle_up(key?: Key) {
    if (this.model.options.cycle !== false) {
      this.model.append.push('cycle_up');
      this.model.index--;

      if (this.model.index < 0) {
        this.last(key);
      } else if (!this.focused?.isFocusable()) {
        this.cycle_up(key);
      }
    } else {
      this.alert();
    }
  }

  cycle_down(key?: Key) {
    if (this.model.options.cycle !== false) {
      this.model.append.push('cycle_down');
      this.model.index++;

      if (this.model.index > this.model.pageSize - 1) {
        this.first(key);
      } else if (!this.focused?.isFocusable()) {
        this.cycle_down(key);
      }
    } else {
      this.alert();
    }
  }

  scroll_up(key?: Key, n: number = 1) {
    if (this.model.options.scroll !== false) {
      this.model.append.push('scroll_up');
      this.model.offset =
        (this.model.offset - n + this.model.nodes.length) % this.model.nodes.length;

      if (!this.focused?.isFocusable()) {
        this.scroll_up(key);
      }
    } else {
      this.alert();
    }
  }

  scroll_down(key?: Key, n: number = 1) {
    if (this.model.options.scroll !== false) {
      this.model.append.push('scroll_down');
      this.model.offset = (this.model.offset + n) % this.model.nodes.length;

      if (!this.focused?.isFocusable()) {
        this.scroll_down(key);
      }
    } else {
      this.alert();
    }
  }

  page_left() {
    if (this.model.offset > 0) {
      this.scroll_up(null, Math.min(this.model.pageSize, this.model.offset));
    } else {
      this.alert();
    }
  }

  page_right() {
    const remaining = Math.max(0, this.model.nodes.length - (this.model.offset + this.model.pageSize));
    const offset = this.model.nodes.length - remaining;

    if (offset > 0) {
      this.scroll_down(null, Math.min(this.model.pageSize, offset));
    } else {
      this.alert();
    }
  }

  show_less() {
    if (this.model.pageSize > 1) {
      this.model.adjustment--;
    }

    if (this.model.index >= this.model.pageSize) {
      this.model.index = this.model.pageSize - 1;
    }

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  show_more() {
    if (this.model.pageSize < this.model.nodes.length) {
      this.model.adjustment++;
    }
  }

  async render() {
    return this.view.render();
  }

  isFocusable() {
    return this.focused.disabled !== true;
  }

  alert() {
    process.stdout.write('\u0007');
  }

  get focused() {
    return this.model.focused;
  }
}

// console.clear();
// const prompt = new Select(options);

// const print = (output: string = '') => {
//   console.clear();
//   console.log(output);
// };

// prompt.render().then(v => print(v));

// emitKeypress({
//   enableMouseEvents: true,
//   hideCursor: true,
//   keymap: [
//     ...keycodes,
//     { shortcut: 'meta+up', command: 'show_less', weight: 1 },
//     { shortcut: 'meta+down', command: 'show_more', weight: 1 },
//     { shortcut: 'meta+b', command: 'page_left', weight: 1 },
//     { shortcut: 'meta+f', command: 'page_right', weight: 1 },
//     { shortcut: 'return', command: 'submit', weight: 1 },
//     { shortcut: 'ctrl+c', command: 'cancel', weight: 1 },
//     { shortcut: 'space', command: 'toggle', weight: 1 }
//   ],
//   onKeypress: async (input, key, close) => {
//     if (prompt.dispatch(key)) {
//       print(await prompt.render());
//       return;
//     }

//     if (key.shortcut === 'ctrl+c') {
//       prompt.canceled = true;
//       print(await prompt.render());
//       close();
//     }

//     if (input === '\r') {
//       prompt.submitted = true;
//       print(await prompt.render());
//       await close();

//       console.log(prompt.focused.name);
//     }
//   }
// });
