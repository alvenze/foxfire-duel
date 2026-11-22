// state.js - FOXFIRE DUEL rules and game state. No DOM in here:
// create a game, play cards, run a side's turn, read the winner.

import { buildDeck, cardById } from "./cards.js";

export const START_LIFE = 20;
export const HAND_SIZE = 4;
export const EMBER_PER_TURN = 3;

// Small seeded shuffle so screenshot deals (?seed=) are stable.
export function shuffle(ids, seed) {
  const out = [...ids];
  let s = seed >>> 0 || 1;
  const next = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function makeSide(deck) {
  return { life: START_LIFE, shield: 0, ember: 0, deck, hand: [], discard: [] };
}

export function createGame(seed = 1) {
  const game = {
    turn: 1,
    phase: "title", // title | play | won | lost
    active: "player",
    log: [],
    player: makeSide(shuffle(buildDeck(), seed)),
    witch: makeSide(shuffle(buildDeck(), seed * 7 + 3)),
  };
  drawCards(game, "player", HAND_SIZE);
  drawCards(game, "witch", HAND_SIZE);
  return game;
}

export function drawCards(game, who, n) {
  const side = game[who];
  for (let i = 0; i < n; i++) {
    if (side.deck.length === 0) {
      side.deck = shuffle(side.discard, game.turn * 31 + side.hand.length);
      side.discard = [];
    }
    if (side.deck.length === 0) return;
    side.hand.push(side.deck.pop());
  }
}

export function startTurn(game, who) {
  const side = game[who];
  side.ember = EMBER_PER_TURN;
  drawCards(game, who, 1);
}

function dealDamage(game, target, amount) {
  const side = game[target];
  const absorbed = Math.min(side.shield, amount);
  side.shield -= absorbed;
  side.life -= amount - absorbed;
  return amount - absorbed;
}

// Play hand[index] for `who`. Returns a short event line, or null if illegal.
export function playCard(game, who, handIndex) {
  const side = game[who];
  const foeKey = who === "player" ? "witch" : "player";
  const id = side.hand[handIndex];
  if (id === undefined) return null;
  const card = cardById(id);
  if (card.cost > side.ember) return null;
  side.ember -= card.cost;
  side.hand.splice(handIndex, 1);
  side.discard.push(id);
  const name = who === "player" ? "You play" : "The Witch plays";
  const events = [`${name} ${card.name}.`];
  if (card.shield) {
    side.shield += card.shield;
    events.push(`+${card.shield} Shield.`);
  }
  if (card.heal) {
    const healed = Math.min(START_LIFE - side.life, card.heal);
    side.life += healed;
    events.push(`+${healed} Life.`);
  }
  if (card.ember) {
    side.ember += card.ember;
    events.push(`+${card.ember} Ember.`);
  }
  if (card.damage) {
    const through = dealDamage(game, foeKey, card.damage);
    events.push(`${card.damage} damage (${through} past Shield).`);
  }
  if (card.draw) {
    drawCards(game, who, card.draw);
    events.push(`Draw ${card.draw}.`);
  }
  game.log.push(...events);
  updatePhase(game);
  return events.join(" ");
}

export function updatePhase(game) {
  if (game.witch.life <= 0) game.phase = "won";
  else if (game.player.life <= 0) game.phase = "lost";
}

export function endPlayerTurn(game) {
  game.active = "witch";
}
