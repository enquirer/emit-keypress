# Nova

## Keybindings

### tl;dr

- Modifiers: Nova uses macOS-style modifier names in shortcut strings, such as `cmd`, `ctrl`, `opt`, and `shift`.
- Shortcuts: A binding is written as a single dash-separated shortcut string like `cmd-shift-p` or `cmd-opt-ctrl-escape`.
- Chords: Nova's docs describe a single shortcut string per binding; they do not document multi-step chord syntax.
- Conditions: Built-in bindings are customized in `Settings > Key Bindings`. Extension commands can further scope shortcuts with a `when` expression plus `filters` such as `syntaxes` and `types`.
- Args: Nova does not document keybinding-level command arguments for either user bindings or extension-contributed shortcuts.
- Platform: macOS-only. there is only shortcut format, no per-platform override fields.
- Removal: User bindings are managed from the Key Bindings settings and key binding sets UI. Nova does not document a textual unbind marker.
- Extension bindings: Extensions contribute commands in `extension.json`, and eligible commands can attach a `shortcut`, `when`, `filters`, and `state`.
- Other features: Only `extensions`, `editor`, and `text` commands may have keybindings, and `text` commands are the only category allowed to use unmodified keys.

Nova exposes keybinding customization primarily through the UI instead of a documented hand-edited config file. Users customize shortcuts from `Settings > Key Bindings`, where Nova can show system, menu, and extension commands together and lets you manage named key binding sets.

### User keybindings

Nova's official user documentation centers on the Key Bindings settings pane rather than a text file. The documented workflow is to open `Settings > Key Bindings`, search for a command, and change or remove its shortcut there. Nova also supports multiple named key binding sets through the `Manage Key Bindings...` action in the same settings UI.

Because Panic's public docs do not describe a supported on-disk keybinding file or export format, Nova user keybindings are documented as UI-managed rather than file-managed.

### Extension keybindings

Extensions contribute keyboard shortcuts through command definitions in `extension.json`. Nova's command manifest is the primary documented keybinding data structure.

```json
{
  "commands": {
    "editor": [
      {
        "title": "Sort Selected Lines",
        "command": "acme.sortSelectedLines",
        "shortcut": "cmd-opt-s"
      }
    ]
  }
}
```

Each command entry declares the command identifier in `command`, the user-facing label in `title`, and an optional `shortcut`. Nova documents command definitions under three categories that may be keybound:

- `extensions`: global extension commands
- `editor`: commands that operate on the active editor
- `text`: text-input commands that may use bare, unmodified keys

Commands contributed only to command palettes are still invokable from the palette, but Nova does not document palette-only commands as a place to attach keybindings.

### Shortcut syntax

Nova represents a shortcut as a string. The documented examples use dash-separated modifier names plus a final key, such as:

```json
{
  "title": "Open Preview",
  "command": "acme.openPreview",
  "shortcut": "cmd-shift-o"
}
```

The docs explicitly show modifier names `cmd`, `opt`, `ctrl`, and `shift`. The final segment is the key to press. Nova's public docs do not describe a separate chord array, sequence syntax, or multi-stroke timeout behavior.

### Conditions and scope

Nova scopes extension shortcuts with two mechanisms in the command manifest:

1. `when`: a boolean expression that determines whether the command is currently enabled
2. `filters`: a structural scope that limits where the command appears or applies

`when` expressions are written in a small JavaScript-like expression syntax. The docs show built-in variables such as `documentHasPath`, `editorHasSelection`, `editorHasMultipleSelections`, `editorHasFocus`, `editorSyntax`, and `viewItem`, along with support for `!`, `&&`, `||`, equality comparisons, numeric comparisons, and parentheses.

```json
{
  "title": "Duplicate Current Selection",
  "command": "acme.duplicateSelection",
  "shortcut": "cmd-d",
  "when": "documentHasPath && !editorHasMultipleSelections"
}
```

`filters` provide additional structured scoping. The documented keys are:

- `syntaxes`: limit a command to one or more syntaxes
- `types`: limit a command to one or more file types, expressed as file extensions or Uniform Type Identifiers

```json
{
  "title": "Format JSON",
  "command": "acme.formatJSON",
  "shortcut": "cmd-opt-j",
  "filters": {
    "syntaxes": ["json", "json5"]
  },
  "when": "editorHasFocus"
}
```

Nova also supports a `state` expression for menu item state, but that affects command presentation rather than defining a separate keybinding rule.

### Command handlers

An extension's JavaScript activates the command by registering the same command identifier. The handler signature depends on the command category.

```javascript
exports.activate = function() {
  nova.commands.register("acme.sortSelectedLines", function(editor) {
    const ranges = editor.selectedRanges;
    if (ranges.length === 0) {
      return;
    }

    // Sort each selected block in place.
    editor.edit(function(edit) {
      for (const range of ranges) {
        const text = editor.getTextInRange(range);
        const sorted = text.split("\n").sort().join("\n");
        edit.replace(range, sorted);
      }
    });
  });
};
```

Nova documents command registration through `nova.commands.register()`. Keybindings do not pass ad hoc argument objects in the manifest, so any command-specific behavior needs to come from the command implementation, current editor state, workspace context, or separate commands with different IDs.

### Text commands and unmodified keys

Nova draws an important distinction between menu-style commands and `text` commands. Only `text` commands may use unmodified keys, which lets an extension intercept typing-oriented keystrokes in editor contexts.

```json
{
  "commands": {
    "text": [
      {
        "title": "Insert Arrow Function",
        "command": "acme.insertArrow",
        "shortcut": "tab",
        "when": "editorSyntax == 'javascript'"
      }
    ]
  }
}
```

This is a key Nova-specific rule: if the binding needs a plain key with no modifiers, it has to be a `text` command.

### Extension-defined context

Extensions can expose their own context values through the workspace context API and then reference them from `when` expressions.

```javascript
exports.activate = function() {
  nova.workspace.context.set("acme.hasRunnableSelection", false);

  nova.commands.register("acme.runSelection", function(editor) {
    // Command implementation omitted.
  });
};
```

```json
{
  "title": "Run Selection",
  "command": "acme.runSelection",
  "shortcut": "cmd-enter",
  "when": "acme.hasRunnableSelection && editorHasFocus"
}
```

### Limitations and quirks

- Nova's public docs do not describe a supported user-editable keybinding file, so documentation should point users to the Key Bindings settings UI instead of a config path.
- Nova's shortcut examples are single strings; the docs do not describe multi-stroke chords or sequence bindings.
- Nova does not document keybinding-level argument passing.
- Only `extensions`, `editor`, and `text` command categories may be keybound.
- Only `text` commands may claim unmodified keys.
- Because Nova is macOS-only, there is no documented platform override syntax for separate Windows or Linux bindings.
