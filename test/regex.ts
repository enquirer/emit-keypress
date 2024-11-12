import { strict as assert } from 'node:assert';
import { PRINTABLE_CHAR_REGEX, NON_PRINTABLE_CHAR_REGEX } from '~/utils';

describe.only('PRINTABLE_CHAR_REGEX', () => {
  describe('Latin characters', () => {
    it('should match basic Latin letters', () => {
      assert.match('abcdefghijklmnopqrstuvwxyz', PRINTABLE_CHAR_REGEX);
      assert.match('ABCDEFGHIJKLMNOPQRSTUVWXYZ', PRINTABLE_CHAR_REGEX);
    });

    it('should match letters with diacritical marks', () => {
      assert.match('áéíóúñüößàèìòùâêîôû', PRINTABLE_CHAR_REGEX);
      assert.match('ąćęłńóśźżĄĆĘŁŃÓŚŹŻ', PRINTABLE_CHAR_REGEX);
    });

    it('should match combined characters', () => {
      assert.match('é', PRINTABLE_CHAR_REGEX); // Single code point
      assert.match('e\u0301', PRINTABLE_CHAR_REGEX); // Combining acute accent
    });
  });

  describe('Non-Latin scripts', () => {
    it('should match CJK characters', () => {
      assert.match('こんにちは', PRINTABLE_CHAR_REGEX); // Japanese Hiragana
      assert.match('안녕하세요', PRINTABLE_CHAR_REGEX); // Korean
      assert.match('你好世界', PRINTABLE_CHAR_REGEX); // Chinese
    });

    it('should match Cyrillic characters', () => {
      assert.match('Привет', PRINTABLE_CHAR_REGEX);
    });

    it('should match Hebrew with niqqud', () => {
      assert.match('שָׁלוֹם', PRINTABLE_CHAR_REGEX);
    });
  });

  describe('Numbers', () => {
    it('should match various number systems', () => {
      assert.match('0123456789', PRINTABLE_CHAR_REGEX); // Arabic numerals
      assert.match('٠١٢٣٤٥٦٧٨٩', PRINTABLE_CHAR_REGEX); // Arabic-Indic
      assert.match('०१२३४५६७८९', PRINTABLE_CHAR_REGEX); // Devanagari
    });
  });

  describe('Punctuation and Symbols', () => {
    it('should match common punctuation', () => {
      assert.match('/', PRINTABLE_CHAR_REGEX);
      assert.match('.,!?()[]{}<>:;\'"`~@#$%^&*-+=_\\|/', PRINTABLE_CHAR_REGEX);
    });

    it('should match various symbols', () => {
      assert.match('©®™₿€£¥¢₹§¶†‡♠♣♥♦', PRINTABLE_CHAR_REGEX);
    });
  });

  describe('Whitespace', () => {
    it('should match various types of spaces', () => {
      assert.match('\n', PRINTABLE_CHAR_REGEX); // Newline
      assert.match('\r', PRINTABLE_CHAR_REGEX); // Carriage return
      assert.match('\t', PRINTABLE_CHAR_REGEX); // Tab
      assert.match(' ', PRINTABLE_CHAR_REGEX); // Regular space
      assert.match('\u00A0', PRINTABLE_CHAR_REGEX); // Non-breaking space
      assert.match('\u2003', PRINTABLE_CHAR_REGEX); // Em space
      assert.match('\u2009', PRINTABLE_CHAR_REGEX); // Thin space
      assert.match('\u202F', PRINTABLE_CHAR_REGEX); // Narrow no-break space
      assert.match('\u3000', PRINTABLE_CHAR_REGEX); // Ideographic space
      assert.doesNotMatch('\uFEFF', PRINTABLE_CHAR_REGEX); // Zero width no-break space
    });
  });

  describe('Invalid input', () => {
    it('should reject control characters', () => {
      assert.doesNotMatch('\u0000', PRINTABLE_CHAR_REGEX); // Null
      assert.doesNotMatch('\u0007', PRINTABLE_CHAR_REGEX); // Bell
      assert.doesNotMatch('\u001B', PRINTABLE_CHAR_REGEX); // Escape
      assert.doesNotMatch('\u009F', PRINTABLE_CHAR_REGEX); // APC
    });

    it('should reject empty string', () => {
      assert.doesNotMatch('', PRINTABLE_CHAR_REGEX);
    });

    it('should reject strings containing control characters', () => {
      assert.doesNotMatch('Hello\u0000World', PRINTABLE_CHAR_REGEX);
      assert.doesNotMatch('\u0007Test', PRINTABLE_CHAR_REGEX);
    });
  });
});

describe('NON_PRINTABLE_CHAR_REGEX', () => {
  describe('Control characters', () => {
    it('should match ASCII control characters', () => {
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u0000')); // Null
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u0001')); // Start of Heading
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u0007')); // Bell
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u001B')); // Escape
    });

    it('should match format control characters', () => {
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u200B')); // Zero Width Space
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u200E')); // Left-to-Right Mark
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u2028')); // Line Separator
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u2029')); // Paragraph Separator

      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('/')); // Slash
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\n')); // Newline
    });
  });

  describe('Invalid input', () => {
    it('should reject printable characters', () => {
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test('a'), false);
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test('1'), false);
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test('!'), false);
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test(' '), false);
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test('£'), false);
    });

    it('should reject empty string', () => {
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test(''), false);
    });
  });

  describe('Mixed content', () => {
    it('should detect control characters in mixed content', () => {
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('Hello\u0000World'));
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('Test\u200BTest'));
    });
  });

  describe('Additional Tests for PRINTABLE_CHAR_REGEX', () => {
    it('should handle mixed scripts properly', () => {
      assert.match('Hello こんにちは Привет', PRINTABLE_CHAR_REGEX);
      assert.match('123! שלום', PRINTABLE_CHAR_REGEX);
    });

    it('should handle extremely long input strings', () => {
      const longString = 'a'.repeat(10 ** 6) + 'z';
      assert.match(longString, PRINTABLE_CHAR_REGEX);
    });

    it('should allow specific symbols like emojis', () => {
      assert.match('😀🎉💯👌', PRINTABLE_CHAR_REGEX);
    });

    describe('Boundary Checks', () => {
      it('should match a single complex character', () => {
        assert.match('\u00A9', PRINTABLE_CHAR_REGEX); // Copyright Symbol
        assert.match('\u20AC', PRINTABLE_CHAR_REGEX); // Euro Sign
      });

      it('should properly handle edge whitespace', () => {
        assert.match('   Hello World   ', PRINTABLE_CHAR_REGEX);
      });
    });
  });
});
