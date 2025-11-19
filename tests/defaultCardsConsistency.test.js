const assert = require('assert');
const schema = require('../schema.json');
const defaults = require('../default-cards.json');

test('default cards use only schema-defined categories', () => {
  const categoriesField = schema.fields.find((f) => f.id === 'categories');
  assert(categoriesField, 'Schema must define a "categories" field');

  const allowed = new Set(categoriesField.options);

  for (const card of defaults) {
    const cats = Array.isArray(card.data.categories) ? card.data.categories : [];
    for (const cat of cats) {
      assert(
        allowed.has(cat),
        `Card "${card.data.fullName}" (${card.cardId}) uses category "${cat}" not present in schema.options`
      );
    }
  }
});
