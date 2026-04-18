# Micro

## Keybindings

Micro keybindings are defined in `JSON`. User overrides live in `~/.config/micro/bindings.json`, and the `> bind` command writes the same format. Each binding maps a key expression to an action string, a command-bar action, a Lua function, or a pane-specific subgroup.

### tl;dr

- Modifiers: `Ctrl`, `Alt`, `Shift`, function keys, named keys such as `Home`, and mouse buttons such as `MouseLeft`. `CtrlG`, `Ctrl-G`, and `Ctrl-g` are treated the same; `Alt` bindings remain case-sensitive.
- Shortcuts: key strings such as `Ctrl-s`, `Alt-g`, `F10`, or `MouseWheelUp`.
- Chords: supported as bracketed key sequences made from valid keys in order.
- Conditions: expressed by pane type with `buffer`, `command`, and `terminal` subgroups.
- Args: action bindings are strings; command-bar bindings can include literal command text with `command:` or `command-edit:`.
- Platform: the same `bindings.json` format is used everywhere, with a few different defaults on macOS. Terminal configuration still determines which key events Micro can actually receive.
- Removal: set a binding to `None` to disable it.
- Extension bindings: plugins can expose Lua functions for `lua:plugin.function` bindings and can register commands or runtime bindings from Lua.
- Other features: action chaining with `,`, `|`, and `&`; raw escape-sequence bindings for terminal-specific keys; pane-specific keymaps.

### Binding file shape

```json
{
  "Ctrl-y": "Undo",
  "Ctrl-z": "Redo",
  "Alt-s": "Save,Quit",
  "Alt-p": "command:pwd",
  "Ctrl-g": "command-edit:help ",
  "Alt-q": "lua:initlua.bar",
  "command": {
    "Ctrl-w": "DeleteWordLeft"
  },
  "terminal": {
    "Ctrl-q": "Exit"
  }
}
```

### Properties

- `key` **{string}**: a Micro key name such as `Ctrl-s`, `Alt-g`, `Home`, `F10`, `MouseLeft`, or a bracketed key sequence.
- `action` **{string}**: a bindable action such as `Save`, a chained action such as `Autocomplete|IndentSelection|InsertTab`, a command-bar action such as `command:pwd`, a staged command such as `command-edit:goto `, a Lua callback such as `lua:initlua.bar`, or `None`.
- `command` **{object}**: bindings active only in the command bar.
- `terminal` **{object}**: bindings active only in terminal panes.
- `buffer` **{object}**: bindings scoped to normal editor buffers.

### Basic examples

User bindings:

```json
{
  "Ctrl-y": "Undo",
  "Ctrl-z": "Redo",
  "Alt-s": "Save,Quit",
  "Tab": "Autocomplete|IndentSelection|InsertTab"
}
```

Command-bar bindings:

```json
{
  "Alt-p": "command:pwd",
  "Ctrl-g": "command-edit:help "
}
```

Pane-specific bindings:

```json
{
  "command": {
    "Ctrl-w": "DeleteWordLeft",
    "Up": "HistoryUp"
  },
  "terminal": {
    "Ctrl-q": "Exit"
  }
}
```

Lua function bindings:

```json
{
  "Alt-q": "lua:initlua.bar"
}
```

### Key notation and action strings

Micro resolves bindings from key strings to action strings. Action strings can point at built-in actions, command-bar commands, or Lua functions.

- `,` always continues to the next action.
- `|` stops the chain when the previous action succeeds.
- `&` stops the chain when the previous action fails.

This makes fallback bindings possible. The default `Tab` binding uses `Autocomplete|IndentSelection|InsertTab`, which first tries autocomplete, then indentation, then a literal tab insert.

If an action string needs a literal `,`, `|`, or `&`, the character must be escaped with `\` or wrapped in quotes inside the action string.

Micro also accepts raw escape-sequence bindings. That is useful when a terminal can emit a custom escape for a key combination that is otherwise indistinguishable from another key event.

### Where user keybindings live

User overrides live in `~/.config/micro/bindings.json`. If the file does not exist, it can be created manually. The `> bind 'key' 'action'` command updates the same file and replaces any existing binding for that key.

Bindings can also call Lua functions from `~/.config/micro/init.lua` by using the `initlua` plugin name in a `lua:` action.

### Context and pane-specific scopes

Micro scopes keybindings by pane type instead of by selector or expression language. The available pane groups are:

- `buffer`: normal editing panes.
- `command`: the command bar.
- `terminal`: embedded terminal panes.

Pane groups are nested objects inside `bindings.json`. This allows the same key to do different things in the editor, command bar, and terminal pane.

### Commands, Lua callbacks, and extension bindings

Micro supports three keybinding targets beyond plain built-in actions:

- `command:` runs a command-bar command immediately.
- `command-edit:` opens the command bar with prefilled text and leaves the cursor in the infobar.
- `lua:` calls a Lua function exposed by a plugin or by `init.lua`.

Plugin authors can register commands with `micro/config.MakeCommand(...)` and can add runtime bindings with `micro/config.TryBindKey(...)`. A plugin can also expose Lua functions that users bind directly from `bindings.json`. Runtime keybinding changes can be rejected when the `lockbindings` option is enabled.

Example plugin:

```lua
local micro = import("micro")
local config = import("micro/config")

function insertdate(bp, args)
  micro.InfoBar():Message(os.date("%F"))
  return true
end

function init()
  config.MakeCommand("insertdate", insertdate, config.NoComplete)
  config.TryBindKey("Alt-d", "command:insertdate", true)
end
```

Example user binding to a plugin function:

```json
{
  "Alt-d": "lua:myplugin.insertdate"
}
```

### Disabling and overriding bindings

Any default binding can be disabled by assigning it to `None` in `bindings.json`.

```json
{
  "Ctrl-q": "None"
}
```

Overriding a default binding uses the same key with a new action string. Because bindings are terminal-driven, an override only works when the terminal actually emits a distinct event for that key combination.

### Limitations and editor-specific behavior

- Terminal input is the hard limit on what can be bound. If the terminal sends the same escape sequence for two different key combinations, Micro cannot distinguish them.
- Some `Ctrl-Shift` combinations collapse to the same event as plain `Ctrl` bindings in terminals.
- `Alt` handling depends on terminal configuration. On macOS, terminals often need an explicit "use Option as Meta" style setting before `Alt-...` bindings reach Micro.
- The `> raw` command is the practical debugging tool for keybinding issues because it shows the exact events Micro receives from the terminal.
