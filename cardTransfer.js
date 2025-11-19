(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    global.CardTransfer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function defaultBlankForField(field) {
    switch (field.type) {
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

  function isEmptyValue(value) {
    return (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    );
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
    const opts = Object.assign(
      {
        fillAllFields: !!(meta && meta.schema),
        includeFieldHints: !!(meta && meta.schema),
        includeEmptyFields: !!(meta && meta.schema)
      },
      options || {}
    );
    const timestamp = exportedAt || new Date().toISOString();
    const snapshot = cloneCard(card);

    let completeData = snapshot.data;
    let fieldHints;
    let emptyFields;
    let imageSpec;

    if (opts.fillAllFields && meta.schema && Array.isArray(meta.schema.fields)) {
      const filled = {};
      meta.schema.fields.forEach((field) => {
        const hasValue = Object.prototype.hasOwnProperty.call(snapshot.data, field.id);
        filled[field.id] = hasValue ? snapshot.data[field.id] : defaultBlankForField(field);
      });
      Object.keys(snapshot.data).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(filled, key)) {
          filled[key] = snapshot.data[key];
        }
      });
      completeData = filled;

      if (opts.includeFieldHints) {
        fieldHints = {};
        meta.schema.fields.forEach((field) => {
          const hint = { type: field.type };
          if (field.required) hint.required = true;
          if (field.cardFront) hint.cardFront = true;
          if (field.maxLength != null) hint.maxLength = field.maxLength;
          if (field.type === 'list' && field.itemType) hint.itemType = field.itemType;
          if (
            (field.type === 'enum' || field.type === 'multi-select') &&
            Array.isArray(field.options)
          ) {
            hint.options = field.options.slice();
          }
          if (field.type === 'number') {
            if (field.min != null) hint.min = field.min;
            if (field.max != null) hint.max = field.max;
          }
          if (field.radar) hint.radar = true;
          if (field.boardAggregate) hint.boardAggregate = field.boardAggregate;
          fieldHints[field.id] = hint;
        });
      }

      if (opts.includeEmptyFields) {
        emptyFields = meta.schema.fields.map((field) => field.id).filter((id) => {
          return isEmptyValue(completeData[id]);
        });
      }

      if (meta.schema.imageSpec) {
        imageSpec = meta.schema.imageSpec;
      }
    }

    return {
      type: 'journal-card',
      version: meta && meta.schema ? '1.1' : '1.0',
      schemaId: meta.schemaId,
      schemaHash: meta.schemaHash,
      exportedAt: timestamp,
      ...(fieldHints !== undefined ? { fieldHints } : {}),
      ...(emptyFields !== undefined ? { emptyFields } : {}),
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
