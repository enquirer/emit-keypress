import { strict as assert } from 'node:assert';
import { charLengthLeft, charLengthAt } from '~/keypress';

describe('keypress Unicode handling', () => {
  describe('charLengthAt', () => {
    it('should return 1 for basic ASCII characters', () => {
      assert.equal(charLengthAt('abc', 0), 1);
      assert.equal(charLengthAt('abc', 1), 1);
      assert.equal(charLengthAt('123', 0), 1);
    });

    it('should return 2 for surrogate pairs (emojis)', () => {
      assert.equal(charLengthAt('👍', 0), 2); // thumbs up emoji
      assert.equal(charLengthAt('a👍b', 1), 2);
      assert.equal(charLengthAt('🌸🍜', 0), 2); // multiple emojis
      assert.equal(charLengthAt('🌸🍜', 2), 2);
    });

    it('should handle mixed ASCII and surrogate pairs', () => {
      const str = 'hi👋there';
      assert.equal(charLengthAt(str, 0), 1); // 'h'
      assert.equal(charLengthAt(str, 1), 1); // 'i'
      assert.equal(charLengthAt(str, 2), 2); // '👋'
      assert.equal(charLengthAt(str, 4), 1); // 't'
    });

    it('should return 1 when at string boundary', () => {
      assert.equal(charLengthAt('abc', 3), 1);
      assert.equal(charLengthAt('👍', 2), 1);
    });

    it('should handle complex emoji sequences', () => {
      // Family emoji (multiple surrogate pairs with ZWJ)
      assert.equal(charLengthAt('👨‍👩‍👧‍👦', 0), 2); // First emoji

      // Flag emoji (regional indicators)
      assert.equal(charLengthAt('🇯🇵', 0), 2); // Japanese flag
      assert.equal(charLengthAt('🇺🇸', 0), 2); // US flag
      assert.equal(charLengthAt('🇺🇸', 2), 2); // Second part of US flag

      // Add more specific tests for ZWJ sequences
      const personTechnologist = '🧑‍💻';
      assert.equal(charLengthAt(personTechnologist, 0), 2); // First emoji
      assert.equal(charLengthAt(personTechnologist, 3), 2); // After ZWJ
    });
  });

  describe('charLengthLeft', () => {
    it('should return 0 at start of string', () => {
      assert.equal(charLengthLeft('abc', 0), 0);
      assert.equal(charLengthLeft('👍', 0), 0);
    });

    it('should return 1 for basic ASCII characters', () => {
      assert.equal(charLengthLeft('abc', 1), 1);
      assert.equal(charLengthLeft('abc', 2), 1);
    });

    it('should return 2 when looking left at surrogate pairs', () => {
      assert.equal(charLengthLeft('👍', 2), 2);
      assert.equal(charLengthLeft('a👍', 3), 2);
    });

    it('should handle mixed ASCII and surrogate pairs', () => {
      const str = 'hi👋there';
      assert.equal(charLengthLeft(str, 1), 1); // left of 'i'
      assert.equal(charLengthLeft(str, 2), 1); // left of '👋'
      assert.equal(charLengthLeft(str, 4), 2); // left of 't'
    });

    it('should handle surrogate pairs at string boundaries', () => {
      assert.equal(charLengthLeft('👍x', 2), 2);
      assert.equal(charLengthLeft('👍x', 3), 1);
    });

    it('should handle complex emoji sequences', () => {
      const str = 'hi🧑‍💻bye'; // person technologist emoji (ZWJ sequence)
      assert.equal(charLengthLeft(str, 2), 1); // left of emoji
      assert.equal(charLengthLeft(str, str.length), 1); // left of 'e'
      assert.equal(charLengthLeft(str, str.length - 1), 1); // left of 'y'
    });

    it('should handle skin tone modifiers', () => {
      const str = '👍🏽'; // thumbs up with medium skin tone
      assert.equal(charLengthLeft(str, str.length), 2);
      assert.equal(charLengthLeft(str, 2), 2);
    });
  });

  describe('charLengthAt edge cases', () => {
    it('should handle empty strings', () => {
      assert.equal(charLengthAt('', 0), 1);
      assert.equal(charLengthAt('', 1), 1);
    });

    it('should handle undefined and null positions', () => {
      const str = 'test';
      assert.equal(charLengthAt(str, undefined), 1);
      assert.equal(charLengthAt(str, null), 1);
    });

    it('should handle out of bounds indices', () => {
      const str = 'test';
      assert.equal(charLengthAt(str, -1), 1);
      assert.equal(charLengthAt(str, str.length), 1);
      assert.equal(charLengthAt(str, str.length + 1), 1);
    });

    it('should handle lone surrogates', () => {
      // High surrogate alone
      assert.equal(charLengthAt('\uD83D', 0), 1);
      // Low surrogate alone
      assert.equal(charLengthAt('\uDE00', 0), 1);
    });

    it('should handle control characters', () => {
      assert.equal(charLengthAt('\x1b', 0), 1); // ESC
      assert.equal(charLengthAt('\r', 0), 1); // CR
      assert.equal(charLengthAt('\n', 0), 1); // LF
      assert.equal(charLengthAt('\t', 0), 1); // TAB
    });

    it('should handle ANSI escape sequences', () => {
      assert.equal(charLengthAt('\x1B[0m', 0), 1);
      assert.equal(charLengthAt('\x1B[31m', 0), 1);
      assert.equal(charLengthAt('\x1B[1;31m', 0), 1);
    });
  });

  describe('charLengthLeft edge cases', () => {
    it('should handle empty strings', () => {
      // empty string at position 0 matches the i <= 0 condition
      assert.equal(charLengthLeft('', 0), 0);
      // empty string at any other position should return 1 (default case)
      assert.equal(charLengthLeft('', 1), 1);
    });

    it('should handle undefined and null positions', () => {
      const str = 'test';
      // null coerces to 0 in <= comparison
      assert.equal(charLengthLeft(str, null), 0);
      // undefined becomes NaN, fails all comparisons, returns default 1
      assert.equal(charLengthLeft(str, undefined), 1);
    });

    it('should handle out of bounds indices', () => {
      const str = 'test';
      assert.equal(charLengthLeft(str, -1), 0);
      assert.equal(charLengthLeft(str, str.length + 1), 1);
    });

    it('should handle lone surrogates', () => {
      // After high surrogate
      assert.equal(charLengthLeft('\uD83Dx', 1), 1);
      // After low surrogate
      assert.equal(charLengthLeft('\uDE00x', 1), 1);
    });

    it('should handle control characters', () => {
      assert.equal(charLengthLeft('x\x1b', 1), 1); // ESC
      assert.equal(charLengthLeft('x\r', 1), 1); // CR
      assert.equal(charLengthLeft('x\n', 1), 1); // LF
      assert.equal(charLengthLeft('x\t', 1), 1); // TAB
    });

    it('should handle ANSI escape sequences', () => {
      assert.equal(charLengthLeft('x\x1B[0m', 1), 1);
      assert.equal(charLengthLeft('x\x1B[31m', 1), 1);
      assert.equal(charLengthLeft('x\x1B[1;31m', 1), 1);
    });
  });

  describe('mixed content scenarios', () => {
    it('should handle mixed surrogate pairs and control characters', () => {
      const str = '\x1b[31m👍\x1b[0m';
      assert.equal(charLengthAt(str, 0), 1); // ANSI start
      assert.equal(charLengthAt(str, 5), 2); // emoji
      assert.equal(charLengthAt(str, 7), 1); // ANSI end
    });

    it('should handle interleaved normal and surrogate pair characters', () => {
      const str = 'a👍b👍c';
      for (let i = 0; i < str.length; i++) {
        const expected = i % 3 === 1 ? 2 : 1;
        assert.equal(charLengthAt(str, i), expected);
      }
    });
  });
});
