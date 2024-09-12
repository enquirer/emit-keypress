export const keymap = [
  { shortcut: 'return', command: 'submit', sequence: '\r', weight: Infinity },
  { shortcut: 'escape', command: 'cancel', sequence: '\x1B', weight: Infinity },

  { shortcut: 'up', command: 'up', sequence: '\x1B[A', weight: 0 },
  { shortcut: 'down', command: 'down', sequence: '\x1B[B', weight: 0 },

  { shortcut: 'right', command: 'right', sequence: '\x1B[C', weight: 0 },
  { shortcut: 'left', command: 'left', sequence: '\x1B[D', weight: 0 },

  { shortcut: 'end', command: 'end', sequence: '\x1B[F', weight: 0 },
  { shortcut: 'home', command: 'home', sequence: '\x1B[H', weight: 0 },
  { shortcut: 'backspace', command: 'backspace', sequence: '\x7f', weight: 0 },
  { shortcut: 'delete', command: 'delete', sequence: '\x1B[3~', weight: 0, when: 'kind === "string"' },
  { shortcut: 'delete', command: 'delete_forward', sequence: '\u007F', weight: 0, when: 'kind === "string"' },
  { shortcut: 'delete', command: 'delete', sequence: '\u007F', weight: 0, when: 'kind === "string"' },
  { shortcut: 'space', command: 'toggle', when: 'type === "multiselect" || focused?.kind === "boolean"', sequence: '\u0020', weight: 0 },
  { shortcut: 'space', command: 'append', sequence: '\u0020', weight: 0, when: 'kind === "string"' },
  { shortcut: 'backspace', command: 'backspace', sequence: '\u0008', weight: 0, when: 'kind === "string"' },
  { shortcut: 'backspace', command: 'delete', sequence: '\u0008', weight: 0, when: 'kind === "string"' },
  { shortcut: 'enter', command: 'enter', sequence: '\u000D', weight: 0 },

  { shortcut: 'fn+left', command: 'home', sequence: '\x1B[1~', weight: 0 },
  { shortcut: 'fn+delete', command: 'delete', sequence: '\x1B[3~', weight: 0 },
  { shortcut: 'fn+right', command: 'end', sequence: '\x1B[4~', weight: 0 },

  { shortcut: 'ctrl+_', command: 'undo', sequence: '\x1f', weight: -1 },
  { shortcut: 'ctrl+a', command: 'first', sequence: '\x01', weight: 0 },
  { shortcut: 'ctrl+a', command: 'home', sequence: '\x01', weight: 0 },
  { shortcut: 'ctrl+b', command: 'left', description: 'move cursor left', sequence: '\x02', weight: 0, when: 'kind === "string"' },
  { shortcut: 'ctrl+b', command: 'backward', sequence: '\x02', weight: 0 },
  { shortcut: 'ctrl+c', command: 'cancel', sequence: '\x03', weight: Infinity },
  { shortcut: 'ctrl+d', command: 'delete', sequence: '\x04', weight: 0 },
  { shortcut: 'ctrl+e', command: 'last', sequence: '\x05', weight: 0 },
  { shortcut: 'ctrl+e', command: 'end', sequence: '\x05', weight: 0 },
  { shortcut: 'ctrl+f', command: 'right', sequence: '\x06', description: 'move cursor right', weight: 0, when: 'kind === "string"' },
  { shortcut: 'ctrl+f', command: 'forward', sequence: '\x06', weight: -1 },
  { shortcut: 'ctrl+g', command: 'reset', sequence: '\x07', weight: 0 },
  { shortcut: 'ctrl+h', command: 'help', sequence: '\b', weight: 0 },
  { shortcut: 'ctrl+i', command: 'tab', sequence: '\x09', weight: -1 },
  { shortcut: 'ctrl+j', command: 'enter', sequence: '\x0a', weight: -1 },
  { shortcut: 'ctrl+j', command: 'newline', sequence: '\x0a', weight: -1 },
  { shortcut: 'ctrl+k', command: 'cut_to_end', sequence: '\x0b', weight: 0 },
  { shortcut: 'ctrl+l', command: 'clear', sequence: '\x0c', weight: 0 },
  { shortcut: 'ctrl+m', command: 'enter', sequence: '\x0d', weight: 0 },
  { shortcut: 'ctrl+m', command: 'submit', sequence: '\x0d', weight: 0 },
  { shortcut: 'ctrl+n', command: 'down', sequence: '\x0e', weight: 0 },
  { shortcut: 'ctrl+n', command: 'new', sequence: '\x0e', weight: 0 },
  { shortcut: 'ctrl+p', command: 'search', sequence: '\x10', weight: -1 },
  { shortcut: 'ctrl+p', command: 'up', sequence: '\x10', weight: -1 },
  { shortcut: 'ctrl+q', command: 'quit', sequence: '\x11', weight: 0 },
  { shortcut: 'ctrl+r', command: 'redo', sequence: '\x12', weight: -1 },
  { shortcut: 'ctrl+r', command: 'remove', sequence: '\x12', weight: -1 },
  { shortcut: 'ctrl+s', command: 'search', when: '!searching', sequence: '\x13', weight: -1 },
  { shortcut: 'ctrl+s', command: 'restore', when: 'searching', sequence: '\x13', weight: -1 },
  { shortcut: 'ctrl+s', command: 'save', sequence: '\x13', weight: 0 },
  { shortcut: 'ctrl+t', command: 'toggle', sequence: '\x14', weight: 0 },
  { shortcut: 'ctrl+t', command: 'toggle_cursor', sequence: '\x14', weight: 0 },
  { shortcut: 'ctrl+u', command: 'undo', sequence: '\x15', weight: 0 },
  { shortcut: 'ctrl+v', command: 'paste', sequence: '\x16', weight: 0 },
  { shortcut: 'ctrl+w', command: 'cut_word_left', sequence: '\x17', weight: 0 },
  { shortcut: 'ctrl+x', command: 'cut', sequence: '\x18', weight: 0 },
  { shortcut: 'ctrl+y', command: 'redo', sequence: '\x19', weight: 0 },
  { shortcut: 'ctrl+z', command: 'undo', sequence: '\x1a', weight: 0 },

  { shortcut: 'ctrl+right', command: 'end', sequence: '\x1B[1;5C', weight: 0 },
  { shortcut: 'ctrl+left', command: 'home', sequence: '\x1B[1;5D', weight: 0 },

  { shortcut: 'a', command: 'a', when: 'kind === "array"', sequence: '\u0061', weight: 0 },
  { shortcut: 'g', command: 'g', when: 'kind === "array"', sequence: '\u0067', weight: 0 },
  { shortcut: 'i', command: 'i', when: 'kind === "array"', sequence: '\u0069', weight: 0 },
  { shortcut: 'p', command: 'p', when: 'kind === "array"', sequence: '\u0070', weight: 0 },

  { shortcut: 'a', command: 'toggle_all', when: 'kind === "array"', sequence: '\u0061', weight: 0 },
  { shortcut: 'g', command: 'toggle_group', when: 'kind === "array"', sequence: '\u0067', weight: 0 },
  { shortcut: 'i', command: 'invert', when: 'kind === "array"', sequence: '\u0069', weight: 0 },
  { shortcut: 'p', command: 'toggle_page', when: 'kind === "array"', sequence: '\u0070', weight: 0 },

  { shortcut: 'number', command: 'number', sequence: '[0-9]', test: /^[0-9.]+/, weight: 0 },

  { shortcut: 'left', command: 'prev_tabstop', when: 'options?.tabstops === true', sequence: '\x1B[D' },
  { shortcut: 'left', command: 'prev_page', when: 'options?.paginate !== false', sequence: '\x1B[D' },
  { shortcut: 'left', command: 'move_left', sequence: '\x1B[D' },
  { shortcut: 'left', command: 'left', sequence: '\x1B[D', weight: 0 },

  { shortcut: 'right', command: 'next_tabstop', when: 'options?.tabstops === true', sequence: '\x1B[C' },
  { shortcut: 'right', command: 'next_page', when: 'options?.paginate !== false', sequence: '\x1B[C' },
  { shortcut: 'right', command: 'move_right', sequence: '\x1B[C' },
  { shortcut: 'right', command: 'right', sequence: '\x1B[C', weight: 0 },

  { shortcut: 'tab', command: 'tab', sequence: '\t', weight: 0 },
  { shortcut: 'tab', command: 'next', sequence: '\t', weight: 0 },

  { shortcut: 'shift+tab', command: 'shift_tab', sequence: '\x1B[Z', weight: 0, when: 'kind === "string"' },
  { shortcut: 'shift+tab', command: 'prev', sequence: '\x1B[Z', weight: 0 },

  { shortcut: 'shift+up', command: 'move_up', when: 'options?.sort !== false', sequence: '\x1B[1;2A', weight: 0 },
  { shortcut: 'shift+up', command: 'scroll_up', when: 'options?.paginate !== true && options?.scroll !== false', sequence: '\x1B[1;2A', weight: 0 },

  { shortcut: 'shift+down', command: 'move_down', when: 'options?.sort !== false', sequence: '\x1B[1;2B', weight: 0 },
  { shortcut: 'shift+down', command: 'scroll_down', when: 'options?.paginate !== true && options?.scroll !== false', sequence: '\x1B[1;2B', weight: 0 },

  { shortcut: 'shift+left', command: 'select_left', sequence: '\x1B[1;2D', weight: 0 },
  { shortcut: 'shift+right', command: 'select_right', sequence: '\x1B[1;2C', weight: 0 },

  { shortcut: 'shift+meta+left', command: 'select_word_left', sequence: '\x1B[1;10D', weight: 0 },
  { shortcut: 'shift+meta+right', command: 'select_word_right', sequence: '\x1B[1;10C', weight: 0 },

  { shortcut: 'shift+meta+down', command: 'rotate_down', sequence: '\x1B[1;10B', weight: 1 },
  { shortcut: 'shift+meta+left', command: 'rotate_right', sequence: '\x1B[1;10D' },
  { shortcut: 'shift+meta+right', command: 'rotate_left', sequence: '\x1B[1;10C' },
  { shortcut: 'shift+meta+up', command: 'rotate_up', sequence: '\x1B[1;10A', weight: 1 },

  // { shortcut: 'shift+home', command: 'select_home', sequence: '\x1B[1;2H', weight: 0 },
  // { shortcut: 'shift+end', command: 'select_end', sequence: '\x1B[1;2F', weight: 0 },

  // { shortcut: 'shift+up', command: 'select_up', sequence: '\x1B[1;2A', weight: 0 },
  // { shortcut: 'shift+down', command: 'select_down', sequence: '\x1B[1;2B', weight: 0 },

  // { shortcut: 'shift+pageup', command: 'select_pageup', sequence: '\x1B[5;2~', weight: 0 },
  // { shortcut: 'shift+pagedown', command: 'select_pagedown', sequence: '\x1B[6;2~', weight: 0 },

  // { shortcut: 'shift+home', command: 'select_home', sequence: '\x1B[1;2H', weight: 0 },
  // { shortcut: 'shift+end', command: 'select_end', sequence: '\x1B[1;2F', weight: 0 },

  // { shortcut: 'shift+home', command: 'select_home', sequence: '\x1B[1;2H', weight: 0 },
  // { shortcut: 'shift+end', command: 'select_end', sequence: '\x1B[1;2F', weight: 0 },

  // { shortcut: 'shift+home', command: 'select_home', sequence: '\x1B[1;2H', weight: 0 },
  // { shortcut: 'shift+end', command: 'select_end', sequence: '\x1B[1;2F', weight: 0 },

  // { shortcut: 'shift+home', command: 'select_home', sequence: '\x1B[1;2H', weight: 0 },
  // { shortcut: 'shift+end', command: 'select_end', sequence: '\x1B[1;2F', weight: 0 },

  // { shortcut: 'shift+home', command: 'select_home', sequence: '\x1B[1;2H', weight: 0 },
  // { shortcut: 'shift+end', command: 'select_end', sequence: '\x1B[1;2F', weight: 0 },

  /* <ctrl>+<shift> */
  { shortcut: 'ctrl+shift+right', command: 'select_word_right', sequence: '\x1B[1;6C', weight: 0 },
  { shortcut: 'ctrl+shift+left', command: 'select_word_left', sequence: '\x1B[1;6D', weight: 0 },
  { shortcut: 'ctrl+shift+up', command: 'select_paragraph_up', sequence: '\x1B[1;6A', weight: 0 },
  { shortcut: 'ctrl+shift+down', command: 'select_paragraph_down', sequence: '\x1B[1;6B', weight: 0 },

  { shortcut: 'pageup', command: 'pageup', sequence: '\x1B[5~', notes: '<fn>+<up> (mac), <Page Up> (windows)', weight: 0 },
  { shortcut: 'pagedown', command: 'pagedown', sequence: '\x1B[6~', notes: '<fn>+<down> (mac), <Page Down> (windows)', weight: 0 },
  { shortcut: 'home', command: 'pageleft', sequence: '\x1B[H', notes: '<fn>+<left> (mac), <home> (windows), <home>', weight: 0 },
  { shortcut: 'end', command: 'pageright', sequence: '\x1B[F', notes: '<fn>+<right> (mac), <end> (windows), <end>', weight: 0 },
  { shortcut: 'home', command: 'home', sequence: '\x1B[H', notes: '<fn>+<left> (mac), <home> (windows)', weight: 0 },
  { shortcut: 'end', command: 'end', sequence: '\x1B[F', notes: '<fn>+<right> (mac), <end> (windows)', weight: 0 },

  { shortcut: 'fn+up', command: 'pageup', sequence: '\x1B[5~', weight: 0 },
  { shortcut: 'fn+pageup', command: 'pageup', sequence: '\x1B[5~', weight: 0 },
  { shortcut: 'fn+down', command: 'pagedown', sequence: '\x1B[6~', weight: 0 },
  { shortcut: 'fn+pagedown', command: 'pagedown', sequence: '\x1B[6~', weight: 0 },
  { shortcut: 'fn+left', command: 'pageleft', sequence: '\x1B[H', notes: '<home>', weight: 0
  },
  { shortcut: 'fn+right', command: 'pageright', sequence: '\x1B[F', notes: '<end>', weight: 0 },
  { shortcut: 'fn+delete', command: 'delete_forward', sequence: '\x1B[3~', weight: 0 },
  { shortcut: 'ctrl+end', command: 'end', sequence: '\x1B[1;5F', weight: 0 },
  { shortcut: 'ctrl+home', command: 'home', sequence: '\x1B[1;5H', weight: 0 },
  { shortcut: 'ctrl+shift+end', command: 'select_end', sequence: '\x1B[1;6F', weight: 0 },
  { shortcut: 'ctrl+shift+home', command: 'select_home', sequence: '\x1B[1;6H', weight: 0 },
  { shortcut: 'fn+ctrl+left', command: 'select_word_left', sequence: '\x1B[1;5D', weight: 0 },
  { shortcut: 'fn+ctrl+right', command: 'select_word_right', sequence: '\x1B[1;5C', weight: 0 },
  { shortcut: 'fn+meta+down', command: 'select_paragraph_down', sequence: '\x1B[1;3B', weight: 0 },
  { shortcut: 'fn+meta+end', command: 'select_end', sequence: '\x1B[1;3F', weight: 0 },
  { shortcut: 'fn+meta+home', command: 'select_home', sequence: '\x1B[1;3H', weight: 0 },
  { shortcut: 'fn+meta+left', command: 'select_word_left', sequence: '\x1B[1;3D', weight: 0 },
  { shortcut: 'fn+meta+right', command: 'select_word_right', sequence: '\x1B[1;3C', weight: 0 },
  { shortcut: 'fn+meta+up', command: 'select_paragraph_up', sequence: '\x1B[1;3A', weight: 0 },
  { shortcut: 'fn+shift+left', command: 'select_word_left', sequence: '\x1B[1;2D', weight: 0 },
  { shortcut: 'fn+shift+right', command: 'select_word_right', sequence: '\x1B[1;2C', weight: 0 },
  { shortcut: 'shift+end', command: 'select_end', sequence: '\x1B[1;2F', weight: 0 },
  { shortcut: 'shift+home', command: 'select_home', sequence: '\x1B[1;2H', weight: 0 },

  /* <option|option> shortcut */
  { shortcut: 'meta+pageup', command: 'pageup', sequence: '\x1B[5;3~', weight: 0 },
  { shortcut: 'meta+pagedown', command: 'pagedown', sequence: '\x1B[6;3~', weight: 0 },
  { shortcut: 'meta+a', command: 'ditto', sequence: '\x1Ba', weight: -1, description: 'make all choices the same as the currently selected value' },
  { shortcut: 'meta+b', command: 'jump_backward', sequence: '\x1Bb', weight: -1, description: 'typically used for moving right one word' },
  { shortcut: 'meta+f', command: 'jump_forward', sequence: '\x1Bf', weight: -1, description: 'typically used for moving left one word' },

  { shortcut: 'meta+d', command: 'cut_word_right', sequence: '\x1Bd', weight: 0 },
  { shortcut: 'fn+meta+down', command: 'expand_down', sequence: '\x1B[1;3B', weight: 0 },
  { shortcut: 'meta+down', command: 'move_paragraph_down', sequence: '\x1B[1;9B', weight: 0 },
  { shortcut: 'meta+left', command: 'cut_word_left', sequence: '\x1B[1;3D', weight: 0 },
  { shortcut: 'meta+left', command: 'move_word_left', sequence: '\x1B\x1B[C', weight: 0 },
  { shortcut: 'meta+right', command: 'move_word_right', sequence: '\x1B\x1B[C', weight: 0 },
  { shortcut: 'meta+space', command: 'alt_space', sequence: '\x1B ', weight: -1 },
  { shortcut: 'meta+up', command: 'expand_up', sequence: '\x1B[1;3A', weight: 0 },
  { shortcut: 'meta+up', command: 'move_paragraph_up', sequence: '\x1B[1;9A', weight: 0 },

  { shortcut: 'shift+f1', command: '', sequence: '\x1B[1;2P', weight: 0 },
  { shortcut: 'shift+f2', command: '', sequence: '\x1B[1;2Q', weight: 0 },
  { shortcut: 'shift+f3', command: '', sequence: '\x1B[1;2R', weight: 0 },
  { shortcut: 'shift+f4', command: '', sequence: '\x1B[1;2S', weight: 0 },
  { shortcut: 'shift+f5', command: '', sequence: '\x1B[15;2~', weight: 0 },
  { shortcut: 'shift+f6', command: '', sequence: '\x1B[17;2~', weight: 0 },
  { shortcut: 'shift+f7', command: '', sequence: '\x1B[18;2~', weight: 0 },
  { shortcut: 'shift+f8', command: '', sequence: '\x1B[19;2~', weight: 0 },
  { shortcut: 'shift+f9', command: '', sequence: '\x1B[20;2~', weight: 0 },
  { shortcut: 'shift+f10', command: '', sequence: '\x1B[21;2~', weight: 0 },
  { shortcut: 'shift+f11', command: '', sequence: '\x1B[23;2~', weight: 0 },
  { shortcut: 'shift+f12', command: '', sequence: '\x1B[24;2~', weight: 0 },

  { shortcut: 'f1', command: 'help', sequence: '\x1BOP', weight: 0 },
  { shortcut: 'f2', command: 'rename', sequence: '\x1BOQ', weight: 0 },
  { shortcut: 'f3', command: 'search', sequence: '\x1BOR', weight: 0 },
  { shortcut: 'f4', command: 'close', sequence: '\x1BOS', weight: 0 },
  { shortcut: 'f5', command: 'refresh', sequence: '\x1B[15~', weight: 0 },
  { shortcut: 'f6', command: 'next_tab', sequence: '\x1B[17~', weight: 0 },
  { shortcut: 'f7', command: 'previous_tab', sequence: '\x1B[18~', weight: 0 },
  { shortcut: 'f8', command: 'execute', sequence: '\x1B[19~', weight: 0 },
  { shortcut: 'f9', command: 'rebuild', sequence: '\x1B[20~', weight: 0 },
  { shortcut: 'f10', command: 'step_over', sequence: '\x1B[21~', weight: 0 },
  { shortcut: 'f12', command: 'inspect', sequence: '\x1B[24~', weight: 0 }
];

// const withDescriptions = keymap.filter(b => b.description);
// const withoutDescriptions = keymap.filter(b => !b.description);

// const shiftUp = keymap.find(b => b.shortcut === 'shift+up');
// console.debug(shiftUp);
