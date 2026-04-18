# VS Code

## Keybindings

VS Code keybindings are defined as JSON objects that map a keystroke to a command ID, optionally restricted by platform and a `when` expression. User overrides live in `keybindings.json`, while extensions contribute default bindings through the `contributes.keybindings` section of `package.json`.

### tl;dr

- Modifiers: VS Code uses names such as `ctrl`, `shift`, `alt`, `cmd`, and `win`. Keys are usually written in lowercase, and scan-code bindings use bracketed names such as `[Slash]`.
- Shortcuts: Single bindings are strings such as `ctrl+k` or `alt+down`.
- Chords: Multi-step bindings are space-separated sequences such as `ctrl+k ctrl+c`.
- Conditions: Context-specific bindings use a `when` clause built from context keys such as `editorTextFocus`, `resourceLangId == markdown`, or `terminalFocus && !terminalTextSelected`.
- Args: User keybindings can pass an `args` value to the target command. Extension-contributed keybindings do not define command arguments in the contribution object.
- Platform: A keybinding rule can use per-platform keys such as `mac`, `linux`, and `win`. Extension-contributed bindings can also use a shared `key` plus platform overrides.
- Removal: User overrides can remove a default binding by prefixing the command with `-`, or remove a specific command-and-when rule by setting the command to `-commandId` with the same `when` clause.
- Extension bindings: Extensions register commands and contribute default keybindings from `package.json`.
- Other features: VS Code supports chords, `when` expressions with logical and comparison operators, scan-code bindings, and a built-in Keyboard Shortcuts editor and troubleshooting log.

### Keybinding rule shape

User keybindings are stored as an array of rule objects:

```ts
type VSCodeKeybinding = {
  key?: string;
  command: string;
  when?: string;
  args?: unknown;
}
```

The `key` field is the shortcut string, `command` is the command ID, `when` is a boolean expression over context keys, and `args` is an optional payload passed to the command.

VS Code's built-in and extension-contributed defaults use the same conceptual shape, but extension manifests also support platform-specific fields:

```ts
type VSCodeExtensionKeybinding = {
  command: string;
  key?: string;
  mac?: string;
  linux?: string;
  win?: string;
  when?: string;
}
```

### Where user keybindings live

User overrides are edited through the Keyboard Shortcuts UI or directly in `keybindings.json`.

- macOS: `~/Library/Application Support/Code/User/keybindings.json`
- Windows: `%APPDATA%\Code\User\keybindings.json`
- Linux: `$HOME/.config/Code/User/keybindings.json`

Workspace-specific keybindings are not a built-in feature. Keybinding customization is user scoped, although profiles can carry their own user settings and keybindings.

### Basic examples

Basic command bindings in `keybindings.json`:

```json
[
  {
    "key": "ctrl+alt+down",
    "command": "editor.action.insertCursorBelow"
  },
  {
    "key": "ctrl+k ctrl+c",
    "command": "editor.action.addCommentLine"
  }
]
```

A context-specific binding that only applies in normal text editors:

```json
[
  {
    "key": "ctrl+enter",
    "command": "editor.action.insertLineAfter",
    "when": "editorTextFocus && !editorReadonly"
  }
]
```

A binding that passes command arguments:

```json
[
  {
    "key": "ctrl+alt+r",
    "command": "workbench.action.tasks.runTask",
    "args": "build"
  }
]
```

Platform-specific overrides can be expressed in extension manifests:

```json
{
  "contributes": {
    "keybindings": [
      {
        "command": "example.hello",
        "key": "ctrl+alt+h",
        "mac": "cmd+alt+h",
        "when": "editorTextFocus"
      }
    ]
  }
}
```

### Context and `when` clauses

VS Code scopes keybindings with `when` expressions rather than selectors or mode names. A `when` clause evaluates context keys that describe current UI state, focus, editor mode, resource metadata, and extension-defined state.

Common built-in contexts include:

- `editorTextFocus` for a focused text editor
- `editorReadonly` for read-only editors
- `terminalFocus` for the integrated terminal
- `resourceLangId == markdown` for language-specific bindings
- `explorerViewletVisible` or `sideBarFocus` for workbench UI state

`when` clauses support logical operators such as `!`, `&&`, and `||`, equality and inequality checks, numeric comparisons, regular-expression matching with `=~`, and membership tests with `in` and `not in`.

Examples:

```json
[
  {
    "key": "ctrl+b",
    "command": "workbench.action.toggleSidebarVisibility",
    "when": "sideBarFocus || editorTextFocus"
  },
  {
    "key": "ctrl+shift+m",
    "command": "markdown.showPreview",
    "when": "editorTextFocus && resourceLangId == markdown"
  }
]
```

Extensions can create their own custom contexts with the `setContext` command and then reference those keys from `when` clauses.

### Chords, dispatch, and key notation

VS Code supports key chords natively. A chord is written as two shortcuts separated by a space, for example `ctrl+k ctrl+s`.

Most bindings use key names such as `enter`, `f5`, `down`, or `quote`, but VS Code also supports scan-code bindings such as `cmd+[Slash]`. Scan codes bind to a physical keyboard position instead of the produced character, which matters for non-US layouts.

The `keyboard.dispatch` setting affects whether VS Code interprets bindings by key code or by produced character, which can change how layout-sensitive bindings behave. The Keyboard Shortcuts Troubleshooting view is the main tool for diagnosing conflicts and dispatch issues.

### Removing and overriding bindings

User rules are applied on top of the built-in and extension defaults. A user rule with the same `key` and `when` effectively overrides the earlier binding.

To remove a default keybinding, prefix the command ID with `-`:

```json
[
  {
    "key": "ctrl+k ctrl+c",
    "command": "-editor.action.addCommentLine"
  }
]
```

When a built-in command has multiple bindings, the most reliable way to remove only one of them is to match the original `when` clause:

```json
[
  {
    "key": "tab",
    "command": "-jumpToNextSnippetPlaceholder",
    "when": "inSnippetMode"
  }
]
```

### Extension-contributed keybindings

Extensions usually add keybindings in two parts:

1. Register a command ID in `contributes.commands` and implement it with `vscode.commands.registerCommand(...)`.
2. Add one or more default bindings in `contributes.keybindings`.

Example:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "example.insertDate",
        "title": "Insert Date"
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

Example implementation:

```ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('example.insertDate', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      await editor.edit(edit => {
        edit.insert(editor.selection.active, new Date().toLocaleDateString());
      });
    })
  );
}
```

Extension keybinding contributions do not define an `args` field. If an extension needs different parameterized actions, it typically registers separate command IDs or handles state internally before executing the command.

### Limitations and notable behavior

- Keybindings are user-level customizations, not per-workspace settings.
- Conflict resolution depends on keybinding weight and specificity. User rules take precedence over defaults, and more specific `when` expressions can disambiguate otherwise identical keys.
- A command can have multiple bindings, each with a different `when` clause or platform override.
- Some commands only make sense in a specific UI surface, so a keybinding may appear valid but never fire unless the matching focus context is true.
- The Keyboard Shortcuts editor and the JSON default keybindings view are the main reference points for inspecting built-in command IDs and active `when` clauses.
