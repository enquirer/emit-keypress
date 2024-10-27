import { strict as assert } from 'node:assert';
import { EventEmitter } from 'node:events';
import { emitKeypress, emitKeypressEvents } from '../index';

const mockInput = new EventEmitter() as any;
mockInput.isTTY = true;

mockInput.setRawMode = function(isRaw: boolean) {
  this.isRaw = isRaw;
};

mockInput.setEncoding = function(encoding: string) {
  this.encoding = encoding;
};

mockInput.resume = () => {};
mockInput.pause = () => {};

const mockOutput = new EventEmitter() as any;

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
mockOutput.write = function(sequence: string) {
  // Capture the write sequence for the sake of testing
  return true;
};

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
});
