const assert = require('assert');

const {
  diffSchemas,
  sanitizeValueForField,
  validateSchemaStructure,
  defaultValueForField
} = require('../schemaTools.js');

const baseSchema = {
  fields: [
    { id: 'fullName', label: 'Full Name', type: 'string' },
    { id: 'governance', label: 'Governance', type: 'number', min: 0, max: 10, radar: true }
  ],
  requiredCoreFields: ['fullName']
};

test('diffSchemas captures added and removed fields', () => {
  const next = {
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'string' },
      { id: 'governance', label: 'Governance', type: 'number', min: 0, max: 10, radar: true },
      { id: 'charisma', label: 'Charisma', type: 'number', min: 0, max: 10 }
    ],
    requiredCoreFields: ['fullName']
  };
  const plan = diffSchemas(baseSchema, next);
  assert.strictEqual(plan.added.length, 1);
  assert.strictEqual(plan.added[0].id, 'charisma');
  const reverse = diffSchemas(next, baseSchema);
  assert.strictEqual(reverse.removed.length, 1);
  assert.strictEqual(reverse.removed[0].id, 'charisma');
});

test('diffSchemas tracks type and enum option changes', () => {
  const oldSchema = {
    fields: [
      { id: 'availability', label: 'Availability', type: 'enum', options: ['Unknown', 'Warm'] }
    ],
    requiredCoreFields: []
  };
  const nextSchema = {
    fields: [
      { id: 'availability', label: 'Availability', type: 'multi-select', options: ['Unknown'] }
    ],
    requiredCoreFields: []
  };
  const plan = diffSchemas(oldSchema, nextSchema);
  assert.strictEqual(plan.typeChanged.length, 1);
  assert.strictEqual(plan.typeChanged[0].id, 'availability');
  assert.strictEqual(plan.enumOptionsRemoved.length, 1);
  assert.deepStrictEqual(plan.enumOptionsRemoved[0].removed, ['Warm']);
});

test('sanitizeValueForField enforces ranges and options', () => {
  const numberField = { id: 'score', type: 'number', min: 0, max: 5 };
  assert.strictEqual(sanitizeValueForField(numberField, 10), 5);
  assert.strictEqual(sanitizeValueForField(numberField, -3), 0);
  assert.strictEqual(sanitizeValueForField(numberField, 'not-a-number'), null);
  const multiField = { id: 'categories', type: 'multi-select', options: ['A', 'B'] };
  assert.deepStrictEqual(sanitizeValueForField(multiField, ['A', 'Z']), ['A']);
  const listField = { id: 'links', type: 'list', itemType: 'url' };
  assert.deepStrictEqual(
    sanitizeValueForField(listField, ['https://example.com', 'bad-url']),
    ['https://example.com']
  );
});

test('validateSchemaStructure catches missing ids and invalid requirements', () => {
  const invalidSchema = {
    fields: [
      { label: 'No id', type: 'string' },
      { id: 'brokenNumber', label: 'Broken Number', type: 'number', min: 5, max: 1 }
    ],
    requiredCoreFields: ['unknown']
  };
  const errors = validateSchemaStructure(invalidSchema);
  assert(errors.some((err) => err.includes('missing an id')));
  assert(errors.some((err) => err.includes('min greater than max')));
  assert(errors.some((err) => err.includes('requiredCoreFields entry')));
});

test('defaultValueForField returns sensible defaults', () => {
  assert.strictEqual(defaultValueForField({ type: 'string' }), '');
  assert.strictEqual(defaultValueForField({ type: 'number' }), null);
  assert.deepStrictEqual(defaultValueForField({ type: 'list' }), []);
});
