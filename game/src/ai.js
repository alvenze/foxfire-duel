// ai.js - the Mire Witch's readable policy.
// Before her turn she declares an INTENT (shown to the player), then plays
// to match it: finish a dying keeper, hide behind wards when hurt, heal
// when desperate, otherwise press the attack with her priciest strike.

import { cardById } from "./cards.js";
import { playCard, startTurn } from "./state.js";

// The line the table shows during the player's turn: what she means to do.
export function witchIntent(game) {
  const witch = game.witch;
  const player = game.player;
  const strikes = witch.hand.map((id) => cardById(id)).filter((c) => c.damage);
  const bestHit = strikes.reduce((m, c) => Math.max(m, c.damage), 0);
  if (bestHit >= player.life + player.shield - player.shield && bestHit >= player.life)
    return `Intent: strike for ${bestHit} and end it`;
  if (witch.life <= 7) return "Intent: heal and hide behind wards";
  if (bestHit > 0) return `Intent: strike for ${bestHit}`;
  return "Intent: gather charms and ward up";
}

function pickIndex(game, predicate) {
  const witch = game.witch;
  let best = -1;
  let bestCost = -1;
  witch.hand.forEach((id, i) => {
    const card = cardById(id);
    if (card.cost <= witch.ember && predicate(card) && card.cost > bestCost) {
      best = i;
      bestCost = card.cost;
    }
  });
  return best;
}

// Play her whole turn, returning the event lines for the log.
export function runWitchTurn(game) {
  const lines = [];
  startTurn(game, "witch");
  let guard = 0;
  while (guard++ < 12) {
    const witch = game.witch;
    const player = game.player;
    let idx = -1;
    // Lethal first.
    idx = pickIndex(game, (c) => c.damage && c.damage >= player.life + Math.max(0, player.shield - 0) && c.damage - player.shield >= player.life);
    if (idx < 0 && witch.life <= 8) idx = pickIndex(game, (c) => c.heal > 0);
    if (idx < 0 && witch.life <= 10) idx = pickIndex(game, (c) => c.shield > 0);
    if (idx < 0) idx = pickIndex(game, (c) => c.ember > 0);
    if (idx < 0) idx = pickIndex(game, (c) => c.damage > 0);
    if (idx < 0) idx = pickIndex(game, (c) => c.draw > 0);
    if (idx < 0) idx = pickIndex(game, () => true);
    if (idx < 0) break;
    const line = playCard(game, "witch", idx);
    if (!line) break;
    lines.push(line);
    if (game.phase !== "play") break;
  }
  return lines;
}
