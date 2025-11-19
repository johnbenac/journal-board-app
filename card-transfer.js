(function (globalScope) {
  'use strict';

  function cloneCard(card) {
    return JSON.parse(JSON.stringify(card));
  }

  function ensureSchemaMeta(meta) {
    if (!meta || !meta.schemaId || !meta.schemaHash) {
      throw new Error('Schema metadata is required.');
    }
  }

  function defaultGenerateId() {
    return `card-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }

  function serializeCardExport(card, meta) {
    if (!card || typeof card !== 'object') {
      throw new Error('A card object is required for export.');
    }
    ensureSchemaMeta(meta);
    return {
      type: 'journal-card',
      schemaId: meta.schemaId,
      schemaHash: meta.schemaHash,
      exportedAt: new Date().toISOString(),
      card: cloneCard(card)
    };
  }

  function prepareImportedCard(payload, options) {
    options = options || {};
    ensureSchemaMeta(options);
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid card file.');
    }
    if (payload.schemaId !== options.schemaId || payload.schemaHash !== options.schemaHash) {
      throw new Error('Imported card does not match current schema.');
    }
    if (!payload.card || typeof payload.card !== 'object') {
      throw new Error('Card payload is missing card data.');
    }
    const card = cloneCard(payload.card);
    const generateId = typeof options.generateId === 'function' ? options.generateId : defaultGenerateId;
    const existingIds = new Set(options.existingCardIds || []);
    if (typeof card.cardId !== 'string' || !card.cardId.trim()) {
      card.cardId = generateId();
    }
    while (existingIds.has(card.cardId)) {
      card.cardId = generateId();
    }
    if (!Array.isArray(card.notes)) card.notes = [];
    if (typeof card.image !== 'string') card.image = '';
    if (typeof card.data !== 'object' || card.data === null) card.data = {};
    return card;
  }

  const api = {
    serializeCardExport,
    prepareImportedCard
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.CardTransfer = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
