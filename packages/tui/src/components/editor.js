import { glyphs, width } from '../surface.js';

export function layout(chars, columns) {
  const lines = [''];
  const positions = [];
  let x = 0;
  for (const glyph of chars) {
    const size = Math.min(width(glyph), columns);
    if (glyph !== '\n' && x + size > columns) {
      lines.push('');
      x = 0;
    }
    positions.push({ x, y: lines.length - 1 });
    if (glyph === '\n') {
      lines.push('');
      x = 0;
    } else {
      lines[lines.length - 1] += glyph;
      x += size;
    }
  }
  if (x === columns) {
    lines.push('');
    x = 0;
  }
  positions.push({ x, y: lines.length - 1 });
  return { lines, positions };
}

export class Prompt {
  render(frame, y) {
    frame.text(0, y, ' ›', 'editor');
  }
}

export class InputDecoration {
  render(frame, y) {
    frame.band(y, 'editor');
  }
}

export class Editor {
  constructor(prompt = new Prompt(), decoration = new InputDecoration()) {
    this.prompt = prompt;
    this.decoration = decoration;
    this.set('');
  }

  set(value) {
    this.chars = glyphs(value);
    this.index = this.chars.length;
  }

  insert(value) {
    const start = this.chars.slice(0, this.index).join('') + value;
    const tail = this.chars.slice(this.index).join('');
    this.set(start + tail);
    this.index = glyphs(start).length;
  }

  handle(input, key) {
    const name = key.shortcut || key.name;
    if (key.name === 'paste') {
      this.insert(input);
    } else if (name === 'left') {
      this.index = Math.max(0, this.index - 1);
    } else if (name === 'right') {
      this.index = Math.min(this.chars.length, this.index + 1);
    } else if (name === 'backspace' && this.index) {
      this.chars.splice(--this.index, 1);
    } else if (name === 'delete') {
      this.chars.splice(this.index, 1);
    } else if (name === 'shift+return' || name === 'ctrl+j' || input === '\n') {
      this.insert('\n');
    } else if (['up', 'down', 'home', 'end'].includes(name)) {
      const points = this.view.positions;
      const here = points[this.index];
      const y = here.y + Number(name === 'down') - Number(name === 'up');
      const x = name === 'home' ? 0 : name === 'end' ? Infinity : here.x;
      const first = points.findIndex(point => point.y === y);
      if (first >= 0) {
        this.index = first;
        while (points[this.index + 1]?.y === y && points[this.index + 1].x <= x) {
          this.index++;
        }
      }
    } else if (!key.ctrl && !key.meta && !/[\x00-\x1f\x7f-\x9f]/.test(input)) {
      this.insert(input);
    }
  }

  prepare(columns) {
    this.view = layout(this.chars, Math.max(1, columns - 3));
    return this.view.lines.length;
  }

  render(frame, y, height, command) {
    if (frame.height > 7) {
      this.decoration.render(frame, y - 1);
      frame.band(y + height, 'editor');
    }
    const { lines, positions } = this.view;
    const point = positions[this.index];
    const offset = Math.max(0, point.y - height + 1);
    for (let i = 0; i < height; i++) {
      frame.band(y + i, 'editor');
      frame.text(3, y + i, lines[offset + i] || '', 'editor');
    }
    if (command) {
      const label = glyphs(command);
      for (let i = 0; i < label.length; i++) {
        const position = positions[i];
        if (position.y >= offset && position.y < offset + height) {
          frame.text(3 + position.x, y + position.y - offset, label[i], 'command');
        }
      }
    }
    if (!offset) {
      this.prompt.render(frame, y);
    }
    if (!this.chars.length) {
      frame.text(3, y, 'Write a message or type /', 'ghost');
    }
    frame.cursor = { x: Math.min(frame.width - 1, 3 + point.x), y: y + point.y - offset };
  }

  get value() {
    return this.chars.join('');
  }
}
