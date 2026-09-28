const assert=require('node:assert/strict');
const rules=require('../assets/js/availability.js');
const at=s=>new Date(s+'-03:00');
const cases=[
 ['2026-09-24T18:29:59',false],['2026-09-24T18:30:00',true],['2026-09-24T21:59:59',true],['2026-09-24T22:00:00',false],
 ['2026-09-25T19:00:00',true],['2026-09-26T19:00:00',true],['2026-09-27T19:00:00',false],['2026-09-28T19:00:00',false]];
for(const [time, expected] of cases) assert.equal(rules.getState('esfirra',at(time)).allowed,expected,time);
assert.equal(rules.getState('bread',at('2026-09-26T15:00:00')).allowed,true);
assert.equal(rules.getState('bread',at('2026-09-28T15:00:00')).allowed,false);
assert.match(rules.getState('esfirra',at('2026-09-26T22:00:00')).detail,/Próxima abertura:/);
console.log('PASS: 11 V16 availability boundary assertions');
