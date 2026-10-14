# World Atlas — Shattered Crucible v1.0.0

Browse the illustrated Vhaldris atlas, reposition editable location pins, add lore and link scenes. Import the atlas through Owlbear's asset picker.

## Workflow

1. Install this module in Owlbear Rodeo using [manifest.json](manifest.json) and enable it in your room.
2. Open the module. Use **Overview** to browse entries, **Create** to add content, and item actions to interact.
3. Select **Settings** for importing and exporting Contract v1 JSON, refreshing the public repository, and local data controls.
4. Keep backups. Current user edits are held in this browser, not Owlbear metadata or a shared database.

## Module behavior

Location pins are draggable. Dragging and editing saves coordinates locally. The base atlas image comes from ../content/assets-catalog.json.

## Common standards

- Data format: [Contract v1](../HOMEBREW_CONTRACT.md), authoritative [JSON Schema](../contracts/entries.schema.json).
- Static content: [asset catalog](../content/assets-catalog.json) and [homebrew registry](../content/homebrew-registry.json).
- User data: separate localStorage per module; imported audio uses IndexedDB.
- Entries from unrelated extensions are independent until explicit cross-extension synchronization is implemented.
- External input is rendered as escaped text; remote artwork and audio require HTTP(S) URLs.
