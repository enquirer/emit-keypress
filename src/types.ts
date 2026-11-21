import type readline from 'node:readline';

export interface Keypress extends readline.Key {
  code?: string;
  fn?: boolean;
  alt?: boolean;
  option?: boolean;
  control?: boolean;
  cmd?: boolean;
  command?: boolean | string;
  shortcut?: string;
  printable?: boolean;
  position?: { x: string; y: string };
}

export interface KeyBinding extends Keypress {
  shortcut: string;
  priority?: number;
}

export interface KeyboardProtocol {
  name: 'kitty' | 'mok';
  enable: string;
  disable: string;
}

export type Keymap = readonly KeyBinding[] | (() => readonly KeyBinding[]);

export interface KeyboardEvent extends Keypress {
  sequence: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  fn: boolean;
  priority?: number;
}

export interface CursorPositionEvent {
  name: 'position';
  position: { x: string; y: string };
  printable: false;
  sequence?: never;
}

export type KeypressEvent = KeyboardEvent | CursorPositionEvent;

interface MousepressBase {
  mouse: true;
  sequence: string;
  x: number;
  y: number;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

interface MouseReport extends MousepressBase {
  name: 'mouse';
  raw: [number, number, number, string];
  buf: Buffer;
}

export type MouseButton = 'left' | 'middle' | 'right' | 'unknown';

export type MousepressEvent =
  | (MouseReport & { type: 'X10' | 'urxvt' | 'sgr' } & (
    | { action: 'mousedown' | 'mouseup'; button: MouseButton }
    | { action: 'wheelup' | 'wheeldown'; button: 'middle' }
    | { action: 'mousemove'; button?: never }
  ))
  | (MouseReport & { type: 'dec'; page: number; action: 'mousedown' | 'mouseup'; button: MouseButton })
  | (MouseReport & { type: 'vt300'; action: 'mousedown'; button: MouseButton })
  | (MousepressBase & {
    name: undefined;
    type?: never;
    action?: 'focus' | 'blur';
    release: boolean;
    scroll: -1 | 0 | 1;
    button?: number;
  });
