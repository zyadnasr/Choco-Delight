import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

type Screen = 'splash' | 'home' | 'categories' | 'product' | 'cart' | 'checkout' | 'address' | 'payment';
type Theme = ReturnType<typeof createTheme>;

const assets = {
  logoLight: require('./assets/logo-light.png') as ImageSourcePropType,
  logoDark: require('./assets/logo-dark.png') as ImageSourcePropType,
  product: require('./assets/chocolate-product-source.jpg') as ImageSourcePropType,
  praline: require('./assets/praline-box.png') as ImageSourcePropType,
  truffles: require('./assets/truffles.png') as ImageSourcePropType,
  bars: require('./assets/dark-bars.png') as ImageSourcePropType,
  gift: require('./assets/gift-box.png') as ImageSourcePropType,
};

function createTheme(dark: boolean) {
  return {
    dark,
    bg: dark ? '#17110E' : '#F7F3EC',
    surface: dark ? '#241A15' : '#FFFDF9',
    surfaceMuted: dark ? '#30231C' : '#F0E9DF',
    text: dark ? '#FFF8EF' : '#302016',
    muted: dark ? '#C7B8AA' : '#807269',
    accent: '#4C2718',
    accentText: '#FFF8EF',
    border: dark ? '#4B382E' : '#E3D9CC',
    success: dark ? '#A8D5B0' : '#E0F2E3',
  };
}

function App() {
  const systemDark = useColorScheme() === 'dark';
  const [dark, setDark] = useState(systemDark);
  const [screen, setScreen] = useState<Screen>('splash');
  const [cartCount, setCartCount] = useState(0);
  const theme = useMemo(() => createTheme(dark), [dark]);

  useEffect(() => {
    const timer = setTimeout(() => setScreen('home'), 1200);
    return () => clearTimeout(timer);
  }, []);

  const addToCart = () => setCartCount((count) => count + 1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <View style={styles.app}>
        {screen === 'splash' && <Splash theme={theme} />}
        {screen === 'home' && <Home theme={theme} onProduct={() => setScreen('product')} onCategories={() => setScreen('categories')} onToggleTheme={() => setDark(!dark)} />}
        {screen === 'categories' && <Categories theme={theme} onBack={() => setScreen('home')} onProduct={() => setScreen('product')} />}
        {screen === 'product' && <Product theme={theme} onBack={() => setScreen('home')} onAdd={addToCart} />}
        {screen === 'cart' && <Cart theme={theme} count={cartCount} onBack={() => setScreen('home')} onCheckout={() => setScreen('checkout')} />}
        {screen === 'checkout' && <Checkout theme={theme} onBack={() => setScreen('cart')} onAddress={() => setScreen('address')} onPayment={() => setScreen('payment')} />}
        {screen === 'address' && <Address theme={theme} onBack={() => setScreen('checkout')} />}
        {screen === 'payment' && <Payment theme={theme} onBack={() => setScreen('checkout')} />}
        {screen !== 'splash' && <BottomNav theme={theme} screen={screen} cartCount={cartCount} onNavigate={setScreen} />}
      </View>
    </SafeAreaView>
  );
}

export default App;

function Splash({ theme }: { theme: Theme }) {
  return <View style={[styles.splash, { backgroundColor: theme.dark ? '#24150D' : '#4C2718' }]}><Image source={assets.logoDark} style={styles.splashLogo} resizeMode="contain" /><Text style={styles.splashTagline}>A little sweetness, delivered</Text><View style={styles.splashMark}><Text style={styles.splashMarkText}>✦</Text></View></View>;
}

function Header({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <View style={styles.header}>
      <Image source={theme.dark ? assets.logoDark : assets.logoLight} style={styles.logo} resizeMode="contain" />
      <View style={styles.headerActions}>
        <Pressable onPress={onToggleTheme} style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }]}>
          <Text style={{ color: theme.text, fontSize: 17 }}>{theme.dark ? '☼' : '☾'}</Text>
        </Pressable>
        <Pressable style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }]}>
          <Text style={{ color: theme.text, fontSize: 17 }}>♡</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Home({ theme, onProduct, onCategories, onToggleTheme }: { theme: Theme; onProduct: () => void; onCategories: () => void; onToggleTheme: () => void }) {
  const categories = [
    ['Praline boxes', assets.praline, '12 products'],
    ['Truffles', assets.truffles, '8 products'],
    ['Dark bars', assets.bars, '10 products'],
    ['Gifts', assets.gift, '6 products'],
  ] as const;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <Text style={[styles.eyebrow, { color: theme.muted }]}>A little sweetness, delivered</Text>
      <Text style={[styles.title, { color: theme.text }]}>What are you craving today?</Text>
      <View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={{ color: theme.muted, fontSize: 18 }}>⌕</Text>
        <TextInput placeholder="Search chocolate" placeholderTextColor={theme.muted} style={[styles.searchInput, { color: theme.text }]} />
      </View>
      <SectionHeader title="What category are you looking for?" action="View all" onAction={onCategories} theme={theme} />
      <View style={styles.categoryGrid}>
        {categories.map(([name, image, count]) => (
          <Pressable key={name} onPress={onProduct} style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Image source={image} style={styles.categoryImage} resizeMode="cover" />
            <Text style={[styles.cardTitle, { color: theme.text }]}>{name}</Text>
            <Text style={[styles.caption, { color: theme.muted }]}>{count}  ›</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.statsRow, { borderColor: theme.border }]}><View><Text style={[styles.statValue, { color: theme.text }]}>32</Text><Text style={[styles.caption, { color: theme.muted }]}>products</Text></View><View><Text style={[styles.statValue, { color: theme.text }]}>12K</Text><Text style={[styles.caption, { color: theme.muted }]}>customers</Text></View><View><Text style={[styles.statValue, { color: theme.text }]}>98%</Text><Text style={[styles.caption, { color: theme.muted }]}>satisfaction</Text></View></View>
      <Pressable onPress={onCategories} style={[styles.primaryButton, { backgroundColor: theme.accent, marginTop: 14 }]}><Text style={[styles.buttonText, { color: theme.accentText }]}>Browse more categories</Text></Pressable>
      <SectionHeader title="Maker offers" theme={theme} />
      <View style={[styles.offerCard, { backgroundColor: theme.surfaceMuted }]}><View><Text style={[styles.cardTitle, { color: theme.text }]}>Pending owner approval</Text><Text style={[styles.caption, { color: theme.muted }]}>Minimum quantity is being reviewed.</Text></View><Text style={[styles.caption, { color: theme.text }]}>MOQ 1 ›</Text></View>
      <SectionHeader title="Best Sales" action="View all" theme={theme} />
      <View style={styles.productGrid}>
        <ProductCard theme={theme} image={assets.product} title="70% Dark Chocolate Bars" price="415 EGP" onPress={onProduct} />
        <ProductCard theme={theme} image={assets.bars} title="Sea Salt Dark Chocolate" price="440 EGP" onPress={onProduct} />
      </View>
    </ScrollView>
  );
}

function Categories({ theme, onBack, onProduct }: { theme: Theme; onBack: () => void; onProduct: () => void }) {
  const categories = [['Praline boxes', assets.praline, '12 products'], ['Truffles', assets.truffles, '8 products'], ['Dark chocolate bars', assets.bars, '10 products'], ['Gifts', assets.gift, '6 products']] as const;
  return <ScrollView contentContainerStyle={styles.scrollContent}><TopBar theme={theme} title="Chocolate categories" onBack={onBack} /><Text style={[styles.body, { color: theme.muted }]}>Choose a collection curated for every chocolate moment.</Text><View style={styles.categoryGrid}>{categories.map(([name, image, count]) => <Pressable key={name} onPress={onProduct} style={[styles.categoryLarge, { backgroundColor: theme.surface, borderColor: theme.border }]}><Image source={image} style={styles.categoryLargeImage} resizeMode="cover" /><Text style={[styles.cardTitle, { color: theme.text }]}>{name}</Text><Text style={[styles.caption, { color: theme.muted }]}>{count}  ›</Text></Pressable>)}</View></ScrollView>;
}

function ProductCard({ theme, image, title, price, onPress }: { theme: Theme; image: ImageSourcePropType; title: string; price: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.productCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
    <Image source={image} style={styles.productImage} resizeMode="cover" />
    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>{title}</Text>
    <Text style={[styles.price, { color: theme.text }]}>{price}</Text>
    <Text style={[styles.caption, { color: theme.muted }]}>★★★★★  4.8</Text>
  </Pressable>;
}

function Product({ theme, onBack, onAdd }: { theme: Theme; onBack: () => void; onAdd: () => void }) {
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
    <TopBar theme={theme} title="Product details" onBack={onBack} />
    <View style={styles.heroWrap}><Image source={assets.product} style={styles.heroImage} resizeMode="cover" /><View style={[styles.saveBadge, { backgroundColor: '#C79042' }]}><Text style={styles.saveBadgeText}>Save 85 EGP</Text></View></View>
    <View style={styles.productMeta}><Text style={[styles.eyebrow, { color: theme.text }]}>Dark Chocolate</Text><Text style={[styles.stock, { color: '#4D8A5A' }]}>● In stock</Text></View>
    <Text style={[styles.titleSmall, { color: theme.text }]}>70% Dark Chocolate Bars</Text>
    <Text style={[styles.caption, { color: theme.muted }]}>★ 4.8   ·   126 reviews   ·   sold +503</Text>
    <View style={styles.priceLine}><Text style={[styles.priceLarge, { color: theme.text }]}>415 EGP</Text><Text style={[styles.oldPrice, { color: theme.muted }]}>500 EGP</Text><Text style={[styles.caption, { color: theme.muted }]}>70% cocoa</Text></View>
    <View style={[styles.infoBox, { backgroundColor: theme.surfaceMuted }]}><Text style={[styles.cardTitle, { color: theme.text }]}>Wholesale only · Mandatory minimum</Text><Text style={[styles.body, { color: theme.muted }]}>Current quantity: 1{`\n`}Minimum order quantity: pending owner approval.{`\n`}Remaining quantity: shown after the minimum is approved.{`\n`}Checkout is unavailable unless MOQ is met.{`\n`}Static design state only — not interactive.</Text></View>
    <SectionHeader title="About this product" theme={theme} />
    <Text style={[styles.body, { color: theme.muted }]}>Rich dark chocolate bars with balanced cocoa depth, subtle fruit notes, and a silky finish.{`\n`}70% cocoa · 80 g · resealable pack{`\n`}Dark, 70% Cocoa, Vegan · Quantity: 1</Text>
    <Pressable style={styles.detailsLink}><Text style={[styles.cardTitle, { color: theme.text }]}>View details  ›</Text></Pressable>
    <View style={[styles.soldBy, { borderTopColor: theme.border }]}><View style={[styles.soldAvatar, { backgroundColor: theme.surfaceMuted }]} /><Text style={[styles.caption, { color: theme.muted }]}>Sold by</Text><View style={[styles.makerChip, { backgroundColor: theme.surfaceMuted }]}><Text style={[styles.caption, { color: theme.text }]}>best maker</Text></View></View>
    <Pressable onPress={onAdd} style={[styles.primaryButton, { backgroundColor: theme.accent }]}><Text style={[styles.buttonText, { color: theme.accentText }]}>Add to cart</Text></Pressable>
  </ScrollView>;
}

function Cart({ theme, count, onBack, onCheckout }: { theme: Theme; count: number; onBack: () => void; onCheckout: () => void }) {
  const empty = count === 0;
  return <ScrollView contentContainerStyle={styles.scrollContent}>
    <TopBar theme={theme} title="Shopping cart" onBack={onBack} />
    {empty ? <View style={styles.emptyState}><Text style={{ fontSize: 38, color: theme.muted }}>⌑</Text><Text style={[styles.titleSmall, { color: theme.text }]}>Your cart is empty</Text><Text style={[styles.body, { color: theme.muted, textAlign: 'center' }]}>Add your favorite chocolate products to complete your order.</Text><Pressable onPress={onBack} style={[styles.primaryButton, { backgroundColor: theme.accent }]}><Text style={[styles.buttonText, { color: theme.accentText }]}>Start shopping</Text></Pressable></View> : <><View style={[styles.cartRow, { backgroundColor: theme.surface, borderColor: theme.border }]}><Image source={assets.product} style={styles.cartImage} /><View style={styles.flex}><Text style={[styles.cardTitle, { color: theme.text }]}>70% Dark Chocolate Bars</Text><Text style={[styles.caption, { color: theme.muted }]}>Quantity: {count}</Text></View><Text style={[styles.price, { color: theme.text }]}>415 EGP</Text></View><View style={styles.summary}><Text style={[styles.body, { color: theme.muted }]}>Subtotal</Text><Text style={[styles.titleSmall, { color: theme.text }]}>415 EGP</Text></View><Pressable onPress={onCheckout} style={[styles.primaryButton, { backgroundColor: theme.accent }]}><Text style={[styles.buttonText, { color: theme.accentText }]}>Proceed to checkout</Text></Pressable></>}
  </ScrollView>;
}

function Checkout({ theme, onBack, onAddress, onPayment }: { theme: Theme; onBack: () => void; onAddress: () => void; onPayment: () => void }) {
  return <ScrollView contentContainerStyle={styles.scrollContent}><TopBar theme={theme} title="Checkout" onBack={onBack} /><View style={styles.steps}><Text style={[styles.stepActive, { color: theme.accent }]}>✓{`\n`}Cart</Text><Text style={[styles.stepActive, { color: theme.accent }]}>●{`\n`}Review</Text><Text style={{ color: theme.muted }}>○{`\n`}Confirmation</Text></View><SectionHeader title="Delivery address" action="Edit" onAction={onAddress} theme={theme} /><Pressable onPress={onAddress} style={[styles.field, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={{ color: theme.text }}>⌖  Home</Text><Text style={[styles.caption, { color: theme.muted }]}>Sarah Ahmed · 055 123 4567{`\n`}Al Narjis, Prince Saud Street, Riyadh</Text></Pressable><SectionHeader title="Payment method" action="Change" onAction={onPayment} theme={theme} /><Pressable onPress={onPayment} style={[styles.field, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={{ color: theme.text }}>▣  Cash on delivery  ›</Text><Text style={[styles.caption, { color: theme.muted }]}>0 delivery</Text></Pressable><SectionHeader title="Order items" theme={theme} /><View style={[styles.orderItem, { backgroundColor: theme.surface, borderColor: theme.border }]}><Image source={assets.product} style={styles.orderImage} /><View style={styles.flex}><Text style={[styles.cardTitle, { color: theme.text }]}>70% Dark Chocolate Bars</Text><Text style={[styles.caption, { color: theme.muted }]}>Quantity: 1</Text></View><Text style={[styles.price, { color: theme.text }]}>415 EGP</Text></View><View style={[styles.infoBox, { backgroundColor: theme.surfaceMuted }]}><Text style={[styles.cardTitle, { color: theme.text }]}>Wholesale only · Mandatory minimum</Text><Text style={[styles.body, { color: theme.muted }]}>Current quantity: 1{`\n`}Minimum order quantity: pending owner approval.{`\n`}Remaining quantity: shown after the minimum is approved.{`\n`}Checkout is unavailable unless MOQ is met.{`\n`}Static design state only — not interactive.</Text></View><View style={styles.totalRow}><Text style={[styles.body, { color: theme.muted }]}>Subtotal</Text><Text style={[styles.body, { color: theme.text }]}>415 EGP</Text></View><View style={styles.totalRow}><Text style={[styles.body, { color: theme.muted }]}>Delivery fee</Text><Text style={[styles.body, { color: '#4D8A5A' }]}>Free</Text></View><View style={[styles.totalRow, styles.totalBorder, { borderTopColor: theme.border }]}><Text style={[styles.cardTitle, { color: theme.text }]}>Total amount</Text><Text style={[styles.titleSmall, { color: theme.text }]}>415 EGP</Text></View></ScrollView>;
}

function Address({ theme, onBack }: { theme: Theme; onBack: () => void }) { return <ScrollView contentContainerStyle={styles.scrollContent}><TopBar theme={theme} title="Delivery address" onBack={onBack} /><View style={[styles.addressHero, { backgroundColor: theme.surfaceMuted }]}><Text style={{ fontSize: 38 }}>⌖</Text><Text style={[styles.caption, { color: theme.muted }]}>Current location</Text></View><Text style={[styles.titleSmall, { color: theme.text, marginBottom: 6 }]}>Address details</Text><Text style={[styles.body, { color: theme.muted, marginBottom: 18 }]}>Confirm the pickup location and complete the details.</Text><TextInput placeholder="Riyadh, Al Narjis" placeholderTextColor={theme.muted} style={[styles.inputField, { backgroundColor: theme.surfaceMuted, borderColor: theme.border, color: theme.text }]} /><View style={styles.inputRow}><TextInput placeholder="Street name" placeholderTextColor={theme.muted} style={[styles.inputField, styles.halfInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]} /><TextInput placeholder="Building number" placeholderTextColor={theme.muted} style={[styles.inputField, styles.halfInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]} /></View><TextInput placeholder="Additional details (optional)" placeholderTextColor={theme.muted} style={[styles.inputField, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]} /><Text style={[styles.cardTitle, { color: theme.text, marginTop: 8 }]}>Save address as</Text><View style={styles.addressTypes}>{['Home', 'Work', 'Other'].map((label, index) => <View key={label} style={[styles.addressChip, { backgroundColor: index === 0 ? theme.accent : theme.surfaceMuted }]}><Text style={{ color: index === 0 ? theme.accentText : theme.text, fontSize: 12 }}>{label}</Text></View>)}</View><Pressable onPress={onBack} style={[styles.primaryButton, { backgroundColor: theme.accent }]}><Text style={[styles.buttonText, { color: theme.accentText }]}>Save and use address</Text></Pressable></ScrollView>; }

function Payment({ theme, onBack }: { theme: Theme; onBack: () => void }) { return <ScrollView contentContainerStyle={styles.scrollContent}><TopBar theme={theme} title="Payment method" onBack={onBack} /><View style={[styles.paymentNotice, { backgroundColor: theme.success }]}><Text style={[styles.cardTitle, { color: theme.text }]}>Cash on delivery is available</Text><Text style={[styles.caption, { color: theme.muted }]}>Other methods are currently unavailable.</Text></View><SectionHeader title="Saved cards" theme={theme} /><Pressable style={[styles.paymentRow, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={{ color: theme.text }}>▣  Mada{`\n`}    •••• 1234</Text><Text style={{ color: theme.muted }}>Currently unavailable</Text></Pressable><Pressable style={[styles.paymentRow, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={{ color: theme.text }}>▣  Visa{`\n`}    •••• 9114</Text><Text style={{ color: theme.muted }}>Currently unavailable</Text></Pressable><Pressable style={[styles.paymentRow, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={{ color: theme.text }}>＋ Add a new card</Text><Text style={{ color: theme.muted }}>Currently unavailable</Text></Pressable><SectionHeader title="Other payment methods" theme={theme} /><Pressable style={[styles.paymentRow, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={{ color: theme.text }}>▣  Apple Pay{`\n`}    Fast and secure payment</Text><Text style={{ color: theme.muted }}>Pay</Text></Pressable><Pressable onPress={onBack} style={[styles.paymentRow, { backgroundColor: theme.surface, borderColor: theme.accent }]}><Text style={{ color: theme.text }}>▣  Cash on delivery{`\n`}    Pay when your chocolate arrives.</Text><Text style={{ color: theme.accent }}>◉</Text></Pressable><Pressable onPress={onBack} style={[styles.primaryButton, { backgroundColor: theme.accent }]}><Text style={[styles.buttonText, { color: theme.accentText }]}>Confirm payment method</Text></Pressable></ScrollView>; }

function TopBar({ theme, title, onBack }: { theme: Theme; title: string; onBack: () => void }) { return <View style={styles.topBar}><Pressable onPress={onBack} style={[styles.backButton, { backgroundColor: theme.surfaceMuted }]}><Text style={{ color: theme.text }}>‹</Text></Pressable><Text style={[styles.topTitle, { color: theme.text }]}>{title}</Text><View style={{ width: 36 }} /></View>; }
function SectionHeader({ theme, title, action, onAction }: { theme: Theme; title: string; action?: string; onAction?: () => void }) { return <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>{action && <Pressable onPress={onAction}><Text style={[styles.caption, { color: theme.muted }]}>{action}</Text></Pressable>}</View>; }
function BottomNav({ theme, screen, cartCount, onNavigate }: { theme: Theme; screen: Screen; cartCount: number; onNavigate: (screen: Screen) => void }) { return <View style={[styles.bottomNav, { backgroundColor: theme.surface, borderColor: theme.border }]}>{[['home','Home','⌂'],['categories','Explore','⌕'],['cart','Cart','♧'],['checkout','Orders','▤']].map(([id,label,icon]) => <Pressable key={id} onPress={() => onNavigate(id as Screen)} style={styles.navItem}><Text style={{ color: screen === id ? theme.accent : theme.muted, fontSize: 20 }}>{icon}</Text><Text style={{ color: screen === id ? theme.accent : theme.muted, fontSize: 11 }}>{label}{id === 'cart' && cartCount > 0 ? ` (${cartCount})` : ''}</Text></Pressable>)}</View>; }

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }, splashLogo: { width: 210, height: 72 }, splashTagline: { color: '#FFF8EF', fontSize: 12, marginTop: 16, letterSpacing: 0.4 }, splashMark: { position: 'absolute', bottom: 44, width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,248,239,0.35)', alignItems: 'center', justifyContent: 'center' }, splashMarkText: { color: '#FFF8EF', fontSize: 16 },
  addressHero: { height: 150, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }, inputRow: { flexDirection: 'row', gap: 10 }, halfInput: { flex: 1 },
  safe: { flex: 1 }, app: { flex: 1 }, scrollContent: { padding: 20, paddingBottom: 110 }, flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }, logo: { width: 154, height: 42 }, headerActions: { flexDirection: 'row', gap: 8 }, iconButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }, categoryLarge: { width: '47%', borderRadius: 16, borderWidth: 1, padding: 10 }, categoryLargeImage: { width: '100%', height: 130, borderRadius: 12, marginBottom: 10 },
  eyebrow: { fontSize: 12, marginBottom: 6, letterSpacing: 0.3 }, title: { fontSize: 28, lineHeight: 34, fontWeight: '700', marginBottom: 18 }, titleSmall: { fontSize: 21, lineHeight: 27, fontWeight: '700' }, search: { height: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 26 }, searchInput: { flex: 1, fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12 }, sectionTitle: { fontSize: 16, fontWeight: '700' }, horizontalGap: { gap: 12, paddingBottom: 12 }, categoryCard: { width: '47%', borderRadius: 16, borderWidth: 1, padding: 10 }, categoryImage: { width: '100%', height: 88, borderRadius: 12, marginBottom: 10 }, cardTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18 }, caption: { fontSize: 11, marginTop: 4 }, statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 12, marginTop: 16 }, statValue: { fontSize: 18, fontWeight: '800', textAlign: 'center' }, offerCard: { borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }, makerBanner: { borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 }, productGrid: { flexDirection: 'row', gap: 12 }, productCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 8 }, productImage: { width: '100%', height: 142, borderRadius: 12, marginBottom: 10 }, price: { fontSize: 14, fontWeight: '700', marginTop: 8 }, heroWrap: { position: 'relative' }, heroImage: { width: '100%', height: 330, borderRadius: 20, marginBottom: 18 }, saveBadge: { position: 'absolute', right: 14, bottom: 30, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }, saveBadgeText: { color: '#FFF8EF', fontSize: 11, fontWeight: '700' }, productMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, stock: { fontSize: 11, fontWeight: '700' }, priceLine: { flexDirection: 'row', alignItems: 'center', gap: 12 }, priceLarge: { fontSize: 22, fontWeight: '800', marginTop: 8, marginBottom: 18 }, oldPrice: { textDecorationLine: 'line-through', fontSize: 12 }, detailsLink: { paddingVertical: 12 }, soldBy: { borderTopWidth: 1, paddingTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }, soldAvatar: { width: 34, height: 34, borderRadius: 17 }, makerChip: { marginLeft: 'auto', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 }, infoBox: { padding: 16, borderRadius: 16, marginBottom: 16 }, body: { fontSize: 12, lineHeight: 19 }, primaryButton: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 22 }, buttonText: { fontSize: 14, fontWeight: '700' }, topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }, backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, topTitle: { fontSize: 16, fontWeight: '700' }, emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 120 }, cartRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 12 }, cartImage: { width: 70, height: 70, borderRadius: 12 }, orderItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 12, marginBottom: 12 }, orderImage: { width: 56, height: 56, borderRadius: 12 }, summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }, totalBorder: { borderTopWidth: 1, marginTop: 8, paddingTop: 18 }, steps: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, fontSize: 12, textAlign: 'center' }, stepActive: { fontWeight: '700' }, field: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 }, inputField: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10, fontSize: 13 }, addressTypes: { flexDirection: 'row', gap: 8, marginTop: 10 }, addressChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 18 }, paymentNotice: { borderRadius: 16, padding: 16 }, paymentRow: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }, bottomNav: { position: 'absolute', left: 16, right: 16, bottom: 14, height: 64, borderRadius: 20, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 4 }, navItem: { alignItems: 'center', gap: 3 },
});
