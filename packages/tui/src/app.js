import { emitKeypress } from 'emit-keypress';
import { Renderer } from './surface.js';
import { HelpScreen, PickerScreen, WorkspaceScreen } from './screens.js';
import { SlashCommands } from './SlashCommands.js';

const localModels = [
  {
    name: 'Inspector',
    description: 'Measure message length and word count',
    efforts: ['brief', 'detailed']
  },
  {
    name: 'Mirror',
    description: 'Return the submitted message',
    efforts: ['brief', 'detailed']
  }
];

function localReply(text, session) {
  const words = text.trim().split(/\s+/u).length;
  const length = Array.from(text).length;
  const detail = session.effort === 'detailed'
      ? '\n' + length + ' code points across ' + text.split('\n').length + ' lines.'
      : '';
  return ( (session.model === 'Mirror' ? text : words + (words === 1 ? ' word' : ' words')) + detail );
}

export class Application {
  constructor(options = {}) {
    this.input = options.input || process.stdin;
    this.output = options.output || process.stdout;
    this.title = options.title || 'Keypress Studio';
    this.showLogo = options.showLogo === true;
    this.workspace = options.workspace || process.cwd();
    this.models = options.models || localModels;
    this.model = this.models[0].name;
    this.effort = this.models[0].efforts[0];
    this.onSubmit = options.onSubmit || localReply;
    this.warnings = [...(options.warnings || [])];
    this.commands = options.commands instanceof SlashCommands
      ? options.commands
      : new SlashCommands(options.commands ?? undefined);
    this.channels = new Map([['Main', []]]);
    this.channel = 'Main';
    this.usage = { input: 0, output: 0 };
    this.screens = [options.screen || new WorkspaceScreen(options.components)];
    this.renderer = new Renderer(this.output, options.styles);
    this.invalidate = () => {
      if (this.session && !this.pending) {
        this.pending = setImmediate(() => {
          this.pending = null;
          this.renderer.draw(this.screens.at(-1), this);
        });
      }
    };
  }

  start() {
    if (this.session) {
      return this;
    }
    this.output.write('\x1b[?1049h\x1b[?7l');
    const restore = () => {
      clearImmediate(this.pending);
      this.pending = null;
      this.session = null;
      this.output.off('resize', this.invalidate);
      this.output.write('\x1b[0m\x1b[?7h\x1b[?25h\x1b[?1049l');
    };
    try {
      this.session = emitKeypress({
        input: this.input,
        output: this.output,
        enablePasteMode: true,
        keyboardProtocol: true,
        onKeypress: (input, key, close) => {
          if (key.name !== 'paste' && (key.shortcut === 'ctrl+c' || input === '\x03')) {
            close();
            return;
          }
          this.screens.at(-1).handle?.(input, key, this);
          this.invalidate();
        },
        onExit: restore
      });
      this.output.on('resize', this.invalidate);
      this.renderer.previous = [];
      this.renderer.draw(this.screens.at(-1), this);
    } catch (error) {
      if (this.session) {
        this.close();
      } else {
        restore();
      }
      throw error;
    }
    return this;
  }

  close() {
    this.session?.();
  }

  push(screen) {
    this.screens.push(screen);
    this.invalidate();
  }

  back() {
    if (this.screens.length > 1) {
      this.screens.pop();
      this.screens.at(-1).resume?.(false);
    }
    this.invalidate();
  }

  finish() {
    this.screens.splice(1);
    this.screens[0].resume?.(true);
    this.invalidate();
  }

  shortcuts() {
    this.push(new HelpScreen([
      { title: 'Compose', shortcuts: [
        ['/', 'Commands'],
        ['Enter', 'Submit or select'],
        ['Ctrl+J', 'New line'],
        ['Tab', 'Complete command']
      ] },
      { title: 'Session', shortcuts: [
        ['←', 'Conversations (empty input)'],
        ['F2', 'Warnings'],
        ['Ctrl+C', 'Quit']
      ] },
      { title: 'Navigation', shortcuts: [
        ['PgUp / PgDn', 'Scroll history'],
        ['↑ / ↓', 'Move in menu'],
        ['Esc', 'Dismiss menu']
      ] }
    ]));
  }

  showWarnings() {
    this.information(
      'Session warnings',
      this.warnings.length ? this.warnings : ['No warnings']
    );
  }

  history() {
    this.information(
      'Messages  /  ' + this.channel,
      this.messages.length
        ? this.messages.map(message => message.author + ' › ' + message.text)
        : ['No messages yet']
    );
  }

  agents() {
    const items = Array.from(this.channels.keys(), name => ({
      label: name,
      description: name === this.channel ? 'Current conversation' : '',
      run: () => {
        this.channel = name;
        this.finish();
      }
    }));

    items.push({
      label: '+ New conversation',
      run: () => {
        this.channel = 'Agent ' + this.channels.size;
        this.channels.set(this.channel, []);
        this.finish();
      }
    });

    this.push(new PickerScreen('Conversations', items));
  }

  async submit(text) {
    const messages = this.messages;
    const model = this.model;
    messages.push(Object.freeze({ author: 'You', text }));
    this.usage.input += Buffer.byteLength(text);
    this.invalidate();
    try {
      const reply = await this.onSubmit(text, {
        model,
        effort: this.effort,
        channel: this.channel,
        messages: messages.slice()
      });
      if (reply != null) {
        messages.push(Object.freeze({ author: model, text: String(reply) }));
        this.usage.output += Buffer.byteLength(String(reply));
      }
    } catch (error) {
      this.warnings.push(String(error.message || error));
    }
    this.invalidate();
  }

  information(title, lines) {
    const items = lines.map(label => ({ label, run: () => this.finish() }));
    this.push(new PickerScreen(title, items));
  }

  get messages() {
    return this.channels.get(this.channel);
  }
}
