import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, X, Star } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

// ------------------ بيانات ------------------
const CATEGORIES = ["الكل","مستشعرات","شاشات","محركات","وحدات تحكم","ملحقات"];
const PRODUCTS = [
  {id:1,title:"حساس BME280",price:12.5,category:"مستشعرات",rating:4.7,description:"حساس دقيق.",specs:["I2C","دقة عالية"]},
  {id:2,title:'شاشة OLED 0.96"',price:7.99,category:"شاشات",rating:4.3,description:"شاشة صغيرة.",specs:["128x64","I2C"]},
  {id:3,title:"محرك سيرفو SG90",price:4.5,category:"محركات",rating:4.5,description:"صغير وخفيف.",specs:["4.8-6V","زاوية 180°"]},
];

// ------------------ أدوات ------------------
const formatPriceILS = v => `${(v*3.7).toFixed(2)} ₪`;
const initials = name => name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();

// ------------------ مكونات ------------------
function ProductImage({ name }) {
  const label = initials(name);
  return <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-white to-slate-100 border flex items-center justify-center">
    <span className="text-2xl font-bold text-blue-600">{label}</span>
  </div>;
}

function ProductCard({ product, onAdd, onView }) {
  return (
    <motion.article layout whileHover={{y:-6}} className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl">
      <ProductImage name={product.title}/>
      <h3 className="font-semibold mt-3">{product.title}</h3>
      <p className="text-sm text-slate-500">{product.category}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="font-bold">{formatPriceILS(product.price)}</span>
        <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400"/>{product.rating}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={(e)=>onAdd(product,e)} className="flex-1 py-2 rounded-xl bg-blue-600 text-white">أضف للسلة</button>
        <button onClick={()=>onView(product)} className="py-2 px-3 rounded-xl border">عرض</button>
      </div>
    </motion.article>
  );
}

function ProductModal({ product, open, onClose, onAdd }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/30"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <motion.div className="w-full max-w-3xl bg-white rounded-3xl p-6 relative"
            initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} exit={{y:30,opacity:0}}>
            <button onClick={onClose} className="absolute top-4 left-4 p-2 rounded-full"><X/></button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ProductImage name={product.title}/>
                <p className="mt-4 text-sm text-slate-600">{product.description}</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{product.title}</h2>
                <p className="text-lg text-blue-600 font-semibold mt-2">{formatPriceILS(product.price)}</p>
                <ul className="list-disc list-inside text-sm text-slate-600 mt-2">{product.specs.map((s,i)=><li key={i}>{s}</li>)}</ul>
                <button onClick={(e)=>onAdd(product,e)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl">أضف للسلة</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AuthModal({ open, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName,setFirstName]=useState(""); const [lastName,setLastName]=useState("");
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [phone,setPhone]=useState(""); const [city,setCity]=useState(""); const [address,setAddress]=useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{8,15}$/.test(phone);

  const handleSubmit = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if(isLogin){
      const user = users.find(u => u.email===email && u.password===password);
      if(!user) return toast.error("بيانات الدخول غير صحيحة");
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast.success("تم تسجيل الدخول بنجاح");
      onLogin(user);
    } else {
      if(!firstName||!lastName||!email||!password||!confirmPassword||!phone||!city||!address)
        return toast.error("يرجى ملء جميع الحقول");
      if(!validateEmail(email)) return toast.error("البريد الإلكتروني غير صالح");
      if(!validatePhone(phone)) return toast.error("رقم الهاتف غير صالح");
      if(password!==confirmPassword) return toast.error("كلمتا المرور غير متطابقتين");
      if(users.some(u=>u.email===email)) return toast.error("البريد الإلكتروني موجود بالفعل");

      const newUser = {firstName,lastName,email,password,phone,city,address};
      users.push(newUser); localStorage.setItem("users",JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      toast.success("تم إنشاء الحساب بنجاح");
      onLogin(newUser);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <motion.div className="bg-white rounded-2xl p-6 w-full max-w-md relative"
            initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} exit={{y:30,opacity:0}}>
            <button onClick={onClose} className="absolute top-4 left-4 p-2 rounded-full"><X/></button>
            <h3 className="text-xl font-bold mb-4">{isLogin ? "تسجيل دخول" : "إنشاء حساب"}</h3>

            {!isLogin && <>
              <input placeholder="الاسم الأول" value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
              <input placeholder="الاسم الأخير" value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
              <input placeholder="رقم الهاتف" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
              <input placeholder="اسم المدينة" value={city} onChange={e=>setCity(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
              <input placeholder="العنوان" value={address} onChange={e=>setAddress(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
            </>}

            <input placeholder="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
            <input type="password" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
            {!isLogin && <input type="password" placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="w-full mb-2 p-2 border rounded"/>}

            <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded mt-3">
              {isLogin ? "تسجيل دخول" : "إنشاء حساب"}
            </button>

            <div className="text-center mt-3 text-sm text-slate-500">
              {isLogin ? "لا تملك حساب؟ " : "لديك حساب بالفعل؟ "}
              <button onClick={()=>setIsLogin(!isLogin)} className="text-blue-600 font-semibold">
                {isLogin ? "إنشاء حساب" : "تسجيل دخول"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartModal({ isOpen, onClose, cart, onRemove, user }) {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");

  const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const handleCheckout = () => {
    if(cart.length === 0) return toast.error("سلتك فارغة 🛒");

    if(paymentMethod === "visa") {
      if(cardNumber.length !== 16) return toast.error("رقم البطاقة يجب أن يكون 16 رقم");
      if(cvv.length < 3 || cvv.length > 4) return toast.error("CVV غير صالح");
      if(!expiryMonth || !expiryYear) return toast.error("الرجاء إدخال تاريخ الانتهاء");
      toast.success("تم الدفع بنجاح باستخدام Visa ✅");
    } else {
      toast.success(`تم الدفع عند الاستلام. سيتم شحن الطلب إلى ${user.address} ✅`);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}/>
          <motion.div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 flex flex-col"
            initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring", damping:20}}>
            
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">سلة المشتريات</h2>
              <button onClick={onClose}><X size={22}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? <p className="text-gray-500 text-center">السلة فارغة</p> :
                cart.map(it => (
                  <div key={it.product.id} className="flex items-center justify-between border p-2 rounded-lg">
                    <div>
                      <h3 className="font-medium">{it.product.title}</h3>
                      <p className="text-sm text-gray-500">{formatPriceILS(it.product.price)} × {it.qty}</p>
                    </div>
                    <button onClick={() => onRemove(it.product.id)} className="text-red-500 hover:text-red-700">حذف</button>
                  </div>
                ))
              }

              {/* اختيار طريقة الدفع */}
              <div className="border p-4 rounded-lg space-y-3">
                <h3 className="font-semibold">طريقة الدفع</h3>
                <div className="flex gap-4">
                  <button onClick={() => setPaymentMethod("cod")}
                    className={`flex-1 py-2 rounded-xl ${paymentMethod==="cod"?"bg-blue-600 text-white":"bg-gray-100"}`}>
                    دفع عند الاستلام
                  </button>
                  <button onClick={() => setPaymentMethod("visa")}
                    className={`flex-1 py-2 rounded-xl ${paymentMethod==="visa"?"bg-blue-600 text-white":"bg-gray-100"}`}>
                    Visa
                  </button>
                </div>

                {paymentMethod === "visa" && (
                  <div className="space-y-3 mt-2">
                    <input type="text" placeholder="رقم البطاقة" maxLength={16}
                      value={cardNumber} onChange={e=>setCardNumber(e.target.value)}
                      className="w-full p-2 border rounded"/>
                    <input type="text" placeholder="CVV" maxLength={4}
                      value={cvv} onChange={e=>setCvv(e.target.value)}
                      className="w-full p-2 border rounded"/>
                    <div className="flex gap-2">
                      <input type="text" placeholder="شهر" maxLength={2}
                        value={expiryMonth} onChange={e=>setExpiryMonth(e.target.value)}
                        className="w-1/2 p-2 border rounded"/>
                      <input type="text" placeholder="سنة" maxLength={2}
                        value={expiryYear} onChange={e=>setExpiryYear(e.target.value)}
                        className="w-1/2 p-2 border rounded"/>
                    </div>
                  </div>
                )}

                {paymentMethod === "cod" && user && (
                  <div className="text-gray-600 text-sm mt-2 border p-2 rounded">
                    سيتم شحن الطلب إلى:<br/>
                    {user.firstName} {user.lastName} <br/>
                    {user.phone} <br/>
                    {user.city} - {user.address}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t space-y-3">
              <div className="flex justify-between font-bold">
                <span>المجموع:</span>
                <span>{formatPriceILS(total)}</span>
              </div>
              <button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow">إتمام الشراء</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ------------------ التطبيق الرئيسي ------------------
export default function ElectronicsStore() {
  const [selectedCategory,setSelectedCategory]=useState("الكل");
  const [search,setSearch]=useState("");
  const [cart,setCart]=useState(()=>{ const saved=localStorage.getItem("cart"); return saved?JSON.parse(saved):[]; });
  const [selectedProduct,setSelectedProduct]=useState(null);
  const [showCart,setShowCart]=useState(false);
  const [authOpen,setAuthOpen]=useState(false);
  const [user,setUser]=useState(()=>{ const saved=localStorage.getItem("currentUser"); return saved?JSON.parse(saved):null; });
  const [flyProduct,setFlyProduct]=useState(null);
  const [flyPos,setFlyPos]=useState({x:0,y:0,targetX:0,targetY:0});
  const cartIconRef = useRef(null);

  const filtered = useMemo(()=>PRODUCTS.filter(p=>{
    const okCat = selectedCategory==="الكل"?true:p.category===selectedCategory;
    const okSearch = search.trim()===""?true:p.title.toLowerCase().includes(search.toLowerCase());
    return okCat && okSearch;
  }),[selectedCategory,search]);

  const addToCart=(product,e,qty=1)=>{
    if(e && cartIconRef.current){
      const rect = e.target.getBoundingClientRect();
      const cartRect = cartIconRef.current.getBoundingClientRect();
      setFlyPos({x: rect.left + rect.width/2, y: rect.top + rect.height/2, targetX: cartRect.left + cartRect.width/2, targetY: cartRect.top + cartRect.height/2});
      setFlyProduct(product);
    }

    setCart(prev=>{
      const found = prev.find(it=>it.product.id===product.id);
      const updated = found?prev.map(it=>it.product.id===product.id?{...it,qty:it.qty+qty}:it):[{product,qty},...prev];
      localStorage.setItem("cart",JSON.stringify(updated));
      toast.success(`${product.title} أُضيفت للسلة`);
      return updated;
    });
  };

  const removeFromCart=id=>{ 
    const updated = cart.filter(it=>it.product.id!==id); 
    setCart(updated); 
    localStorage.setItem("cart",JSON.stringify(updated)); 
    toast("تمت إزالة المنتج"); 
  };

  const handleLogout=()=>{ setUser(null); localStorage.removeItem("currentUser"); toast("تم تسجيل الخروج"); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <Toaster position="top-right" reverseOrder={false}/>

      <header className="max-w-7xl mx-auto flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">EM</div>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="بحث..." value={search} onChange={e=>setSearch(e.target.value)}
            className="border rounded-xl p-2"/>
          <button ref={cartIconRef} onClick={()=>setShowCart(true)} className="relative p-2 rounded-lg bg-white shadow-sm">
            <ShoppingCart/>
            {cart.length>0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">{cart.reduce((s,i)=>s+i.qty,0)}</span>}
          </button>
          {!user ? 
            <button onClick={()=>setAuthOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl">تسجيل / دخول</button> :
            <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded-xl">خروج</button>
          }
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-3 mb-6 overflow-x-auto">
        {CATEGORIES.map(c=><button key={c} onClick={()=>setSelectedCategory(c)} 
          className={`px-4 py-2 rounded-xl ${selectedCategory===c?"bg-blue-600 text-white":"bg-white shadow-sm"}`}>{c}</button>)}
      </div>

      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart} onView={setSelectedProduct}/>)}
        {filtered.length===0 && <div className="col-span-full text-center text-slate-500">لا توجد منتجات مطابقة</div>}
      </section>

      {selectedProduct && <ProductModal product={selectedProduct} open={!!selectedProduct} onClose={()=>setSelectedProduct(null)} onAdd={addToCart}/>}
      {authOpen && <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} onLogin={setUser}/>}
      {showCart && <CartModal isOpen={showCart} onClose={()=>setShowCart(false)} cart={cart} onRemove={removeFromCart} user={user}/>}

      {/* تأثير الطيران */}
      <AnimatePresence>
        {flyProduct && (
          <motion.div
            key={flyProduct.id}
            initial={{x: flyPos.x, y: flyPos.y, scale:1}}
            animate={{x: flyPos.targetX, y: flyPos.targetY, scale:0.2, opacity:0}}
            transition={{duration:0.8, ease:"easeInOut"}}
            className="fixed z-50 pointer-events-none"
            onAnimationComplete={()=>setFlyProduct(null)}
          >
            <ProductImage name={flyProduct.title}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
