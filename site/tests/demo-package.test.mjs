import test from 'node:test';
import assert from 'node:assert/strict';
import { readSearch, intersectInventory, packageTotal, sampleAvailability, dayNumber } from '../src/lib/demo/package.ts';

const query = { checkIn: '2027-01-15', checkOut: '2027-01-18', guests: 2, rooms: 5, mode: 'sample', scenario: 'normal' };
const rate = (plan = 'STD', beforeTax = 200, afterTax = 220) => ({ plan, beforeTax, afterTax });
const room = (unitsLeft = 5, rates = [rate()], maxGuests = 2) => ({ code: 'K', unitsLeft, rates, maxGuests });

test('invalid dates fail without normalizing or throwing RangeError', () => {
  for (const value of ['2027-02-30', '2027-99-99', '', null]) assert.equal(dayNumber(value), null);
  assert.throws(() => readSearch({ ...query, checkIn: '2027-99-99' }, '2026-11-17'), /valid stay/);
  assert.throws(() => readSearch({ ...query, checkOut: query.checkIn }, '2026-11-17'), /valid stay/);
  assert.throws(() => readSearch({ ...query, checkOut: '2027-02-01' }, '2026-11-17'), /valid stay/);
});
test('group and occupancy are bounded and require whole numbers', () => {
  for (const rooms of [0, 4, 20, 5.5, Infinity]) assert.throws(() => readSearch({ ...query, rooms }, '2026-11-17'));
  for (const guests of [0, 5, 2.5]) assert.throws(() => readSearch({ ...query, guests }, '2026-11-17'));
});
test('full-stay inventory and nightly bottlenecks cap the quantity', () => {
  const result = intersectInventory([room(4)], [[room(9)], [room(2)], [room(6)]], 2);
  assert.equal(result[0].available, 2);
  assert.equal(result[0].beforeCents, 60000);
  assert.equal(result[0].taxCents, 6000);
  assert.equal(intersectInventory([room(1)], [[room(9)], [room(9)]], 2)[0].available, 1);
});
test('missing nights, sold-out nights, invalid capacity and unavailable full stay fail closed', () => {
  assert.deepEqual(intersectInventory([room()], [], 2), []);
  assert.deepEqual(intersectInventory([room()], [[room()], []], 2), []);
  assert.deepEqual(intersectInventory([room()], [[room()], [room(0)]], 2), []);
  assert.deepEqual(intersectInventory([room(0)], [[room()], [room()]], 2), []);
  assert.deepEqual(intersectInventory([room(5, [rate()], 0)], [[room()]], 2), []);
  assert.deepEqual(intersectInventory([room()], [[room()]], 4), []);
});
test('a single rate plan must have valid prices for every night', () => {
  assert.deepEqual(intersectInventory([room()], [[room()], [room(5, [rate('OTHER')])]], 2), []);
  for (const amount of [null, NaN, Infinity, -1]) assert.deepEqual(intersectInventory([room()], [[room(5, [rate('STD', amount)])]], 2), []);
  assert.deepEqual(intersectInventory([room()], [[room(5, [rate('STD', 200, 190)])]], 2), []);
});
test('partial, excessive, unknown and fractional selections never produce a group quote', () => {
  const inventory = sampleAvailability(query).rooms;
  for (const mix of [{ RIVDD: 2 }, { RIVDD: 5 }, { UNKNOWN: 5 }, { RIVDD: 2.5, RIVQ: 2.5 }, { RIVDD: -1, RIVQ: 6 }]) assert.throws(() => packageTotal(inventory, mix, query, 0, 1));
});
test('one total combines a complete room mix, discount, tax and optional tickets', () => {
  const data = sampleAvailability(query);
  const result = packageTotal(data.rooms, { RIVDD: 3, RIVQ: 2 }, query, 8, 2);
  assert.equal(result.lodging, 378000);
  assert.equal(result.discount, 37800);
  assert.equal(result.taxes, 34020);
  assert.equal(result.tickets, 200000);
  assert.equal(result.total, 574220);
  assert.equal(packageTotal(data.rooms, { RIVDD: 3, RIVQ: 2 }, query, 0, 1).tickets, 0);
});
test('ticket quantities cannot exceed the group or stay', () => {
  const inventory = sampleAvailability(query).rooms, mix = { RIVDD: 3, RIVQ: 2 };
  for (const [people, days] of [[11, 1], [-1, 1], [2.5, 1], [2, 4], [2, 0]]) assert.throws(() => packageTotal(inventory, mix, query, people, days));
});
test('fresh lower inventory invalidates a previously complete group selection', () => {
  const mix = { RIVDD: 3, RIVQ: 2 };
  assert.doesNotThrow(() => packageTotal(sampleAvailability(query).rooms, mix, query, 0, 1));
  assert.throws(() => packageTotal(sampleAvailability({ ...query, scenario: 'limited' }).rooms, mix, query, 0, 1), /no longer available/);
});
