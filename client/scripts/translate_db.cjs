const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '../public/locales');

// English base (useful as fallback)
const enTranslations = {
  dynamic: {
    // Crops
    "Rice": "Rice",
    "Wheat": "Wheat",
    "Maize": "Maize",
    "Cotton": "Cotton",
    "Groundnut": "Groundnut",
    "Sugarcane": "Sugarcane",
    "Turmeric": "Turmeric",
    "Jowar": "Jowar",
    "Soybean": "Soybean",
    "Mustard": "Mustard",
    
    // Suffixes
    "Mandi Center": "Mandi Center",
    "Main Market Yard": "Main Market Yard"
  },
  queue: {
    "in_queue": "in queue",
    "min": "min",
    "today": "Today",
    "serving": "Serving",
    "waiting": "Waiting",
    "total": "total",
    "done": "done",
    "counters": "counters",
    "no_one": "No one in queue",
    "center_not_found": "Center not found",
    "overview": "Queue Overview"
  }
};

const translations = {
  hi: {
    dynamic: {
      "Rice": "चावल",
      "Wheat": "गेहूँ",
      "Maize": "मक्का",
      "Cotton": "कपास",
      "Groundnut": "मूंगफली",
      "Sugarcane": "गन्ना",
      "Turmeric": "हल्दी",
      "Jowar": "ज्वार",
      "Soybean": "सोयाबीन",
      "Mustard": "सरसों",
      "Mandi Center": "मंडी केंद्र",
      "Main Market Yard": "मुख्य बाज़ार यार्ड"
    },
    queue: {
      "in_queue": "कतार में",
      "min": "मिनट",
      "today": "आज",
      "serving": "सेवा दी जा रही है",
      "waiting": "प्रतीक्षा में",
      "total": "कुल",
      "done": "पूर्ण",
      "counters": "काउंटर",
      "no_one": "कतार में कोई नहीं",
      "center_not_found": "केंद्र नहीं मिला",
      "overview": "कतार अवलोकन"
    }
  },
  te: {
    dynamic: {
      "Rice": "వరి",
      "Wheat": "గోధుమ",
      "Maize": "మొక్కజొన్న",
      "Cotton": "పత్తి",
      "Groundnut": "వేరుశెనగ",
      "Sugarcane": "చెరకు",
      "Turmeric": "పసుపు",
      "Jowar": "జొన్న",
      "Soybean": "సోయాబీన్",
      "Mustard": "ఆవాలు",
      "Mandi Center": "మండి కేంద్రం",
      "Main Market Yard": "ప్రధాన మార్కెట్ యార్డ్"
    },
    queue: {
      "in_queue": "క్యూలో",
      "min": "నిమిషాలు",
      "today": "నేడు",
      "serving": "సేవ చేస్తున్నారు",
      "waiting": "వేచి ఉన్నారు",
      "total": "మొత్తం",
      "done": "పూర్తయింది",
      "counters": "కౌంటర్లు",
      "no_one": "క్యూలో ఎవరూ లేరు",
      "center_not_found": "కేంద్రం కనుగొనబడలేదు",
      "overview": "క్యూ అవలోకనం"
    }
  },
  kn: {
    dynamic: {
      "Rice": "ಅಕ್ಕಿ",
      "Wheat": "ಗೋಧಿ",
      "Maize": "ಮೆಕ್ಕೆಜೋಳ",
      "Cotton": "ಹತ್ತಿ",
      "Groundnut": "ಕಡಲೆಕಾಯಿ",
      "Sugarcane": "ಕಬ್ಬು",
      "Turmeric": "ಅರಿಶಿನ",
      "Jowar": "ಜೋಳ",
      "Soybean": "ಸೋಯಾಬೀನ್",
      "Mustard": "ಸಾಸಿವೆ",
      "Mandi Center": "ಮಂಡಿ ಕೇಂದ್ರ",
      "Main Market Yard": "ಮುಖ್ಯ ಮಾರುಕಟ್ಟೆ ಪ್ರಾಂಗಣ"
    },
    queue: {
      "in_queue": "ಸರತಿಯಲ್ಲಿ",
      "min": "ನಿಮಿಷ",
      "today": "ಇಂದು",
      "serving": "ಸೇವೆ ನೀಡಲಾಗುತ್ತಿದೆ",
      "waiting": "ಕಾಯುತ್ತಿದ್ದೇವೆ",
      "total": "ಒಟ್ಟು",
      "done": "ಮುಗಿದಿದೆ",
      "counters": "ಕೌಂಟರ್‌ಗಳು",
      "no_one": "ಸರತಿಯಲ್ಲಿ ಯಾರು ಇಲ್ಲ",
      "center_not_found": "ಕೇಂದ್ರ ಕಂಡುಬಂದಿಲ್ಲ",
      "overview": "ಸರತಿ ಅವಲೋಕನ"
    }
  },
  ta: {
    dynamic: {
      "Rice": "அரிசி",
      "Wheat": "கோதுமை",
      "Maize": "மக்காச்சோளம்",
      "Cotton": "பருத்தி",
      "Groundnut": "நிலக்கடலை",
      "Sugarcane": "கரும்பு",
      "Turmeric": "மஞ்சள்",
      "Jowar": "சோளம்",
      "Soybean": "சோயாபீன்",
      "Mustard": "கடுகு",
      "Mandi Center": "மண்டி மையம்",
      "Main Market Yard": "முக்கிய சந்தை வளாகம்"
    },
    queue: {
      "in_queue": "வரிசையில்",
      "min": "நிமிடங்கள்",
      "today": "இன்று",
      "serving": "சேவை",
      "waiting": "காத்திருப்பு",
      "total": "மொத்தம்",
      "done": "முடிந்தது",
      "counters": "கவுண்டர்கள்",
      "no_one": "வரிசையில் யாரும் இல்லை",
      "center_not_found": "மையம் காணவில்லை",
      "overview": "வரிசை கண்ணோட்டம்"
    }
  },
  mr: {
    dynamic: {
      "Rice": "तांदूळ",
      "Wheat": "गहू",
      "Maize": "मका",
      "Cotton": "कापूस",
      "Groundnut": "भुईमूग",
      "Sugarcane": "ऊस",
      "Turmeric": "हळद",
      "Jowar": "ज्वारी",
      "Soybean": "सोयाबीन",
      "Mustard": "मोहरी",
      "Mandi Center": "मंडी केंद्र",
      "Main Market Yard": "मुख्य बाजार यार्ड"
    },
    queue: {
      "in_queue": "रांगेत",
      "min": "मिनिटे",
      "today": "आज",
      "serving": "सेवा देत आहे",
      "waiting": "प्रतीक्षेत",
      "total": "एकूण",
      "done": "पूर्ण",
      "counters": "काउंटर",
      "no_one": "रांगेत कोणीही नाही",
      "center_not_found": "केंद्र सापडले नाही",
      "overview": "रांग विहंगावलोकन"
    }
  },
  or: {
    dynamic: {
      "Rice": "ଚାଉଳ",
      "Wheat": "ଗହମ",
      "Maize": "ମକା",
      "Cotton": "କପା",
      "Groundnut": "ଚିନାବାଦାମ",
      "Sugarcane": "ଆଖୁ",
      "Turmeric": "ହଳଦୀ",
      "Jowar": "ଜୋଆର୍",
      "Soybean": "ସୋୟାବିନ୍",
      "Mustard": "ସୋରିଷ",
      "Mandi Center": "ମଣ୍ଡି କେନ୍ଦ୍ର",
      "Main Market Yard": "ମୁଖ୍ୟ ବଜାର ପ୍ରାଙ୍ଗଣ"
    },
    queue: {
      "in_queue": "ଧାଡ଼ିରେ",
      "min": "ମିନିଟ୍",
      "today": "ଆଜି",
      "serving": "ସେବା ପ୍ରଦାନ",
      "waiting": "ଅପେକ୍ଷାରେ",
      "total": "ମୋଟ",
      "done": "ସମ୍ପୂର୍ଣ୍ଣ",
      "counters": "କାଉଣ୍ଟର",
      "no_one": "ଧାଡ଼ିରେ କେହି ନାହାଁନ୍ତି",
      "center_not_found": "କେନ୍ଦ୍ର ମିଳିଲା ନାହିଁ",
      "overview": "ଧାଡ଼ି ସମୀକ୍ଷା"
    }
  }
};

const dirs = fs.readdirSync(localesPath);

dirs.forEach(lang => {
  const tFilePath = path.join(localesPath, lang, 'translation.json');
  if (fs.existsSync(tFilePath)) {
    const content = JSON.parse(fs.readFileSync(tFilePath, 'utf8'));
    
    const additions = translations[lang] || enTranslations;
    
    // Merge dynamic
    content.dynamic = { ...content.dynamic, ...additions.dynamic };
    
    // Merge queue
    content.queue = { ...content.queue, ...additions.queue };

    fs.writeFileSync(tFilePath, JSON.stringify(content, null, 2));
    console.log(`Updated ${lang}/translation.json`);
  }
});
