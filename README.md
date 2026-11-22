# foxfire-duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/alvenze/foxfire-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/alvenze/foxfire-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

Entry for the make.fun bounty "Make the best card game".

**FOXFIRE DUEL** is an original card duel. You are the Keeper of the
foxfire lanterns; across the marsh table sits the Mire Witch. Each turn
you get 3 Ember to play charms from a 22-card deck: Strikes (red ◆) burn
her Life, Wards (blue ▼) raise your Shield, Blooms (green ❦) heal and
smite, Tricks (violet ☾) draw cards or bank extra Ember. First Life to 0
loses. Her twist: she always declares her **Intent** before your turn,
so every hand is a decision about what to counter.

## Play

Serve `game/` with any static file server and open `index.html` in a
desktop browser. No build step, no network. Mouse clicks play cards, or
keys 1-5; Enter ends the turn (and starts or restarts on the other
screens).

## Layout

- `main.ts` - the hand-in program: copies `game/` and `screenshots/` to
  the output directory and writes `dossier.json` with the vendored
  library.
- `vendor/makefun-game.ts` - make.fun's dossier library, copied unchanged.
- `game/index.html`, `game/style.css` - the page and its marsh-night look.
- `game/src/cards.js` - the card pool and deck recipe.
- `game/src/state.js` - the rules: turns, Ember, Shield, damage, winning.
- `game/src/ai.js` - the Witch's policy and her declared Intent.
- `game/src/render.js` - the DOM table, hands, totals and end screens.
- `game/src/main.js` - input, turn flow, and screenshot staging
  (`?shot=title|table|win|loss&seed=n`, listed in `shots.json`).
- `screenshots/` - four renders of the game itself: title, table, win, loss.
