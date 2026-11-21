import { strict as assert } from 'node:assert';
import { PRINTABLE_CHAR_REGEX, NON_PRINTABLE_CHAR_REGEX } from '~/utils';

describe('character classification', () => {
  describe('PRINTABLE_CHAR_REGEX Latin characters', () => {
    it('should match uppercase and lowercase ASCII letters', () => {
      assert.match('abcdefghijklmnopqrstuvwxyz', PRINTABLE_CHAR_REGEX, 'expected lowercase Latin letters to match');
      assert.match('ABCDEFGHIJKLMNOPQRSTUVWXYZ', PRINTABLE_CHAR_REGEX, 'expected uppercase Latin letters to match');
    });

    it('should match letters with diacritical marks', () => {
      assert.match('áéíóúñüößàèìòùâêîôû', PRINTABLE_CHAR_REGEX, 'expected accented Latin letters to match');
      assert.match('ąćęłńóśźżĄĆĘŁŃÓŚŹŻ', PRINTABLE_CHAR_REGEX, 'expected Polish letters to match');
    });

    it('should match precomposed and decomposed é', () => {
      assert.match('é', PRINTABLE_CHAR_REGEX, 'expected precomposed é to match'); // Single code point
      assert.match('e\u0301', PRINTABLE_CHAR_REGEX, 'expected e with combining acute to match'); // Combining acute accent
    });
  });

  describe('PRINTABLE_CHAR_REGEX non-Latin scripts', () => {
    it('should match Hiragana, Hangul, and Han characters', () => {
      assert.match('こんにちは', PRINTABLE_CHAR_REGEX, 'expected Hiragana to match'); // Japanese Hiragana
      assert.match('안녕하세요', PRINTABLE_CHAR_REGEX, 'expected Hangul to match'); // Korean
      assert.match('你好世界', PRINTABLE_CHAR_REGEX, 'expected Han characters to match'); // Chinese
    });

    it('should match Cyrillic characters', () => {
      assert.match('Привет', PRINTABLE_CHAR_REGEX, 'expected Cyrillic to match');
    });

    it('should match Hebrew with niqqud', () => {
      assert.match('שָׁלוֹם', PRINTABLE_CHAR_REGEX, 'expected Hebrew with vowel marks to match');
    });
  });

  describe('PRINTABLE_CHAR_REGEX numbers', () => {
    it('should match ASCII, Arabic-Indic, and Devanagari digits', () => {
      assert.match('0123456789', PRINTABLE_CHAR_REGEX, 'expected ASCII digits to match'); // Arabic numerals
      assert.match('٠١٢٣٤٥٦٧٨٩', PRINTABLE_CHAR_REGEX, 'expected Arabic-Indic digits to match'); // Arabic-Indic
      assert.match('०१२३४५६७८९', PRINTABLE_CHAR_REGEX, 'expected Devanagari digits to match'); // Devanagari
    });
  });

  describe('PRINTABLE_CHAR_REGEX punctuation and symbols', () => {
    it('should match common punctuation', () => {
      assert.match('/', PRINTABLE_CHAR_REGEX, 'expected slash to match');
      assert.match('.,!?()[]{}<>:;\'"`~@#$%^&*-+=_\\|/', PRINTABLE_CHAR_REGEX, 'expected the punctuation string to match');
    });

    it('should match currency, typographic, and card suit symbols', () => {
      assert.match('©®™₿€£¥¢₹§¶†‡♠♣♥♦', PRINTABLE_CHAR_REGEX, 'expected currency and typographic symbols to match');
    });
  });

  describe('PRINTABLE_CHAR_REGEX whitespace', () => {
    it('should match whitespace and reject the byte-order mark', () => {
      assert.match('\n', PRINTABLE_CHAR_REGEX, 'expected newline to match'); // Newline
      assert.match('\r', PRINTABLE_CHAR_REGEX, 'expected carriage return to match'); // Carriage return
      assert.match('\t', PRINTABLE_CHAR_REGEX, 'expected tab to match'); // Tab
      assert.match(' ', PRINTABLE_CHAR_REGEX, 'expected ASCII space to match'); // Regular space
      assert.match('\u00A0', PRINTABLE_CHAR_REGEX, 'expected no-break space to match'); // Non-breaking space
      assert.match('\u2003', PRINTABLE_CHAR_REGEX, 'expected em space to match'); // Em space
      assert.match('\u2009', PRINTABLE_CHAR_REGEX, 'expected thin space to match'); // Thin space
      assert.match('\u202F', PRINTABLE_CHAR_REGEX, 'expected narrow no-break space to match'); // Narrow no-break space
      assert.match('\u3000', PRINTABLE_CHAR_REGEX, 'expected ideographic space to match'); // Ideographic space
      assert.doesNotMatch('\uFEFF', PRINTABLE_CHAR_REGEX, 'expected the byte-order mark to fail'); // Zero width no-break space
    });
  });

  describe('PRINTABLE_CHAR_REGEX with empty input and controls', () => {
    it('should reject control characters', () => {
      assert.doesNotMatch('\u0000', PRINTABLE_CHAR_REGEX, 'expected NUL to fail'); // Null
      assert.doesNotMatch('\u0007', PRINTABLE_CHAR_REGEX, 'expected bell to fail'); // Bell
      assert.doesNotMatch('\u001B', PRINTABLE_CHAR_REGEX, 'expected Escape to fail'); // Escape
      assert.doesNotMatch('\u009F', PRINTABLE_CHAR_REGEX, 'expected APC to fail'); // APC
    });

    it('should reject an empty string', () => {
      assert.doesNotMatch('', PRINTABLE_CHAR_REGEX, 'expected empty input to fail');
    });

    it('should reject strings containing control characters', () => {
      assert.doesNotMatch('Hello\u0000World', PRINTABLE_CHAR_REGEX, 'expected embedded NUL to prevent a match');
      assert.doesNotMatch('\u0007Test', PRINTABLE_CHAR_REGEX, 'expected leading bell to prevent a match');
    });
  });

  describe('NON_PRINTABLE_CHAR_REGEX control characters', () => {
    it('should match ASCII control characters', () => {
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u0000'), 'expected null to be detected');
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u0001'), 'expected start of heading to be detected');
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u0007'), 'expected bell to be detected');
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u001B'), 'expected escape to be detected');
    });

    it('should match format control characters', () => {
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u200B'), 'expected zero width space to be detected');
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u200E'), 'expected left-to-right mark to be detected');
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u2028'), 'expected line separator to be detected');
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\u2029'), 'expected paragraph separator to be detected');
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('\n'), 'expected newline to be detected');

      assert.ok(!NON_PRINTABLE_CHAR_REGEX.test('/'), 'expected slash to be printable');
    });
  });

  describe('NON_PRINTABLE_CHAR_REGEX with printable or empty input', () => {
    it('should reject printable characters', () => {
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test('a'), false, 'expected a letter to be printable');
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test('1'), false, 'expected a digit to be printable');
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test('!'), false, 'expected an exclamation mark to be printable');
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test(' '), false, 'expected ASCII space to be printable');
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test('£'), false, 'expected a pound sign to be printable');
    });

    it('should reject an empty string', () => {
      assert.equal(NON_PRINTABLE_CHAR_REGEX.test(''), false, 'expected empty input to contain no controls');
    });
  });

  describe('NON_PRINTABLE_CHAR_REGEX mixed content', () => {
    it('should detect control characters in mixed content', () => {
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('Hello\u0000World'), 'expected embedded NUL to be detected');
      assert.ok(NON_PRINTABLE_CHAR_REGEX.test('Test\u200BTest'), 'expected embedded zero-width space to be detected');
    });
  });

  describe('PRINTABLE_CHAR_REGEX with mixed scripts, long text, and emoji', () => {
    it('should match strings containing multiple scripts', () => {
      assert.match('Hello こんにちは Привет', PRINTABLE_CHAR_REGEX, 'expected Latin, Hiragana, and Cyrillic to match together');
      assert.match('123! שלום', PRINTABLE_CHAR_REGEX, 'expected digits, punctuation, and Hebrew to match together');
    });

    it('should match a long string of printable characters', () => {
      const longString = 'a'.repeat(10 ** 6) + 'z';
      assert.match(longString, PRINTABLE_CHAR_REGEX, 'expected the long printable string to match');
    });

    it('should match adjacent emoji', () => {
      assert.match('😀🎉💯👌', PRINTABLE_CHAR_REGEX, 'expected adjacent emoji to match');
    });

    it('should match a joined family emoji', () => {
      assert.match('👩‍👩‍👧‍👦', PRINTABLE_CHAR_REGEX, 'expected the joined family emoji to match');
    });
  });

  describe('PRINTABLE_CHAR_REGEX single symbols and surrounding whitespace', () => {
    it('should match individual copyright and euro signs', () => {
      assert.match('\u00A9', PRINTABLE_CHAR_REGEX, 'expected the copyright sign to match'); // Copyright Symbol
      assert.match('\u20AC', PRINTABLE_CHAR_REGEX, 'expected the euro sign to match'); // Euro Sign
    });

    it('should match text with leading and trailing spaces', () => {
      assert.match('   Hello World   ', PRINTABLE_CHAR_REGEX, 'expected leading and trailing spaces to match');
    });
  });
});
