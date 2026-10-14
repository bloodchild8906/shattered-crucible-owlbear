# dnd-chars-sheet integration contract

The Owlbear room metadata key is `com.dnd-chars-sheet/characters`. It should contain a compact array of entries:

```json
[{"id":"pc-1","name":"Vox","level":5,"className":"Druid","abilities":{"wis":18},"hitPoints":{"current":30,"maximum":38},"homebrewIds":["embershard"]}]
```

Shattered Crucible reads that key only. It saves its own state under `com.shatteredcrucible.toolkit/state`. The stable `id` fields are used for linking.

This is a *proposed contract*, not already implemented in the separate character-sheet repository. Hook the producer up there; future synchronization should include schema versioning and per-user permissions. Dice are rolled in the atlas toolkit at present; embedding them directly in the original sheet requires code changes in dnd-chars-sheet.
