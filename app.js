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

function deepClone(obj) {
  return obj == null ? obj : JSON.parse(JSON.stringify(obj));
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((v) => cloneValue(v));
  if (value && typeof value === 'object') return JSON.parse(JSON.stringify(value));
  return value;
}

function defaultValueForField(field) {
  switch (field.type) {
    case 'number':
      return null;
    case 'multi-select':
    case 'list':
      return [];
    case 'enum':
      return '';
    default:
      return '';
  }
}

function isValidUrl(value) {
  if (typeof value !== 'string' || !value) return false;
  try {
    new URL(value);
    return true;
  } catch (err) {
    return false;
  }
}

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

function hashSchema(schema) {
  return computeHash(JSON.stringify(schema));
}

function validateSchemaDraft(schema) {
  const errors = [];
  if (!schema || !Array.isArray(schema.fields) || schema.fields.length === 0) {
    errors.push('Schema must define at least one field.');
    return errors;
  }
  const ids = new Set();
  const idPattern = /^[a-zA-Z0-9_]+$/;
  schema.fields.forEach((field) => {
    if (!field.id || !idPattern.test(field.id)) {
      errors.push(`Field "${field.label || field.id || 'unnamed'}" must have an alphanumeric id.`);
    } else if (ids.has(field.id)) {
      errors.push(`Duplicate field id "${field.id}" detected.`);
    }
    ids.add(field.id);
    if (!field.label) errors.push(`Field ${field.id} requires a label.`);
    if (!field.type) errors.push(`Field ${field.id} requires a type.`);
    if (field.type === 'number') {
      if (field.min == null || field.max == null) {
        errors.push(`Number field ${field.id} must define min and max.`);
      } else if (field.min > field.max) {
        errors.push(`Number field ${field.id} has min greater than max.`);
      }
    }
    if (field.type === 'enum' || field.type === 'multi-select') {
      if (!Array.isArray(field.options) || field.options.length === 0) {
        errors.push(`Field ${field.id} must define at least one option.`);
      }
    }
    if (field.type === 'list') {
      const allowed = ['string', 'url'];
      if (!allowed.includes(field.itemType)) {
        errors.push(`List field ${field.id} must specify itemType string or url.`);
      }
    }
    if (field.radar && field.type !== 'number') {
      errors.push(`Only number fields can appear on the radar chart (${field.id}).`);
    }
    if (field.radar && !['sum', 'mean', 'max'].includes(field.boardAggregate || '')) {
      errors.push(`Radar field ${field.id} must specify boardAggregate (sum, mean or max).`);
    }
  });
  const requiredCore = Array.isArray(schema.requiredCoreFields) ? schema.requiredCoreFields : [];
  requiredCore.forEach((coreId) => {
    if (!ids.has(coreId)) errors.push(`Required core field ${coreId} is missing.`);
  });
  if (schema.defaultSort && schema.defaultSort.field) {
    if (!ids.has(schema.defaultSort.field)) {
      errors.push('Default sort field must reference an existing field.');
    }
  }
  return errors;
}

function indexById(fields) {
  const map = new Map();
  fields.forEach((field) => map.set(field.id, field));
  return map;
}

function diffSchemas(oldSchema, newSchema) {
  const oldMap = indexById(oldSchema.fields);
  const newMap = indexById(newSchema.fields);
  const plan = {
    added: [],
    removed: [],
    typeChanged: [],
    itemTypeChanged: [],
    enumShrunk: [],
    rangeTightened: []
  };

  newSchema.fields.forEach((field) => {
    if (!oldMap.has(field.id)) plan.added.push(field);
  });

  oldSchema.fields.forEach((field) => {
    if (!newMap.has(field.id)) plan.removed.push(field);
  });

  oldSchema.fields.forEach((field) => {
    const next = newMap.get(field.id);
    if (!next) return;
    if (field.type !== next.type) {
      plan.typeChanged.push({ id: field.id, from: field.type, to: next.type });
    }
    if (field.type === 'list' && next.type === 'list' && field.itemType !== next.itemType) {
      plan.itemTypeChanged.push({ id: field.id, from: field.itemType, to: next.itemType });
    }
    if ((field.type === 'enum' || field.type === 'multi-select') && Array.isArray(field.options) && Array.isArray(next.options)) {
      const removedOptions = field.options.filter((opt) => !next.options.includes(opt));
      if (removedOptions.length) {
        plan.enumShrunk.push({ id: field.id, removedOptions });
      }
    }
    if (field.type === 'number' && next.type === 'number') {
      const tightened = (next.min ?? field.min ?? 0) > (field.min ?? 0) || (next.max ?? field.max ?? 0) < (field.max ?? 0);
      if (tightened) {
        plan.rangeTightened.push({
          id: field.id,
          old: { min: field.min, max: field.max },
          next: { min: next.min, max: next.max }
        });
      }
    }
  });
  return plan;
}

function planHasDestructiveChanges(plan) {
  return (
    plan.removed.length > 0 ||
    plan.typeChanged.length > 0 ||
    plan.enumShrunk.length > 0 ||
    plan.itemTypeChanged.length > 0
  );
}

// No network load: JSON assets are embedded. loadJson remains unused.

/**
 * Initialize the application: load schema, compute hash, load or create a session.
 */
async function init() {
  const baselineHash = await hashSchema(EMBEDDED_SCHEMA);
  let manifest = null;
  const stored = localStorage.getItem('jf_session');
  if (stored) {
    try {
      manifest = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored session', e);
    }
  }

  let needsSave = false;

  if (!manifest) {
    const schemaCopy = deepClone(EMBEDDED_SCHEMA);
    manifest = createManifestFromDefaults(schemaCopy, baselineHash);
    needsSave = true;
  } else {
    if (!manifest.schema) {
      manifest.schema = deepClone(EMBEDDED_SCHEMA);
      manifest.schemaHash = baselineHash;
      needsSave = true;
    }
    if (!manifest.schemaHash) {
      manifest.schemaHash = await hashSchema(manifest.schema);
      needsSave = true;
    }
    if (!manifest.schemaId && manifest.schema) {
      manifest.schemaId = manifest.schema.schemaId;
      needsSave = true;
    }
    if (!manifest.deck) {
      manifest.deck = [];
      needsSave = true;
    }
    if (!manifest.board) {
      manifest.board = {
        boardId: 'default',
        slots: [
          { slotId: generateId(), name: 'Director' },
          { slotId: generateId(), name: 'Secretary' },
          { slotId: generateId(), name: 'Treasurer' }
        ],
        assignments: []
      };
      needsSave = true;
    }
  }

  state.manifest = manifest;
  state.schema = manifest.schema;
  state.schemaHash = manifest.schemaHash;
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
  if (!state.manifest) return;
  state.manifest.schema = state.schema;
  state.manifest.schemaHash = state.schemaHash;
  state.manifest.updatedAt = new Date().toISOString();
  localStorage.setItem('jf_session', JSON.stringify(state.manifest));
}

function createManifestFromDefaults(schema, schemaHash) {
  const deck = EMBEDDED_DEFAULTS.map((card) => ({
    cardId: card.cardId || generateId(),
    image: card.image || '',
    data: deepClone(card.data || {}),
    notes: Array.isArray(card.notes) ? deepClone(card.notes) : []
  }));
  return {
    manifestVersion: '1.0',
    appVersion: '0.1',
    schemaId: schema.schemaId,
    schemaHash,
    schema,
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
  if (!state.manifest || !state.schema) {
    app.textContent = 'Loading…';
    return;
  }

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

  const schemaBtn = document.createElement('button');
  schemaBtn.className = 'add-card-btn schema-edit-btn';
  schemaBtn.textContent = 'Edit Schema';
  schemaBtn.addEventListener('click', () => {
    showSchemaEditor();
  });
  container.appendChild(schemaBtn);

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

  // Sticky footer inside the Deck panel
  renderDeckFooter(container);
}

function showSchemaEditor() {
  if (!state.schema) return;
  const draft = deepClone(state.schema);
  draft.requiredCoreFields = Array.isArray(draft.requiredCoreFields)
    ? draft.requiredCoreFields
    : [];
  if (!draft.defaultSort) {
    draft.defaultSort = {
      field: draft.fields[0] ? draft.fields[0].id : '',
      direction: 'desc'
    };
  }
  const originalIds = new Set(state.schema.fields.map((f) => f.id));
  const deckSize = state.manifest ? state.manifest.deck.length : 0;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.className = 'modal schema-modal';

  const title = document.createElement('h2');
  title.textContent = 'Edit Schema';
  modal.appendChild(title);

  const intro = document.createElement('p');
  intro.textContent = 'Adjust the fields that every card in this session uses.';
  modal.appendChild(intro);

  const layout = document.createElement('div');
  layout.className = 'schema-editor-layout';
  modal.appendChild(layout);

  const fieldsCol = document.createElement('div');
  fieldsCol.className = 'schema-fields-column';
  layout.appendChild(fieldsCol);

  const fieldsPane = document.createElement('div');
  fieldsPane.className = 'schema-field-list';
  fieldsCol.appendChild(fieldsPane);

  const addFieldRow = document.createElement('div');
  addFieldRow.className = 'schema-add-field-row';
  const addFieldBtn = document.createElement('button');
  addFieldBtn.type = 'button';
  addFieldBtn.className = 'add-card-btn schema-add-field-btn';
  addFieldBtn.textContent = 'Add Dimension';
  addFieldBtn.addEventListener('click', () => {
    const id = generateFieldId();
    draft.fields.push({
      id,
      label: 'New Dimension',
      type: 'number',
      min: 0,
      max: 10,
      radar: true,
      boardAggregate: 'mean'
    });
    renderFields();
    renderMeta();
  });
  addFieldRow.appendChild(addFieldBtn);
  fieldsCol.appendChild(addFieldRow);

  const metaPane = document.createElement('div');
  metaPane.className = 'schema-meta-panel';
  layout.appendChild(metaPane);

  function generateFieldId() {
    let candidate = '';
    do {
      candidate = `field_${Math.random().toString(36).slice(2, 8)}`;
    } while (draft.fields.some((f) => f.id === candidate));
    return candidate;
  }

  function renderFields() {
    fieldsPane.innerHTML = '';
    draft.fields.forEach((field, index) => {
      const card = document.createElement('div');
      card.className = 'schema-field-card';

      const header = document.createElement('div');
      header.className = 'schema-field-header';
      header.textContent = `${field.label || 'Untitled'} (${field.id})`;
      card.appendChild(header);

      const idLabel = document.createElement('label');
      idLabel.textContent = 'Field ID';
      const idInput = document.createElement('input');
      idInput.type = 'text';
      idInput.value = field.id;
      if (originalIds.has(field.id)) {
        idInput.readOnly = true;
        idInput.className = 'schema-locked-input';
        idInput.title = 'IDs for existing fields cannot be changed.';
      } else {
        idInput.addEventListener('input', () => {
          field.id = idInput.value.trim();
          header.textContent = `${field.label || 'Untitled'} (${field.id})`;
          renderMeta();
        });
      }
      idLabel.appendChild(idInput);
      card.appendChild(idLabel);

      const labelLabel = document.createElement('label');
      labelLabel.textContent = 'Label';
      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.value = field.label || '';
      labelInput.addEventListener('input', () => {
        field.label = labelInput.value;
        header.textContent = `${field.label || 'Untitled'} (${field.id})`;
        renderMeta();
      });
      labelLabel.appendChild(labelInput);
      card.appendChild(labelLabel);

      const typeLabel = document.createElement('label');
      typeLabel.textContent = 'Type';
      const typeSelect = document.createElement('select');
      ['string', 'text', 'number', 'enum', 'multi-select', 'list', 'url'].forEach((type) => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type;
        if (field.type === type) opt.selected = true;
        typeSelect.appendChild(opt);
      });
      typeSelect.addEventListener('change', () => {
        field.type = typeSelect.value;
        if (field.type === 'number') {
          field.min = field.min ?? 0;
          field.max = field.max ?? 10;
        }
        if (field.type === 'enum' || field.type === 'multi-select') {
          field.options = Array.isArray(field.options) && field.options.length ? field.options : ['Option'];
        }
        if (field.type === 'list') {
          field.itemType = field.itemType || 'string';
        }
        if (field.type !== 'number') {
          field.radar = false;
          delete field.boardAggregate;
        }
        renderFields();
        renderMeta();
      });
      typeLabel.appendChild(typeSelect);
      card.appendChild(typeLabel);

      if (field.type === 'number') {
        const minLabel = document.createElement('label');
        minLabel.textContent = 'Minimum';
        const minInput = document.createElement('input');
        minInput.type = 'number';
        minInput.value = field.min ?? 0;
        minInput.addEventListener('input', () => {
          field.min = minInput.value === '' ? null : Number(minInput.value);
        });
        minLabel.appendChild(minInput);
        card.appendChild(minLabel);

        const maxLabel = document.createElement('label');
        maxLabel.textContent = 'Maximum';
        const maxInput = document.createElement('input');
        maxInput.type = 'number';
        maxInput.value = field.max ?? 10;
        maxInput.addEventListener('input', () => {
          field.max = maxInput.value === '' ? null : Number(maxInput.value);
        });
        maxLabel.appendChild(maxInput);
        card.appendChild(maxLabel);
      }

      if (field.type === 'string') {
        const maxLenLabel = document.createElement('label');
        maxLenLabel.textContent = 'Max length (optional)';
        const maxLenInput = document.createElement('input');
        maxLenInput.type = 'number';
        maxLenInput.value = field.maxLength || '';
        maxLenInput.addEventListener('input', () => {
          field.maxLength = maxLenInput.value === '' ? undefined : Number(maxLenInput.value);
        });
        maxLenLabel.appendChild(maxLenInput);
        card.appendChild(maxLenLabel);
      }

      if (field.type === 'enum' || field.type === 'multi-select') {
        const optionsLabel = document.createElement('label');
        optionsLabel.textContent = 'Options (one per line)';
        const optionsArea = document.createElement('textarea');
        optionsArea.rows = 3;
        optionsArea.value = Array.isArray(field.options) ? field.options.join('\n') : '';
        optionsArea.addEventListener('input', () => {
          field.options = optionsArea.value
            .split(/\n+/)
            .map((v) => v.trim())
            .filter(Boolean);
        });
        optionsLabel.appendChild(optionsArea);
        card.appendChild(optionsLabel);
      }

      if (field.type === 'list') {
        const itemLabel = document.createElement('label');
        itemLabel.textContent = 'List item type';
        const itemSelect = document.createElement('select');
        ['string', 'url'].forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          if (field.itemType === opt) option.selected = true;
          itemSelect.appendChild(option);
        });
        itemSelect.addEventListener('change', () => {
          field.itemType = itemSelect.value;
        });
        itemLabel.appendChild(itemSelect);
        card.appendChild(itemLabel);

        const maxItemsLabel = document.createElement('label');
        maxItemsLabel.textContent = 'Max items (optional)';
        const maxItemsInput = document.createElement('input');
        maxItemsInput.type = 'number';
        maxItemsInput.value = field.maxItems || '';
        maxItemsInput.addEventListener('input', () => {
          field.maxItems = maxItemsInput.value === '' ? undefined : Number(maxItemsInput.value);
        });
        maxItemsLabel.appendChild(maxItemsInput);
        card.appendChild(maxItemsLabel);
      }

      const flagsRow = document.createElement('div');
      flagsRow.className = 'schema-flag-row';

      const requiredLabel = document.createElement('label');
      const requiredCb = document.createElement('input');
      requiredCb.type = 'checkbox';
      requiredCb.checked = Boolean(field.required);
      requiredCb.addEventListener('change', () => {
        field.required = requiredCb.checked;
      });
      requiredLabel.appendChild(requiredCb);
      requiredLabel.appendChild(document.createTextNode(' Required'));
      flagsRow.appendChild(requiredLabel);

      const uniqueLabel = document.createElement('label');
      const uniqueCb = document.createElement('input');
      uniqueCb.type = 'checkbox';
      uniqueCb.checked = Boolean(field.unique);
      uniqueCb.addEventListener('change', () => {
        field.unique = uniqueCb.checked;
      });
      uniqueLabel.appendChild(uniqueCb);
      uniqueLabel.appendChild(document.createTextNode(' Unique'));
      flagsRow.appendChild(uniqueLabel);

      const frontLabel = document.createElement('label');
      const frontCb = document.createElement('input');
      frontCb.type = 'checkbox';
      frontCb.checked = Boolean(field.cardFront);
      frontCb.addEventListener('change', () => {
        field.cardFront = frontCb.checked;
      });
      frontLabel.appendChild(frontCb);
      frontLabel.appendChild(document.createTextNode(' Show on card front'));
      flagsRow.appendChild(frontLabel);

      if (field.type === 'number') {
        const radarLabel = document.createElement('label');
        const radarCb = document.createElement('input');
        radarCb.type = 'checkbox';
        radarCb.checked = Boolean(field.radar);
        radarCb.addEventListener('change', () => {
          field.radar = radarCb.checked;
          if (!field.radar) delete field.boardAggregate;
          else field.boardAggregate = field.boardAggregate || 'max';
          renderMeta();
          renderFields();
        });
        radarLabel.appendChild(radarCb);
        radarLabel.appendChild(document.createTextNode(' Show on radar'));
        flagsRow.appendChild(radarLabel);

        if (field.radar) {
          const aggLabel = document.createElement('label');
          aggLabel.textContent = 'Board aggregate';
          const aggSelect = document.createElement('select');
          ['max', 'mean', 'sum'].forEach((opt) => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            if (field.boardAggregate === opt) option.selected = true;
            aggSelect.appendChild(option);
          });
          aggSelect.addEventListener('change', () => {
            field.boardAggregate = aggSelect.value;
          });
          aggLabel.appendChild(aggSelect);
          card.appendChild(aggLabel);
        }
      }

      card.appendChild(flagsRow);

      const controls = document.createElement('div');
      controls.className = 'schema-field-controls';
      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.textContent = 'Move Up';
      upBtn.disabled = index === 0;
      upBtn.addEventListener('click', () => {
        const [item] = draft.fields.splice(index, 1);
        draft.fields.splice(index - 1, 0, item);
        renderFields();
        renderMeta();
      });
      controls.appendChild(upBtn);

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.textContent = 'Move Down';
      downBtn.disabled = index === draft.fields.length - 1;
      downBtn.addEventListener('click', () => {
        const [item] = draft.fields.splice(index, 1);
        draft.fields.splice(index + 1, 0, item);
        renderFields();
        renderMeta();
      });
      controls.appendChild(downBtn);

      const isProtected = draft.requiredCoreFields.includes(field.id);
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'schema-inline-danger';
      removeBtn.textContent = 'Remove';
      removeBtn.disabled = isProtected;
      removeBtn.addEventListener('click', () => {
        if (isProtected) return;
        if (confirm('Removing this field will delete its data on every card. Continue?')) {
          draft.fields.splice(index, 1);
          renderFields();
          renderMeta();
        }
      });
      controls.appendChild(removeBtn);

      card.appendChild(controls);
      fieldsPane.appendChild(card);
    });
  }

  function renderMeta() {
    metaPane.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = 'Schema Settings';
    metaPane.appendChild(heading);

    const sortFieldLabel = document.createElement('label');
    sortFieldLabel.textContent = 'Default sort field';
    const sortSelect = document.createElement('select');
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = 'None';
    sortSelect.appendChild(blank);
    draft.fields.forEach((field) => {
      const opt = document.createElement('option');
      opt.value = field.id;
      opt.textContent = field.label || field.id;
      if (draft.defaultSort && draft.defaultSort.field === field.id) opt.selected = true;
      sortSelect.appendChild(opt);
    });
    sortSelect.addEventListener('change', () => {
      draft.defaultSort = draft.defaultSort || { direction: 'desc' };
      draft.defaultSort.field = sortSelect.value;
    });
    sortFieldLabel.appendChild(sortSelect);
    metaPane.appendChild(sortFieldLabel);

    const dirLabel = document.createElement('label');
    dirLabel.textContent = 'Sort direction';
    const dirSelect = document.createElement('select');
    ['asc', 'desc'].forEach((dir) => {
      const opt = document.createElement('option');
      opt.value = dir;
      opt.textContent = dir.toUpperCase();
      if (draft.defaultSort && draft.defaultSort.direction === dir) opt.selected = true;
      dirSelect.appendChild(opt);
    });
    dirSelect.addEventListener('change', () => {
      draft.defaultSort = draft.defaultSort || { field: '' };
      draft.defaultSort.direction = dirSelect.value;
    });
    dirLabel.appendChild(dirSelect);
    metaPane.appendChild(dirLabel);

    const radarHeading = document.createElement('h4');
    radarHeading.textContent = 'Radar axes';
    metaPane.appendChild(radarHeading);
    const radarList = document.createElement('ul');
    radarList.className = 'schema-radar-list';
    const radarFields = draft.fields.filter((f) => f.radar);
    if (!radarFields.length) {
      const item = document.createElement('li');
      item.textContent = 'No numeric fields marked for the radar chart.';
      radarList.appendChild(item);
    } else {
      radarFields.forEach((field) => {
        const item = document.createElement('li');
        item.textContent = field.label || field.id;
        radarList.appendChild(item);
      });
    }
    metaPane.appendChild(radarList);

    const deckInfo = document.createElement('p');
    deckInfo.className = 'schema-meta-note';
    deckInfo.textContent = `${deckSize} cards will be migrated when changes are committed.`;
    metaPane.appendChild(deckInfo);
  }

  renderFields();
  renderMeta();

  const actions = document.createElement('div');
  actions.className = 'actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cancel-btn';
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(backdrop);
  });
  actions.appendChild(cancelBtn);

  const reviewBtn = document.createElement('button');
  reviewBtn.className = 'save-btn';
  reviewBtn.type = 'button';
  reviewBtn.textContent = 'Review & Migrate';
  reviewBtn.addEventListener('click', () => {
    const draftCopy = deepClone(draft);
    const errors = validateSchemaDraft(draftCopy);
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }
    const plan = diffSchemas(state.schema, draftCopy);
    document.body.removeChild(backdrop);
    showMigrationWizard(draftCopy, plan);
  });
  actions.appendChild(reviewBtn);

  modal.appendChild(actions);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function showMigrationWizard(nextSchema, plan) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.className = 'modal schema-modal';

  const title = document.createElement('h2');
  title.textContent = 'Review Schema Changes';
  modal.appendChild(title);

  const countInfo = document.createElement('p');
  const total = state.manifest ? state.manifest.deck.length : 0;
  countInfo.textContent = `${total} cards will be updated.`;
  modal.appendChild(countInfo);

  const summary = document.createElement('div');
  summary.className = 'schema-plan-summary';
  summary.innerHTML = renderPlanSummaryHtml(plan);
  modal.appendChild(summary);

  const destructive = planHasDestructiveChanges(plan);
  const warning = document.createElement('p');
  warning.className = destructive ? 'schema-summary-warning' : 'schema-summary-safe';
  warning.textContent = destructive
    ? 'This migration removes or overwrites data. Export a backup before proceeding.'
    : 'No destructive changes detected.';
  modal.appendChild(warning);

  const defaultControls = new Map();
  if (plan.added.length) {
    const defaultsSection = document.createElement('div');
    defaultsSection.className = 'schema-defaults-section';
    const heading = document.createElement('h3');
    heading.textContent = 'Defaults for new fields';
    defaultsSection.appendChild(heading);
    plan.added.forEach((field) => {
      const row = document.createElement('div');
      row.className = 'schema-default-row';
      const label = document.createElement('label');
      label.textContent = `${field.label || field.id}`;
      const control = buildDefaultControl(field);
      row.appendChild(label);
      row.appendChild(control);
      defaultsSection.appendChild(row);
      defaultControls.set(field.id, { field, element: control });
    });
    modal.appendChild(defaultsSection);
  }

  const actions = document.createElement('div');
  actions.className = 'actions';

  const backupBtn = document.createElement('button');
  backupBtn.type = 'button';
  backupBtn.className = 'cancel-btn';
  backupBtn.textContent = 'Export Backup';
  backupBtn.addEventListener('click', () => {
    exportSession();
  });
  actions.appendChild(backupBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'cancel-btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(backdrop);
  });
  actions.appendChild(cancelBtn);

  const commitBtn = document.createElement('button');
  commitBtn.type = 'button';
  commitBtn.className = 'save-btn';
  commitBtn.textContent = 'Commit & Migrate';
  commitBtn.addEventListener('click', async () => {
    const defaults = {};
    defaultControls.forEach(({ field, element }) => {
      defaults[field.id] = readDefaultValueFromInput(field, element);
    });
    if (destructive) {
      const confirmed = confirm('This will remove fields or rewrite data on all cards. Continue?');
      if (!confirmed) return;
    }
    commitBtn.disabled = true;
    commitBtn.textContent = 'Migrating…';
    try {
      await applyMigration(nextSchema, plan, defaults);
      document.body.removeChild(backdrop);
    } catch (err) {
      console.error(err);
      alert('Failed to migrate cards. Check the console for details.');
      commitBtn.disabled = false;
      commitBtn.textContent = 'Commit & Migrate';
    }
  });
  actions.appendChild(commitBtn);

  modal.appendChild(actions);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  function buildDefaultControl(field) {
    if (field.type === 'number') {
      const input = document.createElement('input');
      input.type = 'number';
      input.placeholder = 'Leave blank for null';
      return input;
    }
    if (field.type === 'enum') {
      const select = document.createElement('select');
      const blank = document.createElement('option');
      blank.value = '';
      blank.textContent = '(blank)';
      select.appendChild(blank);
      field.options.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      });
      return select;
    }
    if (field.type === 'multi-select' || field.type === 'list') {
      const textarea = document.createElement('textarea');
      textarea.rows = 2;
      textarea.placeholder = 'One value per line';
      return textarea;
    }
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Leave blank for empty value';
    return input;
  }
}

function readDefaultValueFromInput(field, element) {
  if (field.type === 'number') {
    if (element.value === '') return null;
    const num = Number(element.value);
    return Number.isNaN(num) ? null : num;
  }
  if (field.type === 'enum') {
    return element.value || '';
  }
  if (field.type === 'multi-select' || field.type === 'list') {
    const values = element.value
      .split(/\n+/)
      .map((v) => v.trim())
      .filter(Boolean);
    if (field.type === 'list' && field.itemType === 'url') {
      return values.filter((entry) => isValidUrl(entry));
    }
    return values;
  }
  return element.value || '';
}

function renderPlanSummaryHtml(plan) {
  const sections = [];
  if (plan.added.length) {
    const list = plan.added
      .map((field) => `<li><strong>${escapeHtml(field.label || field.id)}</strong> (${escapeHtml(field.id)})</li>`)
      .join('');
    sections.push(`<section><h3>Added fields</h3><ul class="schema-change-list">${list}</ul></section>`);
  }
  if (plan.removed.length) {
    const list = plan.removed
      .map((field) => `<li>${escapeHtml(field.label || field.id)}</li>`)
      .join('');
    sections.push(`<section><h3 class="schema-summary-warning">Removed fields</h3><ul class="schema-change-list">${list}</ul></section>`);
  }
  if (plan.typeChanged.length) {
    const list = plan.typeChanged
      .map((entry) => `<li>${escapeHtml(entry.id)}: ${escapeHtml(entry.from)} → ${escapeHtml(entry.to)}</li>`)
      .join('');
    sections.push(`<section><h3>Type changes</h3><ul class="schema-change-list">${list}</ul></section>`);
  }
  if (plan.itemTypeChanged.length) {
    const list = plan.itemTypeChanged
      .map((entry) => `<li>${escapeHtml(entry.id)}: ${escapeHtml(entry.from)} → ${escapeHtml(entry.to)}</li>`)
      .join('');
    sections.push(`<section><h3>List item updates</h3><ul class="schema-change-list">${list}</ul></section>`);
  }
  if (plan.enumShrunk.length) {
    const list = plan.enumShrunk
      .map((entry) => `<li>${escapeHtml(entry.id)} removing ${escapeHtml(entry.removedOptions.join(', '))}</li>`)
      .join('');
    sections.push(`<section><h3>Option removals</h3><ul class="schema-change-list">${list}</ul></section>`);
  }
  if (plan.rangeTightened.length) {
    const list = plan.rangeTightened
      .map((entry) => {
        const oldMin = entry.old.min ?? '—';
        const oldMax = entry.old.max ?? '—';
        const newMin = entry.next.min ?? '—';
        const newMax = entry.next.max ?? '—';
        return `<li>${escapeHtml(entry.id)}: ${escapeHtml(`${oldMin}-${oldMax}`)} → ${escapeHtml(`${newMin}-${newMax}`)}</li>`;
      })
      .join('');
    sections.push(`<section><h3>Range changes</h3><ul class="schema-change-list">${list}</ul></section>`);
  }
  if (!sections.length) {
    return '<p>No structural changes detected. Label or display tweaks will be saved immediately.</p>';
  }
  return sections.join('');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function applyMigration(nextSchema, plan, defaults = {}) {
  const deck = state.manifest ? state.manifest.deck : [];
  const nextFieldMap = indexById(nextSchema.fields);
  deck.forEach((card) => {
    card.data = card.data || {};
  });

  plan.added.forEach((field) => {
    deck.forEach((card) => {
      if (card.data[field.id] === undefined) {
        const preset = defaults[field.id];
        const value = preset !== undefined ? preset : defaultValueForField(field);
        card.data[field.id] = cloneValue(value);
      }
    });
  });

  plan.removed.forEach((field) => {
    deck.forEach((card) => {
      if (card.data) delete card.data[field.id];
    });
  });

  plan.typeChanged.forEach(({ id }) => {
    const field = nextFieldMap.get(id);
    deck.forEach((card) => {
      card.data[id] = convertOrReset(field, card.data[id]);
    });
  });

  plan.itemTypeChanged.forEach(({ id }) => {
    const field = nextFieldMap.get(id);
    deck.forEach((card) => {
      card.data[id] = convertOrReset(field, card.data[id]);
    });
  });

  plan.enumShrunk.forEach(({ id }) => {
    const field = nextFieldMap.get(id);
    deck.forEach((card) => {
      card.data[id] = convertOrReset(field, card.data[id]);
    });
  });

  plan.rangeTightened.forEach(({ id }) => {
    const field = nextFieldMap.get(id);
    deck.forEach((card) => {
      card.data[id] = clampIfNeeded(field, card.data[id]);
    });
  });

  const nextSchemaCopy = deepClone(nextSchema);
  state.manifest.schema = nextSchemaCopy;
  state.schema = nextSchemaCopy;
  state.schemaHash = await hashSchema(nextSchemaCopy);
  state.manifest.schemaHash = state.schemaHash;
  saveSession();
  renderApp();
}

function convertOrReset(field, value) {
  if (value === undefined || value === null || value === '') {
    return cloneValue(defaultValueForField(field));
  }
  if (field.type === 'number') {
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return null;
    return clampIfNeeded(field, num);
  }
  if (field.type === 'enum') {
    return field.options.includes(value) ? value : '';
  }
  if (field.type === 'multi-select') {
    if (!Array.isArray(value)) return [];
    return value.filter((entry) => field.options.includes(entry));
  }
  if (field.type === 'list') {
    const list = Array.isArray(value)
      ? value
      : typeof value === 'string'
      ? value.split(/\n+/)
      : [];
    return list
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => {
        if (!entry) return false;
        if (field.itemType === 'url') return isValidUrl(entry);
        return true;
      });
  }
  if (field.type === 'url') {
    return isValidUrl(value) ? value : '';
  }
  if (typeof value !== 'string') {
    return String(value);
  }
  return value;
}

function clampIfNeeded(field, value) {
  if (value === undefined || value === null || value === '') return null;
  const min = field.min ?? 0;
  const max = field.max ?? 10;
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return null;
  return Math.min(max, Math.max(min, num));
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

/** Sticky footer inside the Deck panel. */
function renderDeckFooter(deckContainer) {
  let footer = deckContainer.querySelector('.deck-footer');
  if (!footer) {
    footer = document.createElement('div');
    footer.className = 'deck-footer';
    deckContainer.appendChild(footer);
  }
  const selectedIds = Array.from(state.compareSelection);
  const count = selectedIds.length;

  footer.innerHTML = '';

  const compareGroup = document.createElement('div');
  compareGroup.className = 'deck-footer-group';

  const summary = document.createElement('div');
  summary.className = 'compare-summary';
  summary.textContent = count ? `${count} selected` : 'Select cards to compare';

  const compareActions = document.createElement('div');
  compareActions.className = 'compare-actions';

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

  compareActions.appendChild(clearBtn);
  compareActions.appendChild(compareBtn);
  compareGroup.appendChild(summary);
  compareGroup.appendChild(compareActions);

  const sessionActions = document.createElement('div');
  sessionActions.className = 'deck-footer-group session-actions';

  const exportBtn = document.createElement('button');
  exportBtn.className = 'add-card-btn';
  exportBtn.style.background = '#ffc107';
  exportBtn.style.color = '#333';
  exportBtn.textContent = 'Export Session';
  exportBtn.addEventListener('click', () => {
    exportSession();
  });
  sessionActions.appendChild(exportBtn);

  const importLabel = document.createElement('label');
  importLabel.style.display = 'inline-flex';
  importLabel.style.alignItems = 'center';
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
            alert('Imported session is missing schema metadata.');
            return;
          }
          if (
            json.schemaId === state.schema.schemaId &&
            json.schemaHash === state.schemaHash
          ) {
            state.manifest = json;
            state.schema = json.schema;
            state.manifest.schema = state.schema;
            state.schemaHash = json.schemaHash;
            state.compareSelection.clear();
            saveSession();
            renderApp();
          } else {
            alert('Imported session does not match current schema.');
          }
        } catch (err) {
          alert('Failed to import: invalid file');
        }
      };
      reader.readAsText(file);
    }
  });
  importLabel.appendChild(importInput);
  sessionActions.appendChild(importLabel);

  if (cardTransfer) {
    const importCardLabel = document.createElement('label');
    importCardLabel.style.display = 'inline-flex';
    importCardLabel.style.alignItems = 'center';
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
    sessionActions.appendChild(importCardLabel);
  }

  footer.appendChild(compareGroup);
  footer.appendChild(sessionActions);
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
    {
      schemaId: state.schema.schemaId,
      schemaHash: state.schemaHash,
      schema: state.schema
    },
    card,
    undefined,
    { includeFieldHints: true, includeEmptyFields: true, fillAllFields: true }
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