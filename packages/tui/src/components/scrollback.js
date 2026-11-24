import { glyphs } from '../surface.js';
import { layout } from './editor.js';

export class Message {
  lines(message, columns) {
    const { lines } = layout(glyphs(message.author + ' › ' + message.text), columns);
    return lines;
  }
}

export class Scrollback {
  constructor(message = new Message()) {
    this.message = message;
    this.cache = new WeakMap();
    this.offset = 0;
  }

  scroll(delta) {
    this.offset = Math.max(0, Math.min(this.maximum || 0, this.offset + delta));
  }

  render(f, top, height, messages) {
    const columns = Math.max(1, f.width - 2);
    const groups = [];
    let count = 0;
    for (const message of messages) {
      let entry = this.cache.get(message);
      if (!entry || entry.columns !== columns) {
        entry = { columns, lines: this.message.lines(message, columns) };
        this.cache.set(message, entry);
      }
      groups.push(entry.lines);
      count += entry.lines.length;
    }

    this.maximum = Math.max(0, count - height);
    this.scroll(0);
    let y = top - Math.max(0, this.maximum - this.offset);

    for (const lines of groups) {
      if (y >= top + height) { break; }
      if (y + lines.length > top) {
        for (let i = Math.max(0, top - y); i < Math.min(lines.length, top + height - y); i++) {
          f.text(1, y + i, lines[i]);
        }
      }
      y += lines.length;
    }
  }
}
