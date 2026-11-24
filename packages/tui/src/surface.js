const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export function glyphs(text) {
  return Array.from(segmenter.segment(String(text)), part => part.segment);
}

export function width(glyph) {
  if (/^[\p{Mark}\p{Cf}]+$/u.test(glyph)) {
    return 0;
  }
  if (
    /\p{Emoji_Presentation}|\uFE0F|[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFF01-\uFF60\u{20000}-\u{3FFFD}]/u.test(
      glyph
    )
  ) {
    return 2;
  }
  return 1;
}

export const palette = {
  black: 16,
  charcoal: 235,
  graphite: 236,
  slate: 237,
  gray: 246,
  white: 255,
  mint: 115,
  teal: 30,
  amber: 215
};

function style(foreground, background, bold = false) {
  const codes = [38, 5, foreground];

  if (background !== undefined) {
    codes.push(48, 5, background);
  }

  if (bold) {
    codes.push(1);
  }

  return codes.join(';');
}

export const theme = {
  base: '0',
  title: style(palette.mint, undefined, true),
  muted: style(palette.gray),
  accent: style(palette.mint),
  panel: style(palette.white, palette.slate),
  panelTitle: style(palette.white, palette.slate, true),
  panelDescription: style(palette.gray, palette.slate),
  panelIndicator: style(palette.mint, palette.slate),
  panelFooter: style(palette.gray, palette.charcoal),
  panelFooterKey: style(palette.white, palette.charcoal, true),
  selected: style(palette.black, palette.teal, true),
  selectedDescription: style(palette.black, palette.teal),
  editor: style(palette.white, palette.graphite),
  command: style(palette.mint, palette.graphite),
  ghost: style(palette.gray, palette.graphite),
  warning: style(palette.amber)
};

export class Surface {
  constructor(columns, rows, styles) {
    this.width = columns;
    this.height = rows;
    this.styles = styles;
    this.rows = Array.from({ length: rows }, () => Array(columns).fill(null));
    this.cursor = null;
  }

  text(x, y, value, style = 'base', limit = this.width - x) {
    const row = this.rows[y];
    if (!row || x < 0) {
      return;
    }

    const end = Math.min(this.width, x + limit);

    for (const glyph of glyphs(String(value).replace(/[\x00-\x1f\x7f-\x9f]/g, ' '))) {
      const size = width(glyph);
      if (!size) {
        continue;
      }

      if (x + size > end) {
        break;
      }

      if (row[x] === false) {
        row[x - 1] = null;
      }

      if (row[x + size] === false) {
        row[x + size] = null;
      }

      row[x++] = [glyph, style];

      if (size === 2) {
        row[x++] = false;
      }
    }
  }

  band(y, style) {
    this.text(0, y, ' '.repeat(this.width), style);
  }

  line(row) {
    let end = row.length;

    while (end && row[end - 1] === null) {
      end--;
    }

    let previous = 'base';
    let output = '';

    for (let x = 0; x < end; x++) {
      if (row[x] === false) {
        continue;
      }

      const [glyph, style] = row[x] || [' ', 'base'];
      if (style !== previous) {
        const sgr = this.styles[style] || '0';
        output += '\x1b[0;' + (/^[0-9;]+$/.test(sgr) ? sgr : '0') + 'm';
        previous = style;
      }

      output += glyph;
    }

    return output + '\x1b[0m' + (end < row.length ? '\x1b[K' : '');
  }
}

export class Renderer {
  constructor(output, styles) {
    this.output = output;
    this.styles = { ...theme, ...styles };
    this.previous = [];
  }

  draw(screen, app) {
    const frame = new Surface(
      this.output.columns || 80,
      this.output.rows || 24,
      this.styles
    );

    screen.render(frame, app);

    let patch = '';

    for (let y = 0; y < frame.height; y++) {
      const line = frame.line(frame.rows[y]);
      if (this.columns !== frame.width || this.previous[y] !== line) {
        patch += '\x1b[' + (y + 1) + ';1H' + line;
        this.previous[y] = line;
      }
    }

    this.columns = frame.width;
    this.previous.length = frame.height;
    const cursor = frame.cursor
      ? '\x1b[' + (frame.cursor.y + 1) + ';' + (frame.cursor.x + 1) + 'H\x1b[?25h'
      : '\x1b[?25l';

    if (patch || cursor !== this.cursor) {
      this.output.write(patch + cursor);
      this.cursor = cursor;
    }
  }
}
