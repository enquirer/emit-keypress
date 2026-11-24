export class Brand {
  render(f, app) {
    f.text(1, 0, '◇  ' + app.title, 'title');
  }
}

export class Workspace {
  render(f, app) {
    f.text(4, 1, app.workspace, 'muted');
  }
}

export class Header {
  constructor(brand = new Brand(), workspace = new Workspace()) {
    this.brand = brand;
    this.workspace = workspace;
  }

  render(f, app) {
    this.brand.render(f, app);
    this.workspace.render(f, app);
  }
}

export class Emblem {
  render(f, top, height) {
    const art = ['⣰⣶⣆', '⣠⠞   ⠳⣄', '⣠⠞       ⠳⣄', '⟨     ◇     ⟩', '⠙⢦       ⡴⠋', '⠙⢦   ⡴⠋', '⠙⠿⠋'];
    if (height < art.length || f.width < 13) { return; }
    const y = top + Math.floor((height - art.length) / 2);
    art.forEach((line, i) => f.text(Math.floor((f.width - line.length) / 2), y + i, line, 'muted'));
  }
}

export class StatusBar {
  render(f, y, app) {
    const segments = [
      app.channel,
      app.model,
      app.effort,
      app.workspace,
      app.messages.length + ' messages',
      app.usage.input + ' B in',
      app.usage.output + ' B out'
    ];

    f.text(3, y, segments.join(' · '), 'muted');
  }
}

export class ShortcutHints {
  render(f, y, text = '/ commands  ? keys  ← agents', x = 1) {
    f.text(x, y, text, 'accent');
  }
}

export class PanelHints {
  render(f, y, text, x = 1) {
    f.band(y, 'panelFooter');
    f.text(x, y, text, 'panelFooter');
    for (const match of text.matchAll(/\S+(?= (?:select|back|scroll)\b)/g)) {
      f.text(x + match.index, y, match[0], 'panelFooterKey');
    }
  }
}

export class WarningBadge {
  render(f, y, app) {
    if (app.warnings.length) {
      const label = ' ⚠ ' + app.warnings.length + '  F2 ';
      f.text(Math.max(0, f.width - label.length), y, label, 'warning');
    }
  }
}

export class Footer {
  constructor(status = new StatusBar(), hints = new ShortcutHints(), warnings = new WarningBadge()) {
    Object.assign(this, { status, hints, warnings });
    this.bottomRowVisible = false;
  }

  render(f, app) {
    this.status.render(f, f.height - 2, app);
    if (!this.bottomRowVisible) { return; }
    this.hints.render(f, f.height - 1, undefined, 3);
    this.warnings.render(f, f.height - 1, app);
  }
}
