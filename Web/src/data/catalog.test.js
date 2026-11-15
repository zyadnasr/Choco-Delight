import assert from 'node:assert/strict';
import test from 'node:test';
import { catalog } from './catalog.js';

test('frontend catalog keeps unique product ids and valid category references', () => {
  const categoryIds = new Set(catalog.categories.map((category) => category.id));
  const productIds = catalog.products.map((product) => product.id);

  assert.equal(new Set(productIds).size, productIds.length);
  assert.ok(catalog.products.every((product) => categoryIds.has(product.category)));
});

test('frontend catalog exposes the dynamic product slugs used by navigation', () => {
  assert.ok(catalog.products.some((product) => product.id === 'dark-70'));
  assert.ok(catalog.products.some((product) => product.id === 'sea-salt'));
  assert.ok(catalog.products.every((product) => product.image && product.price > 0));
});
