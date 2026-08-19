/**
 * Dynamic Content Translation dictionary & resolver for database-driven content and error/feedback messages.
 * Translates DB text, API responses, form errors, and notifications into Arabic when Arabic is active.
 */

const DB_ARABIC_DICTIONARY: Record<string, string> = {
  // Hero slides
  "discover your signature scent": "اكتشف عطرك المميز",
  "luxury fragrances crafted to leave a lasting impression.": "عطور فاخرة صُممت لتترك أثراً وانطباعاً يدوم طويلاً.",
  "luxury fragrances crafted to leave a lasting impression": "عطور فاخرة صُممت لتترك أثراً وانطباعاً يدوم طويلاً.",
  "the essence of arabian luxury": "جوهر الفخامة والأصالة العربية",
  "haute parfumerie & pure oud": "عطور راقية وخلاصات العود النقي",
  "explore now": "استكشف الآن",
  "explore collection": "استكشف المجموعة",
  "discover now": "اكتشف الآن",
  "shop now": "تسوق الآن",
  "discover our signature": "اكتشف عطرنا المميز",

  // Vision Section
  "vision": "رؤيتنا",
  "our vision": "رؤيتنا",
  "our philosophy": "فلسفتنا",
  "to become one of the most trusted and admired fragrance brands in the gcc and beyond, recognized for quality, innovation, and exceptional customer experiences":
    "أن نكون إحدى أكثر العلامات التجارية للعطور موثوقية وتميزاً في دول مجلس التعاون الخليجي وخارجها، والمعروفة بالجودة والابتكار وتجارب العملاء الاستثنائية.",
  "to become one of the most trusted and admired fragrance brands in the gcc and beyond, recognized for quality, innovation, and exceptional customer experiences.":
    "أن نكون إحدى أكثر العلامات التجارية للعطور موثوقية وتميزاً في دول مجلس التعاون الخليجي وخارجها، والمعروفة بالجودة والابتكار وتجارب العملاء الاستثنائية.",

  // Newsletter Section / Our Promise
  "our promise": "وعدنا لكم",
  "quality fragrances you can trust every day": "عطور ذات جودة استثنائية يمكنك الوثوق بها كل يوم",
  "join the circle of connoisseurs": "انضم إلى مجتمع الذواقة",
  "subscribe to receive private previews, limited artisan extractions, and bespoke offers.":
    "اشترك لتصلك أحدث الإصدارات الخاصة، خلطات العود النادرة والعروض الحصرية.",

  // Badges
  "quality excellence": "التميز والجودة",
  "we maintain high standards to deliver exceptional fragrance experiences.":
    "نلتزم بأعلى المعايير لتقديم تجارب عطرية استثنائية.",
  "customer first": "العميل أولاً",
  "customer satisfaction and trust guide every decision we make.":
    "رضا العملاء وثقتهم هما الأساس في كل ما نقوم به.",
  "trust & transparency": "الثقة والشفافية",
  "we build lasting relationships through honesty, integrity, and consistency.":
    "نبني علاقات دائمة قائمة على النزاهة والمصداقية العالية.",
  "value creation": "قيمة استثنائية",
  "we strive to exceed expectations through quality, performance, and service.":
    "نسعى دائماً لتجاوز التوقعات عبر الجودة والأداء والخدمة الرفيعة.",
  "express delivery": "توصيل سريع",
  "fast & secure shipping across the region": "شحن آمن وفائق السرعة في جميع الأنحاء",
  "100% authentic": "أصلي 100%",
  "pure oils & exquisite ingredients": "زيوت نقية ومكونات طبيعية فاخرة",
  "luxury packaging": "تغليف ملكي فاخر",
  "bespoke signature gift presentation": "علب هدايا بتصميم خاص مفعم بالأناقة",
  "dedicated concierge": "خدمة عملاء مميزة",
  "direct whatsapp assistance for your orders": "مساعدة مباشرة عبر الواتساب لطلباتكم",

  // Featured Banner & Promos
  "more than a perfume": "أكثر من مجرد عطر",
  "a scent that reflects your personality and creates lasting memmories":
    "عطر يعكس شخصيتك ويصنع ذكريات لا تُنسى",
  "a scent that reflects your personality and creates lasting memories":
    "عطر يعكس شخصيتك ويصنع ذكريات لا تُنسى",
  "craft your signature essence": "ابتكر بصمتك العطرية الخاصة",
  "made to be remembered": "صُنع ليبقى في الذاكرة",

  // Products & Descriptions
  "long lasting": "ثبات وفوحان يدوم طويلاً",
  "long lansing": "ثبات وفوحان يدوم طويلاً",
  "all perfumes": "جميع العطور",
  "all fragrances": "جميع العطور",
  "exclusive collection": "المجموعة الحصرية",
  "oriental oud": "العود الشرقي",
  "french oriental": "عطور شرقية فرنسية",
  "musk & amber": "المسك والعنبر",
  "pure dehn al oud": "دهن العود النقي",
  "qcd": "كيو سي دي",
  "abc": "إيه بي سي",
  "asas": "أساس",
  "30ml": "30 مل",
  "50ml": "50 مل",
  "100ml": "100 مل",

  // ─────────────────────────────────────────────────────────────
  // Error Messages & API Responses (Newsletter, Orders, Auth)
  // ─────────────────────────────────────────────────────────────
  "this email address is already subscribed!": "هذا البريد الإلكتروني مشترك بالفعل في النشرة البريدية!",
  "this email address is already subscribed.": "هذا البريد الإلكتروني مشترك بالفعل في النشرة البريدية!",
  "this email address is already subscribed": "هذا البريد الإلكتروني مشترك بالفعل في النشرة البريدية!",
  "email address is required.": "عنوان البريد الإلكتروني مطلوب.",
  "email address is required": "عنوان البريد الإلكتروني مطلوب.",
  "please provide a valid email address.": "يرجى إدخال عنوان بريد إلكتروني صحيح.",
  "please provide a valid email address": "يرجى إدخال عنوان بريد إلكتروني صحيح.",
  "failed to process subscription. please try again later.": "فشل في إتمام الاشتراك. يرجى المحاولة مرة أخرى لاحقاً.",
  "failed to process subscription. please try again later": "فشل في إتمام الاشتراك. يرجى المحاولة مرة أخرى لاحقاً.",
  "thank you for subscribing to our newsletter!": "شكراً لاشتراككم في نشرتنا البريدية!",
  "thank you for subscribing to our newsletter": "شكراً لاشتراككم في نشرتنا البريدية!",
  "newsletter subscription successful!": "تم الاشتراك في النشرة البريدية بنجاح!",
  "please enter your email address.": "يرجى إدخال عنوان بريدك الإلكتروني.",
  "please enter your email address": "يرجى إدخال عنوان بريدك الإلكتروني.",

  // Checkout & Order Placement
  "full name is required.": "الاسم الكامل مطلوب.",
  "full name is required": "الاسم الكامل مطلوب.",
  "customer name is required.": "اسم العميل مطلوب.",
  "customer name is required": "اسم العميل مطلوب.",
  "phone number is required.": "رقم الهاتف مطلوب.",
  "phone number is required": "رقم الهاتف مطلوب.",
  "delivery address is required.": "عنوان التوصيل مطلوب.",
  "delivery address is required": "عنوان التوصيل مطلوب.",
  "city is required.": "المدينة مطلوبة.",
  "city is required": "المدينة مطلوبة.",
  "delivery address and city are required.": "عنوان التوصيل والمدينة مطلوبان.",
  "delivery address and city are required": "عنوان التوصيل والمدينة مطلوبان.",
  "please enter your preferred custom delivery time.": "يرجى إدخال الوقت المفضل للتوصيل.",
  "please enter your preferred custom delivery time": "يرجى إدخال الوقت المفضل للتوصيل.",
  "your cart is empty.": "سلة التسوق فارغة.",
  "your cart is empty": "سلة التسوق فارغة.",
  "your cart is currently empty.": "سلة التسوق فارغة حالياً.",
  "failed to place order. please try again.": "فشل في تسجيل الطلب. يرجى المحاولة مرة أخرى.",
  "failed to place order. please try again": "فشل في تسجيل الطلب. يرجى المحاولة مرة أخرى.",
  "failed to place order.": "فشل في تسجيل الطلب.",
  "failed to place order": "فشل في تسجيل الطلب.",
  "unexpected error placing order.": "حدث خطأ غير متوقع أثناء تسجيل الطلب.",
  "unexpected error placing order": "حدث خطأ غير متوقع أثناء تسجيل الطلب.",
  "failed to verify products in database.": "فشل في التحقق من المنتجات في قاعدة البيانات.",
  "no valid products found.": "لم يتم العثور على منتجات صالحة.",

  // Auth & Session
  "failed to sign in. please check your credentials.": "فشل تسجيل الدخول. يرجى التحقق من صحة بياناتك.",
  "invalid login credentials": "بيانات تسجيل الدخول غير صحيحة.",
  "invalid login credentials.": "بيانات تسجيل الدخول غير صحيحة.",
  "invalid email or password": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "invalid email or password.": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "signed in successfully! redirecting...": "تم تسجيل الدخول بنجاح! جاري التحويل...",
  "signed out successfully.": "تم تسجيل الخروج بنجاح.",
  "signed out successfully": "تم تسجيل الخروج بنجاح.",
  "failed to sign out.": "فشل تسجيل الخروج.",
  "failed to sign out": "فشل تسجيل الخروج.",
  "registration failed.": "فشل إنشاء الحساب.",
  "registration failed": "فشل إنشاء الحساب.",
  "failed to create account.": "فشل في إنشاء الحساب.",
  "account created successfully! please sign in.": "تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.",
  "account created! redirecting to your account...": "تم إنشاء الحساب بنجاح! جاري التحويل إلى حسابك...",
  "user already registered": "هذا المستخدم مسجل مسبقاً.",
  "user already registered.": "هذا المستخدم مسجل مسبقاً.",
  "user already exists": "هذا المستخدم موجود بالفعل.",
  "user already exists.": "هذا المستخدم موجود بالفعل.",
  "a user with this email address has already been registered": "يوجد حساب مسجل بهذا البريد الإلكتروني مسبقاً.",
  "passwords do not match.": "كلمتا المرور غير متطابقتين.",
  "passwords do not match": "كلمتا المرور غير متطابقتين.",
  "password should be at least 6 characters": "يجب ألا تقل كلمة المرور عن 6 أحرف.",
  "valid email and a password of at least 6 characters are required.": "يلزم بريد إلكتروني صالح وكلمة مرور لا تقل عن 6 أحرف.",
  "failed to send reset code.": "فشل في إرسال رمز إعادة التعيين.",
  "invalid otp code.": "رمز التحقق غير صحيح.",
  "invalid otp code": "رمز التحقق غير صحيح.",
  "invalid or expired otp code. please try again.": "رمز التحقق غير صحيح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.",
  "invalid or expired reset session. please request a new otp.": "جلسة إعادة التعيين منتهية الصلاحية. يرجى طلب رمز جديد.",
  "otp verified! please set your new password.": "تم التحقق من الرمز بنجاح! يرجى تعيين كلمة المرور الجديدة.",
  "failed to verify otp.": "فشل في التحقق من الرمز.",
  "password updated successfully! please sign in with your new password.": "تم تحديث كلمة المرور بنجاح! يرجى تسجيل الدخول بكلمة المرور الجديدة.",
  "failed to update password.": "فشل في تحديث كلمة المرور.",
  "failed to reset password.": "فشل في إعادة تعيين كلمة المرور.",
  "account not found with this email.": "لم يتم العثور على حساب بهذا البريد الإلكتروني.",
  "email and otp are required.": "البريد الإلكتروني ورمز التحقق مطلوبان.",
  "no file provided": "لم يتم تقديم أي ملف.",
  "failed to upload image": "فشل في رفع الصورة.",
  "failed to upload video": "فشل في رفع الفيديو.",
  "something went wrong. please try again later.": "حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.",
  "something went wrong. please try again later": "حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.",
  "an unexpected error occurred.": "حدث خطأ غير متوقع.",
  "an unexpected error occurred": "حدث خطأ غير متوقع.",
};

/**
 * Translates dynamic database strings, errors, and alerts to Arabic if Arabic language is selected.
 */
export function translateDynamic(
  text: string | null | undefined,
  language: "en" | "ar" = "en"
): string {
  if (!text) return "";
  if (language !== "ar") return text;

  const trimmed = text.trim();
  const normalized = trimmed.toLowerCase();

  // 1. Direct dictionary match
  if (DB_ARABIC_DICTIONARY[normalized]) {
    return DB_ARABIC_DICTIONARY[normalized];
  }

  // Also check without trailing punctuation
  const withoutPunctuation = normalized.replace(/[!.?]+$/, "");
  if (DB_ARABIC_DICTIONARY[withoutPunctuation]) {
    return DB_ARABIC_DICTIONARY[withoutPunctuation];
  }

  // 2. Pattern matches for dynamic variables
  if (normalized.includes("a 6-digit otp code has been sent to")) {
    const emailMatch = trimmed.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const targetEmail = emailMatch ? emailMatch[0] : "";
    return `تم إرسال رمز تحقق مكون من 6 أرقام إلى ${targetEmail}`;
  }

  if (normalized.includes("already subscribed")) {
    return "هذا البريد الإلكتروني مشترك بالفعل في النشرة البريدية!";
  }

  if (normalized.includes("duplicate") || normalized.includes("unique")) {
    return "هذه البيانات مسجلة مسبقاً.";
  }

  if (normalized.includes("invalid login") || normalized.includes("invalid credentials")) {
    return "بيانات تسجيل الدخول غير صحيحة.";
  }

  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "هذا الحساب مسجل مسبقاً.";
  }

  if (normalized.includes("password") && normalized.includes("match")) {
    return "كلمتا المرور غير متطابقتين.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "تم إرسال طلبات كثيرة جداً. يرجى الانتظار قليلاً والمحاولة لاحقاً.";
  }

  if (normalized === "long lasting" || normalized === "long lansing") {
    return "ثبات وفوحان يدوم طويلاً";
  }

  return text;
}
