# Public Homebrew Content Contract v1

**Registry URL:** https://bloodchild8906.github.io/shattered-crucible-owlbear/content/homebrew-registry.json

**Schemas:** [registry](contracts/registry.schema.json), [pack](contracts/pack.schema.json), [entries](contracts/entries.schema.json)

A consumer downloads the registry, resolves each `manifestUrl` against the registry URL, then resolves category file paths from each pack manifest URL. Entries receive a stable URI of the form `sc://{pack-id}/{category}/{entry-id}` (for example `sc://shattered-crucible-core/items/embershard`).

## Third-party publisher contract

1. Host a `pack.json` via HTTPS. It must include `contract: "sc.homebrew.pack"`, `schemaVersion: "1.0.0"`, a stable `id`, `version`, `name`, `publisher`, and a `data` object mapping categories to relative JSON file URLs.
2. Each category file must declare `contract: "sc.homebrew.entries"`, `schemaVersion: "1.0.0"`, matching `packId`, a matching `category`, and an `entries` array.
3. Preserve `id` values between updates. Any breaking schema changes require a new major schema version. Use SemVer for pack releases.
4. Reference another homebrew object by its stable `sc://` URI; never copy the definition into a character or shop record. If a definition disappears, retain the reference and show a missing-content notice.
5. Publishers must host their own art with appropriate usage rights. Consumers treat entry text as untrusted data, escape HTML and do not run supplied code.
6. To publish through this repository, submit a change to the registry `sources` array. Independent hosts may use their own registry instead; no central approval protocol is implied.
7. Content is read-only. Browser cache is for offline use and cannot act as multiplayer persistence. Player edits, notes, purchases and campaign state remain separate and must use an explicitly configured persistence service if cross-device sync is required.

## Client integration

Import `getHomebrew`, `refreshHomebrew`, `findHomebrew`, or `makeHomebrewRef` from `homebrew-contract.js`. `getHomebrew()` downloads on first use, uses a last-known-good browser cache when offline, and returns `{version,packs,entries,errors}`. `refreshHomebrew()` forces a new fetch.

Errors are reported per pack so a broken community pack cannot prevent the rest from loading. Source IDs and entry IDs use lowercase kebab-case. Pack and category documents have a 2 MiB size limit; requests have an eight-second timeout. HTTPS is enforced when served over HTTPS.

## Example

```json
{"contract":"sc.homebrew.pack","schemaVersion":"1.0.0","id":"my-publisher-pack","version":"1.0.0","name":"My Homebrew","publisher":{"id":"my-publisher","name":"My Publisher"},"data":{"items":"./items.json"}}
```

This version intentionally defines discovery, data and references, **not** executable D&D mechanics or automatic rule interpretation. Mechanical fields are descriptive/playtest metadata until individual extensions explicitly implement them.


## Mandatory import/export contract for every extension

**All seven extensions use the `sc.homebrew.entries` v1 envelope for manual JSON import and export.** Plain arrays and old unversioned backups are rejected. Conversion must be explicit; no silent fallbacks.

```json
{
  "contract": "sc.homebrew.entries",
  "schemaVersion": "1.0.0",
  "packId": "shattered-crucible-user",
  "category": "characters",
  "entries": [
    {"id": "vox", "name": "Vox", "type": "character", "level": 5}
  ]
}
```

| Extension | Required category |
| --- | --- |
| Compendium | `locations` |
| Homebrew Studio | `homebrew` |
| Character Sheets | `characters` |
| Scene Shops | `shops` |
| World Atlas | `atlas` |
| GM Journal | `journal` |
| Encounter Director | `encounters` |

`content-contract.js` exports `validateExchange`, `exportExchange`, `importExchange` and `exportText`. Inputs require a unique kebab-case entry ID, name and type for every record; extension category mismatches are rejected. A successful manual import asks for confirmation before replacing that extension's locally stored records.

The pack registry continues to import *read-only published homebrew definitions* from GitHub via `homebrew-contract.js`; user-edited records remain separate from published packs. Other developers should use these same schemas and stable `sc://pack/category/id` references. This contract does not imply cloud synchronization, permissions or automatic execution of mechanics.


## Enforced JSON Schema

The authoritative schema is [contracts/entries.schema.json](contracts/entries.schema.json). A generated JavaScript snapshot, `contract-schema.js`, is checked into the repository so extensions validate even when offline. `schema-validator.js` interprets the supported schema keywords; `content-contract.js` calls `assertSchema()` for every manual import/export and for data passed through the 5e.tools interpreter. Schema errors reject the entire import before replacing local records. Semantic checks additionally reject duplicate entry IDs and wrong extension categories.

When updating the contract, regenerate the snapshot from the JSON Schema and run `node schema.test.mjs`, `node contract.test.mjs`, `node suite.test.mjs` and `node fiveetools.test.mjs`. This does not provide full coverage of every JSON Schema 2020-12 feature: only the keywords used by this published schema are implemented. Changes that introduce new schema keywords must update the validator or adopt a full JSON Schema engine first.

### Extension installation manifests

Extension manifests are served at `https://bloodchild8906.github.io/shattered-crucible-owlbear/{extension-id}/manifest.json`. Registry entries contain site-root-relative locations such as `./compendium/manifest.json`, resolved against the Suite Manager's page URL, **not** the extension-registry JSON file in the `content/` directory. This distinction is important: resolving against the wrong base incorrectly points to `content/compendium/manifest.json`.
