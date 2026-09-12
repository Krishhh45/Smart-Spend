# 💰 SmartSpend (Vexora) — Intelligent Personal Finance & Budget Planner

> **Modern, Multilingual & Proactive Personal Financial Management Web Application**

SmartSpend is a full-stack personal finance and budget management application designed to help users **track expenses, manage budgets, forecast spending, detect financial risks, and make smarter financial decisions**.

It supports **English, Hindi, and Marathi** for natural-language expense logging and provides intelligent insights through forecasting, budget monitoring, analytics, and AI-assisted planning.

---

## 🌟 Key Highlights & Features

### 🎙️ 1. Multilingual Voice & Natural Language Expense Logging

* Speak or type natural sentences in **English, हिंदी (Hindi), or मराठी (Marathi)**.
* Example inputs:

  * `150 रुपए कांदा`
  * `200 chaha cash add kar`
  * `500 petrol UPI`
* Automatically identifies:

  * Expense amount
  * Merchant/item
  * Category
  * Payment method
* Supports multilingual merchant/item recognition.

#### Example Translation

| Input          | Standardized Item |
| -------------- | ----------------- |
| कांदा / Kanda  | Onion             |
| बटाटा / Batata | Potato            |
| दूध / Doodh    | Milk              |

#### Payment Mode Detection

Supports common payment terms such as:

* Cash / रोख / नकद
* UPI
* GPay
* PhonePe
* Card
* Net Banking

If the payment method cannot be identified, the AI companion can prompt the user to select one.

---

### 🔮 2. Dynamic Forecasting & Expense Predictions

SmartSpend analyzes spending behavior to estimate future financial positions.

#### Month-End Burn Rate

The system estimates the projected monthly expense using:

```text
Projected Total =
Current Total +
(Current Total / Days Elapsed × Days Remaining)
```

The prediction helps users identify potential budget overruns before the month ends.

#### Additional Forecasting

* Next-month expense prediction
* Quarterly outflow estimation
* Historical spending analysis
* Spending velocity tracking
* What-if financial simulations

#### What-If Simulator

Users can simulate scenarios such as:

* Reducing discretionary spending by 20%
* Cancelling unused subscriptions
* Reducing entertainment expenses
* Increasing savings targets

These simulations do not modify actual financial records.

---

### 🚨 3. Real-Time Budget Overrun Alerts

SmartSpend continuously monitors category-level spending.

Budget status is classified as:

| Spending Level | Status      |
| -------------- | ----------- |
| Below 70%      | 🟢 Normal   |
| 70–89%         | 🟡 Warning  |
| 90–99%         | 🟠 Critical |
| 100%+          | 🔴 Exceeded |

When a category reaches or exceeds its budget limit, the system can display a **real-time floating notification with an audio alert**.

---

### 🎯 4. Smart Priority-Based Expense Planner

Planned expenses are classified into five priority tiers.

| Tier   | Priority      | Example                          |
| ------ | ------------- | -------------------------------- |
| Tier 1 | **Must Do**   | Rent, medical bills, essentials  |
| Tier 2 | **Important** | Groceries, utility bills         |
| Tier 3 | **Can Delay** | Non-urgent electronics, upgrades |
| Tier 4 | **Reduce**    | Dining out, entertainment        |
| Tier 5 | **Avoid**     | High-strain impulse expenses     |

The planner helps users prioritize essential commitments while maintaining an emergency reserve.

---

### 📊 5. Financial Health & Analytics

SmartSpend calculates a transparent **Financial Health Score from 0–100**.

The score considers:

| Factor             | Weight |
| ------------------ | -----: |
| Savings Rate       |    30% |
| Budget Adherence   |    25% |
| Spending Stability |    20% |
| Recurring Burden   |    15% |
| Goal Progress      |    10% |

### Interactive Analytics

The application provides:

* Cash-flow timelines
* Category-wise spending breakdown
* Donut charts
* Spending trends
* Spending heatmaps
* Budget utilization
* Financial health indicators
* Anomaly detection

Visualizations are powered by **Recharts**.

---

### 🌐 6. Multilingual UI & Theme System

SmartSpend provides a modern interface with:

* 🇬🇧 English
* 🇮🇳 हिंदी
* 🇮🇳 मराठी

Additional UI capabilities include:

* Light mode
* Dark mode
* Responsive design
* Aurora-inspired visual design
* Frosted-glass components
* Smooth animations
* Interactive dashboards

---

# 🛠️ Technology Stack

| Layer                    | Technologies                        |
| ------------------------ | ----------------------------------- |
| **Frontend**             | React 19, Vite 8, Tailwind CSS v4   |
| **UI & Icons**           | Lucide React                        |
| **Charts**               | Recharts                            |
| **Internationalization** | i18next, react-i18next              |
| **Backend**              | Python 3, Flask 3, Flask-CORS       |
| **Data & ML**            | NumPy, Scikit-learn                 |
| **NLP**                  | Custom Regex-based Multilingual NLP |
| **Database**             | Supabase PostgreSQL                 |
| **Authentication**       | Supabase Auth, JWT                  |
| **Security**             | Row-Level Security (RLS)            |
| **Voice**                | Web Speech API                      |
| **Audio Alerts**         | Web Audio API                       |

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │       User           │
                         │ Voice / Text / UI    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Frontend        │
                         │ React + Vite +       │
                         │ Tailwind CSS         │
                         └──────────┬───────────┘
                                    │
                              REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Backend        │
                         │ Flask + Python       │
                         └──────────┬───────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │ NLP Engine   │    │ ML Engine    │    │ AI Planner   │
        │ Multilingual │    │ Forecasting  │    │ Budget Logic │
        └──────────────┘    └──────────────┘    └──────────────┘
                │                   │                   │
                └───────────────────┼───────────────────┘
                                    ▼
                         ┌──────────────────────┐
                         │       Supabase       │
                         │ PostgreSQL + Auth    │
                         │ RLS + JWT            │
                         └──────────────────────┘
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* **Node.js 18+**
* **Python 3.10+**
* **Git**
* A **Supabase account and project**

---

## 1. Clone the Repository

```bash
git clone https://github.com/Krishhh45/Smart-Spend.git
cd Smart-Spend
```

---

# 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

### Create a Virtual Environment

```bash
python -m venv venv
```

### Windows

```powershell
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file according to `.env.example`.

Example:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-key
```

> **Never commit your actual `.env` file or API keys to GitHub.**

### Start the Backend

```bash
python app.py
```

The Flask server will normally run at:

```text
http://127.0.0.1:5000
```

---

# 3. Frontend Setup

Open a new terminal and navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create your frontend environment file according to `.env.example`.

Example:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 4. Production Build

To create a production build:

```bash
cd frontend
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

# 📂 Project Structure

```text
Smart-Spend/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   │
│   ├── services/
│   │   ├── nlp_parser.py
│   │   ├── ml_engine.py
│   │   ├── expense_planner_ai.py
│   │   └── supabase_client.py
│   │
│   └── tests/
│       └── test_settings_and_nlp.py
│
├── database/
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   │
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   └── AppShell.jsx
│       │   └── AiCompanionPanel.jsx
│       │
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── ThemeContext.jsx
│       │   └── ToastContext.jsx
│       │
│       ├── locales/
│       │   ├── en/
│       │   ├── hi/
│       │   └── mr/
│       │
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Transactions.jsx
│       │   ├── AddTransaction.jsx
│       │   ├── Budget.jsx
│       │   ├── Predictions.jsx
│       │   ├── ExpensePlanner.jsx
│       │   ├── Analytics.jsx
│       │   ├── Assistant.jsx
│       │   └── LandingPage.jsx
│       │
│       └── services/
│           ├── financialEngine.js
│           └── supabase.js
│
├── .env.example
├── .gitignore
├── FEATURES_AI.md
├── PROJECT_SRS.md
├── SmartSpend_Technical_Architecture_Short.md
├── WEBSITE_UI_STRUCTURE.md
└── README.md
```

---

# 🔐 Security & Privacy

SmartSpend is designed with security and user-data isolation in mind.

### Row-Level Security

Supabase PostgreSQL tables use **Row-Level Security (RLS)** policies to ensure users can access only their own financial records.

### Authentication

Authentication is handled using:

* Supabase Auth
* JWT-based authentication
* Protected application routes

### Environment Variables

Sensitive credentials are stored using environment variables and excluded from Git using `.gitignore`.

### Grounded Financial Intelligence

Financial insights, predictions, and alerts are calculated using the user's available transaction and budget data rather than fabricated financial figures.

---

# 🧪 Testing

Backend tests can be executed using:

```bash
pytest
```

For frontend production verification:

```bash
npm run build
```

---

# 📈 Future Enhancements

Potential future improvements include:

* Advanced AI financial assistant
* Personalized savings recommendations
* Subscription detection
* Recurring payment detection
* Financial goal tracking
* Exportable financial reports
* Advanced anomaly detection
* Mobile application
* More regional languages
* Personalized financial coaching
* Advanced forecasting models

---

# 🎯 Project Objective

The primary objective of SmartSpend is to transform traditional expense tracking into an **intelligent, proactive financial management experience**.

Instead of simply showing users where their money went, SmartSpend aims to answer:

> **"Where is my money going, where will I end up, and what should I do next?"**

---

# 👥 Project

**SmartSpend (Vexora)**
Intelligent Personal Finance & Budget Planner

Built as a modern full-stack application combining:

**React + Flask + Supabase + Machine Learning + Multilingual NLP**

---

m

---

## ⭐ Support

If you find the project useful, consider giving the repository a ⭐ on GitHub.

**Repository:** `Krishhh45/Smart-Spend`
