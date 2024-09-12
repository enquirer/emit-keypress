/* eslint-disable no-control-regex */
// eslint-disable-next-line complexity
export const mousepress = (s: string, buf: Buffer, state = {}) => {
  let parts;
  let b;
  let x;
  let y;
  let mod;
  let params;
  let down;
  let page;
  let button;

  const key = {
    name: undefined,
    ctrl: false,
    meta: false,
    shift: false
  };

  if (Buffer.isBuffer(s)) {
    if (s[0] > 127 && s[1] === undefined) {
      s[0] -= 128;
      s = '\x1b' + s.toString('utf8');
    } else {
      s = s.toString('utf8');
    }
  }

  // XTerm / X10 for buggy VTE
  // VTE can only send unsigned chars and no unicode for coords. This limits
  // them to 0xff. However, normally the x10 protocol does not allow a byte
  // under 0x20, but since VTE can have the bytes overflow, we can consider
  // bytes below 0x20 to be up to 0xff + 0x20. This gives a limit of 287. Since
  // characters ranging from 223 to 248 confuse javascript's utf parser, we
  // need to parse the raw binary. We can detect whether the terminal is using
  // a bugged VTE version by examining the coordinates and seeing whether they
  // are a value they would never otherwise be with a properly implemented x10
  // protocol. This method of detecting VTE is only 99% reliable because we
  // can't check if the coords are 0x00 (255) since that is a valid x10 coord
  // technically.
  const bx = s.charCodeAt(4);
  const by = s.charCodeAt(5);

  if (buf[0] === 0x1b && buf[1] === 0x5b && buf[2] === 0x4d && (state.isVTE
      || bx >= 65533 || by >= 65533
      || (bx > 0x00 && bx < 0x20)
      || (by > 0x00 && by < 0x20)
      || (buf[4] > 223 && buf[4] < 248 && buf.length === 6)
      || (buf[5] > 223 && buf[5] < 248 && buf.length === 6))) {
    b = buf[3];
    x = buf[4];
    y = buf[5];

    // unsigned char overflow.
    if (x < 0x20) x += 0xff;
    if (y < 0x20) y += 0xff;

    // Convert the coordinates into a
    // properly formatted x10 utf8 sequence.
    s = '\x1b[M' + String.fromCharCode(b) + String.fromCharCode(x) + String.fromCharCode(y);
  }

  // XTerm / X10
  if ((parts = /^\x1b\[M([\x00\u0020-\uffff]{3})/.exec(s))) {
    b = parts[1].charCodeAt(0);
    x = parts[1].charCodeAt(1);
    y = parts[1].charCodeAt(2);

    key.name = 'mouse';
    key.type = 'X10';

    key.raw = [b, x, y, parts[0]];
    key.buf = buf;
    key.x = x - 32;
    key.y = y - 32;

    if (state.zero) {
      key.x--;
      key.y--;
    }

    if (x === 0) key.x = 255;
    if (y === 0) key.y = 255;

    mod = b >> 2;
    key.shift = Boolean(mod & 1);
    key.meta = Boolean((mod >> 1) & 1);
    key.ctrl = Boolean((mod >> 2) & 1);

    b -= 32;

    if ((b >> 6) & 1) {
      key.action = b & 1 ? 'wheeldown' : 'wheelup';
      key.button = 'middle';
    } else if (b === 3) {
      // NOTE: x10 and urxvt have no way
      // of telling which button mouseup used.
      key.action = 'mouseup';
      key.button = state._lastButton || 'unknown';
      delete state._lastButton;
    } else {
      key.action = 'mousedown';
      button = b & 3;
      key.button = button === 0
        ? 'left' : button === 1
          ? 'middle' : button === 2
            ? 'right' : 'unknown';

      state._lastButton = key.button;
    }

    // Probably a movement.
    // The *newer* VTE gets mouse movements comepletely wrong.
    // This presents a problem: older versions of VTE that get it right might
    // be confused by the second conditional in the if statement.
    // NOTE: Possibly just switch back to the if statement below.
    // none, shift, ctrl, alt
    // gnome: 32, 36, 48, 40
    // xterm: 35, _, 51, _
    // urxvt: 35, _, _, _
    // if (key.action === 'mousedown' && key.button === 'unknown') {
    if (b === 35 || b === 39 || b === 51 || b === 43
        || (state.isVTE && (b === 32 || b === 36 || b === 48 || b === 40))) {
      delete key.button;
      key.action = 'mousemove';
    }

    key.sequence = s;
    return key;
  }

  // URxvt
  if ((parts = /^\x1b\[(\d+;\d+;\d+)M/.exec(s))) {
    params = parts[1].split(';');
    b = Number(params[0]);
    x = Number(params[1]);
    y = Number(params[2]);

    key.name = 'mouse';
    key.type = 'urxvt';

    key.raw = [b, x, y, parts[0]];
    key.buf = buf;
    key.x = x;
    key.y = y;

    if (state.zero) {
      key.x--;
      key.y--;
    }

    mod = b >> 2;
    key.shift = Boolean(mod & 1);
    key.meta = Boolean((mod >> 1) & 1);
    key.ctrl = Boolean((mod >> 2) & 1);

    // XXX Bug in urxvt after wheelup/down on mousemove
    // NOTE: This may be different than 128/129 depending
    // on mod keys.
    if (b === 128 || b === 129) b = 67;
    b -= 32;

    if ((b >> 6) & 1) {
      key.action = b & 1 ? 'wheeldown' : 'wheelup';
      key.button = 'middle';
    } else if (b === 3) {
      // NOTE: x10 and urxvt have no way
      // of telling which button mouseup used.
      key.action = 'mouseup';
      key.button = state._lastButton || 'unknown';
      delete state._lastButton;
    } else {
      key.action = 'mousedown';
      button = b & 3;
      key.button = button === 0 ? 'left'
        : button === 1 ? 'middle'
          : button === 2 ? 'right'
            : 'unknown';

      // NOTE: 0/32 = mousemove, 32/64 = mousemove with left down
      // if ((b >> 1) === 32)
      state._lastButton = key.button;
    }

    // Probably a movement.
    // The *newer* VTE gets mouse movements comepletely wrong.
    // This presents a problem: older versions of VTE that get it right might
    // be confused by the second conditional in the if statement.
    // NOTE: Possibly just switch back to the if statement below.
    // none, shift, ctrl, alt
    // urxvt: 35, _, _, _
    // gnome: 32, 36, 48, 40
    // if (key.action === 'mousedown' && key.button === 'unknown') {
    if (b === 35 || b === 39 || b === 51 || b === 43
        || (state.isVTE && (b === 32 || b === 36 || b === 48 || b === 40))) {
      delete key.button;
      key.action = 'mousemove';
    }

    key.sequence = s;
    return key;
  }

  // SGR
  if ((parts = /^\x1b\[<(\d+;\d+;\d+)([mM])/.exec(s))) {
    down = parts[2] === 'M';
    params = parts[1].split(';');
    b = Number(params[0]);
    x = Number(params[1]);
    y = Number(params[2]);

    key.name = 'mouse';
    key.type = 'sgr';

    key.raw = [b, x, y, parts[0]];
    key.buf = buf;
    key.x = x;
    key.y = y;

    if (state.zero) {
      key.x--;
      key.y--;
    }

    mod = b >> 2;
    key.shift = Boolean(mod & 1);
    key.meta = Boolean((mod >> 1) & 1);
    key.ctrl = Boolean((mod >> 2) & 1);

    if ((b >> 6) & 1) {
      key.action = b & 1 ? 'wheeldown' : 'wheelup';
      key.button = 'middle';
    } else {
      key.action = down ? 'mousedown' : 'mouseup';
      button = b & 3;
      key.button = button === 0
        ? 'left' : button === 1
          ? 'middle' : button === 2
            ? 'right' : 'unknown';
    }

    // Probably a movement.
    // The *newer* VTE gets mouse movements comepletely wrong.
    // This presents a problem: older versions of VTE that get it right might
    // be confused by the second conditional in the if statement.
    // NOTE: Possibly just switch back to the if statement below.
    // none, shift, ctrl, alt
    // xterm: 35, _, 51, _
    // gnome: 32, 36, 48, 40
    // if (key.action === 'mousedown' && key.button === 'unknown') {
    if (b === 35 || b === 39 || b === 51 || b === 43
      || (state.isVTE && (b === 32 || b === 36 || b === 48 || b === 40))) {
      delete key.button;
      key.action = 'mousemove';
    }

    key.sequence = s;
    return key;
  }

  // DEC
  // The xterm mouse documentation says there is a
  // `<` prefix, the DECRQLP says there is no prefix.
  if ((parts = /^\x1b\[<(\d+;\d+;\d+;\d+)&w/.exec(s))) {
    params = parts[1].split(';');
    b = Number(params[0]);
    x = Number(params[1]);
    y = Number(params[2]);
    page = Number(params[3]);

    key.name = 'mouse';
    key.type = 'dec';

    key.raw = [b, x, y, parts[0]];
    key.buf = buf;
    key.x = x;
    key.y = y;
    key.page = page;

    if (state.zero) {
      key.x--;
      key.y--;
    }

    key.action = b === 3 ? 'mouseup' : 'mousedown';
    key.button = b === 2
      ? 'left' : b === 4
        ? 'middle' : b === 6
          ? 'right' : 'unknown';

    key.sequence = s;
    return key;
  }

  // vt300
  if ((parts = /^\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.exec(s))) {
    b = Number(parts[1]);
    x = Number(parts[2]);
    y = Number(parts[3]);

    key.name = 'mouse';
    key.type = 'vt300';

    key.raw = [b, x, y, parts[0]];
    key.buf = buf;
    key.x = x;
    key.y = y;

    if (state.zero) {
      key.x--;
      key.y--;
    }

    key.action = 'mousedown';
    key.button = b === 1 ? 'left' : b === 2 ? 'middle' : b === 5 ? 'right' : 'unknown';

    key.sequence = s;
    return key;
  }

  if ((parts = /^\x1b\[(O|I)/.exec(s))) {
    key.action = parts[1] === 'I' ? 'focus' : 'blur';
  }

  // s = key.sequence;
  // b = s.charCodeAt(3);
  key.x = s.charCodeAt(4) - 0o040;
  key.y = s.charCodeAt(5) - 0o040;

  key.scroll = 0;

  key.ctrl = Boolean(1 << 4 & b);
  key.meta = Boolean(1 << 3 & b);
  key.shift = Boolean(1 << 2 & b);

  key.release = (3 & b) === 3;

  if (1 << 6 & b) { //scroll
    key.scroll = 1 & b ? 1 : -1;
  }

  if (!key.release && !key.scroll) {
    key.button = b & 3;
  }

  key.sequence = s;
  return key;
};
