(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    global.CardTransfer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function cloneCard(card) {
    return {
      cardId: card.cardId,
      image: card.image || '',
      data: JSON.parse(JSON.stringify(card.data || {})),
      notes: Array.isArray(card.notes)
        ? card.notes.map((note) => ({ ...note }))
        : []
    };
  }

  function prepareCardExportPayload(meta, card, exportedAt) {
    if (!meta || !card) {
      throw new Error('Missing metadata or card to export');
    }
    const timestamp = exportedAt || new Date().toISOString();
    return {
      type: 'journal-card',
      version: '1.0',
      schemaId: meta.schemaId,
      schemaHash: meta.schemaHash,
      exportedAt: timestamp,
      card: cloneCard(card)
    };
  }

  function prepareImportedCard(payload, options) {
    if (!options) throw new Error('Options are required for importing');
    const {
      schema,
      schemaHash,
      existingDeck = [],
      generateId,
      validator
    } = options;

    if (!payload || payload.type !== 'journal-card') {
      throw new Error('File is not a recognized Journal card export');
    }
    if (!schema || !schemaHash) {
      throw new Error('Active schema context is required');
    }
    if (!generateId || typeof generateId !== 'function') {
      throw new Error('A generateId function must be provided');
    }
    if (payload.schemaId !== schema.schemaId || payload.schemaHash !== schemaHash) {
      throw new Error('Imported card does not match the current schema.');
    }
    if (!payload.card || typeof payload.card !== 'object') {
      throw new Error('Imported file is missing card data.');
    }

    const cloned = cloneCard(payload.card);
    const cardData = cloned.data;
    if (!cardData || typeof cardData !== 'object') {
      throw new Error('Imported card data is invalid.');
    }

    if (validator) {
      const errors = validator(schema, cardData);
      if (errors.length) {
        throw new Error(`Card data failed validation: ${errors.join(', ')}`);
      }
    }

    if (!cardData.fullName) {
      throw new Error('Imported card is missing a full name.');
    }
    if (existingDeck.some((c) => c.data.fullName === cardData.fullName)) {
      throw new Error('A card with that full name already exists in this session.');
    }

    let cardId = cloned.cardId || generateId();
    if (existingDeck.some((c) => c.cardId === cardId)) {
      cardId = generateId();
    }

    return {
      cardId,
      image: typeof cloned.image === 'string' ? cloned.image : '',
      data: cardData,
      notes: Array.isArray(cloned.notes) ? cloned.notes : []
    };
  }

  return {
    prepareCardExportPayload,
    prepareImportedCard
  };
});
