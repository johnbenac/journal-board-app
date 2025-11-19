const {
  createCardExportBundle,
  validateCardBundle,
  prepareImportedCard,
  slugifyFileName
} = require('../cardTransport');

const schemaId = 'journal.cards.v1';
const schemaHash = 'abc123';

function fakeCard() {
  return {
    cardId: 'card-1',
    image: '',
    data: { fullName: 'Test Person', tagline: 'Hello' },
    notes: [{ noteId: 'n1', text: 'Note 1', createdAt: '2023-01-01T00:00:00.000Z' }]
  };
}

test('createCardExportBundle wraps card data with metadata', () => {
  const card = fakeCard();
  const bundle = createCardExportBundle(schemaId, schemaHash, card);
  assert.strictEqual(bundle.type, 'journal-card');
  assert.strictEqual(bundle.schemaId, schemaId);
  assert.strictEqual(bundle.schemaHash, schemaHash);
  assert.ok(bundle.card);
  assert.notStrictEqual(bundle.card, card);
});

test('validateCardBundle rejects mismatched schema', () => {
  const bundle = createCardExportBundle(schemaId, schemaHash, fakeCard());
  const result = validateCardBundle(bundle, { schemaId: 'other', schemaHash });
  assert.deepStrictEqual(result.errors, ['Schema ID mismatch']);
});

test('prepareImportedCard regenerates identifiers and validates data', () => {
  const bundle = createCardExportBundle(schemaId, schemaHash, fakeCard());
  const generated = [];
  const result = prepareImportedCard(bundle, {
    schemaId,
    schemaHash,
    idGenerator: () => {
      const id = `generated-${generated.length + 1}`;
      generated.push(id);
      return id;
    },
    dataValidator: (data) => (data.fullName ? [] : ['Full name required'])
  });
  assert.deepStrictEqual(result.errors, []);
  assert.ok(result.card.cardId.startsWith('generated-'));
  assert.strictEqual(result.card.notes.length, 1);
  assert.ok(result.card.notes[0].noteId);
});

test('slugifyFileName trims and sanitizes names', () => {
  assert.strictEqual(slugifyFileName('  Hello World!!  '), 'hello-world');
});
