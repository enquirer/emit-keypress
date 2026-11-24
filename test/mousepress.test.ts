import assert from 'node:assert/strict';
import stream from 'node:stream';
import { emitKeypressEvents } from '~/emit-keypress';
import { mousepress } from '~/mousepress';
import { isMousepress } from '~/utils';

const csi = '\x1b[';

function x10(button, x, y) {
  return csi + 'M' + String.fromCharCode(button + 32, x + 32, y + 32);
}

function urxvt(button, x, y) {
  return csi + [button + 32, x, y].join(';') + 'M';
}

function sgr(button, x, y) {
  return csi + '<' + [button, x, y].join(';') + 'M';
}

function parse(sequence, state = {}) {
  return mousepress(sequence, Buffer.from(sequence), state);
}

const reports = [
  ['X10', x10(0, 19, 7)],
  ['SGR press', sgr(2, 120, 45)],
  ['SGR release', csi + '<2;120;45m'],
  ['URxvt', urxvt(0, 120, 45)],
  ['DEC', csi + '<4;120;45;2&w'],
  ['VT300', csi + '245~[120,45]\r'],
  ['focus', csi + 'I'],
  ['blur', csi + 'O']
];

function listen() {
  const input = new stream.PassThrough({ objectMode: true });
  const events = [];
  input.on('keypress', (text, key) => {
    events.push([text, key.sequence]);
  });
  const dispose = emitKeypressEvents(input);
  return { input, events, dispose };
}

function assertDelivery(chunks, expected, message) {
  const { input, events, dispose } = listen();
  try {
    for (const chunk of chunks) {
      input.write(chunk);
    }
    assert.deepEqual(events, expected, message);
  } finally {
    dispose();
    input.destroy();
  }
}

function assertFraming(input, sequence) {
  const expected = [[undefined, sequence], ['x', 'x']];
  assertDelivery([input], expected, 'single chunk');
  const units = [];
  const length = input.length;
  for (let i = 0; i < length; i++) {
    units.push(input.slice(i, i + 1));
    if (i > 0) {
      assertDelivery([input.slice(0, i), input.slice(i)], expected, 'split at ' + i);
    }
  }
  assertDelivery(units, expected, 'one unit per chunk');
}

describe('mousepress', () => {
  describe('mousepress buttons, modifiers and movement', () => {
    for (const [type, encode] of Object.entries({ X10: x10, urxvt, sgr })) {
      describe(type, () => {
        for (const [code, button] of ['left', 'middle', 'right'].entries()) {
          it('decodes a press of the ' + button + ' button', () => {
            const sequence = encode(code, 12, 7);
            const key = parse(sequence);
            assert.deepEqual([key.name, key.type, key.action, key.button], ['mouse', type, 'mousedown', button]);
            assert.deepEqual([key.x, key.y, key.sequence], [12, 7, sequence]);
          });
        }

        for (const bits of [0, 4, 8, 16, 28]) {
          it('decodes modifier bits ' + bits, () => {
            const key = parse(encode(bits, 5, 2));
            assert.deepEqual([key.shift, key.meta, key.ctrl], [!!(bits & 4), !!(bits & 8), !!(bits & 16)]);
          });
        }

        for (const [direction, action] of ['wheelup', 'wheeldown'].entries()) {
          it('decodes ' + action, () => {
            const key = parse(encode(64 + direction, 23, 5));
            assert.deepEqual([key.action, key.x, key.y], [action, 23, 5]);
          });
        }

        it('reports movement with no button held', () => {
          const key = parse(encode(35, 8, 13));
          assert.deepEqual([key.action, key.button], ['mousemove', undefined]);
        });
      });
    }
  });

  describe('mousepress button releases', () => {
    for (const [type, encode] of Object.entries({ X10: x10, urxvt })) {
      it(type + ' remembers a pressed button until the first release', () => {
        const state = {};
        parse(encode(2, 8, 4), state);
        const release = encode(3, 9, 6);
        const first = parse(release, state);
        assert.deepEqual([first.action, first.button], ['mouseup', 'right']);
        assert.equal(parse(release, state).button, 'unknown');
      });
    }

    it('decodes the released SGR button without a prior press', () => {
      const key = parse(csi + '<17;13;9m');
      assert.deepEqual([key.action, key.button, key.ctrl], ['mouseup', 'middle', true]);
    });
  });

  describe('DEC and VT300 mousepress reports', () => {
    it('decodes DEC coordinates and page', () => {
      const key = parse(csi + '<4;120;45;7&w');
      assert.deepEqual([key.type, key.action, key.button, key.x, key.y, key.page],
        ['dec', 'mousedown', 'middle', 120, 45, 7]);
    });

    for (const [code, button] of [[1, 'left'], [3, 'middle'], [5, 'right']]) {
      it('decodes the VT300 ' + button + ' button', () => {
        const key = parse(csi + '24' + code + '~[16,42]\r');
        assert.deepEqual([key.type, key.action, key.button, key.x, key.y],
          ['vt300', 'mousedown', button, 16, 42]);
      });
    }
  });

  describe('mousepress coordinates and focus changes', () => {
    for (const [label, sequence] of reports) {
      if (label === 'focus' || label === 'blur') {
        it('decodes ' + label, () => {
          assert.equal(parse(sequence).action, label);
        });
      } else {
        it('converts both ' + label + ' coordinates to zero-based indices', () => {
          const expected = label === 'X10' ? [18, 6] : [119, 44];
          const key = parse(sequence, { zero: true });
          assert.deepEqual([key.x, key.y], expected);
        });
      }
    }
  });

  describe('isMousepress', () => {
    for (const code of ['[M', '[I', '[O']) {
      it('requires a complete report when the key code is ' + code, () => {
        assert.equal(isMousepress('\x1b' + code + 'extra', { code }), false);
      });
    }

    for (const [label, sequence] of reports) {
      it('recognizes a complete ' + label + ' report', () => {
        assert.equal(isMousepress(sequence), true);
      });

      it('rejects every unfinished prefix of a ' + label + ' report', () => {
        for (let end = 0; end < sequence.length; end++) {
          assert.equal(isMousepress(sequence.slice(0, end)), false, 'prefix length ' + end);
        }
      });

      it('rejects a ' + label + ' report embedded in other input', () => {
        for (const input of ['x' + sequence, sequence + 'x', sequence + '\n', sequence + sequence]) {
          assert.equal(isMousepress(input), false, JSON.stringify(input));
        }
      });
    }
  });

  describe('mouse report stream framing', () => {
    for (const [label, sequence] of reports) {
      it('delivers the complete ' + label + ' string followed by x across chunk boundaries', () => {
        assertFraming(sequence + 'x', sequence);
      });

      it('delivers the complete ' + label + ' buffer followed by x across chunk boundaries', () => {
        assertFraming(Buffer.from(sequence + 'x'), sequence);
      });
    }

    for (const [x, y] of [[0xff, 0x80], [0xc3, 0xa9], [0x21, 0xe2]]) {
      it('preserves classic X10 coordinate bytes ' + x + ' and ' + y, () => {
        const report = Buffer.from([0x1b, 0x5b, 0x4d, 0x20, x, y]);
        assertFraming(Buffer.concat([report, Buffer.from('x')]), report.toString('latin1'));
      });
    }

    it('preserves extended X10 coordinates supplied as string characters', () => {
      const sequence = x10(0, 400, 302);
      assertFraming(sequence + 'x', sequence);
    });

    it('starts a new report when Escape interrupts an unfinished SGR report', () => {
      const { input, events, dispose } = listen();
      try {
        const partial = csi + '<0;12;';
        const complete = sgr(1, 31, 5);
        input.write(partial + complete + 'x');
        assert.deepEqual(events.slice(-2), [[undefined, complete], ['x', 'x']]);
        for (const [text, sequence] of events.slice(0, -2)) {
          assert.equal(text, undefined);
          assert.equal(sequence, partial);
          assert.equal(isMousepress(sequence), false);
        }
      } finally {
        dispose();
        input.destroy();
      }
    });

    it('delivers mouse-like paste content literally and frames the next mouse report', () => {
      const { input, events, dispose } = listen();
      try {
        const report = sgr(0, 12, 9);
        const payload = report + '\n\x1b]10;rgb:aaaa/bbbb/cccc\x1b\\' + csi + '201x' + '🌸';
        const start = csi + '200~';
        const end = csi + '201~';
        const bytes = Buffer.from(start + payload + end + report + 'x');
        for (let i = 0; i < bytes.length; i++) {
          input.write(bytes.subarray(i, i + 1));
        }
        assert.deepEqual(events[0], [undefined, start]);
        assert.deepEqual(events.slice(-3), [[undefined, end], [undefined, report], ['x', 'x']]);
        const content = events.slice(1, -3);
        for (const [text, sequence] of content) {
          assert.equal(typeof text, 'string', 'expected literal paste text');
          assert.equal(sequence, text, 'expected the paste sequence to preserve the literal text');
        }
        assert.equal(content.map(([text]) => text).join(''), payload);
      } finally {
        dispose();
        input.destroy();
      }
    });

    it('delivers adjacent protocols and focus changes in order', () => {
      const sequences = reports.map(([, sequence]) => sequence);
      const expected = sequences.map(sequence => [undefined, sequence]);
      assertDelivery([sequences.join('') + 'x'], [...expected, ['x', 'x']], 'adjacent reports');
    });

    it('keeps interleaved partial reports local to each stream', () => {
      const first = listen();
      const second = listen();
      try {
        first.input.write(csi + '<2;');
        second.input.write(csi + '32;');
        assert.deepEqual(first.events, []);
        assert.deepEqual(second.events, []);
        second.input.write('25;6Mx');
        first.input.write('120;45mx');
        assert.deepEqual(first.events, [[undefined, csi + '<2;120;45m'], ['x', 'x']]);
        assert.deepEqual(second.events, [[undefined, csi + '32;25;6M'], ['x', 'x']]);
      } finally {
        first.dispose();
        second.dispose();
        first.input.destroy();
        second.input.destroy();
      }
    });
  });
});
