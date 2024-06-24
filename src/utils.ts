/* eslint-disable no-control-regex */
import type readline from 'node:readline';

export const PRINTABLE_CHAR_REGEX = /^[\p{L}\p{N}\p{P}\p{S}\p{Z}\p{Sm}]+$/u;
export const NON_PRINTABLE_CHAR_REGEX = /[^\P{Cc}\P{Cf}\p{L}\p{N}\p{P}\p{S}\p{Z}]/u;

export const createShortcut = (key: readline.Key): string => {
  const modifiers = [];
  if (key.fn) modifiers.push('fn');
  if (key.ctrl) modifiers.push('ctrl');
  if (key.shift) modifiers.push('shift');
  if (key.meta) modifiers.push('meta');
  let keyName = key.name || (isPrintableCharacter(key.sequence) ? key.sequence : '');
  if (keyName === 'undefined') keyName = '';
  return modifiers.length > 0 ? `${modifiers.join('+')}+${keyName}` : keyName;
};

// Unicode ranges for general printable characters including emojis
export const isPrintableCharacter = s => {
  return PRINTABLE_CHAR_REGEX.test(s) && !NON_PRINTABLE_CHAR_REGEX.test(s);
};
