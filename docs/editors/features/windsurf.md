# Windsurf

## Keybindings

Windsurf exposes a VS Code-style keybinding system. In the onboarding flow you can start with default VS Code bindings or Vim bindings, and you can also import VS Code or Cursor configuration later. For practical purposes, custom shortcuts, conditions, and extension-contributed bindings work like they do in VS Code.

### tl;dr

- Modifiers: use VS Code key notation such as `ctrl`, `shift`, `alt`, `cmd`, `win`, and `meta`.
- Shortcuts: bindings are written as VS Code-style key strings such as `ctrl+alt+r` for single shortcuts.
- Chords: yes. Multi-stroke bindings are written as space-separated sequences such as `ctrl+k ctrl+c`.
- Conditions: use a `when` clause. Windsurf uses VS Code context keys, not selector syntax.
- Args: yes. User keybindings can pass `args`, including `runCommands` sequences.
- Platform: use `key` for the default binding and per-platform overrides such as `mac` in extension manifests.
- Removal: remove bindings in the Keyboard Shortcuts UI, prefix a command with `-` to remove a specific rule, or use an empty `command` to disable a key entirely.
- Extension bindings: extensions contribute commands and default shortcuts through the VS Code extension manifest model.
- Other features: keybindings are layout-aware in the UI, can use scan codes for layout-independent bindings, and can be debugged with keyboard-shortcut troubleshooting logs.

### Where user keybindings live

Open the Command Palette and run `Preferences: Open Keyboard Shortcuts` for the searchable UI or `Preferences: Open Keyboard Shortcuts (JSON)` for the raw file.

The JSON view is the authoritative user keymap. Windsurf's public docs do not publish a separate product-specific path for this file, so the UI command is the reliable way to open the active `keybindings.json`.

### Keybinding rule shape

Windsurf user keybindings use the standard VS Code keyboard rule format:

```json
[
  {
    "key": "ctrl+alt+r",
    "command": "workbench.action.reloadWindow"
  },
  {
    "key": "ctrl+k ctrl+t",
    "command": "workbench.action.files.newUntitledFile",
    "when": "!editorReadonly"
  }
]
```

The main fields are:

- `key`: the shortcut, including chords like `ctrl+k ctrl+t`
- `command`: the command ID to invoke
- `when`: an optional boolean expression over context keys
- `args`: an optional argument payload passed to the command

Rules are evaluated from bottom to top. The first rule whose `key` and `when` both match wins, so later user rules override earlier defaults.

### Conditions and scope

Windsurf does not use Atom-style selectors for keybindings. Scoping is done with VS Code `when` expressions such as:

- focus state: `editorTextFocus`, `terminalFocus`, `inputFocus`
- editor state: `!editorReadonly`, `editorHasSelection`
- language state: `editorLangId == markdown`
- platform state: `isMac`, `isLinux`, `isWindows`

That means the usual way to make a binding context-specific is to keep the same command ID and narrow it with `when`.

```json
[
  {
    "key": "ctrl+/",
    "command": "editor.action.commentLine",
    "when": "editorTextFocus && !editorReadonly"
  },
  {
    "key": "shift+alt+a",
    "command": "editor.action.blockComment",
    "when": "editorTextFocus && editorLangId == javascript"
  }
]
```

### Command arguments and multi-step bindings

User keybindings can pass `args` directly to commands:

```json
[
  {
    "key": "enter",
    "command": "type",
    "args": { "text": "Hello World" },
    "when": "editorTextFocus"
  }
]
```

They can also run multiple commands sequentially with `runCommands`:

```json
[
  {
    "key": "ctrl+alt+c",
    "command": "runCommands",
    "args": {
      "commands": [
        "editor.action.copyLinesDownAction",
        "cursorUp",
        "editor.action.addCommentLine",
        "cursorDown"
      ]
    }
  }
]
```

This is the main escape hatch when one shortcut needs to trigger a short workflow instead of one command.

### Chords, layouts, and scan codes

Chords are written as two keypresses separated by a space:

```json
[
  {
    "key": "ctrl+k ctrl+w",
    "command": "workbench.action.closeAllEditors"
  }
]
```

The Keyboard Shortcuts UI renders shortcuts using the current keyboard layout, which helps when the physical labels on your keyboard differ from US layout assumptions.

If you need a shortcut to stay tied to a physical key position rather than a rendered character, use scan codes:

```json
[
  {
    "key": "cmd+[Slash]",
    "command": "editor.action.commentLine",
    "when": "editorTextFocus"
  }
]
```

### Removing or overriding bindings

To remove a default binding, add a removal rule with a leading `-` on the command ID:

```json
[
  {
    "key": "tab",
    "command": "-jumpToNextSnippetPlaceholder"
  }
]
```

To disable a key entirely for the current context, use an empty command:

```json
[
  {
    "key": "tab",
    "command": "",
    "when": "editorTextFocus"
  }
]
```

This is the Windsurf equivalent of unbinding a shortcut. There is no separate pass-through directive or selector cascade.

### Extension-contributed commands and keybindings

Windsurf supports extension-style command IDs and keybinding contributions in the same way VS Code does. Extension authors register commands in code and expose them in `package.json`, then optionally attach default shortcuts with `contributes.keybindings`.

```json
{
  "contributes": {
    "commands": [
      {
        "command": "acme.sayHello",
        "title": "Say Hello"
      }
    ],
    "keybindings": [
      {
        "command": "acme.sayHello",
        "key": "ctrl+f1",
        "mac": "cmd+f1",
        "when": "editorTextFocus"
      }
    ]
  }
}
```

In practice:

- the command itself is registered through the extension API
- the manifest contributes a user-visible command entry
- `contributes.keybindings` adds a default shortcut
- `when` provides context scoping for the contributed shortcut
- platform overrides are expressed in the manifest, not in separate files

For user overrides of extension commands, you usually bind the extension's command ID in `keybindings.json` exactly like a built-in command.

### Windsurf-specific notes

Some editor and AI features have documented default shortcuts:

- Command Palette: `Cmd/Ctrl+Shift+P`
- Cascade: `Cmd/Ctrl+L`
- inline Command: `Cmd/Ctrl+I`
- Tab suggestion accept: `Tab`
- Tab suggestion cancel: `Esc`

Windsurf's public docs describe these user-facing shortcuts, but they do not publish a dedicated reference of Windsurf-specific command IDs. If you want to rebind one of these features, use the Keyboard Shortcuts editor to search for the action and confirm the command ID before writing JSON by hand.

### Limitations and quirks

- The public Windsurf docs document the editor in VS Code terms, but they do not publish a separate Windsurf-only keybinding schema. Treat the VS Code keybinding model as the source of truth for structure and behavior.
- Keybindings are condition-based, not selector-based. If you are coming from Atom, Sublime Text, or TextMate, look for `when` expressions rather than scope selectors.
- Conflict resolution is rule-order driven. If a shortcut is not firing, inspect duplicate bindings and the active `when` clauses first.
- Use `Developer: Toggle Keyboard Shortcuts Troubleshooting` when a binding behaves unexpectedly.
