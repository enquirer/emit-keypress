# Codemap

This map covers the TUI’s JavaScript implementation and CLI entry point.

## src

- `src/app.js` - Manages the terminal session, screen navigation, message submission, and conversation history.
- `src/cli.js` - Creates and starts the application.
- `src/commands.js` - Declares the slash command names, descriptions, and actions, including the model picker.
- `src/SlashCommands.js` - Manages slash command registration and prefix lookup.
- `src/screens.js` - Lays out the workspace and picker screens and handles keyboard input for each.
- `src/surface.js` - Measures glyph widths, draws styled text into a grid, and renders screen updates to the terminal.

## src/components

- `src/components/chrome.js` - Draws the workspace header, emblem, and footer with status, shortcut hints, and warnings.
- `src/components/editor.js` - Handles text editing, wraps input to the available columns, and draws the prompt and cursor.
- `src/components/menu.js` - Draws selectable menu rows, panels, and scroll indicators and filters slash commands as the user types.
- `src/components/scrollback.js` - Wraps conversation messages to the available width and draws the visible lines at the current scroll position.
- `src/components/shortcut-panel.js` - Lays out shortcut groups in columns that wrap to fit the terminal and scroll vertically.
