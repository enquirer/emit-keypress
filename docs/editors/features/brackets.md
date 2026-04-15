# Brackets

## Keybindings

Brackets has two layers of keyboard shortcuts:

- built-in and extension-defined command bindings managed by `KeyBindingManager`
- user overrides stored in `keymap.json`

For users, the main customization entry point is `Debug > Open User Key Map`, which opens `keymap.json`. Brackets creates the file automatically if it does not already exist, and applies changes immediately when you save it.

### Keymap shape

```ts
type BracketsUserKeymap = {
  overrides: {
    [shortcut: string]: string | null
  }
}
```

In practice, the `string` value is a command ID such as `edit.duplicate` or `me.drewh.jsbeautify`. Setting a shortcut to `null` removes that binding from the effective command keymap.

### User keybinding file

Brackets stores the user key map in its app-data directory:

- macOS: `~/Library/Application Support/Brackets/keymap.json`
- Windows XP: `%appdata%\\Brackets\\keymap.json`
- Windows Vista/7/8+: `%appdata%\\Brackets\\keymap.json`
- Linux: `$XDG_CONFIG_HOME/brackets/keymap.json` or `~/.config/brackets/keymap.json`

The file format is a single JSON object with an `overrides` map:

```json
{
  "overrides": {
    "Ctrl-Alt-L": "me.drewh.jsbeautify",
    "Ctrl-Shift-D": "edit.duplicate",
    "Ctrl-Alt-P": null
  }
}
```

Each key in `overrides` is a shortcut descriptor, and each value is a command ID. Setting a command ID to `null` removes that shortcut. The user key map does not support extra fields such as `when`, `context`, selector scopes, modes, or command arguments. It is strictly a shortcut-to-command override table.

### Key syntax and platform behavior

Brackets documents shortcut descriptors as single key strings such as `Ctrl-Shift-D` or `Cmd-Opt-Right`. Supported modifier names include `Ctrl`, `Cmd`, `Alt`, `Opt`, and `Shift`, followed by a key name such as `Up`, `Down`, `Delete`, `Tab`, or a letter key.

For user overrides, modifier names are platform-specific. On macOS you typically use `Cmd` instead of `Ctrl`. For built-in and programmatic bindings, Brackets maps generic `Ctrl` bindings to `Cmd` on macOS unless a platform-specific binding is supplied explicitly.

Examples:

```json
{
  "overrides": {
    "Ctrl-Shift-L": "edit.splitSelIntoLines",
    "Ctrl-D": "cmd.addNextMatch",
    "Ctrl-R": "navigate.gotoDefinition"
  }
}
```

Equivalent macOS user overrides:

```json
{
  "overrides": {
    "Cmd-Shift-L": "edit.splitSelIntoLines",
    "Cmd-D": "cmd.addNextMatch",
    "Cmd-P": "navigate.quickOpen"
  }
}
```

Brackets only documents single shortcut descriptors here, not multi-step key chords.

### Scope and context

Brackets does not expose a declarative keybinding condition language comparable to VS Code `when` clauses, Atom selectors, or Vim modes. In the user key map, a binding is global at the command layer: you map a shortcut directly to a command ID.

Whether a shortcut actually does anything depends on the command being available in the current UI state. Brackets also has special handling around native menus, HTML menus, and some global keydown hooks, but those are implementation details rather than user-configurable binding scopes.

### Limitations and reserved shortcuts

Some shortcuts cannot be reassigned through `keymap.json`. The documented restricted commands are:

- `edit.selectAll`
- `edit.copy`
- `edit.paste`
- `edit.cut`
- `edit.undo`
- `edit.redo`

Brackets also documents Mac-reserved shortcuts that cannot be overridden:

- `Cmd-,`
- `Cmd-H`
- `Cmd-Alt-H`
- `Cmd-M`
- `Cmd-Q`

The user key map also only supports overriding command bindings. It does not change editor bindings that are handled directly by the underlying CodeMirror keymap.

### Extension and plugin keybindings

Brackets extensions can define their own commands and attach shortcuts to them. The command layer uses `CommandManager.register(name, id, commandFn)`, and the keybinding layer exposes `KeyBindingManager.addBinding(command, keyBindings, platform)`.

Extension command IDs are expected to use a namespaced format such as `author.myextension.mycommandname`.

A programmatic keybinding can be a single binding or an array, and each entry can include:

- `key`
- `displayKey`
- `platform`

Example:

```js
CommandManager.register(
  "Beautify Document",
  "me.drewh.jsbeautify",
  function () {}
);

KeyBindingManager.addBinding("me.drewh.jsbeautify", [
  { key: "Ctrl-Alt-L" },
  { key: "Cmd-Alt-L", platform: "mac" }
]);
```

Brackets also supports a custom `displayKey` for menu labeling when the visible shortcut text should differ from the normalized key descriptor. The `key` field still defines the actual binding. For example, if you want the UI to show `Ctrl-+`, the binding itself should still spell out the shifted key combination explicitly:

```js
KeyBindingManager.addBinding("example.command", {
  key: "Ctrl-Shift-=",
  displayKey: "Ctrl-+"
});
```

There is still no documented extension-side equivalent of `when`, selector scopes, per-binding arguments, or modal contexts. Extensions contribute commands and shortcuts directly, and users can later override or remove those command bindings in `keymap.json`.
