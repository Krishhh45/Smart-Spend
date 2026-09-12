# SmartSpend — Technical Architecture

## 1. Stack

**Frontend:** React, Tailwind CSS, Recharts, Axios, React Router  
**Backend:** Python, Flask, REST API  
**Database:** Supabase + PostgreSQL + RLS  
**AI/ML:** Pandas, NumPy, Scikit-learn, LLM API  
**Dev:** Git/GitHub, `.env`, testing

---

## 2. Architecture

```text
User
 ↓
React + Tailwind + Recharts
 ↓ HTTPS/REST
Flask API
 ├── Auth
 ├── Business Logic
 ├── Analytics
 ├── Reports
 └── AI/ML
 ↓
Supabase PostgreSQL
 ↓
Users / Accounts / Transactions / Budgets /
Goals / Recurring / Notifications / Predictions /
AI Insights / Audit Logs
```

**Core flow:**

```text
React → Flask → Supabase → AI/ML → Flask → React
```

---

## 3. Project Structure

```text
SmartSpend/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   ├── ai/
│   ├── utils/
│   └── tests/
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
│
├── docs/
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Website

```text
/
├── /login
├── /register
└── /app
    ├── /dashboard
    ├── /transactions
    ├── /transactions/add
    ├── /analytics
    ├── /budget
    ├── /predictions
    ├── /assistant
    ├── /calendar
    ├── /accounts
    ├── /reports
    ├── /profile
    └── /settings
```

### Navigation

Dashboard | Transactions | Add Transaction | Analytics | Budget | Predictions | AI Assistant | Calendar | Accounts | Reports | Profile | Settings

### User Flow

```text
Landing → Login/Register → Dashboard → Account
→ Transactions → Analytics → Budget → AI Insights
→ Predictions → Reports/Assistant
```

---

# 5. Authentication

```text
Login
 ↓
Auth API
 ↓
Verify credentials/session
 ↓
Authenticated user
 ↓
Protected APIs
```

- Use Supabase Auth or secure custom authentication.
- Never store plaintext passwords.
- Derive user identity from verified authentication.
- Protect every financial API.

---

# 6. Transaction Engine

```text
Add Transaction
 ↓
Validate
 ↓
Authenticate
 ↓
Check account ownership
 ↓
Category
 ↓
Save to PostgreSQL
 ↓
Budget Check
 ↓
Recurring Check
 ↓
Anomaly Check
 ↓
Analytics/Insights
 ↓
Notification
 ↓
Return result
```

This is the core SmartSpend workflow.

---

# 7. Database

### Main Tables

```text
users
accounts
categories
transactions
budgets
recurring_expenses
financial_goals
notifications
ai_insights
predictions
audit_logs
```

### Relationships

```text
User
├── Accounts
├── Transactions → Categories
├── Budgets
├── Goals
├── Recurring Expenses
├── Notifications
├── Predictions
├── AI Insights
└── Audit Logs
```

### Core Fields

**users:** `id, name, email, password_hash, created_at, updated_at`  
**accounts:** `id, user_id, name, type, institution, balance`  
**categories:** `id, user_id, name, type`  
**transactions:** `id, user_id, account_id, category_id, amount, type, description, date`  
**budgets:** `id, user_id, category_id, limit, period, start_date, end_date`  
**recurring:** `id, user_id, merchant, amount, frequency, next_date, confidence, active`  
**goals:** `id, user_id, name, target, current, target_date`  
**notifications:** `id, user_id, title, message, type, is_read, created_at`  
**ai_insights:** `id, user_id, type, title, explanation, confidence, created_at`  
**predictions:** `id, user_id, type, amount, period, model_version, created_at`  
**audit_logs:** `id, user_id, action, entity_type, entity_id, created_at`

Use UUIDs, foreign keys, constraints, indexes, and RLS.

---

# 8. API

Use `/api/v1/`.

```text
/auth
/users
/accounts
/transactions
/categories
/dashboard
/analytics
/budgets
/recurring
/predictions
/insights
/assistant
/reports
/notifications
```

### Main Methods

```text
GET    → Read
POST   → Create
PUT    → Update
DELETE → Delete
```

Every API documents:

```text
Endpoint | Method | Auth | Request | Validation | Response | Errors
```

### Response

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid data"
  }
}
```

---

# 9. AI/ML

```text
Transactions
 ↓
Preprocessing
 ↓
Feature Extraction
 ↓
ML/AI
 ↓
Result
 ↓
Database
 ↓
API
 ↓
UI
```

### Modules

**Categorization**

```text
Description → Classifier → Category + Confidence
```

Low confidence → ask user to confirm.

**Anomaly Detection**

```text
Historical Spending → Features → Model → Score → Alert
```

Possible: Isolation Forest / statistical methods.

**Prediction**

```text
History → Features → Model → Estimated Future Expense
```

Show predictions as estimates, not guarantees.

**Pattern Analysis**

- Category trends
- Monthly changes
- Frequency
- Income vs expense
- Recurring payments
- Budget usage

---

# 10. AI Assistant

```text
Question
 ↓
Flask
 ↓
Identify required data
 ↓
Query user's allowed data
 ↓
Structured context
 ↓
LLM
 ↓
Answer
```

Do not send the entire database to the LLM.

---

# 11. What-If Simulator

Example:

```text
Shopping = ₹5,000
Reduce = 20%
New = ₹4,000
Monthly saving = ₹1,000
Annual potential = ₹12,000
```

```text
Input → Validate → Fetch Data → Calculate → Result → Optional AI Explanation
```

---

# 12. Budget Engine

```text
Budget = ₹5,000
Spent = ₹3,700
Remaining = ₹1,300
Usage = 74%
```

Suggested:

```text
0–69%   Normal
70–89%  Warning
90–99%  Critical
100%+   Exceeded
```

Threshold crossed → notification.

---

# 13. Recurring & Subscription Detection

Detect using:

- Merchant similarity
- Similar amount
- Repeated interval
- Frequency

Example:

```text
Netflix ₹649 every month
→ Recurring expense
→ Next expected date
→ Notification
```

Subscription detector:

```text
Monthly subscriptions → Sum → Annual cost
```

---

# 14. Financial Health Score

Use a transparent rule-based score:

```text
Savings Rate
Budget Adherence
Expense Growth
Income vs Expense
Recurring Expense Burden
        ↓
     Score /100
```

Document the exact formula and keep it consistent.

---

# 15. Analytics

Backend calculates aggregates.

```text
GET /api/v1/analytics/monthly
```

```json
{
  "income": 50000,
  "expense": 32000,
  "savings": 18000,
  "savings_rate": 36,
  "categories": {
    "Food": 5000,
    "Shopping": 8000,
    "Transport": 3000
  }
}
```

React/Recharts displays the data.

---

# 16. Notifications

Triggers:

```text
Budget > 90%
Budget exceeded
Unusual spending
Upcoming recurring payment
Rapid spending increase
Prediction warning
New AI insight
```

```text
Event → Rule → Notification Service → DB → UI
```

---

# 17. Security

- HTTPS
- Authentication
- Authorization
- RLS
- Input validation
- Parameterized/database-safe queries
- Secure CORS
- Rate limiting
- Password hashing
- Protected APIs
- Environment variables
- No secrets in frontend
- No raw errors to users
- No unnecessary financial data sent to AI

### User Isolation

```text
User A → A's data only
User B → B's data only
A ──X──→ B
```

---

# 18. Environment

```text
.env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
LLM_API_KEY=
```

Never commit `.env`. Never expose service-role/API secrets to frontend.

---

# 19. Error Handling

Handle:

```text
Database failure
Invalid transaction
AI failure
Prediction failure
Network failure
401 Unauthorized
403 Forbidden
Invalid login
```

Show friendly messages; log technical details internally.

---

# 20. Logging & Audit

Log:

- API errors
- Auth events
- DB failures
- AI failures
- Important system events

Audit:

```text
Login
Logout
Create/Update/Delete transaction
Account changes
Budget changes
```

Never log passwords, tokens, API keys, or unnecessary financial data.

---

# 21. Testing

### Unit
Functions and calculations.

### API
All endpoints and validation.

### Integration

```text
React → Flask → Supabase
```

### Functional
Every SRS requirement.

### UI
Pages, forms, charts, responsive states.

### Security
Auth, authorization, cross-user access, injection, secret exposure.

### AI
Categorization accuracy, prediction error, anomaly quality, recommendation quality.

---

# 22. Performance & Scalability

- Pagination
- Database indexes
- Efficient aggregation
- Avoid loading all transactions into browser
- Caching where useful
- Background jobs for expensive AI tasks
- Scalable backend/database
- Separate ML services later if required

---

# 23. Reports & Calendar

### Reports

```text
Monthly Expense
Income
Category
Budget
Account
Recurring Expense
```

```text
Request → Flask → DB → Generate → PDF/CSV/JSON
```

### Financial Calendar

Shows:

```text
Recurring payments
Budget dates
Goals
Upcoming commitments
```

---

# 24. Backup & Recovery

- Regular database backups
- Recovery procedure
- Migrations
- Error logging
- Restoration testing

---

# 25. Integration Specification

```text
Member 1: Requirement
        ↓
Member 2: Feature/AI
        ↓
Member 3: UI
        ↓
Member 4: API + Backend + DB
        ↓
Working Feature
```

### Example: Prediction

```text
Requirement
 ↓
Prediction Feature
 ↓
/predictions UI
 ↓
GET /api/v1/predictions
 ↓
Prediction Service
 ↓
PostgreSQL
 ↓
ML Model
 ↓
predictions table
 ↓
API
 ↓
React
```

### Example: Anomaly

```text
Transaction → DB → Anomaly Engine → Insight → Notification → Dashboard
```

### Example: Budget

```text
Transaction → Budget Service → Usage → Threshold → Notification → Dashboard
```

---

# 26. Feature → Technology

| Feature | Frontend | Backend | DB | AI |
|---|---|---|---|---|
| Auth | React | Flask/Auth | Supabase | — |
| Transactions | React | Flask | PostgreSQL | Optional |
| Categories | React | Flask | PostgreSQL | ML |
| Accounts | React | Flask | PostgreSQL | — |
| Dashboard | Recharts | Flask | PostgreSQL | Optional |
| Analytics | Recharts | Flask | PostgreSQL | Optional |
| Budget | React | Flask | PostgreSQL | — |
| Recurring | React | Flask | PostgreSQL | ML/Rules |
| Anomaly | React | Flask | PostgreSQL | ML |
| Prediction | React | Flask | PostgreSQL | ML |
| Assistant | React | Flask | PostgreSQL | LLM |
| What-If | React | Flask | PostgreSQL | Optional |
| Health Score | React | Flask | PostgreSQL | Rules |
| Notifications | React | Flask | PostgreSQL | Optional |
| Reports | React | Flask | PostgreSQL | — |

---

# 27. Development Order

```text
Setup
 ↓
Supabase DB
 ↓
Authentication
 ↓
Accounts + Categories
 ↓
Transaction CRUD
 ↓
Dashboard
 ↓
Analytics
 ↓
Budget
 ↓
Recurring Detection
 ↓
Notifications
 ↓
AI Categorization
 ↓
Anomaly Detection
 ↓
Prediction
 ↓
Health Score
 ↓
What-If
 ↓
AI Assistant
 ↓
Reports
 ↓
Testing
 ↓
Security Review
 ↓
Deployment
```

---

# 28. MVP

```text
✓ Auth
✓ Profile
✓ Accounts
✓ Categories
✓ Transactions CRUD
✓ Search/Filter
✓ Dashboard
✓ Analytics
✓ Budget
✓ Alerts
✓ Reports
```

### Advanced

```text
✓ AI Categorization
✓ Anomaly Detection
✓ Prediction
✓ Recurring Detection
✓ Subscription Detector
✓ Health Score
✓ What-If
✓ AI Assistant
✓ Smart Recommendations
```

---

# 29. Development Rules

1. Don't remove functionality without approval.
2. Don't unnecessarily change approved UI.
3. Features must be functional, not mockups.
4. Don't hardcode financial data.
5. Store user financial data in DB.
6. Frontend → Backend APIs.
7. Validate all backend input.
8. Users access only their own data.
9. Never store plaintext passwords.
10. Never expose secrets/API keys in frontend.
11. AI must fail gracefully.
12. Financial calculations must be consistent.
13. Use modular, maintainable code.
14. Avoid duplication.
15. Regression-test existing features.
16. Never fake success after failure.
17. Handle loading/empty/success/error states.
18. Give feedback for important actions.
19. Maintain responsiveness.
20. Feature complete = frontend + backend + DB working.
21. Use API versioning.
22. Never commit secrets.
23. Hide raw technical errors.
24. Use DB constraints + backend validation.
25. Show AI predictions as estimates.
26. Minimize data sent to external AI.
27. Use migrations for schema changes.
28. Document breaking API changes.
29. Separate dev/test/prod configuration.
30. Test every major feature.

---

# 30. Definition of Done

```text
Requirement
 ↓
Feature
 ↓
UI
 ↓
Frontend
 ↓
API
 ↓
Backend
 ↓
Database
 ↓
Validation
 ↓
Security
 ↓
Loading/Empty/Error states
 ↓
Tests
 ↓
End-to-End Working
```

**A feature is complete only when all required frontend, backend, database, and AI/ML components work together.**

---

# 31. Final Responsibility

```text
Member 1 → WHAT & WHY
Member 2 → INNOVATION & AI
Member 3 → UI & UX
Member 4 → BACKEND + DB + API + SECURITY
             + AI INTEGRATION + TESTING
             + DEPLOYMENT + DEVELOPMENT RULES
```
