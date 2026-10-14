# Shattered Crucible v1.0 — Eleven extension suite

## Workflow
Install extensions individually from the [Suite Manager](./index.html). Each manifest is in its module directory and has its own icon and name. Each tool presents an Overview, Create and Settings navigation.

The common application is implemented in [suite-app.js](suite-app.js), [suite-views.js](suite-views.js) and [suite.css](suite.css). Each extension has a separate README and manifest.

## Content
61 published reference illustrations are indexed by [assets-catalog.json](content/assets-catalog.json). Published homebrew is loaded by the [registry](content/homebrew-registry.json). Scene shops are loaded from [scene-shops.json](content/scene-shops.json). Files are read-only input.

## Contract
[Contract v1](HOMEBREW_CONTRACT.md), [schema](contracts/entries.schema.json) and [schema validator](schema-validator.js) are required for all JSON imports and exports. All modules expose these operations in Settings, not the main toolbar.

## Persistence and multiplayer limitations
User changes and histories are browser-local. Sound files are stored in browser IndexedDB. They are not synchronized across players. Owlbear asset APIs upload **images and scenes**, not audio tracks. Shop location matching uses an Owlbear map item ID or map item name; the public SDK does not expose a scene name/ID. A manual selector allows fallback matching. It does not identify rooms across devices. GM journal content is local-only, not a server-enforced access control. Shareable handout URLs include the player-facing contents: anyone with the URL can read them.

## Character sheets
The new character module has a roster/card landing page, stats, HP, AC, dice, attacks, features, spells, inventory, forms, contacts, notes, and a builder. It does **not** share the internal storage model of the separate `dnd-chars-sheet` extension, nor does it claim full parity with its more advanced mechanics. Advanced attunement, concentration and form-based rules remain future work.

## Testing
- Node syntax checks for the new modules
- Per-module render smoke tests (11 modules)
- Strict Contract v1 round-trip tests (11 categories)
- 5e.tools interpreter test
- GitHub Pages HTTP/manifest/asset checks
- Live Owlbear room testing remains necessary for SDK-dependent asset imports and scene-token operations.

## Migration
Older browser records in `sc-suite/{module}` are copied to `shattered-crucible:v1:{module}` on first launch when no v1 data exists. Imported files and exports still enforce Contract v1.
