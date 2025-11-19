(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    global.CardTransfer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function defaultBlankForField(field) {
    switch (field && field.type) {
      case 'number':
        return null;
      case 'multi-select':
      case 'list':
        return [];
      case 'enum':
        return '';
      case 'string':
      case 'text':
      case 'url':
      default:
        return '';
    }
  }

  function isEmptyValue(field, value) {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return false;
  }

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

  function prepareCardExportPayload(meta, card, exportedAt, options) {
    if (!meta || !card) {
      throw new Error('Missing metadata or card to export');
    }
    const timestamp = exportedAt || new Date().toISOString();
    const opts = Object.assign(
      {
        fillAllFields: !!(meta && meta.schema),
        includeFieldHints: !!(meta && meta.schema),
        includeEmptyFields: !!(meta && meta.schema)
      },
      options || {}
    );

    const snapshot = cloneCard(card);
    let completeData = snapshot.data;
    let fieldHints;
    let emptyFields;
    let imageSpec;

    const schemaFields = meta.schema && Array.isArray(meta.schema.fields) ? meta.schema.fields : null;
    if (schemaFields) {
      if (opts.fillAllFields) {
        const filled = {};
        schemaFields.forEach((field) => {
          const hasValue = Object.prototype.hasOwnProperty.call(snapshot.data, field.id);
          filled[field.id] = hasValue ? snapshot.data[field.id] : defaultBlankForField(field);
        });
        completeData = filled;
      }

      if (opts.includeFieldHints) {
        fieldHints = {};
        schemaFields.forEach((field) => {
          const hint = { type: field.type };
          if (field.required) hint.required = true;
          if (field.cardFront) hint.cardFront = true;
          if (field.maxLength != null) hint.maxLength = field.maxLength;
          if (field.maxItems != null) hint.maxItems = field.maxItems;
          if (field.itemType) hint.itemType = field.itemType;
          if ((field.type === 'enum' || field.type === 'multi-select') && Array.isArray(field.options)) {
            hint.options = field.options.slice();
          }
          if (field.type === 'number') {
            if (typeof field.min === 'number') hint.min = field.min;
            if (typeof field.max === 'number') hint.max = field.max;
          }
          if (field.radar) {
            hint.radar = true;
            if (field.boardAggregate) {
              hint.boardAggregate = field.boardAggregate;
            }
          }
          fieldHints[field.id] = hint;
        });
      }

      if (opts.includeEmptyFields) {
        emptyFields = schemaFields
          .filter((field) => isEmptyValue(field, completeData[field.id]))
          .map((field) => field.id);
      }

      if (meta.schema.imageSpec) {
        imageSpec = { ...meta.schema.imageSpec };
      }
    }

    const version = opts.fillAllFields ? '1.1' : '1.0';

    return {
      type: 'journal-card',
      version,
      schemaId: meta.schemaId,
      schemaHash: meta.schemaHash,
      exportedAt: timestamp,
      ...(fieldHints ? { fieldHints } : {}),
      ...(emptyFields ? { emptyFields } : {}),
      ...(imageSpec ? { imageSpec } : {}),
      card: {
        cardId: snapshot.cardId,
        image: snapshot.image || '',
        data: completeData,
        notes: snapshot.notes
      }
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
