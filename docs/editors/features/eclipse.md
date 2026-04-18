# Eclipse

## Keybindings

Eclipse keybindings are command bindings organized by scheme and context. Users usually customize them from `Window > Preferences > General > Keys` (or the application menu on macOS), while plug-ins contribute commands, handlers, contexts, schemes, and key bindings through extension points in `plugin.xml`.

### tl;dr

- Modifiers: User-facing docs use `Ctrl`, `Alt`, `Shift`, and `⌘` on macOS. Extension markup usually prefers `M1`, `M2`, `M3`, and `M4`, though `CTRL`, `ALT`, `SHIFT`, and `COMMAND` are also accepted.
- Shortcuts: A single keystroke is written like `Ctrl+S` in the UI or `M1+S` in `plugin.xml`.
- Chords: Supported. Multi-stroke sequences are space-separated, such as `Ctrl+X Ctrl+C` in the UI or `M1+X M1+C` in extension markup.
- Conditions: Bindings are scoped by `contextId`; active child contexts override parent contexts. Command execution also depends on whether a matching handler is active.
- Args: The user Keys page does not expose command arguments, but extension-contributed `<key>` bindings can include `<parameter>` elements.
- Platform: Extension bindings can target a `platform` and `locale`, and Eclipse also supports `sequenceModifier` rules for platform-specific modifier remapping.
- Removal: Users remove a binding from the Keys page with `Remove Binding` or `Backspace`. In extension markup, omitting `commandId` creates a deletion marker that cancels another binding with the same trigger.
- Extension bindings: Commands come from `org.eclipse.ui.commands`, handlers from `org.eclipse.ui.handlers`, contexts from `org.eclipse.ui.contexts`, and keybindings/schemes from `org.eclipse.ui.bindings`.
- Other features: Schemes can inherit from parent schemes, keybindings can be exported to CSV for reporting, and Eclipse shows possible completions when you pause in the middle of a multi-stroke sequence.

### Binding model

At the conceptual level, an Eclipse keybinding is:

```ts
type EclipseKeyBinding = {
  sequence: string
  schemeId: string
  contextId?: string
  commandId?: string
  platform?: string
  locale?: string
  parameters?: Array<{
    id: string
    value: string
  }>
}
```

- `sequence`: One or more keystrokes. Keystrokes are separated by spaces; keys within a keystroke are joined with `+`.
- `schemeId`: The active key scheme, such as the default scheme or the Emacs scheme.
- `contextId`: The context in which the binding is active. If omitted in extension markup, it defaults to `org.eclipse.ui.contexts.window`.
- `commandId`: The command to run. If omitted, the binding becomes a deletion marker instead of a command binding.
- `platform`: Optional `SWT.getPlatform()` string such as `cocoa`, `gtk`, or `win32`.
- `locale`: Optional locale filter such as `en` or `en_CA`.
- `parameters`: Optional command arguments passed as name/value pairs.

### User keybindings

For users, the supported customization surface is the `General > Keys` preference page. Eclipse lets you:

- choose the active scheme
- filter by category, command, binding, or conflict status
- assign a new binding by focusing the Binding field and typing the key sequence
- duplicate a command entry with `Copy Command` to give one command multiple bindings
- remove a binding with `Remove Binding` or by pressing `Backspace` in the Binding field
- export the current bindings to CSV

Eclipse documents user keybindings as preference-managed data, not as a standalone hand-edited keymap file with a public schema. The CSV export is report-only; it is not an import format.

### Schemes

Eclipse uses schemes to group bindings into named sets. The built-in user docs call out two common schemes:

- `Default`
- `Emacs`, which extends `Default`

Scheme inheritance matters. A child scheme inherits its parent bindings and only needs to redefine the ones it wants to change. This is how the Emacs scheme overrides selected defaults without re-declaring every shortcut.

Plug-ins can declare additional schemes with `org.eclipse.ui.bindings`:

```xml
<extension point="org.eclipse.ui.bindings">
  <scheme
    id="com.example.scheme"
    name="Example Scheme"
    description="Shortcut set for Example"
    parentId="org.eclipse.ui.defaultAcceleratorConfiguration" />
</extension>
```

### Contexts and conditions

Eclipse does not use a single `when` string like VS Code. The main scoping mechanism is `contextId`.

Contexts are declared separately and arranged in a parent/child hierarchy:

```xml
<extension point="org.eclipse.ui.contexts">
  <context
    id="com.example.editorContext"
    name="Example Editor"
    description="Bindings active inside Example editors"
    parentId="org.eclipse.ui.textEditorScope" />
</extension>
```

A binding becomes active when its context is active. Child contexts override parent contexts for the same key sequence, which lets `Editing Java Source` specialize bindings inherited from `Editing Text`, which in turn specializes bindings inherited from `In Windows`.

There is a second layer of runtime conditions: the command still needs an active handler. Handlers are contributed through `org.eclipse.ui.handlers` and can use `activeWhen` and `enabledWhen` expressions. So, in practice:

- `contextId` scopes the binding itself
- `activeWhen` and `enabledWhen` scope the handler that will receive the command

If no handler is active, the command is effectively unavailable even if the key sequence matches.

### Key syntax

User-facing documentation shows shortcuts like:

```text
Ctrl+S
Ctrl+Shift+L
Ctrl+X Ctrl+C
Alt+Shift+Q Y
```

Extension markup typically uses platform-neutral modifiers:

- `M1`: `COMMAND` on macOS, `CTRL` on most other platforms
- `M2`: `SHIFT`
- `M3`: `Option` on macOS, `ALT` on most other platforms
- `M4`: `CTRL` on macOS, undefined on most other platforms

Equivalent binding in `plugin.xml`:

```xml
<key
  sequence="M1+S"
  commandId="org.eclipse.ui.file.save"
  schemeId="org.eclipse.ui.defaultAcceleratorConfiguration"
  contextId="org.eclipse.ui.contexts.window" />
```

Special keys use symbolic names such as `ARROW_UP`, `ESC`, `TAB`, `F5`, or `NUMPAD_ADD`.

### Basic examples

A simple plug-in keybinding:

```xml
<extension point="org.eclipse.ui.bindings">
  <key
    sequence="M1+M2+L"
    commandId="com.example.commands.formatSelection"
    schemeId="org.eclipse.ui.defaultAcceleratorConfiguration"
    contextId="org.eclipse.ui.textEditorScope" />
</extension>
```

A context-specific binding that only applies in a custom editor context:

```xml
<extension point="org.eclipse.ui.bindings">
  <key
    sequence="M1+ENTER"
    commandId="com.example.commands.quickFix"
    schemeId="org.eclipse.ui.defaultAcceleratorConfiguration"
    contextId="com.example.editorContext" />
</extension>
```

A multi-stroke binding:

```xml
<extension point="org.eclipse.ui.bindings">
  <key
    sequence="M1+X M1+S"
    commandId="org.eclipse.ui.file.save"
    schemeId="org.eclipse.ui.emacsAcceleratorConfiguration"
    contextId="org.eclipse.ui.contexts.window" />
</extension>
```

### Platform overrides and deletion markers

Platform-specific bindings use the `platform` attribute:

```xml
<extension point="org.eclipse.ui.bindings">
  <key
    sequence="M1+M2+8"
    commandId="com.example.commands.special"
    schemeId="org.eclipse.ui.defaultAcceleratorConfiguration"
    contextId="org.eclipse.ui.contexts.window"
    platform="win32" />

  <key
    sequence="M1+M3+8"
    commandId="com.example.commands.special"
    schemeId="org.eclipse.ui.defaultAcceleratorConfiguration"
    contextId="org.eclipse.ui.contexts.window"
    platform="cocoa" />
</extension>
```

To cancel an inherited binding in a particular context or platform, contribute a deletion marker by leaving off `commandId`:

```xml
<extension point="org.eclipse.ui.bindings">
  <key
    sequence="M1+B"
    schemeId="org.eclipse.ui.defaultAcceleratorConfiguration"
    contextId="com.example.editorContext"
    platform="gtk" />
</extension>
```

If that trigger, context, platform, and locale match, Eclipse disables the inherited binding instead of invoking a command.

### Command parameters

Eclipse bindings can carry command parameters directly in the binding declaration:

```xml
<extension point="org.eclipse.ui.bindings">
  <key
    sequence="M1+M3+Y"
    commandId="org.eclipse.ui.views.showView"
    schemeId="org.eclipse.ui.defaultAcceleratorConfiguration"
    contextId="org.eclipse.ui.contexts.window">
    <parameter
      id="org.eclipse.ui.views.showView.viewId"
      value="org.eclipse.ui.views.ContentOutline" />
  </key>
</extension>
```

This is how Eclipse attaches extra command data to a binding. The user Keys preference page does not expose a way to author or edit these parameters directly.

### Extension and plug-in keybindings

Extension authors usually wire keybindings up in four layers:

1. Define a command in `org.eclipse.ui.commands`.
2. Provide a handler in `org.eclipse.ui.handlers` or as a command `defaultHandler`.
3. Optionally define a context in `org.eclipse.ui.contexts`.
4. Bind the command in `org.eclipse.ui.bindings`.

Minimal example:

```xml
<extension point="org.eclipse.ui.commands">
  <command
    id="com.example.commands.insertTimestamp"
    name="Insert Timestamp"
    categoryId="com.example.commands.category" />
</extension>

<extension point="org.eclipse.ui.handlers">
  <handler
    commandId="com.example.commands.insertTimestamp"
    class="com.example.handlers.InsertTimestampHandler">
    <activeWhen>
      <with variable="activeContexts">
        <iterate operator="or">
          <equals value="org.eclipse.ui.textEditorScope" />
        </iterate>
      </with>
    </activeWhen>
  </handler>
</extension>

<extension point="org.eclipse.ui.bindings">
  <key
    sequence="M1+M3+T"
    commandId="com.example.commands.insertTimestamp"
    schemeId="org.eclipse.ui.defaultAcceleratorConfiguration"
    contextId="org.eclipse.ui.textEditorScope" />
</extension>
```

For Eclipse extension authors:

- `command`: `commandId`
- `context`: `contextId`
- `when`: usually modeled with `contextId` plus handler `activeWhen`/`enabledWhen`
- `args`: `<parameter>` elements on `<key>`
- `platform`: `platform`
- `locale`: `locale`

One important limitation: Eclipse does not expose a general public API for defining new bindings dynamically at runtime. Stable bindings are expected to come from the `org.eclipse.ui.bindings` extension point. Handlers can be activated programmatically, and RCP applications can customize more deeply, but normal plug-ins contribute bindings declaratively.

### Eclipse-specific quirks and limits

- A keybinding only does useful work if the command currently has an active handler.
- Commands without categories are filtered on the Keys page by default, which makes them harder for users to discover and rebind.
- The current platform and locale are fixed for the lifetime of the running Eclipse instance.
- Eclipse supports `sequenceModifier`, which can rewrite modifier prefixes for certain platforms before the binding is applied. This is unusual among editors and is mainly useful for cross-platform shortcut normalization.
- When you start typing a multi-stroke sequence and pause, Eclipse can show possible completions. This makes long bindings more discoverable, but it also means overly long sequences are harder to justify in practice.
- CSV export is useful for auditing bindings, not for source control or import/export workflows.
