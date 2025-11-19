(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SchemaTools = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  function defaultValueForField(field) {
    if (!field) return '';
    switch (field.type) {
      case 'number':
        return null;
      case 'multi-select':
      case 'list':
        return [];
      default:
        return '';
    }
  }

  function sanitizeValueForField(field, value) {
    if (!field) return value;
    if (value === undefined || value === null || value === '') {
      return defaultValueForField(field);
    }
    switch (field.type) {
      case 'number': {
        const num = typeof value === 'number' ? value : Number(value);
        if (!isNumber(num)) return null;
        let next = num;
        if (isNumber(field.min) && next < field.min) next = field.min;
        if (isNumber(field.max) && next > field.max) next = field.max;
        return next;
      }
      case 'enum':
        return Array.isArray(field.options) && field.options.includes(value) ? value : '';
      case 'multi-select':
        if (!Array.isArray(value)) return [];
        if (!Array.isArray(field.options)) return [];
        return value.filter((entry) => field.options.includes(entry));
      case 'list':
        if (!Array.isArray(value)) return [];
        if (field.itemType === 'url') {
          return value.filter((entry) => {
            if (typeof entry !== 'string') return false;
            try {
              new URL(entry);
              return true;
            } catch (err) {
              return false;
            }
          });
        }
        return value.map((entry) => String(entry));
      case 'url':
        try {
          const str = String(value);
          if (!str) return '';
          new URL(str);
          return str;
        } catch (err) {
          return '';
        }
      case 'string':
      case 'text':
      default: {
        let str = String(value);
        if (field.maxLength && str.length > field.maxLength) {
          str = str.slice(0, field.maxLength);
        }
        return str;
      }
    }
  }

  function validateSchemaStructure(schema) {
    const errors = [];
    if (!schema || typeof schema !== 'object') {
      errors.push('Schema must be an object.');
      return errors;
    }
    if (!Array.isArray(schema.fields)) {
      errors.push('Schema must include a fields array.');
      return errors;
    }
    const seenIds = new Set();
    schema.fields.forEach((field, index) => {
      if (!field || typeof field !== 'object') {
        errors.push(`Field at index ${index} must be an object.`);
        return;
      }
      if (!field.id || typeof field.id !== 'string') {
        errors.push(`Field at index ${index} is missing an id.`);
      } else if (seenIds.has(field.id)) {
        errors.push(`Duplicate field id "${field.id}".`);
      } else {
        seenIds.add(field.id);
      }
      if (!field.label || typeof field.label !== 'string') {
        errors.push(`Field "${field.id || index}" is missing a label.`);
      }
      if (!field.type) {
        errors.push(`Field "${field.id || index}" is missing a type.`);
      }
      if (field.type === 'number') {
        if (!isNumber(field.min) || !isNumber(field.max)) {
          errors.push(`Number field "${field.id}" must define numeric min and max values.`);
        } else if (field.min > field.max) {
          errors.push(`Number field "${field.id}" has min greater than max.`);
        }
      }
      if ((field.type === 'enum' || field.type === 'multi-select') && !Array.isArray(field.options)) {
        errors.push(`Field "${field.id}" must include options.`);
      }
      if (field.type === 'list' && !field.itemType) {
        errors.push(`List field "${field.id}" must define itemType.`);
      }
    });
    if (schema.requiredCoreFields !== undefined && !Array.isArray(schema.requiredCoreFields)) {
      errors.push('requiredCoreFields must be an array.');
    } else if (Array.isArray(schema.requiredCoreFields)) {
      const ids = new Set(schema.fields.map((f) => f.id));
      schema.requiredCoreFields.forEach((id) => {
        if (!ids.has(id)) {
          errors.push(`requiredCoreFields entry "${id}" does not match any field.`);
        }
      });
    }
    return errors;
  }

  function indexFields(fields) {
    const map = new Map();
    (fields || []).forEach((field) => {
      if (field && field.id) {
        map.set(field.id, field);
      }
    });
    return map;
  }

  function diffSchemas(oldSchema, newSchema) {
    const plan = {
      added: [],
      removed: [],
      typeChanged: [],
      itemTypeChanged: [],
      enumOptionsRemoved: [],
      rangeTightened: [],
      otherUpdates: [],
      metaChanges: []
    };
    if (!oldSchema || !newSchema) {
      return plan;
    }
    const oldMap = indexFields(oldSchema.fields || []);
    const newMap = indexFields(newSchema.fields || []);

    newMap.forEach((field, id) => {
      if (!oldMap.has(id)) {
        plan.added.push(field);
      }
    });
    oldMap.forEach((field, id) => {
      if (!newMap.has(id)) {
        plan.removed.push(field);
      }
    });

    oldMap.forEach((oldField, id) => {
      const next = newMap.get(id);
      if (!next) return;
      if (oldField.type !== next.type) {
        plan.typeChanged.push({ id, from: oldField.type, to: next.type });
      }
      if (next.type === 'list' && oldField.itemType !== next.itemType) {
        plan.itemTypeChanged.push({ id, from: oldField.itemType, to: next.itemType });
      }
      if ((next.type === 'enum' || next.type === 'multi-select') && Array.isArray(oldField.options) && Array.isArray(next.options)) {
        const removedOptions = oldField.options.filter((opt) => !next.options.includes(opt));
        if (removedOptions.length) {
          plan.enumOptionsRemoved.push({ id, removed: removedOptions });
        }
      }
      if (next.type === 'number') {
        const minTightened = isNumber(oldField.min) && isNumber(next.min) && next.min > oldField.min;
        const maxTightened = isNumber(oldField.max) && isNumber(next.max) && next.max < oldField.max;
        if (minTightened || maxTightened) {
          plan.rangeTightened.push({
            id,
            previous: { min: oldField.min, max: oldField.max },
            next: { min: next.min, max: next.max }
          });
        }
      }
      const changeList = [];
      if (oldField.label !== next.label) changeList.push('label');
      if (!!oldField.required !== !!next.required) changeList.push('required flag');
      if (!!oldField.cardFront !== !!next.cardFront) changeList.push('card front flag');
      if (!!oldField.radar !== !!next.radar) changeList.push('radar visibility');
      if ((oldField.boardAggregate || null) !== (next.boardAggregate || null)) changeList.push('board aggregate');
      if ((oldField.maxLength || null) !== (next.maxLength || null)) changeList.push('max length');
      if (changeList.length) {
        plan.otherUpdates.push({ id, changes: changeList });
      }
    });

    const oldDefaultSort = oldSchema.defaultSort || null;
    const newDefaultSort = newSchema.defaultSort || null;
    if (JSON.stringify(oldDefaultSort) !== JSON.stringify(newDefaultSort)) {
      plan.metaChanges.push('defaultSort');
    }
    if (JSON.stringify(oldSchema.requiredCoreFields || []) !== JSON.stringify(newSchema.requiredCoreFields || [])) {
      plan.metaChanges.push('requiredCoreFields');
    }

    return plan;
  }

  return {
    defaultValueForField,
    sanitizeValueForField,
    validateSchemaStructure,
    diffSchemas
  };
});
