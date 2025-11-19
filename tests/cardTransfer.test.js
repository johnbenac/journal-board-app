const { serializeCardExport, prepareImportedCard } = require('../card-transfer');

const meta = { schemaId: 'journal.cards.v1', schemaHash: 'hash123' };

test('serializeCardExport includes schema metadata and clones card', () => {
  const card = { cardId: 'card-1', data: { fullName: 'Michelle' }, notes: [] };
  const payload = serializeCardExport(card, meta);
  assert.strictEqual(payload.schemaId, meta.schemaId);
  assert.strictEqual(payload.schemaHash, meta.schemaHash);
  assert.notStrictEqual(payload.card, card);
  assert.deepStrictEqual(payload.card, card);
  card.data.fullName = 'Changed';
  assert.strictEqual(payload.card.data.fullName, 'Michelle');
});

test('prepareImportedCard enforces schema and regenerates conflicting ids', () => {
  const cardPayload = {
    schemaId: meta.schemaId,
    schemaHash: meta.schemaHash,
    card: { cardId: 'existing', data: { fullName: 'John Doe' }, notes: ['note'] }
  };
  let counter = 0;
  const newCard = prepareImportedCard(cardPayload, {
    ...meta,
    existingCardIds: ['existing'],
    generateId: () => `generated-${++counter}`
  });
  assert.strictEqual(newCard.cardId, 'generated-1');
  assert.deepStrictEqual(newCard.data, { fullName: 'John Doe' });
  assert.deepStrictEqual(newCard.notes, ['note']);
});

test('prepareImportedCard throws on schema mismatch', () => {
  const payload = { schemaId: 'other', schemaHash: 'hash123', card: {} };
  assert.throws(() => {
    prepareImportedCard(payload, meta);
  });
});
