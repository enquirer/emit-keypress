export const features = [
  // Mouse modes - enable
  {
    name: 'enable_mouse_click',
    sequence: '\x1b[?1000h',
    description: 'Enable basic mouse click tracking',
    when: 'settings.mouse && !settings.mouse_motion'
  },
  {
    name: 'disable_mouse_click',
    sequence: '\x1b[?1000l',
    description: 'Disable basic mouse click tracking',
    when: 'settings.mouse && !settings.mouse_motion'
  },
  {
    name: 'enable_mouse_drag',
    sequence: '\x1b[?1002h',
    description: 'Enable mouse button-event tracking including clicks and drag',
    when: 'settings.mouse && settings.mouse_drag && !settings.mouse_motion'
  },
  {
    name: 'disable_mouse_drag',
    sequence: '\x1b[?1002l',
    description: 'Disable mouse button-event tracking including clicks and drag',
    when: 'settings.mouse && settings.mouse_drag && !settings.mouse_motion'
  },
  {
    name: 'enable_mouse_any',
    sequence: '\x1b[?1003h',
    description: 'Enable mouse any-event tracking including motion without buttons',
    when: 'settings.mouse && settings.mouse_motion'
  },
  {
    name: 'disable_mouse_any',
    sequence: '\x1b[?1003l',
    description: 'Disable mouse any-event tracking including motion without buttons',
    when: 'settings.mouse && settings.mouse_motion'
  },
  {
    name: 'enable_mouse_sgr',
    sequence: '\x1b[?1006h',
    description: 'Enable SGR extended mouse format supporting coordinates beyond 223',
    when: 'settings.mouse && caps.sgr_mouse'
  },
  {
    name: 'disable_mouse_sgr',
    sequence: '\x1b[?1006l',
    description: 'Disable SGR extended mouse format',
    when: 'settings.mouse && caps.sgr_mouse'
  },
  {
    name: 'enable_mouse_urxvt',
    sequence: '\x1b[?1015h',
    description: 'Enable urxvt extended mouse format as alternative to SGR',
    when: 'settings.mouse && !caps.sgr_mouse && caps.urxvt_mouse'
  },
  {
    name: 'disable_mouse_urxvt',
    sequence: '\x1b[?1015l',
    description: 'Disable urxvt extended mouse format',
    when: 'settings.mouse && !caps.sgr_mouse && caps.urxvt_mouse'
  },
  {
    name: 'enable_mouse_pixel',
    sequence: '\x1b[?1016h',
    description: 'Enable SGR pixel mouse mode for precise coordinates',
    when: 'settings.mouse && caps.sgr_pixel_mouse'
  },
  {
    name: 'disable_mouse_pixel',
    sequence: '\x1b[?1016l',
    description: 'Disable SGR pixel mouse mode',
    when: 'settings.mouse && caps.sgr_pixel_mouse'
  },

  // Cursor visibility
  {
    name: 'enable_cursor_visible',
    sequence: '\x1b[?25h',
    description: 'Show the terminal cursor',
    when: 'settings.show_cursor'
  },
  {
    name: 'disable_cursor_visible',
    sequence: '\x1b[?25l',
    description: 'Hide the terminal cursor',
    when: 'settings.show_cursor'
  },
  {
    name: 'enable_cursor_blink',
    sequence: '\x1b[?12h',
    description: 'Enable cursor blinking',
    when: 'settings.cursor_blink'
  },
  {
    name: 'disable_cursor_blink',
    sequence: '\x1b[?12l',
    description: 'Disable cursor blinking',
    when: 'settings.cursor_blink'
  },

  // Cursor shapes
  {
    name: 'cursor_default',
    sequence: '\x1b[0 q',
    description: 'Reset cursor to terminal default shape',
    when: 'settings.cursor_shape == default'
  },
  {
    name: 'cursor_block_blink',
    sequence: '\x1b[1 q',
    description: 'Blinking block cursor',
    when: 'settings.cursor_shape == block && settings.cursor_blink'
  },
  {
    name: 'cursor_block',
    sequence: '\x1b[2 q',
    description: 'Steady block cursor',
    when: 'settings.cursor_shape == block && !settings.cursor_blink'
  },
  {
    name: 'cursor_underline_blink',
    sequence: '\x1b[3 q',
    description: 'Blinking underline cursor',
    when: 'settings.cursor_shape == underline && settings.cursor_blink'
  },
  {
    name: 'cursor_underline',
    sequence: '\x1b[4 q',
    description: 'Steady underline cursor',
    when: 'settings.cursor_shape == underline && !settings.cursor_blink'
  },
  {
    name: 'cursor_bar_blink',
    sequence: '\x1b[5 q',
    description: 'Blinking bar cursor',
    when: 'settings.cursor_shape == bar && settings.cursor_blink'
  },
  {
    name: 'cursor_bar',
    sequence: '\x1b[6 q',
    description: 'Steady bar cursor',
    when: 'settings.cursor_shape == bar && !settings.cursor_blink'
  },

  // Screen buffer
  {
    name: 'enable_alt_screen',
    sequence: '\x1b[?1049h',
    description: 'Switch to alternate screen buffer with cursor save/restore',
    when: 'settings.alt_screen && caps.alt_screen'
  },
  {
    name: 'disable_alt_screen',
    sequence: '\x1b[?1049l',
    description: 'Switch back from alternate screen buffer with cursor restore',
    when: 'settings.alt_screen && caps.alt_screen'
  },
  {
    name: 'enable_alt_screen_legacy',
    sequence: '\x1b[?47h',
    description: 'Switch to alternate screen buffer without cursor save/restore',
    when: 'settings.alt_screen && !caps.alt_screen && caps.alt_screen_legacy'
  },
  {
    name: 'disable_alt_screen_legacy',
    sequence: '\x1b[?47l',
    description: 'Switch back from alternate screen buffer (legacy)',
    when: 'settings.alt_screen && !caps.alt_screen && caps.alt_screen_legacy'
  },
  {
    name: 'enable_alt_screen_clear',
    sequence: '\x1b[?1047h',
    description: 'Switch to alternate screen buffer that clears on exit',
    when: 'settings.alt_screen && settings.clear_on_exit && caps.alt_screen_clear'
  },
  {
    name: 'disable_alt_screen_clear',
    sequence: '\x1b[?1047l',
    description: 'Switch back from alternate screen buffer with clear',
    when: 'settings.alt_screen && settings.clear_on_exit && caps.alt_screen_clear'
  },

  // Focus
  {
    name: 'enable_focus_events',
    sequence: '\x1b[?1004h',
    description: 'Enable focus in/out event reporting',
    when: 'settings.focus_events && caps.focus_events'
  },
  {
    name: 'disable_focus_events',
    sequence: '\x1b[?1004l',
    description: 'Disable focus in/out event reporting',
    when: 'settings.focus_events && caps.focus_events'
  },

  // Synchronized output
  {
    name: 'enable_sync_output',
    sequence: '\x1b[?2026h',
    description: 'Begin buffering output to prevent flicker',
    when: 'settings.sync_output && caps.sync_output'
  },
  {
    name: 'disable_sync_output',
    sequence: '\x1b[?2026l',
    description: 'End output buffering and flush',
    when: 'settings.sync_output && caps.sync_output'
  },

  // Line wrapping
  {
    name: 'enable_auto_wrap',
    sequence: '\x1b[?7h',
    description: 'Enable auto-wrap lines at terminal edge',
    when: 'settings.auto_wrap'
  },
  {
    name: 'disable_auto_wrap',
    sequence: '\x1b[?7l',
    description: 'Disable auto-wrap lines at terminal edge',
    when: 'settings.auto_wrap'
  },

  // Application modes
  {
    name: 'enable_app_cursor_keys',
    sequence: '\x1b[?1h',
    description: 'Enable application cursor keys mode sending SS3 sequences',
    when: 'settings.app_cursor_keys'
  },
  {
    name: 'disable_app_cursor_keys',
    sequence: '\x1b[?1l',
    description: 'Disable application cursor keys mode',
    when: 'settings.app_cursor_keys'
  },
  {
    name: 'enable_app_keypad',
    sequence: '\x1b[?66h',
    description: 'Enable application keypad mode',
    when: 'settings.app_keypad'
  },
  {
    name: 'disable_app_keypad',
    sequence: '\x1b[?66l',
    description: 'Disable application keypad mode',
    when: 'settings.app_keypad'
  },
  {
    name: 'enable_app_keypad_alt',
    sequence: '\x1b=',
    description: 'Enable application keypad mode (alternate sequence)',
    when: 'settings.app_keypad'
  },
  {
    name: 'disable_app_keypad_alt',
    sequence: '\x1b>',
    description: 'Disable application keypad mode (alternate sequence)',
    when: 'settings.app_keypad'
  },

  // Paste bracket
  {
    name: 'enable_paste_bracket',
    sequence: '\x1b[?2004h',
    description: 'Enable bracketed paste mode',
    when: 'settings.paste_bracket && caps.paste_bracket'
  },
  {
    name: 'disable_paste_bracket',
    sequence: '\x1b[?2004l',
    description: 'Disable bracketed paste mode',
    when: 'settings.paste_bracket && caps.paste_bracket'
  },

  // Title
  {
    name: 'set_title',
    sequence: '\x1b]0;${title}\x07',
    description: 'Set window title and icon name',
    when: 'settings.set_title && caps.set_title'
  },
  {
    name: 'set_title_only',
    sequence: '\x1b]2;${title}\x07',
    description: 'Set window title without changing icon',
    when: 'settings.set_title && !settings.set_icon && caps.set_title'
  },
  {
    name: 'set_icon_only',
    sequence: '\x1b]1;${icon}\x07',
    description: 'Set icon name without changing title',
    when: 'settings.set_icon && caps.set_title'
  },
  {
    name: 'title_push',
    sequence: '\x1b[22;0t',
    description: 'Push current window title to stack',
    when: 'settings.set_title && caps.title_stack'
  },
  {
    name: 'title_pop',
    sequence: '\x1b[23;0t',
    description: 'Pop window title from stack',
    when: 'settings.set_title && caps.title_stack'
  },

  // Hyperlinks
  {
    name: 'hyperlink',
    sequence: '\x1b]8;;${url}\x07${text}\x1b]8;;\x07',
    description: 'Clickable hyperlink with visible text',
    when: 'settings.hyperlinks && caps.osc8'
  },
  {
    name: 'hyperlink_id',
    sequence: '\x1b]8;id=${id};${url}\x07${text}\x1b]8;;\x07',
    description: 'Clickable hyperlink with ID for multi-line links',
    when: 'settings.hyperlinks && caps.osc8'
  },

  // Notifications
  {
    name: 'notify_iterm',
    sequence: '\x1b]9;${message}\x07',
    description: 'Desktop notification for iTerm2 compatible terminals',
    when: 'settings.notifications && caps.osc9'
  },
  {
    name: 'notify_urxvt',
    sequence: '\x1b]777;notify;${title};${body}\x07',
    description: 'Desktop notification for urxvt compatible terminals',
    when: 'settings.notifications && caps.osc777'
  },
  {
    name: 'notify_kitty',
    sequence: '\x1b]99;i=1:d=0;${message}\x1b\\',
    description: 'Desktop notification for kitty terminal',
    when: 'settings.notifications && caps.osc99'
  },

  // Clipboard
  {
    name: 'clipboard_write',
    sequence: '\x1b]52;c;${base64_data}\x07',
    description: 'Write base64-encoded data to system clipboard',
    when: 'settings.clipboard && caps.osc52'
  },
  {
    name: 'clipboard_read',
    sequence: '\x1b]52;c;?\x07',
    description: 'Query clipboard contents from terminal',
    when: 'settings.clipboard && settings.clipboard_read && caps.osc52'
  },
  {
    name: 'clipboard_clear',
    sequence: '\x1b]52;c;\x07',
    description: 'Clear system clipboard',
    when: 'settings.clipboard && caps.osc52'
  },
  {
    name: 'primary_selection_write',
    sequence: '\x1b]52;p;${base64_data}\x07',
    description: 'Write base64-encoded data to primary selection',
    when: 'settings.clipboard && caps.osc52'
  },

  // Color queries
  {
    name: 'query_fg_color',
    sequence: '\x1b]10;?\x07',
    description: 'Query terminal foreground color',
    when: 'settings.detect_colors && caps.osc10'
  },
  {
    name: 'query_bg_color',
    sequence: '\x1b]11;?\x07',
    description: 'Query terminal background color',
    when: 'settings.detect_colors && caps.osc11'
  },
  {
    name: 'query_cursor_color',
    sequence: '\x1b]12;?\x07',
    description: 'Query terminal cursor color',
    when: 'settings.detect_colors && caps.osc12'
  },
  {
    name: 'set_fg_color',
    sequence: '\x1b]10;${color}\x07',
    description: 'Set terminal foreground color',
    when: 'settings.set_colors && caps.osc10'
  },
  {
    name: 'set_bg_color',
    sequence: '\x1b]11;${color}\x07',
    description: 'Set terminal background color',
    when: 'settings.set_colors && caps.osc11'
  },
  {
    name: 'set_cursor_color',
    sequence: '\x1b]12;${color}\x07',
    description: 'Set terminal cursor color',
    when: 'settings.set_colors && caps.osc12'
  },
  {
    name: 'reset_fg_color',
    sequence: '\x1b]110\x07',
    description: 'Reset terminal foreground color to default',
    when: 'settings.set_colors && caps.osc10'
  },
  {
    name: 'reset_bg_color',
    sequence: '\x1b]111\x07',
    description: 'Reset terminal background color to default',
    when: 'settings.set_colors && caps.osc11'
  },
  {
    name: 'reset_cursor_color',
    sequence: '\x1b]112\x07',
    description: 'Reset terminal cursor color to default',
    when: 'settings.set_colors && caps.osc12'
  },
  {
    name: 'set_palette_color',
    sequence: '\x1b]4;${index};${color}\x07',
    description: 'Set color palette entry at index (0-255)',
    when: 'settings.set_colors && caps.osc4'
  },
  {
    name: 'query_palette_color',
    sequence: '\x1b]4;${index};?\x07',
    description: 'Query color palette entry at index',
    when: 'settings.detect_colors && caps.osc4'
  },
  {
    name: 'reset_palette_color',
    sequence: '\x1b]104;${index}\x07',
    description: 'Reset color palette entry to default',
    when: 'settings.set_colors && caps.osc4'
  },
  {
    name: 'reset_all_palette',
    sequence: '\x1b]104\x07',
    description: 'Reset entire color palette to defaults',
    when: 'settings.set_colors && caps.osc4'
  },

  // Terminal queries
  {
    name: 'query_device_primary',
    sequence: '\x1b[c',
    description: 'Query primary device attributes for capability detection',
    when: 'settings.detect_caps'
  },
  {
    name: 'query_device_secondary',
    sequence: '\x1b[>c',
    description: 'Query secondary device attributes for terminal identification',
    when: 'settings.detect_caps && settings.detect_terminal'
  },
  {
    name: 'query_device_tertiary',
    sequence: '\x1b[=c',
    description: 'Query tertiary device attributes',
    when: 'settings.detect_caps && caps.da3'
  },
  {
    name: 'query_size_chars',
    sequence: '\x1b[18t',
    description: 'Query terminal size in characters',
    when: 'settings.query_size && caps.window_ops'
  },
  {
    name: 'query_size_pixels',
    sequence: '\x1b[14t',
    description: 'Query terminal size in pixels',
    when: 'settings.query_size_pixels && caps.window_ops'
  },
  {
    name: 'query_cell_size',
    sequence: '\x1b[16t',
    description: 'Query character cell size in pixels',
    when: 'settings.query_size_pixels && caps.window_ops'
  },
  {
    name: 'query_screen_chars',
    sequence: '\x1b[19t',
    description: 'Query screen size in characters',
    when: 'settings.query_size && caps.window_ops'
  },
  {
    name: 'query_terminal_name',
    sequence: '\x1b[>q',
    description: 'Query terminal name and version (XTVERSION)',
    when: 'settings.detect_terminal && caps.xtversion'
  },

  // Keyboard protocols
  {
    name: 'enable_kitty_keyboard',
    sequence: '\x1b[>1u',
    description: 'Enable Kitty progressive keyboard enhancement protocol',
    when: 'settings.enhanced_keyboard && caps.kitty_keyboard'
  },
  {
    name: 'disable_kitty_keyboard',
    sequence: '\x1b[<u',
    description: 'Disable Kitty progressive keyboard enhancement protocol',
    when: 'settings.enhanced_keyboard && caps.kitty_keyboard'
  },
  {
    name: 'enable_kitty_keyboard_full',
    sequence: '\x1b[>31u',
    description: 'Enable Kitty keyboard with all enhancements (disambiguate+report_event_types+report_alternate_keys+report_all_keys_as_escape_codes+report_associated_text)',
    when: 'settings.enhanced_keyboard && caps.kitty_keyboard'
  },
  {
    name: 'push_kitty_keyboard',
    sequence: '\x1b[>${flags}u',
    description: 'Push Kitty keyboard flags onto stack',
    when: 'settings.enhanced_keyboard && caps.kitty_keyboard'
  },
  {
    name: 'pop_kitty_keyboard',
    sequence: '\x1b[<${count}u',
    description: 'Pop Kitty keyboard flags from stack',
    when: 'settings.enhanced_keyboard && caps.kitty_keyboard'
  },
  {
    name: 'query_kitty_keyboard',
    sequence: '\x1b[?u',
    description: 'Query current Kitty keyboard enhancement flags',
    when: 'settings.enhanced_keyboard && caps.kitty_keyboard'
  },
  {
    name: 'enable_modify_other_keys',
    sequence: '\x1b[>4;1m',
    description: 'Enable xterm modifyOtherKeys mode level 1',
    when: 'settings.enhanced_keyboard && !caps.kitty_keyboard && caps.modify_other_keys'
  },
  {
    name: 'enable_modify_other_keys_2',
    sequence: '\x1b[>4;2m',
    description: 'Enable xterm modifyOtherKeys mode level 2 for enhanced key reporting',
    when: 'settings.enhanced_keyboard && !caps.kitty_keyboard && caps.modify_other_keys'
  },
  {
    name: 'disable_modify_other_keys',
    sequence: '\x1b[>4;0m',
    description: 'Disable xterm modifyOtherKeys mode',
    when: 'settings.enhanced_keyboard && !caps.kitty_keyboard && caps.modify_other_keys'
  },

  // Cursor position
  {
    name: 'cursor_save',
    sequence: '\x1b7',
    description: 'Save current cursor position and attributes (DECSC)',
    when: 'settings.cursor_save && caps.decsc'
  },
  {
    name: 'cursor_restore',
    sequence: '\x1b8',
    description: 'Restore saved cursor position and attributes (DECRC)',
    when: 'settings.cursor_save && caps.decsc'
  },
  {
    name: 'cursor_save_sco',
    sequence: '\x1b[s',
    description: 'Save cursor position SCO style',
    when: 'settings.cursor_save && !caps.decsc && caps.scosc'
  },
  {
    name: 'cursor_restore_sco',
    sequence: '\x1b[u',
    description: 'Restore cursor position SCO style',
    when: 'settings.cursor_save && !caps.decsc && caps.scosc'
  },
  {
    name: 'query_cursor_pos',
    sequence: '\x1b[6n',
    description: 'Query current cursor position (DSR)',
    when: 'settings.query_cursor && caps.dsr'
  },
  {
    name: 'query_cursor_pos_extended',
    sequence: '\x1b[?6n',
    description: 'Query cursor position with page number (DECRQCRA)',
    when: 'settings.query_cursor && caps.dsr'
  },

  // Cursor movement
  {
    name: 'cursor_up',
    sequence: '\x1b[${n}A',
    description: 'Move cursor up n rows',
    when: 'true'
  },
  {
    name: 'cursor_down',
    sequence: '\x1b[${n}B',
    description: 'Move cursor down n rows',
    when: 'true'
  },
  {
    name: 'cursor_forward',
    sequence: '\x1b[${n}C',
    description: 'Move cursor forward n columns',
    when: 'true'
  },
  {
    name: 'cursor_back',
    sequence: '\x1b[${n}D',
    description: 'Move cursor back n columns',
    when: 'true'
  },
  {
    name: 'cursor_next_line',
    sequence: '\x1b[${n}E',
    description: 'Move cursor to beginning of line n lines down',
    when: 'true'
  },
  {
    name: 'cursor_prev_line',
    sequence: '\x1b[${n}F',
    description: 'Move cursor to beginning of line n lines up',
    when: 'true'
  },
  {
    name: 'cursor_column',
    sequence: '\x1b[${n}G',
    description: 'Move cursor to column n',
    when: 'true'
  },
  {
    name: 'cursor_position',
    sequence: '\x1b[${row};${col}H',
    description: 'Move cursor to row and column',
    when: 'true'
  },
  {
    name: 'cursor_position_f',
    sequence: '\x1b[${row};${col}f',
    description: 'Move cursor to row and column (HVP)',
    when: 'true'
  },
  {
    name: 'cursor_home',
    sequence: '\x1b[H',
    description: 'Move cursor to home position (1,1)',
    when: 'true'
  },
  {
    name: 'cursor_tab_forward',
    sequence: '\x1b[${n}I',
    description: 'Move cursor forward n tab stops',
    when: 'true'
  },
  {
    name: 'cursor_tab_backward',
    sequence: '\x1b[${n}Z',
    description: 'Move cursor backward n tab stops',
    when: 'true'
  },

  // Screen clearing
  {
    name: 'clear_screen',
    sequence: '\x1b[2J',
    description: 'Clear entire screen',
    when: 'true'
  },
  {
    name: 'clear_screen_below',
    sequence: '\x1b[J',
    description: 'Clear screen from cursor to end',
    when: 'true'
  },
  {
    name: 'clear_screen_above',
    sequence: '\x1b[1J',
    description: 'Clear screen from start to cursor',
    when: 'true'
  },
  {
    name: 'clear_screen_scrollback',
    sequence: '\x1b[3J',
    description: 'Clear screen and scrollback buffer',
    when: 'caps.clear_scrollback'
  },
  {
    name: 'clear_line',
    sequence: '\x1b[2K',
    description: 'Clear entire current line',
    when: 'true'
  },
  {
    name: 'clear_line_right',
    sequence: '\x1b[K',
    description: 'Clear line from cursor to end',
    when: 'true'
  },
  {
    name: 'clear_line_left',
    sequence: '\x1b[1K',
    description: 'Clear line from start to cursor',
    when: 'true'
  },

  // Character operations
  {
    name: 'insert_chars',
    sequence: '\x1b[${n}@',
    description: 'Insert n blank characters at cursor',
    when: 'true'
  },
  {
    name: 'delete_chars',
    sequence: '\x1b[${n}P',
    description: 'Delete n characters at cursor',
    when: 'true'
  },
  {
    name: 'erase_chars',
    sequence: '\x1b[${n}X',
    description: 'Erase n characters at cursor',
    when: 'true'
  },
  {
    name: 'repeat_char',
    sequence: '\x1b[${n}b',
    description: 'Repeat preceding character n times',
    when: 'caps.rep'
  },

  // Line operations
  {
    name: 'insert_lines',
    sequence: '\x1b[${n}L',
    description: 'Insert n blank lines at cursor',
    when: 'true'
  },
  {
    name: 'delete_lines',
    sequence: '\x1b[${n}M',
    description: 'Delete n lines at cursor',
    when: 'true'
  },

  // Scrolling
  {
    name: 'scroll_up',
    sequence: '\x1b[${n}S',
    description: 'Scroll screen up by n lines',
    when: 'caps.scroll_region'
  },
  {
    name: 'scroll_down',
    sequence: '\x1b[${n}T',
    description: 'Scroll screen down by n lines',
    when: 'caps.scroll_region'
  },
  {
    name: 'set_scroll_region',
    sequence: '\x1b[${top};${bottom}r',
    description: 'Set scrolling region between top and bottom rows',
    when: 'settings.scroll_region && caps.scroll_region'
  },
  {
    name: 'reset_scroll_region',
    sequence: '\x1b[r',
    description: 'Reset scrolling region to full screen',
    when: 'settings.scroll_region && caps.scroll_region'
  },
  {
    name: 'set_scroll_margin_lr',
    sequence: '\x1b[${left};${right}s',
    description: 'Set left and right scroll margins',
    when: 'settings.scroll_region && caps.scroll_margin_lr'
  },

  // Origin mode
  {
    name: 'enable_origin_mode',
    sequence: '\x1b[?6h',
    description: 'Enable origin mode (cursor relative to scroll region)',
    when: 'settings.origin_mode'
  },
  {
    name: 'disable_origin_mode',
    sequence: '\x1b[?6l',
    description: 'Disable origin mode (cursor relative to screen)',
    when: 'settings.origin_mode'
  },

  // Insert/Replace mode
  {
    name: 'enable_insert_mode',
    sequence: '\x1b[4h',
    description: 'Enable insert mode',
    when: 'settings.insert_mode'
  },
  {
    name: 'disable_insert_mode',
    sequence: '\x1b[4l',
    description: 'Disable insert mode (replace mode)',
    when: 'settings.insert_mode'
  },

  // Tab stops
  {
    name: 'set_tab_stop',
    sequence: '\x1bH',
    description: 'Set tab stop at current column',
    when: 'true'
  },
  {
    name: 'clear_tab_stop',
    sequence: '\x1b[g',
    description: 'Clear tab stop at current column',
    when: 'true'
  },
  {
    name: 'clear_tab_stop_current',
    sequence: '\x1b[0g',
    description: 'Clear tab stop at current column',
    when: 'true'
  },
  {
    name: 'clear_all_tab_stops',
    sequence: '\x1b[3g',
    description: 'Clear all tab stops',
    when: 'true'
  },

  // Text attributes (SGR)
  {
    name: 'sgr_reset',
    sequence: '\x1b[0m',
    description: 'Reset all text attributes',
    when: 'true'
  },
  {
    name: 'sgr_bold',
    sequence: '\x1b[1m',
    description: 'Enable bold/bright text',
    when: 'true'
  },
  {
    name: 'sgr_dim',
    sequence: '\x1b[2m',
    description: 'Enable dim/faint text',
    when: 'true'
  },
  {
    name: 'sgr_italic',
    sequence: '\x1b[3m',
    description: 'Enable italic text',
    when: 'caps.italic'
  },
  {
    name: 'sgr_underline',
    sequence: '\x1b[4m',
    description: 'Enable underline',
    when: 'true'
  },
  {
    name: 'sgr_blink',
    sequence: '\x1b[5m',
    description: 'Enable slow blink',
    when: 'true'
  },
  {
    name: 'sgr_blink_rapid',
    sequence: '\x1b[6m',
    description: 'Enable rapid blink',
    when: 'caps.rapid_blink'
  },
  {
    name: 'sgr_reverse',
    sequence: '\x1b[7m',
    description: 'Enable reverse video',
    when: 'true'
  },
  {
    name: 'sgr_hidden',
    sequence: '\x1b[8m',
    description: 'Enable hidden/invisible text',
    when: 'true'
  },
  {
    name: 'sgr_strikethrough',
    sequence: '\x1b[9m',
    description: 'Enable strikethrough text',
    when: 'caps.strikethrough'
  },
  {
    name: 'sgr_double_underline',
    sequence: '\x1b[21m',
    description: 'Enable double underline',
    when: 'caps.double_underline'
  },
  {
    name: 'sgr_bold_off',
    sequence: '\x1b[22m',
    description: 'Disable bold and dim',
    when: 'true'
  },
  {
    name: 'sgr_italic_off',
    sequence: '\x1b[23m',
    description: 'Disable italic',
    when: 'true'
  },
  {
    name: 'sgr_underline_off',
    sequence: '\x1b[24m',
    description: 'Disable underline',
    when: 'true'
  },
  {
    name: 'sgr_blink_off',
    sequence: '\x1b[25m',
    description: 'Disable blink',
    when: 'true'
  },
  {
    name: 'sgr_reverse_off',
    sequence: '\x1b[27m',
    description: 'Disable reverse video',
    when: 'true'
  },
  {
    name: 'sgr_hidden_off',
    sequence: '\x1b[28m',
    description: 'Disable hidden text',
    when: 'true'
  },
  {
    name: 'sgr_strikethrough_off',
    sequence: '\x1b[29m',
    description: 'Disable strikethrough',
    when: 'true'
  },
  {
    name: 'sgr_overline',
    sequence: '\x1b[53m',
    description: 'Enable overline',
    when: 'caps.overline'
  },
  {
    name: 'sgr_overline_off',
    sequence: '\x1b[55m',
    description: 'Disable overline',
    when: 'caps.overline'
  },

  // Underline styles (kitty/VTE)
  {
    name: 'sgr_underline_single',
    sequence: '\x1b[4:1m',
    description: 'Single underline',
    when: 'caps.underline_style'
  },
  {
    name: 'sgr_underline_double',
    sequence: '\x1b[4:2m',
    description: 'Double underline',
    when: 'caps.underline_style'
  },
  {
    name: 'sgr_underline_curly',
    sequence: '\x1b[4:3m',
    description: 'Curly/wavy underline',
    when: 'caps.underline_style'
  },
  {
    name: 'sgr_underline_dotted',
    sequence: '\x1b[4:4m',
    description: 'Dotted underline',
    when: 'caps.underline_style'
  },
  {
    name: 'sgr_underline_dashed',
    sequence: '\x1b[4:5m',
    description: 'Dashed underline',
    when: 'caps.underline_style'
  },
  {
    name: 'sgr_underline_color',
    sequence: '\x1b[58:2::${r}:${g}:${b}m',
    description: 'Set underline color (RGB)',
    when: 'caps.underline_color'
  },
  {
    name: 'sgr_underline_color_indexed',
    sequence: '\x1b[58:5:${index}m',
    description: 'Set underline color (indexed)',
    when: 'caps.underline_color'
  },
  {
    name: 'sgr_underline_color_default',
    sequence: '\x1b[59m',
    description: 'Reset underline color to default',
    when: 'caps.underline_color'
  },

  // Foreground colors (basic)
  {
    name: 'sgr_fg_black',
    sequence: '\x1b[30m',
    description: 'Set foreground to black',
    when: 'true'
  },
  {
    name: 'sgr_fg_red',
    sequence: '\x1b[31m',
    description: 'Set foreground to red',
    when: 'true'
  },
  {
    name: 'sgr_fg_green',
    sequence: '\x1b[32m',
    description: 'Set foreground to green',
    when: 'true'
  },
  {
    name: 'sgr_fg_yellow',
    sequence: '\x1b[33m',
    description: 'Set foreground to yellow',
    when: 'true'
  },
  {
    name: 'sgr_fg_blue',
    sequence: '\x1b[34m',
    description: 'Set foreground to blue',
    when: 'true'
  },
  {
    name: 'sgr_fg_magenta',
    sequence: '\x1b[35m',
    description: 'Set foreground to magenta',
    when: 'true'
  },
  {
    name: 'sgr_fg_cyan',
    sequence: '\x1b[36m',
    description: 'Set foreground to cyan',
    when: 'true'
  },
  {
    name: 'sgr_fg_white',
    sequence: '\x1b[37m',
    description: 'Set foreground to white',
    when: 'true'
  },
  {
    name: 'sgr_fg_default',
    sequence: '\x1b[39m',
    description: 'Reset foreground to default',
    when: 'true'
  },

  // Background colors (basic)
  {
    name: 'sgr_bg_black',
    sequence: '\x1b[40m',
    description: 'Set background to black',
    when: 'true'
  },
  {
    name: 'sgr_bg_red',
    sequence: '\x1b[41m',
    description: 'Set background to red',
    when: 'true'
  },
  {
    name: 'sgr_bg_green',
    sequence: '\x1b[42m',
    description: 'Set background to green',
    when: 'true'
  },
  {
    name: 'sgr_bg_yellow',
    sequence: '\x1b[43m',
    description: 'Set background to yellow',
    when: 'true'
  },
  {
    name: 'sgr_bg_blue',
    sequence: '\x1b[44m',
    description: 'Set background to blue',
    when: 'true'
  },
  {
    name: 'sgr_bg_magenta',
    sequence: '\x1b[45m',
    description: 'Set background to magenta',
    when: 'true'
  },
  {
    name: 'sgr_bg_cyan',
    sequence: '\x1b[46m',
    description: 'Set background to cyan',
    when: 'true'
  },
  {
    name: 'sgr_bg_white',
    sequence: '\x1b[47m',
    description: 'Set background to white',
    when: 'true'
  },
  {
    name: 'sgr_bg_default',
    sequence: '\x1b[49m',
    description: 'Reset background to default',
    when: 'true'
  },

  // Bright foreground colors
  {
    name: 'sgr_fg_bright_black',
    sequence: '\x1b[90m',
    description: 'Set foreground to bright black',
    when: 'true'
  },
  {
    name: 'sgr_fg_bright_red',
    sequence: '\x1b[91m',
    description: 'Set foreground to bright red',
    when: 'true'
  },
  {
    name: 'sgr_fg_bright_green',
    sequence: '\x1b[92m',
    description: 'Set foreground to bright green',
    when: 'true'
  },
  {
    name: 'sgr_fg_bright_yellow',
    sequence: '\x1b[93m',
    description: 'Set foreground to bright yellow',
    when: 'true'
  },
  {
    name: 'sgr_fg_bright_blue',
    sequence: '\x1b[94m',
    description: 'Set foreground to bright blue',
    when: 'true'
  },
  {
    name: 'sgr_fg_bright_magenta',
    sequence: '\x1b[95m',
    description: 'Set foreground to bright magenta',
    when: 'true'
  },
  {
    name: 'sgr_fg_bright_cyan',
    sequence: '\x1b[96m',
    description: 'Set foreground to bright cyan',
    when: 'true'
  },
  {
    name: 'sgr_fg_bright_white',
    sequence: '\x1b[97m',
    description: 'Set foreground to bright white',
    when: 'true'
  },

  // Bright background colors
  {
    name: 'sgr_bg_bright_black',
    sequence: '\x1b[100m',
    description: 'Set background to bright black',
    when: 'true'
  },
  {
    name: 'sgr_bg_bright_red',
    sequence: '\x1b[101m',
    description: 'Set background to bright red',
    when: 'true'
  },
  {
    name: 'sgr_bg_bright_green',
    sequence: '\x1b[102m',
    description: 'Set background to bright green',
    when: 'true'
  },
  {
    name: 'sgr_bg_bright_yellow',
    sequence: '\x1b[103m',
    description: 'Set background to bright yellow',
    when: 'true'
  },
  {
    name: 'sgr_bg_bright_blue',
    sequence: '\x1b[104m',
    description: 'Set background to bright blue',
    when: 'true'
  },
  {
    name: 'sgr_bg_bright_magenta',
    sequence: '\x1b[105m',
    description: 'Set background to bright magenta',
    when: 'true'
  },
  {
    name: 'sgr_bg_bright_cyan',
    sequence: '\x1b[106m',
    description: 'Set background to bright cyan',
    when: 'true'
  },
  {
    name: 'sgr_bg_bright_white',
    sequence: '\x1b[107m',
    description: 'Set background to bright white',
    when: 'true'
  },

  // 256 color and RGB
  {
    name: 'sgr_fg_indexed',
    sequence: '\x1b[38;5;${index}m',
    description: 'Set foreground to indexed color (0-255)',
    when: 'caps.color256'
  },
  {
    name: 'sgr_bg_indexed',
    sequence: '\x1b[48;5;${index}m',
    description: 'Set background to indexed color (0-255)',
    when: 'caps.color256'
  },
  {
    name: 'sgr_fg_rgb',
    sequence: '\x1b[38;2;${r};${g};${b}m',
    description: 'Set foreground to RGB color',
    when: 'caps.truecolor'
  },
  {
    name: 'sgr_bg_rgb',
    sequence: '\x1b[48;2;${r};${g};${b}m',
    description: 'Set background to RGB color',
    when: 'caps.truecolor'
  },

  // Character sets
  {
    name: 'charset_utf8',
    sequence: '\x1b%G',
    description: 'Select UTF-8 character set',
    when: 'settings.utf8'
  },
  {
    name: 'charset_ascii',
    sequence: '\x1b%@',
    description: 'Select ASCII character set',
    when: 'true'
  },
  {
    name: 'charset_g0_ascii',
    sequence: '\x1b(B',
    description: 'Designate ASCII character set to G0',
    when: 'true'
  },
  {
    name: 'charset_g0_dec_graphics',
    sequence: '\x1b(0',
    description: 'Designate DEC special graphics to G0',
    when: 'true'
  },
  {
    name: 'charset_g1_ascii',
    sequence: '\x1b)B',
    description: 'Designate ASCII character set to G1',
    when: 'true'
  },
  {
    name: 'charset_g1_dec_graphics',
    sequence: '\x1b)0',
    description: 'Designate DEC special graphics to G1',
    when: 'true'
  },
  {
    name: 'charset_invoke_g0',
    sequence: '\x0f',
    description: 'Invoke G0 character set (SI)',
    when: 'true'
  },
  {
    name: 'charset_invoke_g1',
    sequence: '\x0e',
    description: 'Invoke G1 character set (SO)',
    when: 'true'
  },

  // Reverse screen mode
  {
    name: 'enable_reverse_screen',
    sequence: '\x1b[?5h',
    description: 'Enable reverse video screen mode',
    when: 'settings.reverse_screen'
  },
  {
    name: 'disable_reverse_screen',
    sequence: '\x1b[?5l',
    description: 'Disable reverse video screen mode',
    when: 'settings.reverse_screen'
  },

  // Sixel graphics
  {
    name: 'enable_sixel_scrolling',
    sequence: '\x1b[?80h',
    description: 'Enable sixel scrolling mode',
    when: 'caps.sixel'
  },
  {
    name: 'disable_sixel_scrolling',
    sequence: '\x1b[?80l',
    description: 'Disable sixel scrolling mode',
    when: 'caps.sixel'
  },
  {
    name: 'sixel_start',
    sequence: '\x1bPq',
    description: 'Start sixel image data',
    when: 'caps.sixel'
  },
  {
    name: 'sixel_end',
    sequence: '\x1b\\',
    description: 'End sixel image data',
    when: 'caps.sixel'
  },

  // iTerm2 graphics
  {
    name: 'iterm_image',
    sequence: '\x1b]1337;File=${params}:${base64_data}\x07',
    description: 'Display inline image (iTerm2 protocol)',
    when: 'caps.iterm_images'
  },

  // Kitty graphics
  {
    name: 'kitty_graphics',
    sequence: '\x1b_G${params};${payload}\x1b\\',
    description: 'Kitty graphics protocol command',
    when: 'caps.kitty_graphics'
  },

  // Working directory
  {
    name: 'set_working_directory',
    sequence: '\x1b]7;${uri}\x07',
    description: 'Set current working directory for shell integration',
    when: 'settings.shell_integration && caps.osc7'
  },

  // Shell integration marks
  {
    name: 'mark_prompt_start',
    sequence: '\x1b]133;A\x07',
    description: 'Mark start of shell prompt',
    when: 'settings.shell_integration && caps.osc133'
  },
  {
    name: 'mark_prompt_end',
    sequence: '\x1b]133;B\x07',
    description: 'Mark end of shell prompt (start of command)',
    when: 'settings.shell_integration && caps.osc133'
  },
  {
    name: 'mark_precmd',
    sequence: '\x1b]133;C\x07',
    description: 'Mark start of command output',
    when: 'settings.shell_integration && caps.osc133'
  },
  {
    name: 'mark_cmd_end',
    sequence: '\x1b]133;D;${exit_code}\x07',
    description: 'Mark end of command with exit code',
    when: 'settings.shell_integration && caps.osc133'
  },

  // Progress indication
  {
    name: 'progress_set',
    sequence: '\x1b]9;4;1;${percent}\x07',
    description: 'Set progress indicator percentage',
    when: 'caps.progress'
  },
  {
    name: 'progress_clear',
    sequence: '\x1b]9;4;0\x07',
    description: 'Clear progress indicator',
    when: 'caps.progress'
  },
  {
    name: 'progress_error',
    sequence: '\x1b]9;4;2;${percent}\x07',
    description: 'Set progress indicator with error state',
    when: 'caps.progress'
  },
  {
    name: 'progress_indeterminate',
    sequence: '\x1b]9;4;3\x07',
    description: 'Set indeterminate progress indicator',
    when: 'caps.progress'
  },

  // Bell
  {
    name: 'bell',
    sequence: '\x07',
    description: 'Terminal bell',
    when: 'true'
  },
  {
    name: 'enable_bell',
    sequence: '\x1b[?1042h',
    description: 'Enable audible bell',
    when: 'settings.bell'
  },
  {
    name: 'disable_bell',
    sequence: '\x1b[?1042l',
    description: 'Disable audible bell',
    when: 'settings.bell'
  },
  {
    name: 'enable_visual_bell',
    sequence: '\x1b[?1042l\x1b[?1043h',
    description: 'Enable visual bell (disable audible)',
    when: 'settings.visual_bell'
  },
  {
    name: 'set_bell_volume',
    sequence: '\x1b[${volume} t',
    description: 'Set bell volume (0=off, 1-8)',
    when: 'caps.bell_volume'
  },

  // Line feed mode
  {
    name: 'enable_newline_mode',
    sequence: '\x1b[20h',
    description: 'Enable newline mode (LF implies CR)',
    when: 'settings.newline_mode'
  },
  {
    name: 'disable_newline_mode',
    sequence: '\x1b[20l',
    description: 'Disable newline mode (normal)',
    when: 'settings.newline_mode'
  },

  // Print modes
  {
    name: 'print_screen',
    sequence: '\x1b[i',
    description: 'Print screen',
    when: 'caps.print'
  },
  {
    name: 'enable_print_mode',
    sequence: '\x1b[5i',
    description: 'Enable auto print mode',
    when: 'caps.print'
  },
  {
    name: 'disable_print_mode',
    sequence: '\x1b[4i',
    description: 'Disable auto print mode',
    when: 'caps.print'
  },
  {
    name: 'enable_printer_controller',
    sequence: '\x1b[?1h',
    description: 'Enable printer controller mode',
    when: 'caps.print'
  },
  {
    name: 'disable_printer_controller',
    sequence: '\x1b[?1l',
    description: 'Disable printer controller mode',
    when: 'caps.print'
  },

  // Soft font (DRCS)
  {
    name: 'define_soft_font',
    sequence: '\x1bP${params}{ ${data}\x1b\\',
    description: 'Define soft character set (DRCS)',
    when: 'caps.drcs'
  },

  // DECRQSS - request selection
  {
    name: 'request_sgr',
    sequence: '\x1bP$qm\x1b\\',
    description: 'Request current SGR attributes',
    when: 'caps.decrqss'
  },
  {
    name: 'request_decscl',
    sequence: '\x1bP$q"p\x1b\\',
    description: 'Request conformance level',
    when: 'caps.decrqss'
  },
  {
    name: 'request_decstbm',
    sequence: '\x1bP$qr\x1b\\',
    description: 'Request scroll region',
    when: 'caps.decrqss'
  },

  // XTWINOPS - window operations
  {
    name: 'minimize_window',
    sequence: '\x1b[2t',
    description: 'Minimize (iconify) window',
    when: 'caps.window_ops'
  },
  {
    name: 'restore_window',
    sequence: '\x1b[1t',
    description: 'Restore (de-iconify) window',
    when: 'caps.window_ops'
  },
  {
    name: 'move_window',
    sequence: '\x1b[3;${x};${y}t',
    description: 'Move window to x,y position',
    when: 'caps.window_ops'
  },
  {
    name: 'resize_window_pixels',
    sequence: '\x1b[4;${height};${width}t',
    description: 'Resize window to height,width in pixels',
    when: 'caps.window_ops'
  },
  {
    name: 'raise_window',
    sequence: '\x1b[5t',
    description: 'Raise window to front',
    when: 'caps.window_ops'
  },
  {
    name: 'lower_window',
    sequence: '\x1b[6t',
    description: 'Lower window to back',
    when: 'caps.window_ops'
  },
  {
    name: 'refresh_window',
    sequence: '\x1b[7t',
    description: 'Refresh window',
    when: 'caps.window_ops'
  },
  {
    name: 'resize_window_chars',
    sequence: '\x1b[8;${rows};${cols}t',
    description: 'Resize window to rows,cols in characters',
    when: 'caps.window_ops'
  },
  {
    name: 'maximize_window',
    sequence: '\x1b[9;1t',
    description: 'Maximize window',
    when: 'caps.window_ops'
  },
  {
    name: 'unmaximize_window',
    sequence: '\x1b[9;0t',
    description: 'Unmaximize window',
    when: 'caps.window_ops'
  },
  {
    name: 'fullscreen_window',
    sequence: '\x1b[10;1t',
    description: 'Enter fullscreen mode',
    when: 'caps.window_ops'
  },
  {
    name: 'exit_fullscreen_window',
    sequence: '\x1b[10;0t',
    description: 'Exit fullscreen mode',
    when: 'caps.window_ops'
  },
  {
    name: 'toggle_fullscreen',
    sequence: '\x1b[10;2t',
    description: 'Toggle fullscreen mode',
    when: 'caps.window_ops'
  },
  {
    name: 'query_window_state',
    sequence: '\x1b[11t',
    description: 'Query window state (iconified or not)',
    when: 'caps.window_ops'
  },
  {
    name: 'query_window_position',
    sequence: '\x1b[13t',
    description: 'Query window position',
    when: 'caps.window_ops'
  },
  {
    name: 'query_text_area_position',
    sequence: '\x1b[13;2t',
    description: 'Query text area position',
    when: 'caps.window_ops'
  },
  {
    name: 'report_icon_label',
    sequence: '\x1b[20t',
    description: 'Report icon label',
    when: 'caps.window_ops'
  },
  {
    name: 'report_window_title',
    sequence: '\x1b[21t',
    description: 'Report window title',
    when: 'caps.window_ops'
  },

  // Reset
  {
    name: 'soft_reset',
    sequence: '\x1b[!p',
    description: 'Soft terminal reset preserving screen contents',
    when: 'caps.decstr'
  },
  {
    name: 'full_reset',
    sequence: '\x1bc',
    description: 'Full terminal reset to initial state',
    when: 'true'
  },

  // Conformance level
  {
    name: 'set_conformance_vt100',
    sequence: '\x1b[61"p',
    description: 'Set conformance level to VT100',
    when: 'caps.decscl'
  },
  {
    name: 'set_conformance_vt200',
    sequence: '\x1b[62"p',
    description: 'Set conformance level to VT200',
    when: 'caps.decscl'
  },
  {
    name: 'set_conformance_vt300',
    sequence: '\x1b[63"p',
    description: 'Set conformance level to VT300',
    when: 'caps.decscl'
  },

  // Save/restore modes
  {
    name: 'save_dec_private_mode',
    sequence: '\x1b[?${mode}s',
    description: 'Save DEC private mode setting',
    when: 'caps.xtsave'
  },
  {
    name: 'restore_dec_private_mode',
    sequence: '\x1b[?${mode}r',
    description: 'Restore DEC private mode setting',
    when: 'caps.xtsave'
  },

  // Tektronix
  {
    name: 'enable_tek_mode',
    sequence: '\x1b[?38h',
    description: 'Enter Tektronix mode',
    when: 'caps.tek'
  },
  {
    name: 'disable_tek_mode',
    sequence: '\x1b[?38l',
    description: 'Exit Tektronix mode',
    when: 'caps.tek'
  },

  // Rectangular area operations
  {
    name: 'copy_rectangular_area',
    sequence: '\x1b[${top};${left};${bottom};${right};${page};${dest_top};${dest_left};${dest_page}$v',
    description: 'Copy rectangular area',
    when: 'caps.rect_ops'
  },
  {
    name: 'fill_rectangular_area',
    sequence: '\x1b[${char};${top};${left};${bottom};${right}$x',
    description: 'Fill rectangular area with character',
    when: 'caps.rect_ops'
  },
  {
    name: 'erase_rectangular_area',
    sequence: '\x1b[${top};${left};${bottom};${right}$z',
    description: 'Erase rectangular area',
    when: 'caps.rect_ops'
  },
  {
    name: 'selective_erase_rectangular_area',
    sequence: '\x1b[${top};${left};${bottom};${right}${',
    description: 'Selective erase rectangular area',
    when: 'caps.rect_ops'
  },

  // Checksum
  {
    name: 'checksum_rectangular_area',
    sequence: '\x1b[${id};${page};${top};${left};${bottom};${right}*y',
    description: 'Request checksum of rectangular area',
    when: 'caps.decrqcra'
  },

  // Locator (mouse) events
  {
    name: 'enable_locator',
    sequence: '\x1b[1?9h',
    description: 'Enable locator (mouse) reporting',
    when: 'caps.locator'
  },
  {
    name: 'disable_locator',
    sequence: '\x1b[1?9l',
    description: 'Disable locator (mouse) reporting',
    when: 'caps.locator'
  }
];
