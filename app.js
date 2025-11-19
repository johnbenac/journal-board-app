// Define validateCardData here instead of importing to support running via the file protocol.
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
        } else if (field.itemType === 'url') {
          for (const entry of value) {
            try {
              new URL(entry);
            } catch (err) {
              errors.push(`${field.label} contains an invalid URL`);
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
        break;
    }
  }
  return errors;
}

// Embed the schema and default cards directly into the application to avoid
// network requests. When editing the schema or defaults, update these
// constants accordingly.
const EMBEDDED_SCHEMA = /** @type {any} */ (
  {
    "schemaName": "JournalBoardCardSchema",
    "schemaVersion": "2025-11-17",
    "schemaId": "journal.cards.v1",
    "imageSpec": {
      "format": "png",
      "width": 750,
      "height": 1050,
      "alphaAllowed": false
    },
    "fields": [
      {
        "id": "fullName",
        "label": "Full Name",
        "type": "string",
        "required": true,
        "unique": true,
        "cardFront": true
      },
      {
        "id": "tagline",
        "label": "Tagline",
        "type": "string",
        "maxLength": 140,
        "cardFront": true
      },
      {
        "id": "affiliations",
        "label": "Affiliations",
        "type": "list",
        "itemType": "string",
        "cardFront": false
      },
      {
        "id": "categories",
        "label": "Categories",
        "type": "multi-select",
        "options": [
          "Technologist",
          "Legal",
          "Civil Liberties",
          "Philanthropy",
          "Academia",
          "Policy",
          "Fundraising",
          "Operations",
          "Public Trust",
          "Security",
          "International"
        ],
        "cardFront": true
      },
      {
        "id": "governance",
        "label": "Governance",
        "type": "number",
        "min": 0,
        "max": 10,
        "radar": true,
        "boardAggregate": "max"
      },
      {
        "id": "fundraising",
        "label": "Fundraising",
        "type": "number",
        "min": 0,
        "max": 10,
        "radar": true,
        "boardAggregate": "sum"
      },
      {
        "id": "publicTrust",
        "label": "Public Trust",
        "type": "number",
        "min": 0,
        "max": 10,
        "radar": true,
        "boardAggregate": "max"
      },
      {
        "id": "opsExecution",
        "label": "Ops & Execution",
        "type": "number",
        "min": 0,
        "max": 10,
        "radar": true,
        "boardAggregate": "mean"
      },
      {
        "id": "securityPrivacy",
        "label": "Security & Privacy",
        "type": "number",
        "min": 0,
        "max": 10,
        "radar": true,
        "boardAggregate": "max"
      },
      {
        "id": "legalCompliance",
        "label": "Legal/Compliance",
        "type": "number",
        "min": 0,
        "max": 10,
        "radar": true,
        "boardAggregate": "max"
      },
      {
        "id": "intlNetwork",
        "label": "International Network",
        "type": "number",
        "min": 0,
        "max": 10,
        "radar": true,
        "boardAggregate": "max"
      },
      {
        "id": "mediaAgility",
        "label": "Media Agility",
        "type": "number",
        "min": 0,
        "max": 10,
        "radar": true,
        "boardAggregate": "max"
      },
      {
        "id": "signaturePowers",
        "label": "Signature Powers",
        "type": "list",
        "itemType": "string",
        "maxItems": 5
      },
      {
        "id": "conflicts",
        "label": "Conflicts of Interest",
        "type": "text"
      },
      {
        "id": "availability",
        "label": "Availability",
        "type": "enum",
        "options": [
          "Unknown",
          "Exploratory",
          "Warm",
          "Interested",
          "Committed"
        ]
      },
      {
        "id": "sources",
        "label": "Reference Links",
        "type": "list",
        "itemType": "url",
        "maxItems": 10
      }
    ],
    "requiredCoreFields": ["fullName"],
    "defaultSort": { "field": "publicTrust", "direction": "desc" }
  }
);

const EMBEDDED_DEFAULTS = /** @type {any[]} */ (
  [
    {
      "cardId": "michelle-obama",
      "data": {
        "fullName": "Michelle Obama",
        "tagline": "Advocate & attorney",
        "affiliations": [],
        "categories": ["Philanthropy", "Public Trust"],
        "governance": 9,
        "fundraising": 9,
        "publicTrust": 10,
        "opsExecution": 7,
        "securityPrivacy": 5,
        "legalCompliance": 7,
        "intlNetwork": 8,
        "mediaAgility": 9,
        "signaturePowers": ["Public inspiration", "Education advocacy"],
        "conflicts": "",
        "availability": "Unknown",
        "sources": []
      },
      "image": "",
      "notes": []
    },
    {
      "cardId": "alfred-nobel",
      "data": {
        "fullName": "Alfred Nobel",
        "tagline": "Inventor & philanthropist",
        "affiliations": [],
        "categories": ["Philanthropy", "Academia"],
        "governance": 6,
        "fundraising": 8,
        "publicTrust": 9,
        "opsExecution": 5,
        "securityPrivacy": 4,
        "legalCompliance": 6,
        "intlNetwork": 7,
        "mediaAgility": 5,
        "signaturePowers": ["Scientific innovation", "Global prize network"],
        "conflicts": "",
        "availability": "Unknown",
        "sources": []
      },
      "image": "",
      "notes": []
    },
    {
      "cardId": "oppenheimer",
      "data": {
        "fullName": "J. Robert Oppenheimer",
        "tagline": "Physicist & scientific leader",
        "affiliations": [],
        "categories": ["Academia", "Technologist"],
        "governance": 7,
        "fundraising": 4,
        "publicTrust": 7,
        "opsExecution": 8,
        "securityPrivacy": 3,
        "legalCompliance": 5,
        "intlNetwork": 6,
        "mediaAgility": 4,
        "signaturePowers": ["Scientific leadership", "Project management"],
        "conflicts": "",
        "availability": "Unknown",
        "sources": []
      },
      "image": "",
      "notes": []
    },
    {
      "cardId": "malala-yousafzai",
      "data": {
        "fullName": "Malala Yousafzai",
        "tagline": "Education & human rights advocate",
        "affiliations": [],
        "categories": ["Philanthropy", "Policy", "Public Trust"],
        "governance": 7,
        "fundraising": 8,
        "publicTrust": 10,
        "opsExecution": 6,
        "securityPrivacy": 4,
        "legalCompliance": 6,
        "intlNetwork": 9,
        "mediaAgility": 9,
        "signaturePowers": ["Global advocacy", "Education policy"],
        "conflicts": "",
        "availability": "Unknown",
        "sources": []
      },
      "image": "",
      "notes": []
    },
    {
      "cardId": "edward-snowden",
      "data": {
        "fullName": "Edward Snowden",
        "tagline": "Whistleblower & privacy advocate",
        "affiliations": [],
        "categories": ["Security", "Civil Liberties"],
        "governance": 4,
        "fundraising": 3,
        "publicTrust": 6,
        "opsExecution": 5,
        "securityPrivacy": 10,
        "legalCompliance": 2,
        "intlNetwork": 5,
        "mediaAgility": 7,
        "signaturePowers": ["Digital privacy", "Security expertise"],
        "conflicts": "",
        "availability": "Unknown",
        "sources": []
      },
      "image": "",
      "notes": []
    },
    {
      "cardId": "amal-clooney",
      "data": {
        "fullName": "Amal Clooney",
        "tagline": "Human rights barrister",
        "affiliations": [],
        "categories": ["Legal", "Civil Liberties", "International"],
        "governance": 8,
        "fundraising": 6,
        "publicTrust": 9,
        "opsExecution": 7,
        "securityPrivacy": 7,
        "legalCompliance": 10,
        "intlNetwork": 9,
        "mediaAgility": 8,
        "signaturePowers": ["Human rights law", "International diplomacy"],
        "conflicts": "",
        "availability": "Unknown",
        "sources": []
      },
      "image": "",
      "notes": []
    }
  ]
);

/*
 * Journal Foundation Board Builder
 *
 * This application is a self‑contained single page web application that helps users
 * create, edit and compare trading cards for potential board members. It enforces
 * a strict schema loaded from `schema.json` and stores all data in browser
 * localStorage. There is no backend and no network requests after initial asset
 * loading. Exporting and importing sessions is supported via JSON files.
 */

// Global state for the application
const state = {
  schema: null,
  schemaHash: null,
  manifest: null,
  compareSelection: new Set(), // UI-only selection (not persisted)
  compareMax: 5 // limit to keep the overlay readable
};

const cardTransfer = window.CardTransfer || null; // optional enhancement, not required

/**
 * Compute a SHA‑256 hash of a string and return a hex encoded digest.
 * @param {string} str
 * @returns {Promise<string>}
 */
async function computeHash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateSchemaDraft(schema) {
  const errors = [];
  if (!schema.fields || !Array.isArray(schema.fields) || !schema.fields.length) {
    errors.push('Schema must include at least one field.');
    return errors;
  }
  const ids = new Set();
  schema.fields.forEach((field) => {
    if (!field.id || !/^[a-zA-Z0-9_]+$/.test(field.id)) {
      errors.push(`Field "${field.label || field.id || 'unnamed'}" needs a simple alphanumeric id.`);
    } else if (ids.has(field.id)) {
      errors.push(`Duplicate field id "${field.id}".`);
    } else {
      ids.add(field.id);
    }
    if (!field.label) errors.push(`Field ${field.id || '(unknown)'} must have a label.`);
    if (field.type === 'number') {
      if (field.min === undefined || field.max === undefined) {
        errors.push(`Number field "${field.id}" must include min and max.`);
      } else if (field.min > field.max) {
        errors.push(`Field "${field.id}" has min greater than max.`);
      }
    }
    if ((field.type === 'enum' || field.type === 'multi-select')) {
      if (!Array.isArray(field.options) || !field.options.length) {
        errors.push(`Field "${field.id}" must define at least one option.`);
      }
    }
    if (field.type === 'list' && !field.itemType) {
      errors.push(`List field "${field.id}" must define an itemType.`);
    }
    if (field.radar && !['sum', 'mean', 'max'].includes(field.boardAggregate)) {
      errors.push(`Radar field "${field.id}" must define boardAggregate (sum, mean or max).`);
    }
  });
  (schema.requiredCoreFields || []).forEach((requiredId) => {
    if (!ids.has(requiredId)) {
      errors.push(`Required core field "${requiredId}" is missing from the schema.`);
    }
  });
  return errors;
}

function defaultValueForField(field) {
  switch (field.type) {
    case 'number':
      return null;
    case 'enum':
      return '';
    case 'multi-select':
    case 'list':
      return [];
    default:
      return '';
  }
}

async function hashSchema(schema) {
  return computeHash(JSON.stringify(schema));
}

function indexById(fields) {
  const map = new Map();
  fields.forEach((field) => map.set(field.id, field));
  return map;
}

function diffSchemas(oldSchema, newSchema) {
  const plan = {
    added: [],
    removed: [],
    typeChanged: [],
    itemTypeChanged: [],
    enumShrunk: [],
    rangeTightened: []
  };

  const oldMap = indexById(oldSchema.fields || []);
  const newMap = indexById(newSchema.fields || []);

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
    const newField = newMap.get(id);
    if (!newField) return;
    if (oldField.type !== newField.type) {
      plan.typeChanged.push({ id, from: oldField.type, to: newField.type });
    }
    if (newField.type === 'list' && oldField.itemType !== newField.itemType) {
      plan.itemTypeChanged.push({ id, from: oldField.itemType, to: newField.itemType });
    }
    if (
      (newField.type === 'enum' || newField.type === 'multi-select') &&
      Array.isArray(oldField.options) &&
      Array.isArray(newField.options)
    ) {
      const removed = oldField.options.filter((opt) => !newField.options.includes(opt));
      if (removed.length) {
        plan.enumShrunk.push({ id, removedOptions: removed });
      }
    }
    if (newField.type === 'number' && (oldField.min !== newField.min || oldField.max !== newField.max)) {
      const tightened = (newField.min ?? Number.NEGATIVE_INFINITY) > (oldField.min ?? Number.NEGATIVE_INFINITY) ||
        (newField.max ?? Number.POSITIVE_INFINITY) < (oldField.max ?? Number.POSITIVE_INFINITY);
      if (tightened) {
        plan.rangeTightened.push({ id, old: { min: oldField.min, max: oldField.max }, next: { min: newField.min, max: newField.max } });
      }
    }
  });

  return plan;
}

function convertOrReset(field, value) {
  if (value === undefined || value === null || value === '') return value;
  switch (field.type) {
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value) ? value : null;
    case 'string':
    case 'text':
    case 'url':
      return typeof value === 'string' ? value : '';
    case 'enum':
      return field.options.includes(value) ? value : '';
    case 'multi-select':
      return Array.isArray(value) ? value.filter((v) => field.options.includes(v)) : [];
    case 'list':
      if (!Array.isArray(value)) return [];
      if (field.itemType === 'url') {
        return value.filter((entry) => {
          try {
            new URL(entry);
            return true;
          } catch (err) {
            return false;
          }
        });
      }
      return value.filter((entry) => typeof entry === 'string');
    default:
      return value;
  }
}

function clampIfNeeded(field, value) {
  if (field.type !== 'number') return value;
  if (value === undefined || value === null || Number.isNaN(value)) return null;
  const min = field.min ?? 0;
  const max = field.max ?? 10;
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return null;
  return Math.min(max, Math.max(min, num));
}

// No network load: JSON assets are embedded. loadJson remains unused.

/**
 * Initialize the application: load schema, compute hash, load or create a session.
 */
async function init() {
  const baselineSchema = EMBEDDED_SCHEMA;
  const baselineHash = await computeHash(JSON.stringify(baselineSchema));

  let manifest = null;
  let needsSave = false;

  const stored = localStorage.getItem('jf_session');
  if (stored) {
    try {
      manifest = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored session', e);
    }
  }

  if (manifest && manifest.schema && manifest.schemaHash) {
    state.schema = manifest.schema;
    state.schemaHash = manifest.schemaHash;
  } else {
    state.schema = baselineSchema;
    state.schemaHash = baselineHash;
  }

  if (!manifest || !manifest.deck) {
    const defaults = EMBEDDED_DEFAULTS;
    const deck = defaults.map((card) => ({
      cardId: card.cardId || generateId(),
      image: card.image || '',
      data: card.data,
      notes: card.notes || []
    }));
    manifest = {
      manifestVersion: '1.0',
      appVersion: '0.1',
      schemaId: state.schema.schemaId,
      schemaHash: state.schemaHash,
      schema: state.schema,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deck,
      board: {
        boardId: 'default',
        slots: [
          { slotId: generateId(), name: 'Director' },
          { slotId: generateId(), name: 'Secretary' },
          { slotId: generateId(), name: 'Treasurer' }
        ],
        assignments: []
      }
    };
    needsSave = true;
  } else {
    if (!manifest.schema && manifest.schemaHash === baselineHash) {
      manifest.schema = baselineSchema;
      needsSave = true;
    } else if (!manifest.schema) {
      manifest.schema = state.schema;
      needsSave = true;
    }
    if (!manifest.schemaHash) {
      manifest.schemaHash = state.schemaHash;
      needsSave = true;
    }
    if (!manifest.schemaId) {
      manifest.schemaId = state.schema.schemaId;
      needsSave = true;
    }
    state.schema = manifest.schema;
    state.schemaHash = manifest.schemaHash;
  }

  state.manifest = manifest;
  state.compareSelection.clear();
  if (needsSave) {
    saveSession();
  }
  renderApp();
}

/**
 * Persist the current manifest to localStorage.
 */
function saveSession() {
  state.manifest.schema = state.schema;
  state.manifest.schemaHash = state.schemaHash;
  state.manifest.schemaId = state.schema.schemaId;
  state.manifest.updatedAt = new Date().toISOString();
  localStorage.setItem('jf_session', JSON.stringify(state.manifest));
}

/**
 * Generate a random ID for cards and notes.
 * @returns {string}
 */
function generateId() {
  // simple UUIDv4 generator based on crypto
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const toHex = (num) => num.toString(16).padStart(2, '0');
  return [...bytes].map(toHex).join('');
}

/**
 * Validate card data against the schema. Returns an array of error messages.
 * @param {object} data
 * @returns {string[]}
 */

/**
 * Render the entire application into the #app element.
 */
function renderApp() {
  const app = document.getElementById('app');

  // Main container layout: deck and board
  app.innerHTML = '';
  const deckDiv = document.createElement('div');
  deckDiv.className = 'deck';
  const boardDiv = document.createElement('div');
  boardDiv.className = 'board';
  app.appendChild(deckDiv);
  app.appendChild(boardDiv);

  // Render deck
  renderDeck(deckDiv);
  // Render board
  renderBoard(boardDiv);
}

/**
 * Render the list of cards and add card button.
 * @param {HTMLElement} container
 */
function renderDeck(container) {
  container.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'section-title';
  header.textContent = 'Card Deck';
  container.appendChild(header);

  const addBtn = document.createElement('button');
  addBtn.className = 'add-card-btn';
  addBtn.textContent = 'Add Card';
  addBtn.addEventListener('click', () => {
    showCardModal(null);
  });
  container.appendChild(addBtn);

  const editSchemaBtn = document.createElement('button');
  editSchemaBtn.className = 'add-card-btn schema-editor-btn';
  editSchemaBtn.textContent = 'Edit Schema';
  editSchemaBtn.addEventListener('click', () => {
    showSchemaEditor();
  });
  container.appendChild(editSchemaBtn);

  const listDiv = document.createElement('div');
  listDiv.className = 'card-list';
  state.manifest.deck.forEach((card) => {
    const item = document.createElement('div');
    item.className = 'card-item';
    // image
    const img = document.createElement('img');
    if (card.image) {
      img.src = card.image;
    } else {
      // placeholder
      img.src = '';
    }
    item.appendChild(img);
    // name
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = card.data.fullName;
    item.appendChild(name);
    // edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      showCardModal(card);
    });
    item.appendChild(editBtn);
    if (cardTransfer) {
      const exportBtn = document.createElement('button');
      exportBtn.textContent = 'Export';
      exportBtn.addEventListener('click', () => exportCard(card.cardId));
      item.appendChild(exportBtn);
    }
    // delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.style.background = '#dc3545';
    delBtn.addEventListener('click', () => {
      if (confirm('Delete this card?')) {
        deleteCard(card.cardId);
      }
    });
    item.appendChild(delBtn);

    // compare select toggle
    const compLabel = document.createElement('label');
    compLabel.className = 'compare-toggle';
    const compCb = document.createElement('input');
    compCb.type = 'checkbox';
    compCb.dataset.card = card.cardId;
    compCb.checked = state.compareSelection.has(card.cardId);
    compCb.addEventListener('change', (e) => {
      toggleCompareSelection(card.cardId, e.target.checked);
    });
    compLabel.appendChild(compCb);
    compLabel.appendChild(document.createTextNode(' Compare'));
    item.appendChild(compLabel);
    listDiv.appendChild(item);
  });
  container.appendChild(listDiv);
  // Import/export controls
  const controls = document.createElement('div');
  controls.style.marginTop = '1rem';
  // Export session
  const exportBtn = document.createElement('button');
  exportBtn.className = 'add-card-btn';
  exportBtn.style.background = '#ffc107';
  exportBtn.style.color = '#333';
  exportBtn.textContent = 'Export Session';
  exportBtn.addEventListener('click', () => {
    exportSession();
  });
  controls.appendChild(exportBtn);
  // Import session
  const importLabel = document.createElement('label');
  importLabel.style.display = 'inline-block';
  importLabel.style.marginLeft = '0.5rem';
  importLabel.className = 'add-card-btn';
  importLabel.style.background = '#17a2b8';
  importLabel.textContent = 'Import Session';
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.json,.jfpack';
  importInput.style.display = 'none';
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        try {
          const json = JSON.parse(evt.target.result);
          if (!json.schema || !json.schemaHash) {
            alert('Imported session is missing schema information.');
            return;
          }
          if (json.schemaId !== state.schema.schemaId) {
            alert('Imported session targets a different schema ID.');
            return;
          }
          state.manifest = json;
          state.schema = json.schema;
          state.schemaHash = json.schemaHash;
          state.compareSelection.clear();
          saveSession();
          renderApp();
        } catch (err) {
          alert('Failed to import: invalid file');
        }
      };
      reader.readAsText(file);
    }
  });
  importLabel.appendChild(importInput);
  controls.appendChild(importLabel);

  if (cardTransfer) {
    const importCardLabel = document.createElement('label');
    importCardLabel.style.display = 'inline-block';
    importCardLabel.style.marginLeft = '0.5rem';
    importCardLabel.className = 'add-card-btn';
    importCardLabel.style.background = '#6610f2';
    importCardLabel.textContent = 'Import Card';
    const importCardInput = document.createElement('input');
    importCardInput.type = 'file';
    importCardInput.accept = '.json,.jfcard';
    importCardInput.style.display = 'none';
    importCardInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (evt) {
        try {
          const payload = JSON.parse(evt.target.result);
          const newCard = cardTransfer.prepareImportedCard(payload, {
            schema: state.schema,
            schemaHash: state.schemaHash,
            existingDeck: state.manifest.deck,
            generateId,
            validator: validateCardData
          });
          state.manifest.deck.push(newCard);
          saveSession();
          renderApp();
        } catch (err) {
          alert(err.message || 'Failed to import card');
        } finally {
          importCardInput.value = '';
        }
      };
      reader.onerror = () => {
        alert('Failed to read card file');
        importCardInput.value = '';
      };
      reader.readAsText(file);
    });
    importCardLabel.appendChild(importCardInput);
    controls.appendChild(importCardLabel);
  }
  container.appendChild(controls);

  // Sticky compare bar inside the Deck panel
  renderCompareToolbar(container);
}

/** --------------------------
 * Compare Mode – helpers & UI
 * --------------------------*/

/** Normalize a field value for equality checks in compare table. */
function normalizeForCompare(field, value) {
  if (value === undefined || value === null || value === '') return '';
  if (field.type === 'list' || field.type === 'multi-select') {
    return Array.isArray(value)
      ? value.map((v) => String(v).trim()).sort().join('|')
      : String(value).trim();
  }
  if (typeof value === 'string') return value.trim();
  return String(value);
}

/** Human-readable display for table cells. */
function valueToDisplay(field, value) {
  if (value === undefined || value === null || value === '') return '—';
  if (field.type === 'list' || field.type === 'multi-select') {
    return Array.isArray(value) ? value.join(', ') : String(value);
  }
  return String(value);
}

/** Toggle a card in compare selection. */
function toggleCompareSelection(cardId, selected) {
  if (selected) {
    if (state.compareSelection.size >= state.compareMax) {
      alert(`You can compare up to ${state.compareMax} cards at once.`);
      // Repaint checkbox to uncheck
      const cb = document.querySelector(`.card-item input[data-card="${cardId}"]`);
      if (cb) cb.checked = false;
      return;
    }
    state.compareSelection.add(cardId);
  } else {
    state.compareSelection.delete(cardId);
  }
  // Refresh just the deck UI
  const deckEl = document.querySelector('.deck');
  if (deckEl) {
    renderDeck(deckEl);
  } else {
    renderApp(); // fallback
  }
}

/** Sticky bar inside the Deck panel. */
function renderCompareToolbar(deckContainer) {
  let bar = deckContainer.querySelector('.compare-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'compare-bar';
    deckContainer.appendChild(bar);
  }
  const selectedIds = Array.from(state.compareSelection);
  const count = selectedIds.length;

  bar.innerHTML = '';

  const left = document.createElement('div');
  left.className = 'compare-summary';
  left.textContent = count ? `${count} selected` : 'Select cards to compare';

  const actions = document.createElement('div');
  actions.className = 'compare-actions';

  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn-secondary';
  clearBtn.textContent = 'Clear';
  clearBtn.disabled = count === 0;
  clearBtn.addEventListener('click', () => {
    state.compareSelection.clear();
    renderDeck(deckContainer);
  });

  const compareBtn = document.createElement('button');
  compareBtn.className = 'btn-primary';
  compareBtn.textContent = count >= 2 ? 'Open Compare' : 'Select 2+ to Compare';
  compareBtn.disabled = count < 2;
  compareBtn.addEventListener('click', () => {
    showCompareModal(selectedIds);
  });

  actions.appendChild(clearBtn);
  actions.appendChild(compareBtn);
  bar.appendChild(left);
  bar.appendChild(actions);
}

/** Multi-card radar overlay (one polygon per card). */
function renderComparisonRadar(svg, cards) {
  const radarFields = state.schema.fields.filter((f) => f.radar);
  const numAxes = radarFields.length;
  const centerX = 180;
  const centerY = 180;
  const radius = 140;

  while (svg.firstChild) svg.removeChild(svg.firstChild);

  // Grid
  for (let i = 1; i <= 5; i++) {
    const r = (radius / 5) * i;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', String(r));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#eee');
    svg.appendChild(circle);
  }

  // Axes + labels
  radarFields.forEach((field, idx) => {
    const angle = (Math.PI * 2 * idx) / numAxes - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', String(x));
    line.setAttribute('y2', String(y));
    line.setAttribute('stroke', '#ddd');
    svg.appendChild(line);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(centerX + Math.cos(angle) * (radius + 18)));
    text.setAttribute('y', String(centerY + Math.sin(angle) * (radius + 18)));
    text.setAttribute('font-size', '9');
    text.setAttribute(
      'text-anchor',
      angle > Math.PI / 2 && angle < (Math.PI * 3) / 2 ? 'end' : 'start'
    );
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = field.label;
    svg.appendChild(text);
  });

  const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'];

  // Polygons
  cards.forEach((card, idx) => {
    const pts = radarFields.map((field, i) => {
      const val = card.data[field.id] != null ? card.data[field.id] : 0;
      const min = field.min ?? 0;
      const max = field.max ?? 10;
      const ratio = max > min ? (val - min) / (max - min) : 0;
      const r = Math.max(0, Math.min(1, ratio)) * radius;
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      return `${x},${y}`;
    });

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const color = COLORS[idx % COLORS.length];
    polygon.setAttribute('points', pts.join(' '));
    polygon.setAttribute('fill', color);
    polygon.setAttribute('opacity', '0.15');
    polygon.setAttribute('stroke', color);
    polygon.setAttribute('stroke-width', '2');
    svg.appendChild(polygon);
  });
}

/** Modal: show side-by-side differences & radar overlay. */
function showCompareModal(cardIds) {
  const cards = state.manifest.deck.filter((c) => cardIds.includes(c.cardId));
  if (cards.length < 2) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const title = document.createElement('h2');
  title.textContent = `Compare (${cards.length}) Cards`;
  modal.appendChild(title);

  // Legend
  const legend = document.createElement('div');
  legend.className = 'compare-legend';
  const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'];
  cards.forEach((card, idx) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    const dot = document.createElement('span');
    dot.className = 'color-dot';
    dot.style.background = COLORS[idx % COLORS.length];
    item.appendChild(dot);
    const name = document.createElement('span');
    name.textContent = card.data.fullName;
    item.appendChild(name);
    legend.appendChild(item);
  });
  modal.appendChild(legend);

  // Radar overlay
  const radarWrap = document.createElement('div');
  radarWrap.className = 'radar-container';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '360');
  svg.setAttribute('height', '360');
  radarWrap.appendChild(svg);
  modal.appendChild(radarWrap);
  renderComparisonRadar(svg, cards);

  // Only differences toggle
  const diffsLabel = document.createElement('label');
  diffsLabel.className = 'diffs-toggle';
  const diffsCb = document.createElement('input');
  diffsCb.type = 'checkbox';
  diffsLabel.appendChild(diffsCb);
  diffsLabel.appendChild(document.createTextNode(' Show only differences'));
  modal.appendChild(diffsLabel);

  // Table
  const tableWrap = document.createElement('div');
  tableWrap.className = 'compare-table-wrap';
  modal.appendChild(tableWrap);

  function renderTable(onlyDiffs) {
    tableWrap.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'compare-table';

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const thField = document.createElement('th');
    thField.textContent = 'Field';
    trHead.appendChild(thField);
    cards.forEach((c) => {
      const th = document.createElement('th');
      th.textContent = c.data.fullName;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    state.schema.fields.forEach((field) => {
      const values = cards.map((c) => c.data[field.id]);
      const normalized = values.map((v) => normalizeForCompare(field, v));
      const allEqual = normalized.every((n) => n === normalized[0]);

      if (onlyDiffs && allEqual) return;

      const tr = document.createElement('tr');
      if (!allEqual) tr.className = 'row-diff';

      const tdLabel = document.createElement('td');
      tdLabel.textContent = field.label;
      tr.appendChild(tdLabel);

      values.forEach((val) => {
        const td = document.createElement('td');
        td.textContent = valueToDisplay(field, val);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrap.appendChild(table);
  }

  diffsCb.addEventListener('change', (e) => {
    renderTable(e.target.checked);
  });
  renderTable(false);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'actions';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'cancel-btn';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(backdrop);
  });

  const clearBtn = document.createElement('button');
  clearBtn.className = 'delete-btn';
  clearBtn.textContent = 'Clear Selection';
  clearBtn.addEventListener('click', () => {
    state.compareSelection.clear();
    document.body.removeChild(backdrop);
    const deck = document.querySelector('.deck');
    if (deck) renderDeck(deck);
  });

  actions.appendChild(closeBtn);
  actions.appendChild(clearBtn);
  modal.appendChild(actions);

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/**
 * Delete a card from the deck and remove assignments referencing it.
 * @param {string} cardId
 */
function deleteCard(cardId) {
  const idx = state.manifest.deck.findIndex((c) => c.cardId === cardId);
  if (idx >= 0) {
    state.manifest.deck.splice(idx, 1);
    // Remove from assignments
    state.manifest.board.assignments = state.manifest.board.assignments.filter(
      (a) => a.cardId !== cardId
    );
    state.compareSelection.delete(cardId);
    saveSession();
    renderApp();
  }
}

/**
 * Render the board with slots and assignments.
 * @param {HTMLElement} container
 */
function renderBoard(container) {
  container.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'section-title';
  header.textContent = 'Board Assignments';
  container.appendChild(header);

  const slotList = document.createElement('div');
  slotList.className = 'slot-list';
  state.manifest.board.slots.forEach((slot) => {
    const slotDiv = document.createElement('div');
    slotDiv.className = 'slot-item';
    const slotHeader = document.createElement('div');
    slotHeader.className = 'slot-header';
    const title = document.createElement('span');
    title.textContent = slot.name;
    slotHeader.appendChild(title);
    // Rename slot
    const renameSlotBtn = document.createElement('button');
    renameSlotBtn.textContent = 'Rename';
    renameSlotBtn.style.background = '#6c757d';
    renameSlotBtn.style.color = '#fff';
    renameSlotBtn.style.border = 'none';
    renameSlotBtn.style.padding = '0.25rem 0.5rem';
    renameSlotBtn.style.fontSize = '0.75rem';
    renameSlotBtn.addEventListener('click', () => {
      const newName = prompt('Rename slot', slot.name);
      if (newName && newName.trim()) {
        renameSlot(slot.slotId, newName.trim());
      }
    });
    slotHeader.appendChild(renameSlotBtn);

    // Delete slot (allowed for all slots)
    const removeSlotBtn = document.createElement('button');
    removeSlotBtn.textContent = 'Delete Slot';
    removeSlotBtn.style.background = '#dc3545';
    removeSlotBtn.style.color = '#fff';
    removeSlotBtn.style.border = 'none';
    removeSlotBtn.style.padding = '0.25rem 0.5rem';
    removeSlotBtn.style.fontSize = '0.75rem';
    removeSlotBtn.addEventListener('click', () => {
      if (confirm('Delete this slot? Assignments will be removed.')) {
        deleteSlot(slot.slotId);
      }
    });
    slotHeader.appendChild(removeSlotBtn);
    slotDiv.appendChild(slotHeader);

    // Assigned list
    const assignedUl = document.createElement('ul');
    assignedUl.className = 'assigned-list';
    const assignmentsForSlot = state.manifest.board.assignments
      .filter((a) => a.slotId === slot.slotId)
      .sort((a, b) => a.rank - b.rank);
    const assignedCardIds = new Set(assignmentsForSlot.map((a) => a.cardId));
    assignmentsForSlot.forEach((assign) => {
      const li = document.createElement('li');
      const card = state.manifest.deck.find((c) => c.cardId === assign.cardId);
      const span = document.createElement('span');
      span.textContent = `${assign.rank}. ${card ? card.data.fullName : assign.cardId}`;
      li.appendChild(span);
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        removeAssignment(slot.slotId, assign.cardId);
      });
      li.appendChild(removeBtn);
      assignedUl.appendChild(li);
    });
    slotDiv.appendChild(assignedUl);

    // Assign select
    const select = document.createElement('select');
    select.className = 'assign-select';
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '-- Assign card --';
    select.appendChild(emptyOption);
    state.manifest.deck.forEach((card) => {
      if (assignedCardIds.has(card.cardId)) return;
      const option = document.createElement('option');
      option.value = card.cardId;
      option.textContent = card.data.fullName;
      select.appendChild(option);
    });
    select.addEventListener('change', (e) => {
      const cardId = e.target.value;
      if (cardId) {
        assignCard(slot.slotId, cardId);
        e.target.value = '';
      }
    });
    slotDiv.appendChild(select);

    slotList.appendChild(slotDiv);
  });
  container.appendChild(slotList);

  const addSlotBtn = document.createElement('button');
  addSlotBtn.className = 'add-slot-btn';
  addSlotBtn.textContent = 'Add Slot';
  addSlotBtn.addEventListener('click', () => {
    const name = prompt('Enter new slot name');
    if (name) {
      addSlot(name);
    }
  });
  container.appendChild(addSlotBtn);

  // Board radar chart
  const radarWrap = document.createElement('div');
  radarWrap.className = 'radar-container';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '300');
  svg.setAttribute('height', '300');
  radarWrap.appendChild(svg);
  container.appendChild(radarWrap);
  renderBoardRadar(svg);
}

/**
 * Add a slot to the board.
 * @param {string} name
 */
function addSlot(name) {
  const clean = name.trim();
  if (!clean) return;
  const slotId = generateId();
  state.manifest.board.slots.push({ slotId, name: clean });
  saveSession();
  renderApp();
}

/**
 * Delete a slot and its assignments.
 * @param {string} slotId
 */
function deleteSlot(slotId) {
  state.manifest.board.slots = state.manifest.board.slots.filter((s) => s.slotId !== slotId);
  state.manifest.board.assignments = state.manifest.board.assignments.filter(
    (a) => a.slotId !== slotId
  );
  saveSession();
  renderApp();
}

/**
 * Rename a slot while keeping its ID stable.
 * @param {string} slotId
 * @param {string} name
 */
function renameSlot(slotId, name) {
  const clean = name.trim();
  if (!clean) return;
  const slot = state.manifest.board.slots.find((s) => s.slotId === slotId);
  if (!slot) return;
  slot.name = clean;
  saveSession();
  renderApp();
}

/**
 * Assign a card to a slot at next available rank.
 * @param {string} slotId
 * @param {string} cardId
 */
function assignCard(slotId, cardId) {
  // Determine next rank and prevent duplicate assignments within the slot
  const assignmentsForSlot = state.manifest.board.assignments.filter(
    (a) => a.slotId === slotId
  );
  if (assignmentsForSlot.some((a) => a.cardId === cardId)) {
    return;
  }
  const nextRank = assignmentsForSlot.length ? Math.max(...assignmentsForSlot.map((a) => a.rank)) + 1 : 1;
  state.manifest.board.assignments.push({ slotId, cardId, rank: nextRank });
  saveSession();
  renderApp();
}

/**
 * Remove an assignment from a slot.
 * @param {string} slotId
 * @param {string} cardId
 */
function removeAssignment(slotId, cardId) {
  state.manifest.board.assignments = state.manifest.board.assignments.filter(
    (a) => !(a.slotId === slotId && a.cardId === cardId)
  );
  // Recalculate ranks
  const assignmentsForSlot = state.manifest.board.assignments
    .filter((a) => a.slotId === slotId)
    .sort((a, b) => a.rank - b.rank);
  assignmentsForSlot.forEach((assign, idx) => {
    assign.rank = idx + 1;
  });
  saveSession();
  renderApp();
}

/**
 * Show a modal dialog for creating or editing a card.
 * @param {object|null} card existing card or null to create new
 */
function showCardModal(card) {
  const isNew = !card;
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  // Modal container
  const modal = document.createElement('div');
  modal.className = 'modal';
  const title = document.createElement('h2');
  title.textContent = isNew ? 'Add Card' : 'Edit Card';
  modal.appendChild(title);
  // Form
  const form = document.createElement('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSave();
  });

  // Keep a copy of the data to edit
  const cardData = card ? JSON.parse(JSON.stringify(card.data)) : {};
  let imageData = card ? card.image : '';

  // Generate fields from schema
  state.schema.fields.forEach((field) => {
    const group = document.createElement('div');
    group.className = 'field-group';
    const label = document.createElement('label');
    label.textContent = field.label;
    // create input based on type
    let input;
    if (field.type === 'string') {
      input = document.createElement('input');
      input.type = 'text';
      input.value = cardData[field.id] || '';
    } else if (field.type === 'number') {
      input = document.createElement('input');
      input.type = 'number';
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      input.value = cardData[field.id] != null ? cardData[field.id] : '';
    } else if (field.type === 'enum') {
      input = document.createElement('select');
      field.options.forEach((opt) => {
        const optEl = document.createElement('option');
        optEl.value = opt;
        optEl.textContent = opt;
        if (cardData[field.id] === opt) optEl.selected = true;
        input.appendChild(optEl);
      });
    } else if (field.type === 'multi-select') {
      // render as checkboxes
      input = document.createElement('div');
      field.options.forEach((opt) => {
        const cbWrapper = document.createElement('label');
        cbWrapper.style.display = 'inline-flex';
        cbWrapper.style.alignItems = 'center';
        cbWrapper.style.marginRight = '0.5rem';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = opt;
        cb.dataset.fieldId = field.id;
        if (Array.isArray(cardData[field.id]) && cardData[field.id].includes(opt)) cb.checked = true;
        cbWrapper.appendChild(cb);
        cbWrapper.appendChild(document.createTextNode(opt));
        input.appendChild(cbWrapper);
      });
    } else if (field.type === 'list') {
      input = document.createElement('textarea');
      input.rows = 2;
      input.value = Array.isArray(cardData[field.id]) ? cardData[field.id].join('\n') : '';
    } else if (field.type === 'text') {
      input = document.createElement('textarea');
      input.rows = 3;
      input.value = cardData[field.id] || '';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.value = cardData[field.id] || '';
    }
    input.dataset.fieldId = field.id;
    label.appendChild(input);
    group.appendChild(label);
    form.appendChild(group);
  });

  // Image upload + preview + clear
  const imgGroup = document.createElement('div');
  imgGroup.className = 'field-group';
  const imgLabel = document.createElement('label');
  imgLabel.textContent = 'Image (PNG 750x1050)';
  const imgInput = document.createElement('input');
  imgInput.type = 'file';
  imgInput.accept = 'image/png';

  // Simple preview
  const imgPreview = document.createElement('img');
  imgPreview.alt = 'Current card image preview';
  imgPreview.style.display = 'none';
  imgPreview.style.maxWidth = '100%';
  imgPreview.style.marginTop = '0.5rem';
  imgPreview.style.borderRadius = '6px';

  // Clear button
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.textContent = 'Clear Image';
  clearBtn.style.marginTop = '0.5rem';
  clearBtn.disabled = !imageData;

  function updateImagePreview() {
    if (imageData) {
      imgPreview.src = imageData;
      imgPreview.style.display = 'block';
      clearBtn.disabled = false;
    } else {
      imgPreview.removeAttribute('src');
      imgPreview.style.display = 'none';
      clearBtn.disabled = true;
    }
  }

  imgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
      // Accept whatever the user selected; resizing/flattening happens later in the editor.
      imageData = evt.target.result;
      updateImagePreview();
      imgInput.value = '';
    };
    reader.readAsDataURL(file);
  });

  clearBtn.addEventListener('click', () => {
    if (!imageData) return;
    imageData = '';
    updateImagePreview();
  });

  imgLabel.appendChild(imgInput);
  imgLabel.appendChild(clearBtn);
  imgLabel.appendChild(imgPreview);
  imgGroup.appendChild(imgLabel);
  updateImagePreview();
  form.appendChild(imgGroup);

  // Notes section
  let notes = card ? card.notes.map((n) => ({ ...n })) : [];
  const notesDiv = document.createElement('div');
  notesDiv.className = 'field-group';
  const notesLabel = document.createElement('label');
  notesLabel.textContent = 'Notes';
  // list of notes
  const notesList = document.createElement('div');
  notesList.style.display = 'flex';
  notesList.style.flexDirection = 'column';
  notesList.style.gap = '0.25rem';
  function renderNotes() {
    notesList.innerHTML = '';
    notes.forEach((note) => {
      const noteDiv = document.createElement('div');
      noteDiv.style.display = 'flex';
      noteDiv.style.justifyContent = 'space-between';
      noteDiv.style.alignItems = 'center';
      const text = document.createElement('span');
      text.textContent = `${new Date(note.createdAt).toLocaleDateString()}: ${note.text}`;
      noteDiv.appendChild(text);
      const del = document.createElement('button');
      del.textContent = '×';
      del.style.background = '#dc3545';
      del.style.color = '#fff';
      del.style.border = 'none';
      del.style.borderRadius = '50%';
      del.style.width = '20px';
      del.style.height = '20px';
      del.style.fontSize = '0.8rem';
      del.addEventListener('click', () => {
        notes = notes.filter((n) => n.noteId !== note.noteId);
        renderNotes();
      });
      noteDiv.appendChild(del);
      notesList.appendChild(noteDiv);
    });
  }
  renderNotes();
  // Add note input
  const noteInput = document.createElement('input');
  noteInput.type = 'text';
  noteInput.placeholder = 'Add note and press Enter';
  noteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const text = noteInput.value.trim();
      if (text) {
        notes.push({ noteId: generateId(), createdAt: new Date().toISOString(), text });
        noteInput.value = '';
        renderNotes();
      }
    }
  });
  notesLabel.appendChild(notesList);
  notesLabel.appendChild(noteInput);
  notesDiv.appendChild(notesLabel);
  form.appendChild(notesDiv);

  // Radar chart preview
  const radarWrap = document.createElement('div');
  radarWrap.className = 'radar-container';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '250');
  svg.setAttribute('height', '250');
  radarWrap.appendChild(svg);
  form.appendChild(radarWrap);
  // Render radar for editing card data
  function updateRadarPreview() {
    renderCardRadar(svg, cardData);
  }
  updateRadarPreview();

  // Listen to changes to update cardData and radar
  form.addEventListener('input', (e) => {
    const target = e.target;
    const fieldId = target.dataset.fieldId;
    if (!fieldId) return;
    const fieldDef = state.schema.fields.find((f) => f.id === fieldId);
    if (!fieldDef) return;
    let value;
    if (fieldDef.type === 'number') {
      value = target.value === '' ? null : parseFloat(target.value);
    } else if (fieldDef.type === 'enum') {
      value = target.value;
    } else if (fieldDef.type === 'multi-select') {
      const checkboxes = Array.from(
        form.querySelectorAll(`input[type="checkbox"][data-field-id="${fieldId}"]`)
      );
      value = checkboxes.filter((cb) => cb.checked).map((cb) => cb.value);
    } else if (fieldDef.type === 'list') {
      value = target.value.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    } else {
      value = target.value;
    }
    cardData[fieldId] = value;
    updateRadarPreview();
  });

  modal.appendChild(form);

  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'actions';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn';
  saveBtn.type = 'submit';
  saveBtn.textContent = 'Save';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cancel-btn';
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(backdrop);
  });
  actions.appendChild(cancelBtn);
  if (!isNew) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (confirm('Delete this card?')) {
        deleteCard(card.cardId);
        document.body.removeChild(backdrop);
      }
    });
    actions.appendChild(deleteBtn);
  }
  actions.appendChild(saveBtn);
  form.appendChild(actions);

  // Save handler
  function handleSave() {
    const errs = validateCardData(state.schema, cardData);
    if (errs.length) {
      const categoriesField = state.schema.fields.find((f) => f.id === 'categories');

      if (console.groupCollapsed) {
        console.groupCollapsed('Card validation failed');
      } else {
        console.error('Card validation failed');
      }

      console.error('Validation errors:', errs);
      console.info('Mode:', isNew ? 'create' : 'update');
      console.info('Card id:', card ? card.cardId : '(new)');
      console.info('Full name:', cardData.fullName || '(missing fullName)');
      console.debug('Card data snapshot:', JSON.parse(JSON.stringify(cardData)));
      console.debug('Active schema info:', {
        schemaId: state.schema.schemaId,
        schemaVersion: state.schema.schemaVersion,
        schemaHash: state.schemaHash
      });

      if (categoriesField) {
        console.info('Category selections:', cardData.categories || []);
        console.info('Allowed category options:', categoriesField.options);
      }

      if (console.groupEnd) {
        console.groupEnd();
      }
      alert(errs.join('\n'));
      return;
    }
    if (isNew) {
      // ensure unique full name
      if (state.manifest.deck.some((c) => c.data.fullName === cardData.fullName)) {
        alert('A card with that name already exists.');
        return;
      }
      const newCard = {
        cardId: generateId(),
        image: imageData || '',
        data: cardData,
        notes
      };
      state.manifest.deck.push(newCard);
    } else {
      // update existing card
      card.data = cardData;
      card.image = imageData;
      card.notes = notes;
    }
    saveSession();
    document.body.removeChild(backdrop);
    renderApp();
  }

  // Append and focus
  document.body.appendChild(backdrop);
  backdrop.appendChild(modal);
}

/**
 * Render a radar chart for a single card into the given SVG element.
 * @param {SVGSVGElement} svg
 * @param {object} cardData
 */
function renderCardRadar(svg, cardData) {
  const radarFields = state.schema.fields.filter((f) => f.radar);
  const numAxes = radarFields.length;
  const centerX = 125;
  const centerY = 125;
  const radius = 100;
  // Clear svg
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  // Draw grid (5 concentric circles)
  for (let i = 1; i <= 5; i++) {
    const r = (radius / 5) * i;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', r.toString());
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#ddd');
    svg.appendChild(circle);
  }
  // Draw axes lines and labels
  radarFields.forEach((field, idx) => {
    const angle = (Math.PI * 2 * idx) / numAxes - Math.PI / 2; // start top
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', x.toString());
    line.setAttribute('y2', y.toString());
    line.setAttribute('stroke', '#bbb');
    svg.appendChild(line);
    // label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (centerX + Math.cos(angle) * (radius + 15)).toString());
    text.setAttribute('y', (centerY + Math.sin(angle) * (radius + 15)).toString());
    text.setAttribute('font-size', '8');
    text.setAttribute('text-anchor', angle > Math.PI / 2 && angle < (Math.PI * 3) / 2 ? 'end' : 'start');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = field.label;
    svg.appendChild(text);
  });
  // Create polygon points for card data
  const points = radarFields.map((field, idx) => {
    const val = cardData[field.id] != null ? cardData[field.id] : 0;
    const min = field.min ?? 0;
    const max = field.max ?? 10;
    const ratio = max > min ? (val - min) / (max - min) : 0;
    const rVal = ratio * radius;
    const angle = (Math.PI * 2 * idx) / numAxes - Math.PI / 2;
    const x = centerX + Math.cos(angle) * rVal;
    const y = centerY + Math.sin(angle) * rVal;
    return `${x},${y}`;
  });
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', points.join(' '));
  polygon.setAttribute('fill', 'rgba(0, 123, 255, 0.3)');
  polygon.setAttribute('stroke', '#007bff');
  polygon.setAttribute('stroke-width', '2');
  svg.appendChild(polygon);
}

/**
 * Render a radar chart representing the current board (rank 1 assignments).
 * @param {SVGSVGElement} svg
 */
function renderBoardRadar(svg) {
  const radarFields = state.schema.fields.filter((f) => f.radar);
  const numAxes = radarFields.length;
  const centerX = 150;
  const centerY = 150;
  const radius = 120;
  // Clear svg
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  // Draw grid lines
  for (let i = 1; i <= 5; i++) {
    const r = (radius / 5) * i;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', r.toString());
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#eee');
    svg.appendChild(circle);
  }
  // Draw axes and labels
  radarFields.forEach((field, idx) => {
    const angle = (Math.PI * 2 * idx) / numAxes - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', x.toString());
    line.setAttribute('y2', y.toString());
    line.setAttribute('stroke', '#ccc');
    svg.appendChild(line);
    // label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (centerX + Math.cos(angle) * (radius + 20)).toString());
    text.setAttribute('y', (centerY + Math.sin(angle) * (radius + 20)).toString());
    text.setAttribute('font-size', '8');
    text.setAttribute('text-anchor', angle > Math.PI / 2 && angle < (Math.PI * 3) / 2 ? 'end' : 'start');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = field.label;
    svg.appendChild(text);
  });
  // Aggregate values across 1st choice assignments
  const firstAssignments = state.manifest.board.assignments.filter((a) => a.rank === 1);
  const aggregated = {};
  radarFields.forEach((field) => {
    const values = firstAssignments.map((assign) => {
      const card = state.manifest.deck.find((c) => c.cardId === assign.cardId);
      return card ? card.data[field.id] ?? 0 : 0;
    });
    let agg;
    if (!values.length) {
      agg = 0;
    } else if (field.boardAggregate === 'sum') {
      agg = values.reduce((a, b) => a + b, 0);
    } else if (field.boardAggregate === 'mean') {
      agg = values.reduce((a, b) => a + b, 0) / values.length;
    } else {
      // default to max
      agg = Math.max(...values);
    }
    aggregated[field.id] = agg;
  });
  // Build polygon points
  const points = radarFields.map((field, idx) => {
    const val = aggregated[field.id] ?? 0;
    const min = field.min ?? 0;
    const max = field.max ?? 10;
    const ratio = max > min ? (val - min) / (max - min) : 0;
    const rVal = Math.min(ratio, 1) * radius;
    const angle = (Math.PI * 2 * idx) / numAxes - Math.PI / 2;
    const x = centerX + Math.cos(angle) * rVal;
    const y = centerY + Math.sin(angle) * rVal;
    return `${x},${y}`;
  });
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', points.join(' '));
  polygon.setAttribute('fill', 'rgba(40, 167, 69, 0.3)');
  polygon.setAttribute('stroke', '#28a745');
  polygon.setAttribute('stroke-width', '2');
  svg.appendChild(polygon);
}

function showSchemaEditor() {
  const draft = deepClone(state.schema);
  const coreSet = new Set(draft.requiredCoreFields || []);

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.className = 'modal schema-editor-modal';

  const title = document.createElement('h2');
  title.textContent = 'Edit Schema';
  modal.appendChild(title);

  const intro = document.createElement('p');
  intro.className = 'schema-info-text';
  intro.textContent = 'Add, remove, or adjust fields. Changes will not apply until you review and confirm the migration.';
  modal.appendChild(intro);

  const grid = document.createElement('div');
  grid.className = 'schema-editor-grid';
  modal.appendChild(grid);

  const fieldsContainer = document.createElement('div');
  fieldsContainer.className = 'schema-fields-list';
  grid.appendChild(fieldsContainer);

  const metaPanel = document.createElement('div');
  metaPanel.className = 'schema-meta-panel';
  grid.appendChild(metaPanel);

  const actions = document.createElement('div');
  actions.className = 'actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cancel-btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(backdrop);
  });
  const reviewBtn = document.createElement('button');
  reviewBtn.className = 'save-btn';
  reviewBtn.textContent = 'Review Changes';
  reviewBtn.addEventListener('click', () => {
    const errors = validateSchemaDraft(draft);
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }
    const plan = diffSchemas(state.schema, draft);
    const current = JSON.stringify(state.schema);
    const updated = JSON.stringify(draft);
    if (current === updated) {
      alert('No changes detected.');
      return;
    }
    showMigrationWizard(draft, plan, () => {
      if (document.body.contains(backdrop)) {
        document.body.removeChild(backdrop);
      }
    });
  });
  actions.appendChild(cancelBtn);
  actions.appendChild(reviewBtn);
  modal.appendChild(actions);

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  function generateFieldId(baseLabel) {
    const normalized = baseLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'field';
    const existing = new Set(draft.fields.map((f) => f.id));
    let candidate = normalized;
    let counter = 1;
    while (existing.has(candidate)) {
      candidate = `${normalized}_${counter++}`;
    }
    return candidate;
  }

  function createCheckbox(label, checked, onChange, disabled) {
    const wrapper = document.createElement('label');
    wrapper.className = 'schema-flag';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.disabled = disabled;
    input.addEventListener('change', () => onChange(input.checked));
    wrapper.appendChild(input);
    wrapper.appendChild(document.createTextNode(label));
    return wrapper;
  }

  function renderMetaPanel() {
    metaPanel.innerHTML = '';
    const metaTitle = document.createElement('h3');
    metaTitle.textContent = 'Defaults & Ordering';
    metaPanel.appendChild(metaTitle);
    const sort = draft.defaultSort || { field: draft.fields[0]?.id || '', direction: 'desc' };
    draft.defaultSort = sort;
    if (sort.field && !draft.fields.find((f) => f.id === sort.field)) {
      sort.field = draft.fields[0]?.id || '';
    }
    const sortGroup = document.createElement('div');
    sortGroup.className = 'schema-meta-group';
    const sortFieldLabel = document.createElement('label');
    sortFieldLabel.textContent = 'Default sort field';
    const sortFieldSelect = document.createElement('select');
    draft.fields.forEach((field) => {
      const opt = document.createElement('option');
      opt.value = field.id;
      opt.textContent = field.label || field.id;
      sortFieldSelect.appendChild(opt);
    });
    sortFieldSelect.value = sort.field;
    sortFieldSelect.addEventListener('change', () => {
      sort.field = sortFieldSelect.value;
    });
    sortFieldLabel.appendChild(sortFieldSelect);
    sortGroup.appendChild(sortFieldLabel);

    const dirLabel = document.createElement('label');
    dirLabel.textContent = 'Default sort direction';
    const dirSelect = document.createElement('select');
    ['asc', 'desc'].forEach((dir) => {
      const opt = document.createElement('option');
      opt.value = dir;
      opt.textContent = dir === 'asc' ? 'Ascending' : 'Descending';
      dirSelect.appendChild(opt);
    });
    dirSelect.value = sort.direction || 'asc';
    dirSelect.addEventListener('change', () => {
      sort.direction = dirSelect.value;
    });
    dirLabel.appendChild(dirSelect);
    sortGroup.appendChild(dirLabel);
    metaPanel.appendChild(sortGroup);

    const tip = document.createElement('p');
    tip.className = 'schema-info-text';
    tip.textContent = 'When you commit changes you will be guided through migrating existing cards.';
    metaPanel.appendChild(tip);
  }

  function renderFields() {
    fieldsContainer.innerHTML = '';
    draft.fields.forEach((field, index) => {
      const row = document.createElement('div');
      row.className = 'schema-field-row';
      const header = document.createElement('div');
      header.className = 'schema-field-header';
      const title = document.createElement('div');
      title.className = 'schema-field-title';
      title.textContent = `${field.label || '(Untitled)'} (${field.id})`;
      header.appendChild(title);
      const headerActions = document.createElement('div');
      headerActions.className = 'schema-field-header-actions';
      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'chip-btn';
      upBtn.textContent = '↑';
      upBtn.disabled = index === 0;
      upBtn.addEventListener('click', () => {
        if (index === 0) return;
        const temp = draft.fields[index - 1];
        draft.fields[index - 1] = draft.fields[index];
        draft.fields[index] = temp;
        renderFields();
      });
      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'chip-btn';
      downBtn.textContent = '↓';
      downBtn.disabled = index === draft.fields.length - 1;
      downBtn.addEventListener('click', () => {
        if (index === draft.fields.length - 1) return;
        const temp = draft.fields[index + 1];
        draft.fields[index + 1] = draft.fields[index];
        draft.fields[index] = temp;
        renderFields();
      });
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'chip-btn destructive';
      deleteBtn.textContent = 'Delete';
      deleteBtn.disabled = coreSet.has(field.id);
      deleteBtn.addEventListener('click', () => {
        if (coreSet.has(field.id)) return;
        if (!confirm(`Delete field "${field.label || field.id}"? This will remove it from all cards.`)) {
          return;
        }
        draft.fields.splice(index, 1);
        renderFields();
      });
      headerActions.appendChild(upBtn);
      headerActions.appendChild(downBtn);
      headerActions.appendChild(deleteBtn);
      header.appendChild(headerActions);
      row.appendChild(header);

      const controls = document.createElement('div');
      controls.className = 'schema-field-controls';

      const appendControl = (labelText, controlEl) => {
        const wrapper = document.createElement('label');
        wrapper.className = 'schema-field-control';
        const span = document.createElement('span');
        span.textContent = labelText;
        wrapper.appendChild(span);
        wrapper.appendChild(controlEl);
        controls.appendChild(wrapper);
      };

      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.value = field.label || '';
      labelInput.addEventListener('input', () => {
        field.label = labelInput.value;
        title.textContent = `${field.label || '(Untitled)'} (${field.id})`;
      });
      appendControl('Label', labelInput);

      const idInput = document.createElement('input');
      idInput.type = 'text';
      idInput.value = field.id;
      idInput.disabled = true;
      appendControl('Field ID', idInput);

      const typeSelect = document.createElement('select');
      ['string', 'text', 'number', 'enum', 'multi-select', 'list', 'url'].forEach((type) => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type;
        typeSelect.appendChild(opt);
      });
      typeSelect.value = field.type;
      typeSelect.addEventListener('change', () => {
        field.type = typeSelect.value;
        if (field.type === 'number') {
          if (field.min === undefined) field.min = 0;
          if (field.max === undefined) field.max = 10;
        }
        if ((field.type === 'enum' || field.type === 'multi-select') && !Array.isArray(field.options)) {
          field.options = [];
        }
        if (field.type === 'list' && !field.itemType) {
          field.itemType = 'string';
        }
        renderFields();
      });
      appendControl('Type', typeSelect);

      if (field.type === 'number') {
        const minInput = document.createElement('input');
        minInput.type = 'number';
        minInput.value = field.min ?? 0;
        minInput.addEventListener('input', () => {
          field.min = minInput.value === '' ? undefined : Number(minInput.value);
        });
        appendControl('Min', minInput);

        const maxInput = document.createElement('input');
        maxInput.type = 'number';
        maxInput.value = field.max ?? 10;
        maxInput.addEventListener('input', () => {
          field.max = maxInput.value === '' ? undefined : Number(maxInput.value);
        });
        appendControl('Max', maxInput);
      }

      if (field.type === 'string') {
        const maxLenInput = document.createElement('input');
        maxLenInput.type = 'number';
        maxLenInput.value = field.maxLength ?? '';
        maxLenInput.addEventListener('input', () => {
          field.maxLength = maxLenInput.value === '' ? undefined : Number(maxLenInput.value);
        });
        appendControl('Max Length', maxLenInput);
      }

      if (field.type === 'enum' || field.type === 'multi-select') {
        const optionsArea = document.createElement('textarea');
        optionsArea.rows = 4;
        optionsArea.value = (field.options || []).join('\n');
        optionsArea.addEventListener('input', () => {
          field.options = optionsArea
            .value
            .split('\n')
            .map((opt) => opt.trim())
            .filter(Boolean);
        });
        appendControl('Options (one per line)', optionsArea);
      }

      if (field.type === 'list') {
        const itemTypeSelect = document.createElement('select');
        ['string', 'url'].forEach((type) => {
          const opt = document.createElement('option');
          opt.value = type;
          opt.textContent = type === 'url' ? 'URL' : 'Text';
          itemTypeSelect.appendChild(opt);
        });
        itemTypeSelect.value = field.itemType || 'string';
        itemTypeSelect.addEventListener('change', () => {
          field.itemType = itemTypeSelect.value;
        });
        appendControl('List item type', itemTypeSelect);
      }

      const flags = document.createElement('div');
      flags.className = 'schema-flag-row';
      flags.appendChild(
        createCheckbox('Required', Boolean(field.required), (checked) => {
          field.required = checked;
        }, coreSet.has(field.id))
      );
      flags.appendChild(
        createCheckbox('Unique', Boolean(field.unique), (checked) => {
          field.unique = checked;
        }, false)
      );
      flags.appendChild(
        createCheckbox('Show on card front', Boolean(field.cardFront), (checked) => {
          field.cardFront = checked;
        }, false)
      );
      flags.appendChild(
        createCheckbox('Radar axis', Boolean(field.radar), (checked) => {
          field.radar = checked;
          if (field.radar && !field.boardAggregate) {
            field.boardAggregate = 'max';
          }
          renderFields();
        }, false)
      );
      row.appendChild(controls);
      row.appendChild(flags);

      if (field.radar) {
        const aggSelect = document.createElement('select');
        ['sum', 'mean', 'max'].forEach((agg) => {
          const opt = document.createElement('option');
          opt.value = agg;
          opt.textContent = agg;
          aggSelect.appendChild(opt);
        });
        aggSelect.value = field.boardAggregate || 'max';
        aggSelect.addEventListener('change', () => {
          field.boardAggregate = aggSelect.value;
        });
        appendControl('Board aggregate', aggSelect);
      }

      fieldsContainer.appendChild(row);
    });

    const addFieldBtn = document.createElement('button');
    addFieldBtn.className = 'add-card-btn';
    addFieldBtn.type = 'button';
    addFieldBtn.textContent = 'Add Field';
    addFieldBtn.addEventListener('click', () => {
      const newFieldId = generateFieldId('new_field');
      draft.fields.push({
        id: newFieldId,
        label: 'New Field',
        type: 'string',
        required: false,
        cardFront: false
      });
      renderFields();
    });
    fieldsContainer.appendChild(addFieldBtn);

    renderMetaPanel();
  }

  renderFields();
}

function renderPlanSummaryHtml(plan) {
  const sections = [];
  if (plan.added && plan.added.length) {
    sections.push(
      `<div class="plan-section"><h3>Added fields</h3><ul>${plan.added
        .map((f) => `<li>${escapeHtml(f.label || f.id)} (${escapeHtml(f.id)})</li>`)
        .join('')}</ul></div>`
    );
  }
  if (plan.removed && plan.removed.length) {
    sections.push(
      `<div class="plan-section destructive"><h3>Removed fields</h3><ul>${plan.removed
        .map((f) => `<li>${escapeHtml(f.label || f.id)} (${escapeHtml(f.id)})</li>`)
        .join('')}</ul></div>`
    );
  }
  if (plan.typeChanged && plan.typeChanged.length) {
    sections.push(
      `<div class="plan-section destructive"><h3>Type changes</h3><ul>${plan.typeChanged
        .map((c) => `<li>${escapeHtml(c.id)}: ${escapeHtml(c.from)} → ${escapeHtml(c.to)}</li>`)
        .join('')}</ul></div>`
    );
  }
  if (plan.itemTypeChanged && plan.itemTypeChanged.length) {
    sections.push(
      `<div class="plan-section destructive"><h3>List item type changes</h3><ul>${plan.itemTypeChanged
        .map((c) => `<li>${escapeHtml(c.id)}: ${escapeHtml(c.from || 'unspecified')} → ${escapeHtml(c.to || 'unspecified')}</li>`)
        .join('')}</ul></div>`
    );
  }
  if (plan.enumShrunk && plan.enumShrunk.length) {
    sections.push(
      `<div class="plan-section destructive"><h3>Removed options</h3><ul>${plan.enumShrunk
        .map((c) => `<li>${escapeHtml(c.id)} lost: ${escapeHtml(c.removedOptions.join(', '))}</li>`)
        .join('')}</ul></div>`
    );
  }
  if (plan.rangeTightened && plan.rangeTightened.length) {
    sections.push(
      `<div class="plan-section destructive"><h3>Number ranges tightened</h3><ul>${plan.rangeTightened
        .map((c) => `<li>${escapeHtml(c.id)}: ${escapeHtml(String(c.old.min))}-${escapeHtml(String(c.old.max))} → ${escapeHtml(String(c.next.min))}-${escapeHtml(String(c.next.max))}</li>`)
        .join('')}</ul></div>`
    );
  }
  if (!sections.length) {
    sections.push('<p>No structural changes detected. Committing will update labels and metadata only.</p>');
  }
  return sections.join('');
}

function showMigrationWizard(nextSchema, plan, onComplete) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = '<h2>Review Schema Changes</h2>';

  const summary = document.createElement('div');
  summary.className = 'plan-summary';
  summary.innerHTML = renderPlanSummaryHtml(plan);
  modal.appendChild(summary);

  const defaults = {};
  if (plan.added && plan.added.length) {
    const defBox = document.createElement('div');
    defBox.className = 'field-group';
    const heading = document.createElement('h3');
    heading.textContent = 'Defaults for new fields';
    defBox.appendChild(heading);
    plan.added.forEach((field) => {
      defaults[field.id] = defaultValueForField(field);
      const row = document.createElement('div');
      row.className = 'schema-defaults-row';
      const label = document.createElement('label');
      label.textContent = `${field.label || field.id}`;
      row.appendChild(label);
      if (field.type === 'multi-select' || field.type === 'list') {
        const note = document.createElement('span');
        note.className = 'schema-info-text';
        note.textContent = 'Defaults to empty list';
        note.style.flex = '1';
        row.appendChild(note);
      } else if (field.type === 'enum') {
        const select = document.createElement('select');
        const blank = document.createElement('option');
        blank.value = '';
        blank.textContent = 'Leave blank';
        select.appendChild(blank);
        (field.options || []).forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });
        select.addEventListener('change', () => {
          defaults[field.id] = select.value;
        });
        row.appendChild(select);
      } else {
        const input = document.createElement('input');
        input.type = field.type === 'number' ? 'number' : 'text';
        input.placeholder = field.type === 'number' ? '(leave blank for null)' : '(leave blank)';
        input.addEventListener('input', () => {
          if (field.type === 'number') {
            defaults[field.id] = input.value === '' ? null : Number(input.value);
          } else {
            defaults[field.id] = input.value;
          }
        });
        row.appendChild(input);
      }
      defBox.appendChild(row);
    });
    modal.appendChild(defBox);
  }

  const info = document.createElement('p');
  info.className = 'schema-info-text';
  info.textContent = 'You may wish to export a backup before applying destructive changes.';
  modal.appendChild(info);

  const actions = document.createElement('div');
  actions.className = 'actions';

  const backupBtn = document.createElement('button');
  backupBtn.className = 'cancel-btn';
  backupBtn.textContent = 'Export Backup';
  backupBtn.addEventListener('click', exportSession);
  actions.appendChild(backupBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cancel-btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(backdrop);
  });
  actions.appendChild(cancelBtn);

  const commitBtn = document.createElement('button');
  commitBtn.className = 'save-btn';
  commitBtn.textContent = 'Commit & Migrate';
  commitBtn.addEventListener('click', async () => {
    const destructive = (plan.removed?.length || 0) +
      (plan.typeChanged?.length || 0) +
      (plan.itemTypeChanged?.length || 0) +
      (plan.enumShrunk?.length || 0) +
      (plan.rangeTightened?.length || 0);
    if (destructive && !confirm('Destructive changes detected. Proceed?')) {
      return;
    }
    try {
      await applyMigration(state.schema, nextSchema, plan, defaults);
      document.body.removeChild(backdrop);
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
      alert('Failed to apply migration.');
    }
  });
  actions.appendChild(commitBtn);

  modal.appendChild(actions);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

async function applyMigration(oldSchema, newSchema, plan, defaultsByField) {
  plan = plan || {};
  const deck = state.manifest.deck;
  const defaults = defaultsByField || {};
  const newMap = indexById(newSchema.fields || []);

  (plan.added || []).forEach((field) => {
    const def = defaults[field.id] !== undefined ? defaults[field.id] : defaultValueForField(field);
    deck.forEach((card) => {
      if (card.data[field.id] !== undefined) return;
      if (Array.isArray(def)) {
        card.data[field.id] = [...def];
      } else if (typeof def === 'object' && def !== null) {
        card.data[field.id] = deepClone(def);
      } else {
        card.data[field.id] = def;
      }
    });
  });

  (plan.removed || []).forEach((field) => {
    deck.forEach((card) => {
      delete card.data[field.id];
    });
  });

  (plan.typeChanged || []).forEach((change) => {
    const newField = newMap.get(change.id);
    if (!newField) return;
    deck.forEach((card) => {
      card.data[change.id] = convertOrReset(newField, card.data[change.id]);
    });
  });

  (plan.itemTypeChanged || []).forEach((change) => {
    const newField = newMap.get(change.id);
    if (!newField) return;
    deck.forEach((card) => {
      card.data[change.id] = convertOrReset(newField, card.data[change.id]);
    });
  });

  (plan.enumShrunk || []).forEach((change) => {
    const newField = newMap.get(change.id);
    if (!newField) return;
    deck.forEach((card) => {
      card.data[change.id] = convertOrReset(newField, card.data[change.id]);
    });
  });

  (plan.rangeTightened || []).forEach((change) => {
    const newField = newMap.get(change.id);
    if (!newField) return;
    deck.forEach((card) => {
      card.data[change.id] = clampIfNeeded(newField, card.data[change.id]);
    });
  });

  state.schema = newSchema;
  state.manifest.schema = newSchema;
  state.schemaHash = await hashSchema(newSchema);
  state.manifest.schemaHash = state.schemaHash;
  saveSession();
  renderApp();
  alert('Schema updated and cards migrated.');
}

/**
 * Export the current session manifest as a JSON file.
 */
function exportSession() {
  downloadJson(state.manifest, 'journal_session.jfpack');
}

function exportCard(cardId) {
  if (!cardTransfer) {
    alert('Card transfer tools are unavailable.');
    return;
  }
  const card = state.manifest.deck.find((c) => c.cardId === cardId);
  if (!card) return;
  const payload = cardTransfer.prepareCardExportPayload(
    { schemaId: state.schema.schemaId, schemaHash: state.schemaHash },
    card
  );
  const fallback = card.cardId;
  const slug = slugifyForFilename(card.data.fullName, fallback);
  downloadJson(payload, `${slug}.jfcard`);
}

function slugifyForFilename(name, fallback) {
  if (!name) return fallback;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function downloadJson(data, filename) {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

// Kick off initialization on page load
init().catch((err) => {
  console.error(err);
  const app = document.getElementById('app');
  app.textContent = 'Error initializing application';
});