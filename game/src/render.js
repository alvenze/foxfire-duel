// render.js - draws FOXFIRE DUEL into the DOM: the title screen, the
// table (witch's hand face-down above, keeper's hand below), life and
// shield totals, the intent banner, and the win / loss screens.

import { KIND_STYLE, cardById } from "./cards.js";
import { witchIntent } from "./ai.js";

function cardEl(id, { faceDown = false, playable = false, onClick = null } = {}) {
  const el = document.createElement("div");
  el.className = "card";
  if (faceDown) {
    el.classList.add("card-back");
    el.innerHTML = `<div class="back-mark">✦</div><div class="back-name">FOXFIRE</div>`;
    return el;
  }
  const card = cardById(id);
  const style = KIND_STYLE[card.kind];
  el.style.setProperty("--kind", style.color);
  if (playable) el.classList.add("playable");
  el.innerHTML = `
    <div class="card-top"><span class="card-cost">${card.cost}</span>
      <span class="card-shape">${style.shape}</span></div>
    <div class="card-name">${card.name}</div>
    <div class="card-art">${style.shape}</div>
    <div class="card-text">${card.text}</div>
    <div class="card-kind">${style.label} · ${card.cost} Ember</div>`;
  if (onClick) el.addEventListener("click", onClick);
  return el;
}

function lifeBar(label, side) {
  return `<div class="life">
    <span class="life-label">${label}</span>
    <span class="life-num">♥ ${Math.max(0, side.life)}</span>
    <span class="shield-num">Shield ${side.shield}</span>
    <span class="deck-num">Deck ${side.deck.length}</span></div>`;
}

export function render(game, root, actions) {
  root.innerHTML = "";
  if (game.phase === "title") {
    root.innerHTML = `
      <section class="screen title-screen">
        <div class="title-fox">✦</div>
        <h1>FOXFIRE DUEL</h1>
        <p class="tagline">Out-charm the Mire Witch before her lanterns swallow yours.</p>
        <div class="title-cards"></div>
        <p class="rules-line">Each turn: 3 Ember. Strike her Life to 0, ward your own,
          and watch her Intent: she always shows her next move.</p>
        <button id="start-btn" class="big-btn">Light the Lanterns</button>
        <p class="hint">Mouse or keys 1-5 to play a card · Enter to end the turn</p>
      </section>`;
    const row = root.querySelector(".title-cards");
    for (const id of ["twin-fangs", "briar-wall", "moon-moth"]) row.append(cardEl(id));
    root.querySelector("#start-btn").addEventListener("click", actions.onStart);
    return;
  }
  if (game.phase === "won" || game.phase === "lost") {
    const won = game.phase === "won";
    root.innerHTML = `
      <section class="screen end-screen ${won ? "won" : "lost"}">
        <div class="title-fox">${won ? "✦" : "☾"}</div>
        <h1>${won ? "THE MARSH GOES QUIET" : "YOUR LANTERN GOES OUT"}</h1>
        <p class="tagline">${won
          ? `The Mire Witch's last lantern sinks on turn ${game.turn}. The foxfire is yours.`
          : `The Mire Witch out-charmed you on turn ${game.turn}. The marsh keeps your lantern.`}</p>
        <div class="end-stats">${lifeBar("Keeper", game.player)} ${lifeBar("Mire Witch", game.witch)}</div>
        <button id="again-btn" class="big-btn">Play Again</button>
      </section>`;
    root.querySelector("#again-btn").addEventListener("click", actions.onRestart);
    return;
  }
  const table = document.createElement("section");
  table.className = "screen table-screen";
  table.innerHTML = `
    <header class="side-row witch-row">
      <div class="side-head"><span class="side-name">THE MIRE WITCH</span>${lifeBar("", game.witch)}</div>
      <div class="hand hand-foe"></div>
    </header>
    <div class="intent">${witchIntent(game)}</div>
    <div class="log">${game.log.slice(-3).map((l) => `<div>${l}</div>`).join("")}</div>
    <footer class="side-row player-row">
      <div class="hand hand-player"></div>
      <div class="side-head"><span class="side-name">THE KEEPER (YOU)</span>${lifeBar("", game.player)}
        <span class="ember-num">Ember ${game.player.ember}</span>
        <span class="turn-num">Turn ${game.turn}</span>
        <button id="end-btn" class="end-btn">End Turn ⏎</button></div>
    </footer>`;
  const foeHand = table.querySelector(".hand-foe");
  for (const _ of game.witch.hand) foeHand.append(cardEl(null, { faceDown: true }));
  const myHand = table.querySelector(".hand-player");
  game.player.hand.forEach((id, i) => {
    const card = cardById(id);
    myHand.append(cardEl(id, {
      playable: card.cost <= game.player.ember && game.active === "player",
      onClick: () => actions.onPlayCard(i),
    }));
  });
  table.querySelector("#end-btn").addEventListener("click", actions.onEndTurn);
  root.append(table);
}
