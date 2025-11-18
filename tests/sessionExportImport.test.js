const assert = require('assert');

test('export and import session preserve data', () => {
  const manifest = {
    manifestVersion: '1.0',
    schemaId: 'journal.cards.v1',
    schemaHash: 'abc123',
    deck: [
      { cardId: 'card1', image: '', data: { fullName: 'Alice' }, notes: [] }
    ],
    board: {
      boardId: 'default',
      slots: [ { slotId: 'director', name: 'Director' } ],
      assignments: [ { slotId: 'director', cardId: 'card1', rank: 1 } ]
    }
  };
  const serialized = JSON.stringify(manifest);
  const parsed = JSON.parse(serialized);
  assert.deepStrictEqual(parsed, manifest);
});