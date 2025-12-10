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

emitKeypress({ input: process.stdin });

process.stdin.on('keypress', (input, key) => {
  console.log({ input, key });

  if (input === '\x03' || input === '\r') {
    process.stdin.pause();
  }
});
```

## API

### onKeypress

Pass an `onKeypress` function to `emitKeypress` to handle keypress events.

```ts
// The "close" function is passed as the third argument
const onKeypress = async (input, key, close) => {
  // do stuff with keypress events
  console.log({ input, key });

  // Close the stream if the user presses `Ctrl+C` or `Enter`
  if (input === '\x03' || input === '\r') {
    close();
  }
};

emitKeypress({ onKeypress });
```

A `close` function is also returned from `emitKeypress` that can be called to close the stream.

```ts
const { close } = emitKeypress({ onKeypress });

// close the stream
setTimeout(() => {
  close();
}, 10_000);
```

### keymap

Pass a `keymap` array to map keypress events to specific shortcuts.

```ts
emitKeypress({
  keymap: [
    { sequence: '\x03', shortcut: 'ctrl+c' },
    { sequence: '\r', shortcut: 'return' }
  ],
  onKeypress: async (input, key, close) => {
    // do stuff with keypress events
    console.log({ input, key });

    if (key.shortcut === 'return' || key.shortcut === 'ctrl+c') {
      close();
    }
  }
});
```

Note that you can add arbitrary properties the keymap objects. This is useful for mapping shortcuts to commands.

**Example**

```ts
emitKeypress({
  keymap: [
    { sequence: '\x1B', shortcut: 'escape', command: 'cancel' },
    { sequence: '\x03', shortcut: 'ctrl+c', command: 'cancel' },
    { sequence: '\r', shortcut: 'return', command: 'submit' }
  ],
  onKeypress: async (input, key, close) => {
    // do stuff with keypress events
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

Pass a `ReadableStream` to `input` to listen for keypress events on the stream.

```ts
emitKeypress({
  input: process.stdin,
  onKeypress: async (input, key, close) => {
    // do stuff with keypress events
    console.log({ input, key });

    if (key.shortcut === 'return' || key.shortcut === 'ctrl+c') {
      close();
    }
  }
});
```

### onMousepress

Pass an `onMousepress` function to handle mouse events. When provided, mouse tracking is automatically enabled.

```ts
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

Enable bracketed paste mode to handle multi-line pastes as a single event.

```ts
emitKeypress({
  enablePasteMode: true,
  pasteModeTimeout: 100, // timeout in ms
  maxPasteBuffer: 1024 * 1024, // 1MB limit
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

Supported terminals include: kitty, alacritty, foot, ghostty, iterm, rio, wezterm (Kitty protocol), and windows_terminal, xterm, gnome_terminal, konsole, vscode, xfce4_terminal, mate_terminal, terminator (modifyOtherKeys protocol).

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
    // cursor is automatically shown when close() is called
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
| `input` | `ReadStream` | `process.stdin` | Input stream to listen on |
| `output` | `WriteStream` | `process.stdout` | Output stream for escape sequences |
| `keymap` | `Array` | `[]` | Custom key mappings |
| `onKeypress` | `Function` | required | Keypress event handler |
| `onMousepress` | `Function` | `undefined` | Mouse event handler (enables mouse tracking) |
| `onExit` | `Function` | `undefined` | Called when the stream closes |
| `escapeCodeTimeout` | `number` | `500` | Timeout for escape sequences (ms) |
| `handleClose` | `boolean` | `true` | Register cleanup on process exit |
| `hideCursor` | `boolean` | `false` | Hide cursor while listening |
| `initialPosition` | `boolean` | `false` | Request initial cursor position |
| `enablePasteMode` | `boolean` | `false` | Enable bracketed paste mode |
| `pasteModeTimeout` | `number` | `100` | Paste mode timeout (ms) |
| `maxPasteBuffer` | `number` | `1048576` | Max paste buffer size (bytes) |
| `keyboardProtocol` | `boolean` | `false` | Enable enhanced keyboard protocol |

### createEmitKeypress

Create an isolated instance with its own exit handlers.

```ts
import { createEmitKeypress } from 'emit-keypress';

const { emitKeypress, onExitHandlers } = createEmitKeypress({
  setupProcessHandlers: true
});
```

## History

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

### Author

**Jon Schlinkert**

* [GitHub Profile](https://github.com/jonschlinkert)
* [Twitter Profile](https://twitter.com/jonschlinkert)
* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)

### License

Copyright © 2025, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the MIT License.

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.8.0, on December 10, 2025._