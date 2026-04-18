# Lapce

## Keybindings

Lapce stores custom keybindings as TOML in a global `keymaps.toml` file and exposes them through the `Open Keyboard shortcuts` UI. Each binding is a `[[keymaps]]` table with a shortcut string, a command ID, and optional `mode` and `when` filters.

### tl;dr

- Modifiers: `Ctrl`, `Alt`, `AltGr`, `Shift`, and `Meta`. In the UI, `Meta` is shown as `Cmd` on macOS and `Win` on Windows.
- Shortcuts: written as strings like `ctrl+p`, `meta+shift+p`, or `Ctrl+MouseMiddle`.
- Chords: supported as space-separated sequences like `ctrl+k ctrl+d` or `meta+k meta+s`.
- Conditions: optional `when` expressions using condition names such as `editor_focus` or `list_focus`, with `!`, `&&`, and `||`.
- Args: not supported in the keymap entry itself.
- Platform: no per-entry platform field in `keymaps.toml`; Lapce ships separate built-in defaults for macOS vs non-macOS, and your user file overrides whatever defaults apply on that machine.
- Removal: clear a shortcut in the Keyboard Shortcuts UI, or remove a default binding in `keymaps.toml` by using the same key/mode/when and prefixing the command with `-`.
- Extension bindings: Lapce documents plugin metadata and language/theme contribution points, but not a stable manifest field for plugins to contribute keybindings directly.
- Other features: modal mode filters, mouse bindings, and terminal pass-through for unhandled keys in terminal mode.

### Keymap shape

```ts
type LapceKeymap = {
  keymaps: Array<{
    key: string
    command: string
    mode?: string
    when?: string
  }>
}
```

The `key` field is parsed as one or more key presses. The `command` is a Lapce command ID such as `palette`, `open_keyboard_shortcuts`, or `toggle_line_comment`.

### Properties

- `key` **{string}**: A shortcut, chord, or mouse binding such as `ctrl+p`, `ctrl+k ctrl+d`, or `Ctrl+MouseMiddle`.
- `command` **{string}**: The command ID to run. Prefix the ID with `-` to remove an existing binding instead of adding one.
- `mode` **{string}**: Optional modal scope. The built-in keymaps use short mode tags such as `i` for insert mode and `n` for normal mode.
- `when` **{string}**: Optional condition expression such as `list_focus`, `!source_control_focus`, or `editor_focus && !list_focus`.

### User keybinding file

Lapce keeps user overrides in a global `keymaps.toml` file under its config directory. The Keyboard Shortcuts UI is the easiest way to edit it because Lapce opens and maintains the right file for the current installation.

The file format is an array of TOML tables under `keymaps`:

```toml
[[keymaps]]
key = "ctrl+p"
command = "palette"

[[keymaps]]
key = "ctrl+shift+p"
command = "palette.command"
```

Unlike settings, which also support per-workspace overrides through `.lapce/settings.toml`, keymaps are loaded from the global `keymaps.toml` file. There is no parallel documented workspace-local keymap file.

### Basic examples

A few representative entries:

```toml
[[keymaps]]
key = "ctrl+/"
command = "toggle_line_comment"

[[keymaps]]
key = "ctrl+k ctrl+d"
command = "select_skip_current"
mode = "i"

[[keymaps]]
key = "Ctrl+MouseMiddle"
command = "goto_definition"
```

A context-specific binding:

```toml
[[keymaps]]
key = "enter"
command = "source_control_commit"
when = "source_control_focus"
```

A modal binding that only applies in normal mode when modal editing is enabled:

```toml
[[keymaps]]
key = "shift+i"
command = "insert_first_non_blank"
mode = "n"
```

### Shortcut syntax

Lapce key strings are space-separated key presses, and each key press uses `+` between modifiers and the key name:

- `ctrl+p`
- `meta+shift+p`
- `ctrl+k ctrl+d`
- `Ctrl+MouseMiddle`

The parser also understands mouse buttons such as `MouseForward`, `MouseBackward`, and combinations with modifiers.

It also special-cases the literal `+` key, so bindings like `+` and `Ctrl++` are valid.

The built-in defaults mostly use lowercase names in the TOML files, but the visible labels shown in the UI are normalized as `Ctrl+`, `Alt+`, `AltGr+`, `Shift+`, and `Meta+`/`Cmd+`/`Win+`.

### Context, modes, and `when`

Lapce has two separate scoping mechanisms:

- `mode` limits a binding to a modal editor state such as insert or normal mode.
- `when` limits a binding to UI/editor conditions.

The current condition names exposed by Lapce include:

- `editor_focus`
- `input_focus`
- `list_focus`
- `palette_focus`
- `completion_focus`
- `inline_completion_visible`
- `modal_focus`
- `in_snippet`
- `terminal_focus`
- `source_control_focus`
- `panel_focus`
- `rename_focus`
- `search_active`
- `on_screen_find_active`
- `search_focus`
- `replace_focus`

`when` expressions support:

- negation with `!`
- conjunction with `&&`
- disjunction with `||`

Examples:

```toml
[[keymaps]]
key = "ctrl+p"
command = "up"
when = "!list_focus"
mode = "i"

[[keymaps]]
key = "ctrl+enter"
command = "search"
when = "editor_focus && !search_active"
```

There is no separate selector language, and there is no argument payload attached to a keybinding. If you need different behavior in different contexts, you express it with `mode`, `when`, or different command IDs.

### Removing or overriding bindings

Lapce supports two practical ways to clear bindings:

1. In `Open Keyboard shortcuts`, remove the shortcut through the UI.
2. In `keymaps.toml`, add a matching entry whose `command` starts with `-`.

For example, to remove Lapce's default `ctrl+p` file palette binding:

```toml
[[keymaps]]
key = "ctrl+p"
command = "-palette"
```

If the original binding also had a `mode` or `when` restriction, your removal entry must match those fields too.

### Platform behavior

Lapce's shipped defaults are split across common bindings plus separate macOS and non-macOS keymap files. That is why the defaults use `meta+...` on macOS for commands like `palette` and `ctrl+...` on Linux and Windows.

Your own `keymaps.toml` entries do not have a `platform` field. If you sync config across machines, you usually maintain machine-specific overrides or choose bindings that make sense on each target platform.

### Commands and arguments

A keybinding points to a command ID only. There is no documented `args`, `data`, or inline parameter field inside `keymaps.toml`.

That matters in two ways:

- user keymaps are simple and predictable
- commands that need extra data must get it from Lapce state, the active UI context, or some other workflow outside the keymap entry

### Plugins and extension-contributed bindings

Lapce plugins are distributed with a `volt.toml` manifest and can contribute themes, icon themes, and language-related integration. The public Lapce docs do not currently describe a stable plugin manifest field for contributing keybindings, and the shipped keymap loader expects `command` strings that resolve against Lapce's command registry.

In practice, treat plugin-provided default keybindings as undocumented rather than a first-class, user-facing contribution system comparable to VS Code's `contributes.keybindings`.

### Major quirks and limitations

- Keymaps are global, not workspace-local.
- There is no declarative `args` field.
- There is no per-entry platform override field.
- Modal-only bindings are ignored when modal editing is off, except for insert and terminal-relevant mappings.
- Terminal mode has special pass-through behavior: if Lapce does not handle a keybinding and the focused terminal is in terminal mode, the keypress is forwarded to the terminal.
