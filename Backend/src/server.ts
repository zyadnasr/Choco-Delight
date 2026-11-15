import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export const app = express();
export default app;
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET;

if (process.env.NODE_ENV !== 'test' && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters');
}

const signingSecret = jwtSecret || 'test-only-secret';
const allowedOrigins = (process.env.WEB_ORIGINS || process.env.WEB_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: (origin, callback) => { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('Origin not allowed by CORS')); } }));
app.use(express.json());

export function signUser(user: { id: string; role: string; email: string }) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, signingSecret, { expiresIn: '7d' });
}

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  try { (req as any).user = jwt.verify(header.slice(7), signingSecret); next(); } catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}

function optionalAuth(req: express.Request, _res: express.Response, next: express.NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return next();
  try { (req as any).user = jwt.verify(header.slice(7), signingSecret); } catch { return next(); }
  next();
}

function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if ((req as any).user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
  next();
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'choco-delight-api' }));

app.get('/api/catalog', async (_req, res, next) => {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.product.findMany({ where: { active: true }, include: { category: true }, orderBy: { createdAt: 'asc' } }),
    ]);
    res.json({ categories, products });
  } catch (error) { next(error); }
});

app.get('/api/products/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug }, include: { category: true } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) { next(error); }
});

app.get('/api/admin/dashboard', auth, adminAuth, async (_req, res, next) => {
  try {
    const [totalProducts, ordersToday, revenue, products] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.product.findMany({ where: { active: true }, include: { category: true }, orderBy: { updatedAt: 'desc' }, take: 10 }),
    ]);
    res.json({ metrics: { totalProducts, ordersToday, revenue: revenue._sum.total || 0 }, products });
  } catch (error) { next(error); }
});

app.get('/api/admin/orders', auth, adminAuth, async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) { next(error); }
});

app.patch('/api/admin/orders/:id/status', auth, adminAuth, async (req, res, next) => {
  try {
    const input = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']) }).parse(req.body);
    const orderId = String(req.params.id);
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: input.status },
      include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
    });
    res.json(order);
  } catch (error: any) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Order not found' });
    next(error);
  }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const input = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) }).parse(req.body);
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({ data: { name: input.name, email: input.email, passwordHash }, select: { id: true, name: true, email: true, role: true } });
    res.status(201).json({ user, token: signUser(user) });
  } catch (error: any) { if (error?.code === 'P2002') return res.status(409).json({ error: 'Email already exists' }); next(error); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const input = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: 'Invalid credentials' });
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ user: safeUser, token: signUser(safeUser) });
  } catch (error) { next(error); }
});

app.get('/api/orders', auth, async (req, res, next) => {
  try { const orders = await prisma.order.findMany({ where: { userId: (req as any).user.sub }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }); res.json(orders); } catch (error) { next(error); }
});

app.post('/api/orders', optionalAuth, async (req, res, next) => {
  try {
    const input = z.object({ address: z.string().min(5), items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1) }).parse(req.body);
    const productKeys = input.items.map((item) => item.productId);
    const products = await prisma.product.findMany({ where: { active: true, OR: [{ id: { in: productKeys } }, { slug: { in: productKeys } }] } });
    const byKey = new Map(products.flatMap((product) => [[product.id, product], [product.slug, product]]));
    const lineItems = input.items.map((item) => ({ ...item, product: byKey.get(item.productId) })).filter((item) => item.product);
    if (lineItems.length !== input.items.length) return res.status(400).json({ error: 'One or more products are unavailable' });
    const total = lineItems.reduce((sum, item) => sum + item.product!.price * item.quantity, 0);
    const order = await prisma.order.create({ data: { orderNo: `CD-${Date.now().toString().slice(-6)}`, userId: (req as any).user?.sub ?? null, address: input.address, total, items: { create: lineItems.map((item) => ({ productId: item.product!.id, quantity: item.quantity, unitPrice: item.product!.price })) } }, include: { items: { include: { product: true } } } });
    res.status(201).json(order);
  } catch (error) { next(error); }
});

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid request data', details: error.flatten().fieldErrors });
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Choco Delight API listening on http://127.0.0.1:${port}`));
}
