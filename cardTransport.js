(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CardTransport = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const CARD_BUNDLE_TYPE = 'journal-card';
  const CARD_BUNDLE_VERSION = 1;

  function cloneCard(card) {
    if (!card || typeof card !== 'object') {
      return { cardId: null, image: '', data: {}, notes: [] };
    }
    const cloned = {
      cardId: card.cardId || null,
      image: typeof card.image === 'string' ? card.image : '',
      data: card.data && typeof card.data === 'object' ? JSON.parse(JSON.stringify(card.data)) : {},
      notes: Array.isArray(card.notes) ? card.notes.map((note) => ({ ...note })) : []
    };
    return cloned;
  }

  function createCardExportBundle(schemaId, schemaHash, card) {
    if (!schemaId || !schemaHash) {
      throw new Error('schemaId and schemaHash are required to export a card');
    }
    if (!card || typeof card !== 'object') {
      throw new Error('A card object is required for export');
    }
    return {
      type: CARD_BUNDLE_TYPE,
      version: CARD_BUNDLE_VERSION,
      schemaId,
      schemaHash,
      exportedAt: new Date().toISOString(),
      card: cloneCard(card)
    };
  }

  function validateCardBundle(bundle, options = {}) {
    const errors = [];
    if (!bundle || typeof bundle !== 'object') {
      errors.push('Bundle must be an object');
      return { errors };
    }
    if (bundle.type !== CARD_BUNDLE_TYPE) {
      errors.push('Invalid bundle type');
    }
    if (bundle.version !== CARD_BUNDLE_VERSION) {
      errors.push('Unsupported bundle version');
    }
    if (options.schemaId && bundle.schemaId !== options.schemaId) {
      errors.push('Schema ID mismatch');
    }
    if (options.schemaHash && bundle.schemaHash !== options.schemaHash) {
      errors.push('Schema hash mismatch');
    }
    if (!bundle.card || typeof bundle.card !== 'object') {
      errors.push('Bundle is missing card data');
    }
    if (errors.length) {
      return { errors };
    }
    return { errors, card: cloneCard(bundle.card) };
  }

  function prepareImportedCard(bundle, options = {}) {
    const { schemaId, schemaHash, idGenerator, dataValidator } = options;
    const validation = validateCardBundle(bundle, { schemaId, schemaHash });
    if (validation.errors.length) {
      return validation;
    }
    const card = validation.card;
    const generator = typeof idGenerator === 'function' ? idGenerator : null;
    const preparedNotes = Array.isArray(card.notes)
      ? card.notes.map((note) => ({
          noteId: note && note.noteId ? note.noteId : generator ? generator() : undefined,
          text: note && typeof note.text === 'string' ? note.text : '',
          createdAt: note && note.createdAt ? note.createdAt : new Date().toISOString()
        }))
      : [];
    const preparedCard = {
      cardId: generator ? generator() : card.cardId,
      image: card.image || '',
      data: card.data && typeof card.data === 'object' ? JSON.parse(JSON.stringify(card.data)) : {},
      notes: preparedNotes
    };

    if (!preparedCard.cardId) {
      return { errors: ['Card is missing an identifier'] };
    }

    if (dataValidator) {
      const dataErrors = dataValidator(preparedCard.data);
      if (Array.isArray(dataErrors) && dataErrors.length) {
        return { errors: dataErrors };
      }
    }

    return { errors: [], card: preparedCard };
  }

  function slugifyFileName(name) {
    if (!name) return '';
    return name
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 80);
  }

  return {
    createCardExportBundle,
    validateCardBundle,
    prepareImportedCard,
    slugifyFileName
  };
});
