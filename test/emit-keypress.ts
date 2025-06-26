import { strict as assert } from 'node:assert';
import { EventEmitter } from 'node:events';
import { emitKeypress, emitKeypressEvents } from '../index';

const initialListeners = process.listenerCount('SIGINT');

function createMockInput() {
  const input = new EventEmitter() as any;
  input.isTTY = true;
  input.isRaw = false;
  input.setRawMode = function(isRaw: boolean) { this.isRaw = isRaw; };
  input.setEncoding = function(encoding: string) { this.encoding = encoding; };
  input.resume = () => {};
  input.pause = () => {};
  return input;
}

function createMockOutput() {
  const output = new EventEmitter() as any;
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  output.write = function(sequence: string) {
    // Capture the write sequence for the sake of testing
    return true;
  };
  return output;
}

describe('emitKeypress', () => {
  it('should throw an error if invalid stream is passed', () => {
    const invalidInput = new EventEmitter();

    assert.throws(() => {
      emitKeypress({
        input: invalidInput as any,
        onKeypress: () => {}
      });
    }, /Invalid stream passed/);
  });

  it('should handle keypress events', cb => {
    const mockInput = createMockInput();
    const mockOutput = createMockOutput();

    const keySequence = 'a';
    const key = { sequence: keySequence, name: 'a' };

    emitKeypress({
      input: mockInput,
      output: mockOutput,
      onKeypress: (input, k, close) => {
        assert.equal(input, keySequence);
        assert.equal(k.name, key.name);
        close();
        cb();
      }
    });

    emitKeypressEvents(mockInput); // Ensure keypress events are emitted
    mockInput.emit('keypress', keySequence, key);
  });

  it('should handle fast consecutive keypress events', cb => {
    const mockInput = createMockInput();
    const mockOutput = createMockOutput();

    const key = { sequence: '\x1B[1;9A', shortcut: 'meta+up' };
    let i = 0;

    emitKeypress({
      input: mockInput,
      output: mockOutput,
      onKeypress: (input, k, close) => {
        assert.equal(input, key.sequence);
        assert.equal(k.sequence, key.sequence);
        assert.equal(k.shortcut, key.shortcut);

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

  it('should handle paste events', cb => {
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
          assert.equal(k.sequence, pasteContent);
          assert.equal(k.name, 'paste');
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

  it('should handle large pasted test', cb => {
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
          assert.equal(k.sequence, pasteContent);
          assert.equal(k.name, 'paste');
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

  it('should enable paste mode', cb => {
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
      assert.equal(pasteModeCall, 1);
      cb();
    }, 10);
  });

  it('should change cursor visibility', cb => {
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
      assert.equal(hideCalls, 1);
      close();
      setTimeout(() => {
        assert.equal(showCalls, 1);
        cb();
      }, 10);
    }, 10);
  });

  it('should handle multiple rapid escape sequences correctly', cb => {
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
        assert.equal(input, expected.sequence);
        assert.equal(k.shortcut, expected.shortcut);
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

  it('should cleanup paste state if paste-end is never received', cb => {
    const mockInput = createMockInput();
    const mockOutput = createMockOutput();

    const pasteStartSequence = '\x1b[200~';
    const pasteContent = 'incomplete paste';
    let keypressAfterTimeout = false;

    emitKeypress({
      input: mockInput,
      output: mockOutput,
      enablePasteMode: true,
      onKeypress: (input, k, close) => {
        if (keypressAfterTimeout) {
          // Should receive normal keypress after timeout
          assert.equal(input, 'x');
          assert.equal(k.sequence, 'x');
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

    // Wait for paste timeout (10 seconds in the implementation)
    setTimeout(() => {
      keypressAfterTimeout = true;
      // Should be handled as normal keypress after timeout
      mockInput.emit('keypress', 'x', { sequence: 'x' });
    }, 110);
  }).timeout(11000);

  it('should handle paste buffer overflow', cb => {
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

  it('should properly clean up all event listeners on close', cb => {
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

  it('should handle combining characters correctly', cb => {
    const mockInput = createMockInput();
    const mockOutput = createMockOutput();

    const combiningChar = 'e\u0301'; // é (e + combining acute accent)
    let received = false;

    emitKeypress({
      input: mockInput,
      output: mockOutput,
      onKeypress: (input, k, close) => {
        assert.equal(input, combiningChar);
        assert.ok(k.printable);
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
