# Atom

## Keybindings

Atom keybindings are defined as selector-scoped keymaps in `CSON` or `JSON`. The top-level keys are CSS selectors describing where a binding is active, and each selector maps one or more keystroke patterns to command names.

### Keymap shape

```ts
type AtomKeymap = {
  [selector: string]: {
    [keystroke: string]: string
  }
}
```

In practice, the `string` command value is usually a command name such as `editor:newline` or `my-package:toggle`, but Atom also supports a few directive values such as `unset!`, `abort!`, and `native!`.

### Basic examples

User keymaps are usually written in `~/.atom/keymap.cson`:

```coffee
'atom-text-editor':
  'ctrl-shift-k': 'editor:delete-line'
  'ctrl-alt-up': 'editor:add-selection-above'

'atom-text-editor[mini] input':
  'enter': 'core:confirm'
```

Package keymaps can also be written in `JSON`:

```json
{
  "atom-workspace": {
    "ctrl-alt-o": "my-package:toggle"
  }
}
```

Atom also supports multi-stroke sequences:

```coffee
'atom-workspace':
  'ctrl-k ctrl-d': 'editor:delete-line'
```

### Context, selectors, and scopes

Atom does not use a VS Code-style `when` clause. The equivalent concept is the selector on the left-hand side of the keymap.

- `atom-workspace` makes a binding effectively global inside the editor UI.
- `atom-text-editor` targets normal text editors.
- `atom-text-editor[mini] input` targets mini-editors such as search boxes or command inputs.
- `atom-text-editor:not([mini])` is a common conditional selector for regular editors only.
- `atom-text-editor[data-grammar='source js']` restricts a binding to editors using a specific grammar.

Selectors are matched using normal CSS specificity rules. If multiple bindings match, Atom picks the most specific selector. If specificity is tied, the later-loaded binding wins.

One important limitation: grammar selectors can target the editor element as a whole, but Atom keymaps do not target inner syntax scopes or token-level scopes inside `atom-text-editor`. In other words, keymaps can be grammar-aware, but not syntax-token-aware.

### Commands and conditionals

A binding maps a keystroke to a command string. When the keystroke matches, Atom dispatches that command as a custom DOM event on the focused element.

That means:

- There is no first-class `args` field in the keymap entry itself.
- There is no first-class `when` expression language separate from the selector.
- Conditional behavior usually lives in the selector.
- Conditional behavior can also live in command implementation code.
- Conditional behavior can also be expressed through keymap precedence and directives such as `unset!` or `abort!`.

Examples:

```coffee
'.tree-view':
  'a': 'unset!'

'atom-text-editor':
  'ctrl-o': 'abort!'
```

- `unset!` removes the current match and lets Atom continue searching up the DOM tree.
- `abort!` stops keybinding resolution entirely for that keystroke in that context.
- `native!` forces Chromium's native handling for the keystroke.

### Custom keybindings for custom extensions

Atom packages can define their own commands and bind keys to them.

A typical package flow looks like this:

1. Register a command with `atom.commands.add(...)`.
2. Add a keymap in the package's `keymaps/` directory, or register bindings programmatically.
3. Use a selector to control where that command is available.

Example command registration:

```js
atom.commands.add('atom-text-editor', {
  'example-package:insert-date': function () {
    const editor = this.getModel();
    editor.insertText(new Date().toLocaleDateString());
  }
});
```

Example package keymap file:

```coffee
'atom-text-editor':
  'ctrl-alt-d': 'example-package:insert-date'

'atom-text-editor[data-grammar="source js"]':
  'ctrl-alt-l': 'example-package:log-selection'
```

The equivalent concepts for extension authors are:

- `command`: the string name like `example-package:insert-date`
- `context`: the selector, such as `atom-text-editor` or `atom-workspace`
- `when`: represented by the selector rather than a separate clause
- `args`: not part of the keymap format; pass data through package state, closures, or command code instead

If a package needs to create bindings dynamically, it can do so in code:

```js
atom.keymaps.add('example-package', {
  'atom-text-editor': {
    'ctrl-alt-d': 'example-package:insert-date'
  }
});
```

Atom also allows custom keystroke normalization via `atom.keymaps.addKeystrokeResolver(...)`, which is useful when Chromium reports a keyboard layout in a way that does not match the key you want to bind.

### Notes for guide authors

- User overrides in `keymap.cson` are loaded last, so they can override core and package bindings.
- The Keybinding Resolver (`Cmd+.` on macOS, `Ctrl+.` elsewhere) is the main debugging tool for conflicts and selector matching.
- Package keymaps are usually stored under `keymaps/`, and a package `package.json` can explicitly control keymap load order with a `keymaps` array.
