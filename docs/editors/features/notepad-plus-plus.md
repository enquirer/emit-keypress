# Notepad++

## Keybindings

Notepad++ manages keyboard shortcuts through `Settings > Shortcut Mapper`, with persistence in the `shortcuts.xml` configuration file. The system is Windows-centric: shortcuts are single key combinations built from `Ctrl`, `Alt`, `Shift`, and one base virtual key. There is no separate condition language, selector syntax, modal scope system, or chord syntax.

### tl;dr

- Modifiers: `Ctrl`, `Alt`, and `Shift` in the Shortcut Mapper UI; `Ctrl="yes|no"`, `Alt="yes|no"`, `Shift="yes|no"` in `shortcuts.xml`.
- Shortcuts: one key combination per binding, made of zero or more modifiers plus one base key from the Shortcut Mapper pulldown. Example: `Ctrl+K` or `Shift+F5`.
- Chords: not supported. Notepad++ bindings are single-step shortcuts, not multi-stroke sequences like `Ctrl+K Ctrl+D`.
- Conditions: Bindings are global to the command they trigger; practical availability depends on the current focus, command category, or whether a plugin is loaded.
- Args: not supported as keybinding fields. Macros and Run commands carry their own behavior, but the shortcut itself does not pass arguments.
- Platform: Windows-only. Shortcuts are stored in terms of Windows virtual keys.
- Removal: remove or clear a shortcut in Shortcut Mapper. For remapped built-in, plugin, and Scintilla commands, only changed entries are stored in `shortcuts.xml`.
- Extension bindings: plugins contribute commands to the `Plugins` menu; users can assign or change their shortcuts in the `Plugin commands` tab of Shortcut Mapper.
- Other features: Shortcut Mapper has separate tabs for `Main menu`, `Macros`, `Run commands`, `Plugin commands`, and `Scintilla commands`; macro and Run-command definitions live directly in `shortcuts.xml`; changes made in the UI are written to disk when Notepad++ exits.

### Shortcut Mapper and file shape

The primary interface is `Settings > Shortcut Mapper`. It exposes five shortcut categories:

- `Main menu`: built-in Notepad++ menu commands.
- `Macros`: recorded or hand-edited macros from the `Macro` menu.
- `Run commands`: user-defined commands from the `Run` menu.
- `Plugin commands`: commands exposed by installed plugins.
- `Scintilla commands`: lower-level editor commands provided by the Scintilla editing component.

Notepad++ stores these in `shortcuts.xml`:

```xml
<NotepadPlus>
    <InternalCommands />
    <Macros />
    <UserDefinedCommands />
    <PluginCommands />
    <ScintillaKeys />
</NotepadPlus>
```

The important detail is that these sections do not all behave the same way:

- `<InternalCommands>`, `<PluginCommands>`, and `<ScintillaKeys>` store remapped shortcuts for existing commands. If a command is still using its default shortcut, it will usually not appear there.
- `<Macros>` stores both the macro definition and its assigned shortcut.
- `<UserDefinedCommands>` stores both the Run-menu command string and its assigned shortcut.

For hand-editing, the Notepad++ manual explicitly treats macros and Run commands as the realistic cases. For ordinary built-in, plugin, and Scintilla shortcut changes, Shortcut Mapper is the safer workflow.

### Where user keybindings live

`shortcuts.xml` lives in the active Notepad++ configuration directory:

- Standard install: `%AppData%\Notepad++\shortcuts.xml`
- Portable or local-config mode: alongside the `notepad++.exe` configuration files
- Cloud or `-settingsDir` setups: in that alternate settings directory

Notepad++ writes configuration changes when it exits. If you change shortcuts in the UI and inspect `shortcuts.xml` before quitting the app, the file may still show the old state.

### Binding format

Shortcut Mapper edits one shortcut at a time. The dialog gives you:

- a command name
- checkboxes for `Ctrl`, `Alt`, and `Shift`
- one pulldown for the base key

In `shortcuts.xml`, shortcut-bearing nodes use the same core fields:

- `Ctrl` **{`"yes"` | `"no"`}**
- `Alt` **{`"yes"` | `"no"`}**
- `Shift` **{`"yes"` | `"no"`}**
- `Key` **{integer}**: a Windows virtual-key code, not a Unicode codepoint

That virtual-key detail matters. Notepad++ binds the underlying Windows key code, not an abstract text character. On non-US keyboard layouts, the visible character and the actual bound key can diverge, especially in older Notepad++ versions.

### Run-command bindings

Run-menu entries have the most transparent XML shape:

```xml
<UserDefinedCommands>
    <Command name="Open current file in PowerShell" Ctrl="yes" Alt="yes" Shift="no" Key="80">
        powershell.exe -NoProfile -Command "Get-Content &quot;$(FULL_CURRENT_PATH)&quot;"
    </Command>
</UserDefinedCommands>
```

Properties:

- `name` **{string}**: the label shown in the `Run` menu.
- `Ctrl`, `Alt`, `Shift`, `Key`: the shortcut assignment.
- text content **{string}**: the Windows command to execute.
- `FolderName` **{string, optional}**: groups commands into a Run-menu submenu, but only by hand-editing XML.

Run commands can interpolate Notepad++ variables such as `$(FULL_CURRENT_PATH)`, `$(CURRENT_WORD)`, or `$(NPP_DIRECTORY)`. This is the closest thing Notepad++ has to keybinding arguments, but the arguments belong to the Run command body, not the shortcut entry itself.

### Macro bindings

Macros also live in `shortcuts.xml`, but they store recorded actions as well as the assigned shortcut:

```xml
<Macros>
    <Macro name="My macro" Ctrl="yes" Alt="no" Shift="yes" Key="77">
        <Action type="2" message="0" wParam="..." lParam="0" sParam="" />
    </Macro>
</Macros>
```

Properties:

- `name` **{string}**: macro name shown in the `Macro` menu.
- `Ctrl`, `Alt`, `Shift`, `Key`: the shortcut assignment.
- `FolderName` **{string, optional}**: manual submenu grouping.
- nested `<Action>` tags: the recorded Scintilla or Notepad++ operations.

Macros do not record raw keystrokes. They record commands and message calls. If you need conditional logic, variables, or richer automation, the manual recommends moving to a plugin or a scripting plugin rather than trying to stretch the macro system.

### Main-menu and Scintilla bindings

Built-in editor shortcuts are split across two places in Shortcut Mapper:

- `Main menu` for regular Notepad++ commands such as `Search > Find` or `View > Fold All`
- `Scintilla commands` for lower-level editor actions exposed by the Scintilla text component

The XML backing for these sections is intentionally less friendly for manual editing than the macro and Run-command sections. In practice:

- use Shortcut Mapper to add, change, or remove these bindings
- expect only remapped commands to be serialized
- do not expect any `when`, selector, focus, or mode expression language

Scintilla commands are the nearest Notepad++ gets to editor-scope bindings, but that scope is still command-category based rather than declarative. A Scintilla shortcut works because it targets a Scintilla command, not because you wrote a focus expression.

### Conditions, contexts, and limitations

Notepad++ keybindings do not have separate fields for:

- declarative conditions
- selector-based scopes
- modal keybinding tables
- per-binding command arguments
- multi-stroke chords
- platform-specific override blocks

Instead, the system is simple:

- you bind a shortcut to one command
- the command category determines where you edit it
- the current UI state determines whether that command can do anything useful

Examples of practical context:

- a `Main menu` shortcut may be unavailable because the menu command is disabled in the current state
- a `Plugin commands` shortcut only works when that plugin is installed and loaded
- a `Scintilla commands` shortcut is relevant when focus is in the editor component

### Examples

Basic built-in command rebinding:

1. Open `Settings > Shortcut Mapper`.
2. In `Main menu`, filter for the command you want.
3. Select it and click `Modify`.
4. Set `Ctrl`, `Alt`, `Shift`, and the base key, then confirm.

There is no context-specific binding syntax to demonstrate because Notepad++ does not support context-specific keymaps in the declarative sense.

Run-menu command with variables:

```xml
<UserDefinedCommands>
    <Command name="Open current folder in Explorer" Ctrl="yes" Alt="yes" Shift="no" Key="69">
        explorer.exe "$(CURRENT_DIRECTORY)"
    </Command>
</UserDefinedCommands>
```

Plugin command shortcut:

1. Install the plugin so that it contributes entries under `Plugins`.
2. Open `Settings > Shortcut Mapper > Plugin commands`.
3. Select the plugin command and click `Modify`.
4. Assign the shortcut you want.

The remap is then persisted in the `<PluginCommands>` section of `shortcuts.xml`.

### Plugins and extension-contributed keybindings

Notepad++ plugins contribute commands programmatically, not through a standalone keymap manifest. The official plugin workflow is:

1. define your plugin and command count in `PluginDefinition.h`
2. customize command names and associated functions in `PluginDefinition.cpp`
3. implement the functions

Those commands appear under the `Plugins` menu. After that:

- users can assign or change shortcuts in `Shortcut Mapper > Plugin commands`
- remapped plugin shortcuts are stored in `<PluginCommands>` in `shortcuts.xml`

The plugin model is straightforward:

- `command`: yes, plugin commands exist as menu commands
- `context` / `when`: no declarative field
- `args`: no keybinding-level argument field
- `platform`: no platform-specific binding manifest

If a plugin wants richer behavior, that logic lives in the command implementation, not in the keybinding metadata.

### Notepad++-specific quirks

- Shortcut Mapper uses Windows virtual keys, so keyboard-layout details matter.
- Notepad++ 8.7.6 improved Shortcut Mapper’s handling of non-US keyboards, but the system is still based on Windows keycodes rather than text input.
- Macro and Run-command submenu grouping via `FolderName` exists only in manual XML edits, not in the Shortcut Mapper UI.
- Changes made through the GUI are not flushed to `shortcuts.xml` until Notepad++ exits.
- For regular shortcut remapping, editing XML by hand is possible but generally less safe than using Shortcut Mapper.
