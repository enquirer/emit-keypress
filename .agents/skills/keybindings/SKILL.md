---
name: keybindings
description: Create keybinding documentation for the editor specified by the user.
---

The user will specify an editor. Create or expand that editor's keybinding documentation in the repo (in the `./docs/editors/features/*.md` folder), following the same style and coverage used for the Atom keybindings documentation in `./docs/editors/features/atom.md`.

Research the editor's official documentation first. Prefer primary sources such as the editor's official docs, API references, or extension author guides. Use current sources when the editor is actively maintained.

The goal is to produce practical reference documentation for how keybindings work in that editor, not just a shortcut list.

## Required Coverage

Document the editor's keybinding system with sections equivalent to the Atom guide where they apply.

Include:

- A `## Keybindings` section if the file does not already have one.
- The keybinding data structure, schema, interface, or file shape used by the editor.
- Where user keybindings live.
- The concepts used to scope bindings, such as context, selectors, focus, scopes, modes, conditions, `when` clauses, or similar mechanisms.
- Whether bindings support command arguments, command IDs, conditionals, multi-stroke sequences, platform overrides, unbinding, or pass-through behavior.
- Several concrete keybinding examples.
- Whether custom extensions or plugins can contribute commands and keybindings.
- How custom-extension keybindings work, including the equivalents of `command`, `context`, `args`, `when`, selector, scope, or mode.
- Any major limitations or editor-specific quirks that matter to users or extension authors.

## Writing Guidance

Write the documentation as a technical reference page.

- Be concrete and implementation-oriented.
- Use short explanatory paragraphs plus code examples.
- Prefer exact field names and syntax from the editor.
- If the editor has no equivalent to `when`, `args`, or selectors, say that explicitly.
- Do not invent abstractions the editor does not use.
- If the editor supports multiple formats, show the primary one first.

## Examples

Add examples that reflect the editor's real format. For example:

- JSON objects for editors that use JSON keybindings.
- Lua tables for editors that use Lua APIs.
- Vimscript or config snippets for modal editors.
- YAML, TOML, CSON, or JavaScript objects where applicable.

Examples should cover at least:

- A basic editor command binding.
- A context-specific binding.
- A custom extension or plugin command binding, if supported.

## Extension Guidance

If the editor supports extensions, explain:

- how an extension registers commands
- how an extension contributes keybindings
- where conditions or context are expressed
- whether command arguments are supported directly in keybindings

If the editor does not support extension-contributed keybindings, state that clearly.

## Editing Guidance

When applying this skill:

- Read the target editor feature file first.
- Preserve any existing sections that are not related to keybindings unless the user asked for broader edits.
- Replace placeholder text with real documentation.
- Keep the file consistent with the repo's Markdown style.
- If the editor already has a keybindings section, expand or rewrite it to meet the coverage above instead of appending a duplicate section.
