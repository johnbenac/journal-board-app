const { validateCardData } = require('../validation.js');
const schema = require('../schema.json');
const assert = require('assert');

test('validateCardData: missing required field fullName', () => {
  const data = {
    tagline: 'Test tagline'
  };
  const errors = validateCardData(schema, data);
  assert(errors.some((e) => e.includes('Full Name is required')));
});

test('validateCardData: number out of range', () => {
  const data = {
    fullName: 'Test Person',
    governance: 11 // > max 10
  };
  const errors = validateCardData(schema, data);
  assert(errors.some((e) => e.includes('Governance must be ≤')));
});

test('validateCardData: invalid multi-select option', () => {
  const data = {
    fullName: 'Test Person',
    categories: ['UnknownCategory']
  };
  const errors = validateCardData(schema, data);
  assert(errors.some((e) => e.includes('Categories has invalid selections')));
});

test('validateCardData: valid data passes', () => {
  const data = {
    fullName: 'Valid Person',
    tagline: 'Tagline',
    categories: ['Technologist'],
    governance: 5,
    fundraising: 3,
    publicTrust: 4,
    opsExecution: 6,
    securityPrivacy: 4,
    legalCompliance: 7,
    intlNetwork: 5,
    mediaAgility: 5,
    signaturePowers: ['Leadership'],
    conflicts: '',
    availability: 'Unknown',
    sources: []
  };
  const errors = validateCardData(schema, data);
  assert.strictEqual(errors.length, 0);
});

test('validateCardData: invalid URL in list field', () => {
  const data = {
    fullName: 'Link Checker',
    sources: ['notaurl']
  };
  const errors = validateCardData(schema, data);
  assert(errors.some((e) => e.includes('Reference Links contains an invalid URL')));
});