import childProcess from 'node:child_process';
import { strict as assert } from 'node:assert';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import nodeTest from 'node:test';
import { emitKeypress, emitKeypressEvents } from '../index';

const initialListeners = process.listenerCount('SIGINT');

function createMockInput() {
  const input = new EventEmitter();
  input.isTTY = true;
  input.isRaw = false;
  input.setRawMode = function(isRaw: boolean) { this.isRaw = isRaw; };
  input.setEncoding = function(encoding: string) { this.encoding = encoding; };
  input.resume = () => {};
  input.pause = () => {};
  return input;
}

function createMockOutput() {
  const output = new EventEmitter();
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  output.write = function(sequence: string) {
    // Capture the write sequence for the sake of testing
    return true;
  };
  return output;
}

describe('keypress input', () => {
  describe('emitKeypress', () => {
    it('should throw an error if invalid stream is passed', () => {
      const invalidInput = new EventEmitter();

      assert.throws(() => {
        emitKeypress({
          input: invalidInput,
          onKeypress: () => {}
        });
      }, /Invalid stream passed/, 'expected an invalid-stream error');
    });

    it('should pass the sequence and key name to the callback', cb => {
      const mockInput = createMockInput();
      const mockOutput = createMockOutput();

      const keySequence = 'a';
      const key = { sequence: keySequence, name: 'a' };

      emitKeypress({
        input: mockInput,
        output: mockOutput,
        onKeypress: (input, k, close) => {
          assert.equal(input, keySequence, 'expected callback input to match the key sequence');
          assert.equal(k.name, key.name, 'expected key name to be a');
          close();
          cb();
        }
      });

      emitKeypressEvents(mockInput); // Ensure keypress events are emitted
      mockInput.emit('keypress', keySequence, key);
    });

    it('should report carriage return from a readable stream as return', cb => {
      const input = new PassThrough();
      const output = createMockOutput();

      emitKeypress({
        input,
        output,
        onKeypress: (sequence, key, close) => {
          assert.equal(sequence, '\r', 'expected carriage return as callback input');
          assert.equal(key.name, 'return', 'expected key name to be return');
          close();
          cb();
        }
      });

      input.write('\r');
    });

    it('should restore raw mode when the readable stream supports it', () => {
      const input = new PassThrough() as PassThrough & {
        isRaw: boolean;
        setRawMode: (isRaw: boolean) => void;
      };
      const rawModes: boolean[] = [];
      input.isRaw = false;
      input.setRawMode = isRaw => {
        input.isRaw = isRaw;
        rawModes.push(isRaw);
      };

      const close = emitKeypress({
        input,
        output: createMockOutput(),
        onKeypress: () => {}
      });

      close();
      assert.deepEqual(rawModes, [true, false], 'expected raw mode to toggle on then off');
    });

    it('should restore shared input after the last prompt closes', () => {
      const input = createMockInput();
      const first = emitKeypress({ input, output: createMockOutput(), onKeypress: () => {} });
      const second = emitKeypress({ input, output: createMockOutput(), onKeypress: () => {} });

      first();
      first();
      assert.equal(input.isRaw, true, 'expected shared input to stay raw after the first close');
      second();
      assert.equal(input.isRaw, false, 'expected shared input to leave raw mode after the last close');
    });

    it('should preserve an input that was already raw', () => {
      const input = createMockInput();
      input.isRaw = true;
      const close = emitKeypress({ input, output: createMockOutput(), onKeypress: () => {} });

      close();
      assert.equal(input.isRaw, true, 'expected initial raw mode to be preserved');
    });

    it('should release each output mode when its last prompt closes', () => {
      const output = createMockOutput();
      const writes = [];
      output.write = sequence => {
        writes.push(sequence);
        return true;
      };

      const options = { output, onKeypress: () => {}, enablePasteMode: true, hideCursor: true, keyboardProtocol: true };
      const first = emitKeypress({ ...options, input: createMockInput(), onMousepress: () => {} });
      const started = writes.splice(0);
      const second = emitKeypress({ ...options, input: createMockInput() });

      assert.deepEqual(writes, [], 'expected no duplicate output mode writes');
      first();
      first();
      assert.deepEqual(writes.splice(0), ['\x1b[?1003l'], 'expected only mouse tracking to be disabled');
      second();
      assert.ok(writes.includes('\x1b[?25h'), 'expected cursor to be shown');
      assert.ok(writes.includes('\x1b[?2004l'), 'expected bracketed paste to be disabled');
      if (started.includes('\x1b[>1u')) assert.ok(writes.includes('\x1b[<u'), 'expected Kitty keyboard mode to be popped');
      if (started.includes('\x1b[>4;1m')) assert.ok(writes.includes('\x1b[>4;0m'), 'expected modifyOtherKeys to be disabled');
    });

    it('should preserve Meta+Up across 1,000 consecutive events', cb => {
      const mockInput = createMockInput();
      const mockOutput = createMockOutput();

      const key = { sequence: '\x1B[1;9A', shortcut: 'meta+up' };
      let i = 0;

      emitKeypress({
        input: mockInput,
        output: mockOutput,
        onKeypress: (input, k, close) => {
          assert.equal(input, key.sequence, 'expected callback input to match Meta+Up');
          assert.equal(k.sequence, key.sequence, 'expected key sequence to match Meta+Up');
          assert.equal(k.shortcut, key.shortcut, 'expected shortcut to be meta+up');

          if (i === 999) {
            close();
            cb();
          }
        }
      });

      emitKeypressEvents(mockInput);

      for (; i < 1000; i++) {
        mockInput.emit('keypress', key.sequence, key);
      }
    });

    it('should report multiline bracketed paste as a paste keypress', cb => {
      const mockInput = createMockInput();
      const mockOutput = createMockOutput();

      const pasteStartSequence = '\x1b[200~';
      const pasteEndSequence = '\x1b[201~';
      const pasteContent = 'this\nis\npasted\ncontent\n\n';

      emitKeypress({
        input: mockInput,
        output: mockOutput,
        enablePasteMode: true,
        onKeypress: (input, k, close) => {
          if (input === pasteContent) {
            assert.equal(k.sequence, pasteContent, 'expected key sequence to contain all pasted text');
            assert.equal(k.name, 'paste', 'expected key name to be paste');
            close();
            cb();
          }
        }
      });

      emitKeypressEvents(mockInput); // Ensure keypress events are emitted

      mockInput.emit('keypress', pasteStartSequence, {
        name: 'paste-start',
        sequence: pasteStartSequence
      });

      pasteContent.split('').forEach(char => {
        mockInput.emit('keypress', char, { sequence: char });
      });

      mockInput.emit('keypress', pasteEndSequence, { name: 'paste-end', sequence: pasteEndSequence });
    });

    it('should report the entire large bracketed paste', cb => {
      const mockInput = createMockInput();
      const mockOutput = createMockOutput();

      const pasteStartSequence = '\x1b[200~';
      const pasteEndSequence = '\x1b[201~';
      const pasteContent = 'this\nis\npasted\ncontent\n\n'.repeat(10_000);

      emitKeypress({
        input: mockInput,
        output: mockOutput,
        enablePasteMode: true,
        onKeypress: (input, k, close) => {
          if (input === pasteContent) {
            assert.equal(k.sequence, pasteContent, 'expected key sequence to contain the full large paste');
            assert.equal(k.name, 'paste', 'expected key name to be paste');
            close();
            cb();
          }
        }
      });

      emitKeypressEvents(mockInput); // Ensure keypress events are emitted
      mockInput.emit('keypress', pasteStartSequence, { name: 'paste-start', sequence: pasteStartSequence });
      pasteContent.split('').forEach(char => {
        mockInput.emit('keypress', char, { sequence: char });
      });
      mockInput.emit('keypress', pasteEndSequence, { name: 'paste-end', sequence: pasteEndSequence });
    });

    it('should write the bracketed paste enable sequence once', cb => {
      const mockInput = createMockInput();
      const mockOutput = createMockOutput();

      let pasteModeCall = 0;

      mockOutput.write = (sequence: string) => {
        if (sequence === '\x1b[?2004h') pasteModeCall++;
        return true;
      };

      emitKeypress({
        input: mockInput,
        output: mockOutput,
        onKeypress: () => {},
        enablePasteMode: true
      });

      setTimeout(() => {
        assert.equal(pasteModeCall, 1, 'expected one paste-mode enable write');
        cb();
      }, 10);
    });

    it('should hide the cursor on setup and show it on close', cb => {
      const mockInput = createMockInput();
      const mockOutput = createMockOutput();

      let hideCalls = 0;
      let showCalls = 0;

      mockOutput.write = (sequence: string) => {
        if (sequence === '\x1b[?25l') hideCalls++;
        if (sequence === '\x1b[?25h') showCalls++;
        return true;
      };

      const close = emitKeypress({
        input: mockInput,
        output: mockOutput,
        onKeypress: () => {},
        hideCursor: true
      });

      setTimeout(() => {
        assert.equal(hideCalls, 1, 'expected one cursor-hide write');
        close();
        setTimeout(() => {
          assert.equal(showCalls, 1, 'expected one cursor-show write');
          cb();
        }, 10);
      }, 10);
    });

    it('should report rapid arrow sequences and shortcuts in order', cb => {
      const mockInput = createMockInput();
      const mockOutput = createMockOutput();

      const escapeSequences = [
        { sequence: '\x1B[A', shortcut: 'up' },
        { sequence: '\x1B[B', shortcut: 'down' },
        { sequence: '\x1B[C', shortcut: 'right' }
      ];
      let completed = 0;

      emitKeypress({
        input: mockInput,
        output: mockOutput,
        onKeypress: (input, k, close) => {
          const expected = escapeSequences[completed];
          assert.equal(input, expected.sequence, 'expected escape sequences in input order');
          assert.equal(k.shortcut, expected.shortcut, 'expected shortcuts in input order');
          completed++;

          if (completed === escapeSequences.length) {
            close();
            cb();
          }
        }
      });

      emitKeypressEvents(mockInput);

      // Emit sequences rapidly with only 1ms delay
      escapeSequences.forEach((seq, i) => {
        setTimeout(() => {
          mockInput.emit('keypress', seq.sequence, { sequence: seq.sequence, shortcut: seq.shortcut });
        }, Number(i));
      });
    });

    it('keeps receiving paste chunks while each arrives before the timeout', async () => {
      const input = new PassThrough();
      const received = [];
      const close = emitKeypress({ input, pasteModeTimeout: 100, onKeypress: (sequence, key) => received.push([sequence, key.name]) });
      try {
        input.write('\x1b[200~a');
        await new Promise(resolve => setTimeout(resolve, 60));
        input.write('b');
        await new Promise(resolve => setTimeout(resolve, 60));
        input.write('c\x1b[201~');
        assert.deepEqual(received, [['abc', 'paste']]);
      } finally {
        close();
      }
    });

    it('discards timed-out paste until the end marker', async () => {
      const input = new PassThrough();
      const received = [];
      const close = emitKeypress({ input, pasteModeTimeout: 10, onKeypress: sequence => received.push(sequence) });
      try {
        input.write('\x1b[200~a');
        await new Promise(resolve => setTimeout(resolve, 30));
        input.write('b\r\x1b[201~x');
        assert.deepEqual(received, ['x']);
      } finally {
        close();
      }
    });

    it('keeps callback changes local to each subscriber', () => {
      const input = createMockInput();
      const first = emitKeypress({ input, onKeypress: (_, key) => { key.sequence = 'changed'; } });
      const received = [];
      const second = emitKeypress({ input, onKeypress: sequence => received.push(sequence) });
      try {
        input.emit('keypress', 'a', { name: 'a', sequence: 'a' });
        assert.deepEqual(received, ['a']);
      } finally {
        first();
        second();
      }
    });

    for (const event of ['end', 'close']) {
      it('releases raw mode on ' + event + ' after a temporary pause', () => {
        const input = createMockInput();
        let exits = 0;
        const close = emitKeypress({ input, onKeypress: () => {}, onExit: () => exits++ });
        input.emit('pause');
        assert.equal(input.isRaw, true);
        input.emit(event);
        assert.equal(input.isRaw, false);
        close();
        assert.equal(exits, 1);
      });
    }

    it('preserves an input that was already flowing', () => {
      const input = new PassThrough();
      input.resume();
      const close = emitKeypress({ input, onKeypress: () => {} });
      close();
      assert.equal(input.readableFlowing, true);
      input.destroy();
    });

    it('registers SIGINT handling only when requested', () => {
      const script = `
        const assert = require('node:assert/strict');
        const signals = process.listenerCount('SIGINT');
        const crashes = process.listenerCount('uncaughtException');
        const monitors = process.listenerCount('uncaughtExceptionMonitor');
        const { createEmitKeypress } = require('./index.ts');
        assert.equal(process.listenerCount('SIGINT'), signals);
        assert.equal(process.listenerCount('uncaughtException'), crashes);
        assert.equal(process.listenerCount('uncaughtExceptionMonitor'), monitors + 1);
        createEmitKeypress({ setupProcessHandlers: true });
        assert.equal(process.listenerCount('SIGINT'), signals + 1);
      `;
      childProcess.execFileSync(process.execPath, ['--import=tsx', '--eval', script]);
    });

    it('should limit delivered paste content to 1 MiB', cb => {
      const mockInput = createMockInput();
      const mockOutput = createMockOutput();

      const pasteStartSequence = '\x1b[200~';
      const pasteEndSequence = '\x1b[201~';
      const pasteContent = 'x'.repeat(2 * 1024 * 1024); // 2MB of data (over the 1MB limit)
      let received = false;

      emitKeypress({
        input: mockInput,
        output: mockOutput,
        enablePasteMode: true,
        pasteModeTimeout: 100,
        onKeypress: (input, k, close) => {
          if (k.name === 'paste') {
            assert.ok(input.length <= 1024 * 1024, 'Paste buffer should be limited to 1MB');
            received = true;
            close();
            cb();
          }
        }
      });

      emitKeypressEvents(mockInput);

      mockInput.emit('keypress', pasteStartSequence, {
        name: 'paste-start',
        sequence: pasteStartSequence
      });

      pasteContent.split('').forEach(char => {
        mockInput.emit('keypress', char, { sequence: char });
      });

      mockInput.emit('keypress', pasteEndSequence, {
        name: 'paste-end',
        sequence: pasteEndSequence
      });

      setTimeout(() => {
        assert.ok(received, 'Should have received paste event');
      }, 150);
    });

    it('should remove keypress and pause listeners and restore the SIGINT listener count', cb => {
      const mockInput = createMockInput();
      const mockOutput = createMockOutput();

      const close = emitKeypress({
        input: mockInput,
        output: mockOutput,
        onKeypress: () => {},
        handleClose: true
      });

      assert.ok(process.listenerCount('SIGINT') >= initialListeners, 'SIGINT listeners should be added');
      close();

      setTimeout(() => {
        assert.equal(process.listenerCount('SIGINT'), initialListeners, 'SIGINT listeners should be cleaned up');
        assert.equal(mockInput.listenerCount('keypress'), 0, 'keypress listeners should be cleaned up');
        assert.equal(mockInput.listenerCount('pause'), 0, 'pause listeners should be cleaned up');
        cb();
      }, 10);
    });

    it('should report a combining character as printable', cb => {
      const mockInput = createMockInput();
      const mockOutput = createMockOutput();

      const combiningChar = 'e\u0301'; // é (e + combining acute accent)
      let received = false;

      emitKeypress({
        input: mockInput,
        output: mockOutput,
        onKeypress: (input, k, close) => {
          assert.equal(input, combiningChar, 'expected the full combining sequence');
          assert.ok(k.printable, 'expected combining text to be printable');
          received = true;
          close();
          cb();
        }
      });

      emitKeypressEvents(mockInput);
      mockInput.emit('keypress', combiningChar, { sequence: combiningChar });

      setTimeout(() => {
        assert.ok(received, 'Should have received combining character event');
      }, 100);
    });
  });

  describe('emitKeypressEvents input framing', () => {
    let input;
    let events;
    let dispose;

    beforeEach(() => {
      input = new PassThrough();
      events = [];
      input.on('keypress', (value, key) => events.push({ value, key }));
      dispose = emitKeypressEvents(input, { escapeCodeTimeout: 20 });
    });

    afterEach(() => {
      dispose();
      input.destroy();
    });

    const shiftMeta = { shift: true, meta: true };
    const ctrlMeta = { ctrl: true, meta: true };
    const modifiedKeys = [];
    for (const [parameter, flags] of [[10, shiftMeta], [13, ctrlMeta], [14, { ...ctrlMeta, shift: true }]]) {
      for (const [final, name, fn] of [
        ['A', 'up', false], ['B', 'down', false], ['C', 'right', false], ['D', 'left', false],
        ['F', 'right', true], ['H', 'left', true],
        ['P', 'f1', true], ['Q', 'f2', true], ['R', 'f3', true], ['S', 'f4', true]
      ]) {
        modifiedKeys.push([name + ' with modifier ' + parameter, '\x1b[1;' + parameter + final, { name, fn, ...flags }]);
      }
      modifiedKeys.push(['delete with modifier ' + parameter, '\x1b[3;' + parameter + '~', { name: 'delete', fn: true, ...flags }]);
    }
    for (const [parameter, flags] of [[10, shiftMeta], [14, { ...ctrlMeta, shift: true }]]) {
      for (const [code, name] of [[5, 'up'], [6, 'down']]) {
        modifiedKeys.push(['fn+' + name + ' with modifier ' + parameter, '\x1b[' + code + ';' + parameter + '~', { name, fn: true, ...flags }]);
      }
    }
    for (const [code, name] of [[15, 'f5'], [17, 'f6'], [18, 'f7'], [19, 'f8'], [20, 'f9'], [21, 'f10'], [23, 'f11'], [24, 'f12']]) {
      modifiedKeys.push([name + ' with modifier 10', '\x1b[' + code + ';10~', { name, fn: true, ...shiftMeta }]);
    }

    for (const [title, sequence, modifiers] of [
      ...modifiedKeys,
      ['CSI-u Ctrl+Shift+S', '\x1b[115;6u', { name: 's', ctrl: true, shift: true }],
      ['CSI-u supplementary Unicode scalar', '\x1b[127800;1u', { name: '🌸' }],
      ['CSI-u surrogate', '\x1b[55296;1u', { name: undefined }],
      ['CSI-u out-of-range code point', '\x1b[1114112;1u', { name: undefined }],
      ['SS3 F1', '\x1bOP', { name: 'f1', fn: true }],
      ['double-bracket F1', '\x1b[[A', { name: 'f1', fn: true }],
      ['rxvt Shift+Delete', '\x1b[3$', { name: 'delete', shift: true }],
      ['a cursor-position reply', '\x1b[123;456R', null],
      ['a private device-attributes reply', '\x1b[?62;4;22c', null],
      ['a BEL-terminated OSC reply', '\x1b]10;rgb:aaaa/bbbb/cccc\x07', null],
      ['a DCS reply', '\x1bP1$r0m\x1b\\', null],
      ['an unfamiliar CSI with an intermediate byte', '\x1b[?42;19 z', null],
      ['modifyOtherKeys Ctrl+A', '\x1b[27;5;97~', { name: 'a', ctrl: true, meta: false, shift: false, fn: false }],
      ['Shift+F3', '\x1b[1;2R', { name: 'f3', ctrl: false, meta: false, shift: true, fn: true }],
      ['an OSC reply with a string terminator', '\x1b]10;rgb:aaaa/bbbb/cccc\x1b\\', null]
    ]) {
      it('frames ' + title + ' followed by x at every split point', () => {
        const data = sequence + 'x';
        const partitions = [[data], [...data]];
        for (let i = 1; i < data.length; i++) {
          partitions.push([data.slice(0, i), data.slice(i)]);
        }

        for (const chunks of partitions) {
          events.length = 0;
          for (const chunk of chunks) {
            input.write(chunk);
          }

          const context = JSON.stringify(chunks);
          assert.deepEqual(events.map(({ key }) => key.sequence), [sequence, 'x'], context);
          assert.equal(events[0].value, undefined, context);
          if (modifiers) {
            const { name, ctrl, meta, shift, fn } = events[0].key;
            assert.deepEqual({ name, ctrl, meta, shift, fn }, { ctrl: false, meta: false, shift: false, fn: false, ...modifiers }, context);
          }
          assert.equal(events[1].value, 'x', context);
          assert.equal(events[1].key.name, 'x', context);
        }
      });
    }

    it('reads Up and x after Escape interrupts an incomplete CSI', () => {
      input.write('\x1b[12;');
      input.write('\x1b[Ax');
      assert.deepEqual(events.map(({ key }) => [key.sequence, key.name]), [
        ['\x1b[A', 'up'],
        ['x', 'x']
      ]);
    });

    it('delivers a key on a second stream while an OSC terminator is pending', () => {
      const second = new PassThrough();
      const keys = [];
      second.on('keypress', (value, key) => keys.push([key.sequence, key.name]));
      const disposeSecond = emitKeypressEvents(second);
      const prefix = '\x1b]10;rgb:aaaa/bbbb/cccc\x1b';

      try {
        input.write(prefix);
        second.write('y');
        assert.deepEqual(keys, [['y', 'y']]);
        assert.deepEqual(events, []);

        input.write('\\x');
        assert.deepEqual(events.map(({ key }) => key.sequence), [prefix + '\\', 'x']);
        assert.equal(events[1].key.name, 'x');
        assert.deepEqual(keys, [['y', 'y']]);
      } finally {
        disposeSecond();
        second.destroy();
      }
    });

    it('delivers a diverging closing delimiter as paste text and resumes key input after paste-end', () => {
      input.write('\x1b[200~\x1b[20');
      input.write('x\x1b[201~x');
      assert.deepEqual(events.map(({ key }) => [key.sequence, key.name]), [
        ['\x1b[200~', 'paste-start'],
        ['\x1b[20x', undefined],
        ['\x1b[201~', 'paste-end'],
        ['x', 'x']
      ]);
      assert.equal(events[1].value, '\x1b[20x');
    });

    it('discards an oversized OSC reply through its terminator and delivers the next key', () => {
      input.write('\x1b]' + 'a'.repeat(65_536));
      input.write('tail\x07x');
      assert.deepEqual(events.map(({ key }) => [key.sequence, key.name]), [['x', 'x']]);
    });

    it('delivers the next key after an unterminated reply has been idle for five seconds', () => {
      const { timers } = nodeTest.mock;
      timers.enable({ apis: ['setTimeout'] });
      try {
        input.write('\x1bPpending');
        timers.tick(5000);
        input.write('x');
        assert.deepEqual(events.map(({ key }) => [key.sequence, key.name]), [['x', 'x']]);
      } finally {
        timers.reset();
      }
    });

    it('refreshes the DCS idle deadline when a fragment arrives', () => {
      const { timers } = nodeTest.mock;
      timers.enable({ apis: ['setTimeout'] });
      try {
        input.write('\x1bP1$r');
        timers.tick(4000);
        input.write('0m');
        timers.tick(4000);
        input.write('\x1b\\x');
        assert.deepEqual(events.map(({ value, key }) => [value, key.sequence]), [
          [undefined, '\x1bP1$r0m\x1b\\'], ['x', 'x']
        ]);
      } finally {
        timers.reset();
      }
    });

    it('releases an oversized unterminated OSC after five idle seconds', () => {
      const { timers } = nodeTest.mock;
      timers.enable({ apis: ['setTimeout'] });
      try {
        input.write('\x1b]' + 'a'.repeat(65_536));
        timers.tick(4999);
        input.write('still payload');
        timers.tick(5000);
        input.write('x');
        assert.deepEqual(events.map(({ value, key }) => [value, key.sequence, key.name]), [['x', 'x', 'x']]);
      } finally {
        timers.reset();
      }
    });

    for (const size of [65_536, 65_537]) {
      it('applies the OSC limit to a ' + size + '-code-unit reply', () => {
        const sequence = '\x1b]' + '🌸'.repeat(32_766) + 'a'.repeat(size - 65_535) + '\x07';
        assert.equal(sequence.length, size);
        input.write(sequence + 'x');
        const expected = size === 65_536 ? [[undefined, sequence], ['x', 'x']] : [['x', 'x']];
        assert.deepEqual(events.map(({ value, key }) => [value, key.sequence]), expected);
      });
    }

    for (const [title, pending, expected] of [
      ['lone Escape', '\x1b', [[undefined, '\x1b', 'escape']]],
      ['incomplete CSI', '\x1b[123;', []],
      ['unterminated OSC', '\x1b]10;color', []],
      ['unterminated DCS', '\x1bP1$r\x1b', []],
      ['incomplete UTF-8 character', Buffer.from([0xf0, 0x9f]), [['\ufffd', '\ufffd', undefined]]]
    ]) {
      it('resolves stream end with ' + title, async () => {
        const ended = new Promise(resolve => input.once('end', resolve));
        input.write(pending);
        assert.deepEqual(events, []);
        input.end();
        await ended;
        assert.deepEqual(events.map(({ value, key }) => [value, key.sequence, key.name]), expected);
      });
    }

    it('delivers a partial paste-closing delimiter literally on stream end', async () => {
      const ended = new Promise(resolve => input.once('end', resolve));
      input.write('\x1b[200~');
      input.write('\x1b[20');
      assert.deepEqual(events.map(({ key }) => [key.sequence, key.name]), [['\x1b[200~', 'paste-start']]);
      input.end();
      await ended;
      assert.deepEqual(events.slice(1).map(({ value, key }) => [value, key.sequence, key.name]), [
        ['\x1b[20', '\x1b[20', undefined]
      ]);
    });

    it('cancels pending Escape delivery on disposal', () => {
      const { timers } = nodeTest.mock;
      timers.enable({ apis: ['setTimeout'] });
      try {
        input.write('\x1b');
        dispose();
        timers.tick(20);
        assert.deepEqual(events, []);
      } finally {
        timers.reset();
      }
    });
  });

  describe('emitKeypressEvents escape timeouts', () => {
    let input;
    let keys;

    beforeEach(() => {
      input = new PassThrough();
      keys = [];
      input.on('keypress', (sequence, key) => {
        keys.push(key);
      });
      emitKeypressEvents(input, { escapeCodeTimeout: 20 });
    });

    afterEach(() => {
      input.destroy();
      input.removeAllListeners();
    });

    it('emits a lone Escape after the configured timeout', async () => {
      input.write('\x1b');
      assert.equal(keys.length, 0, 'expected no keypress before the timeout');
      await new Promise(resolve => setTimeout(resolve, 80));
      assert.deepEqual(keys.map(key => key.name), ['escape'], 'expected one Escape keypress');
    });

    it('reads ordinary input after a timed Escape', async () => {
      input.write('\x1b');
      await new Promise(resolve => setTimeout(resolve, 80));
      input.write('x');
      assert.deepEqual(keys.map(key => key.name), ['escape', 'x'], 'expected Escape followed by x');
      assert.equal(keys[1].meta, false, 'expected x to have no Meta modifier');
    });

    for (const [title, chunks] of [
      ['one chunk', ['\x1b[A']],
      ['a separate Escape chunk', ['\x1b', '[A']],
      ['a separate final byte', ['\x1b[', 'A']],
      ['one byte per chunk', ['\x1b', '[', 'A']]
    ]) {
      it('reads an arrow delivered as ' + title + ' without a later Escape event', async () => {
        for (const chunk of chunks) {
          input.write(chunk);
        }

        await new Promise(resolve => setTimeout(resolve, 80));
        assert.deepEqual(keys.map(key => key.name), ['up'], 'expected one Up keypress');
        assert.equal(keys[0].sequence, '\x1b[A', 'expected the complete Up sequence');
      });
    }

    for (const [title, chunks] of [
      ['a CSI prefix in one chunk', ['\x1b[']],
      ['a CSI prefix split after Escape', ['\x1b', '[']],
      ['a parameterized CSI prefix in one chunk', ['\x1b[1;']],
      ['a parameterized CSI prefix split across chunks', ['\x1b', '[', '1', ';']],
      ['an SS3 prefix in one chunk', ['\x1bO']],
      ['an SS3 prefix split after Escape', ['\x1b', 'O']]
    ]) {
      it('keeps ' + title + ' pending past the Escape timeout', async () => {
        for (const chunk of chunks) {
          input.write(chunk);
        }

        await new Promise(resolve => setTimeout(resolve, 80));
        assert.equal(keys.length, 0, 'expected the prefix to wait for another character');
        input.write('A');
        assert.deepEqual(keys.map(key => key.sequence), [chunks.join('') + 'A'], 'expected A to complete the pending sequence');
      });
    }

    it('reads a Down arrow after it interrupts a pending CSI sequence', async () => {
      input.write('\x1b');
      input.write('[1;');
      await new Promise(resolve => setTimeout(resolve, 80));
      assert.equal(keys.length, 0, 'expected the CSI prefix to wait for another character');
      input.write('\x1b[B');
      assert.deepEqual(keys.map(key => key.sequence), ['\x1b[B'], 'expected one complete Down arrow');
    });

    it('reads an Alt character before the Escape timeout expires', async () => {
      input.write('\x1b');
      input.write('x');
      await new Promise(resolve => setTimeout(resolve, 80));
      assert.equal(keys.length, 1, 'expected one Alt keypress');
      assert.equal(keys[0].name, 'x', 'expected key name to be x');
      assert.equal(keys[0].meta, true, 'expected Meta modifier to be set');
    });

    it('reads two separately timed Escape presses', async () => {
      input.write('\x1b');
      await new Promise(resolve => setTimeout(resolve, 80));
      input.write('\x1b');
      await new Promise(resolve => setTimeout(resolve, 80));
      assert.deepEqual(keys.map(key => key.name), ['escape', 'escape'], 'expected two Escape keypresses');
    });
  });

  describe('emitKeypressEvents listener error recovery', () => {
    for (const scenario of [
      {
        title: 'reads a character after a timed Escape listener throws',
        chunks: ['\x1b', 'x'],
        throwName: 'escape',
        expectedSequences: ['\x1b', 'x'],
        expectedErrors: 1
      },
      {
        title: 'reads an arrow after a timed Escape listener throws',
        chunks: ['\x1b', '\x1b[A'],
        throwName: 'escape',
        expectedSequences: ['\x1b', '\x1b[A'],
        expectedErrors: 1
      },
      {
        title: 'reads UTF-8 input after a timed Escape listener throws',
        chunks: ['\x1b', 'é'],
        throwName: 'escape',
        expectedSequences: ['\x1b', 'é'],
        expectedErrors: 1
      },
      {
        title: 'recovers from repeated timed Escape listener errors',
        chunks: ['\x1b', 'x', '\x1b', 'y'],
        throwName: 'escape',
        expectedSequences: ['\x1b', 'x', '\x1b', 'y'],
        expectedErrors: 2
      },
      {
        title: 'reads input after a character listener throws in the data path',
        chunks: ['x', 'y'],
        throwName: 'x',
        expectedSequences: ['x', 'y'],
        expectedErrors: 1
      },
      {
        title: 'reads an arrow after a listener throws in the data path',
        chunks: ['x', '\x1b[B'],
        throwName: 'x',
        expectedSequences: ['x', '\x1b[B'],
        expectedErrors: 1
      }
    ]) {
      it(scenario.title, async () => {
        // Keep uncaught exceptions inside a separate process running the real library.
        const script = `
          const stream = require('node:stream');
          const { emitKeypressEvents } = require('./src/emit-keypress.ts');
          const input = new stream.PassThrough();
          const sequences = [];
          const errors = [];
          const failure = new Error('keypress listener failed');
          const chunks = ${JSON.stringify(scenario.chunks)};

          process.on('uncaughtException', error => {
            if (error !== failure) {
              process.stderr.write(error.stack);
              process.exit(1);
            }

            errors.push(error.message);
          });

          input.on('keypress', (sequence, key) => {
            sequences.push(key.sequence);
            if (key.name === ${JSON.stringify(scenario.throwName)}) {
              throw failure;
            }
          });

          emitKeypressEvents(input, { escapeCodeTimeout: 10 });

          for (let index = 0; index < chunks.length; index++) {
            setTimeout(() => {
              input.push(Buffer.from(chunks[index]));
            }, index * 80);
          }

          setTimeout(() => {
            input.destroy();
            process.stdout.write(JSON.stringify({ sequences, errors }));
          }, chunks.length * 80);
        `;
        const stdout = await new Promise((resolve, reject) => {
          childProcess.execFile(process.execPath, ['--import=tsx', '--eval', script], { timeout: 3000 }, (error, stdout, stderr) => {
            if (error) {
              reject(new Error(stderr || error.message));
              return;
            }

            resolve(stdout);
          });
        });

        const result = JSON.parse(stdout);

        assert.deepEqual(result.errors, Array(scenario.expectedErrors).fill('keypress listener failed'), 'expected the configured listener failures');
        assert.deepEqual(result.sequences, scenario.expectedSequences, 'expected all key sequences in input order');
      }).timeout(5000);
    }
  });
});
