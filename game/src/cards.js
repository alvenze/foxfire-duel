// cards.js - the FOXFIRE DUEL card pool.
// Every card has a cost in Ember, a kind told apart by colour and shape
// (strike = red diamond, ward = blue shield-drop, bloom = green leaf,
// trick = violet moon), and one clear effect the state module applies.

export const KIND_STYLE = {
  strike: { color: "#e2483d", shape: "◆", label: "Strike" },
  ward: { color: "#3d7de2", shape: "▼", label: "Ward" },
  bloom: { color: "#43b45a", shape: "❦", label: "Bloom" },
  trick: { color: "#9a5de2", shape: "☾", label: "Trick" },
};

export const CARD_POOL = [
  { id: "spark-imp", name: "Spark Imp", cost: 1, kind: "strike", damage: 3,
    text: "Deal 3 damage." },
  { id: "ember-bolt", name: "Ember Bolt", cost: 2, kind: "strike", damage: 4,
    text: "Deal 4 damage." },
  { id: "storm-crow", name: "Storm Crow", cost: 3, kind: "strike", damage: 5, draw: 1,
    text: "Deal 5 damage. Draw a card." },
  { id: "twin-fangs", name: "Twin Fangs", cost: 3, kind: "strike", damage: 6,
    text: "Deal 6 damage." },
  { id: "bark-ward", name: "Bark Ward", cost: 1, kind: "ward", shield: 5,
    text: "Gain 5 Shield." },
  { id: "briar-wall", name: "Briar Wall", cost: 2, kind: "ward", shield: 8,
    text: "Gain 8 Shield." },
  { id: "healing-herbs", name: "Healing Herbs", cost: 2, kind: "bloom", heal: 5,
    text: "Restore 5 Life." },
  { id: "ancient-oak", name: "Ancient Oak", cost: 4, kind: "bloom", damage: 4, heal: 4,
    text: "Deal 4 damage. Restore 4 Life." },
  { id: "dew-draw", name: "Dew Draw", cost: 1, kind: "trick", draw: 2,
    text: "Draw 2 cards." },
  { id: "moon-moth", name: "Moon Moth", cost: 0, kind: "trick", ember: 2,
    text: "Gain 2 Ember this turn." },
];

// A 22-card deck: two of most charms, one of the two big finishers.
export function buildDeck() {
  const counts = {
    "spark-imp": 3, "ember-bolt": 3, "storm-crow": 2, "twin-fangs": 2,
    "bark-ward": 3, "briar-wall": 2, "healing-herbs": 2, "ancient-oak": 1,
    "dew-draw": 2, "moon-moth": 2,
  };
  const deck = [];
  for (const card of CARD_POOL) {
    for (let i = 0; i < (counts[card.id] ?? 0); i++) deck.push(card.id);
  }
  return deck;
}

export function cardById(id) {
  return CARD_POOL.find((c) => c.id === id);
}
