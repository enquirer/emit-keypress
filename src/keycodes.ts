import { keymap } from '../examples/keycodes';

export const keycodes = [
  { sequence: '\r', shortcut: 'return' },
  { sequence: '\x7F', shortcut: 'backspace' },
  { sequence: '\x1B', shortcut: 'escape' },
  { sequence: '\x1B[1~', shortcut: 'home' },
  { sequence: '\x1B[2~', shortcut: 'insert' },
  { sequence: '\x1B[3~', shortcut: 'delete' },
  { sequence: '\x1B[4~', shortcut: 'end' },
  { sequence: '\x1B[A', shortcut: 'up' },
  { sequence: '\x1B[B', shortcut: 'down' },
  { sequence: '\x1B[C', shortcut: 'right' },
  { sequence: '\x1B[D', shortcut: 'left' },

  // <shift>
  { sequence: '\x1B[2;2~', shortcut: 'shift+insert' },
  { sequence: '\x1B[5;2~', shortcut: 'shift+pageup' },
  { sequence: '\x1B[6;2~', shortcut: 'shift+pagedown' },
  { sequence: '\x1B[1;2A', shortcut: 'shift+up' },
  { sequence: '\x1B[1;2B', shortcut: 'shift+down' },
  { sequence: '\x1B[1;2C', shortcut: 'shift+right' },
  { sequence: '\x1B[1;2D', shortcut: 'shift+left' },
  { sequence: '\x1B[Z', shortcut: 'shift+tab' },

  // <meta>
  { sequence: '\x1Bf', shortcut: 'meta+right' },
  { sequence: '\x1Bb', shortcut: 'meta+left' },
  { sequence: '\x1B[1;9A', shortcut: 'meta+up' },
  { sequence: '\x1B[1;9B', shortcut: 'meta+down' },
  { sequence: '\x1B[1;9C', shortcut: 'cmd+meta+right' },
  { sequence: '\x1B[1;9D', shortcut: 'cmd+meta+left' },
  { sequence: '\x1B[2;3~', shortcut: 'meta+insert' },
  { sequence: '\x1B[3;3~', shortcut: 'meta+delete' },
  { sequence: '\x1B[5;3~', shortcut: 'meta+pageup' },
  { sequence: '\x1B[6;3~', shortcut: 'meta+pagedown' },
  { sequence: '\x1B\x7F', shortcut: 'meta+backspace' },

  // <shift+meta>
  { sequence: '\x1B[1;10A', shortcut: 'shift+meta+up' },
  { sequence: '\x1B[1;10B', shortcut: 'shift+meta+down' },
  { sequence: '\x1B[1;10C', shortcut: 'shift+meta+right' },
  { sequence: '\x1B[1;10D', shortcut: 'shift+meta+left' },
  { sequence: '\x1B[2;4~', shortcut: 'shift+meta+insert' },
  { sequence: '\x1B[3;4~', shortcut: 'shift+meta+delete' },
  { sequence: '\x1B[5;4~', shortcut: 'shift+meta+pageup' },
  { sequence: '\x1B[6;4~', shortcut: 'shift+meta+pagedown' },

  // <ctrl>
  { sequence: '\x00', shortcut: 'ctrl+`' },
  { sequence: '\x0c', shortcut: 'ctrl+4' },
  { sequence: '\x0d', shortcut: 'ctrl+5' },
  { sequence: '\x0e', shortcut: 'ctrl+6' },
  { sequence: '\x0f', shortcut: 'ctrl+7' },
  { sequence: '\x01', shortcut: 'ctrl+a' },
  { sequence: '\x02', shortcut: 'ctrl+b' },
  { sequence: '\x03', shortcut: 'ctrl+c' },
  { sequence: '\x04', shortcut: 'ctrl+d' },
  { sequence: '\x05', shortcut: 'ctrl+e' },
  { sequence: '\x06', shortcut: 'ctrl+f' },
  { sequence: '\x07', shortcut: 'ctrl+g' },
  { sequence: '\b', shortcut: 'ctrl+h' },
  { sequence: '\t', shortcut: 'ctrl+i' },
  { sequence: '\n', shortcut: 'ctrl+j' },
  { sequence: '\x0b', shortcut: 'ctrl+k' },
  { sequence: '\f', shortcut: 'ctrl+l' },
  { sequence: '\x0e', shortcut: 'ctrl+n' },
  { sequence: '\x0f', shortcut: 'ctrl+o' },
  { sequence: '\x00', shortcut: 'ctrl+p' },
  { sequence: '\x01', shortcut: 'ctrl+q' },
  { sequence: '\x02', shortcut: 'ctrl+r' },
  { sequence: '\x03', shortcut: 'ctrl+s' },
  { sequence: '\x04', shortcut: 'ctrl+t' },
  { sequence: '\x05', shortcut: 'ctrl+u' },
  { sequence: '\x06', shortcut: 'ctrl+v' },
  { sequence: '\x07', shortcut: 'ctrl+w' },
  { sequence: '\x08', shortcut: 'ctrl+x' },
  { sequence: '\x09', shortcut: 'ctrl+y' },
  { sequence: '\x0a', shortcut: 'ctrl+z' },
  { sequence: '\x1F', shortcut: 'ctrl+-' },
  { sequence: '\x1C', shortcut: 'ctrl+|' },
  { sequence: '\x1D', shortcut: 'ctrl+]' },
  { sequence: '\x1B[1;5A', shortcut: 'ctrl+up', weight: -1 },
  { sequence: '\x1B[1;5B', shortcut: 'ctrl+down', weight: -1 },
  { sequence: '\x1B[1;5C', shortcut: 'ctrl+right', weight: -1 },
  { sequence: '\x1B[1;5D', shortcut: 'ctrl+left', weight: -1 },
  { sequence: '\x1B[2;5~', shortcut: 'ctrl+insert', weight: -1 },
  { sequence: '\x1B[5;5~', shortcut: 'ctrl+pageup', weight: -1 },
  { sequence: '\x1B[6;5~', shortcut: 'ctrl+pagedown', weight: -1 },

  // <ctrl+shift>
  { sequence: '\x1B[1;6B', shortcut: 'ctrl+shift+down' },
  { sequence: '\x1B[1;6D', shortcut: 'ctrl+shift+left' },
  { sequence: '\x1B[1;6C', shortcut: 'ctrl+shift+right' },
  { sequence: '\x1B[1;6A', shortcut: 'ctrl+shift+up' },

  // <ctrl+shift+meta>
  { sequence: '\x1B[1;14B', shortcut: 'ctrl+shift+meta+down' },
  { sequence: '\x1B[1;14D', shortcut: 'ctrl+shift+meta+left' },
  { sequence: '\x1B[1;14C', shortcut: 'ctrl+shift+meta+right' },

  // <fn>
  { sequence: '\x1B[6~', shortcut: 'fn+down', name: 'end' },
  { sequence: '\x1B[H', shortcut: 'fn+left', name: 'home' },
  { sequence: '\x1B[F', shortcut: 'fn+right', name: 'pagedown' },
  { sequence: '\x1B[5~', shortcut: 'fn+up', name: 'pageup' },

  // <fn+ctrl>
  { sequence: '\x1B[1;5F', shortcut: 'fn+ctrl+right' },
  { sequence: '\x1B[1;5H', shortcut: 'fn+ctrl+left' },
  { sequence: '\x1B[3;5~', shortcut: 'fn+ctrl+delete' },

  // <fn+shift>
  { sequence: '\x1B[1;2F', shortcut: 'fn+shift+right', name: 'shift+home' },
  { sequence: '\x1B[1;2H', shortcut: 'fn+shift+left', name: 'shift+end' },
  { sequence: '\x1B[3;2~', shortcut: 'fn+shift+delete' },

  // <fn+meta>
  { sequence: '\x1B[1;9F', shortcut: 'fn+meta+right' },
  { sequence: '\x1B[1;9H', shortcut: 'fn+meta+left' },
  { sequence: '\x1B[5;9~', shortcut: 'fn+meta+up' },
  { sequence: '\x1B[6;9~', shortcut: 'fn+meta+down' },
  { sequence: '\x1B\x1B[5~', shortcut: 'fn+meta+up' },
  { sequence: '\x1B\x1B[6~', shortcut: 'fn+meta+down' },
  { sequence: '\x1Bd', shortcut: 'fn+meta+delete', fn: true },

  // <fn+ctrl+shift>
  { sequence: '\x1B[1;6F', shortcut: 'fn+ctrl+shift+right' },
  { sequence: '\x1B[1;6H', shortcut: 'fn+ctrl+shift+left' },
  { sequence: '\x1B[3;6~', shortcut: 'fn+ctrl+shift+delete' },
  { sequence: '\x1B[5;6~', shortcut: 'fn+ctrl+shift+up' },
  { sequence: '\x1B[6;6~', shortcut: 'fn+ctrl+shift+down' },

  // <fn+ctrl+meta>
  { sequence: '\x1B[1;13F', shortcut: 'fn+ctrl+meta+right' },
  { sequence: '\x1B[1;13H', shortcut: 'fn+ctrl+meta+left' },
  { sequence: '\x1B[3;13~', shortcut: 'fn+ctrl+meta+delete' },

  // <fn+shift+meta>
  { sequence: '\x1B[1;10F', shortcut: 'fn+shift+meta+right' },
  { sequence: '\x1B[1;10H', shortcut: 'fn+shift+meta+left' },
  { sequence: '\x1B[3;10~', shortcut: 'fn+shift+meta+delete' },
  { sequence: '\x1B[5;10~', shortcut: 'fn+shift+meta+up' },
  { sequence: '\x1B[6;10~', shortcut: 'fn+shift+meta+down' },

  // <fn+ctrl+shift+meta>
  { sequence: '\x1B[1;14F', shortcut: 'fn+ctrl+shift+meta+right' },
  { sequence: '\x1B[1;14H', shortcut: 'fn+ctrl+shift+meta+left' },
  { sequence: '\x1B[3;14~', shortcut: 'fn+ctrl+shift+meta+delete' },
  { sequence: '\x1B[5;14~', shortcut: 'fn+ctrl+shift+meta+up' },
  { sequence: '\x1B[6;14~', shortcut: 'fn+ctrl+shift+meta+down' },

  // <f1-f4>
  { sequence: '\x1BOP', shortcut: 'f1' },
  { sequence: '\x1BOQ', shortcut: 'f2' },
  { sequence: '\x1BOR', shortcut: 'f3' },
  { sequence: '\x1BOS', shortcut: 'f4' },

  // <f1-f20>
  { sequence: '\x1B[11~', shortcut: 'f1' },
  { sequence: '\x1B[12~', shortcut: 'f2' },
  { sequence: '\x1B[13~', shortcut: 'f3' },
  { sequence: '\x1B[14~', shortcut: 'f4' },
  { sequence: '\x1B[15~', shortcut: 'f5' },
  { sequence: '\x1B[17~', shortcut: 'f6' },
  { sequence: '\x1B[18~', shortcut: 'f7' },
  { sequence: '\x1B[19~', shortcut: 'f8' },
  { sequence: '\x1B[20~', shortcut: 'f9' },
  { sequence: '\x1B[21~', shortcut: 'f10' },
  { sequence: '\x1B[23~', shortcut: 'f11' },
  { sequence: '\x1B[24~', shortcut: 'f12' },
  { sequence: '\x1B[25~', shortcut: 'f13' },
  { sequence: '\x1B[26~', shortcut: 'f14' },
  { sequence: '\x1B[28~', shortcut: 'f15' },
  { sequence: '\x1B[29~', shortcut: 'f16' },
  { sequence: '\x1B[31~', shortcut: 'f17' },
  { sequence: '\x1B[32~', shortcut: 'f18' },
  { sequence: '\x1B[33~', shortcut: 'f19' },
  { sequence: '\x1B[34~', shortcut: 'f20' },

  // <shift+f1-f12>
  { sequence: '\x1B[1;2P', shortcut: 'shift+f1' },
  { sequence: '\x1B[1;2Q', shortcut: 'shift+f2' },
  { sequence: '\x1B[1;2R', shortcut: 'shift+f3' },
  { sequence: '\x1B[1;2S', shortcut: 'shift+f4' },
  { sequence: '\x1B[15;2~', shortcut: 'shift+f5' },
  { sequence: '\x1B[17;2~', shortcut: 'shift+f6' },
  { sequence: '\x1B[18;2~', shortcut: 'shift+f7' },
  { sequence: '\x1B[19;2~', shortcut: 'shift+f8' },
  { sequence: '\x1B[20;2~', shortcut: 'shift+f9' },
  { sequence: '\x1B[21;2~', shortcut: 'shift+f10' },
  { sequence: '\x1B[23;2~', shortcut: 'shift+f11' },
  { sequence: '\x1B[24;2~', shortcut: 'shift+f12' },

  // <num_key>
  { sequence: '\x1BOp', shortcut: 'num_key_0' },
  { sequence: '\x1BOq', shortcut: 'num_key_1' },
  { sequence: '\x1BOr', shortcut: 'num_key_2' },
  { sequence: '\x1BOs', shortcut: 'num_key_3' },
  { sequence: '\x1BOt', shortcut: 'num_key_4' },
  { sequence: '\x1BOu', shortcut: 'num_key_5' },
  { sequence: '\x1BOv', shortcut: 'num_key_6' },
  { sequence: '\x1BOw', shortcut: 'num_key_7' },
  { sequence: '\x1BOx', shortcut: 'num_key_8' },
  { sequence: '\x1BOy', shortcut: 'num_key_9' },
  { sequence: '\x1BOl', shortcut: 'num_key_comma' },
  { sequence: '\x1BOm', shortcut: 'num_key_minus' },
  { sequence: '\x1BOn', shortcut: 'num_key_period' }
];
