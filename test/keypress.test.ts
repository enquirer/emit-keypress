import { strict as assert } from 'node:assert';
import { charLengthLeft, charLengthAt } from '~/keypress';

describe('keypress Unicode handling', () => {
  describe('charLengthAt', () => {
    it('should return 1 for ASCII letters and digits', () => {
      assert.equal(charLengthAt('abc', 0), 1, 'expected one unit for a');
      assert.equal(charLengthAt('abc', 1), 1, 'expected one unit for b');
      assert.equal(charLengthAt('123', 0), 1, 'expected one unit for a digit');
    });

    it('should return 2 at the start of each emoji surrogate pair', () => {
      assert.equal(charLengthAt('👍', 0), 2, 'expected two units for thumbs up'); // thumbs up emoji
      assert.equal(charLengthAt('a👍b', 1), 2, 'expected two units for the embedded emoji');
      assert.equal(charLengthAt('🌸🍜', 0), 2, 'expected two units for the flower'); // multiple emojis
      assert.equal(charLengthAt('🌸🍜', 2), 2, 'expected two units for the bowl');
    });

    it('should return 1 for ASCII and 2 for surrogate pairs', () => {
      const str = 'hi👋there';
      assert.equal(charLengthAt(str, 0), 1, 'expected one unit for h'); // 'h'
      assert.equal(charLengthAt(str, 1), 1, 'expected one unit for i'); // 'i'
      assert.equal(charLengthAt(str, 2), 2, 'expected two units for the waving hand'); // '👋'
      assert.equal(charLengthAt(str, 4), 1, 'expected one unit for t'); // 't'
    });

    it('should return 1 at the end of ASCII and emoji strings', () => {
      assert.equal(charLengthAt('abc', 3), 1, 'expected one unit at the ASCII string end');
      assert.equal(charLengthAt('👍', 2), 1, 'expected one unit at the emoji string end');
    });

    it('should return 2 for surrogate pairs in joined emoji and flags', () => {
      // Family emoji (multiple surrogate pairs with ZWJ)
      assert.equal(charLengthAt('👨‍👩‍👧‍👦', 0), 2, 'expected two units for the first family member'); // First emoji

      // Flag emoji (regional indicators)
      assert.equal(charLengthAt('🇯🇵', 0), 2, 'expected two units for the first Japanese regional indicator'); // Japanese flag
      assert.equal(charLengthAt('🇺🇸', 0), 2, 'expected two units for the first US regional indicator'); // US flag
      assert.equal(charLengthAt('🇺🇸', 2), 2, 'expected two units for the second US regional indicator'); // Second part of US flag

      // Add more specific tests for ZWJ sequences
      const personTechnologist = '🧑‍💻';
      assert.equal(charLengthAt(personTechnologist, 0), 2, 'expected two units before the joiner'); // First emoji
      assert.equal(charLengthAt(personTechnologist, 3), 2, 'expected two units after the joiner'); // After ZWJ
    });
  });

  describe('charLengthLeft', () => {
    it('should return 0 at start of string', () => {
      assert.equal(charLengthLeft('abc', 0), 0, 'expected zero before ASCII text');
      assert.equal(charLengthLeft('👍', 0), 0, 'expected zero before an emoji');
    });

    it('should return 1 to the left of an ASCII character', () => {
      assert.equal(charLengthLeft('abc', 1), 1, 'expected one unit left of b');
      assert.equal(charLengthLeft('abc', 2), 1, 'expected one unit left of c');
    });

    it('should return 2 when looking left at surrogate pairs', () => {
      assert.equal(charLengthLeft('👍', 2), 2, 'expected two units left of the emoji string end');
      assert.equal(charLengthLeft('a👍', 3), 2, 'expected two units left of the mixed string end');
    });

    it('should return the length of the preceding ASCII character or emoji', () => {
      const str = 'hi👋there';
      assert.equal(charLengthLeft(str, 1), 1, 'expected one unit left of i'); // left of 'i'
      assert.equal(charLengthLeft(str, 2), 1, 'expected one unit left of the waving hand'); // left of '👋'
      assert.equal(charLengthLeft(str, 4), 2, 'expected two units left of t'); // left of 't'
    });

    it('should return 2 after a leading emoji and 1 after trailing ASCII', () => {
      assert.equal(charLengthLeft('👍x', 2), 2, 'expected two units left of x');
      assert.equal(charLengthLeft('👍x', 3), 1, 'expected one unit after x');
    });

    it('should return 1 for ASCII adjacent to a joined emoji', () => {
      const str = 'hi🧑‍💻bye'; // person technologist emoji (ZWJ sequence)
      assert.equal(charLengthLeft(str, 2), 1, 'expected one unit before the joined emoji'); // left of emoji
      assert.equal(charLengthLeft(str, str.length), 1, 'expected one unit for the final e'); // left of 'e'
      assert.equal(charLengthLeft(str, str.length - 1), 1, 'expected one unit for y before e'); // left of 'y'
    });

    it('should return 2 after both the emoji and its skin tone modifier', () => {
      const str = '👍🏽'; // thumbs up with medium skin tone
      assert.equal(charLengthLeft(str, str.length), 2, 'expected two units for the skin tone modifier');
      assert.equal(charLengthLeft(str, 2), 2, 'expected two units for the base emoji');
    });
  });

  describe('charLengthAt fallback lengths and control characters', () => {
    it('should return 1 at and past the start of an empty string', () => {
      assert.equal(charLengthAt('', 0), 1, 'expected one unit at the empty string start');
      assert.equal(charLengthAt('', 1), 1, 'expected one unit past the empty string');
    });

    it('should return 1 for undefined and null indices', () => {
      const str = 'test';
      assert.equal(charLengthAt(str, undefined), 1, 'expected one unit at an undefined position');
      assert.equal(charLengthAt(str, null), 1, 'expected one unit at a null position');
    });

    it('should return 1 for negative and end-or-later indices', () => {
      const str = 'test';
      assert.equal(charLengthAt(str, -1), 1, 'expected one unit at a negative index');
      assert.equal(charLengthAt(str, str.length), 1, 'expected one unit at the string end');
      assert.equal(charLengthAt(str, str.length + 1), 1, 'expected one unit past the string end');
    });

    it('should return 1 for lone high and low surrogates', () => {
      // High surrogate alone
      assert.equal(charLengthAt('\uD83D', 0), 1, 'expected one unit for a lone high surrogate');
      // Low surrogate alone
      assert.equal(charLengthAt('\uDE00', 0), 1, 'expected one unit for a lone low surrogate');
    });

    it('should return 1 at Escape, carriage return, newline, and tab', () => {
      assert.equal(charLengthAt('\x1b', 0), 1, 'expected one unit for Escape'); // ESC
      assert.equal(charLengthAt('\r', 0), 1, 'expected one unit for carriage return'); // CR
      assert.equal(charLengthAt('\n', 0), 1, 'expected one unit for newline'); // LF
      assert.equal(charLengthAt('\t', 0), 1, 'expected one unit for tab'); // TAB
    });

    it('should return 1 at the Escape prefix of ANSI color sequences', () => {
      assert.equal(charLengthAt('\x1B[0m', 0), 1, 'expected one unit at the reset prefix');
      assert.equal(charLengthAt('\x1B[31m', 0), 1, 'expected one unit at the red prefix');
      assert.equal(charLengthAt('\x1B[1;31m', 0), 1, 'expected one unit at the bold red prefix');
    });
  });

  describe('charLengthLeft fallback lengths and ASCII before controls', () => {
    it('should return 0 at index zero and 1 past an empty string', () => {
      // empty string at position 0 matches the i <= 0 condition
      assert.equal(charLengthLeft('', 0), 0, 'expected zero at the empty string start');
      // empty string at any other position should return 1 (default case)
      assert.equal(charLengthLeft('', 1), 1, 'expected one unit past the empty string');
    });

    it('should return 1 for undefined and 0 for null', () => {
      const str = 'test';
      // null coerces to 0 in <= comparison
      assert.equal(charLengthLeft(str, null), 0, 'expected zero at a null position');
      // undefined becomes NaN, fails all comparisons, returns default 1
      assert.equal(charLengthLeft(str, undefined), 1, 'expected one unit at an undefined position');
    });

    it('should return 0 for negative indices and 1 past the end', () => {
      const str = 'test';
      assert.equal(charLengthLeft(str, -1), 0, 'expected zero at a negative index');
      assert.equal(charLengthLeft(str, str.length + 1), 1, 'expected one unit past the string end');
    });

    it('should return 1 for lone high and low surrogates', () => {
      // After high surrogate
      assert.equal(charLengthLeft('\uD83Dx', 1), 1, 'expected one unit left of x after a high surrogate');
      // After low surrogate
      assert.equal(charLengthLeft('\uDE00x', 1), 1, 'expected one unit left of x after a low surrogate');
    });

    it('should return 1 for ASCII before a control character', () => {
      assert.equal(charLengthLeft('x\x1b', 1), 1, 'expected one unit before Escape'); // ESC
      assert.equal(charLengthLeft('x\r', 1), 1, 'expected one unit before carriage return'); // CR
      assert.equal(charLengthLeft('x\n', 1), 1, 'expected one unit before newline'); // LF
      assert.equal(charLengthLeft('x\t', 1), 1, 'expected one unit before tab'); // TAB
    });

    it('should return 1 for ASCII before an ANSI sequence', () => {
      assert.equal(charLengthLeft('x\x1B[0m', 1), 1, 'expected one unit before the reset sequence');
      assert.equal(charLengthLeft('x\x1B[31m', 1), 1, 'expected one unit before the red sequence');
      assert.equal(charLengthLeft('x\x1B[1;31m', 1), 1, 'expected one unit before the bold red sequence');
    });
  });

  describe('charLengthAt with emoji between ASCII or ANSI sequences', () => {
    it('should return 2 for an emoji between ANSI sequences and 1 at each Escape', () => {
      const str = '\x1b[31m👍\x1b[0m';
      assert.equal(charLengthAt(str, 0), 1, 'expected one unit at the opening Escape'); // ANSI start
      assert.equal(charLengthAt(str, 5), 2, 'expected two units for the enclosed emoji'); // emoji
      assert.equal(charLengthAt(str, 7), 1, 'expected one unit at the closing Escape'); // ANSI end
    });

    it('should return 2 at emoji starts and 1 at other indices', () => {
      const str = 'a👍b👍c';
      for (let i = 0; i < str.length; i++) {
        const expected = i % 3 === 1 ? 2 : 1;
        assert.equal(charLengthAt(str, i), expected, 'expected the character length at index ' + i);
      }
    });
  });
});
