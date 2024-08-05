const memo = new Map();
const keys = [
  {
    name: '_',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '_'
  },
  {
    name: '-',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '-'
  },
  {
    name: ',',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: ','
  },
  {
    name: ',',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: ','
  },
  {
    name: ';',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: ';'
  },
  {
    name: ';',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: ';'
  },
  {
    name: ';',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: ';'
  },
  {
    name: ':',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: ':'
  },
  {
    name: '!',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '!'
  },
  {
    name: '?',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '?'
  },
  {
    name: '"',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '"'
  },
  {
    name: '(',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '('
  },
  {
    name: ')',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: ')'
  },
  {
    name: '[',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '['
  },
  {
    name: ']',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: ']'
  },
  {
    name: '{',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '{'
  },
  {
    name: '}',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '}'
  },
  {
    name: '@',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '@'
  },
  {
    name: '*',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '*'
  },
  {
    name: '/',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '/'
  },
  {
    name: '\\',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '\\'
  },
  {
    name: '&',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '&'
  },
  {
    name: '#',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '#'
  },
  {
    name: '%',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '%'
  },
  {
    name: '`',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '`'
  },
  {
    name: '`',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0000'
  },
  {
    name: '^',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '^'
  },
  {
    name: '+',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '+'
  },
  {
    name: '<',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '<'
  },
  {
    name: '=',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '='
  },
  {
    name: '=',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '='
  },
  {
    name: '=',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '='
  },
  {
    name: '>',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '>'
  },
  {
    name: '|',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '|'
  },
  {
    name: '~',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '~'
  },
  {
    name: '$',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '$'
  },
  {
    name: 'a',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0001'
  },
  {
    name: 'a',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'A'
  },
  {
    name: 'a',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'a'
  },
  {
    name: 'b',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0002'
  },
  {
    name: 'b',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'B'
  },
  {
    name: 'b',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'b'
  },
  {
    name: 'backspace',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: ''
  },
  {
    name: 'backspace',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: ''
  },
  {
    name: 'backspace',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: ''
  },
  {
    name: 'backspace',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '\b'
  },
  {
    name: 'c',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'c'
  },
  {
    name: 'c',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0003'
  },
  {
    name: 'c',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0003'
  },
  {
    name: 'c',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'C'
  },
  {
    name: 'd',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'd'
  },
  {
    name: 'd',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0004'
  },
  {
    name: 'd',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'D'
  },
  {
    name: 'down',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u000e'
  },
  {
    name: 'e',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'E'
  },
  {
    name: 'e',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0005'
  },
  {
    name: 'e',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'e'
  },
  {
    name: 'enter',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '\n'
  },
  {
    name: 'escape',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '\u001b'
  },
  {
    name: 'escape',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '\u001b'
  },
  {
    name: 'f',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'F'
  },
  {
    name: 'f',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0006'
  },
  {
    name: 'f',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'f'
  },
  {
    name: 'g',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'G'
  },
  {
    name: 'g',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0007'
  },
  {
    name: 'g',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'g'
  },
  {
    name: 'h',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'H'
  },
  {
    name: 'h',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'h'
  },
  {
    name: 'i',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'I'
  },
  {
    name: 'i',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'i'
  },
  {
    name: 'j',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'J'
  },
  {
    name: 'j',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'j'
  },
  {
    name: 'k',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'K'
  },
  {
    name: 'k',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'k'
  },
  {
    name: 'k',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u000b'
  },
  {
    name: 'l',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'L'
  },
  {
    name: 'l',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'l'
  },
  {
    name: 'l',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\f'
  },
  {
    name: 'm',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'M'
  },
  {
    name: 'm',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'm'
  },
  {
    name: 'n',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'n'
  },
  {
    name: 'n',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'N'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '9'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '0'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '1'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '1'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '0'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '3'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '4'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '5'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '6'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '7'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '8'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '9'
  },
  {
    name: 'number',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '2'
  },
  {
    name: 'o',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'O'
  },
  {
    name: 'o',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'o'
  },
  {
    name: 'o',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u000f'
  },
  {
    name: 'p',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'P'
  },
  {
    name: 'p',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'p'
  },
  {
    name: 'q',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'Q'
  },
  {
    name: 'q',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'q'
  },
  {
    name: 'q',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0011'
  },
  {
    name: 'r',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'r'
  },
  {
    name: 'r',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0012'
  },
  {
    name: 'r',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'R'
  },
  {
    name: 'return',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '\r'
  },
  {
    name: 'return',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '\r'
  },
  {
    name: 's',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 's'
  },
  {
    name: 's',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0013'
  },
  {
    name: 's',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'S'
  },
  {
    name: 't',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 't'
  },
  {
    name: 't',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0014'
  },
  {
    name: 't',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'T'
  },
  {
    name: 'tab',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '\t'
  },
  {
    name: 'tab',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '\u001b[Z',
    code: '[Z'
  },
  {
    name: 'tab',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: '\t'
  },
  {
    name: 'u',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0015'
  },
  {
    name: 'u',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'U'
  },
  {
    name: 'u',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'u'
  },
  {
    name: 'up',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0010'
  },
  {
    name: 'v',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0016'
  },
  {
    name: 'v',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'v'
  },
  {
    name: 'v',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'V'
  },
  {
    name: 'w',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0017'
  },
  {
    name: 'w',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'W'
  },
  {
    name: 'w',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'w'
  },
  {
    name: 'x',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'x'
  },
  {
    name: 'x',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'X'
  },
  {
    name: 'x',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0018'
  },
  {
    name: 'y',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'y'
  },
  {
    name: 'y',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u0019'
  },
  {
    name: 'y',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'Y'
  },
  {
    name: 'z',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: 'z'
  },
  {
    name: 'z',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: 'Z'
  },
  {
    name: 'z',
    ctrl: true,
    meta: false,
    shift: false,
    sequence: '\u001a'
  },
  {
    name: 'up',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '\u001b[1;2A',
    code: '[A'
  },
  {
    name: 'down',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '\u001b[1;2B',
    code: '[B'
  },
  {
    name: 'left',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '\u001b[1;2D',
    code: '[D'
  },
  {
    name: 'right',
    ctrl: false,
    meta: false,
    shift: true,
    sequence: '\u001b[1;2C',
    code: '[C'
  }
];
