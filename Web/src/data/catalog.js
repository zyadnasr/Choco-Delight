export const catalog = {
  categories: [
    { id: 'praline-boxes', name: 'Praline boxes', image: 'praline-box.png', count: 12 },
    { id: 'truffles', name: 'Truffles', image: 'truffles.png', count: 8 },
    { id: 'dark-bars', name: 'Dark bars', image: 'dark-bars.png', count: 10 },
    { id: 'gifts', name: 'Gifts', image: 'gift-box.png', count: 6 },
  ],
  products: [
    { id: 'dark-70', category: 'dark-bars', title: '70% Dark Chocolate Bars', price: 415, compareAt: 500, image: 'chocolate-product-source.jpg', rating: 4.8, cocoa: '70%' },
    { id: 'sea-salt', category: 'dark-bars', title: 'Sea Salt Dark Chocolate', price: 440, image: 'dark-bars.png', rating: 4.8, cocoa: '72%' },
    { id: 'cocoa-nib', category: 'truffles', title: 'Cocoa Nib Truffles', price: 380, image: 'truffles.png', rating: 4.7, cocoa: '64%' },
    { id: 'classic-praline', category: 'praline-boxes', title: 'Classic Praline Box', price: 520, image: 'praline-box.png', rating: 4.9, cocoa: '55%' },
    { id: 'gift-box', category: 'gifts', title: 'Gift box', price: 440, image: 'gift-box.png', rating: 4.8, cocoa: '70%' },
  ],
  orders: [
    { id: 'CD-1048', status: 'Preparing', date: '14 Nov 2026', total: 855, items: 2 },
    { id: 'CD-1031', status: 'Delivered', date: '02 Nov 2026', total: 415, items: 1 },
  ],
};
