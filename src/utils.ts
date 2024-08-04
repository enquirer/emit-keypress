/* eslint-disable no-control-regex */
import type readline from 'node:readline';
export const PRINTABLE_CHAR_REGEX = /^[\p{L}\p{N}\p{P}\p{S}\p{Z}\p{Sm}/]+$/u;
export const NON_PRINTABLE_CHAR_REGEX = /[^\P{Cc}\P{Cf}\p{L}\p{N}\p{P}\p{S}\p{Z}]/u;

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
  const match = /^\x1B\[([0-9]+);([0-9]+)R/.exec(String(input));

  if (match) {
    return {
      name: 'position',
      pos: { x: match[1] - 1, y: match[2] - 1 },
      printable: false
    };
  }

  return null;
};

export const createShortcut = (key: readline.Key): string => {
  const modifiers = [];
  if (key.fn) modifiers.push('fn');
  if (key.ctrl) modifiers.push('ctrl');
  if (key.shift) modifiers.push('shift');
  if (key.alt) modifiers.push('meta');
  if (key.option) modifiers.push('meta');
  if (key.meta) modifiers.push('meta');
  let keyName = isPrintableCharacter(key.sequence) ? key.sequence : key.name;
  if (keyName === 'undefined') keyName = '';
  const output = modifiers.length > 0 ? `${modifiers.join('+')}+${keyName}` : keyName;
  return output.length > 1 ? output : '';
};

// Unicode ranges for general printable characters including emojis
export const isPrintableCharacter = s => {
  return s && PRINTABLE_CHAR_REGEX.test(s) && !NON_PRINTABLE_CHAR_REGEX.test(s);
};
