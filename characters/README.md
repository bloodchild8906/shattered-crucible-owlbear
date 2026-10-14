# Character Sheets — Shattered Crucible v1.0.0

Open a card-grid roster; edit character stats, feature lists, spell slots, inventory, contacts, notes and roll dice. Local saves and Contract v1 backups.

## Workflow

1. Install this module in Owlbear Rodeo using [manifest.json](manifest.json) and enable it in your room.
2. Open the module. Use **Overview** to browse entries, **Create** to add content, and item actions to interact.
3. Select **Settings** for importing and exporting Contract v1 JSON, refreshing the public repository, and local data controls.
4. Keep backups. Current user edits are held in this browser, not Owlbear metadata or a shared database.

## Module behavior

The roster is a card grid. Detail tabs include Overview, Forms, Features, Spells, Inventory, Contacts & Notes, Dice and Builder. It uses its own local storage rather than sharing dnd-chars-sheet's internal store.

## Common standards

- Data format: [Contract v1](../HOMEBREW_CONTRACT.md), authoritative [JSON Schema](../contracts/entries.schema.json).
- Static content: [asset catalog](../content/assets-catalog.json) and [homebrew registry](../content/homebrew-registry.json).
- User data: separate localStorage per module; imported audio uses IndexedDB.
- Entries from unrelated extensions are independent until explicit cross-extension synchronization is implemented.
- External input is rendered as escaped text; remote artwork and audio require HTTP(S) URLs.
