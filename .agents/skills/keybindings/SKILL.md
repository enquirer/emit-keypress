---
name: keybindings
description: Create keybinding documentation for the editor specified by the user.
---

_If you haven't already, you must read AGENTS.md before continuing. Do not proceed until you have done so._

# Instructions

The user will specify an editor. Create or expand that editor's keybinding documentation in the repo (in the `./docs/editors/features/*.md` folder), following the same style and coverage used in the following:

- Atom keybindings documentation: `./docs/editors/features/atom.md`
- Brackets keybindings documentation: `./docs/editors/features/brackets.md`

The editor's docs should use its own terms, do not force a comparison frame to the above examples.

Research the editor's official documentation first. Prefer primary sources such as the editor's official docs, API references, or extension author guides. Use current sources when the editor is actively maintained.

The goal is to produce practical reference documentation for how keybindings work in that editor, not just a shortcut list.

## Required Coverage

Document the editor's keybinding system with sections equivalent to the Atom guide where they apply.

Include:

- A `## Keybindings` section if the file does not already have one.
- A `### tl;dr` section summarizing the keybinding system's main features and concepts.
- The keybinding data structure, schema, interface, or file shape used by the editor.
- Where user keybindings live.
- The concepts used to scope bindings, such as context, selectors, focus, scopes, modes, conditions, `when` clauses, or similar mechanisms.
- Whether bindings support command arguments, command IDs, conditionals, multi-stroke sequences, platform overrides, unbinding, or pass-through behavior.
- Several concrete keybinding examples.
- Whether custom extensions or plugins can contribute commands and keybindings.
- How custom-extension keybindings work, including the equivalents of `command`, `context`, `args`, `when`, selector, scope, or mode. Again, use the editor's own terms and concepts for this, not a comparison frame.
- Any major limitations or editor-specific quirks that matter to users or extension authors.


AGAIN, DO NOT WORD DESCRIPTIONS AS COMPARISONS. DO NOT SAY THINGS LIKE, "There is no `when` clause." DON'T DO THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!

## Writing the tl;dr section

Include the following points:

- Modifiers: Which modifier names and key notation the editor uses.
- Shortcuts: How a single keybinding is written.
- Chords: Whether multi-step bindings are supported and how they are written.
- Conditions: How bindings are scoped or made context-specific.
- Args: Whether bindings can pass command arguments.
- Platform: How platform-specific bindings or overrides are expressed.
- Removal: How a binding is unbound, disabled, or overridden.
- Extension bindings: How extensions or plugins contribute keybindings.
- Other features: Any major features that don't fit the above categories, such as pass-through behavior, special directive values, or custom keystroke normalization.

Don't describe features relative to other editors. Don't write as if you're speaking to the user, and don't break the 4th wall. Just state the facts about how the editor's keybinding system works, in a direct and matter-of-fact way.

## Writing Guidance

Write the documentation as a technical reference page.

- Be concrete and implementation-oriented.
- Use short explanatory paragraphs plus code examples.
- Prefer exact field names and syntax from the editor.
- If the editor has no way to accomplish conditions, selectors, etc., say that explicitly.
- Do not invent abstractions the editor does not use.
- If the editor supports multiple formats, show the primary one first.
- Make sure you mention any special features the editor has, related to keybindings, that are not covered by the above categories. This is perhaps the most important part of the documentation. Don't include setup or things outside of the editor's keybinding system itself. Only mention features within the keybinding system itself (Timeout support? Pass-through behavior? Special directive values? Custom keystroke normalization?).

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
