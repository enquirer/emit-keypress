# Cursor

## Keybindings

Cursor uses the same keyboard shortcut model as VS Code: bindings are stored as keyboard rules, edited in the Keyboard Shortcuts UI, and written as JSON in `keybindings.json`. Cursor's own commands show up in the same system, so built-in VS Code actions and Cursor-specific actions are customized in one place.

### tl;dr

- Modifiers: Use VS Code-style key names such as `ctrl`, `shift`, `alt`, `cmd`, and key names like `enter`, `tab`, or `f5`.
- Shortcuts: Bind a single shortcut with a `key` string such as `ctrl+alt+down`.
- Chords: Bind multi-step shortcuts by separating steps with a space, for example `ctrl+k ctrl+s`.
- Conditions: Use a `when` expression with context keys such as `editorTextFocus && !editorReadonly`.
- Args: User keybindings can pass command arguments with an `args` field.
- Platform: Extension bindings can define `mac`, `linux`, and `win` overrides. User bindings are edited per installation/profile in the normal Keyboard Shortcuts UI and JSON editor.
- Removal: Remove or shadow bindings with a rule whose `command` starts with `-`, or replace a binding with an empty command.
- Extension bindings: VS Code-compatible extensions contribute commands and keybindings through `package.json`.
- Other features: Cursor inherits VS Code features such as scan-code bindings, context-key-based matching, and a Keyboard Shortcuts editor for conflict inspection.

### Keyboard rule shape

User keybindings are JSON objects inside an array:

```ts
type CursorKeybinding = {
  key: string
  command: string
  when?: string
  args?: unknown
}
```

Properties:

- `key` **{string}**: A shortcut or chord such as `ctrl+k ctrl+s`.
- `command` **{string}**: The command ID to execute. In removal rules, this can start with `-`.
- `when` **{string}**: An optional boolean expression over VS Code context keys.
- `args` **{unknown}**: Optional command arguments passed to the command when it runs.

### User keybindings

The main entry point is the Keyboard Shortcuts editor in Cursor. From there, open the JSON form with the same VS Code command you would use in VS Code: `Preferences: Open Keyboard Shortcuts (JSON)`.

That JSON file is the active profile's `keybindings.json`, and it contains an array of keyboard rules:

```json
[
  {
    "key": "ctrl+shift+k",
    "command": "editor.action.deleteLines"
  },
  {
    "key": "ctrl+k ctrl+d",
    "command": "editor.action.moveSelectionToNextFindMatch"
  }
]
```

### Basic examples

Basic editor command:

```json
[
  {
    "key": "ctrl+alt+down",
    "command": "editor.action.insertCursorBelow"
  }
]
```

Context-specific binding:

```json
[
  {
    "key": "ctrl+enter",
    "command": "editor.action.insertLineAfter",
    "when": "editorTextFocus && !editorReadonly"
  }
]
```

Binding with command arguments:

```json
[
  {
    "key": "ctrl+m",
    "command": "workbench.action.tasks.runTask",
    "args": "build"
  }
]
```

Chord:

```json
[
  {
    "key": "ctrl+k ctrl+s",
    "command": "workbench.action.openGlobalKeybindings"
  }
]
```

### Conditions and context keys

Cursor uses VS Code `when` clauses rather than selector scopes or modal tables. A `when` clause is a boolean expression evaluated against context keys that describe the current UI state.

Common patterns include:

- `editorTextFocus`: the text editor has focus
- `!editorReadonly`: the current editor is writable
- `inputFocus`: a text input has focus
- `resourceLangId == markdown`: the current file language matches a specific language

Example:

```json
[
  {
    "key": "ctrl+b",
    "command": "editor.debug.action.toggleBreakpoint",
    "when": "editorTextFocus && debuggersAvailable && !inDebugMode"
  }
]
```

This is the main equivalent of Atom selectors, Vim modes, or editor-specific scope systems. Cursor does not add a separate keybinding condition language on top of this model.

### Removal, overrides, and pass-through behavior

User keybindings override defaults. If multiple rules match the same key, the more specific `when` clause wins; otherwise later user rules can shadow earlier ones.

To remove a default binding, prefix the command with `-`:

```json
[
  {
    "key": "tab",
    "command": "-jumpToNextSnippetPlaceholder",
    "when": "inSnippetMode"
  }
]
```

To block a shortcut entirely in a context, bind it to an empty command:

```json
[
  {
    "key": "ctrl+/",
    "command": "",
    "when": "editorTextFocus"
  }
]
```

Unlike Atom's `native!` or `abort!`, Cursor follows VS Code's keyboard-rule resolution model. In practice, you disable or replace bindings by adding higher-priority user rules instead of using special directive values.

### Platform and keyboard layout notes

For extension authors, platform-specific overrides live on the binding entry itself:

```json
{
  "command": "example.hello",
  "key": "ctrl+shift+h",
  "mac": "cmd+shift+h",
  "when": "editorTextFocus"
}
```

VS Code-style scan-code bindings are also supported when a physical key matters more than the produced character:

```json
[
  {
    "key": "cmd+[Slash]",
    "command": "editor.action.commentLine"
  }
]
```

This matters on non-US keyboard layouts where character-based shortcuts can move around.

### Extension keybindings

Cursor supports the VS Code extension model, so extension commands and keybindings follow the standard `package.json` contribution format.

Extensions typically:

1. Register a command in `contributes.commands`.
2. Add one or more keybindings in `contributes.keybindings`.
3. Use `when` clauses to scope where those bindings are active.

Example extension manifest:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "example.insertDate",
        "title": "Example: Insert Date"
      }
    ],
    "keybindings": [
      {
        "command": "example.insertDate",
        "key": "ctrl+alt+d",
        "mac": "cmd+alt+d",
        "when": "editorTextFocus && !editorReadonly"
      }
    ]
  }
}
```

The extension-side equivalents are:

- `command`: the command ID, such as `example.insertDate`
- `context`: expressed through the `when` clause
- `platform`: optional `mac`, `linux`, or `win` override keys
- `args`: not part of the contributed keybinding schema itself

If an extension command needs parameters, those are usually handled by the command implementation or by a user-defined keybinding that calls the command with `args`.

### Cursor-specific notes

Cursor documents its shortcut system as taking VS Code keybindings as the baseline. Cursor-specific actions appear in the same Keyboard Shortcuts UI and can be rebound there just like standard editor commands.

For practical debugging:

- use Keyboard Shortcuts search to inspect the active command, key, and `when` clause
- use `Preferences: Open Keyboard Shortcuts (JSON)` for exact edits
- prefer command IDs over menu labels when sharing bindings with other users
