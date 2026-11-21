# emit-keypress [![NPM version](https://img.shields.io/npm/v/emit-keypress.svg?style=flat)](https://www.npmjs.com/package/emit-keypress) [![NPM monthly downloads](https://img.shields.io/npm/dm/emit-keypress.svg?style=flat)](https://npmjs.org/package/emit-keypress) [![NPM total downloads](https://img.shields.io/npm/dt/emit-keypress.svg?style=flat)](https://npmjs.org/package/emit-keypress)

> Drop-dead simple keypress event emitter for Node.js. Create powerful CLI applications and experiences with ease.

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save emit-keypress
```

## Why another keypress module?

Node's built-in `readline` module is great for handling user input if you need something simple. But when using `createInterface`, there are a number of built-in behaviors that are difficult or impossible to override when you need more control over the input stream.

Other keypress modules I found either did too much, or didn't allow for enough customization. This module is designed to be simple, flexible, easy to use, and easy to customize.

## Why use this?

**Create your own CLI interface**

It's lightweight with only one dependency for detecting the terminal. It's easy to use, and easy to customize. It's designed to be used in a wide range of use-cases, from simple command-line utilities to complex terminal applications.

Powerful CLI applications can be built with this module.

## Usage

```js
import { emitKeypress } from 'emit-keypress';

emitKeypress({
  onKeypress(input, key, close) {
    console.log({ input, key });

    if (input === '\x03' || input === '\r') {
      close();
    }
  }
});
```

## API

### onKeypress

Pass an `onKeypress` function to receive the key sequence, the parsed key, and a function that closes the listening session.

```ts
// The "close" function is passed as the third argument
const onKeypress = async (input, key, close) => {
  // do stuff with keypress events
  console.log({ input, key });

  // Stop listening when the user presses Ctrl+C or Enter
  if (input === '\x03' || input === '\r') {
    close();
  }
};

emitKeypress({ onKeypress });
```

`emitKeypress` returns the same `close` function. Calling it removes the session's listeners and runs `onExit` once. The input stream's `end` and `close` events also trigger cleanup.

```ts
const close = emitKeypress({ onKeypress });

setTimeout(close, 10_000);
```

### keymap

Pass a `keymap` array to map keypress events to specific shortcuts.

```ts
const keymap = [
  { sequence: '\x03', shortcut: 'ctrl+c' },
  { sequence: '\r', shortcut: 'return' }
];

emitKeypress({
  keymap,
  async onKeypress(input, key, close) {
    // do stuff with keypress events
    console.log({ input, key });

    if (key.shortcut === 'return' || key.shortcut === 'ctrl+c') {
      close();
    }
  }
});
```

Properties from a matching keymap entry are copied onto the key. For example, add a `command` property to handle several shortcuts with the same action.

**Example**

```ts
emitKeypress({
  keymap: [
    { sequence: '\x1B', shortcut: 'escape', command: 'cancel' },
    { sequence: '\x03', shortcut: 'ctrl+c', command: 'cancel' },
    { sequence: '\r', shortcut: 'return', command: 'submit' }
  ],
  async onKeypress(input, key, close) {
    // handle keypress events with any logic you want
    switch (key.command) {
      case 'cancel':
        console.log('canceled');
        close();
        break;

      case 'submit':
        console.log('submitted');
        break;
    }
  }
});
```

### input

Pass a Node.js readable stream to `input`. The first session on a stream sets up key parsing and enables raw mode when supported. Sessions sharing that input use the first session's `escapeCodeTimeout`. The last session to close releases the parser, restores raw mode if it changed, and pauses the input if it was initially paused or idle.

```ts
emitKeypress({
  input: process.stdin,
  async onKeypress(input, key, close) {
    // do stuff with keypress events
    console.log({ input, key });

    if (input === '\r' || input === '\x03') {
      close();
    }
  }
});
```

### onMousepress

Pass an `onMousepress(mouse, close)` callback to enable mouse tracking. It receives the parsed mouse event and a function that closes the session.

```js
emitKeypress({
  onKeypress: (input, key, close) => {
    console.log('key:', key);
  },
  onMousepress: (mouse, close) => {
    console.log('mouse:', mouse);
    // mouse.x, mouse.y, mouse.button, mouse.action, etc.
  }
});
```

### Paste Mode

Enable bracketed paste mode to receive a completed paste as a single keypress with `key.name === 'paste'`. Both `input` and `key.sequence` contain the pasted text with carriage returns converted to newlines. If the gap between paste events reaches `pasteModeTimeout`, the session discards that paste.

```ts
emitKeypress({
  enablePasteMode: true,
  pasteModeTimeout: 100, // timeout in ms
  maxPasteBuffer: 1024 * 1024,
  onKeypress: (input, key, close) => {
    if (key.name === 'paste') {
      console.log('pasted:', key.sequence);
    }
  }
});
```

### Enhanced Keyboard Protocol

Enable the Kitty or modifyOtherKeys keyboard protocol for better key detection in supported terminals.

```ts
emitKeypress({
  keyboardProtocol: true,
  onKeypress: (input, key, close) => {
    // Enhanced key reporting with better modifier detection
    console.log({ input, key });
  }
});
```

The module detects the terminal to select the protocol. Sessions sharing an output enable each requested mode once and release it when the last session using that mode closes. This also applies to mouse tracking, bracketed paste, and cursor hiding.

### Cursor Control

Control cursor visibility and get cursor position.

```ts
import { cursor, emitKeypress } from 'emit-keypress';

// Hide/show cursor
cursor.hide(process.stdout);
cursor.show(process.stdout);

// Or use the hideCursor option
emitKeypress({
  hideCursor: true,
  onKeypress: (input, key, close) => {
    // Press Enter to end this session
    if (input === '\r') close();
  }
});

// Get initial cursor position
emitKeypress({
  initialPosition: true,
  onKeypress: (input, key, close) => {
    if (key.name === 'position') {
      console.log('cursor at:', key.x, key.y);
    }
  }
});
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `NodeJS.ReadableStream` | `process.stdin` | Input stream to resume and read as UTF-8 |
| `output` | `WriteStream` | `process.stdout` | Output stream for escape sequences |
| `keymap` | `Array` | `[]` | Custom key mappings |
| `onKeypress` | `Function` | required | Keypress event handler |
| `onMousepress` | `Function` | `undefined` | Mouse event handler (enables mouse tracking) |
| `onExit` | `Function` | `undefined` | Called once when the session closes |
| `escapeCodeTimeout` | `number` | `500` | Timeout for escape sequences (ms) |
| `handleClose` | `boolean` | `true` | Add the session's close function to the instance's exit handlers |
| `hideCursor` | `boolean` | `false` | Hide cursor while listening |
| `initialPosition` | `boolean` | `false` | Request initial cursor position |
| `enablePasteMode` | `boolean` | `false` | Enable bracketed paste mode |
| `pasteModeTimeout` | `number` | `100` | Paste mode timeout (ms) |
| `maxPasteBuffer` | `number` | `1048576` | Stop appending paste sequences once the buffer reaches this length in UTF-16 code units |
| `keyboardProtocol` | `boolean` | `false` | Enable enhanced keyboard protocol |

### createEmitKeypress

Pass `{ setupProcessHandlers: false }` to create an instance with its own `onExitHandlers` set. With no configuration, the factory uses the process-global set and registers cleanup for `exit` and `uncaughtExceptionMonitor`. Passing `{ setupProcessHandlers: true }` also registers cleanup for `SIGINT`.

```ts
import { createEmitKeypress } from 'emit-keypress';

const { emitKeypress, onExitHandlers } = createEmitKeypress({
  setupProcessHandlers: false
});
```

## History

### v3.0.0

Share terminal sessions, isolate keypress events, and add ESM and CommonJS exports

* Restore raw mode, release the decoder, and disable terminal modes when their last session closes.
* Close sessions when input ends or closes, preserve already-flowing input, and register SIGINT handling only when requested.
* Copy keypress events for each subscriber and normalize shortcuts without mutating caller-owned bindings. Treat joined emoji as printable.
* Refresh the bracketed paste timeout on each chunk and discard expired paste through the end marker.
* Decode string and buffer input and restart the decoder after listener errors, including errors during timed Escape delivery.
* Add shared types for keypresses, key bindings, keyboard protocols, and mouse events.
* Publish ESM and CommonJS root and subpath exports. Rename `prettier.config.js` to `prettier.config.cjs` and include `.cts` files in ESLint.
* Add Mocha, discover nested tests, and update development dependencies.
* Add coverage for shared sessions, paste timeouts, Escape decoding, listener recovery, and keymap utilities. Reorganize Unicode tests.
* Update documentation and repository instructions.

### v2.1.0

`emit-keypress` v2.1.0 added support for readable non-TTY streams and fixed a keyboard mapping bug. It was published on July 23, 2026, following v2.0.1. [npm release history](https://registry.npmjs.org/emit-keypress)

* `emitKeypress` now accepts readable streams such as `PassThrough` and checks that the input provides the required stream methods. On non-Windows systems, it enables and restores raw mode only when the input provides `setRawMode`.
* Shift+Home and Shift+End now decode correctly. Their escape-sequence mappings were swapped in v2.0.1.
* Exported keycode entries now omit the default `weight: 0` property.

This release also adds stream and raw-mode tests, moved `detect-terminal` to development dependencies, and updated the lint, build, and test tooling. [Full v2.0.1–v2.1.0 comparison](https://github.com/enquirer/emit-keypress/compare/141297fb65c2b8c821a2d65c67790217f12d6de1...f2d6f42f04ca3a9293e32e3b2ba498547d6a80c3)

### v2.0.0

* Added `onMousepress` option for mouse event handling with automatic mouse tracking
* Added bracketed paste mode support (`enablePasteMode`, `pasteModeTimeout`, `maxPasteBuffer`)
* Added enhanced keyboard protocol support for Kitty and modifyOtherKeys (`keyboardProtocol` option)
* Added `createEmitKeypress` factory for creating isolated instances with separate exit handlers
* Added `cursor` utilities for hiding/showing cursor and getting position
* Added `initialPosition` option to request cursor position on start
* Added `hideCursor` option for automatic cursor visibility management
* Added `onExit` callback option
* Added CSI u (Kitty) and modifyOtherKeys protocol parsing for better modifier key detection
* Added `fn` modifier support to key objects
* Added automatic terminal detection for keyboard protocol selection
* Added `keycodes` export with comprehensive key sequence mappings
* Improved exit handler management with WeakMap-based session counting
* Improved cleanup: protocols are reset, mouse/paste modes disabled on close

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Contributors

| **Commits** | **Contributor** |  
| --- | --- |  
| 53 | [jonschlinkert](https://github.com/jonschlinkert) |  
| 3  | [doowb](https://github.com/doowb) |  

### Author

**Jon Schlinkert**

* [GitHub Profile](https://github.com/jonschlinkert)
* [X Profile](https://x.com/jonschlinkert)
* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)

### License

Copyright © 2026, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the MIT License.

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.8.0, on November 21, 2026._