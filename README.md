# Shattered Crucible – Owlbear Rodeo Extension

[Live extension](https://bloodchild8906.github.io/shattered-crucible-owlbear/) · [Install manifest](https://bloodchild8906.github.io/shattered-crucible-owlbear/manifest.json)

A prototype toolkit with draggable atlas pins, scene URLs, character dice, a guided homebrew builder, and content galleries. It includes eleven named settlements and a small starter sample of homebrew entries.

## Installation

In Owlbear Rodeo, open your profile → Extensions → Add Extension and paste the install manifest URL above. Enable it in your room.

## Current limitations

- Pins can link to scene URLs but cannot command Owlbear to switch the active room scene.
- The separate `dnd-chars-sheet` extension must publish `com.dnd-chars-sheet/characters` room metadata before automatic character linking works. This repo does not modify that repo.
- Wizard content is descriptive and not automatically incorporated into gameplay mechanics or existing sheets.
- Illustrated codex currently shows category illustrations as fallbacks; add image URLs for custom entries. The other regional battle maps and original generated images are not yet hosted here.
- World map uses a stylized CSS background, not a finished geographic illustration. Room metadata has storage size limits, so export backup files.
- Owlbear runtime has not yet been tested inside an actual room; verify before depending on it for a session.

## Local development

No build dependencies. Open `index.html` locally for standalone preview or serve it via an HTTPS static server. Pages deploys automatically on commits to `main`.

## Shared integration

Read [INTEGRATION.md](INTEGRATION.md).
