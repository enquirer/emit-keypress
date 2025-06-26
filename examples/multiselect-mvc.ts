import type { Key } from 'node:readline';
import colors from 'ansi-colors';
import { emitKeypress } from '../index';
import { keycodes } from '~/keycodes';
import { Choice, SelectModel, SelectView, Select } from './select-mvc';

const { green, cyan, dim } = colors;

const options = {
  name: 'fruit',
  message: 'Like fruit?',
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
  ]
};

class CheckboxModel {
  name: string;
  disabled: boolean;
  selected: boolean;

  constructor(control: Checkbox) {
    this.name = control.name;
    this.disabled = control.disabled;
    this.selected = control.selected;
  }
}

class CheckboxView {
  private control: Checkbox;
  private model: CheckboxModel;

  constructor(control: Checkbox) {
    this.control = control;
    this.model = this.control.model;
  }

  render() {
    return this.pointer() + ' ' + this.indicator() + ' ' + this.message();
  }

  pointer() {
    return this.control.active ? cyan('❯') : ' ';
  }

  indicator() {
    return this.model.selected ? green('✓') : dim.gray('✓');
  }

  message() {
    const color = this.control.active ? cyan.underline : v => v;
    return this.model.disabled
      ? dim(`${this.model.name} (disabled)`)
      : color(this.model.name);
  }
}

class Checkbox extends Choice {
  static Model = CheckboxModel;
  static View = CheckboxView;
  selected: boolean;

  constructor(
    options: { name: string; disabled?: boolean; selected?: boolean },
    parent: Select
  ) {
    super(options, parent);
    this.selected = options.selected ?? false;
    this.model = new Checkbox.Model(this);
    this.view = new Checkbox.View(this);
  }

  render() {
    return this.view.render();
  }

  toggle() {
    this.selected = !this.selected;
    this.model.selected = this.selected;
  }
}

class MultiSelectModel extends SelectModel {
  static Option = Checkbox;

  get selected() {
    return this.nodes.filter(node => node.selected).map(node => node.name);
  }
}

class MultiSelectView extends SelectView {
  footer() {
    const selected = this.model.selected;
    const output = [];

    if (selected.length > 0) {
      output.push('');
      output.push(`Selected: ${selected.join(', ')}`);
    }

    output.push(super.footer());
    return output.join('\n');
  }
}

class MultiSelect extends Select {
  model: MultiSelectModel;
  view: MultiSelectView;

  constructor(options: any) {
    super(options);
    this.model = new MultiSelectModel(options, this);
    this.view = new MultiSelectView(this);

    if (!this.focused.isFocusable()) {
      this.down();
    }
  }

  toggle() {
    return this.focused.toggle();
  }

  get selected() {
    return this.model.selected;
  }
}

const prompt = new MultiSelect(options);

const print = (output: string = '') => {
  // console.clear();
  console.log(output);
};

prompt.render().then(v => print(v));

emitKeypress({
  enableMouseEvents: true,
  hideCursor: true,
  keymap: [
    ...keycodes,
    { shortcut: 'meta+up', command: 'show_less', weight: 1 },
    { shortcut: 'meta+down', command: 'show_more', weight: 1 },
    { shortcut: 'meta+b', command: 'page_left', weight: 1 },
    { shortcut: 'meta+f', command: 'page_right', weight: 1 },
    { shortcut: 'return', command: 'submit', weight: 1 },
    { shortcut: 'ctrl+c', command: 'cancel', weight: 1 },
    { shortcut: 'space', command: 'toggle', weight: 1 }
  ],
  onKeypress: async (input, key, close) => {
    console.log(key);

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

      console.log(prompt.selected);
    }
  }
});
