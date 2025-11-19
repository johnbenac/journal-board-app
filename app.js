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
        if (!Array.isArray(value)) errors.push(`${field.label} must be an array`);
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
  manifest: null
};

const cardTransfer = window.CardTransfer;
if (!cardTransfer) {
  throw new Error('Card transfer utilities failed to load.');
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

// No network load: JSON assets are embedded. loadJson remains unused.

/**
 * Initialize the application: load schema, compute hash, load or create a session.
 */
async function init() {
  // Use embedded schema
  const schema = EMBEDDED_SCHEMA;
  state.schema = schema;
  const schemaString = JSON.stringify(schema);
  state.schemaHash = await computeHash(schemaString);

  // Load the manifest from localStorage if present
  const stored = localStorage.getItem('jf_session');
  if (stored) {
    try {
      const manifest = JSON.parse(stored);
      // Validate schema ID and hash
      if (
        manifest.schemaId === schema.schemaId &&
        manifest.schemaHash === state.schemaHash
      ) {
        state.manifest = manifest;
      } else {
        // Schema mismatch – don't load, we'll show overlay later
        state.manifest = manifest; // still load to allow import/export
      }
    } catch (e) {
      console.error('Failed to parse stored session', e);
    }
  }

  // If no valid manifest, create a new one using embedded defaults
  if (!state.manifest || state.manifest.schemaHash !== state.schemaHash) {
    const defaults = EMBEDDED_DEFAULTS;
    const deck = defaults.map((card) => {
      return {
        cardId: card.cardId || generateId(),
        image: card.image || '',
        data: card.data,
        notes: card.notes || []
      };
    });
    state.manifest = {
      manifestVersion: '1.0',
      appVersion: '0.1',
      schemaId: schema.schemaId,
      schemaHash: state.schemaHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deck,
      board: {
        boardId: 'default',
        slots: [
          { slotId: 'director', name: 'Director' },
          { slotId: 'secretary', name: 'Secretary' },
          { slotId: 'treasurer', name: 'Treasurer' }
        ],
        assignments: []
      }
    };
    saveSession();
  }

  // Render the interface
  renderApp();
}

/**
 * Persist the current manifest to localStorage.
 */
function saveSession() {
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
  // Check schema mismatch; if mismatched, show overlay
  if (state.manifest.schemaHash !== state.schemaHash) {
    app.innerHTML = '';
    const overlay = document.createElement('div');
    overlay.className = 'error-overlay';
    overlay.innerHTML = `<p>Your saved data was created with a different schema.</p><p>Current schema hash: ${state.schemaHash}<br/>Session schema hash: ${state.manifest.schemaHash}</p>`;
    const btn = document.createElement('button');
    btn.textContent = 'Reset & Start Fresh';
    btn.addEventListener('click', () => {
      localStorage.removeItem('jf_session');
      location.reload();
    });
    overlay.appendChild(btn);
    document.body.appendChild(overlay);
    return;
  }
  // Clear previous overlay if exists
  const existingOverlay = document.querySelector('.error-overlay');
  if (existingOverlay) existingOverlay.remove();

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
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export';
    exportBtn.addEventListener('click', () => {
      exportCard(card.cardId);
    });
    item.appendChild(exportBtn);
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
          if (
            json.schemaId === state.schema.schemaId &&
            json.schemaHash === state.schemaHash
          ) {
            state.manifest = json;
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
  controls.appendChild(importLabel);

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
  container.appendChild(controls);
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
    // Delete slot button if not default
    if (!['director', 'secretary', 'treasurer'].includes(slot.slotId)) {
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
    }
    slotDiv.appendChild(slotHeader);

    // Assigned list
    const assignedUl = document.createElement('ul');
    assignedUl.className = 'assigned-list';
    const assignmentsForSlot = state.manifest.board.assignments
      .filter((a) => a.slotId === slot.slotId)
      .sort((a, b) => a.rank - b.rank);
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
  const slotId = name.toLowerCase().replace(/\s+/g, '-');
  state.manifest.board.slots.push({ slotId, name });
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
 * Assign a card to a slot at next available rank.
 * @param {string} slotId
 * @param {string} cardId
 */
function assignCard(slotId, cardId) {
  // Determine next rank
  const assignmentsForSlot = state.manifest.board.assignments.filter(
    (a) => a.slotId === slotId
  );
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

  // Image upload
  const imgGroup = document.createElement('div');
  imgGroup.className = 'field-group';
  const imgLabel = document.createElement('label');
  imgLabel.textContent = 'Image (PNG – editor enforces 750x1050)';
  const imgInput = document.createElement('input');
  imgInput.type = 'file';
  imgInput.accept = 'image/png';
  imgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !window.ImageEditor) return;
    openEditorWithSource(file)
      .then((dataUrl) => {
        imageData = dataUrl;
        imgInput.value = '';
        updateEditButtonState();
      })
      .catch(() => {
        /* cancelled */
      });
  });
  imgLabel.appendChild(imgInput);
  imgGroup.appendChild(imgLabel);

  const editImgBtn = document.createElement('button');
  editImgBtn.type = 'button';
  editImgBtn.textContent = 'Edit Image';
  editImgBtn.addEventListener('click', () => {
    if (!imageData || !window.ImageEditor) return;
    openEditorWithSource(imageData)
      .then((dataUrl) => {
        imageData = dataUrl;
        updateEditButtonState();
      })
      .catch(() => {});
  });
  function updateEditButtonState() {
    editImgBtn.disabled = !imageData;
  }
  updateEditButtonState();
  imgGroup.appendChild(editImgBtn);
  form.appendChild(imgGroup);

  function openEditorWithSource(source) {
    const target = state.schema.imageSpec;
    return window.ImageEditor.open({
      source,
      target: { width: target.width, height: target.height },
      background: '#ffffff',
    });
  }

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