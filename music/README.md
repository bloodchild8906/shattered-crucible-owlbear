# Music & Ambience — Shattered Crucible v1.0.0

Build soundtrack cues from HTTPS audio URLs or locally stored audio files. Playback, looping and volume are local to this browser.

## Workflow

1. Install this module in Owlbear Rodeo using [manifest.json](manifest.json) and enable it in your room.
2. Open the module. Use **Overview** to browse entries, **Create** to add content, and item actions to interact.
3. Select **Settings** for importing and exporting Contract v1 JSON, refreshing the public repository, and local data controls.
4. Keep backups. Current user edits are held in this browser, not Owlbear metadata or a shared database.

## Module behavior

Owlbear's Assets API does not expose audio storage. Choose a local audio file (browser IndexedDB) or an HTTPS track. Playback is local-only.

## Common standards

- Data format: [Contract v1](../HOMEBREW_CONTRACT.md), authoritative [JSON Schema](../contracts/entries.schema.json).
- Static content: [asset catalog](../content/assets-catalog.json) and [homebrew registry](../content/homebrew-registry.json).
- User data: separate localStorage per module; imported audio uses IndexedDB.
- Entries from unrelated extensions are independent until explicit cross-extension synchronization is implemented.
- External input is rendered as escaped text; remote artwork and audio require HTTP(S) URLs.
