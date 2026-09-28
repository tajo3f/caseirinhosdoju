const assert = require('node:assert/strict');
const rules = require('../assets/js/availability.js');
const at = s => new Date(s + '-03:00');
const cases = [
  ['esfirra','2026-09-24T18:29:59',false],['esfirra','2026-09-24T18:30:00',true],
  ['esfirra','2026-09-24T21:59:59',true],['esfirra','2026-09-24T22:00:00',false],
  ['esfirra','2026-09-25T18:29:00',false],['esfirra','2026-09-25T19:30:00',true],
  ['esfirra','2026-09-26T18:30:00',true],['esfirra','2026-09-26T22:00:00',false],
  ['esfirra','2026-09-27T19:00:00',false],['esfirra','2026-09-28T19:00:00',false],
  ['bread','2026-09-25T23:59:59',false],['bread','2026-09-26T00:00:00',true],
  ['bread','2026-09-27T23:59:59',true],['bread','2026-09-28T00:00:00',false],
  ['regular','2026-09-28T00:00:00',true],['consult','2026-09-28T00:00:00',false]
];
for (const [kind,instant,expected] of cases) assert.equal(rules.getState(kind,at(instant)).allowed,expected,kind+' '+instant);
assert.match(rules.getState('esfirra',at('2026-09-26T22:00:00')).detail,/quinta-feira/);
assert.match(rules.getState('esfirra',at('2026-09-25T17:00:00')).detail,/hoje, às 18h30/);
assert.match(rules.getState('bread',at('2026-09-28T10:00:00')).detail,/sábado/);
assert.equal(rules.getState('bread',at('2026-09-28T10:00:00')).label,'Pães somente por encomenda');
console.log('PASS: '+(cases.length+4)+' V12 availability and next-window assertions');
