const {
  createCardExportPayload,
  normalizeImportedCardPackage,
  CARD_PACKAGE_TYPE,
  CARD_PACKAGE_VERSION
} = require('../cardTransfer');

const baseSchemaId = 'journal.cards.v1';
const baseSchemaHash = 'abc123';

function sampleCard() {
  return {
    cardId: 'michelle-obama',
    image: '',
    data: { fullName: 'Michelle Obama' },
    notes: []
  };
}

test('createCardExportPayload wraps card with metadata', () => {
  const card = sampleCard();
  const payload = createCardExportPayload(baseSchemaId, baseSchemaHash, card);
  assert.strictEqual(payload.packageType, CARD_PACKAGE_TYPE);
  assert.strictEqual(payload.packageVersion, CARD_PACKAGE_VERSION);
  assert.strictEqual(payload.schemaId, baseSchemaId);
  assert.strictEqual(payload.schemaHash, baseSchemaHash);
  assert.notStrictEqual(payload.card, card);
  assert.deepStrictEqual(payload.card, card);
});

test('normalizeImportedCardPackage generates new id when duplicate', () => {
  const payload = createCardExportPayload(baseSchemaId, baseSchemaHash, sampleCard());
  const nextIds = ['new-id-1', 'new-id-2'];
  const result = normalizeImportedCardPackage(payload, {
    schemaId: baseSchemaId,
    schemaHash: baseSchemaHash,
    existingCardIds: new Set(['michelle-obama']),
    generateId: () => nextIds.shift()
  });
  assert.strictEqual(result.cardId, 'new-id-1');
});

test('normalizeImportedCardPackage rejects schema mismatch', () => {
  const payload = createCardExportPayload(baseSchemaId, baseSchemaHash, sampleCard());
  assert.throws(() => {
    normalizeImportedCardPackage(payload, {
      schemaId: 'other',
      schemaHash: baseSchemaHash,
      existingCardIds: new Set(),
      generateId: () => 'id'
    });
  }, /different schema/);
});
