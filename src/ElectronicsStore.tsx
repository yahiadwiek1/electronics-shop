/*
  متجر إلكترونيات — React + Tailwind (Single-file example)
  ================================================
  هذه نسخة واجهة جاهزة ومركزة على التفاصيل الجمالية: 
  - رأس مع بحث ذكي + أيقونة السلة مع عداد
  - شريط تصنيفات أفقى
  - بطاقات منتجات أنيقة مع تأثيرات hover
  - مودال عرض المنتج (تفاصيل + مواصفات)
  - درج سلة جانبي متحرك
  - فلتر جانبي بسيط (متجاوب)

  ملاحظات: لتشغيلها تحتاج TailwindCSS مُهيأ في المشروع و
  حزم: framer-motion و lucide-react
*/

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Menu, X, Heart, Star, Filter } from "lucide-react";

// ---------------------- بيانات تجريبية ----------------------
const CATEGORIES = [
  "الكل",
  "مستشعرات",
  "شاشات",
  "محركات",
  "وحدات تحكم",
  "ملحقات",
];

const PRODUCTS = [
  {
    id: 1,
    title: "حساس BME280 (حرارة / رطوبة / ضغط)",
    price: 12.5,
    category: "مستشعرات",
    rating: 4.7,
    description: "حساس دقيق لقياس الحرارة والرطوبة والضغط، مناسب للمشروعات الصغيرة والمتوسطة.",
    specs: ["واجهة I2C", "دقة عالية", "مدى: -40 إلى 85°C"],
  },
  {
    id: 2,
    title:'شاشة OLED 0.96"'
,
    price: 7.99,
    category: "شاشات",
    rating: 4.3,
    description: "شاشة OLED صغيرة مناسبة لعرض القيم والحالات.",
    specs: ["128x64", "I2C", "زوايا رؤية واسعة"],
  },
  {
    id: 3,
    title: "محرك سيرفو SG90",
    price: 4.5,
    category: "محركات",
    rating: 4.5,
    description: "صغير وخفيف للحركات الدقيقة في الروبوتات والأنظمة.",
    specs: ["4.8-6V", "قابل للتعديل", "زاوية ~180°"],
  },
  {
    id: 4,
    title: "وحدة ESP32-S3 (مع كاميرا وشاشة)",
    price: 18.0,
    category: "وحدات تحكم",
    rating: 4.6,
    description: "لوحة ESP32-S3 قوية مع دعم للكاميرا ومنافذ متعددة.",
    specs: ["WiFi + Bluetooth", "دعم كاميرا OV2640", "GPIO متعددة"],
  },
  {
    id: 5,
    title: "WS2812 LED شريط (5m)",
    price: 11.25,
    category: "ملحقات",
    rating: 4.4,
    description: "شريط LED قابل للبرمجة، مثالي للإضاءة الجمالية.",
    specs: ["5V", "قابل للبرمجة", "APA102/WS2812"],
  },
  {
    id: 6,
    title: "حساس مسافة VL53L1X (ToF)",
    price: 9.5,
    category: "مستشعرات",
    rating: 4.2,
    description: "حساس مسافة قابل للقياس بدقة عبر تقنية الطيران بالزمن.",
    specs: ["I2C", "مدى طويل", "قياس دقيق"],
  },
  {
    id: 7,
    title: "شاشة TFT 2.8\" (لمشاريع الواجهة)",
    price: 14.9,
    category: "شاشات",
    rating: 4.1,
    description: "شاشة TFT مناسبة لواجهات المستخدم الغنية.",
    specs: ["SPI", "لمس اختياري", "320x240"],
  },
  {
    id: 8,
    title: "محول مستوى TXS0108E",
    price: 2.99,
    category: "ملحقات",
    rating: 4.0,
    description: "محول مستوى لربط وحدات تعمل بفولتية مختلفة.",
    specs: ["8 قنوات", "ثنائي الاتجاه", "مناسب للـ I/O"],
  },
];

// ---------------------- أدوات مساعدة ----------------------
const formatPrice = (v) => `${v.toFixed(2)} $`;
const initials = (name) => {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

function ProductImage({ name }) {
  const label = initials(name);
  return (
    <div className="h-36 w-full rounded-xl bg-gradient-to-br from-white to-slate-100 border border-slate-100 flex items-center justify-center">
      <svg width="140" height="90" viewBox="0 0 140 90" xmlns="http://www.w3.org/2000/svg">
        <rect width="140" height="90" rx="12" fill="url(#g)" />
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
        </defs>
        <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fontFamily="Inter, Arial" fill="#0ea5e9">
          {label}
        </text>
      </svg>
    </div>
  );
}

// ---------------------- مكونات الواجهة ----------------------
function ProductCard({ product, onAdd, onView }) {
  return (
    <motion.article
      layout
      whileHover={{ y: -6 }}
      className="relative bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition-shadow"
      aria-label={product.title}
    >
      <div className="relative">
        <ProductImage name={product.title} />
        <div className="absolute top-3 left-3 bg-white/70 backdrop-blur rounded-full p-1">
          <button aria-label="wishlist">
            <Heart size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="font-semibold text-slate-800">{product.title}</h3>
        <p className="text-sm text-slate-500 mt-1">{product.category}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            <span className="text-sm text-slate-500">/ قطعة</span>
          </div>

          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400" />
            <span className="text-sm text-slate-600">{product.rating}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onAdd(product)}
            className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            أضف إلى السلة
          </button>

          <button
            onClick={() => onView(product)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-sm hover:bg-slate-50"
            aria-label="عرض" 
          >
            عرض
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function ProductModal({ product, open, onClose, onAdd }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 left-4 rounded-full p-2 hover:bg-slate-100"
              aria-label="اغلاق" 
            >
              <X />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ProductImage name={product.title} />
                <div className="mt-4 text-sm text-slate-600">{product.description}</div>
              </div>

              <div>
                <h2 className="text-2xl font-bold">{product.title}</h2>
                <p className="text-lg text-blue-600 font-semibold mt-2">{formatPrice(product.price)}</p>

                <div className="mt-4">
                  <h4 className="font-medium">المواصفات</h4>
                  <ul className="mt-2 list-disc list-inside text-sm text-slate-600">
                    {product.specs.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => onAdd(product)}
                    className="bg-blue-600 text-white rounded-xl px-4 py-2 font-medium hover:bg-blue-700"
                  >
                    أضف إلى السلة
                  </button>

                  <button className="border border-slate-200 rounded-xl px-4 py-2">أضف للمفضلة</button>
                </div>

                <div className="mt-6 text-sm text-slate-500">SKU: #{product.id}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartDrawer({ open, onClose, cartItems, onRemove }) {
  const subtotal = cartItems.reduce((s, it) => s + it.qty * it.product.price, 0);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/30 flex justify-end"
        >
          <motion.aside
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="w-full max-w-md bg-white p-6 h-full shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">سلة التسوق</h3>
              <button onClick={onClose} aria-label="اغلاق"><X /></button>
            </div>

            <div className="mt-6 space-y-4 overflow-auto h-[60vh] pr-2">
              {cartItems.length === 0 ? (
                <div className="text-center text-slate-500">السلة فارغة</div>
              ) : (
                cartItems.map((it) => (
                  <div key={it.product.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.product.title}</div>
                      <div className="text-sm text-slate-500">{formatPrice(it.product.price)} × {it.qty}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="font-semibold">{formatPrice(it.product.price * it.qty)}</div>
                      <button className="text-sm text-red-500" onClick={() => onRemove(it.product.id)}>إزالة</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="text-slate-600">المجموع</div>
                <div className="font-bold">{formatPrice(subtotal)}</div>
              </div>

              <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-xl font-medium">اتمام الشراء</button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------- التطبيق الرئيسي ----------------------
export default function ElectronicsStore() {
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const okCat = selectedCategory === "الكل" ? true : p.category === selectedCategory;
      const okSearch = search.trim() === "" ? true : p.title.toLowerCase().includes(search.toLowerCase());
      return okCat && okSearch;
    });
  }, [selectedCategory, search]);

  function addToCart(product, qty = 1) {
    setCart((prev) => {
      const found = prev.find((it) => it.product.id === product.id);
      if (found) {
        return prev.map((it) => (it.product.id === product.id ? { ...it, qty: it.qty + qty } : it));
      }
      return [{ product, qty }, ...prev];
    });
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((it) => it.product.id !== productId));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800 p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 rounded-lg bg-white shadow-sm"><Menu /></button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">EM</div>
            <div>
              <div className="text-sm text-slate-500">متجر</div>
              <div className="font-bold">قطع إلكترونية</div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute top-3 left-3 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن قطعة، مثال: BME280, OLED..."
              className="w-full pl-10 pr-4 py-3 rounded-full border border-slate-200 shadow-sm focus:outline-none"
              aria-label="بحث المنتجات"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden md:inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full border">
            تصفح الطلبات
          </button>

          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 rounded-full bg-white shadow-sm"
            aria-label="عرض السلة"
          >
            <ShoppingCart />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-2 py-0.5">{cart.reduce((s, i) => s + i.qty, 0)}</span>
            )}
          </button>
        </div>
      </header>

      {/* Categories */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="flex gap-3 overflow-x-auto py-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`whitespace-nowrap px-4 py-2 rounded-full ${selectedCategory === c ? 'bg-blue-600 text-white' : 'bg-white border border-slate-100'}`}
            >
              {c}
            </button>
          ))}

          <button onClick={() => setShowFilters((s) => !s)} className="ml-auto px-3 py-2 rounded-full bg-slate-100 flex items-center gap-2">
            <Filter /> فلتر
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي: فلتر + شبكة المنتجات */}
      <main className="max-w-7xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* فلتر جانبي - يظهر في الشاشات الكبيرة */}
        <aside className={`hidden md:block md:col-span-1 bg-white rounded-2xl p-4 shadow-sm`}> 
          <h4 className="font-semibold">الفلتر</h4>
          <div className="mt-4">
            <div className="text-sm text-slate-600 mb-2">فئات</div>
            <div className="flex flex-col gap-2">
              {CATEGORIES.slice(1).map((c) => (
                <button key={c} className={`text-left py-2 px-3 rounded-md ${selectedCategory === c ? 'bg-blue-50' : 'hover:bg-slate-50'}`} onClick={() => setSelectedCategory(c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-slate-600">تقييم</div>
            <div className="mt-2 flex gap-2">
              {[4,3,2].map((r) => (
                <button key={r} className="px-3 py-1 rounded-md border">{r}+ نجوم</button>
              ))}
            </div>
          </div>
        </aside>

        {/* شبكة المنتجات */}
        <section className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={(prod) => addToCart(prod)} onView={(prod) => setSelectedProduct(prod)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-6 text-center text-slate-500">لا توجد منتجات مطابقة</div>
          )}
        </section>
      </main>

      {/* مودال المنتج */}
      {selectedProduct && (
        <ProductModal
          open={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(p) => {
            addToCart(p);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* درج السلة */}
      <CartDrawer open={showCart} onClose={() => setShowCart(false)} cartItems={cart} onRemove={(id) => removeFromCart(id)} />

      {/* Footer بسيط */}
      <footer className="max-w-7xl mx-auto mt-12 text-center text-sm text-slate-500">
        تصميم واجهة متجر أنيقة — قابل للتخصيص بالكامل.
      </footer>
    </div>
  );
}
