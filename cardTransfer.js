const CARD_PACKAGE_TYPE = 'journal-card';
const CARD_PACKAGE_VERSION = '1.0';

function cloneCard(card) {
  const normalized = {
    cardId: card.cardId,
    image: card.image || '',
    data: card.data ? JSON.parse(JSON.stringify(card.data)) : {},
    notes: Array.isArray(card.notes) ? JSON.parse(JSON.stringify(card.notes)) : []
  };
  return normalized;
}

function createCardExportPayload(schemaId, schemaHash, card) {
  if (!schemaId || !schemaHash) {
    throw new Error('Schema information is required to export a card.');
  }
  if (!card || typeof card !== 'object') {
    throw new Error('A card must be provided for export.');
  }
  const payload = {
    packageType: CARD_PACKAGE_TYPE,
    packageVersion: CARD_PACKAGE_VERSION,
    schemaId,
    schemaHash,
    exportedAt: new Date().toISOString(),
    card: cloneCard(card)
  };
  return payload;
}

function normalizeImportedCardPackage(payload, options) {
  const { schemaId, schemaHash, existingCardIds = new Set(), generateId } = options || {};
  if (!payload || payload.packageType !== CARD_PACKAGE_TYPE) {
    throw new Error('Not a valid Journal Board card package.');
  }
  if (!schemaId || !schemaHash) {
    throw new Error('Current schema information is required.');
  }
  if (payload.schemaId !== schemaId) {
    throw new Error('Card was created for a different schema.');
  }
  if (payload.schemaHash !== schemaHash) {
    throw new Error('Card was created for a different schema version.');
  }
  if (!payload.card || typeof payload.card !== 'object') {
    throw new Error('Card data is missing from the package.');
  }
  const cloned = cloneCard(payload.card);
  if (!cloned.cardId || (existingCardIds && existingCardIds.has(cloned.cardId))) {
    if (typeof generateId !== 'function') {
      throw new Error('Cannot generate a replacement card id.');
    }
    let newId = generateId();
    while (existingCardIds && existingCardIds.has(newId)) {
      newId = generateId();
    }
    cloned.cardId = newId;
  }
  return cloned;
}

const api = {
  createCardExportPayload,
  normalizeImportedCardPackage,
  CARD_PACKAGE_TYPE,
  CARD_PACKAGE_VERSION
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else if (typeof window !== 'undefined') {
  window.CardTransfer = api;
}
