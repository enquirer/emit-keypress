/* eslint-disable no-control-regex */
import type readline from 'node:readline';
export const PRINTABLE_CHAR_REGEX = /^[\p{L}\p{N}\p{P}\p{S}\p{Z}\p{Sm}/]+$/u;
export const NON_PRINTABLE_CHAR_REGEX = /[^\P{Cc}\P{Cf}\p{L}\p{N}\p{P}\p{S}\p{Z}]/u;

export const metaKeys = new Set(['alt', 'meta', 'option']);
export const modifierKeys = ['fn', 'ctrl', 'shift', ...[...metaKeys], 'cmd'];

// Based on isMouse from chjj/blessed
// Copyright (c) 2013-2015, Christopher Jeffrey and contributors
export function isMousepress(input, key) {
  if (key.code === '[M' || key.code === '[I' || key.code === '[O') {
    return true;
  }

  return /\x1b\[M/.test(input)
    || /\x1b\[M([\x00\u0020-\uffff]{3})/.test(input)
    || /\x1b\[(\d+;\d+;\d+)M/.test(input)
    || /\x1b\[<(\d+;\d+;\d+)([mM])/.test(input)
    || /\x1b\[<(\d+;\d+;\d+;\d+)&w/.test(input)
    || /\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.test(input)
    || /\x1b\[(O|I)/.test(input);
}

export const parsePosition = input => {
  if (!input) return null;
  // eslint-disable-next-line no-control-regex
  const match = /^\x1B\[([0-9]+);([0-9]+)R/.exec(String(input));

  if (match) {
    return {
      name: 'position',
      position: { y: match[1], x: match[2] },
      printable: false
    };
  }

  return null;
};

const order = [
  'sequence',
  'name',
  'shortcut',
  'command',
  'ctrl',
  'shift',
  'meta',
  'fn',
  'printable',
  'pasted',
  'weight'
];

export const sortKeys = (obj, keys = order) => {
  const ordered = {};

  for (const key of keys) {
    if (obj[key] !== undefined) {
      ordered[key] = obj[key];
    }
  }

  for (const [k, v] of Object.entries(obj)) {
    if (!(k in ordered)) {
      ordered[k] = v;
    }
  }

  return ordered;
};

export const sortModifiers = (names: string[]): string[] => {
  const modifiers = [];
  const after = [];

  for (const name of modifierKeys) {
    if (names.includes(name)) {
      modifiers.push(name);
    }
  }

  for (const name of names) {
    if (!modifiers.includes(name)) {
      after.push(name);
    }
  }

  return modifiers.concat(after);
};

export const createShortcut = (key: readline.Key): string => {
  const modifiers = new Set();
  if (key.fn) modifiers.add('fn');
  if (key.ctrl) modifiers.add('ctrl');
  if (key.shift) modifiers.add('shift');
  if (key.alt) modifiers.add('meta');
  if (key.option) modifiers.add('meta');
  if (key.meta) modifiers.add('meta');

  let keyName = isPrintableCharacter(key.sequence) ? key.sequence : key.name;
  if (keyName === 'undefined') keyName = '';

  const output = modifiers.size > 0 && keyName
    ? `${sortModifiers([...modifiers]).join('+')}+${keyName}`
    : keyName;

  return output.length > 1 ? output : '';
};

export const sortShortcutModifier = shortcut => {
  return sortModifiers(shortcut.split('+')).join('+');
};

export const sortShortcutModifiers = (keymap = []) => {
  for (const key of keymap) key.shortcut = sortShortcutModifier(key.shortcut);
  return keymap;
};

export const prioritizeKeymap = (keymap: any = []) => {
  const omit = keymap
    .filter(k => k.shortcut?.startsWith('-'))
    .map(k => sortShortcutModifier(k.shortcut.slice(1)));

  const bindings = sortShortcutModifiers(keymap)
    .filter(k => !omit.includes(k.shortcut));

  bindings.sort((a, b) => {
    a.weight ||= 0;
    b.weight ||= 0;
    if (a.weight === b.weight) return 0;
    return a.weight > b.weight ? 1 : -1;
  });

  return bindings;
};

// Unicode ranges for general printable characters including emojis
export const isPrintableCharacter = s => {
  return s ? PRINTABLE_CHAR_REGEX.test(s) && !NON_PRINTABLE_CHAR_REGEX.test(s) : false;
};
