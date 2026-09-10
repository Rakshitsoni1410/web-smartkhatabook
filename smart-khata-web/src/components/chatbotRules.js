// ─────────────────────────────────────────────────────────────────────────
// Rule-based, multi-language knowledge base for the SmartKhataBook chatbot.
// Still 100% keyword matching — no AI, no network calls — just now the
// rules exist in three languages: English (en), Hindi (hi), Gujarati (gu).
//
// HOW TO ADD A NEW RULE:
//   Add a matching block (same `id`) to RULES.en, RULES.hi, AND RULES.gu.
//   If you only add it to one language, it simply won't trigger when the
//   bot is set to the other languages — that's fine, just be consistent
//   if you want a rule available everywhere.
// ─────────────────────────────────────────────────────────────────────────

export const LANGUAGES = {
  en: { label: "EN", name: "English" },
  hi: { label: "हिं", name: "हिंदी" },
  gu: { label: "ગુજ", name: "ગુજરાતી" },
};

export const DEFAULT_LANGUAGE = "en";

export const GREETING = {
  en: "Hey! 👋 I'm the SmartKhataBook assistant. Ask me about Stock, Orders, Employees, Reviews, or your Account.",
  hi: "नमस्ते! 👋 मैं SmartKhataBook सहायक हूं। स्टॉक, ऑर्डर, कर्मचारी, समीक्षा या आपके खाते के बारे में पूछें।",
  gu: "નમસ્તે! 👋 હું SmartKhataBook સહાયક છું. સ્ટોક, ઓર્ડર, કર્મચારી, રિવ્યુ અથવા તમારા એકાઉન્ટ વિશે પૂછો.",
};

export const FALLBACK_RESPONSE = {
  en: "I can only help with questions about using SmartKhataBook — things like Stock, Orders, Employees, Reviews, or your Account. Try asking one of those!",
  hi: "मैं केवल SmartKhataBook के उपयोग से जुड़े सवालों में मदद कर सकता हूं — जैसे स्टॉक, ऑर्डर, कर्मचारी, समीक्षा, या आपका खाता। कृपया इनमें से कुछ पूछें!",
  gu: "હું ફક્ત SmartKhataBook ના ઉપયોગ સંબંધિત પ્રશ્નોમાં મદદ કરી શકું છું — જેમ કે સ્ટોક, ઓર્ડર, કર્મચારી, રિવ્યુ, અથવા તમારું એકાઉન્ટ. કૃપા કરી આમાંથી કંઈક પૂછો!",
};

export const LANGUAGE_SWITCH_NOTICE = {
  en: "Switched to English ✅",
  hi: "हिंदी में बदल दिया गया ✅",
  gu: "ગુજરાતીમાં બદલાયું ✅",
};

export const QUICK_REPLIES = {
  en: [
    "How do I add stock?",
    "How do I pay an employee?",
    "How do I track an order?",
    "How do I reply to a review?",
  ],
  hi: [
    "स्टॉक कैसे जोड़ें?",
    "कर्मचारी को भुगतान कैसे करें?",
    "ऑर्डर कैसे ट्रैक करें?",
    "समीक्षा का जवाब कैसे दें?",
  ],
  gu: [
    "સ્ટોક કેવી રીતે ઉમેરવો?",
    "કર્મચારીને ચુકવણી કેવી રીતે કરવી?",
    "ઓર્ડર કેવી રીતે ટ્રેક કરવો?",
    "રિવ્યુનો જવાબ કેવી રીતે આપવો?",
  ],
};

export const RULES = {
  // ═══════════════════════════════ ENGLISH ═══════════════════════════════
  en: [
    {
      id: "greeting",
      keywords: ["hi", "hello", "hey", "yo", "namaste"],
      response: GREETING.en,
    },
    {
      id: "thanks",
      keywords: ["thanks", "thank you", "thx", "ty"],
      response:
        "You're welcome! Anything else about SmartKhataBook I can help with?",
    },
    {
      id: "what-is-app",
      keywords: [
        "what is this app",
        "what is smartkhatabook",
        "what does this app do",
        "about this app",
      ],
      response:
        "SmartKhataBook is a business management app for retailers and wholesalers — track stock, manage employees, place/track orders, and view customer reviews, all in one dashboard.",
    },
    {
      id: "dashboard-overview",
      keywords: ["dashboard", "overview", "home screen", "main screen"],
      response:
        "Your Dashboard shows a quick summary: total Stock Items, active Employees, Orders placed, and your average Review rating. Tap any card to jump straight to that section.",
    },
    {
      id: "add-stock",
      keywords: [
        "add stock",
        "add product",
        "new product",
        "create product",
        "how to add item",
      ],
      response:
        "To add a product: go to **Stock** → click **+ Add Product** → enter name, category, selling price, and quantity → Save.",
    },
    {
      id: "edit-delete-stock",
      keywords: [
        "edit product",
        "delete product",
        "remove product",
        "update stock",
      ],
      response:
        "On the **Stock** page, each product card has an edit (pencil) icon and a delete (trash) icon in the top-right corner. Tap either to update or remove that product.",
    },
    {
      id: "low-stock",
      keywords: ["low stock", "stock alert", "out of stock", "running low"],
      response:
        "Products are automatically flagged **Low Stock** once quantity drops to a low threshold, so you know to restock before you run out.",
    },
    {
      id: "add-employee",
      keywords: ["add employee", "new employee", "hire", "add staff"],
      response:
        "Go to **Employees** → click **+ Add Employee** → fill in name, phone number, and role (e.g. Salesman) → Save.",
    },
    {
      id: "pay-employee",
      keywords: [
        "pay employee",
        "pay salary",
        "salary payment",
        "pending salary",
      ],
      response:
        "On the **Employees** page, each employee card shows Paid vs Total salary with a progress bar. Tap the orange **Pay** button to record a new payment.",
    },
    {
      id: "employee-attendance",
      keywords: [
        "attendance",
        "present today",
        "employee present",
        "mark attendance",
      ],
      response:
        '"Present Today" on the Employees page shows how many staff have been marked present for the current day.',
    },
    {
      id: "order-status",
      keywords: [
        "order status",
        "track order",
        "pending order",
        "completed order",
        "processing order",
      ],
      response:
        "Orders can be **Pending**, **Processing**, or **Completed**. Check the **Orders** page — each card shows the current status, quantity, and total amount.",
    },
    {
      id: "place-order",
      keywords: [
        "place order",
        "new order",
        "create order",
        "buy stock",
        "order from supplier",
      ],
      response:
        "As a retailer, you can browse the supplier marketplace and place a restock order directly from a wholesaler's product listing.",
    },
    {
      id: "reviews",
      keywords: ["review", "rating", "customer feedback", "reply to review"],
      response:
        "The **Reviews** page shows your average rating and recent customer reviews. You can tap a review to write a reply directly.",
    },
    {
      id: "ledger",
      keywords: ["ledger", "khata", "account book", "transaction history"],
      response:
        "The **Ledger** page keeps a running record of your business transactions — a digital khata for tracking dues and payments over time.",
    },
    {
      id: "login-help",
      keywords: ["login", "log in", "sign in", "can't login", "cannot login"],
      response:
        "Log in with your registered phone number and password from the **Sign in** screen. If it's not working, try **Forgot password?** below the password field.",
    },
    {
      id: "register-help",
      keywords: ["register", "sign up", "create account", "new account"],
      response:
        "Tap **Create account** on the login screen, then fill in your business details to get started. New users also get a quick app walkthrough.",
    },
    {
      id: "forgot-password",
      keywords: ["forgot password", "reset password", "change password"],
      response:
        "Tap **Forgot password?** on the login screen and follow the steps to reset it via your registered phone number.",
    },
    {
      id: "human-support",
      keywords: [
        "talk to human",
        "real person",
        "customer support",
        "contact support",
        "help desk",
      ],
      response:
        "I'm an automated assistant for app usage questions only. For account-specific issues, please reach out to SmartKhataBook support through the Settings page.",
    },
  ],

  // ═══════════════════════════════ HINDI ══════════════════════════════════
  hi: [
    {
      id: "greeting",
      keywords: ["नमस्ते", "हाय", "हैलो", "हेलो"],
      response: GREETING.hi,
    },
    {
      id: "thanks",
      keywords: ["धन्यवाद", "शुक्रिया", "थैंक्यू"],
      response: "आपका स्वागत है! SmartKhataBook से जुड़ा और कुछ पूछना चाहेंगे?",
    },
    {
      id: "what-is-app",
      keywords: [
        "यह ऐप क्या है",
        "smartkhatabook क्या है",
        "इस ऐप के बारे में",
      ],
      response:
        "SmartKhataBook खुदरा और थोक व्यापारियों के लिए एक व्यवसाय प्रबंधन ऐप है — स्टॉक ट्रैक करें, कर्मचारी प्रबंधित करें, ऑर्डर दें/ट्रैक करें, और ग्राहक समीक्षाएं देखें — सब एक ही डैशबोर्ड में।",
    },
    {
      id: "dashboard-overview",
      keywords: ["डैशबोर्ड", "मुख्य स्क्रीन", "होम स्क्रीन"],
      response:
        "आपका डैशबोर्ड एक त्वरित सारांश दिखाता है: कुल स्टॉक आइटम, सक्रिय कर्मचारी, दिए गए ऑर्डर, और आपकी औसत समीक्षा रेटिंग। किसी भी कार्ड पर टैप करके सीधे उस सेक्शन में जाएं।",
    },
    {
      id: "add-stock",
      keywords: [
        "स्टॉक जोड़ें",
        "नया प्रोडक्ट",
        "प्रोडक्ट कैसे जोड़ें",
        "आइटम कैसे जोड़ें",
      ],
      response:
        "प्रोडक्ट जोड़ने के लिए: **स्टॉक** पर जाएं → **+ Add Product** पर क्लिक करें → नाम, श्रेणी, विक्रय मूल्य और मात्रा दर्ज करें → Save करें।",
    },
    {
      id: "edit-delete-stock",
      keywords: [
        "प्रोडक्ट एडिट करें",
        "प्रोडक्ट डिलीट करें",
        "स्टॉक अपडेट करें",
        "प्रोडक्ट हटाएं",
      ],
      response:
        "**स्टॉक** पेज पर, हर प्रोडक्ट कार्ड के ऊपरी दाएं कोने में एडिट (पेंसिल) और डिलीट (ट्रैश) आइकन होते हैं। अपडेट या हटाने के लिए उन पर टैप करें।",
    },
    {
      id: "low-stock",
      keywords: ["लो स्टॉक", "स्टॉक अलर्ट", "स्टॉक खत्म", "स्टॉक कम"],
      response:
        "जब किसी प्रोडक्ट की मात्रा एक निश्चित सीमा से कम हो जाती है तो उसे अपने आप **Low Stock** के रूप में चिह्नित कर दिया जाता है, ताकि आपको समय पर पता चल सके।",
    },
    {
      id: "add-employee",
      keywords: ["कर्मचारी जोड़ें", "नया कर्मचारी", "स्टाफ जोड़ें"],
      response:
        "**कर्मचारी** पर जाएं → **+ Add Employee** पर क्लिक करें → नाम, फोन नंबर और भूमिका (जैसे सेल्समैन) भरें → Save करें।",
    },
    {
      id: "pay-employee",
      keywords: [
        "कर्मचारी को भुगतान",
        "सैलरी भुगतान",
        "सैलरी पेमेंट",
        "बकाया सैलरी",
      ],
      response:
        "**कर्मचारी** पेज पर, हर कर्मचारी कार्ड में Paid और Total सैलरी का प्रोग्रेस बार दिखता है। नया भुगतान दर्ज करने के लिए नारंगी **Pay** बटन पर टैप करें।",
    },
    {
      id: "employee-attendance",
      keywords: ["उपस्थिति", "आज उपस्थित", "अटेंडेंस"],
      response:
        'कर्मचारी पेज पर "Present Today" दिखाता है कि आज कितने स्टाफ को उपस्थित के रूप में चिह्नित किया गया है।',
    },
    {
      id: "order-status",
      keywords: [
        "ऑर्डर स्टेटस",
        "ऑर्डर ट्रैक",
        "पेंडिंग ऑर्डर",
        "पूरा हुआ ऑर्डर",
      ],
      response:
        "ऑर्डर **Pending**, **Processing**, या **Completed** हो सकते हैं। **Orders** पेज देखें — हर कार्ड में वर्तमान स्थिति, मात्रा और कुल राशि दिखती है।",
    },
    {
      id: "place-order",
      keywords: ["ऑर्डर दें", "नया ऑर्डर", "सप्लायर से ऑर्डर", "स्टॉक खरीदें"],
      response:
        "एक रिटेलर के रूप में, आप सप्लायर मार्केटप्लेस ब्राउज़ कर सकते हैं और किसी थोक व्यापारी की लिस्टिंग से सीधे रीस्टॉक ऑर्डर दे सकते हैं।",
    },
    {
      id: "reviews",
      keywords: ["समीक्षा", "रेटिंग", "ग्राहक फीडबैक", "रिव्यू का जवाब"],
      response:
        "**Reviews** पेज आपकी औसत रेटिंग और हाल की ग्राहक समीक्षाएं दिखाता है। किसी समीक्षा पर टैप करके सीधे जवाब लिख सकते हैं।",
    },
    {
      id: "ledger",
      keywords: ["लेजर", "खाता बही", "लेन-देन का इतिहास"],
      response:
        "**Ledger** पेज आपके व्यवसाय के लेन-देन का लगातार रिकॉर्ड रखता है — समय के साथ बकाया और भुगतान ट्रैक करने के लिए एक डिजिटल खाता बही।",
    },
    {
      id: "login-help",
      keywords: ["लॉगिन", "साइन इन", "लॉगिन नहीं हो रहा"],
      response:
        "अपने रजिस्टर्ड फोन नंबर और पासवर्ड से **Sign in** स्क्रीन पर लॉगिन करें। अगर काम नहीं कर रहा तो पासवर्ड फील्ड के नीचे **Forgot password?** आज़माएं।",
    },
    {
      id: "register-help",
      keywords: ["रजिस्टर करें", "साइन अप", "नया खाता"],
      response:
        "लॉगिन स्क्रीन पर **Create account** पर टैप करें, फिर अपने व्यवसाय की जानकारी भरकर शुरू करें। नए यूज़र्स को एक त्वरित ऐप वॉकथ्रू भी मिलता है।",
    },
    {
      id: "forgot-password",
      keywords: ["पासवर्ड भूल गए", "पासवर्ड रीसेट", "पासवर्ड बदलें"],
      response:
        "लॉगिन स्क्रीन पर **Forgot password?** पर टैप करें और अपने रजिस्टर्ड फोन नंबर से रीसेट करने के चरणों का पालन करें।",
    },
    {
      id: "human-support",
      keywords: ["इंसान से बात", "कस्टमर सपोर्ट", "हेल्प डेस्क"],
      response:
        "मैं केवल ऐप उपयोग से जुड़े सवालों के लिए एक स्वचालित सहायक हूं। खाता-विशेष समस्याओं के लिए कृपया Settings पेज के माध्यम से SmartKhataBook सपोर्ट से संपर्क करें।",
    },
  ],

  // ═══════════════════════════════ GUJARATI ═══════════════════════════════
  gu: [
    {
      id: "greeting",
      keywords: ["નમસ્તે", "કેમ છો", "હાય", "હેલો"],
      response: GREETING.gu,
    },
    {
      id: "thanks",
      keywords: ["આભાર", "થેંક્યુ"],
      response: "તમારું સ્વાગત છે! SmartKhataBook વિશે બીજું કંઈ પૂછવું છે?",
    },
    {
      id: "what-is-app",
      keywords: ["આ એપ શું છે", "smartkhatabook શું છે", "આ એપ વિશે"],
      response:
        "SmartKhataBook એ રિટેલર્સ અને હોલસેલર્સ માટે બિઝનેસ મેનેજમેન્ટ એપ છે — સ્ટોક ટ્રેક કરો, કર્મચારીઓનું સંચાલન કરો, ઓર્ડર આપો/ટ્રેક કરો, અને ગ્રાહક રિવ્યુ જુઓ — બધું એક જ ડેશબોર્ડમાં.",
    },
    {
      id: "dashboard-overview",
      keywords: ["ડેશબોર્ડ", "હોમ સ્ક્રીન", "મુખ્ય સ્ક્રીન"],
      response:
        "તમારું ડેશબોર્ડ ઝડપી સારાંશ બતાવે છે: કુલ સ્ટોક આઇટમ્સ, સક્રિય કર્મચારીઓ, આપેલા ઓર્ડર્સ, અને તમારું સરેરાશ રિવ્યુ રેટિંગ. કોઈપણ કાર્ડ પર ટેપ કરીને સીધા તે સેક્શનમાં જાઓ.",
    },
    {
      id: "add-stock",
      keywords: ["સ્ટોક ઉમેરો", "નવું પ્રોડક્ટ", "પ્રોડક્ટ કેવી રીતે ઉમેરવું"],
      response:
        "પ્રોડક્ટ ઉમેરવા માટે: **સ્ટોક** પર જાઓ → **+ Add Product** પર ક્લિક કરો → નામ, કેટેગરી, વેચાણ કિંમત અને જથ્થો દાખલ કરો → Save કરો.",
    },
    {
      id: "edit-delete-stock",
      keywords: ["પ્રોડક્ટ એડિટ કરો", "પ્રોડક્ટ ડિલીટ કરો", "સ્ટોક અપડેટ કરો"],
      response:
        "**સ્ટોક** પેજ પર, દરેક પ્રોડક્ટ કાર્ડના ઉપર-જમણા ખૂણામાં એડિટ (પેન્સિલ) અને ડિલીટ (ટ્રેશ) આઇકન હોય છે. અપડેટ અથવા દૂર કરવા માટે તેના પર ટેપ કરો.",
    },
    {
      id: "low-stock",
      keywords: ["લો સ્ટોક", "સ્ટોક એલર્ટ", "સ્ટોક ખલાસ", "સ્ટોક ઓછો"],
      response:
        "જ્યારે કોઈ પ્રોડક્ટનો જથ્થો ચોક્કસ મર્યાદાથી ઓછો થાય છે ત્યારે તેને આપમેળે **Low Stock** તરીકે ચિહ્નિત કરવામાં આવે છે, જેથી તમને સમયસર ખબર પડે.",
    },
    {
      id: "add-employee",
      keywords: ["કર્મચારી ઉમેરો", "નવો કર્મચારી", "સ્ટાફ ઉમેરો"],
      response:
        "**કર્મચારી** પર જાઓ → **+ Add Employee** પર ક્લિક કરો → નામ, ફોન નંબર અને ભૂમિકા (દા.ત. સેલ્સમેન) ભરો → Save કરો.",
    },
    {
      id: "pay-employee",
      keywords: ["કર્મચારીને ચુકવણી", "પગાર ચુકવણી", "બાકી પગાર"],
      response:
        "**કર્મચારી** પેજ પર, દરેક કર્મચારી કાર્ડમાં Paid અને Total પગારનો પ્રોગ્રેસ બાર દેખાય છે. નવી ચુકવણી નોંધવા માટે નારંગી **Pay** બટન પર ટેપ કરો.",
    },
    {
      id: "employee-attendance",
      keywords: ["હાજરી", "આજે હાજર", "અટેન્ડન્સ"],
      response:
        'કર્મચારી પેજ પર "Present Today" બતાવે છે કે આજે કેટલા સ્ટાફને હાજર તરીકે ચિહ્નિત કરવામાં આવ્યા છે.',
    },
    {
      id: "order-status",
      keywords: ["ઓર્ડર સ્ટેટસ", "ઓર્ડર ટ્રેક", "પેન્ડિંગ ઓર્ડર"],
      response:
        "ઓર્ડર **Pending**, **Processing**, અથવા **Completed** હોઈ શકે છે. **Orders** પેજ તપાસો — દરેક કાર્ડ વર્તમાન સ્થિતિ, જથ્થો અને કુલ રકમ બતાવે છે.",
    },
    {
      id: "place-order",
      keywords: ["ઓર્ડર આપો", "નવો ઓર્ડર", "સપ્લાયર પાસેથી ઓર્ડર"],
      response:
        "રિટેલર તરીકે, તમે સપ્લાયર માર્કેટપ્લેસ બ્રાઉઝ કરી શકો છો અને હોલસેલરની લિસ્ટિંગમાંથી સીધો રીસ્ટોક ઓર્ડર આપી શકો છો.",
    },
    {
      id: "reviews",
      keywords: ["રિવ્યુ", "રેટિંગ", "ગ્રાહક ફીડબેક"],
      response:
        "**Reviews** પેજ તમારું સરેરાશ રેટિંગ અને તાજેતરના ગ્રાહક રિવ્યુ બતાવે છે. કોઈ રિવ્યુ પર ટેપ કરીને સીધો જવાબ લખી શકો છો.",
    },
    {
      id: "ledger",
      keywords: ["લેજર", "ખાતાવહી", "વ્યવહાર ઇતિહાસ"],
      response:
        "**Ledger** પેજ તમારા બિઝનેસ વ્યવહારોનો સતત રેકોર્ડ રાખે છે — સમય જતાં બાકી અને ચુકવણી ટ્રેક કરવા માટે ડિજિટલ ખાતાવહી.",
    },
    {
      id: "login-help",
      keywords: ["લોગિન", "સાઇન ઇન", "લોગિન નથી થતું"],
      response:
        "તમારા રજિસ્ટર્ડ ફોન નંબર અને પાસવર્ડથી **Sign in** સ્ક્રીન પર લોગિન કરો. જો કામ ન કરે તો પાસવર્ડ ફિલ્ડ નીચે **Forgot password?** અજમાવો.",
    },
    {
      id: "register-help",
      keywords: ["રજિસ્ટર કરો", "સાઇન અપ", "નવું એકાઉન્ટ"],
      response:
        "લોગિન સ્ક્રીન પર **Create account** પર ટેપ કરો, પછી તમારી બિઝનેસ વિગતો ભરીને શરૂ કરો. નવા યુઝર્સને ઝડપી એપ વોકથ્રુ પણ મળે છે.",
    },
    {
      id: "forgot-password",
      keywords: ["પાસવર્ડ ભૂલી ગયા", "પાસવર્ડ રીસેટ"],
      response:
        "લોગિન સ્ક્રીન પર **Forgot password?** પર ટેપ કરો અને તમારા રજિસ્ટર્ડ ફોન નંબર દ્વારા રીસેટ કરવાના પગલાં અનુસરો.",
    },
    {
      id: "human-support",
      keywords: ["માણસ સાથે વાત", "કસ્ટમર સપોર્ટ"],
      response:
        "હું ફક્ત એપ ઉપયોગ સંબંધિત પ્રશ્નો માટે ઓટોમેટેડ સહાયક છું. એકાઉન્ટ-વિશિષ્ટ સમસ્યાઓ માટે કૃપા કરી Settings પેજ દ્વારા SmartKhataBook સપોર્ટનો સંપર્ક કરો.",
    },
  ],
};
