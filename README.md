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

It's lightweight, no dependencies, easy to use, and easy to customize. It's designed to be used in a wide range of use-cases, from simple command-line utilities to complex terminal applications.

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

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.8.0, on February 05, 2025._