import { kEscape } from '~/keypress';

export interface KeyboardProtocol {
  name: 'kitty' | 'mok';
  enable: string;
  disable: string;
}

export const KITTY_PROTOCOL: KeyboardProtocol = {
  name: 'kitty',
  enable: `${kEscape}[>1u`,
  disable: `${kEscape}[<u`
};

export const MOK_PROTOCOL: KeyboardProtocol = {
  name: 'mok',
  enable: `${kEscape}[>4;1m`,
  disable: `${kEscape}[>4;0m`
};

const KITTY_PROTOCOL_TERMINALS = new Set([
  'kitty',
  'alacritty',
  'foot',
  'ghostty',
  'iterm',
  'rio',
  'wezterm'
]);

const MOK_TERMINALS = new Set([
  'windows_terminal',
  'xterm',
  'gnome_terminal',
  'konsole',
  'vscode',
  'xfce4_terminal',
  'mate_terminal',
  'terminator'
]);

/**
 * Get the best keyboard protocol for a given terminal.
 * Returns null for terminals/multiplexers that don't support enhanced key reporting,
 * or where support is unreliable (tmux, screen).
 */

export const getKeyboardProtocol = (terminal: string): KeyboardProtocol | null => {
  if (KITTY_PROTOCOL_TERMINALS.has(terminal)) return KITTY_PROTOCOL;
  if (MOK_TERMINALS.has(terminal)) return MOK_PROTOCOL;
  return null;
};

export const resetKeyboardProtocol = (output: NodeJS.WriteStream): void => {
  output.write(KITTY_PROTOCOL.disable);
  output.write(MOK_PROTOCOL.disable);
};

/**
 * Enable enhanced keyboard protocol for the given terminal.
 * Returns a cleanup function to disable the protocol.
 */

export const enableKeyboardProtocol = (
  terminal: string,
  output: NodeJS.WriteStream
): (() => void) | null => {
  const protocol = getKeyboardProtocol(terminal);
  if (!protocol) return null;

  output.write(protocol.enable);

  return () => {
    output.write(protocol.disable);
  };
};
