import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, X, Star, User, LogOut, Phone, MessageCircle } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import emailjs from "@emailjs/browser";

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
  return <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-white to-slate-100 border flex items-center justify-center shadow">
    <span className="text-2xl font-bold text-blue-600">{label}</span>
  </div>;
}

function ProductCard({ product, onAdd, onView }) {
  return (
    <motion.article layout whileHover={{y:-6}} className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition-all">
      <ProductImage name={product.title}/>
      <h3 className="font-semibold mt-3">{product.title}</h3>
      <p className="text-sm text-slate-500">{product.category}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="font-bold">{formatPriceILS(product.price)}</span>
        <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400"/>{product.rating}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={(e)=>onAdd(product,e)} className="flex-1 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">أضف للسلة</button>
        <button onClick={()=>onView(product)} className="py-2 px-3 rounded-xl border hover:bg-gray-100 transition">عرض</button>
      </div>
    </motion.article>
  );
}

// ------------------ Sidebar ------------------
function Sidebar({ open, onClose, user, onLogin, onLogout }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName:"", lastName:"", email:"", password:"", confirmPassword:"", phone:"", city:"", address:""
  });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{8,15}$/.test(phone);

  const handleSubmit = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if(isLogin){
      const u = users.find(u=>u.email===formData.email && u.password===formData.password);
      if(!u) return toast.error("بيانات الدخول غير صحيحة");
      localStorage.setItem("currentUser",JSON.stringify(u));
      onLogin(u); toast.success("تم تسجيل الدخول بنجاح"); onClose();
    } else {
      const { firstName,lastName,email,password,confirmPassword,phone,city,address } = formData;
      if(!firstName||!lastName||!email||!password||!confirmPassword||!phone||!city||!address)
        return toast.error("يرجى ملء جميع الحقول. لا يمكن ترك الشارع/المنطقة فارغًا");
      if(!validateEmail(email)) return toast.error("البريد الإلكتروني غير صالح");
      if(!validatePhone(phone)) return toast.error("رقم الهاتف غير صالح");
      if(password!==confirmPassword) return toast.error("كلمتا المرور غير متطابقتين");
      if(users.some(u=>u.email===email)) return toast.error("البريد الإلكتروني موجود بالفعل");

      const newUser={firstName,lastName,email,password,phone,city,address};
      users.push(newUser); localStorage.setItem("users",JSON.stringify(users));
      localStorage.setItem("currentUser",JSON.stringify(newUser));
      onLogin(newUser); toast.success("تم إنشاء الحساب بنجاح"); onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}/>
          <motion.div className="fixed left-0 top-0 h-full w-80 bg-white z-50 p-6 flex flex-col justify-between"
            initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{type:"spring", damping:20}}>
            
            <div>
              <button onClick={onClose} className="absolute top-4 right-4 p-2"><X size={22}/></button>
              {!user ? <>
                <h2 className="text-xl font-bold mb-4">{isLogin?"تسجيل الدخول":"إنشاء حساب"}</h2>
                {!isLogin && <>
                  <input placeholder="الاسم الأول" value={formData.firstName} onChange={e=>setFormData({...formData,firstName:e.target.value})} className="w-full mb-2 p-2 border rounded"/>
                  <input placeholder="الاسم الأخير" value={formData.lastName} onChange={e=>setFormData({...formData,lastName:e.target.value})} className="w-full mb-2 p-2 border rounded"/>
                  <input placeholder="رقم الهاتف" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} className="w-full mb-2 p-2 border rounded"/>
                  <input placeholder="المدينة" value={formData.city} onChange={e=>setFormData({...formData,city:e.target.value})} className="w-full mb-2 p-2 border rounded"/>
                  <input placeholder="الشارع / المنطقة" value={formData.address} onChange={e=>setFormData({...formData,address:e.target.value})} className="w-full mb-2 p-2 border rounded"/>
                </>}
                <input placeholder="البريد الإلكتروني" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} className="w-full mb-2 p-2 border rounded"/>
                <input type="password" placeholder="كلمة المرور" value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} className="w-full mb-2 p-2 border rounded"/>
                {!isLogin && <input type="password" placeholder="تأكيد كلمة المرور" value={formData.confirmPassword} onChange={e=>setFormData({...formData,confirmPassword:e.target.value})} className="w-full mb-2 p-2 border rounded"/>}
                <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded mt-2">{isLogin?"تسجيل دخول":"إنشاء حساب"}</button>
                <div className="text-center mt-3 text-sm text-slate-500">
                  {isLogin?"لا تملك حساب؟ ":"لديك حساب بالفعل؟ "}
                  <button onClick={()=>setIsLogin(!isLogin)} className="text-blue-600 font-semibold">{isLogin?"إنشاء حساب":"تسجيل دخول"}</button>
                </div>
              </> : <>
                <div className="flex items-center gap-3 mb-4">
                  <User size={24} className="text-blue-600"/>
                  <div>
                    <p className="font-bold">{user.firstName} {user.lastName}</p>
                    <p className="text-gray-500 text-sm">{user.city} - {user.address}</p>
                  </div>
                </div>
                <button onClick={()=>{onLogout(); onClose();}} className="w-full flex items-center justify-center gap-2 py-2 bg-red-500 text-white rounded-lg mb-4 hover:bg-red-600 transition">
                  <LogOut size={20}/> تسجيل خروج
                </button>
              </>}
            </div>

            <div className="mt-4 space-y-2">
              <p className="font-semibold">تواصل معنا:</p>
              <a href="tel:+972594983850" className="flex items-center gap-2 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition">
                <Phone size={18}/> 0594983850
              </a>
              <a href="https://wa.me/972594983850" target="_blank" className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition">
                <MessageCircle size={18}/> واتساب
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ------------------ CartModal مع فاتورة EmailJS للعميل والمالك ------------------
function CartModal({ isOpen, onClose, cart, onRemove, user }) {
  const [paymentMethod,setPaymentMethod]=useState("cod");
  const [cardNumber,setCardNumber]=useState("");
  const [cvv,setCvv]=useState("");
  const [expiryMonth,setExpiryMonth]=useState("");
  const [expiryYear,setExpiryYear]=useState("");
  const total = cart.reduce((sum,item)=>sum+item.product.price*item.qty,0);

  const sendEmailInvoice = async () => {
    if(!user?.email) return;

    const items = cart.map(it=>`${it.product.title} × ${it.qty} = ${formatPriceILS(it.product.price*it.qty)}`).join("<br/>");
    const html = `
      <h2>فاتورتك من متجر الإلكترونيات</h2>
      <p>العميل: ${user.firstName} ${user.lastName}</p>
      <p>رقم الهاتف: ${user.phone}</p>
      <p>المدينة: ${user.city}</p>
      <p>الشارع / المنطقة: ${user.address}</p>
      <hr/>
      <p>${items}</p>
      <hr/>
      <p>المجموع: ${formatPriceILS(total)}</p>
      <p>طريقة الدفع: ${paymentMethod==="visa"?"Visa":"دفع عند الاستلام"}</p>
    `;
    
    try {
      // إرسال الفاتورة للعميل
      await emailjs.send(
        "service_g40nd27",     // ✅ Service ID
        "template_mf44dd4",    // ✅ Template ID
        {
          to_email: user.email,
          message_html: html,
          user_name: user.firstName
        },
        "vMhUfjQw3iSc1Ukmo"    // ✅ Public Key
      );
      toast.success("📧 تم إرسال الفاتورة إلى بريدك الإلكتروني");

      // إرسال نسخة الفاتورة للمالك
      await emailjs.send(
        "service_g40nd27",
        "template_mf44dd4",
        {
          to_email: "owner@example.com", // 🔴 ضع بريدك هنا
          message_html: html,
          user_name: user.firstName
        },
        "vMhUfjQw3iSc1Ukmo"
      );
      console.log("📧 نسخة الفاتورة تم إرسالها للمالك");
    } catch(e){
      console.error(e);
      toast.error("حدث خطأ أثناء إرسال الفاتورة");
    }
  };

  const handleCheckout = ()=>{
    if(cart.length===0) return toast.error("سلتك فارغة 🛒");

    if(paymentMethod==="visa"){
      if(cardNumber.length!==16) return toast.error("رقم البطاقة يجب أن يكون 16 رقم");
      if(cvv.length<3||cvv.length>4) return toast.error("CVV غير صالح");
      if(!expiryMonth||!expiryYear) return toast.error("الرجاء إدخال تاريخ الانتهاء");

      toast.success(`تم الدفع بنجاح باستخدام Visa ✅\nسيتم تحويل المبلغ إلى حسابك على رفلكت:\nIBAN: PS20ARAB900030021956047249500`);
    } else {
      toast.success(`تم الدفع عند الاستلام. سيتم شحن الطلب إلى ${user.firstName} ${user.lastName} ✅`);
    }

    if(user){
      sendEmailInvoice();
    }

    localStorage.removeItem("cart");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && <>
        <motion.div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}/>
        <motion.div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 flex flex-col"
          initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring", damping:20}}>

          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">سلة المشتريات</h2>
            <button onClick={onClose}><X size={22}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length===0 ? <p className="text-gray-500 text-center">السلة فارغة</p> :
              <>
                <div className="border rounded-lg p-4 bg-gray-50 space-y-3 shadow-sm">
                  <h3 className="font-bold text-lg mb-2">فاتورتك</h3>
                  {cart.map(it=>(<div key={it.product.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white to-slate-100 flex items-center justify-center text-blue-600 font-bold shadow">
                        {it.product.title.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{it.product.title}</p>
                        <p className="text-sm text-gray-500">{it.qty} × {formatPriceILS(it.product.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatPriceILS(it.product.price*it.qty)}</span>
                      <button onClick={()=>onRemove(it.product.id)} className="text-red-500 text-sm">حذف</button>
                    </div>
                  </div>))}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>المجموع:</span>
                    <span>{formatPriceILS(total)}</span>
                  </div>
                </div>

                <div className="border p-4 rounded-lg mt-4 space-y-3">
                  <h3 className="font-semibold">طريقة الدفع</h3>
                  <div className="flex gap-4">
                    <button onClick={()=>setPaymentMethod("cod")} className={`flex-1 py-2 rounded-xl ${paymentMethod==="cod"?"bg-blue-600 text-white":"bg-gray-100"}`}>دفع عند الاستلام</button>
                    <button onClick={()=>setPaymentMethod("visa")} className={`flex-1 py-2 rounded-xl ${paymentMethod==="visa"?"bg-blue-600 text-white":"bg-gray-100"}`}>Visa</button>
                  </div>

                  {paymentMethod==="visa" && (
                    <div className="space-y-2 mt-2">
                      <input type="text" placeholder="رقم البطاقة" maxLength={16} value={cardNumber} onChange={e=>setCardNumber(e.target.value)} className="w-full p-2 border rounded"/>
                      <input type="text" placeholder="CVV" maxLength={4} value={cvv} onChange={e=>setCvv(e.target.value)} className="w-full p-2 border rounded"/>
                      <div className="flex gap-2">
                        <input type="text" placeholder="شهر" maxLength={2} value={expiryMonth} onChange={e=>setExpiryMonth(e.target.value)} className="w-1/2 p-2 border rounded"/>
                        <input type="text" placeholder="سنة" maxLength={2} value={expiryYear} onChange={e=>setExpiryYear(e.target.value)} className="w-1/2 p-2 border rounded"/>
                      </div>
                      <p className="text-sm text-gray-500">المبلغ سيحول لاحقًا يدويًا إلى حسابك على رفلكت.</p>
                    </div>
                  )}

                  {paymentMethod==="cod" && user && (
                    <div className="text-gray-600 text-sm mt-2 border p-2 rounded">
                      سيتم شحن الطلب إلى:<br/>
                      {user.firstName} {user.lastName}<br/>
                      {user.phone}<br/>
                      {user.city} - {user.address}
                    </div>
                  )}
                </div>
              </>
            }
          </div>

          <div className="p-4 border-t space-y-3">
            <button onClick={handleCheckout} disabled={cart.length===0} className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400">
              {paymentMethod==="visa"?"ادفع الآن":"تأكيد الطلب"}
            </button>
          </div>
        </motion.div>
      </>}
    </AnimatePresence>
  );
}

// ------------------ Main ------------------
export default function ShopApp(){
  const [category,setCategory]=useState("الكل");
  const [search,setSearch]=useState("");
  const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem("cart")||"[]"));
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("currentUser")||"null"));
  const [cartOpen,setCartOpen]=useState(false);

  const filtered=useMemo(()=>PRODUCTS.filter(p=>(category==="الكل"||p.category===category) && p.title.toLowerCase().includes(search.toLowerCase())),[category,search]);

  const addToCart=(product,e)=>{
    e.stopPropagation();
    const existing=cart.find(i=>i.product.id===product.id);
    let updated;
    if(existing){ updated=cart.map(i=>i.product.id===product.id?{...i,qty:i.qty+1}:i); }
    else { updated=[...cart,{product,qty:1}]; }
    setCart(updated); localStorage.setItem("cart",JSON.stringify(updated));
    toast.success("تمت إضافة المنتج للسلة 🛒");
  };
  const removeFromCart=(id)=>{
    const updated=cart.filter(i=>i.product.id!==id);
    setCart(updated); localStorage.setItem("cart",JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster/>
      {/* رأس الصفحة */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-bold text-xl">🛒 متجر الإلكترونيات</h1>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input type="text" placeholder="بحث..." value={search} onChange={e=>setSearch(e.target.value)} className="border rounded-xl px-3 py-1.5"/>
              <Search size={18} className="absolute right-2 top-2 text-gray-400"/>
            </div>
            <button onClick={()=>setCartOpen(true)} className="relative"><ShoppingCart size={24}/>
              {cart.length>0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">{cart.length}</span>}
            </button>
            <button onClick={()=>setSidebarOpen(true)}><User size={24}/></button>
          </div>
        </div>
      </header>

      {/* تصنيفات */}
      <div className="container mx-auto px-4 py-4 flex gap-3 flex-wrap">
        {CATEGORIES.map(cat=><button key={cat} onClick={()=>setCategory(cat)} className={`px-4 py-2 rounded-full border ${category===cat?"bg-blue-600 text-white":"hover:bg-gray-100"}`}>{cat}</button>)}
      </div>

      {/* المنتجات */}
      <main className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filtered.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart} onView={()=>{}} />)}
      </main>

      <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} user={user} onLogin={setUser} onLogout={()=>{localStorage.removeItem("currentUser");setUser(null)}}/>
      <CartModal isOpen={cartOpen} onClose={()=>setCartOpen(false)} cart={cart} onRemove={removeFromCart} user={user}/>
    </div>
  );
}
