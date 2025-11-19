/*
 * Shared validation utilities for Journal Foundation Board Builder.
 * These functions are intentionally decoupled from the DOM to allow
 * unit testing in Node. The browser application will import them.
 */

/**
 * Validate card data against the provided schema. Returns an array of
 * human‑readable error messages for any constraint violations. When the
 * array is empty, the data is considered valid.
 *
 * @param {object} schema The meta‑schema object loaded from schema.json
 * @param {object} data The card data object keyed by field ids
 * @returns {string[]} An array of error messages
 */
function validateCardData(schema, data) {
  const errors = [];
  const fields = schema.fields;
  for (const field of fields) {
    const value = data[field.id];
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.label} is required`);
      continue;
    }
    if (value === undefined || value === null || value === '') continue;
    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') errors.push(`${field.label} must be a string`);
        if (field.maxLength && value.length > field.maxLength) errors.push(`${field.label} is too long`);
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) errors.push(`${field.label} must be a number`);
        if (field.min !== undefined && value < field.min) errors.push(`${field.label} must be ≥ ${field.min}`);
        if (field.max !== undefined && value > field.max) errors.push(`${field.label} must be ≤ ${field.max}`);
        break;
      case 'enum':
        if (!field.options.includes(value)) errors.push(`${field.label} must be one of: ${field.options.join(', ')}`);
        break;
      case 'multi-select':
        if (!Array.isArray(value)) errors.push(`${field.label} must be an array`);
        else {
          const invalid = value.filter((v) => !field.options.includes(v));
          if (invalid.length) errors.push(`${field.label} has invalid selections: ${invalid.join(', ')}`);
        }
        break;
      case 'list':
        if (!Array.isArray(value)) {
          errors.push(`${field.label} must be an array`);
        } else {
          const itemType = field.itemType || 'string';
          for (const entry of value) {
            if (itemType === 'url') {
              try {
                new URL(entry);
              } catch (e) {
                errors.push(`${field.label} contains an invalid URL`);
                break;
              }
            } else if (typeof entry !== 'string') {
              errors.push(`${field.label} entries must be text`);
              break;
            }
          }
        }
        break;
      case 'text':
        if (typeof value !== 'string') errors.push(`${field.label} must be text`);
        break;
      case 'url':
        try {
          new URL(value);
        } catch (e) {
          errors.push(`${field.label} contains invalid URL`);
        }
        break;
      default:
        // unknown types are ignored
        break;
    }
  }
  return errors;
}

module.exports = { validateCardData };