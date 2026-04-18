# Nano

## Keybindings

Nano keybindings are configured in `nanorc` with line-oriented `bind` and `unbind` commands. A binding targets a named menu such as `main`, `search`, `browser`, or `all`, and it maps a terminal-style key descriptor to either a built-in function or a literal string/macro.

### tl;dr

- Modifiers: Nano uses terminal-style notation such as `^X` for Ctrl, `M-X` for Meta/Alt, `Sh-M-X` for Shift+Meta on letters, plus `F1` through `F24`, `Ins`, and `Del`.
- Shortcuts: A single binding is written as `bind key function menu` or `bind key "string" menu`.
- Chords: Nano does not define multi-step key chords. One key can instead expand to a literal string or a macro-like sequence.
- Conditions: Bindings are scoped by `menu`, such as `main`, `search`, `replace`, `browser`, `execute`, or `all`.
- Args: There is no separate argument field. A binding either runs a built-in function or emits a string that can include literal text, control codes, and braced function names.
- Platform: There is no platform override field. Key names are interpreted at the terminal layer, so behavior can depend on terminal and terminfo handling.
- Removal: `unbind key menu` removes a binding from a specific menu or from `all`.
- Extension bindings: Nano does not provide an extension or plugin keybinding API. Bindings target built-in functions or strings defined in `nanorc`.
- Other features: `set rawsequences` and `set rebinddelete` change how Nano interprets terminal key sequences, which matters when Delete, Backspace, or escape sequences are misdetected.

### Keymap shape

```ts
type NanoKeybinding =
  | `bind ${key} ${functionName} ${menu}`
  | `bind ${key} "${string}" ${menu}`
  | `unbind ${key} ${menu}`;
```

Nano reads one command per line from `nanorc`. For keybindings, the important commands are:

- `bind key function menu`
- `bind key "string" menu`
- `unbind key menu`

### Properties

- `key` **{string}**: A key descriptor such as `^S`, `M-R`, `Sh-M-U`, `F10`, `Ins`, or `Del`.
- `function` **{string}**: A built-in Nano function name such as `savefile`, `replace`, `whereis`, `execute`, `undo`, or `suspend`.
- `string` **{string}**: Literal text, control codes, or a mixed sequence containing braced function names such as `{execute}`.
- `menu` **{string}**: The menu where the binding is active, such as `main`, `search`, `replace`, `writeout`, `browser`, `execute`, `help`, `linter`, or `all`.

### User keybinding file

Nano reads keybindings from the normal configuration file:

- System-wide: `/etc/nanorc`
- Per-user: `~/.nanorc`
- Per-user XDG locations: `$XDG_CONFIG_HOME/nano/nanorc` or `~/.config/nano/nanorc`
- Alternate file: `nano --rcfile path/to/file`

`nanorc` is a single command-oriented config file, so keybinding lines sit alongside other editor options. The `include` directive is for syntax-definition files, not for general `nanorc` keybinding fragments.

Example user configuration:

```conf
bind ^S savefile main
bind M-R replace main
bind F9 "TODO: " main
unbind ^T help
```

### Key syntax

Nano documents these key forms for rebinding:

- `^X`: Ctrl plus a Latin letter, one of `@`, `]`, `\`, `^`, `_`, or the word `Space`
- `M-X`: Meta/Alt plus an ASCII character except `[`, or `Space`, `Left`, `Right`, `Up`, or `Down`
- `Sh-M-X`: Shift+Meta plus a Latin letter
- `F1` through `F24`
- `Ins`
- `Del`

Examples:

```conf
bind ^W whereis main
bind M-Up up browser
bind F10 exit help
```

Nano does not define multi-key chord syntax. If one keystroke needs to trigger several actions, the string form can emit text and invoke braced function names in sequence.

### Menus and scope

Nano scopes bindings by menu name rather than by a general expression language. The menu determines where the key is active.

Common menu names include:

- `main`
- `search`
- `replace`
- `replacewith`
- `yesno`
- `gotoline`
- `writeout`
- `insert`
- `browser`
- `whereisfile`
- `gotodir`
- `execute`
- `help`
- `spell`
- `linter`
- `all`

`all` is special. With `bind key function all`, it applies the binding anywhere that function exists. With `bind key "string" all` or `unbind key all`, it operates anywhere that key currently exists.

Examples:

```conf
bind ^T whereis main
bind ^T whereisfile browser
bind M-G gotoline main
unbind F1 all
```

### Function bindings and string bindings

The normal form binds a key directly to a built-in Nano function:

```conf
bind ^O writeout main
bind ^X exit main
bind M-U undo main
```

The string form makes a key produce text or a macro-like sequence:

```conf
bind F9 "TODO: " main
bind F12 "{location}" main
```

In string bindings, braced names invoke built-in functions at execution time. This form is more flexible, but Nano warns that using a function in an inappropriate menu can cause strange behavior or even a crash.

### Command arguments and macros

Nano has no structured argument object for keybindings. A binding can either:

- call a built-in function by name
- emit literal text
- include control codes
- embed braced function names inside a string

This means parameterized behavior is expressed as macro content rather than as named fields.

Example:

```conf
bind F9 "{execute}sort^M" main
```

This enters the execute prompt, types `sort`, and sends Enter via `^M`.

### Limitations and terminal quirks

Some keys are intentionally awkward or impossible to rebind:

- Rebinding `^[` is not possible because Escape starts Meta keystrokes and escape sequences.
- Rebinding the dedicated cursor keys such as arrows, Home, End, PageUp, and PageDown is not possible.
- Rebinding `^M` or `^I` is possible but discouraged because they are Enter and Tab.
- On some terminals, `^H` cannot be rebound cleanly unless Nano is started with `--raw`.

Two `nanorc` options matter when terminal key decoding is wrong:

- `set rawsequences`: interpret escape sequences directly instead of relying on `ncurses`
- `set rebinddelete`: treat Delete and Backspace differently when the terminal reports them ambiguously

These options affect how Nano recognizes keys before keybinding lookup even happens.

### Extension and plugin keybindings

Nano does not expose an extension API for registering new commands or shipping keybindings. Keybindings can target Nano’s built-in function list, and syntax definitions can contribute syntax-aware tools such as formatters and linters, but they do not add a package-style command registry with its own keybinding contribution format.

### Additional notes

- Nano 8.0 changed several default search-related shortcuts. The manual documents `bind` lines that restore the older behavior when needed.
- `recordmacro` and `runmacro` are ordinary built-in functions, so they can be rebound like any other Nano command.
- The menu name is part of the binding identity, so the same key can do different things in `main`, `browser`, and prompt menus.
- Because bindings are interpreted through the terminal, the same `nanorc` file can behave differently across terminal emulators if their escape sequences differ.
