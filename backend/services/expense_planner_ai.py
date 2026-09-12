import datetime
from typing import Dict, List, Any, Optional

ESSENTIAL_CATEGORIES = {
    'housing', 'rent', 'mortgage', 'bills & utilities', 'utilities',
    'electricity', 'water', 'gas', 'groceries', 'food essentials',
    'healthcare', 'medicine', 'medical', 'doctor', 'pharmacy',
    'emi & loans', 'loan', 'emi', 'debt repayment', 'insurance'
}

IMPORTANT_CATEGORIES = {
    'education', 'tuition', 'books', 'transportation', 'fuel', 'petrol',
    'diesel', 'vehicle maintenance', 'car repair', 'work tools',
    'internet & mobile', 'wifi', 'broadband'
}

DISCRETIONARY_CATEGORIES = {
    'food & dining', 'dining out', 'restaurants', 'swiggy', 'zomato',
    'cafe', 'shopping', 'clothing', 'apparel', 'personal care',
    'fitness', 'gym', 'salon'
}

LUXURY_POSTPONABLE_CATEGORIES = {
    'entertainment', 'streaming', 'netflix', 'movies', 'cinema',
    'gaming', 'travel', 'vacation', 'resort', 'holiday', 'luxury',
    'electronics upgrade', 'gadgets', 'gifts & celebrations', 'party'
}

URGENT_KEYWORDS = [
    'urgent', 'immediate', 'penalty', 'late fee', 'due date', 'critical',
    'mandatory', 'hospital', 'doctor', 'prescription', 'disconnection',
    'landlord', 'emi', 'insurance renewal', 'exam fees'
]

FLEXIBLE_KEYWORDS = [
    'can wait', 'flexible', 'wishlist', 'upgrade', 'later', 'if possible',
    'optional', 'gift', 'celebration', 'party', 'new model', 'sale'
]


def _normalize_category(cat_name: str) -> str:
    if not cat_name:
        return 'other'
    return cat_name.lower().strip()


def _calculate_days_until_deadline(deadline_str: Optional[str]) -> Optional[int]:
    if not deadline_str:
        return None
    try:
        clean_date = deadline_str.split('T')[0]
        deadline_date = datetime.date.fromisoformat(clean_date)
        today = datetime.date.today()
        delta = (deadline_date - today).days
        return delta
    except Exception:
        return None


def _get_historical_category_avg(category: str, past_expenses: List[Dict[str, Any]]) -> Optional[float]:
    if not past_expenses:
        return None
    cat_norm = _normalize_category(category)
    matched_amounts = []
    for exp in past_expenses:
        exp_cat = _normalize_category(exp.get('category') or exp.get('category_name') or '')
        if cat_norm in exp_cat or exp_cat in cat_norm:
            amt = float(exp.get('amount') or 0)
            if amt > 0:
                matched_amounts.append(amt)
    if matched_amounts:
        return sum(matched_amounts) / len(matched_amounts)
    return None


def analyze_expense_item(
    item: Dict[str, Any],
    available_budget: float,
    past_expenses: List[Dict[str, Any]],
    language: str = 'en'
) -> Dict[str, Any]:
    """
    Evaluates an individual expense across necessity, urgency, financial impact,
    and postponability to assign an intelligent priority tier.
    """
    name = (item.get('name') or item.get('title') or 'Expense').strip()
    amount = float(item.get('amount') or 0)
    category = item.get('category') or 'General'
    deadline = item.get('deadline')
    notes = (item.get('notes') or '').lower()
    is_recurring = bool(item.get('is_recurring', False))

    cat_norm = _normalize_category(category)
    name_lower = name.lower()

    # 1. Necessity Score (0 - 100)
    necessity_score = 45.0
    if any(ec in cat_norm or ec in name_lower for ec in ESSENTIAL_CATEGORIES):
        necessity_score = 90.0
    elif any(ic in cat_norm or ic in name_lower for ic in IMPORTANT_CATEGORIES):
        necessity_score = 70.0
    elif any(dc in cat_norm or dc in name_lower for dc in DISCRETIONARY_CATEGORIES):
        necessity_score = 40.0
    elif any(lc in cat_norm or lc in name_lower for lc in LUXURY_POSTPONABLE_CATEGORIES):
        necessity_score = 20.0

    if is_recurring and necessity_score >= 60:
        necessity_score = min(100.0, necessity_score + 10)

    # Contextual keywords in notes or title
    if any(k in notes or k in name_lower for k in URGENT_KEYWORDS):
        necessity_score = min(100.0, necessity_score + 15)
    if any(k in notes or k in name_lower for k in FLEXIBLE_KEYWORDS):
        necessity_score = max(10.0, necessity_score - 20)

    # 2. Urgency Score (0 - 100)
    days_left = _calculate_days_until_deadline(deadline)
    urgency_score = 50.0
    if days_left is not None:
        if days_left <= 0:
            urgency_score = 100.0
        elif days_left <= 3:
            urgency_score = 95.0
        elif days_left <= 7:
            urgency_score = 80.0
        elif days_left <= 15:
            urgency_score = 65.0
        elif days_left <= 30:
            urgency_score = 45.0
        else:
            urgency_score = 25.0
    else:
        urgency_score = 30.0 if necessity_score < 70 else 60.0

    # 3. Financial Impact
    budget_share_pct = round((amount / available_budget * 100) if available_budget > 0 else 0, 1)
    hist_avg = _get_historical_category_avg(category, past_expenses)
    is_higher_than_usual = False
    hist_ratio = 1.0
    if hist_avg and hist_avg > 0:
        hist_ratio = round(amount / hist_avg, 2)
        if hist_ratio >= 1.5:
            is_higher_than_usual = True

    # 4. Postponability Score (0 - 100)
    postponability_score = 100.0 - ((necessity_score * 0.6) + (urgency_score * 0.4))
    postponability_score = max(0.0, min(100.0, postponability_score))

    # 5. Intelligent 5-Tier Classification
    priority_tier = 'Important'
    recommended_amount = amount
    potential_savings = 0.0
    action_type = 'pay_now'
    target_deferral_month = None

    has_postpone_intent = any(k in notes or k in name_lower for k in ['can wait', 'later', 'postpone', 'next month', 'diwali', 'sale', 'flexible'])
    is_postponable_category = any(lc in cat_norm or lc in name_lower for lc in LUXURY_POSTPONABLE_CATEGORIES)

    if necessity_score >= 80 or (necessity_score >= 65 and urgency_score >= 80):
        # 1. Essential obligations
        priority_tier = 'Must Do'
        action_type = 'pay_now'
        recommended_amount = amount
        potential_savings = 0.0

    elif has_postpone_intent or (is_postponable_category and postponability_score >= 50 and budget_share_pct <= 60):
        # 2. Legitimate planned items that can safely be postponed
        priority_tier = 'Can Delay'
        action_type = 'postpone'
        recommended_amount = 0.0
        potential_savings = amount
        next_month = datetime.date.today() + datetime.timedelta(days=32)
        target_deferral_month = next_month.strftime('%B %Y')

    elif any(dc in cat_norm or dc in name_lower for dc in DISCRETIONARY_CATEGORIES) or is_higher_than_usual:
        # 3. Discretionary spending that can be trimmed
        priority_tier = 'Reduce'
        action_type = 'reduce'
        trim_ratio = 0.40 if is_higher_than_usual else 0.30
        potential_savings = round(amount * trim_ratio, 2)
        recommended_amount = round(amount - potential_savings, 2)

    elif necessity_score <= 25 and (budget_share_pct > 25 or available_budget < amount):
        # 4. Impulsive or excessive luxury that threatens financial stability
        priority_tier = 'Avoid'
        action_type = 'avoid'
        recommended_amount = 0.0
        potential_savings = amount

    else:
        # 5. Important high-utility items
        priority_tier = 'Important'
        action_type = 'schedule'
        recommended_amount = amount
        potential_savings = 0.0

    # 6. Contextual Localized Rationale
    reason = _generate_rationale(
        name=name,
        amount=amount,
        category=category,
        tier=priority_tier,
        days_left=days_left,
        budget_share_pct=budget_share_pct,
        is_higher_than_usual=is_higher_than_usual,
        hist_avg=hist_avg,
        recommended_amount=recommended_amount,
        potential_savings=potential_savings,
        language=language
    )

    return {
        'id': item.get('id'),
        'name': name,
        'amount': amount,
        'category': category,
        'deadline': deadline,
        'days_left': days_left,
        'notes': item.get('notes', ''),
        'priority_tier': priority_tier,
        'action_type': action_type,
        'necessity_score': round(necessity_score),
        'urgency_score': round(urgency_score),
        'postponability_score': round(postponability_score),
        'budget_share_pct': budget_share_pct,
        'recommended_amount': recommended_amount,
        'potential_savings': potential_savings,
        'target_deferral_month': target_deferral_month,
        'reason': reason
    }


def _generate_rationale(
    name: str,
    amount: float,
    category: str,
    tier: str,
    days_left: Optional[int],
    budget_share_pct: float,
    is_higher_than_usual: bool,
    hist_avg: Optional[float],
    recommended_amount: float,
    potential_savings: float,
    language: str
) -> str:
    """Generates transparent, personalized rationale for each priority tier."""
    deadline_text_en = f"with deadline in {days_left} days" if (days_left is not None and days_left >= 0) else "no immediate penalty deadline"
    deadline_text_hi = f"{days_left} दिनों में देय" if (days_left is not None and days_left >= 0) else "कोई सख्त अंतिम तिथि नहीं"
    deadline_text_mr = f"{days_left} दिवसांत देय" if (days_left is not None and days_left >= 0) else "कोणतीही तात्काळ देय मुदत नाही"

    if language == 'hi':
        if tier == 'Must Do':
            return f"यह एक अनिवार्य आवश्यकता ({category}) है ({deadline_text_hi})। किसी भी दंड या सेवा रुकावट से बचने के लिए इसे प्राथमिकता से पूरा भुगतान करें।"
        elif tier == 'Important':
            return f"यह महत्वपूर्ण व्यय है जो उत्पादकता या स्वास्थ्य का समर्थन करता है। आवश्यक खर्चों के बाद इसे बजट में शामिल करें।"
        elif tier == 'Reduce':
            if is_higher_than_usual and hist_avg:
                return f"यह राशि आपके सामान्य औसत (₹{round(hist_avg):,}) से अधिक है। इसे घटाकर ₹{round(recommended_amount):,} करने से ₹{round(potential_savings):,} की सीधी बचत होगी।"
            return f"यह विवेकाधीन व्यय है। इसमें थोड़ा संयम बरतकर ₹{round(recommended_amount):,} तक सीमित करें और ₹{round(potential_savings):,} बचाएं।"
        elif tier == 'Can Delay':
            return f"यह एक वैध योजना है, लेकिन इसे अगले महीने तक सुरक्षित रूप से टाला जा सकता है जिससे वर्तमान मासिक बजट सुरक्षित रहेगा।"
        else:
            return f"यह आपके कुल बजट का {budget_share_pct}% हिस्सा ले रहा है और आपातकालीन सुरक्षा बफर को प्रभावित कर सकता है। इसे अभी छोड़ना वित्तीय रूप से बुद्धिमानी है।"

    elif language == 'mr':
        if tier == 'Must Do':
            return f"हा एक अत्यावश्यक खर्च ({category}) आहे ({deadline_text_mr})। कोणताही दंड किंवा सेवा खंड टाळण्यासाठी याला प्रथम प्राधान्य देऊन पूर्ण भरा."
        elif tier == 'Important':
            return f"हा महत्त्वाचा खर्च असून उत्पादकता व आरोग्यासाठी उपयुक्त आहे. अत्यावश्यक देयकांनंतर याला बजेटमध्ये समाविष्ट करा."
        elif tier == 'Reduce':
            if is_higher_than_usual and hist_avg:
                return f"हा खर्च आपल्या नेहमीच्या सरासरीपेक्षा (₹{round(hist_avg):,}) जास्त आहे. हा ₹{round(recommended_amount):,} पर्यंत मर्यादित केल्यास ₹{round(potential_savings):,} निव्वळ बचत होईल."
            return f"हा ऐच्छिक खर्च आहे. यात सुसूत्रता आणून ₹{round(recommended_amount):,} पर्यंत खर्च करा आणि ₹{round(potential_savings):,} वाचवा."
        elif tier == 'Can Delay':
            return f"हा खर्च योग्य असला तरी कोणतीही अडचण न येता पुढील महिन्यापर्यंत पुढे ढकलता येऊ शकतो, ज्यामुळे चालू रोख प्रवाह सुरक्षित राहील."
        else:
            return f"हा खर्च आपल्या एकूण बजेटचा {budget_share_pct}% हिस्सा घेतो आणि आणीबाणीच्या शिल्लकीला धोका निर्माण करू शकतो. हा टाळणे हिताचे ठरेल."

    else:
        if tier == 'Must Do':
            return f"Essential baseline obligation ({category}) {deadline_text_en}. Pay in full first to avoid disruption, interest, or penalties."
        elif tier == 'Important':
            return f"High-utility investment for productivity, wellness, or maintenance. Fund immediately after baseline essentials."
        elif tier == 'Reduce':
            if is_higher_than_usual and hist_avg:
                return f"This planned expense is {round(amount/hist_avg, 1)}× higher than your category baseline (₹{round(hist_avg):,}). Trimming to ₹{round(recommended_amount):,} unlocks ₹{round(potential_savings):,} in savings."
            return f"Flexible discretionary category. Optimize by capping at ₹{round(recommended_amount):,} to save ₹{round(potential_savings):,} without sacrificing core satisfaction."
        elif tier == 'Can Delay':
            return f"Legitimate purchase that can be safely postponed by 30–60 days with zero penalty, protecting your immediate cash cushion."
        else:
            return f"Non-essential expense consuming {budget_share_pct}% of your available monthly budget. Eliminating this preserves your emergency buffer."


def optimize_expense_plan(
    available_budget: float,
    planned_expenses: List[Dict[str, Any]],
    financial_history: Optional[Dict[str, Any]] = None,
    language: str = 'en'
) -> Dict[str, Any]:
    """
    Analyzes and optimizes the entire monthly spending plan:
    - Prioritizes essentials first
    - Calculates recommended emergency buffer
    - Fits expenses into available budget
    - Categorizes into actionable lists: what to pay now, what to reduce, what to postpone, what to avoid
    - Computes exact remaining surplus or deficit
    """
    history = financial_history or {}
    past_expenses = history.get('past_expenses') or []
    monthly_income = float(history.get('monthly_income') or available_budget)

    # 1. Analyze every single item individually
    analyzed_items = []
    for item in planned_expenses:
        if not item or not isinstance(item, dict):
            continue
        analyzed_items.append(
            analyze_expense_item(item, available_budget, past_expenses, language)
        )

    # 2. Compute Recommended Emergency Buffer
    buffer_pct = 0.10
    if monthly_income > 0 and available_budget > 0:
        recommended_emergency_buffer = round(min(available_budget * 0.15, max(1000.0, available_budget * buffer_pct)), 2)
    else:
        recommended_emergency_buffer = round(available_budget * 0.08, 2)

    total_planned = sum(item['amount'] for item in analyzed_items)

    # 3. Budget Allocation & Optimization Order:
    must_do_items = [i for i in analyzed_items if i['priority_tier'] == 'Must Do']
    important_items = [i for i in analyzed_items if i['priority_tier'] == 'Important']
    reduce_items = [i for i in analyzed_items if i['priority_tier'] == 'Reduce']
    can_delay_items = [i for i in analyzed_items if i['priority_tier'] == 'Can Delay']
    avoid_items = [i for i in analyzed_items if i['priority_tier'] == 'Avoid']

    must_do_items.sort(key=lambda x: (x['days_left'] if x['days_left'] is not None else 999))

    allocated_spend = 0.0
    what_to_pay_now = []
    what_to_reduce = []
    what_to_postpone = []
    what_to_avoid = []

    # A. Must Do items (always funded first)
    for item in must_do_items:
        allocated_spend += item['amount']
        what_to_pay_now.append(item)

    deficit_flag = allocated_spend > available_budget

    # B. Important items
    for item in important_items:
        if (allocated_spend + item['amount'] + recommended_emergency_buffer) <= available_budget or not deficit_flag:
            allocated_spend += item['amount']
            what_to_pay_now.append(item)
        else:
            modified_item = dict(item)
            modified_item['action_type'] = 'postpone'
            modified_item['target_deferral_month'] = (datetime.date.today() + datetime.timedelta(days=32)).strftime('%B %Y')
            what_to_postpone.append(modified_item)

    # C. Reduce items
    for item in reduce_items:
        rec_amt = item['recommended_amount']
        allocated_spend += rec_amt
        what_to_reduce.append(item)

    # D. Can Delay items
    for item in can_delay_items:
        what_to_postpone.append(item)

    # E. Avoid items
    for item in avoid_items:
        what_to_avoid.append(item)

    total_optimized_spend = round(allocated_spend, 2)
    total_savings = round(max(0.0, total_planned - total_optimized_spend), 2)
    
    remaining_money = round(available_budget - total_optimized_spend - recommended_emergency_buffer, 2)

    if remaining_money >= 0:
        budget_status = 'surplus'
    elif (available_budget - total_optimized_spend) >= 0:
        budget_status = 'tight_buffer_absorbed'
        remaining_money = 0.0
    else:
        budget_status = 'deficit'

    tier_counts = {
        'Must Do': len(must_do_items),
        'Important': len(important_items),
        'Can Delay': len(can_delay_items),
        'Reduce': len(reduce_items),
        'Avoid': len(avoid_items)
    }

    tier_totals = {
        'Must Do': round(sum(i['amount'] for i in must_do_items), 2),
        'Important': round(sum(i['amount'] for i in important_items), 2),
        'Can Delay': round(sum(i['amount'] for i in can_delay_items), 2),
        'Reduce': round(sum(i['amount'] for i in reduce_items), 2),
        'Avoid': round(sum(i['amount'] for i in avoid_items), 2)
    }

    executive_summary = _generate_executive_summary(
        available_budget=available_budget,
        total_planned=total_planned,
        total_optimized_spend=total_optimized_spend,
        total_savings=total_savings,
        remaining_money=remaining_money,
        emergency_buffer=recommended_emergency_buffer,
        status=budget_status,
        language=language
    )

    return {
        'available_budget': available_budget,
        'total_planned_expenses': round(total_planned, 2),
        'optimized_spending_plan': total_optimized_spend,
        'total_potential_savings': total_savings,
        'recommended_emergency_buffer': recommended_emergency_buffer,
        'remaining_surplus': remaining_money,
        'budget_status': budget_status,
        'tier_counts': tier_counts,
        'tier_totals': tier_totals,
        'executive_summary': executive_summary,
        'all_analyzed_expenses': analyzed_items,
        'action_plan': {
            'what_to_pay_now': what_to_pay_now,
            'what_to_reduce': what_to_reduce,
            'what_to_postpone': what_to_postpone,
            'what_to_avoid': what_to_avoid
        }
    }


def _generate_executive_summary(
    available_budget: float,
    total_planned: float,
    total_optimized_spend: float,
    total_savings: float,
    remaining_money: float,
    emergency_buffer: float,
    status: str,
    language: str
) -> str:
    """Generates an executive-level personalized assessment of the plan."""
    if language == 'hi':
        if status == 'surplus':
            return f"आपकी योजना सफलतापूर्वक अनुकूलित की गई है। ₹{round(total_savings):,} की बचत करके और ₹{round(emergency_buffer):,} का आपातकालीन बफर सुरक्षित रखने के बाद भी आपके पास ₹{round(remaining_money):,} अतिरिक्त अधिशेष रहेगा।"
        elif status == 'deficit':
            return f"चेतावनी: नियोजित आवश्यक खर्च आपके कुल बजट से अधिक हैं। घाटे से बचने के लिए सुझाई गई कटौती तुरंत लागू करें।"
        else:
            return f"आपका बजट संतुलित है। योजना में ₹{round(total_savings):,} की बचत शामिल है और मासिक प्रतिबद्धताएं सुरक्षित रूप से पूरी हो जाएंगी।"
    elif language == 'mr':
        if status == 'surplus':
            return f"आपले मासिक नियोजन यशस्वीरीत्या अनुकूलित झाले आहे. ₹{round(total_savings):,} बचत साध्य करून व ₹{round(emergency_buffer):,} आणीबाणी निधी राखूनही आपल्याकडे ₹{round(remaining_money):,} अतिरिक्त शिल्लक राहील."
        elif status == 'deficit':
            return f"सावधान: आपले नियोजित अत्यावश्यक खर्च उपलब्ध बजेटपेक्षा अधिक आहेत. तूट टाळण्यासाठी सुचवलेली कपात त्वरित लागू करा."
        else:
            return f"आपले बजेट संतुलित आहे. नियोजनातून ₹{round(total_savings):,} ची बचत होईल आणि सर्व महत्त्वाची देयके सुरळीत पार पडतील."
    else:
        if status == 'surplus':
            return f"Plan successfully optimized. By trimming discretionary items and postponing non-urgents, you save ₹{round(total_savings):,}, preserve a ₹{round(emergency_buffer):,} emergency buffer, and retain ₹{round(remaining_money):,} in free surplus."
        elif status == 'deficit':
            return f"Action Required: High-priority obligations exceed available funds. Apply recommended cuts immediately to avoid a budget deficit."
        else:
            return f"Budget balanced tightly. Planned optimizations free ₹{round(total_savings):,} in cash, keeping critical obligations on schedule."
