import fs from 'node:fs';
import { emitKeypress, keycodes } from '../index';

emitKeypress({
  keymap: keycodes,
  onKeypress: async (input, key, close) => {
    const files = input.split(/(?<!\\)\s+/).filter(Boolean);
    let count = 0;

    for (const file of files) {
      const filepath = file.replace(/\\/g, '');

      if (!fs.existsSync(filepath)) {
        console.log('file does not exist:', filepath);
        continue;
      }

      count++;
    }

    console.log('dropped', count, 'files');

    if (input === '\x03' || input === '\r') {
      close();
    }
  }
});
