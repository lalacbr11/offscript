import assert from 'node:assert/strict';
import { ideas } from '../src/dateIdeas.ts';

assert.equal(ideas.length, 36, 'Expected the submitted collection of 36 dates');
assert.equal(new Set(ideas.map(i => i.id)).size, ideas.length, 'Duplicate date IDs');
for (const idea of ideas) {
  assert.ok(idea.title && idea.invitation && idea.costAssumption, `Missing description: ${idea.id}`);
  assert.ok(Number.isFinite(idea.cost) && idea.cost >= 0, `Invalid cost: ${idea.id}`);
  assert.equal(idea.steps.length, 3, `Expected three steps: ${idea.id}`);
  assert.ok(idea.steps.every(step => step.minutes > 0), `Invalid step timing: ${idea.id}`);
  assert.equal(idea.steps.reduce((sum, step) => sum + step.minutes, 0), idea.duration, `Timing mismatch: ${idea.id}`);
}
const shortFreeOutings = ideas.filter(i => i.cost === 0 && i.duration <= 60 && i.location === 'Going out' && !i.avoid.some(a => ['Food activities', 'Shopping', 'Screens'].includes(a)));
assert.ok(shortFreeOutings.length >= 6, `Expected six free short outings, got ${shortFreeOutings.length}`);
console.log(`PASS: ${ideas.length} unique dates; all step timings reconcile; ${shortFreeOutings.length} qualifying free short outings.`);
console.log('Data integrity only: this script does not test UI navigation, matching implementation, or browser storage.');
