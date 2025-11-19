const { prepareCardExportPayload } = require('../cardTransfer.js');
const schema = require('../schema.json');

function makeMinimalCard() {
  return {
    cardId: 'c-1',
    image: '',
    data: { fullName: 'John Doe' },
    notes: []
  };
}

test('schema-aware exports include every field plus hints and empties', () => {
  const payload = prepareCardExportPayload(
    { schemaId: schema.schemaId, schemaHash: 'hash123', schema },
    makeMinimalCard(),
    '2025-01-01T00:00:00.000Z'
  );

  const schemaFieldIds = schema.fields.map((f) => f.id);

  // data includes all fields
  schemaFieldIds.forEach((id) => {
    assert(Object.prototype.hasOwnProperty.call(payload.card.data, id));
  });

  // hints provided
  assert(payload.fieldHints);
  assert.strictEqual(payload.fieldHints.fullName.type, 'string');

  // empty fields include items without values
  assert(Array.isArray(payload.emptyFields));
  assert(payload.emptyFields.includes('tagline'));

  // still carries metadata
  assert.strictEqual(payload.version, '1.1');
  assert.strictEqual(payload.schemaId, schema.schemaId);
});
