/* eslint-disable no-control-regex */
import type { KeyBinding, Keypress } from '~/types';

export const PRINTABLE_CHAR_REGEX = /^(?!.*[\uFEFF])[\p{L}\p{N}\p{P}\p{S}\p{Z}\p{M}\u200D\s]+$/u;
export const NON_PRINTABLE_CHAR_REGEX = /[\p{Cc}\u2028\u2029]|(?!\u200D)\p{Cf}/u;

export const metaKeys = new Set(['alt', 'meta', 'option']);
export const modifierKeys = new Set(['fn', 'ctrl', 'shift', ...[...metaKeys], 'cmd']);
export const sortOrder = [
  'sequence',
  'name',
  'shortcut',
  'command',
  'action',
  'ctrl',
  'shift',
  'alt',
  'option',
  'meta',
  'fn',
  'printable',
  'pasted',
  'weight'
];

export const isBuiltIn = (k: Pick<KeyBinding, 'weight'>) => !k.weight || k.weight <= 0;

// Based on isMouse from chjj/blessed
// Copyright (c) 2013-2015, Christopher Jeffrey and contributors
export function isMousepress(input: unknown, _key?: Pick<Keypress, 'code'> | null) {
  return typeof input === 'string' && /^\x1b\[(?:M[\s\S]{3}|\d+;\d+;\d+M|<\d+;\d+;\d+[Mm]|<\d+;\d+;\d+;\d+&w|24[0135]~\[\d+,\d+\]\r|[IO])$/u.test(input);
}

export const parsePosition = (input: unknown) => {
  if (!input) return null;

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

export const sortKeys = <T extends Record<string, unknown>>(obj: T, keys = sortOrder) => {
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

  return ordered as T;
};

const normalizeModifier = (key: string) => {
  if (key === 'alt') return 'meta';
  if (key === 'option') return 'meta';
  if (key === 'control') return 'ctrl';
  if (key === 'command') return 'cmd';
  return key;
};

export const sortModifiers = (names: string[]): string[] => {
  const normalized = names.map(name => normalizeModifier(name.toLowerCase()));
  const modifiers = [];
  const after = [];

  for (const name of modifierKeys) {
    if (normalized.includes(name)) {
      modifiers.push(name);
    }
  }

  for (const name of normalized) {
    if (!modifiers.includes(name)) {
      after.push(name);
    }
  }

  return modifiers.concat(after);
};

export const createShortcut = (key: Keypress): string => {
  const modifiers = [];

  let keyName = key.sequence && isPrintableCharacter(key.sequence) ? key.sequence : key.name ?? '';
  if (keyName === 'undefined') keyName = '';

  if (key.fn && keyName !== 'end' && keyName !== 'home') modifiers.push('fn');
  if (key.shift) modifiers.push('shift');
  if (key.alt || key.option || key.meta) modifiers.push('meta');
  if (key.ctrl || key.control) modifiers.push('ctrl');
  if (key.cmd || key.command) modifiers.push('cmd');

  const output = modifiers.length > 0 && keyName
    ? `${sortModifiers(modifiers).join('+')}+${keyName}`
    : keyName;

  const result = output.length > 1 ? output : '';
  return result.toLowerCase();
};

export const sortShortcutModifier = (shortcut: string) => {
  return sortModifiers(shortcut.split('+')).join('+');
};

export const sortShortcutModifiers = <T extends { shortcut: string }>(keymap: readonly T[] = []) => {
  const bindings = [];

  for (const key of keymap) {
    bindings.push({ ...key, shortcut: sortShortcutModifier(key.shortcut) });
  }

  return bindings;
};

export const prioritizeKeymap = <T extends KeyBinding>(keymap: readonly T[] = []) => {
  const omit = keymap
    .filter(k => k.shortcut?.startsWith('-'))
    .map(k => sortShortcutModifier(k.shortcut.slice(1)));

  const bindings = sortShortcutModifiers(keymap)
    .filter(k => !isBuiltIn(k) || !omit.includes(k.shortcut));

  bindings.sort((a, b) => {
    const aWeight = a.weight ?? 0;
    const bWeight = b.weight ?? 0;
    return aWeight === bWeight ? 0 : bWeight > aWeight ? 1 : -1;
  });

  return bindings.filter(b => b.weight !== -1);
};

// Unicode ranges for general printable characters including emojis
export const isPrintableCharacter = (s?: string | null) => {
  return s ? PRINTABLE_CHAR_REGEX.test(s) && !NON_PRINTABLE_CHAR_REGEX.test(s) : false;
};
