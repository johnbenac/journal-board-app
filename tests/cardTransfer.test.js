const { prepareCardExportPayload, prepareImportedCard } = require('../cardTransfer.js');
const { validateCardData } = require('../validation.js');
const schema = require('../schema.json');

function makeCard(overrides = {}) {
  return {
    cardId: overrides.cardId || 'card-1',
    image: overrides.image || '',
    data: {
      fullName: 'Test Person',
      tagline: 'Tag',
      categories: ['Technologist'],
      governance: 5,
      fundraising: 5,
      publicTrust: 5,
      opsExecution: 5,
      securityPrivacy: 5,
      legalCompliance: 5,
      intlNetwork: 5,
      mediaAgility: 5,
      signaturePowers: ['Leadership'],
      conflicts: '',
      availability: 'Unknown',
      sources: [],
      ...overrides.data
    },
    notes: overrides.notes || []
  };
}

test('prepareCardExportPayload captures schema metadata and card snapshot', () => {
  const card = makeCard();
  const payload = prepareCardExportPayload(
    { schemaId: schema.schemaId, schemaHash: 'hash123' },
    card,
    '2023-01-01T00:00:00.000Z'
  );
  assert.strictEqual(payload.type, 'journal-card');
  assert.strictEqual(payload.schemaId, schema.schemaId);
  assert.strictEqual(payload.schemaHash, 'hash123');
  assert.strictEqual(payload.card.data.fullName, 'Test Person');
  assert.notStrictEqual(payload.card, card, 'card payload should be cloned');
});

test('prepareCardExportPayload can include all schema fields with hints', () => {
  const minimalCard = {
    cardId: 'card-blank',
    image: '',
    data: { fullName: 'Only Name' },
    notes: []
  };
  const payload = prepareCardExportPayload(
    { schemaId: schema.schemaId, schemaHash: 'hash123', schema },
    minimalCard,
    '2024-01-01T00:00:00.000Z'
  );
  assert.strictEqual(payload.version, '1.1');
  schema.fields.forEach((field) => {
    assert(
      Object.prototype.hasOwnProperty.call(payload.card.data, field.id),
      `missing ${field.id}`
    );
  });
  assert(payload.fieldHints, 'fieldHints should be present');
  assert(payload.fieldHints.fullName.type, 'field hint missing type');
  assert(Array.isArray(payload.emptyFields), 'emptyFields should be present');
  assert(payload.emptyFields.includes('tagline'), 'emptyFields should track blank values');
});

test('prepareImportedCard validates schema and uniqueness before returning normalized card', () => {
  const card = makeCard();
  const payload = prepareCardExportPayload(
    { schemaId: schema.schemaId, schemaHash: 'hash123' },
    card,
    '2023-01-01T00:00:00.000Z'
  );
  const result = prepareImportedCard(payload, {
    schema,
    schemaHash: 'hash123',
    existingDeck: [],
    generateId: () => 'new-id',
    validator: validateCardData
  });
  assert.strictEqual(result.cardId, 'card-1');
  assert.strictEqual(result.data.fullName, 'Test Person');
});

test('prepareImportedCard rejects duplicate names and regenerates conflicting ids', () => {
  const card = makeCard();
  const payload = prepareCardExportPayload(
    { schemaId: schema.schemaId, schemaHash: 'hash123' },
    card,
    '2023-01-01T00:00:00.000Z'
  );
  // Duplicate name should throw
  assert.throws(() => {
    prepareImportedCard(payload, {
      schema,
      schemaHash: 'hash123',
      existingDeck: [makeCard()],
      generateId: () => 'collision',
      validator: validateCardData
    });
  }, /full name/);

  // Duplicate id but unique name should regenerate
  const payload2 = prepareCardExportPayload(
    { schemaId: schema.schemaId, schemaHash: 'hash123' },
    makeCard({ data: { fullName: 'Another Person' } }),
    '2023-01-01T00:00:00.000Z'
  );
  const generated = [];
  const result = prepareImportedCard(payload2, {
    schema,
    schemaHash: 'hash123',
    existingDeck: [makeCard({ data: { fullName: 'Existing' }, notes: [], cardId: 'card-1' })],
    generateId: () => {
      const id = `generated-${generated.length}`;
      generated.push(id);
      return id;
    },
    validator: validateCardData
  });
  assert.strictEqual(result.cardId, 'generated-0');
});

test('prepareImportedCard enforces schema compatibility', () => {
  const card = makeCard({ data: { fullName: 'Unique Person' } });
  const payload = prepareCardExportPayload(
    { schemaId: schema.schemaId, schemaHash: 'hash123' },
    card,
    '2023-01-01T00:00:00.000Z'
  );
  assert.throws(() => {
    prepareImportedCard(payload, {
      schema,
      schemaHash: 'different',
      existingDeck: [],
      generateId: () => 'id',
      validator: validateCardData
    });
  }, /does not match/);
});
