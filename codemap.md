# Codemap

This map covers the terminal input implementation in the project root and `src`.

## .

- `index.ts` - Provides the public `emitKeypress` API, configures terminal input modes, and matches keypresses to shortcuts.

## src

- `src/emit-keypress.ts` - Decodes UTF-8 stream chunks, assembles terminal sequences across chunk boundaries, and handles escape timeouts and bracketed paste.
- `src/keyboard-protocol.ts` - Selects, enables, and resets the Kitty or modifyOtherKeys keyboard protocol for a terminal.
- `src/keycodes.ts` - Maps terminal input sequences to shortcut names and groups protocol-specific bindings.
- `src/keypress.ts` - Decodes characters and escape sequences into immutable keypress objects and emits them on the input stream.
- `src/mousepress.ts` - Decodes terminal mouse reports into actions, buttons, coordinates, and modifier flags.
- `src/types.ts` - Defines keypresses, key bindings, keymaps, keyboard protocols, and event types for keyboard, cursor, and mouse input.
- `src/utils.ts` - Builds and sorts shortcuts, prioritizes key bindings, identifies printable text and mouse input, and parses cursor positions.
