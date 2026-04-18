# Emacs

## Keybindings

### tl;dr

- Modifiers: Emacs key notation uses prefixes such as `C-` for Control, `M-` for Meta/Alt, `S-` for Shift, `s-` for Super, `H-` for Hyper, and `A-` for Alt when those modifiers exist on the current system.
- Shortcuts: A single binding is usually written as a key description string such as `"C-x C-f"`, `"M-%"`, or `"<f5>"`.
- Chords: Multi-step sequences are a built-in part of Emacs keymaps; separate each keystroke with a space inside the key description string.
- Conditions: Emacs scopes keybindings through the active keymaps for the current context, such as the global map, the current major mode, enabled minor modes, minibuffer maps, or text-property and overlay keymaps.
- Args: Keybindings do not carry declarative argument objects. To pass arguments, bind the key to an interactive command or lambda that computes or supplies them.
- Platform: Platform-specific bindings are usually expressed with ordinary Emacs Lisp conditionals such as `system-type`, not with a dedicated per-platform keybinding syntax.
- Removal: Bindings can be removed with functions such as `keymap-unset`, `keymap-global-unset`, and `keymap-local-unset`. A higher-precedence map can also shadow a lower-precedence binding by storing its own entry.
- Extension bindings: Packages and built-in modes contribute bindings by defining commands, creating keymaps, and activating those keymaps for a major mode, minor mode, minibuffer, transient state, or other editor context.
- Other features: Emacs keymaps can dispatch to commands, keyboard macros, nested keymaps used as prefixes, and remapped commands. Unbound keys naturally fall through to lower-precedence maps.

### Keymap model

Emacs stores keybindings in keymaps. A keymap is a Lisp data structure that maps input events to definitions such as commands, keyboard macros, nested prefix maps, or menu items. Most user-facing customization works with higher-level helpers such as `keymap-set`, `keymap-global-set`, `keymap-local-set`, and `define-keymap`, but the underlying model is always a keymap lookup.

Bindings are resolved by searching the currently active keymaps in precedence order. The global map supplies defaults. Major modes install local maps for a buffer. Minor modes can add their own maps on top, and special contexts such as the minibuffer, isearch, transient maps, text properties, and overlays can temporarily override or extend normal lookup.

That lookup model is how Emacs handles keybinding context. A key works because its map is active in the current state.

### Where user keybindings live

User keybindings usually live in the init file:

- `~/.emacs`
- `~/.emacs.el`
- `~/.emacs.d/init.el`

Users normally add global bindings directly in init code, or attach mode-specific bindings from hooks after a package or major mode is loaded. Early startup code can also live in `~/.emacs.d/early-init.el`, but ordinary keybinding customization is typically placed in the main init file because it runs after more packages and UI state are available.

### Key notation and binding APIs

Modern Emacs Lisp code commonly uses readable key description strings:

```elisp
(keymap-global-set "C-c t" #'toggle-truncate-lines)
(keymap-global-set "<f5>" #'revert-buffer)
(keymap-global-set "C-c p n" #'next-buffer)
```

Each space-separated token is one input event. Prefix keys are just nested keymaps, so `"C-c p n"` means "press `C-c`, then `p`, then `n`".

Lower-level APIs can also use `kbd` together with `define-key`:

```elisp
(define-key global-map (kbd "C-c t") #'toggle-truncate-lines)
(define-key emacs-lisp-mode-map (kbd "C-c C-b") #'eval-buffer)
```

For new code, `keymap-set` and related helpers are usually clearer because they accept the same key description strings directly.

### User examples

Basic global binding:

```elisp
(keymap-global-set "C-c w" #'whitespace-mode)
```

Major-mode-specific binding:

```elisp
(add-hook 'emacs-lisp-mode-hook
          (lambda ()
            (keymap-local-set "C-c C-k" #'eval-buffer)))
```

Binding a key to an interactive wrapper that supplies arguments:

```elisp
(defun my-open-init-file ()
  (interactive)
  (find-file user-init-file))

(keymap-global-set "C-c I" #'my-open-init-file)
```

Conditional binding for one platform:

```elisp
(when (eq system-type 'darwin)
  (keymap-global-set "s-[" #'previous-buffer)
  (keymap-global-set "s-]" #'next-buffer))
```

### Defining keymaps

Packages and advanced user configs usually create their own keymaps instead of writing everything into `global-map`.

```elisp
(defvar my-tools-prefix-map
  (define-keymap
    "s" #'shell
    "g" #'rgrep
    "o" #'occur))

(keymap-global-set "C-c t" my-tools-prefix-map)
```

That example makes `C-c t` a prefix key. After `C-c t`, Emacs keeps reading input from `my-tools-prefix-map`.

Sparse keymaps are common because most maps bind only a small number of keys. Full keymaps are available too, but they are mostly used when many character entries need to be present.

### Scope and precedence

Emacs scopes bindings by activating different keymaps rather than attaching predicates to individual entries.

- Global bindings live in `global-map`.
- A major mode typically installs one local map for the current buffer.
- Each enabled minor mode can contribute another map, usually with higher precedence than the major mode's map.
- Specialized states such as the minibuffer or incremental search use dedicated maps while that state is active.
- Text properties and overlays can attach keymaps to specific buffer regions.

This matters when overriding a binding. Rebinding a key globally does not affect a higher-precedence local or minor-mode map that already handles the same key sequence. Conversely, a local binding can shadow the global one without changing it.

### Removal, unbinding, and fallthrough

Bindings can be removed from the relevant map:

```elisp
(keymap-global-unset "C-z")
(keymap-unset emacs-lisp-mode-map "C-c C-z")
```

An unbound key falls through when no higher-precedence map handles that sequence.

Shadowing is also possible without deleting the lower binding. A major-mode map or minor-mode map can simply define its own entry for the same key.

### Command arguments and command remapping

Emacs bindings do not have a separate `args` field. A key points to a definition, and that definition is usually an interactive command. If a binding needs fixed arguments, the common pattern is to bind the key to a custom command or interactive lambda.

Emacs also supports command remapping through special `[remap ...]` entries in a keymap:

```elisp
(define-key emacs-lisp-mode-map
  [remap eval-defun]
  #'pp-eval-defun)
```

That changes every binding that would normally invoke `eval-defun` within that map, without rebinding each concrete key sequence separately.

### Extension and package keybindings

Emacs packages contribute keybindings by defining interactive commands and then exposing those commands through one or more keymaps.

An interactive command is just a Lisp function declared with `interactive`:

```elisp
(defun my-package-run ()
  (interactive)
  (message "Running package command"))
```

A package can then publish bindings through a major-mode map, a minor-mode map, or another activated map:

```elisp
(defvar my-package-mode-map
  (define-keymap
    "C-c ," #'my-package-run
    "C-c ." #'my-package-repeat))

(define-minor-mode my-package-mode
  "Toggle My Package mode."
  :lighter " MyPkg"
  :keymap my-package-mode-map)
```

That is the usual Emacs extension model. There is no separate manifest file for keybindings, command IDs, or condition clauses. Packages register commands by defining interactive functions, and they scope bindings by deciding which keymap becomes active and when.

Packages can also leave commands unbound and let users choose their own keys in the init file. That pattern is common when a package does not want to claim keys globally.

### Editor-specific constraints and conventions

- `C-c` followed by a letter is reserved for users. Packages should not take those sequences for themselves unless they are in a mode-specific map.
- Emacs keybindings are heavily shaped by prefix maps. Long sequences are normal and often preferred to claiming a scarce single shortcut.
- There is no built-in JSON, YAML, or declarative keybinding file format. Customization is done in Emacs Lisp.
- The same command can have multiple bindings in multiple maps at once, and active map precedence determines which one wins for a given context.
