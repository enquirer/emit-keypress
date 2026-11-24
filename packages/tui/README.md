# Keypress Studio

Launch the terminal workspace from the repository root with `tsx packages/tui/cli.js`. The default session processes messages locally. Inspector counts words and Mirror returns your message. Use `/model` to change the processor and its level of detail.

Type `/` for commands, use the arrow keys to highlight a match, and press Enter to select it. Tab completes a command. Escape dismisses the command list or returns to the previous screen. The editor accepts multiline paste and Ctrl+J inserts a newline. Page Up and Page Down scroll the conversation. Press F2 to review warnings, or Ctrl+C to close the terminal session.

## Customize the workspace

```js
import { Application, SlashCommand, SlashCommands } from './packages/tui/index.js';

const commands = new SlashCommands();
commands.register(new SlashCommand('about', 'Show workspace details', app => {
  app.information('Review desk', ['Interactive review session']);
}));

const app = new Application({
  title: 'Review desk',
  styles: { title: '1;36', selected: '30;46' },
  components: {
    emblem: {
      render(frame, top, height) {
        if (height > 0) {
          frame.text(2, top + Math.floor(height / 2), 'Ready for review', 'accent');
        }
      }
    }
  },
  commands
});

app.start();
```

Workspace slots are `header`, `emblem`, `scrollback`, `slash`, `editor`, and `footer`. Each default component is exported. Composite components accept their child components in their constructors. For example, Footer accepts a status bar, shortcut hints, and a warning badge. Theme values are ANSI SGR parameters.

## Screens and message handlers

Pass a root `screen` to Application or call `app.push(screen)` to open another screen. A screen implements `render(frame, app)` and optionally `handle(input, key, app)`. Draw using zero-based coordinates with `frame.text(x, y, text, style)` or `frame.band(y, style)`. Set `frame.cursor = { x, y }` for a visible insertion point. Call `app.back()` to return and `app.invalidate()` after asynchronous state changes.

Supply `models` as an array of objects with a name, description, and a nonempty list of efforts. Supply `onSubmit(text, { model, effort, channel, messages })` to connect a processor. Return a string or a promise for the reply. Rejected submissions appear in the warnings panel. Usage counts measure UTF-8 bytes. Conversations live in memory for the session.
