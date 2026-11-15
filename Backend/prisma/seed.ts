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
    ['dark-70', 'dark-bars', '70% Dark Chocolate Bars', 415, 500, 'chocolate-product-source.jpg', 4.8, '70%'],
    ['sea-salt', 'dark-bars', 'Sea Salt Dark Chocolate', 440, null, 'dark-bars.png', 4.8, '72%'],
    ['cocoa-nib', 'truffles', 'Cocoa Nib Truffles', 380, null, 'truffles.png', 4.7, '64%'],
    ['classic-praline', 'praline-boxes', 'Classic Praline Box', 520, null, 'praline-box.png', 4.9, '55%'],
    ['gift-box', 'gifts', 'Gift box', 440, null, 'gift-box.png', 4.8, '70%'],
  ] as const;
  for (const [slug, category, title, price, compareAt, image, rating, cocoa] of products) {
    await prisma.product.upsert({ where: { slug }, update: { title, price, compareAt, image, rating, cocoa, categoryId: categoryMap.get(category)!, makerId: maker.id }, create: { slug, title, price, compareAt, image, rating, cocoa, categoryId: categoryMap.get(category)!, makerId: maker.id } });
  }
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.user.upsert({ where: { email: 'admin@chocodelight.local' }, update: {}, create: { name: 'Choco Delight Admin', email: 'admin@chocodelight.local', passwordHash, role: 'ADMIN' } });
  console.log('Seed complete');
}

main().finally(() => prisma.$disconnect());
