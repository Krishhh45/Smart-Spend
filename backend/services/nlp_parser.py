import re
from datetime import datetime, date, timedelta

# Devanagari digit mapping
DEVANAGARI_DIGITS = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
}

def normalize_devanagari_numbers(text: str) -> str:
    """Converts Devanagari numerals (०-९) to Arabic numerals (0-9)."""
    for dev, arab in DEVANAGARI_DIGITS.items():
        text = text.replace(dev, arab)
    return text

# Comprehensive dictionary mapping Devanagari/Hindi/Marathi words & phrases to English merchant & category
ENGLISH_TRANSLATION_MAP = {
    # Specifically requested: "chaha" / "chai" / "चहा" / "चाय" -> merchant: "chai"
    "chai": ("chai", "Food & Dining"),
    "chaha": ("chai", "Food & Dining"),
    "चाय": ("chai", "Food & Dining"),
    "चहा": ("chai", "Food & Dining"),
    "च्या": ("chai", "Food & Dining"),
    "चाहा": ("chai", "Food & Dining"),
    "चाह": ("chai", "Food & Dining"),
    "chya": ("chai", "Food & Dining"),
    "tea": ("chai", "Food & Dining"),
    "टी": ("chai", "Food & Dining"),

    # Battery / Electronics
    "न्यू बॅटरी": ("New Battery", "Shopping"),
    "न्यू बैटरी": ("New Battery", "Shopping"),
    "बॅटरी": ("Battery", "Shopping"),
    "बैटरी": ("Battery", "Shopping"),
    "battery": ("Battery", "Shopping"),
    "new battery": ("New Battery", "Shopping"),

    # Fuel / Travel
    "petrol": ("Petrol", "Fuel"),
    "पेट्रोल": ("Petrol", "Fuel"),
    "diesel": ("Diesel", "Fuel"),
    "डीझेल": ("Diesel", "Fuel"),
    "डीजल": ("Diesel", "Fuel"),
    "fuel": ("Fuel", "Fuel"),
    "इंधन": ("Fuel", "Fuel"),
    "auto": ("Auto Rickshaw", "Transportation"),
    "rickshaw": ("Auto Rickshaw", "Transportation"),
    "रिक्षा": ("Auto Rickshaw", "Transportation"),
    "रिक्शा": ("Auto Rickshaw", "Transportation"),
    "bus": ("Bus Fare", "Transportation"),
    "बस": ("Bus Fare", "Transportation"),
    "metro": ("Metro Fare", "Transportation"),
    "मेट्रो": ("Metro Fare", "Transportation"),
    "train": ("Train Ticket", "Transportation"),
    "ट्रेन": ("Train Ticket", "Transportation"),
    "railway": ("Railway", "Transportation"),
    "रेल्वे": ("Railway", "Transportation"),
    "cab": ("Cab Fare", "Transportation"),
    "uber": ("Uber", "Transportation"),
    "ola": ("Ola", "Transportation"),
    "rapido": ("Rapido", "Transportation"),
    "fastag": ("FASTag Toll", "Transportation"),
    "टोल": ("FASTag Toll", "Transportation"),

    # Groceries / Dairy
    "groceries": ("Groceries", "Groceries"),
    "grocery": ("Groceries", "Groceries"),
    "kirana": ("Kirana / Grocery", "Groceries"),
    "किराणा": ("Kirana / Grocery", "Groceries"),
    "किराना": ("Kirana / Grocery", "Groceries"),
    "दूध": ("Milk", "Groceries"),
    "doodh": ("Milk", "Groceries"),
    "milk": ("Milk", "Groceries"),
    "डेअरी": ("Dairy", "Groceries"),
    "डेयरी": ("Dairy", "Groceries"),
    "भाजीपाला": ("Vegetables", "Groceries"),
    "भाजी": ("Vegetables", "Groceries"),
    "सब्जी": ("Vegetables", "Groceries"),
    "vegetables": ("Vegetables", "Groceries"),
    "फळे": ("Fruits", "Groceries"),
    "फल": ("Fruits", "Groceries"),
    "fruits": ("Fruits", "Groceries"),
    "रेशन": ("Ration", "Groceries"),
    "राशन": ("Ration", "Groceries"),
    "ration": ("Ration", "Groceries"),
    # Common Vegetables & Grocery Items (Marathi / Hindi / Transliterated)
    "कांदा": ("Onion", "Groceries"),
    "कांद": ("Onion", "Groceries"),
    "कांदे": ("Onion", "Groceries"),
    "kanda": ("Onion", "Groceries"),
    "kande": ("Onion", "Groceries"),
    "प्याज": ("Onion", "Groceries"),
    "प्याज़": ("Onion", "Groceries"),
    "pyaj": ("Onion", "Groceries"),
    "onion": ("Onion", "Groceries"),
    "onions": ("Onion", "Groceries"),
    "बटाटा": ("Potato", "Groceries"),
    "बटाटे": ("Potato", "Groceries"),
    "batata": ("Potato", "Groceries"),
    "आलू": ("Potato", "Groceries"),
    "aloo": ("Potato", "Groceries"),
    "potato": ("Potato", "Groceries"),
    "टोमॅटो": ("Tomato", "Groceries"),
    "टमाटर": ("Tomato", "Groceries"),
    "tamatar": ("Tomato", "Groceries"),
    "tomato": ("Tomato", "Groceries"),
    "मिरची": ("Chilli", "Groceries"),
    "मिर्ची": ("Chilli", "Groceries"),
    "mirchi": ("Chilli", "Groceries"),
    "लसूण": ("Garlic", "Groceries"),
    "लहसुन": ("Garlic", "Groceries"),
    "lasun": ("Garlic", "Groceries"),
    "garlic": ("Garlic", "Groceries"),
    "आले": ("Ginger", "Groceries"),
    "अदरक": ("Ginger", "Groceries"),
    "adrak": ("Ginger", "Groceries"),
    "ginger": ("Ginger", "Groceries"),
    "तांदूळ": ("Rice", "Groceries"),
    "चावल": ("Rice", "Groceries"),
    "chawal": ("Rice", "Groceries"),
    "tandool": ("Rice", "Groceries"),
    "rice": ("Rice", "Groceries"),
    "गहू": ("Wheat Flour", "Groceries"),
    "गेहूं": ("Wheat Flour", "Groceries"),
    "आटा": ("Wheat Flour", "Groceries"),
    "atta": ("Wheat Flour", "Groceries"),
    "पीठ": ("Flour", "Groceries"),
    "तेल": ("Oil", "Groceries"),
    "oil": ("Oil", "Groceries"),
    "tel": ("Oil", "Groceries"),
    "साखर": ("Sugar", "Groceries"),
    "चीनी": ("Sugar", "Groceries"),
    "sugar": ("Sugar", "Groceries"),
    "मीठ": ("Salt", "Groceries"),
    "नमक": ("Salt", "Groceries"),
    "salt": ("Salt", "Groceries"),
    "डाळ": ("Dal / Lentils", "Groceries"),
    "दाल": ("Dal / Lentils", "Groceries"),
    "dal": ("Dal / Lentils", "Groceries"),
    "अंडे": ("Eggs", "Groceries"),
    "अंडी": ("Eggs", "Groceries"),
    "ande": ("Eggs", "Groceries"),
    "eggs": ("Eggs", "Groceries"),
    "ब्रेड": ("Bread", "Groceries"),
    "bread": ("Bread", "Groceries"),
    "पनीर": ("Paneer", "Groceries"),
    "paneer": ("Paneer", "Groceries"),
    "दही": ("Curd", "Groceries"),
    "curd": ("Curd", "Groceries"),
    "लोणी": ("Butter", "Groceries"),
    "मक्खन": ("Butter", "Groceries"),
    "butter": ("Butter", "Groceries"),
    "बिस्किट": ("Biscuits", "Groceries"),
    "बिस्कुट": ("Biscuits", "Groceries"),
    "biscuit": ("Biscuits", "Groceries"),
    "biscuits": ("Biscuits", "Groceries"),
    "चिप्स": ("Chips", "Groceries"),
    "chips": ("Chips", "Groceries"),

    # Food & Dining
    "coffee": ("Coffee", "Food & Dining"),
    "कॉफी": ("Coffee", "Food & Dining"),
    "swiggy": ("Swiggy", "Food & Dining"),
    "zomato": ("Zomato", "Food & Dining"),
    "नाश्ता": ("Breakfast", "Food & Dining"),
    "nashta": ("Breakfast", "Food & Dining"),
    "breakfast": ("Breakfast", "Food & Dining"),
    "जेवण": ("Dining", "Food & Dining"),
    "खाना": ("Dining", "Food & Dining"),
    "lunch": ("Lunch", "Food & Dining"),
    "dinner": ("Dinner", "Food & Dining"),
    "हॉटेल": ("Restaurant", "Food & Dining"),
    "होटल": ("Restaurant", "Food & Dining"),
    "restaurant": ("Restaurant", "Food & Dining"),
    "धडक": ("Restaurant", "Food & Dining"),
    "ढाबा": ("Dhaba", "Food & Dining"),
    "पिझ्झा": ("Pizza", "Food & Dining"),
    "pizza": ("Pizza", "Food & Dining"),
    "बर्गर": ("Burger", "Food & Dining"),
    "burger": ("Burger", "Food & Dining"),
    "mcdonalds": ("McDonald's", "Food & Dining"),
    "starbucks": ("Starbucks", "Food & Dining"),

    # Indian Food & Snacks
    "वडापाव": ("Vada Pav", "Food & Dining"),
    "vadapav": ("Vada Pav", "Food & Dining"),
    "vada pav": ("Vada Pav", "Food & Dining"),
    "मिसळ": ("Misal Pav", "Food & Dining"),
    "misal": ("Misal Pav", "Food & Dining"),
    "डोसा": ("Dosa", "Food & Dining"),
    "dosa": ("Dosa", "Food & Dining"),
    "इडली": ("Idli", "Food & Dining"),
    "idli": ("Idli", "Food & Dining"),
    "पावभाजी": ("Pav Bhaji", "Food & Dining"),
    "pav bhaji": ("Pav Bhaji", "Food & Dining"),
    "थाळी": ("Thali Meal", "Food & Dining"),
    "थाली": ("Thali Meal", "Food & Dining"),
    "thali": ("Thali Meal", "Food & Dining"),
    "मिठाई": ("Sweets", "Food & Dining"),
    "sweet": ("Sweets", "Food & Dining"),
    "sweets": ("Sweets", "Food & Dining"),
    "snack": ("Snacks", "Food & Dining"),
    "snacks": ("Snacks", "Food & Dining"),

    # Healthcare / Medicine
    "औषध": ("Medicine", "Healthcare"),
    "औषधे": ("Medicine", "Healthcare"),
    "दवा": ("Medicine", "Healthcare"),
    "दवाई": ("Medicine", "Healthcare"),
    "दवाइयां": ("Medicine", "Healthcare"),
    "medicine": ("Medicine", "Healthcare"),
    "medical": ("Medical Store", "Healthcare"),
    "मेडिकल": ("Medical Store", "Healthcare"),
    "डॉक्टर": ("Doctor Fees", "Healthcare"),
    "doctor": ("Doctor Fees", "Healthcare"),
    "hospital": ("Hospital", "Healthcare"),
    "दवाखाना": ("Clinic", "Healthcare"),

    # Bills & Utilities
    "वीज": ("Electricity Bill", "Bills & Utilities"),
    "वीज बिल": ("Electricity Bill", "Bills & Utilities"),
    "बिजली": ("Electricity Bill", "Bills & Utilities"),
    "बिजली बिल": ("Electricity Bill", "Bills & Utilities"),
    "light bill": ("Electricity Bill", "Bills & Utilities"),
    "electricity": ("Electricity Bill", "Bills & Utilities"),
    "पाणी बिल": ("Water Bill", "Bills & Utilities"),
    "पानी बिल": ("Water Bill", "Bills & Utilities"),
    "water bill": ("Water Bill", "Bills & Utilities"),
    "सिलेंडर": ("Gas Cylinder", "Bills & Utilities"),
    "गॅस": ("Gas Cylinder", "Bills & Utilities"),
    "गैस": ("Gas Cylinder", "Bills & Utilities"),
    "gas": ("Gas Cylinder", "Bills & Utilities"),
    "wifi": ("WiFi / Broadband", "Bills & Utilities"),
    "वायफाय": ("WiFi / Broadband", "Bills & Utilities"),
    "recharge": ("Mobile Recharge", "Bills & Utilities"),
    "रिचार्ज": ("Mobile Recharge", "Bills & Utilities"),

    # Housing / Rent
    "भाडे": ("Rent", "Bills & Utilities"),
    "घरभाडे": ("House Rent", "Bills & Utilities"),
    "किराया": ("Rent", "Bills & Utilities"),
    "rent": ("Rent", "Bills & Utilities"),

    # Shopping & Education
    "कपडे": ("Clothing", "Shopping"),
    "कपड़े": ("Clothing", "Shopping"),
    "clothes": ("Clothing", "Shopping"),
    "shopping": ("Shopping", "Shopping"),
    "पुस्तके": ("Books", "Education"),
    "किताबें": ("Books", "Education"),
    "books": ("Books", "Education"),
    "फीस": ("Tuition / School Fees", "Education"),
    "फी": ("Tuition / School Fees", "Education"),
    "fees": ("Tuition / School Fees", "Education"),
    "amazon": ("Amazon", "Shopping"),
    "flipkart": ("Flipkart", "Shopping"),
    "myntra": ("Myntra", "Shopping"),
    "cinema": ("Movie Ticket", "Entertainment"),
    "movie": ("Movie Ticket", "Entertainment"),
    "चित्रपट": ("Movie Ticket", "Entertainment"),
    "theatre": ("Theatre", "Entertainment"),
    "netflix": ("Netflix", "Subscriptions"),
    "spotify": ("Spotify", "Subscriptions")
}

# Devanagari to English phonetic transliteration map for fallback words
DEVANAGARI_TO_LATIN = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
    'ष': 'sh', 'स': 's', 'ह': 'h', 'ळ': 'l', 'क्ष': 'ksh', 'ज्ञ': 'gy',
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
    'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n',
    'ॅ': 'e', 'ॉ': 'o', '्': ''
}

def transliterate_devanagari_to_english(text: str) -> str:
    """Translates/transliterates any Devanagari text into clean, readable English."""
    result = []
    i = 0
    chars = list(text)
    while i < len(chars):
        c = chars[i]
        if c in DEVANAGARI_TO_LATIN:
            trans = DEVANAGARI_TO_LATIN[c]
            # If current is consonant without virama following, in Indian phonetics often has vowel 'a'
            if c in 'कखगघचछजझटठडढणतथदधनपफबभमयरलवशषसहळ' and i + 1 < len(chars):
                next_c = chars[i+1]
                if next_c not in 'ािीुूृेैोौ्ॅॉ':
                    trans += 'a'
            result.append(trans)
        elif c in ' \t\n-':
            result.append(c)
        elif re.match(r'[a-zA-Z0-9]', c):
            result.append(c)
        i += 1
    
    eng = "".join(result).strip()
    return eng.title() if eng else "Expense"

# Expense keywords & command action words (English, Hindi, Marathi)
EXPENSE_KEYWORDS = [
    # English keywords & commands
    "spend", "spent", "spending", "paid", "pay", "bought", "cost", "given", "expense", "purchase", "shopping",
    "add", "adding", "added", "record", "log", "enter", "note", "save", "put",
    # Hindi keywords & commands
    "kharch", "kharcha", "kharchi", "diye", "diya", "kiya", "kiye", "bhara", "khareeda", "kharida",
    "jodo", "jod", "likho", "likh", "daalo", "daal", "karo", "kar",
    "खर्च", "खर्चा", "दिए", "दिया", "किए", "किये", "भरा", "खरीदा", "जोड़ो", "जोडो", "जोड़", "जोड", "लिखो", "लिख", "डालो", "डाल", "करो", "कर", "एड",
    # Marathi keywords & commands
    "kela", "kele", "dile", "dila", "bhare", "bharle", "kharedi", "ghatle", "padle",
    "taka", "tak", "liha", "nondva", "nond", "kara", "dakhil",
    "केला", "केले", "दिले", "दिला", "भरले", "खरेदी", "घेतले",
    "टाक", "टाका", "नोंदवा", "नोंद", "लिहा", "करा", "ॲड", "दाखल"
]

INCOME_KEYWORDS = [
    "salary", "received", "credited", "earned", "income", "freelance", "profit", "cashback", "refund",
    "mila", "mile", "aaye", "aaya", "मिळाले", "मिळाला", "आले", "आया", "कमाए"
]

PAYMENT_MODE_MAP = {
    # Cash - Marathi, Hindi, English & transliterations
    "कॅश": "Cash",
    "कॅशने": "Cash",
    "कॅशनी": "Cash",
    "कैश": "Cash",
    "कैश से": "Cash",
    "कैश में": "Cash",
    "रोख": "Cash",
    "रोखीने": "Cash",
    "रोखाने": "Cash",
    "रोकड": "Cash",
    "रोकडीने": "Cash",
    "रोकडा": "Cash",
    "रोकडी": "Cash",
    "नकद": "Cash",
    "नगद": "Cash",
    "नकद दिया": "Cash",
    "नकद दिले": "Cash",
    "पैसे": "Cash",
    "पैशाने": "Cash",
    "पैशांनी": "Cash",
    "cash": "Cash",
    "by cash": "Cash",
    "in cash": "Cash",
    "hard cash": "Cash",
    "rokh": "Cash",
    "rokhine": "Cash",
    "rokad": "Cash",
    "rokde": "Cash",
    "nakad": "Cash",
    "nagad": "Cash",
    "paise": "Cash",

    # UPI & Mobile Wallets - Marathi, Hindi, English
    "upi": "UPI",
    "upine": "UPI",
    "यूपीआय": "UPI",
    "यूपीआयने": "UPI",
    "यूपीआय द्वारे": "UPI",
    "यूपीआयवरून": "UPI",
    "यूपीआई": "UPI",
    "यूपीआईने": "UPI",
    "युपीआय": "UPI",
    "युपीआयने": "UPI",
    "युपीआई": "UPI",
    "युपिआय": "UPI",
    "युपिआयने": "UPI",
    "युपिआई": "UPI",
    "यूपिआय": "UPI",
    "यूपिआई": "UPI",
    "यूपिआयने": "UPI",
    "यूपीआए": "UPI",
    "युपीआए": "UPI",
    "gpay": "UPI",
    "g pay": "UPI",
    "google pay": "UPI",
    "googlepay": "UPI",
    "गूगल पे": "UPI",
    "गुगल पे": "UPI",
    "गूगलपे": "UPI",
    "गुगलपे": "UPI",
    "जीपे": "UPI",
    "जी पे": "UPI",
    "जीपेने": "UPI",
    "phonepe": "UPI",
    "phone pe": "UPI",
    "फोनपे": "UPI",
    "फोन पे": "UPI",
    "फोनपेने": "UPI",
    "paytm": "UPI",
    "पेटीएम": "UPI",
    "पेटीम": "UPI",
    "पेटीएमने": "UPI",
    "bhim": "UPI",
    "भीम": "UPI",
    "cred": "UPI",
    "qr": "UPI",
    "qr code": "UPI",
    "स्कॅन": "UPI",
    "स्कैन": "UPI",
    "क्युआर": "UPI",
    "क्यूआर": "UPI",

    # Cards - Marathi, Hindi, English
    "card": "Card",
    "cards": "Card",
    "कार्ड": "Card",
    "कार्डने": "Card",
    "कार्ड से": "Card",
    "debit card": "Card",
    "credit card": "Card",
    "debit": "Card",
    "credit": "Card",
    "डेबिट": "Card",
    "क्रेडिट": "Card",
    "डेबिट कार्ड": "Card",
    "क्रेडिट कार्ड": "Card",
    "atm": "Card",
    "atm card": "Card",
    "एटीएम": "Card",
    "visa": "Card",
    "mastercard": "Card",
    "rupay": "Card",
    "swipe": "Card",
    "swiped": "Card",
    "स्वाइप": "Card",

    # Net Banking & Bank Transfer
    "net banking": "Net Banking",
    "netbanking": "Net Banking",
    "internet banking": "Net Banking",
    "नेट बँकिंग": "Net Banking",
    "नेट बैंकिंग": "Net Banking",
    "bank transfer": "Net Banking",
    "bank": "Net Banking",
    "बँक": "Net Banking",
    "बैंक": "Net Banking",
    "बँक ट्रान्सफर": "Net Banking",
    "बैंक ट्रांसफर": "Net Banking",
    "neft": "Net Banking",
    "rtgs": "Net Banking",
    "imps": "Net Banking",
    "cheque": "Net Banking",
    "चेक": "Net Banking"
}

def extract_amount(text: str) -> float | None:
    """Extracts monetary amount from text supporting commas like 20,000 or 1,00,000."""
    clean_text = normalize_devanagari_numbers(text)
    
    # 1. Number with currency symbol or prefix
    match = re.search(r'(?:₹|rs\.?|inr|रुपये|रुपया|रुपए|रू|रु|रुपीस|रुपिस)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)', clean_text, re.IGNORECASE)
    if match:
        return float(match.group(1).replace(',', ''))

    # 2. Number with currency suffix
    match = re.search(r'([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*(?:₹|rs\.?|inr|rupaye|rupae|rupee|rupees|रुपये|रुपया|रुपए|रू|रु|रुपीस|रुपिस|bucks)', clean_text, re.IGNORECASE)
    if match:
        return float(match.group(1).replace(',', ''))

    # 3. Number with commas (e.g. 20,000 or 1,50,000)
    match = re.search(r'\b([0-9]{1,3}(?:,[0-9]{2,3})+(?:\.[0-9]{1,2})?)\b', clean_text)
    if match:
        return float(match.group(1).replace(',', ''))

    # 4. Standard standalone integer or float (e.g. 250 or 1000)
    match = re.search(r'\b([0-9]+(?:\.[0-9]{1,2})?)\b', clean_text)
    if match:
        val = float(match.group(1))
        if val > 0:
            return val

    return None

def extract_payment_mode(text: str) -> str | None:
    lower = normalize_devanagari_numbers(text).lower()
    
    # 1. Check longest keys first
    for key in sorted(PAYMENT_MODE_MAP.keys(), key=len, reverse=True):
        mode = PAYMENT_MODE_MAP[key]
        # Match standalone token or surrounded by whitespace / punctuation
        pattern = rf'(?:^|[\s,.\-_]){re.escape(key)}(?:[\s,.\-_]|$)'
        if re.search(pattern, lower):
            return mode
        # Also check with common post-positions (e.g. ने, नी, द्वारे, तून, से, करून)
        token_pattern = rf'(?:^|[\s,.\-_]){re.escape(key)}(?:ने|नी|द्वारे|तून|से|करून|वाले|wala|vali|ne)?(?:[\s,.\-_]|$)'
        if re.search(token_pattern, lower):
            return mode

    return None

def extract_date(text: str) -> str:
    lower = text.lower()
    today = date.today()
    if any(w in lower for w in ["yesterday", "kal", "काल"]):
        return (today - timedelta(days=1)).isoformat()
    return today.isoformat()

def extract_merchant_and_category_english(text: str) -> tuple[str, str]:
    """
    Extracts the merchant and guarantees an ENGLISH output name for the transaction proposal.
    Even if the user spoke in Hindi or Marathi, the merchant is translated to English.
    """
    clean_text = normalize_devanagari_numbers(text).lower()
    
    # 1. Check direct phrase match in English translation dictionary (sorted longest first)
    for phrase in sorted(ENGLISH_TRANSLATION_MAP.keys(), key=len, reverse=True):
        eng_name, cat = ENGLISH_TRANSLATION_MAP[phrase]
        pattern = rf'(?:^|[\s,.\-_]){re.escape(phrase)}(?:[\s,.\-_]|$)'
        if re.search(pattern, clean_text):
            return eng_name, cat

    # 2. Extract words preserving Devanagari combining characters
    words = re.findall(r'[a-zA-Z0-9\u0900-\u097F]+', clean_text)
    
    for word in words:
        if word in ENGLISH_TRANSLATION_MAP:
            return ENGLISH_TRANSLATION_MAP[word]

    # 3. Filter out filler words, numbers, prepositions, action verbs
    skip_tokens = set(EXPENSE_KEYWORDS + INCOME_KEYWORDS + list(PAYMENT_MODE_MAP.keys()) + [
        "pe", "par", "var", "war", "sathi", "me", "mein", "ko", "se", "ne", "dware", "madhe",
        "on", "for", "at", "using", "by", "via", "rs", "rupaye", "rupae", "rupee", "rupees", "inr", "bucks",
        "today", "yesterday", "aaj", "kal", "रुपये", "रुपया", "रुपए", "रुपीस", "रुपिस", "रू", "रु",
        "दिला", "दिले", "केला", "केले", "का", "की", "के", "को", "से", "ने", "मध्ये", "मधील",
        "चा", "ची", "चे", "च्या", "transaction", "transactions", "entry", "bill", "payment",
        "ट्रांजेक्शन", "ट्रांज़ैक्शन", "ट्रांझॅक्शन", "ट्रान्झॅक्शन", "एंट्री", "बिल",
        "please", "plz", "krupaya", "कृपया", "bhai", "bro", "jar", "tar", "ani", "aur", "and"
    ])

    substantive_tokens = []
    for w in words:
        # Ignore purely digits or comma-numbers
        if not re.match(r'^[0-9,.]+$', w) and w not in skip_tokens and len(w) > 1:
            substantive_tokens.append(w)

    if substantive_tokens:
        candidate_phrase = " ".join(substantive_tokens)
        # Check if phrase in map
        if candidate_phrase in ENGLISH_TRANSLATION_MAP:
            return ENGLISH_TRANSLATION_MAP[candidate_phrase]
        
        # Check individual tokens
        for token in substantive_tokens:
            if token in ENGLISH_TRANSLATION_MAP:
                return ENGLISH_TRANSLATION_MAP[token]
        
        # If contains Devanagari, transliterate into clean English letters
        if re.search(r'[\u0900-\u097F]', candidate_phrase):
            eng_transliterated = transliterate_devanagari_to_english(candidate_phrase)
            return eng_transliterated, "Other Expense"

        return candidate_phrase.title(), "Other Expense"

    return "General Expense", "Other Expense"

def detect_transaction_type(text: str) -> str:
    lower = text.lower()
    for kw in INCOME_KEYWORDS:
        if kw in lower:
            return "income"
    return "expense"

def parse_natural_transaction(text: str, default_language: str = "en") -> dict:
    """
    Main entry point for parsing natural speech or typed expense sentences.
    Guarantees that the proposed Merchant and Category are in ENGLISH,
    even if the user spoke in Hindi or Marathi.
    """
    if not text or not text.strip():
        return {
            "is_transaction": False,
            "error": "Empty input text"
        }

    clean_text = text.strip()
    amount = extract_amount(clean_text)
    
    # Detect language heuristic
    has_devanagari = bool(re.search(r'[\u0900-\u097F]', clean_text))
    lower = clean_text.lower()
    words_set = set(re.findall(r'[a-zA-Z0-9\u0900-\u097F]+', lower))
    
    base_lang = "en" if default_language in ["auto", None, ""] else default_language
    detected_lang = base_lang
    if has_devanagari:
        # Unique Marathi markers
        if words_set.intersection({"चहा", "केला", "केले", "दिले", "दिला", "वर", "साठी", "बॅटरी", "टाक", "टाका", "नोंदवा", "नोंद", "लिहा", "करा", "दाखल", "शिल्लक", "किती", "झाला"}):
            detected_lang = "mr"
        # Unique Hindi markers
        elif words_set.intersection({"चाय", "किए", "किये", "दिए", "दिया", "पर", "पे", "जोड़ो", "जोडो", "लिखो", "डालो", "करो", "कितना", "हुआ", "बचा"}):
            detected_lang = "hi"
        else:
            detected_lang = base_lang if base_lang in ["hi", "mr"] else "hi"
    elif words_set.intersection({"chaha", "kela", "kele", "dile", "var", "sathi", "bhare", "dila", "taka", "tak", "kara", "liha", "nondva", "nond", "zala", "jhala", "kiti", "shillak"}):
        detected_lang = "mr"
    elif words_set.intersection({"kharch", "kharcha", "diye", "diya", "kiya", "kiye", "bhara", "pe", "par", "jodo", "likho", "daalo", "karo", "kitna", "hua", "bacha"}):
        detected_lang = "hi"
    else:
        detected_lang = "en"

    # Always extract an ENGLISH merchant & category for the proposal
    merchant, category = extract_merchant_and_category_english(clean_text)
    tx_type = detect_transaction_type(clean_text)
    payment_mode = extract_payment_mode(clean_text)
    payment_method_specified = payment_mode is not None
    tx_date = extract_date(clean_text)

    has_expense_word = any(k in lower for k in EXPENSE_KEYWORDS + INCOME_KEYWORDS)
    is_transaction = (amount is not None) or (merchant != "General Expense") or has_expense_word

    confidence = 0.95 if (amount is not None and merchant != "General Expense") else 0.75

    return {
        "is_transaction": is_transaction,
        "raw_text": clean_text,
        "amount": amount if amount is not None else 0.0,
        "merchant": merchant,
        "category": category,
        "type": tx_type,
        "payment_method": payment_mode,
        "payment_method_specified": payment_method_specified,
        "date": tx_date,
        "confidence": confidence,
        "language_detected": detected_lang
    }
