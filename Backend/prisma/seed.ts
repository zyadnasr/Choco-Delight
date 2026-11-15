import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { slug: 'praline-boxes', name: 'Praline boxes', image: 'praline-box.png' },
    { slug: 'truffles', name: 'Truffles', image: 'truffles.png' },
    { slug: 'dark-bars', name: 'Dark bars', image: 'dark-bars.png' },
    { slug: 'gifts', name: 'Gifts', image: 'gift-box.png' },
  ];
  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const saved = await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
    categoryMap.set(category.slug, saved.id);
  }
  const maker = await prisma.maker.upsert({
    where: { slug: 'choco-delight' },
    update: { name: 'Choco Delight', tagline: 'Premium wholesale chocolate maker', description: 'Small-batch chocolate made with thoughtful ingredients for gifting, everyday moments, and retail partners.', image: 'chocolate-product-source.jpg', rating: 4.8 },
    create: { slug: 'choco-delight', name: 'Choco Delight', tagline: 'Premium wholesale chocolate maker', description: 'Small-batch chocolate made with thoughtful ingredients for gifting, everyday moments, and retail partners.', image: 'chocolate-product-source.jpg', rating: 4.8 },
  });
  const products = [
    { slug: 'dark-70', category: 'dark-bars', title: '70% Dark Chocolate Bars', price: 415, compareAt: 500, image: 'chocolate-product-source.jpg', rating: 4.8, cocoa: '70%', moq: 1, description: 'Dark chocolate bars with a balanced cocoa taste and smooth finish.', specifications: { format: 'Bars', cocoa: '70%', pack: 'Wholesale pack' } },
    { slug: 'sea-salt', category: 'dark-bars', title: 'Sea Salt Dark Chocolate', price: 440, compareAt: null, image: 'dark-bars.png', rating: 4.8, cocoa: '72%', moq: 1, description: 'Deep dark chocolate finished with a clean sea salt note.', specifications: { format: 'Bars', cocoa: '72%', finish: 'Sea salt' } },
    { slug: 'cocoa-nib', category: 'truffles', title: 'Cocoa Nib Truffles', price: 380, compareAt: null, image: 'truffles.png', rating: 4.7, cocoa: '64%', moq: 1, description: 'Soft chocolate truffles coated with toasted cocoa nibs.', specifications: { format: 'Truffles', cocoa: '64%', coating: 'Cocoa nibs' } },
    { slug: 'classic-praline', category: 'praline-boxes', title: 'Classic Praline Box', price: 520, compareAt: null, image: 'praline-box.png', rating: 4.9, cocoa: '55%', moq: 1, description: 'A curated box of classic pralines for gifting and retail shelves.', specifications: { format: 'Box', cocoa: '55%', pieces: 12 } },
    { slug: 'gift-box', category: 'gifts', title: 'Gift box', price: 440, compareAt: null, image: 'gift-box.png', rating: 4.8, cocoa: '70%', moq: 1, description: 'A ready-to-gift chocolate box for thoughtful moments.', specifications: { format: 'Gift box', cocoa: '70%', ribbon: true } },
  ] as const;
  for (const product of products) {
    const { category, ...data } = product;
    await prisma.product.upsert({ where: { slug: product.slug }, update: { ...data, categoryId: categoryMap.get(category)!, makerId: maker.id }, create: { ...data, categoryId: categoryMap.get(category)!, makerId: maker.id } });
  }
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.user.upsert({ where: { email: 'admin@chocodelight.local' }, update: {}, create: { name: 'Choco Delight Admin', email: 'admin@chocodelight.local', passwordHash, role: 'ADMIN' } });
  console.log('Seed complete');
}

main().finally(() => prisma.$disconnect());
