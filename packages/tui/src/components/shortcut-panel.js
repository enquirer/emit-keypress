import { Panel } from './menu.js';

export class ShortcutPanel extends Panel {
  constructor(groups) {
    super();
    this.groups = groups;
    this.offset = 0;
    this.maxOffset = 0;
  }

  scroll(delta) {
    this.offset = Math.max(0, Math.min(this.offset + delta, this.maxOffset));
  }

  render(f, bottom) {
    const cells = [];
    let x = 2;
    let row = 0;
    let nextRow = 0;
    for (const { title, shortcuts } of this.groups) {
      const keyWidth = Math.max(...shortcuts.map(([key]) => key.length));
      const labelWidth = Math.max(...shortcuts.map(([, label]) => label.length));
      const width = Math.max(title.length, keyWidth + 2 + labelWidth);
      if (x > 2 && x + width > f.width - 1) {
        x = 2;
        row = nextRow + 1;
      }

      cells.push([x, row, title, 'panelTitle']);
      for (const [i, [key, label]] of shortcuts.entries()) {
        cells.push([x, row + i + 1, key, 'panelIndicator']);
        cells.push([x + keyWidth + 2, row + i + 1, label, 'panel']);
      }

      x += width + 4;
      nextRow = Math.max(nextRow, row + shortcuts.length + 1);
    }

    const height = Math.max(0, Math.min(nextRow, bottom - 1));
    this.maxOffset = nextRow - height;
    this.scroll(0);
    const gap = Number(bottom > height + 1);
    const top = bottom - height - 1 - gap;
    super.render(f, top, 'Keyboard shortcuts');

    for (let y = top + 1; y < bottom; y++) {
      f.band(y, 'panel');
    }

    for (const [column, line, value, style] of cells) {
      const visible = line - this.offset;
      if (visible >= 0 && visible < height) {
        f.text(column, top + gap + 1 + visible, value, style);
      }
    }
  }
}
