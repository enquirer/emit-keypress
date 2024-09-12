import fs from 'node:fs/promises';
import path from 'node:path';
import type { Key } from 'readline';
import { emitKeypress, keycodes } from '../index';
import { shortcutKeys } from './shortcut-keys';

const pressed: string[] = [];

const save = async () => {
  const data = JSON.stringify(pressed, null, 2);
  await fs.writeFile(path.join(__dirname, 'shortcuts.json'), data);
};

let shortcut = null;

const next = () => {
  shortcut = shortcutKeys.shift();
  console.log(shortcut);
};

next();

emitKeypress({
  keymap: keycodes,
  onKeypress: async (input: string, key: Key, close) => {
    key.shortcut = shortcut;
    pressed.push(key);

    console.log({ input, key });

    if (input === '\x03' || input === '\r') {
      close();
    } else {
      next();
    }

    save();
  }
});
