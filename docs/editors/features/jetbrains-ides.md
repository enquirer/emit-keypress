# JetBrains IDEs (IntelliJ, WebStorm, PyCharm, etc.)

## Keybindings

JetBrains IDEs built on the IntelliJ Platform use keymaps: named collections of actions, keyboard shortcuts, mouse shortcuts, and abbreviations. Users customize them from `Settings/Preferences > Keymap`, while plugins contribute actions and shortcuts through the `plugin.xml` action system.

### tl;dr

- Modifiers: User-facing docs use names like `Ctrl`, `Shift`, `Alt`, and `Meta`; plugin XML uses Swing-style names such as `control`, `shift`, `alt`, and `meta`.
- Shortcuts: A single shortcut is one keystroke such as `Ctrl+Alt+L` in the UI or `control alt L` in plugin XML.
- Chords: Supported as two-stroke shortcuts. In the UI you enable `Second stroke`; in plugin XML you use `first-keystroke` plus optional `second-keystroke`.
- Conditions: Availability is controlled by the action implementation, mainly via `AnAction.update()` and the action context.
- Args: Not supported in user keymaps or shortcut declarations. If an action needs parameters, they live in action code, not in the keybinding entry.
- Platform: Users usually pick a platform-specific parent keymap such as `macOS`; plugins target keymaps by ID such as `$default` or `Mac OS X`.
- Removal: Users remove a shortcut from a custom keymap in the Keymap UI. Plugins can remove or replace inherited shortcuts with `remove="true"` or `replace-all="true"`.
- Extension bindings: Plugins register actions in `plugin.xml` and attach `<keyboard-shortcut>`, `<mouse-shortcut>`, or `use-shortcut-of`.
- Other features: Keymaps support mouse shortcuts, abbreviations for `Find Action`, and inheritance both between keymaps and between some actions' shortcuts.

### Keybinding model

JetBrains has two related layers:

- user keymaps managed in the Keymap settings UI
- plugin-contributed shortcuts declared under `<actions>` in `plugin.xml`

The formal, documented shortcut schema is the plugin XML form:

```xml
<actions>
  <action id="com.example.ExampleAction"
          class="com.example.ExampleAction"
          text="Example Action">
    <keyboard-shortcut
      keymap="$default"
      first-keystroke="control alt E"
      second-keystroke="X" />
    <mouse-shortcut
      keymap="$default"
      keystroke="control button3 doubleClick" />
    <abbreviation value="exa" />
  </action>
</actions>
```

Relevant fields are:

- `id`: action ID that shows up in the Keymap UI
- `keymap`: the keymap this shortcut applies to, such as `$default` or `Mac OS X`
- `first-keystroke`: the main Swing-format keystroke
- `second-keystroke`: optional second stroke for a chord
- `remove`: removes a matching inherited shortcut from the specified keymap
- `replace-all`: removes all existing keyboard and mouse shortcuts for that action before adding the new one
- `keystroke`: mouse shortcut descriptor such as `control button3 doubleClick`

For users, JetBrains documents the Keymap page and the location of user-defined keymap files, but the main supported customization flow is through the UI rather than hand-editing an external keymap format.

### User keymaps

Open `Settings/Preferences > Keymap` to inspect or change bindings.

Important behavior:

- predefined keymaps are read-only
- editing a predefined keymap automatically creates a child keymap you can modify
- custom keymaps can be duplicated, renamed, restored to defaults, or deleted
- the page can search by action name or by shortcut
- actions may inherit shortcuts from parent actions

JetBrains also supports:

- keyboard shortcuts
- mouse shortcuts
- abbreviations, which let an action be found quickly from `Find Action`

When you modify a default keymap, the IDE stores a custom keymap file under the product configuration directory in a `keymaps` folder. JetBrains documents Windows, macOS, and Linux locations and notes that the custom file stores only differences relative to its parent keymap.

### User keymap locations

The exact product/version portion varies by IDE, but JetBrains documents these paths for custom keymaps:

```text
%APPDATA%\JetBrains\<product><version>\keymaps
~/Library/Application Support/JetBrains/<product><version>/keymaps
~/.config/JetBrains/<product><version>/keymaps
```

Those files are intended to be shared between IDE instances or team members by copying them into another installation's `keymaps` directory and then selecting the copied keymap in the Keymap settings page.

### Shortcut syntax

In the Keymap UI, users type a shortcut directly into the Keyboard Shortcut dialog. The dialog can capture keys that would otherwise close the dialog, such as `Enter` or `Escape`, through the special-keys picker.

Plugin XML uses Swing keystroke syntax:

```xml
<keyboard-shortcut
  keymap="$default"
  first-keystroke="control alt L" />
```

A two-stroke shortcut adds `second-keystroke`:

```xml
<keyboard-shortcut
  keymap="$default"
  first-keystroke="control alt G"
  second-keystroke="C" />
```

Mouse shortcuts use a space-separated descriptor:

```xml
<mouse-shortcut
  keymap="$default"
  keystroke="control button3 doubleClick" />
```

Supported mouse shortcut tokens include:

- modifier keys such as `shift`, `control`, `meta`, `alt`, and `altGraph`
- mouse buttons `button1`, `button2`, `button3`
- `doubleClick`

### Context and conditions

JetBrains keymaps do not attach declarative conditions to an individual shortcut entry. Shortcut availability is controlled by the action system.

For plugin authors, the action's context is determined at runtime in the action implementation:

- `AnAction.update()` decides whether the action is enabled or visible in the current context
- `AnAction.actionPerformed()` does the actual work
- `AnActionEvent.getData()` exposes context objects such as `Project`, `Editor`, or `PsiFile`

That means a shortcut can exist globally in the active keymap, but invoking it only works when the target action is enabled for the current UI context.

### Basic examples

A simple plugin shortcut:

```xml
<actions>
  <action id="com.example.FormatSelection"
          class="com.example.FormatSelectionAction"
          text="Format Selection">
    <keyboard-shortcut
      keymap="$default"
      first-keystroke="control alt L" />
  </action>
</actions>
```

A two-stroke shortcut:

```xml
<actions>
  <action id="com.example.OpenScratch"
          class="com.example.OpenScratchAction"
          text="Open Scratch Buffer">
    <keyboard-shortcut
      keymap="$default"
      first-keystroke="control shift X"
      second-keystroke="S" />
  </action>
</actions>
```

A mouse shortcut:

```xml
<actions>
  <action id="com.example.RunInspector"
          class="com.example.RunInspectorAction"
          text="Run Inspector">
    <mouse-shortcut
      keymap="$default"
      keystroke="alt button2 doubleClick" />
  </action>
</actions>
```

Reusing another action's shortcut:

```xml
<actions>
  <action id="com.example.MyAction"
          class="com.example.MyAction"
          text="My Action"
          use-shortcut-of="EditorCopy" />
</actions>
```

### Inheritance, overrides, and removal

JetBrains keymaps are hierarchical:

- a custom keymap is a child of a predefined parent keymap
- some actions also inherit shortcuts from other actions

For users, changing a child action's shortcut breaks that inheritance link for that action. Changing a parent action can update its children if they still inherit from it.

For plugins, the main override tools are:

```xml
<keyboard-shortcut
  keymap="Mac OS X"
  first-keystroke="control alt G"
  second-keystroke="C"
  remove="true" />

<keyboard-shortcut
  keymap="Mac OS X 10.5+"
  first-keystroke="meta alt G"
  replace-all="true" />
```

- `remove="true"` removes the matching shortcut from that keymap
- `replace-all="true"` clears existing keyboard and mouse shortcuts for the action before adding the specified one

### Extensions and plugin keybindings

JetBrains plugins contribute keybindings by contributing actions. The usual flow is:

1. Implement an action class, usually by extending `AnAction` or `DumbAwareAction`.
2. Register the action in `plugin.xml`.
3. Add it to menus, toolbars, popups, or search groups as needed.
4. Attach shortcuts with `<keyboard-shortcut>`, `<mouse-shortcut>`, or `use-shortcut-of`.

Minimal example:

```xml
<actions>
  <action id="com.example.InsertTimestamp"
          class="com.example.InsertTimestampAction"
          text="Insert Timestamp"
          description="Insert the current date and time">
    <add-to-group group-id="EditorPopupMenu" anchor="last" />
    <keyboard-shortcut
      keymap="$default"
      first-keystroke="control alt T" />
  </action>
</actions>
```

For IntelliJ-platform plugins:

- `command`: action `id`
- `context`: runtime action context from `AnActionEvent`
- action availability: `update()` logic rather than shortcut metadata
- `args`: actions do not take keybinding-level arguments
- `platform override`: keymap-specific shortcut declarations

One practical limitation is that plugins contribute shortcuts per keymap, not per arbitrary boolean condition. If you need context-sensitive behavior, put it in the action's `update()` logic rather than in the shortcut declaration.

### JetBrains-specific quirks and limits

- Predefined keymaps cannot be edited directly; the IDE always creates a derived custom keymap first.
- Shortcuts cannot begin with `Fn`.
- Double-modifier gestures such as double `Shift` and double `Ctrl` are separate IDE features, not normal keymap entries, and can be disabled in Advanced Settings.
- National-layout handling is configurable in some IDEs and platforms, which affects how non-US keyboard layouts are interpreted.
- Keymaps are broader than keyboard shortcuts: mouse shortcuts and abbreviations are part of the same system.
- Runtime-created actions may need a placeholder registration if you want them to appear in `Settings | Keymap`.
