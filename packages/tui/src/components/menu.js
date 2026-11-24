export class MenuRow {
  constructor(numbered = false) {
    this.numbered = numbered;
  }

  render(f, y, item, selected, labelWidth) {
    let style = this.numbered ? 'panel' : 'base';
    let descriptionStyle = this.numbered ? 'panelDescription' : 'muted';
    if (selected) {
      style = 'selected';
      descriptionStyle = 'selectedDescription';
    }

    const labelX = this.numbered ? 2 : 3;
    const descriptionX = labelWidth + (this.numbered ? 4 : 6);
    f.band(y, style);
    f.text(this.numbered ? 0 : 1, y, selected ? '›' : '', style);
    f.text(labelX, y, item.label, style, labelWidth);
    f.text(descriptionX, y, item.description || '', descriptionStyle);
  }
}

export class Menu {
  constructor(row = new MenuRow()) {
    this.row = row;
    this.index = 0;
    this.offset = 0;
  }

  move(delta, count) {
    this.index = Math.max(0, Math.min(count - 1, this.index + delta));
  }

  render(f, y, height, items) {
    this.move(0, items.length);
    this.offset = Math.max(
      0,
      Math.min(
        this.index,
        Math.max(this.offset, this.index - height + 1),
        items.length - height
      )
    );

    let columns = 0;
    for (const item of items) {
      columns = Math.max(columns, item.label.length);
    }

    columns = Math.min(columns, f.width < 40 ? f.width - 3 : Math.floor(f.width / 2));
    items.slice(this.offset, this.offset + height).forEach((item, i) => {
      this.row.render(f, y + i, item, this.offset + i === this.index, columns);
    });
  }
}

export class Panel {
  render(f, y, title) {
    f.band(y, 'panel');
    f.text(2, y, title, 'panelTitle');
  }
}

export class SlashCommands {
  constructor(menu = new Menu()) {
    this.menu = menu;
    this.dismissed = null;
  }

  matches(app, value) {
    if (!/^\/[^\s]*$/.test(value) || this.dismissed === value) {
      return [];
    }
    return app.commands.matching(value);
  }
}

export class ScrollIndicator {
  render(f, y, menu, items, height) {
    const above = menu.offset > 0 ? '↑ ' : '';
    const below = menu.offset + height < items.length ? '↓ ' : '';
    f.band(y, 'panel');
    f.text(0, y, above + below, 'panelIndicator');
  }
}
