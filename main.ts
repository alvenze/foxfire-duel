// FOXFIRE DUEL - hand-in program for make.fun's best card game bounty
// (Node 22, standard library only).
//
// The game itself is the static site in game/: index.html plus its ES
// modules under game/src/, no build step and no network. This program
// hands it in the way the bounty asks: copy game/ and screenshots/ from
// beside this file into the output directory (/output in the grader,
// $MAKEFUN_OUTPUT_DIR outside it) and write dossier.json there with
// buildDossier from the vendored make.fun library, under the scorer's
// own caps, so the dossier the judge reads is byte for byte the one the
// gate rebuilds.
//
// Try it locally:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the game with any static server rooted at game/.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(here, "game"), join(out, "game"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
