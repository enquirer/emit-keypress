import { strict as assert } from 'node:assert';
import {
  createShortcut,
  isBuiltIn,
  isMousepress,
  isPrintableCharacter,
  parsePosition,
  prioritizeKeymap,
  sortKeys,
  sortModifiers,
  sortShortcutModifier,
  sortShortcutModifiers
} from '~/utils'

describe('utils', () => {
  describe('isBuiltIn', () => {
    for (const [title, key, expected] of [
      ['returns true when weight is absent', {}, true],
      ['returns true for zero weight', { weight: 0 }, true],
      ['returns true for negative weight', { weight: -2 }, true],
      ['returns true for the removal weight', { weight: -1 }, true],
      ['returns true for null weight', { weight: null }, true],
      ['returns true for undefined weight', { weight: undefined }, true],
      ['returns false for positive weight', { weight: 5 }, false],
      ['returns false for a positive fractional weight', { weight: 0.5 }, false]
    ]) {
      it(title, () => {
        assert.equal(isBuiltIn(key), expected, expected ? 'expected a built-in binding' : 'expected a user binding');
      });
    }
  });

  describe('isMousepress', () => {
    for (const code of ['[M', '[I', '[O']) {
      it('rejects mouse or focus key code ' + code + ' without string input', () => {
        assert.equal(isMousepress(undefined, { code }), false, 'expected a complete input sequence');
      });
    }

    for (const [title, input] of [
      ['X10 mouse input', '\x1b[M !!'],
      ['urxvt mouse input', '\x1b[32;12;8M'],
      ['SGR mouse press input', '\x1b[<0;12;8M'],
      ['SGR mouse release input', '\x1b[<0;12;8m'],
      ['DEC locator input', '\x1b[<1;2;3;4&w'],
      ['VT300 mouse input', '\x1b[241~[12,8]\r'],
      ['focus-in input', '\x1b[I'],
      ['focus-out input', '\x1b[O']
    ]) {
      it('recognizes ' + title, () => {
        assert.equal(isMousepress(input), true, 'expected the report to be recognized');
      });
    }

    for (const [title, input] of [
      ['an embedded mouse report', 'before\x1b[<0;12;8Mafter'],
      ['empty input', ''], ['ordinary text', 'mouse'], ['an arrow sequence', '\x1b[A'],
      ['an incomplete SGR report', '\x1b[<0;12;'], ['a report without Escape', '[<0;12;8M'],
      ['undefined input', undefined], ['null input', null], ['numeric input', 42],
      ['a Buffer', Buffer.from('\x1b[<0;12;8M')]
    ]) {
      it('rejects ' + title + ' with an arrow key code', () => {
        assert.equal(isMousepress(input, { code: '[A' }), false, 'expected no mouse or focus match');
      });
    }

    it('recognizes a mouse report when the supplied key code is unrelated', () => {
      assert.equal(isMousepress('\x1b[<0;12;8M', { code: '[A' }), true, 'expected input to identify the report');
    });
  });

  describe('parsePosition', () => {
    for (const [title, input, x, y] of [
      ['a cursor report', '\x1b[12;34R', '34', '12'],
      ['single-digit coordinates', '\x1b[1;2R', '2', '1'],
      ['leading zeroes', '\x1b[001;002R', '002', '001'],
      ['trailing text', '\x1b[12;34Rtext', '34', '12'],
      ['a Buffer containing a cursor report', Buffer.from('\x1b[7;9R'), '9', '7']
    ]) {
      it('returns string coordinates for ' + title, () => {
        assert.deepEqual(parsePosition(input), {
          name: 'position',
          position: { y, x },
          printable: false
        }, 'expected row as y and column as x');
      });
    }

    for (const [title, input] of [
      ['empty input', ''], ['undefined input', undefined], ['null input', null], ['zero', 0],
      ['ordinary text', '12;34'], ['a missing row', '\x1b[;34R'], ['a missing column', '\x1b[12;R'],
      ['a missing terminator', '\x1b[12;34'], ['a negative coordinate', '\x1b[-1;2R'],
      ['a fractional coordinate', '\x1b[1.5;2R'], ['a report after leading text', 'text\x1b[12;34R']
    ]) {
      it('returns null for ' + title, () => {
        assert.equal(parsePosition(input), null, 'expected no cursor position');
      });
    }
  });

  describe('sortKeys', () => {
    it('places known properties in the default order before extra properties', () => {
      const result = sortKeys({ extra: 1, weight: 2, ctrl: true, name: 'x', sequence: 'x' });
      assert.deepEqual(Object.keys(result), ['sequence', 'name', 'ctrl', 'weight', 'extra'], 'expected the default property order');
    });

    it('places custom priority properties before the remaining properties', () => {
      const result = sortKeys({ first: 1, second: 2, third: 3 }, ['third', 'first']);
      assert.deepEqual(Object.keys(result), ['third', 'first', 'second'], 'expected custom priorities first');
    });

    it('preserves insertion order when the priority list is empty', () => {
      assert.deepEqual(Object.keys(sortKeys({ b: 2, a: 1 }, [])), ['b', 'a'], 'expected the original property order');
    });

    it('ignores priority names absent from the object', () => {
      assert.deepEqual(sortKeys({ name: 'x' }, ['missing', 'name']), { name: 'x' }, 'expected only existing properties');
    });

    it('preserves falsy and undefined property values', () => {
      const values = { ctrl: false, weight: 0, name: '', extra: null, sequence: undefined };
      assert.deepEqual(sortKeys(values), values, 'expected every original value');
    });

    it('returns an empty object for empty input', () => {
      assert.deepEqual(sortKeys({}), {}, 'expected no properties');
    });

    it('returns a separate object without changing frozen input', () => {
      const input = Object.freeze({ name: 'x', sequence: 'x' });
      const result = sortKeys(input);
      assert.notEqual(result, input, 'expected a new object');
      assert.deepEqual(Object.keys(input), ['name', 'sequence'], 'expected unchanged input order');
    });

    it('includes a property once when custom priorities repeat it', () => {
      assert.deepEqual(Object.keys(sortKeys({ a: 1, b: 2 }, ['b', 'b'])), ['b', 'a'], 'expected each property once');
    });
  });

  describe('sortModifiers', () => {
    // Alias consistency and Command separation are TDD expectations from the review.
    for (const [name, expected] of [
      ['fn', 'fn'], ['ctrl', 'ctrl'], ['control', 'ctrl'], ['shift', 'shift'],
      ['alt', 'meta'], ['option', 'meta'], ['meta', 'meta'], ['cmd', 'cmd'], ['command', 'cmd']
    ]) {
      it('returns ' + expected + ' for the modifier ' + name, () => {
        assert.deepEqual(sortModifiers([name]), [expected], 'expected the ' + expected + ' modifier');
      });
    }

    it('orders function, control, shift, Meta, and Command before the key name', () => {
      assert.deepEqual(sortModifiers(['x', 'cmd', 'meta', 'shift', 'ctrl', 'fn']),
        ['fn', 'ctrl', 'shift', 'meta', 'cmd', 'x'], 'expected modifiers before x in canonical order');
    });

    it('lowercases mixed-case modifier names and key names', () => {
      assert.deepEqual(sortModifiers(['X', 'SHIFT', 'CONTROL']), ['ctrl', 'shift', 'x'], 'expected lowercase tokens');
    });

    it('includes each repeated modifier once', () => {
      assert.deepEqual(sortModifiers(['ctrl', 'control', 'ctrl', 'x']), ['ctrl', 'x'], 'expected one ctrl modifier');
    });

    it('preserves the order and repetition of nonmodifier tokens', () => {
      assert.deepEqual(sortModifiers(['z', 'x', 'z', 'shift']), ['shift', 'z', 'x', 'z'], 'expected nonmodifiers in input order');
    });

    it('returns an empty array for an empty modifier list', () => {
      assert.deepEqual(sortModifiers([]), [], 'expected no tokens');
    });

    it('accepts a frozen array without changing its order', () => {
      const names = Object.freeze(['x', 'shift', 'ctrl']);
      assert.deepEqual(sortModifiers(names), ['ctrl', 'shift', 'x'], 'expected sorted output');
      assert.deepEqual(names, ['x', 'shift', 'ctrl'], 'expected unchanged input tokens');
    });

    it('returns meta and cmd separately when Alt and Command are both present', () => {
      assert.deepEqual(sortModifiers(['cmd', 'alt']), ['meta', 'cmd'], 'expected two distinct modifiers');
    });
  });

  describe('createShortcut', () => {
    // Command separation and lowercase shifted letters remain explicit TDD expectations.
    for (const [modifier, expected] of [
      ['fn', 'fn'], ['shift', 'shift'], ['alt', 'meta'], ['option', 'meta'],
      ['meta', 'meta'], ['ctrl', 'ctrl'], ['control', 'ctrl'], ['cmd', 'cmd'], ['command', 'cmd']
    ]) {
      it('returns ' + expected + '+x when only ' + modifier + ' is enabled for x', () => {
        assert.equal(createShortcut({ name: 'x', [modifier]: true }), expected + '+x', 'expected ' + expected + '+x');
      });

      it('returns ' + expected + '+up when only ' + modifier + ' is enabled for up', () => {
        assert.equal(createShortcut({ name: 'up', [modifier]: true }), expected + '+up', 'expected ' + expected + '+up');
      });

      it('returns up when ' + modifier + ' is false', () => {
        assert.equal(createShortcut({ name: 'up', [modifier]: false }), 'up', 'expected no modifier prefix');
      });
    }

    for (const [title, key, expected] of [
      ['returns an empty shortcut for an unmodified ASCII letter', { name: 'x', sequence: 'x' }, ''],
      ['returns an empty shortcut for an unmodified space', { name: 'space', sequence: ' ' }, ''],
      ['returns an empty shortcut for unmodified punctuation', { name: '+', sequence: '+' }, ''],
      ['returns escape for an Escape key', { name: 'escape', sequence: '\x1b' }, 'escape'],
      ['returns up for a nonprintable arrow sequence', { name: 'up', sequence: '\x1b[A' }, 'up'],
      ['uses a printable sequence instead of a different name', { name: 'other', sequence: 'x', ctrl: true }, 'ctrl+x'],
      ['uses a printable sequence when the name is missing', { sequence: 'x', ctrl: true }, 'ctrl+x'],
      ['keeps the plus character after a modifier prefix', { sequence: '+', ctrl: true }, 'ctrl++'],
      ['keeps the space character after a modifier prefix', { sequence: ' ', ctrl: true }, 'ctrl+ '],
      ['returns one Meta prefix when all Meta aliases are enabled', { name: 'x', alt: true, option: true, meta: true }, 'meta+x'],
      ['returns one control prefix when both control aliases are enabled', { name: 'x', ctrl: true, control: true }, 'ctrl+x'],
      ['returns one Command prefix when both Command aliases are enabled', { name: 'x', cmd: true, command: true }, 'cmd+x'],
      ['keeps Meta and Command prefixes when both are enabled', { name: 'x', alt: true, cmd: true }, 'meta+cmd+x'],
      ['orders all enabled modifiers before the key name', { name: 'x', fn: true, ctrl: true, shift: true, alt: true, cmd: true }, 'fn+ctrl+shift+meta+cmd+x'],
      ['omits fn from home', { name: 'home', fn: true }, 'home'],
      ['omits fn from end', { name: 'end', fn: true }, 'end'],
      ['retains other modifiers when omitting fn from home', { name: 'home', fn: true, ctrl: true, shift: true }, 'ctrl+shift+home'],
      ['retains fn for an arrow key', { name: 'left', fn: true }, 'fn+left'],
      ['returns an empty shortcut for the literal name undefined', { name: 'undefined', ctrl: true }, '']
    ]) {
      it(title, () => {
        assert.equal(createShortcut(key), expected, expected ? 'expected shortcut ' + expected : 'expected an empty shortcut');
      });
    }

    for (const [sequence, expected] of [['A', 'shift+a'], ['Z', 'shift+z'], ['É', 'shift+é']]) {
      it('returns ' + expected + ' for the shifted printable sequence ' + sequence, () => {
        assert.equal(createShortcut({ sequence, shift: true }), expected, 'expected a lowercase shifted key');
      });
    }

    it('returns ctrl+shift+meta+x for a shifted uppercase sequence with Control and Alt', () => {
      assert.equal(createShortcut({ name: 'x', sequence: 'X', ctrl: true, alt: true, shift: true }),
        'ctrl+shift+meta+x', 'expected ordered modifiers and lowercase x');
    });

    for (const [title, key] of [
      ['an empty key object', {}],
      ['an empty sequence', { sequence: '' }],
      ['an unknown escape sequence', { sequence: '\x1b[999~' }],
      ['an unnamed control character', { sequence: '\x00' }],
      ['an unnamed modified key', { sequence: '\x1b[999~', ctrl: true }],
      ['an explicitly undefined name', { name: undefined, sequence: '\x1b[999~' }],
      ['a null name', { name: null, sequence: '\x1b[999~' }]
    ]) {
      it('returns an empty shortcut for ' + title, () => {
        assert.equal(createShortcut(key), '', 'expected an empty shortcut');
      });
    }

    for (const sequence of ['👩‍💻', '👨‍👩‍👧‍👦', '👩🏽‍🚀', '👍', 'e\u0301']) {
      it('returns the printable sequence ' + sequence + ' without a name', () => {
        assert.equal(createShortcut({ sequence }), sequence, 'expected the complete printable sequence');
      });
    }

    it('accepts a frozen key without changing its fields', () => {
      const key = Object.freeze({ name: 'x', sequence: 'x', ctrl: true });
      assert.equal(createShortcut(key), 'ctrl+x', 'expected ctrl+x');
      assert.deepEqual(key, { name: 'x', sequence: 'x', ctrl: true }, 'expected unchanged key fields');
    });
  });

  describe('sortShortcutModifier', () => {
    for (const [input, expected] of [
      ['shift+control+x', 'ctrl+shift+x'], ['SHIFT+CTRL+X', 'ctrl+shift+x'],
      ['option+x', 'meta+x'], ['alt+x', 'meta+x'], ['meta+x', 'meta+x'],
      ['command+x', 'cmd+x'], ['cmd+x', 'cmd+x'], ['cmd+alt+x', 'meta+cmd+x'],
      ['ctrl+ctrl+x', 'ctrl+x'], ['ctrl+control+x', 'ctrl+x'], ['x+shift', 'shift+x'],
      ['escape', 'escape'], ['x', 'x'], ['ctrl++', 'ctrl++'], ['', '']
    ]) {
      it('returns ' + JSON.stringify(expected) + ' for ' + JSON.stringify(input), () => {
        assert.equal(sortShortcutModifier(input), expected, expected ? 'expected ' + expected : 'expected an empty shortcut');
      });
    }

    for (const shortcut of ['command+x', 'cmd+x', 'option+shift+x', 'alt+ctrl+x', 'meta+x']) {
      it('preserves the normalized result when normalizing ' + shortcut + ' again', () => {
        const normalized = sortShortcutModifier(shortcut);
        assert.equal(sortShortcutModifier(normalized), normalized, 'expected normalization to be stable');
      });
    }
  });

  describe('sortShortcutModifiers', () => {
    it('returns an empty array when called without a keymap', () => {
      assert.deepEqual(sortShortcutModifiers(), [], 'expected no bindings');
    });

    it('returns an empty array for an empty keymap', () => {
      assert.deepEqual(sortShortcutModifiers([]), [], 'expected no bindings');
    });

    it('normalizes every shortcut while preserving binding order and other fields', () => {
      const result = sortShortcutModifiers([
        { shortcut: 'SHIFT+CONTROL+x', command: 'select', weight: 2 },
        { shortcut: 'CTRL+y', command: 'open', weight: 10 }
      ]);
      assert.deepEqual(result, [
        { shortcut: 'ctrl+shift+x', command: 'select', weight: 2 },
        { shortcut: 'ctrl+y', command: 'open', weight: 10 }
      ], 'expected normalized shortcuts in input order');
    });

    it('preserves caller-owned shortcut strings', () => {
      const keymap = [{ shortcut: 'SHIFT+CONTROL+x', command: 'select' }];
      sortShortcutModifiers(keymap);
      assert.equal(keymap[0].shortcut, 'SHIFT+CONTROL+x', 'expected unchanged input spelling');
    });

    it('accepts frozen bindings in a frozen array', () => {
      const keymap = Object.freeze([
        Object.freeze({ shortcut: 'SHIFT+CONTROL+x', command: 'select' }),
        Object.freeze({ shortcut: 'CTRL+y', command: 'open', weight: 10 })
      ]);
      assert.deepEqual(sortShortcutModifiers(keymap).map(key => key.shortcut),
        ['ctrl+shift+x', 'ctrl+y'], 'expected both normalized shortcuts');
    });

    it('returns bindings whose shortcuts can be changed independently', () => {
      const binding = { shortcut: 'ctrl+x', command: 'select' };
      const result = sortShortcutModifiers([binding]);
      result[0].shortcut = 'ctrl+y';
      assert.equal(binding.shortcut, 'ctrl+x', 'expected unchanged source shortcut');
    });

    it('preserves a binding shared by two views', () => {
      const shared = { shortcut: 'CONTROL+SHIFT+x', command: 'select' };
      const second = [shared, { shortcut: 'escape', command: 'close' }];
      sortShortcutModifiers([shared]);
      assert.equal(second[0].shortcut, 'CONTROL+SHIFT+x', 'expected unchanged second-view shortcut');
    });
  });

  describe('prioritizeKeymap', () => {
    it('returns an empty array when called without a keymap', () => {
      assert.deepEqual(prioritizeKeymap(), [], 'expected no bindings');
    });

    it('returns an empty array for an empty keymap', () => {
      assert.deepEqual(prioritizeKeymap([]), [], 'expected no bindings');
    });

    it('normalizes shortcuts before returning bindings', () => {
      const result = prioritizeKeymap([{ shortcut: 'SHIFT+CONTROL+x', command: 'select' }]);
      assert.equal(result[0].shortcut, 'ctrl+shift+x', 'expected ctrl+shift+x');
    });

    it('sorts by descending weight while preserving the caller array order', () => {
      const keymap = [{ shortcut: 'ctrl+x', weight: 0 }, { shortcut: 'ctrl+y', weight: 5 }, { shortcut: 'ctrl+z', weight: -2 }];
      const result = prioritizeKeymap(keymap);
      assert.deepEqual(result.map(key => key.shortcut), ['ctrl+y', 'ctrl+x', 'ctrl+z'], 'expected highest weight first');
      assert.deepEqual(keymap.map(key => key.shortcut), ['ctrl+x', 'ctrl+y', 'ctrl+z'], 'expected unchanged input order');
    });

    it('keeps equal-weight bindings in their original order', () => {
      const keymap = [{ shortcut: 'ctrl+x' }, { shortcut: 'ctrl+y', weight: 0 }, { shortcut: 'ctrl+z' }];
      assert.deepEqual(prioritizeKeymap(keymap).map(key => key.shortcut),
        ['ctrl+x', 'ctrl+y', 'ctrl+z'], 'expected stable ordering at weight zero');
    });

    it('removes a built-in binding using a normalized negative shortcut', () => {
      const result = prioritizeKeymap([
        { shortcut: 'ctrl+shift+x', command: 'select', weight: 0 },
        { shortcut: '-SHIFT+CONTROL+x', weight: -1 },
        { shortcut: 'escape', command: 'close', weight: 0 }
      ]);
      assert.deepEqual(result, [{ shortcut: 'escape', command: 'close', weight: 0 }], 'expected only the unrelated binding');
    });

    it('keeps a positive-weight binding targeted by a negative shortcut', () => {
      const result = prioritizeKeymap([
        { shortcut: 'ctrl+x', command: 'custom', weight: 5 },
        { shortcut: '-ctrl+x', weight: -1 }
      ]);
      assert.deepEqual(result, [{ shortcut: 'ctrl+x', command: 'custom', weight: 5 }], 'expected the user binding to remain');
    });

    it('omits records whose weight is minus one', () => {
      assert.deepEqual(prioritizeKeymap([{ shortcut: 'ctrl+x', weight: -1 }]), [], 'expected the disabled binding to be omitted');
    });

    it('keeps duplicate shortcuts with distinct commands in weight order', () => {
      const result = prioritizeKeymap([
        { shortcut: 'ctrl+x', command: 'builtin', weight: 0 },
        { shortcut: 'ctrl+x', command: 'custom', weight: 5 }
      ]);
      assert.deepEqual(result.map(key => key.command), ['custom', 'builtin'], 'expected both commands in priority order');
    });

    it('preserves caller-owned shortcut strings', () => {
      const keymap = [{ shortcut: 'SHIFT+CONTROL+x', command: 'select' }];
      prioritizeKeymap(keymap);
      assert.equal(keymap[0].shortcut, 'SHIFT+CONTROL+x', 'expected unchanged input spelling');
    });

    it('preserves absent weights when sorting several bindings', () => {
      const keymap = [{ shortcut: 'ctrl+x' }, { shortcut: 'ctrl+y', weight: 10 }, { shortcut: 'ctrl+z' }];
      const original = keymap.map(key => ({ ...key }));
      prioritizeKeymap(keymap);
      assert.deepEqual(keymap, original, 'expected no added weight properties');
    });

    it('preserves explicit null weights', () => {
      const keymap = [{ shortcut: 'ctrl+x', weight: null }, { shortcut: 'ctrl+y', weight: 2 }];
      prioritizeKeymap(keymap);
      assert.equal(keymap[0].weight, null, 'expected the source weight to remain null');
    });

    it('accepts frozen bindings in a frozen array', () => {
      const keymap = Object.freeze([
        Object.freeze({ shortcut: 'SHIFT+CONTROL+x', command: 'select' }),
        Object.freeze({ shortcut: 'CTRL+y', command: 'open', weight: 10 })
      ]);
      assert.deepEqual(prioritizeKeymap(keymap).map(key => key.shortcut),
        ['ctrl+y', 'ctrl+shift+x'], 'expected normalized shortcuts in priority order');
    });

    it('returns bindings whose shortcuts can be changed independently', () => {
      const binding = { shortcut: 'ctrl+x', command: 'select' };
      const result = prioritizeKeymap([binding]);
      result[0].shortcut = 'ctrl+y';
      assert.equal(binding.shortcut, 'ctrl+x', 'expected unchanged source shortcut');
    });

    it('preserves a binding shared by two views', () => {
      const shared = { shortcut: 'CONTROL+SHIFT+x', command: 'select' };
      const second = [shared, { shortcut: 'escape', command: 'close' }];
      prioritizeKeymap([shared]);
      assert.equal(second[0].shortcut, 'CONTROL+SHIFT+x', 'expected unchanged second-view shortcut');
    });
  });

  describe('isPrintableCharacter', () => {
    for (const [title, value] of [
      ['a profession emoji', '👩‍💻'],
      ['a family emoji', '👨‍👩‍👧‍👦'],
      ['a skin-tone profession emoji', '👩🏽‍🚀'],
      ['a rainbow flag', '🏳️‍🌈'],
      ['text containing a joined emoji', 'Hello 👩‍💻!'],
      ['adjacent joined emoji', '👩‍💻👨‍👩‍👧‍👦'],
      ['a combining accent', 'e\u0301'],
      ['a regional-indicator flag', '🇯🇵'],
      ['a skin-tone modifier', '👍🏽'],
      ['ordinary spaces', 'hello world']
    ]) {
      it(`accepts ${title} as printable text`, () => {
        assert.equal(isPrintableCharacter(value), true, 'expected printable text');
      });
    }

    for (const [title, value] of [
      ['a null character', '\x00'],
      ['an escape character', '\x1b'],
      ['a newline', '\n'],
      ['a tab', '\t'],
      ['a zero-width space', '\u200b'],
      ['a direction mark', '\u200e'],
      ['a byte-order mark', '\ufeff'],
      ['a line separator', '\u2028'],
      ['a paragraph separator', '\u2029']
    ]) {
      it(`rejects ${title} inside joined emoji text`, () => {
        assert.equal(isPrintableCharacter(`👩‍💻${value}👨‍👩‍👧‍👦`), false, 'expected embedded controls to be rejected');
      });
    }

    it('rejects empty input', () => {
      assert.equal(isPrintableCharacter(''), false, 'expected empty input to be nonprintable');
    });

    it('rejects missing input', () => {
      assert.equal(isPrintableCharacter(undefined), false, 'expected missing input to be nonprintable');
    });

    it('rejects null input', () => {
      assert.equal(isPrintableCharacter(null), false, 'expected null to be nonprintable');
    });

    for (const [title, value] of [
      ['a lone high surrogate', '\ud83d'],
      ['a lone low surrogate', '\udc00'],
      ['a bare Escape sequence', '\x1b[A'],
      ['a standalone newline', '\n']
    ]) {
      it('rejects ' + title, () => {
        assert.equal(isPrintableCharacter(value), false, 'expected nonprintable input');
      });
    }
  });
});
