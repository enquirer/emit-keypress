# Pulsar

## Keybindings

Pulsar keybindings are selector-scoped keymaps written in `CSON` or `JSON`. The top-level keys are CSS selectors such as `atom-text-editor` or `.tree-view`, and each selector maps one or more keystrokes or key sequences to command names or directive values.

### tl;dr

- Modifiers: Pulsar uses lowercase names such as `ctrl`, `cmd`, `alt`, and `shift`, plus special key names like `enter`, `escape`, `backspace`, and `left`.
- Shortcuts: A single keybinding is written as a dash-separated key combination such as `ctrl-shift-k` or `cmd-left`.
- Chords: Multi-step bindings are supported as space-separated key sequences such as `ctrl-k ctrl-d`.
- Conditions: Bindings are scoped by CSS selectors.
- Args: Keymap entries only map keystrokes to command names or directives; there is no first-class `args` field in the keymap format.
- Platform: Pulsar does not document a dedicated per-binding `platform` property in keymap entries; platform differences are typically expressed by writing platform-appropriate bindings or loading different keymap files.
- Removal: Use `unset!` to remove a matching binding and continue searching upward, or `abort!` to stop keybinding resolution for that keystroke.
- Extension bindings: Packages contribute commands with `atom.commands.add(...)` and keybindings through files in `keymaps/` or the `keymaps` array in `package.json`.
- Other features: `native!` forces Chromium's native key handling, selectors use CSS specificity and cascade rules, and `atom.keymaps.addKeystrokeResolver(...)` can remap how Pulsar interprets raw keyboard events.

### Keymap shape

```ts
type PulsarKeymap = {
  [selector: string]: {
    [keystrokeOrSequence: string]: string
  }
}
```

In practice, the string value is usually a command name such as `editor:newline` or `my-package:toggle`, but Pulsar also supports directive values such as `unset!`, `abort!`, and `native!`.

### User keybinding file

When Pulsar starts, it loads your personal keymap from `keymap.cson` in the `~/.pulsar` directory on Unix-like systems or `%USERPROFILE%\\.pulsar` on Windows. That file is loaded after core and package keymaps, so user bindings win if specificity is tied.

User keymaps commonly look like this:

```coffee
'atom-text-editor':
  'ctrl-shift-k': 'editor:delete-line'
  'ctrl-alt-up': 'editor:add-selection-above'

'atom-text-editor[mini] input':
  'enter': 'core:confirm'
```

Pulsar exposes this file directly from the UI through the `Edit > Keymap` or `File > Keymap` menu entry, and the Settings view also has a Keybindings tab plus a resolver for debugging conflicts.

### Key syntax

Key combinations are written as dash-separated parts:

- character keys such as `a`, `4`, or `$`
- modifiers such as `cmd`, `ctrl`, `alt`, and `shift`
- special keys such as `enter`, `escape`, `backspace`, `delete`, `tab`, `home`, `end`, `pageup`, `pagedown`, `left`, `right`, `up`, `down`, and `space`

Single-step examples:

```coffee
'atom-text-editor':
  'ctrl-w': 'editor:delete-to-previous-word-boundary'
  'cmd-shift-up': 'editor:move-line-up'
```

Multi-step sequences are written by separating key combinations with spaces:

```coffee
'atom-workspace':
  'ctrl-k ctrl-d': 'editor:delete-line'
```

### Context, selectors, and cascade

Pulsar scopes keybindings with the selector on the left-hand side of the keymap entry.

- `atom-workspace` makes a binding effectively global inside the editor UI.
- `atom-text-editor` targets normal text editors.
- `atom-text-editor[mini] input` targets mini-editors such as search boxes and command inputs.
- `atom-text-editor:not([mini])` restricts a binding to regular editors.
- `atom-text-editor[data-grammar='source js']` restricts a binding to a specific grammar.

Example:

```coffee
'atom-text-editor:not([mini])':
  'ctrl-alt-[': 'editor:fold-current-row'
  'ctrl-alt-]': 'editor:unfold-current-row'

'atom-text-editor[data-grammar="source js"]':
  'ctrl-.': 'custom:custom-command'
```

When multiple bindings match, Pulsar resolves the conflict by selector specificity first and cascade order second. If ordering is important, package authors can split bindings across multiple keymap files and control load order with the `keymaps` array in `package.json`.

One important limitation: grammar selectors can target the editor element as a whole, but they do not target inner syntax scopes inside `atom-text-editor`.

### Commands, directives, and pass-through behavior

Keybindings dispatch commands as custom DOM events. That means a keymap entry names a command, not a function call with inline arguments. If you need more complex behavior, create a custom command and bind the shortcut to that command.

Pulsar also supports directive values:

- `unset!`: removes the current matching binding and continues searching upward through parent elements
- `abort!`: stops keybinding resolution for that keystroke in that context
- `native!`: forces Chromium's native key handling instead of a Pulsar command

Examples:

```coffee
'.tree-view':
  'a': 'unset!'

'atom-text-editor':
  'ctrl-o': 'abort!'

'input':
  'backspace': 'native!'
```

Packages can also implement fallback behavior by calling `.abortKeyBinding()` on the dispatched event, which tells Pulsar to continue looking for the next matching binding.

### Basic customization examples

Add a normal editor shortcut:

```coffee
'atom-text-editor':
  'ctrl-shift-e': 'editor:select-to-previous-word-boundary'
```

Add a context-specific binding:

```coffee
'atom-text-editor[mini] input':
  'enter': 'core:confirm'
```

Unbind one package shortcut but keep parent bindings available:

```coffee
'.tree-view':
  'a': 'unset!'
```

Define a grammar-specific binding:

```coffee
'atom-text-editor[data-grammar="text html basic"]':
  'ctrl-/': 'editor:toggle-line-comments'
```

### Packages and extension keybindings

Packages typically contribute commands with `atom.commands.add(...)` and bind them in `keymaps/*.json` or `keymaps/*.cson`. By default Pulsar loads all keymaps in the `keymaps/` directory alphabetically, but a package can define a `keymaps` array in `package.json` to control which files load and in what order.

Example command registration:

```js
atom.commands.add("atom-text-editor", {
  "example-package:insert-date": function () {
    const editor = this.getModel();
    editor.insertText(new Date().toLocaleString());
  }
});
```

Example package keymap:

```json
{
  "atom-text-editor": {
    "ctrl-alt-d": "example-package:insert-date"
  },
  "atom-workspace": {
    "ctrl-alt-o": "example-package:toggle"
  }
}
```

For extension authors:

- `command`: the command string such as `example-package:insert-date`
- `context`: the CSS selector key such as `atom-text-editor` or `atom-workspace`
- conditions: represented by selector matching, not a separate property
- `args`: not supported directly in keymap entries

If you want one shortcut to perform several actions, Pulsar's documented approach is to register a custom command in `init.js` or a package and then bind that command from the keymap.

### Additional notes

- User keymaps load after core and package keymaps, so they are the normal place to resolve conflicts.
- The Keybindings tab in Settings shows the active bindings for installed packages, and package keymaps can be disabled from a package's settings page.
- The keybinding resolver (`Ctrl+.` on Windows and Linux, `Cmd+.` on macOS) is the main debugging tool for understanding what Pulsar saw and which command won.
- If Pulsar misidentifies a physical keystroke because of Chromium keyboard-event quirks, `atom.keymaps.addKeystrokeResolver(...)` lets you override how the keystroke is interpreted before normal keymap matching happens.
