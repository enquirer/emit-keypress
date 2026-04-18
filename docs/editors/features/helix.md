# Helix

## Keybindings

Helix key remapping is configured in TOML. Bindings live under `keys` tables in `config.toml`, are primarily scoped by editing mode, and can be extended by nesting tables for minor modes such as `g`, `z`, or custom prefixes.

### tl;dr

- Modifiers: `C-`, `A-`, and `S-` encode Ctrl, Alt, and Shift. `Meta-`, `Cmd-`, and `Win-` are synonyms for the super key when the terminal supports the enhanced keyboard protocol.
- Shortcuts: single bindings map TOML keys such as `C-s`, `ret`, `up`, or `?` to a command string.
- Chords: multi-step bindings are written as nested tables such as `[keys.normal.g]` for `g` followed by another key.
- Conditions: bindings are scoped by mode tables such as `[keys.normal]`, `[keys.insert]`, and `[keys.select]`, plus nested minor-mode tables.
- Args: static commands do not take structured keybinding arguments, but typable commands can be bound as literal command-mode strings such as `":write"` or `":open path"`.
- Platform: the same keymap format is used across platforms; there is no separate per-platform binding block in the keymap schema.
- Removal: bind a key to `no_op` to disable it, or override a built-in binding by assigning a new command in user or project config.
- Extension bindings: the official docs describe binding built-in static commands, typable commands, and macros. They do not document a general extension API for third-party commands or contributed keymaps.
- Other features: bindings can run command sequences via arrays, invoke macros with `@...`, and custom project-local `.helix/config.toml` files merge with global config.

### Keymap shape

```ts
type HelixCommand =
  | string
  | string[]
  | {
      [nextKey: string]: HelixCommand
    };

type HelixKeymap = {
  keys?: {
    normal?: Record<string, HelixCommand>;
    insert?: Record<string, HelixCommand>;
    select?: Record<string, HelixCommand>;
  };
};
```

In practice:

- a string value can be a static command such as `move_char_left`
- a string value can also be a typable command such as `":write"` or `":open ~/.config/helix/config.toml"`
- an array runs multiple commands in order
- a nested table creates a minor mode or key sequence
- a macro string starts with `@`

### User keybinding files

Helix reads user keybindings from `config.toml` in the config directory:

- Linux and macOS: `~/.config/helix/config.toml`
- Windows: `%AppData%\\helix\\config.toml`

Helix can also merge project-local configuration from `.helix/config.toml` inside the repository or project root. That is the same file format, so project-specific key overrides can live alongside global ones.

### Key syntax

Helix key names are TOML keys on the left-hand side of a mapping:

```toml
[keys.normal]
C-s = ":write"
"C-S-esc" = "normal_mode"
ret = ["open_below", "normal_mode"]
"?" = ":write"
```

- Letter keys can be written directly, such as `a`, `g`, or `j`.
- Special keys use names such as `ret`, `backspace`, `tab`, `esc`, `left`, `right`, `up`, `down`, `home`, `end`, `pageup`, `pagedown`, `del`, and `ins`.
- Punctuation keys such as `?`, `!`, and `-` can be used literally when needed.
- Modifier syntax uses prefixes such as `C-s`, `A-x`, or `"C-S-esc"`.
- Modifier keystrokes inside macros are wrapped in angle brackets, such as `@x<A-d>`.

One syntax quirk: `-` cannot be combined with a modifier using `A--`; the key name must be spelled out as `A-minus`.

### Modes, minor modes, and scope

Helix scopes keybindings by mode rather than by selector expressions or focus predicates.

- `[keys.normal]` applies in normal mode.
- `[keys.insert]` applies in insert mode.
- `[keys.select]` applies in select mode.

Nested tables define minor modes and multi-key sequences:

```toml
[keys.normal.g]
a = "code_action"

[keys.normal.z]
j = "scroll_up"
k = "scroll_down"
```

This means `ga` and `zj` are modeled as entries inside mode-specific submaps. Helix also allows entirely custom prefixes:

```toml
[keys.normal."+"]
m = ":run-shell-command make"
c = ":run-shell-command cargo build"
t = ":run-shell-command cargo test"
```

The scope model is intentionally simple: mode and key-sequence context determine which mapping applies. Helix does not use a separate declarative condition language in keymaps.

### Command types

Helix documents three command forms that can appear in keymaps.

#### Static commands

Static commands are built-in editor actions such as `move_char_left`, `delete_selection`, `format_selections`, or `goto_definition`. These are the main command IDs used for movement, editing, selection handling, and editor actions.

```toml
[keys.normal]
H = "goto_line_start"
L = "goto_line_end"
```

#### Typable commands

Typable commands are the same commands used from `:` command mode. A keybinding can map directly to a command string, including literal arguments:

```toml
[keys.normal]
C-s = ":write"
C-o = ":open ~/.config/helix/config.toml"
```

This is Helix's documented way to attach arguments to a binding. There is no separate `args` field in the keymap schema.

#### Command sequences

Arrays run several commands in order:

```toml
[keys.normal]
ret = ["open_below", "normal_mode"]
```

This is useful when a custom binding should perform a short fixed sequence of editor actions.

#### Macros

Macros are key sequences encoded as strings that begin with `@`:

```toml
[keys.normal]
"A-x" = "@x<A-d>"
```

This example selects the current line with `x` and then deletes it without yanking via `<A-d>`.

Macros and command sequences are separate mechanisms. Helix documents that macro keybindings are not allowed inside command sequences.

### Basic examples

Basic normal-mode remaps:

```toml
[keys.normal]
C-s = ":write"
H = "goto_line_start"
L = "goto_line_end"
```

Insert-mode customization:

```toml
[keys.insert]
j = { k = "normal_mode" }
"A-x" = "normal_mode"
```

Disabling default insert-mode cursor movement keys:

```toml
[keys.insert]
up = "no_op"
down = "no_op"
left = "no_op"
right = "no_op"
pageup = "no_op"
pagedown = "no_op"
home = "no_op"
end = "no_op"
```

Project-local overrides in `.helix/config.toml`:

```toml
[keys.normal]
C-b = ":run-shell-command cargo build"
C-t = ":run-shell-command cargo test"
```

### Platform behavior

Helix does not define separate macOS, Windows, or Linux sections for keymaps. The same TOML format is used everywhere.

Platform differences mainly show up in terminal input support:

- `Meta-`, `Cmd-`, and `Win-` are synonyms for the super modifier.
- Super-key bindings depend on terminal support for the enhanced keyboard protocol.
- Terminal emulators may intercept or fail to send some combinations before Helix sees them.

### Unbinding and overriding

Helix uses the built-in `no_op` command to disable a key:

```toml
[keys.insert]
up = "no_op"
```

Overriding a default mapping is just another assignment in the same mode table:

```toml
[keys.normal]
H = "goto_line_start"
L = "goto_line_end"
```

Because project-local `.helix/config.toml` files are merged with global config, they can also override global bindings for a repository or workspace.

### Extension and plugin keybindings

The official Helix keybinding docs cover remapping built-in static commands, typable commands, command sequences, and macros from configuration files.

Helix's user documentation does not describe a general third-party extension system for registering new editor commands and shipping contributed keymaps. In practice, keybinding customization is documented around built-in editor commands plus integrations that already exist inside Helix, such as language-server-powered actions exposed by built-in commands like `code_action`, `goto_definition`, or `:lsp-workspace-command`.

That means there is no documented keymap entry shape with extension-specific fields such as a separate command registration block, command-argument object, or per-extension condition clause. Customization is done by choosing which documented Helix commands to bind and where to bind them.

### Limitations and quirks

- Helix documents its current model as one-way key remapping.
- Prompt, picker, completion-menu, popup, and signature-help popup bindings are documented separately and are currently not remappable.
- Some mappings depend on an active language server or a tree-sitter grammar.
- Terminal defaults can conflict with Helix bindings before the editor receives the keystroke.
