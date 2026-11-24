import { Editor } from './components/editor.js';
import { Header, Emblem, Footer, PanelHints } from './components/chrome.js';
import { Scrollback } from './components/scrollback.js';
import { ShortcutPanel } from './components/shortcut-panel.js';
import { Menu, MenuRow, Panel, ScrollIndicator, SlashCommands } from './components/menu.js';

function isEscape(input, key) {
  return (
    key.name === 'escape' ||
    key.name === 'esc' ||
    (key.name !== 'paste' && input === '\x1b')
  );
}

export class PickerScreen {
  constructor(title, items, options = {}) {
    Object.assign(
      this,
      {
        title,
        items,
        menu: new Menu(new MenuRow(true)),
        panel: new Panel(),
        hints: new PanelHints(),
        indicator: new ScrollIndicator()
      },
      options
    );
  }

  render(f) {
    const height = Math.max(0, Math.min(8, this.items.length, f.height - 3));
    const firstRow = f.height - height - 2;
    const padding = Math.min(3, Math.max(0, firstRow - 1));
    const top = firstRow - padding - 1;
    for (let y = top; y < firstRow; y++) {
      f.band(y, 'panel');
    }

    this.panel.render(f, top + Number(padding >= 2), this.title);
    const rows = this.items.map((item, i) => ({ ...item, label: (i + 1) + '. ' + item.label }));
    this.menu.render(f, firstRow, height, rows);
    this.indicator.render(f, f.height - 2, this.menu, this.items, height);
    this.hints.render(f, f.height - 1, 'enter select · esc back', 2);
  }

  handle(input, key, app) {
    if (isEscape(input, key)) {
      app.back();
    } else if (key.name === 'up' || key.name === 'down') {
      this.menu.move(key.name === 'up' ? -1 : 1, this.items.length);
    } else if (input === '\r' || key.name === 'return') {
      this.items[this.menu.index]?.run(app);
    }
  }
}

export class HelpScreen {
  constructor(groups) {
    this.panel = new ShortcutPanel(groups);
    this.hints = new PanelHints();
  }

  render(f, app) {
    app.screens[0].render(f, app, this.panel);
    this.hints.render(f, f.height - 1, 'Press any key to close');
  }

  handle(input, key, app) {
    if (isEscape(input, key)) {
      app.back();
    } else {
      app.finish();
      app.screens[0].editor.handle(input, key);
    }
  }
}

export class WorkspaceScreen {
  constructor(parts = {}) {
    Object.assign(
      this,
      {
        header: new Header(),
        footer: new Footer(),
        emblem: new Emblem(),
        editor: new Editor(),
        scrollback: new Scrollback(),
        slash: new SlashCommands()
      },
      parts
    );
  }

  render(f, app, shortcutPanel) {
    this.header.render(f, app);
    const bottom = Math.max(1, f.height - 2 - Number(f.height > 7));
    const height = Math.min( this.editor.prepare(f.width), Math.max(1, Math.floor(bottom / 3)) );
    const y = bottom - height;
    const editorTop = y - Number(f.height > 7);
    const matches = this.slash.matches(app, this.editor.value);
    const rows = Math.max(0, Math.min(8, matches.length, editorTop - 2));
    const available = Math.max(0, editorTop - rows - 3);

    if (shortcutPanel) {
      shortcutPanel.render(f, editorTop);
    } else if (app.messages.length) {
      this.scrollback.render(f, 3, available, app.messages);
    } else if (app.showLogo && !matches.length) {
      this.emblem.render(f, 3, available);
    }

    if (!shortcutPanel) {
      this.slash.menu.render(f, editorTop - rows, rows, matches);
    }
    this.editor.render(f, y, height, this.completedCommand?.label);
    this.footer.render(f, app);
  }

  handle(input, key, app) {
    const value = this.editor.value;
    const matches = this.slash.matches(app, value);
    const menu = this.slash.menu;
    if (key.name === 'f2') {
      app.showWarnings();
    } else if (input === '?' && key.name !== 'paste' && !value) {
      app.shortcuts();
    } else if (key.name === 'left' && !value) {
      app.agents();
    } else if (key.name === 'pageup' || key.name === 'pagedown') {
      this.scrollback.scroll(
        (key.name === 'pageup' ? 1 : -1) * Math.max(1, (app.output.rows || 24) - 7)
      );
    } else if (matches.length && ['up', 'down'].includes(key.name)) {
      menu.move(key.name === 'up' ? -1 : 1, matches.length);
    } else if (matches.length && isEscape(input, key)) {
      this.slash.dismissed = value;
    } else if (matches.length && key.name === 'tab') {
      this.completedCommand = matches[menu.index];
      this.editor.set(this.completedCommand.label + ' ');
    } else if (
      key.name !== 'paste' &&
      (input === '\r' || key.shortcut === 'return' || key.name === 'return') &&
      !key.shift &&
      !key.ctrl
    ) {
      const command = matches[menu.index] || (
        this.completedCommand?.label === value.trimEnd() && this.completedCommand
      );
      if (command) {
        command.run(app);
        if (app.screens.at(-1) !== this) {
          this.pendingCommand = true;
          return;
        }
      } else if (value.trim()) {
        app.submit(value);
      }
      this.clearInput();
    } else {
      this.editor.handle(input, key);
      if (this.editor.value !== value) {
        if (this.completedCommand && !this.editor.value.startsWith(this.completedCommand.label + ' ')) {
          this.completedCommand = null;
        }
        menu.index = 0;
        this.slash.dismissed = null;
      }
    }
  }

  resume(completed) {
    if (completed && this.pendingCommand) {
      this.clearInput();
    }
    this.pendingCommand = false;
  }

  clearInput() {
    this.editor.set('');
    this.scrollback.offset = 0;
    this.completedCommand = null;
    this.slash.menu.index = 0;
    this.slash.dismissed = null;
  }
}
