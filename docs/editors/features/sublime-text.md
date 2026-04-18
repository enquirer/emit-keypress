# Sublime Text

## Keybindings

Sublime Text keybindings live in `.sublime-keymap` files. Each file contains a JSON array of binding objects, and each binding maps one key press or key sequence to a command, optionally with `args` and one or more `context` conditions.

### tl;dr

- Modifiers: Sublime Text uses modifiers such as `ctrl`, `alt`, `super`, and the cross-platform alias `primary`; on macOS it also recognizes `command` and `option`.
- Shortcuts: A single shortcut is written as a one-element `"keys"` array such as `["primary+shift+b"]`.
- Chords: Multi-step bindings are supported by adding more entries to the `"keys"` array, for example `["ctrl+k", "ctrl+u"]`.
- Conditions: Use the `"context"` array to scope a binding with built-in keys such as `selector`, `panel`, `panel_has_focus`, `overlay_visible`, or plugin-defined context keys.
- Args: Supported through the `"args"` object.
- Platform: There is no per-binding `"platform"` field. Cross-platform bindings usually use `primary`, while platform-specific defaults are typically separated by package resources rather than inline properties.
- Removal: There is no Atom-style `unset!` directive. You usually override an existing binding later in the merge order, often from the `User` package, for example by rebinding it to `noop`.
- Extension bindings: Packages contribute `.sublime-keymap` files and Python commands implemented as `ApplicationCommand`, `WindowCommand`, or `TextCommand`.
- Other features: Context keys support `operator`, `operand`, and `match_all`, and plugins can define custom context keys with `on_query_context(...)`.

### Keymap shape

```ts
type SublimeKeyBinding = {
  keys: string[]
  command: string
  args?: Record<string, unknown>
  context?: Array<{
    key: string
    operator?: string
    operand?: unknown
    match_all?: boolean
  }>
}
```

Every `.sublime-keymap` file is an array of these objects:

```json
[
  {
    "keys": ["primary+shift+b"],
    "command": "build",
    "args": { "select": true }
  },
  {
    "keys": ["primary+alt+up"],
    "command": "noop",
    "context": [
      { "key": "panel", "operand": "find" },
      { "key": "panel_has_focus" }
    ]
  }
]
```

### User keybinding file

User keybindings live in the `User` package as `Packages/User/Default.sublime-keymap`. The usual way to edit them is `Preferences > Key Bindings`, which opens the default bindings alongside your user keymap so you can override them without editing packaged defaults directly.

Sublime merges keymap resources across packages. `Default` is ordered first, `User` is ordered last, and other packages are ordered alphabetically, so user keybindings are the normal place to take precedence over shipped or package-provided bindings.

### Key syntax

The `"keys"` property is always an array of strings:

- a single shortcut uses one string
- a chord uses multiple strings in sequence

Examples:

```json
[
  {
    "keys": ["escape"],
    "command": "hide_panel"
  },
  {
    "keys": ["ctrl+k", "ctrl+u"],
    "command": "upper_case"
  }
]
```

Supported modifier names include:

- `ctrl` or `control`
- `alt`
- `option` on macOS
- `command` on macOS
- `super`
- `primary`

Key names use the non-shifted printed character where possible, or names such as `up`, `down`, `left`, `right`, `tab`, `enter`, `backspace`, `delete`, `pageup`, `pagedown`, `space`, and `escape`.

### Context and scoping

Sublime Text uses a `"context"` array instead of selectors or a `when` string. Each context object describes one condition that must match for the binding to be active.

Common built-in context keys include:

- `selector` for syntax-scope matching
- `selection_empty`
- `panel`
- `panel_visible`
- `panel_has_focus`
- `overlay_visible`
- `popup_visible`
- `auto_complete_visible`
- `preceding_text`
- `following_text`
- `num_selections`

Example bindings:

```json
[
  {
    "keys": ["tab"],
    "command": "indent",
    "context": [
      { "key": "selection_empty", "operand": false, "match_all": true }
    ]
  },
  {
    "keys": ["primary+/"],
    "command": "toggle_comment",
    "context": [
      { "key": "selector", "operand": "source.js", "match_all": true }
    ]
  }
]
```

The scope condition is just one possible context entry. Sublime Text uses structured JSON objects rather than a single expression string.

### Commands and arguments

The `"command"` value is the command name to execute, and `"args"` is a JSON object passed to that command.

Example:

```json
[
  {
    "keys": ["primary+shift+1"],
    "command": "set_layout",
    "args": {
      "cols": [0.0, 0.5, 1.0],
      "rows": [0.0, 1.0],
      "cells": [[0, 0, 1, 1], [1, 0, 2, 1]]
    }
  }
]
```

This makes the keybinding format more flexible: you can dispatch the same command with different argument objects from different bindings.

### Unbinding and overriding

Sublime Text does not provide a first-class `unset!`, `remove`, or `disable` directive in keymap entries. To change behavior, you normally add a later binding in your user keymap with the same key sequence and a context that takes precedence.

Common patterns include:

```json
[
  {
    "keys": ["primary+alt+up"],
    "command": "noop"
  }
]
```

or rebinding the same shortcut to a different command:

```json
[
  {
    "keys": ["primary+d"],
    "command": "find_under_expand"
  }
]
```

Because package resources are merged with `User` last, user overrides are typically enough unless two package bindings differ by context specificity.

### Packages and extension keybindings

Packages can contribute keybindings in `.sublime-keymap` files and implement commands in Python plugins.

The command side is usually one of:

- `sublime_plugin.ApplicationCommand`
- `sublime_plugin.WindowCommand`
- `sublime_plugin.TextCommand`

Minimal example:

```py
import datetime
import sublime_plugin


class InsertDateCommand(sublime_plugin.TextCommand):
    def run(self, edit, fmt="%Y-%m-%d"):
        self.view.insert(edit, self.view.sel()[0].begin(), datetime.datetime.now().strftime(fmt))
```

Keybinding file:

```json
[
  {
    "keys": ["primary+alt+d"],
    "command": "insert_date",
    "args": { "fmt": "%Y-%m-%d" }
  }
]
```

For package authors:

- `command`: the `"command"` string such as `insert_date`
- `args`: the `"args"` object
- `context`: the `"context"` array in the keymap file
- conditions: use the `"context"` array

Plugins can also define custom context keys by implementing `on_query_context(view, key, operator, operand, match_all)` in an event listener, which lets package keybindings participate in editor-specific state checks.

Example:

```py
import sublime_plugin


class ExampleListener(sublime_plugin.EventListener):
    def on_query_context(self, view, key, operator, operand, match_all):
        if key == "example_is_python":
            return view.match_selector(view.sel()[0].begin(), "source.python")
        return None
```

Then the package can use that custom context in a key binding:

```json
[
  {
    "keys": ["primary+alt+r"],
    "command": "example_run",
    "context": [
      { "key": "example_is_python" }
    ]
  }
]
```

### Additional notes

- There is no separate selector key at the top level of a binding; all scoping lives inside `"context"`.
- Package keymaps are merged resources, so file and package ordering matter when identical key sequences collide.
- Built-in command names are not documented in one canonical list; in practice, many are discovered by inspecting the shipped `Default` package keymaps and menus.
- If a short standalone binding uses the same prefix as a multi-step binding, the standalone binding can block the longer sequence, so prefix conflicts matter when designing chords.
