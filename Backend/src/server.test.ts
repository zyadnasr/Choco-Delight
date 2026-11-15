import assert from 'node:assert/strict';
import test from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { app, prisma, signUser } from './server.js';

let server: Server;
let baseUrl: string;

test.before(async () => {
  server = await new Promise<Server>((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('GET /api/health returns a healthy service response', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, service: 'choco-delight-api' });
});

test('GET /api/catalog returns active catalog data', async () => {
  const originalCategoryFindMany = prisma.category.findMany;
  const originalProductFindMany = prisma.product.findMany;
  (prisma.category.findMany as any) = async () => [{ id: 'cat-1', name: 'Dark bars', image: 'dark-bars.png' }];
  (prisma.product.findMany as any) = async () => [{ id: 'product-1', slug: 'dark-70', title: '70% Dark Chocolate Bars', price: 415, active: true, category: { id: 'cat-1', name: 'Dark bars' } }];
  try {
    const response = await fetch(`${baseUrl}/api/catalog`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      categories: [{ id: 'cat-1', name: 'Dark bars', image: 'dark-bars.png' }],
      products: [{ id: 'product-1', slug: 'dark-70', title: '70% Dark Chocolate Bars', price: 415, active: true, category: { id: 'cat-1', name: 'Dark bars' } }],
    });
  } finally {
    (prisma.category.findMany as any) = originalCategoryFindMany;
    (prisma.product.findMany as any) = originalProductFindMany;
  }
});

test('GET /api/products/:slug returns a product with its category', async () => {
  const originalFindUnique = prisma.product.findUnique;
  (prisma.product.findUnique as any) = async () => ({ id: 'product-1', slug: 'dark-70', title: '70% Dark Chocolate Bars', price: 415, category: { id: 'cat-1', name: 'Dark bars' } });
  try {
    const response = await fetch(`${baseUrl}/api/products/dark-70`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { id: 'product-1', slug: 'dark-70', title: '70% Dark Chocolate Bars', price: 415, category: { id: 'cat-1', name: 'Dark bars' } });
  } finally {
    (prisma.product.findUnique as any) = originalFindUnique;
  }
});

test('GET /api/products/:slug returns 404 for an unknown slug', async () => {
  const originalFindUnique = prisma.product.findUnique;
  (prisma.product.findUnique as any) = async () => null;
  try {
    const response = await fetch(`${baseUrl}/api/products/unknown-slug`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Product not found' });
  } finally {
    (prisma.product.findUnique as any) = originalFindUnique;
  }
});

test('GET /api/makers returns database-backed makers with active products', async () => {
  const originalFindMany = prisma.maker.findMany;
  (prisma.maker.findMany as any) = async () => [{ id: 'maker-1', slug: 'choco-delight', name: 'Choco Delight', rating: 4.8, products: [{ id: 'product-1', title: '70% Dark Chocolate Bars', active: true }] }];
  try {
    const response = await fetch(`${baseUrl}/api/makers`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [{ id: 'maker-1', slug: 'choco-delight', name: 'Choco Delight', rating: 4.8, products: [{ id: 'product-1', title: '70% Dark Chocolate Bars', active: true }] }]);
  } finally { (prisma.maker.findMany as any) = originalFindMany; }
});

test('GET /api/makers/:slug returns 404 for an unknown maker', async () => {
  const originalFindUnique = prisma.maker.findUnique;
  (prisma.maker.findUnique as any) = async () => null;
  try {
    const response = await fetch(`${baseUrl}/api/makers/unknown-maker`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Maker not found' });
  } finally { (prisma.maker.findUnique as any) = originalFindUnique; }
});

test('GET /api/admin/dashboard rejects non-admin users', async () => {
  const token = signUser({ id: 'user-1', role: 'CUSTOMER', email: 'customer@example.com' });
  const response = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'Admin access required' });
});

test('GET /api/admin/dashboard rejects unauthenticated requests', async () => {
  const response = await fetch(`${baseUrl}/api/admin/dashboard`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Authentication required' });
});

test('GET /api/admin/dashboard returns mocked admin metrics and products', async () => {
  const originals = { countProduct: prisma.product.count, countOrder: prisma.order.count, aggregate: prisma.order.aggregate, findMany: prisma.product.findMany };
  (prisma.product.count as any) = async () => 5;
  (prisma.order.count as any) = async () => 3;
  (prisma.order.aggregate as any) = async () => ({ _sum: { total: 2140 } });
  (prisma.product.findMany as any) = async () => [{ id: 'product-1', title: '70% Dark Chocolate Bars', price: 415, image: 'chocolate-product-source.jpg', active: true, category: { name: 'Dark bars' } }];
  const token = signUser({ id: 'admin-1', role: 'ADMIN', email: 'admin@example.com' });
  try {
    const response = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { metrics: { totalProducts: 5, ordersToday: 3, revenue: 2140 }, products: [{ id: 'product-1', title: '70% Dark Chocolate Bars', price: 415, image: 'chocolate-product-source.jpg', active: true, category: { name: 'Dark bars' } }] });
  } finally {
    (prisma.product.count as any) = originals.countProduct;
    (prisma.order.count as any) = originals.countOrder;
    (prisma.order.aggregate as any) = originals.aggregate;
    (prisma.product.findMany as any) = originals.findMany;
  }
});

test('GET /api/admin/orders returns orders for admins', async () => {
  const originalFindMany = prisma.order.findMany;
  (prisma.order.findMany as any) = async () => [{ id: 'order-1', orderNo: 'CD-000001', status: 'PENDING', total: 415, currency: 'EGP', items: [], user: null }];
  const token = signUser({ id: 'admin-1', role: 'ADMIN', email: 'admin@example.com' });
  try {
    const response = await fetch(`${baseUrl}/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [{ id: 'order-1', orderNo: 'CD-000001', status: 'PENDING', total: 415, currency: 'EGP', items: [], user: null }]);
  } finally { (prisma.order.findMany as any) = originalFindMany; }
});

test('PATCH /api/admin/orders/:id/status updates an order status for admins', async () => {
  const originalUpdate = prisma.order.update;
  (prisma.order.update as any) = async ({ where, data }: any) => ({ id: where.id, orderNo: 'CD-000001', status: data.status, total: 415, currency: 'EGP', items: [], user: null });
  const token = signUser({ id: 'admin-1', role: 'ADMIN', email: 'admin@example.com' });
  try {
    const response = await fetch(`${baseUrl}/api/admin/orders/order-1/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'SHIPPED' }) });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { id: 'order-1', orderNo: 'CD-000001', status: 'SHIPPED', total: 415, currency: 'EGP', items: [], user: null });
  } finally { (prisma.order.update as any) = originalUpdate; }
});

test('GET /api/orders rejects requests without authentication', async () => {
  const response = await fetch(`${baseUrl}/api/orders`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Authentication required' });
});

test('GET /api/orders rejects malformed bearer tokens', async () => {
  const response = await fetch(`${baseUrl}/api/orders`, { headers: { Authorization: 'Bearer invalid-token' } });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Invalid or expired token' });
});

test('POST /api/auth/register validates input before database access', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'not-an-email', password: 'short' }),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Invalid request data',
    details: {
      name: ['String must contain at least 2 character(s)'],
      email: ['Invalid email'],
      password: ['String must contain at least 8 character(s)'],
    },
  });
});

test('POST /api/auth/register stores only a password hash', async () => {
  const originalUserCreate = prisma.user.create;
  let createInput: any;
  (prisma.user.create as any) = async ({ data }: any) => {
    createInput = data;
    return { id: 'user-test', name: data.name, email: data.email, role: 'CUSTOMER' };
  };
  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'register-test@example.com', password: 'safe-password-123' }),
    });
    assert.equal(response.status, 201);
    assert.equal(createInput.name, 'Test User');
    assert.equal(createInput.email, 'register-test@example.com');
    assert.equal(typeof createInput.passwordHash, 'string');
    assert.equal('password' in createInput, false);
  } finally {
    (prisma.user.create as any) = originalUserCreate;
  }
});

test('POST /api/auth/login validates email before database access', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: '' }),
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, 'Invalid request data');
  assert.deepEqual(body.details.email, ['Invalid email']);
});

test('POST /api/orders creates an order from a slug without touching the real database', async () => {
  const originalProductFindMany = prisma.product.findMany;
  const originalOrderCreate = prisma.order.create;
  let createInput: any;
  (prisma.product.findMany as any) = async () => [{ id: 'product-1', slug: 'dark-70', price: 415, active: true }];
  (prisma.order.create as any) = async ({ data }: any) => { createInput = data; return { id: 'order-test', orderNo: 'CD-TEST', total: 830, address: data.address, userId: data.userId, items: [{ productId: 'product-1', quantity: 2, unitPrice: 415 }] }; };
  const token = signUser({ id: 'user-1', role: 'CUSTOMER', email: 'test@example.com' });
  try {
    const response = await fetch(`${baseUrl}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ address: 'Riyadh, Al Narjis', items: [{ productId: 'dark-70', quantity: 2 }] }) });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { id: 'order-test', orderNo: 'CD-TEST', total: 830, address: 'Riyadh, Al Narjis', userId: 'user-1', items: [{ productId: 'product-1', quantity: 2, unitPrice: 415 }] });
    assert.equal(createInput.userId, 'user-1');
    assert.equal(createInput.total, 830);
  } finally {
    (prisma.product.findMany as any) = originalProductFindMany;
    (prisma.order.create as any) = originalOrderCreate;
  }
});

test('POST /api/orders allows guest checkout without authentication', async () => {
  const originalProductFindMany = prisma.product.findMany;
  const originalOrderCreate = prisma.order.create;
  let createInput: any;
  (prisma.product.findMany as any) = async () => [{ id: 'product-1', slug: 'dark-70', price: 415, active: true }];
  (prisma.order.create as any) = async ({ data }: any) => { createInput = data; return { id: 'guest-order-test', orderNo: 'CD-GUEST', total: 415, address: data.address, userId: data.userId, items: [] }; };
  try {
    const response = await fetch(`${baseUrl}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: 'Riyadh, Al Narjis', items: [{ productId: 'dark-70', quantity: 1 }] }) });
    assert.equal(response.status, 201);
    assert.equal(createInput.userId, null);
    assert.equal((await response.json()).userId, null);
  } finally {
    (prisma.product.findMany as any) = originalProductFindMany;
    (prisma.order.create as any) = originalOrderCreate;
  }
});
