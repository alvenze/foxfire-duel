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

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

if (!existsSync(join(here, "game", "index.html"))) {
  throw new Error("game/index.html is missing beside main.ts; nothing to hand in");
}

mkdirSync(out, { recursive: true });
cpSync(join(here, "game"), join(out, "game"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// A zero-byte screenshot is a broken hand-in: the judge would be shown a
// blank frame where a screenshot of the game should be. Walk the copied
// screenshots and refuse to go on if any of them came through empty,
// naming the file so the bad copy is easy to find.
const copiedShotDir = join(out, "screenshots");
for (const name of readdirSync(copiedShotDir)) {
  if (statSync(join(copiedShotDir, name)).size === 0) {
    throw new Error(`copied screenshot ${name} is empty; the hand-in would show a blank frame`);
  }
}

// Guard against a truncated copy reaching the dossier step: the handed-in
// game is only playable if its entry page survived the copy and at least
// one module from game/src came along, so refuse to continue when either
// is absent from the output tree.
const copiedGameDir = join(out, "game");
const copiedModules = existsSync(join(copiedGameDir, "src"))
  ? readdirSync(join(copiedGameDir, "src")).filter((name) => name.endsWith(".js"))
  : [];
if (!existsSync(join(copiedGameDir, "index.html")) || copiedModules.length === 0) {
  throw new Error(
    "copy of game/ into the output directory is incomplete: index.html or every src module is missing",
  );
}

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, "dossier.json"), dossier);

// Why this cap check sits here, before the log line: the gate refuses
// any dossier over 1.5 MiB outright, so an oversized dossier scores
// nothing no matter how good the game is. Catching it at hand-in time
// turns a silent zero into a loud, fixable failure while the entry is
// still in our hands.
const dossierBytes = Buffer.byteLength(dossier);
if (dossierBytes > 1572864) {
  throw new Error(
    `dossier.json is ${dossierBytes} bytes, over the 1572864-byte cap`,
  );
}
const shotCount = readdirSync(join(out, "screenshots")).length;
const screenshotCount = shotCount;
// Count every file that landed in the copied game tree, so the run's own
// log line states the size of the hand-in at a glance.
const gameFileCount = readdirSync(copiedGameDir, { recursive: true }).filter(
  (name) => statSync(join(copiedGameDir, name)).isFile(),
).length;
// A real game is never a lone index.html: the entry page plus its modules
// and assets come to at least five files, so anything below that means
// the copy silently dropped most of the tree. Stop here with the count in
// the message instead of handing in a shell that cannot run.
if (gameFileCount < 5) {
  throw new Error(
    `copied game tree has only ${gameFileCount} files, expected at least 5; the copy is incomplete`,
  );
}
console.log(`foxfire-duel: game (${gameFileCount} files) + ${screenshotCount} screenshots copied, dossier ${dossierBytes} bytes`);
