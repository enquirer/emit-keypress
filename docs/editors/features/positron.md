# Positron

## Keybindings

Positron uses the same keyboard shortcut system as VS Code, then layers Positron-specific commands and context keys on top. User customizations live in `keybindings.json` as JSON rules that match a `key`, optionally check a `when` condition, and dispatch a command ID.

### tl;dr

- Modifiers: User rules use VS Code key syntax such as `ctrl`, `shift`, `alt`, `cmd`, `win`, and `meta`.
- Shortcuts: Single bindings are strings such as `ctrl+shift+p`.
- Chords: Multi-step bindings are space-separated, for example `ctrl+k ctrl+s`.
- Conditions: Supports `when` clause with context keys such as `editorTextFocus`, `terminalFocus`, or `isPositron`.
- Args: User rules can include an `args` field and pass structured data to commands.
- Platform: Positron resolves shortcuts per operating system; extension manifests can override the default `key` with `mac`, `linux`, or `win`.
- Removal: Use `-command.id` to remove a specific rule or `""` to shadow a shortcut with no action.
- Extension bindings: Extensions contribute commands and keybindings through `package.json`, and implement command handlers in code.
- Other features: Scan-code syntax such as `[Slash]`, the `runCommands` helper for command sequences, and terminal pass-through control via `terminal.integrated.commandsToSkipShell`.

### Keybinding shape

```ts
type PositronUserKeybinding = Array<{
  key: string
  command: string
  when?: string
  args?: unknown
}>
```

Each object is a keyboard rule. In normal rules, `command` is a command ID such as `workbench.action.files.saveAll` or `workbench.action.executeCode.console`. In removal rules, `command` starts with `-`. In a disabling rule, `command` is the empty string.

### Properties

- `key` **{string}**: the keystroke or chord to match, such as `ctrl+enter` or `ctrl+k ctrl+s`
- `command` **{string}**: the command ID to execute, a removal rule like `-jumpToNextSnippetPlaceholder`, or `""` to block a shortcut
- `when` **{string}**: optional boolean expression over context keys
- `args` **{any}**: optional argument payload passed to the command

### User keybinding file

Open the file with **Preferences: Open Keyboard Shortcuts (JSON)**. The file format is a JSON array of rules:

```json
[
  {
    "key": "ctrl+alt+l",
    "command": "workbench.action.files.saveAll"
  },
  {
    "key": "ctrl+enter",
    "command": "workbench.action.executeCode.console",
    "when": "editorTextFocus && isPositron"
  }
]
```

Positron appends user rules after the built-in rules, so user customizations override defaults when the `key` and `when` match. Rules are evaluated from bottom to top, and the first matching rule wins.

### Keys, chords, and layout handling

Positron inherits VS Code's key notation:

- modifiers are written with `+`, as in `ctrl+shift+p`
- chords are written with a space between steps, as in `ctrl+k ctrl+s`
- accepted keys include letters, digits, function keys, arrows, and named keys such as `tab`, `enter`, `escape`, `home`, and `pageup`

The `key` string refers to virtual keys, not the character produced by your active keyboard layout. When layout-specific behavior matters, VS Code-style scan codes such as `cmd+[Slash]` can be used. The Keyboard Shortcuts editor can also record the JSON form for you.

### Context and `when` clauses

Positron does not use selectors, modes, or per-editor keymap tables in the Atom or Vim sense. The main scoping mechanism is the `when` clause.

Typical context keys include:

- `editorTextFocus` for normal editor focus
- `terminalFocus` for the integrated terminal
- `resourceLangId == r` or `resourceLangId == python` for language-specific rules
- `isPositron` for bindings that should only exist in Positron

Examples:

```json
[
  {
    "key": "ctrl+l",
    "command": "workbench.action.terminal.clear",
    "when": "terminalFocus"
  },
  {
    "key": "f1",
    "command": "workbench.action.openHelp",
    "when": "editorTextFocus && isPositron"
  }
]
```

### Arguments, command sequences, and removal rules

Unlike some editors, Positron user keybindings can pass arguments directly. This is especially useful with Positron commands that execute code in the Console.

Example: bind a reprex helper in R:

```json
[
  {
    "key": "cmd+shift+r",
    "command": "workbench.action.executeCode.console",
    "when": "editorTextFocus && isPositron",
    "args": {
      "langId": "r",
      "code": "reprex::reprex_selection()",
      "focus": true
    }
  }
]
```

You can also run multiple commands in sequence with `runCommands`:

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
    },
    "when": "editorTextFocus"
  }
]
```

To remove or block defaults:

```json
[
  {
    "key": "tab",
    "command": "-jumpToNextSnippetPlaceholder"
  },
  {
    "key": "ctrl+alt+r",
    "command": ""
  }
]
```

The first rule removes one specific built-in binding. The second shadows that shortcut entirely.

### Positron-specific commands and terminal quirks

Because Positron adds commands on top of the VS Code command system, you can bind Positron features exactly the same way you bind editor or workbench commands. Common examples include:

- `workbench.action.executeCode.console`
- `workbench.action.executeCode.silently`
- `workbench.action.positronConsole.focusConsole`

One Positron-specific quirk is terminal interception. Some shortcuts are consumed by the integrated terminal shell before the command system sees them. When that happens, add the command ID to `terminal.integrated.commandsToSkipShell` in `settings.json`:

```json
{
  "terminal.integrated.commandsToSkipShell": [
    "workbench.action.positronConsole.focusConsole"
  ]
}
```

### Extension keybindings

Positron is compatible with VS Code extensions, so extension authors use the normal VS Code command and keybinding model:

1. Register a command handler in code.
2. Contribute the command in `package.json`.
3. Contribute a keybinding in `package.json`.

Command registration:

```ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'myExtension.runSelection',
    () => {
      void vscode.commands.executeCommand(
        'workbench.action.executeCode.console'
      );
    }
  );

  context.subscriptions.push(disposable);
}
```

Manifest contribution:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "myExtension.runSelection",
        "title": "Run Selection in Positron Console",
        "enablement": "isPositron"
      }
    ],
    "keybindings": [
      {
        "command": "myExtension.runSelection",
        "key": "ctrl+alt+r",
        "mac": "cmd+alt+r",
        "when": "editorTextFocus && isPositron"
      }
    ]
  }
}
```

For extension authors, the equivalents of the usual keybinding concepts are:

- `command`: the command ID in both `commands` and `keybindings`
- `context`: the `when` clause
- platform overrides: `key` plus optional `mac`, `linux`, or `win`
- Positron detection: `isPositron` in `when` or `enablement`

There is no separate selector system, and extension-contributed keybindings are declarative. If an extension needs dynamic behavior or custom arguments, it should handle that inside the command implementation rather than expecting extra keybinding-only fields.

### Additional notes

- The Keyboard Shortcuts editor is the fastest way to inspect conflicts, search by command ID, and open the JSON form of a rule.
- Positron inherits VS Code's keyboard troubleshooting logs through **Developer: Toggle Keyboard Shortcuts Troubleshooting**.
- Extension-installed keybindings appear alongside built-in bindings in the Default Keyboard Shortcuts view, and user rules can still override them.
