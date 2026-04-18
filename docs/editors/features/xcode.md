# Xcode

## Keybindings

### tl;dr

- Modifiers: Xcode shows shortcuts with macOS glyphs such as `^` Control, `⌥` Option, `⇧` Shift, `⌘` Command, `fn`, and arrow/function-key symbols.
- Shortcuts: Built-in shortcuts are assigned in Xcode's `Key Bindings` settings and attached to menu commands or editor actions.
- Chords: Xcode's own key binding UI is centered on single shortcuts. Multi-step sequences are available through macOS text-system bindings, not through Xcode's key binding editor.
- Conditions: Shortcut availability is determined by the command itself, first responder routing, and the active part of the UI.
- Args: User-defined Xcode shortcuts do not pass arguments. A shortcut triggers the selected command.
- Platform: Xcode is macOS-only, so there is no per-platform binding syntax inside the key binding editor.
- Removal: A shortcut can be cleared or replaced in the `Key Bindings` settings. Standard macOS text bindings can also override editor behavior for text responders.
- Extension bindings: Source Editor extensions contribute commands to Xcode. Those commands can then be assigned shortcuts from Xcode's key binding UI.
- Other features: Xcode also supports Vim key bindings in the source editor, and macOS `DefaultKeyBinding.dict` can affect text-editing commands that Xcode does not intercept.

Xcode's shortcut system is mostly UI-driven rather than text-config driven. The primary customization surface is the `Xcode > Settings > Key Bindings` pane, where named key binding sets map shortcuts to commands.

### Where user keybindings live

User-customized Xcode shortcuts live in Xcode's `Key Bindings` settings. Apple exposes them as editable key binding sets in the UI rather than as a documented text configuration format for manual editing.

There is also a second layer below Xcode itself: the standard macOS AppKit text system. If a source editor view falls through to the Cocoa text system for a keystroke, macOS can apply bindings from `~/Library/KeyBindings/DefaultKeyBinding.dict`.

### Binding model

Xcode's built-in key binding editor is command-oriented:

- pick a command from a category in `Key Bindings`
- assign or replace its shortcut
- save the change into the current key binding set

There is no public JSON, plist, or scripting schema for Xcode's own key binding sets. From a documentation perspective, the binding "shape" is therefore a table of `command -> shortcut` entries managed in the app UI.

That matters because Xcode's own shortcut layer is intentionally narrow:

- no user-editable condition syntax in the key binding editor
- no command arguments in the binding itself
- no documented textual import format for hand editing
- no supported syntax for per-mode or per-language bindings

### Scope and context

Xcode scopes shortcuts through command availability, first responder routing, and the active part of the interface. In practice:

- source-editor commands apply when the source editor has focus
- debugger, navigator, or canvas commands only work when their corresponding UI is active
- menu-item validation controls whether a shortcut is currently enabled

Xcode decides applicability from the active command target instead of from a user-authored rule attached to the shortcut.

### Vim key bindings

Xcode includes optional Vim key bindings for the source editor. This is a separate editing mode from the standard shortcut editor and changes how keystrokes are interpreted while editing source files.

Vim mode is useful to call out separately because it is not implemented as a normal list of rebinding entries in the `Key Bindings` pane. It changes the editor's keystroke handling model itself.

### macOS text-system bindings

For text-editing commands that flow through AppKit's text system, macOS supports a real file-based key binding format in `~/Library/KeyBindings/DefaultKeyBinding.dict`. This is an XML or old-style property list dictionary that maps keystrokes to selector names.

This layer is not Xcode-specific, but it is relevant because Xcode is a macOS editor and inherits standard text-system behavior where applicable. It is also the only officially documented text format in the stack that affects key handling in Xcode.

Example: basic text-editing overrides in `DefaultKeyBinding.dict`:

```plist
{
    "~f" = "moveWordForward:";
    "~b" = "moveWordBackward:";
    "~d" = "deleteWordForward:";
}
```

Example: a multi-stroke binding through nested dictionaries:

```plist
{
    "\033" = {
        "f" = "moveWordForward:";
        "b" = "moveWordBackward:";
        "\033" = "complete:";
    };
}
```

Those examples show capabilities that Xcode's own key binding editor does not expose directly: selector-based actions and multi-keystroke sequences.

### Unbinding and overriding

In Xcode's `Key Bindings` settings, a shortcut can be changed by assigning a new key equivalent to the command. Practical override behavior works like this:

- assigning a new shortcut replaces the old assignment for that command in the active key binding set
- removing the shortcut leaves the command available without a key equivalent
- conflicts are resolved in the key binding UI rather than through a textual precedence system

At the macOS text-system layer, overriding is done by redefining the selector bound to a keystroke in `DefaultKeyBinding.dict`.

### Extension and plugin commands

Modern Xcode customization is based on app extensions, especially Source Editor extensions. An extension contributes commands to Xcode by declaring them in the extension's `Info.plist` and implementing the command classes in the extension target.

Example: extension command definitions in `Info.plist`:

```xml
<key>XCSourceEditorCommandDefinitions</key>
<array>
  <dict>
    <key>XCSourceEditorCommandClassName</key>
    <string>MyExtension.SortImportsCommand</string>
    <key>XCSourceEditorCommandIdentifier</key>
    <string>com.example.myextension.sort-imports</string>
    <key>XCSourceEditorCommandName</key>
    <string>Sort Imports</string>
  </dict>
</array>
```

The important constraints are:

- extensions contribute commands rather than their own shortcut-definition file
- the extension does not attach shortcut conditions or arguments to a shortcut declaration
- the command appears in Xcode's Editor menu, and shortcut assignment is managed by the user in Xcode

Xcode therefore has an extension-command model plus a separate user-shortcut model, instead of a single declarative keybindings file.

### Examples in practice

Basic editor command binding:

- open `Xcode > Settings > Key Bindings`
- find a source editor command such as commenting, navigation, or refactoring
- record the desired shortcut in the command's shortcut field

Context-specific binding:

- assign a shortcut to a source-editor-only command
- the shortcut is only meaningful when a source editor can handle that command
- context comes from command routing and the active editor state

Extension command binding:

- install or build a Source Editor extension that contributes a command
- find the contributed command in Xcode's command list
- assign a shortcut to that command in the `Key Bindings` settings

### Limitations and quirks

- Xcode does not document a stable hand-editable file format for its own shortcut sets.
- Xcode does not expose command arguments in keybindings.
- Xcode does not expose a user-facing condition syntax in the key binding editor.
- Multi-step sequences belong to the underlying macOS text system, not the main Xcode key binding UI.
- Vim key bindings are a separate editor mode, not a normal shortcut-set feature.
