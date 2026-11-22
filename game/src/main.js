// main.js - wires FOXFIRE DUEL together: screens, input, turns, and the
// screenshot staging the maker uses (?shot=title|table|win|loss&seed=n
// deals a fixed game and shows that screen; it changes nothing in play).

import { createGame, startTurn, playCard, endPlayerTurn } from "./state.js";
import { runWitchTurn } from "./ai.js";
import { render } from "./render.js";

const root = document.getElementById("app");
const params = new URLSearchParams(location.search);
const seed = Number(params.get("seed") ?? 1);

let game = createGame(seed);

const actions = {
  onStart() {
    game.phase = "play";
    startTurn(game, "player");
    draw();
  },
  onRestart() {
    game = createGame(seed + game.turn);
    game.phase = "play";
    startTurn(game, "player");
    draw();
  },
  onPlayCard(i) {
    if (game.active !== "player" || game.phase !== "play") return;
    if (playCard(game, "player", i)) draw();
  },
  onEndTurn() {
    if (game.active !== "player" || game.phase !== "play") return;
    endPlayerTurn(game);
    runWitchTurn(game);
    if (game.phase === "play") {
      game.active = "player";
      game.turn += 1;
      startTurn(game, "player");
    }
    draw();
  },
};

function draw() {
  render(game, root, actions);
}

document.addEventListener("keydown", (e) => {
  if (game.phase === "title" && (e.key === "Enter" || e.key === " ")) actions.onStart();
  else if (game.phase === "play" && game.active === "player") {
    if (e.key === "Enter") actions.onEndTurn();
    const n = Number(e.key);
    if (n >= 1 && n <= 5) actions.onPlayCard(n - 1);
  } else if ((game.phase === "won" || game.phase === "lost") && e.key === "Enter") actions.onRestart();
});

// Screenshot staging: a fixed deal, mid-game for the table, a finished
// game for the end screens.
const shot = params.get("shot");
if (shot === "table" || shot === "win" || shot === "loss") {
  game.phase = "play";
  startTurn(game, "player");
  playCard(game, "player", 0);
  if (shot === "win") { game.witch.life = 0; game.phase = "won"; }
  if (shot === "loss") { game.player.life = 0; game.phase = "lost"; }
}
draw();
