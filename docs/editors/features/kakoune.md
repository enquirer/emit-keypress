# Kakoune

## Keybindings

Kakoune keybindings are defined with commands in Kakoune script, not in a JSON or TOML keymap file. The main entry points are `map` for creating bindings and `unmap` for removing them. Bindings are attached to a `scope` and a `mode`, and the mapped action is expressed as the sequence of keys Kakoune should execute.

### tl;dr

- Modifiers: Kakoune key names use angle-bracket notation such as `<c-x>`, `<a-x>`, `<s-tab>`, `<ret>`, `<esc>`, and `<space>`.
- Shortcuts: A single binding is usually written as `map <scope> <mode> <key> <keys>`.
- Chords: Multi-step flows are primarily modeled with modes such as `goto`, `view`, `object`, and custom `user` modes. A mapping can also execute a longer key sequence on the right-hand side.
- Conditions: Bindings are scoped by `scope` and `mode`. Context-specific bindings are commonly installed with hooks, for example on `filetype` changes or buffer events.
- Args: `map` does not have a structured `args` field. Mappings pass data by invoking commands and expansions such as `%val{count}` or `%val{register}`.
- Platform: The mapping syntax is the same across platforms. Actual key availability depends on the terminal UI, keyboard layout, and the host environment.
- Removal: Use `unmap` to remove a binding, or replace it with a new `map` in the same or a narrower scope.
- Extension bindings: Plugins and user scripts contribute keybindings by sourcing `.kak` files that define commands, user modes, hooks, and `map` entries.
- Other features: `-docstring` attaches help text shown in Kakoune's info UI, and mapped right-hand-side keys always run as their original built-in keys rather than recursively going through other mappings.

### Keymap shape

Kakoune bindings are commands in Kakoune script:

```kak
map [<switches>] <scope> <mode> <key> <keys>
unmap [<switches>] <scope> <mode> <key> [<expected-keys>]
```

- `scope`: Where the binding lives. In practice this is usually `global`, `buffer`, or `window`.
- `mode`: The input mode that receives the binding, such as `normal`, `insert`, `prompt`, `user`, `goto`, `view`, or `object`.
- `key`: The trigger key.
- `keys`: The literal key sequence Kakoune should execute.
- `-docstring <text>`: Optional description used by Kakoune's automatic help display.

Unlike editors with declarative keymap objects, Kakoune bindings are executable configuration statements. They are usually stored in `kakrc` or in sourced `.kak` files.

### Where user keybindings live

User keybindings usually live in:

- `$XDG_CONFIG_HOME/kak/kakrc`
- `$HOME/.config/kak/kakrc` when `XDG_CONFIG_HOME` is not set
- `$XDG_CONFIG_HOME/kak/autoload/**/*.kak` for split-out or plugin-style configuration

Kakoune loads its runtime `kakrc`, then recursively loads user `autoload` scripts when that directory exists, and finally loads the user `kakrc`. That makes `autoload` a common place for reusable bindings, commands, and plugin code.

### Modes, scopes, and context

The two core dimensions of a Kakoune binding are scope and mode.

`scope` determines where the mapping is installed:

- `global` applies everywhere.
- `buffer` applies only in the current buffer.
- `window` applies only in the current window.

`mode` determines which key-processing state receives the binding:

- `normal` for regular editing commands.
- `insert` for insert mode.
- `prompt` for command and search prompts.
- `user` for the user prefix mode.
- `goto`, `view`, and `object` for Kakoune's built-in prefixed key modes.

For filetype-aware or workflow-specific bindings, Kakoune commonly uses hooks to install or remove mappings when a buffer enters a particular state:

```kak
hook global WinSetOption filetype=rust %{
    map buffer normal <ret> ':make<ret>' -docstring 'build current crate'
}
```

This keeps the binding local to the matching buffer and avoids turning context into a separate expression language inside the keybinding itself.

### Command data and expansions

The right-hand side of a mapping is a key sequence, so command arguments are usually expressed by calling Kakoune commands directly:

```kak
map global normal = ':echo count=%val{count} register=%val{register}<ret>' \
    -docstring 'show current count and register'
```

That pattern is how mappings forward counts, registers, options, and other runtime values into commands. When a mapping needs more logic, it is common to define a command first and map a key to `:<command><ret>`.

### Basic examples

A simple normal-mode mapping:

```kak
map global normal <c-n> ':new<ret>' -docstring 'new buffer'
```

An insert-mode mapping that reuses normal-mode behavior through `<a-;>`:

```kak
map global insert <a-backspace> '<a-;>db' -docstring 'delete previous word'
```

A custom user mode with its own prefix:

```kak
declare-user-mode lint
map global normal <space> ':enter-user-mode lint<ret>' -docstring 'lint mode'
map global lint n ':make-next-error<ret>' -docstring 'next error'
map global lint p ':make-previous-error<ret>' -docstring 'previous error'
```

Removing or replacing a binding:

```kak
unmap global normal Q
map global normal Q ':quit<ret>' -docstring 'quit current client'
```

### Extension and plugin keybindings

Kakoune plugins are typically just sourced Kakoune scripts. They contribute keybindings by defining commands, declaring user modes when needed, and adding `map` statements from files loaded through `autoload` or other sourced configuration.

A typical extension flow looks like this:

1. Define one or more commands with `define-command`.
2. Optionally create a custom prefix mode with `declare-user-mode`.
3. Add `map` entries in `global`, `buffer`, or `window` scope.
4. Use hooks when bindings should only exist for certain filetypes or editor states.

Example plugin-style script:

```kak
define-command format-buffer %{
    execute-keys '<a-|>prettier --stdin-filepath %val{buffile}<ret>'
}

declare-user-mode tools
map global normal , ':enter-user-mode tools<ret>' -docstring 'tools mode'
map global tools f ':format-buffer<ret>' -docstring 'format buffer'
```

There is no separate extension manifest for keybindings. The command definition, mode declaration, hook registration, and mapping all live in Kakoune script.

### Limitations and quirks

- Mappings are not recursive. The right-hand-side keys always execute their built-in meaning rather than passing through other mappings first.
- Terminal input places real limits on which key combinations can be distinguished, especially for some control-key combinations.
- Some keys used to cancel or exit editor states are reserved and are not meant to be remapped.
- Shifted printable keys are layout-dependent. Kakoune documents `s-` support primarily for ASCII letters and special keys rather than arbitrary printable characters.
- Because context usually lives in scopes, hooks, and modes, larger setups often organize bindings as commands plus hooks instead of trying to encode everything into one `map` line.
