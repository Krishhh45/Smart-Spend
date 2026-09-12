# SmartSpend — Features & AI Specification

## 1. Document Purpose

This document defines the complete feature set, AI/ML capabilities, intelligent workflows, dynamic behavior, and implementation expectations for the **SmartSpend — AI-Powered Personal Expense Management System**.

The purpose of this document is to provide a clear specification for building a **fully functional, full-stack, dynamic financial management web application**.

SmartSpend must not behave like a static UI demonstration.

All displayed financial information must be generated from the authenticated user's actual database records, backend calculations, and AI/ML processing.

---

# 2. Core Product Vision

SmartSpend is a personal financial management platform that allows users to:

- Record financial transactions
- Manage different financial accounts
- Categorize expenses
- Track income and spending
- Create and monitor budgets
- Analyze financial behavior
- Detect unusual spending
- Predict future expenses
- Identify recurring payments and subscriptions
- Receive personalized financial insights
- Set financial goals
- Ask questions using an AI financial assistant
- Generate financial reports
- Understand where money is being spent
- Make better financial decisions using data-driven insights

The system should answer four levels of financial questions:

### Past
**"Where did my money go?"**

### Present
**"How am I spending right now?"**

### Future
**"What is likely to happen next?"**

### Action
**"What can I realistically change?"**

---

# 3. Critical Dynamic Website Requirement

## 3.1 No Hardcoded Financial Data

The application must NEVER use hardcoded financial data for actual application behavior.

Do not hardcode:

- Transaction amounts
- User names
- Account balances
- Expense totals
- Category totals
- Monthly spending
- Budget values
- Chart values
- AI insights
- Predictions
- Notifications
- Financial health scores
- Recurring expenses
- Subscription information
- Reports
- Dashboard statistics

Demo/seed data may be used only when explicitly required for development or initial testing.

Once a real user logs in, all information must come from that user's database records.

---

## 3.2 Full-Stack Dynamic Architecture

The application must follow:

**Frontend → Backend API → Database → Processing/AI → Backend Response → Frontend**

The frontend must not directly manipulate or permanently store financial data.

Example:

User adds transaction:

```text
User
 ↓
React Form
 ↓
POST /api/transactions
 ↓
Flask Backend
 ↓
Validation
 ↓
MySQL Database
 ↓
AI Categorization (if enabled)
 ↓
Response
 ↓
Frontend updates automatically
```

---

## 3.3 Dynamic Dashboard

Every dashboard value must be calculated from the logged-in user's current database data.

For example:

```text
Total Income
= SUM(all valid income transactions)

Total Expenses
= SUM(all valid expense transactions)

Balance
= Total Income - Total Expenses

Savings Rate
= (Balance / Total Income) × 100
```

If the user adds a new transaction, relevant dashboard information must update accordingly.

The application must not require manually changing frontend code to update financial information.

---

# 4. Core Expense Management Features

## 4.1 Transaction Management

Users must be able to:

- Add transactions
- Edit transactions
- Delete transactions
- View transactions
- Search transactions
- Filter transactions
- Sort transactions
- View transaction details

Transaction fields should include:

- Transaction ID
- User ID
- Amount
- Transaction type
- Category
- Account
- Payment method
- Merchant
- Description
- Date
- Optional notes
- Optional receipt
- Created timestamp
- Updated timestamp

Transaction types:

- Income
- Expense
- Transfer

---

# 5. Expense Categories

The system should support categories such as:

- Food
- Groceries
- Shopping
- Transportation
- Fuel
- Entertainment
- Bills
- Utilities
- Healthcare
- Education
- Insurance
- Investments
- EMI/Loans
- Subscriptions
- Travel
- Personal
- Other

Users should also be able to create custom categories if supported by the system.

Category information must be stored in the database.

The frontend must load available categories dynamically.

---

# 6. Account Management

Users can manage different financial sources.

Examples:

- Bank account
- Savings account
- Current account
- Credit card
- Debit card
- Cash
- UPI
- Investment/Demat account
- Insurance-related account
- Other financial accounts

Each account should contain relevant information such as:

- Account name
- Account type
- Current balance
- Institution/merchant name if applicable
- Last updated date
- User ID
- Status

Users must only be able to access their own accounts.

---

# 7. Budget Management

Users can create:

- Overall monthly budgets
- Category-wise budgets
- Custom-period budgets

Example:

```text
Food Budget: ₹5,000
Shopping Budget: ₹8,000
Transport Budget: ₹3,000
```

The system dynamically calculates:

```text
Budget Used
Remaining Budget
Percentage Used
```

Budget progress must be based on actual transactions.

Example:

```text
Food Budget = ₹5,000
Food Expenses = ₹3,750

Usage = 75%
Remaining = ₹1,250
```

The system should generate warnings when spending approaches or exceeds a budget.

---

# 8. Dashboard

The dashboard should dynamically display:

### Financial Summary

- Total Income
- Total Expenses
- Current Balance
- Savings
- Savings Rate

### Spending Analytics

- Monthly spending trend
- Category distribution
- Account-wise spending
- Payment-method spending
- Top spending categories

### Recent Transactions

Display the user's latest transactions from the database.

### Smart Insights

Show dynamically generated AI/ML insights.

### Alerts

Display relevant alerts such as:

- Budget nearing limit
- Budget exceeded
- Unusual transaction
- Upcoming recurring expense
- Subscription renewal
- Increased category spending

No dashboard card should display permanently fixed values.

---

# 9. AI/ML FEATURES

SmartSpend's intelligence layer consists of:

1. AI Expense Categorization
2. Anomaly Detection
3. Expense Prediction
4. Spending Pattern Analysis
5. Financial Health Score
6. Recurring Expense Detection
7. Subscription Detection
8. AI Budget Recommendation
9. Personalized Savings Recommendations
10. AI Financial Assistant
11. Natural Language Transaction Entry
12. AI Monthly Financial Report
13. Overspending Prediction
14. What-If Financial Simulator
15. AI Financial Goal Assistant
16. Receipt/OCR Processing
17. Smart Personalized Alerts
18. Merchant Recognition

---

# 10. AI Expense Categorization

## Purpose

Automatically determine the most appropriate expense category from transaction information.

Example:

```text
Description:
"Swiggy order"

AI Output:
Category = Food
```

Another example:

```text
Description:
"Uber trip"

AI Output:
Category = Transportation
```

## Input

The AI can use:

- Transaction description
- Merchant
- Amount
- Existing category history
- Payment method
- Previous transactions

## Output

```text
Predicted Category
Confidence Score
```

Example:

```text
Category: Food
Confidence: 94%
```

## Dynamic Requirement

The system must learn/use the user's actual transaction data where appropriate.

Do not return the same category for every transaction.

The categorization system should combine:

- Rule-based logic for obvious cases
- ML classification where appropriate
- LLM processing for ambiguous descriptions

---

# 11. Anomaly Detection

## Purpose

Identify transactions that are unusual compared with the user's normal spending behavior.

Example:

```text
Normal Shopping Expenses:
₹1,000 – ₹3,000

New Transaction:
₹15,000

Result:
⚠️ Unusual spending detected
```

The system should consider:

- Transaction amount
- Category
- Merchant
- Historical spending
- Frequency
- Time period
- User's normal behavior

Possible approaches:

- Statistical thresholds
- Z-score
- IQR
- Isolation Forest
- Other suitable anomaly detection methods

The chosen method should depend on available data.

## Output

```text
Transaction
Anomaly Status
Anomaly Score
Reason
```

Example:

```text
₹12,500 Shopping transaction

Unusual because:
Your average shopping expense is ₹2,800.
```

The explanation must be generated from actual user data.

---

# 12. Expense Prediction

## Purpose

Predict future expenses using historical transaction data.

Examples:

```text
Predicted September Expenses:
₹27,400
```

or:

```text
Expected Food Spending:
₹5,800
```

The model can consider:

- Historical monthly expenses
- Category trends
- Recurring payments
- Seasonal patterns
- Recent spending rate

Possible models:

- Moving average
- Linear regression
- Random Forest
- Time-series methods
- Other appropriate lightweight models

For smaller datasets, simpler statistical methods may be preferred over unnecessarily complex models.

## Important

Predictions must be generated from the user's actual historical data.

If insufficient data exists, the application should clearly state:

> "Not enough historical data to generate a reliable prediction."

Do not generate fake predictions.

---

# 13. Spending Pattern Analysis

The system should automatically identify patterns such as:

- Weekend overspending
- Increasing food expenses
- Increasing shopping expenses
- High transportation costs
- Frequent small transactions
- Large occasional expenses
- Category spending changes
- Payment-method patterns
- Monthly spending trends

Example:

```text
Insight:

Your weekend spending is approximately 32% higher
than your weekday spending.
```

The percentage must be calculated from real transactions.

---

# 14. Financial Health Score

SmartSpend should generate a dynamic financial health score.

Example:

```text
Financial Health

78 / 100
```

The score should be calculated from multiple measurable factors.

Possible factors:

- Savings rate
- Expense-to-income ratio
- Budget adherence
- Recurring expenses
- Spending growth
- Anomalies
- Financial goals
- Debt/EMI burden if recorded

Example conceptual calculation:

```text
Savings Performance
+ Budget Performance
+ Spending Stability
+ Recurring Expense Control
+ Goal Progress
= Financial Health Score
```

The exact formula should be documented and consistent.

The score must never be randomly generated.

The system should also explain the score.

Example:

```text
Your score is 78 because:

✓ Good savings rate
✓ Most category budgets are within limits
⚠ Shopping expenses increased
⚠ Recurring expenses are relatively high
```

---

# 15. Recurring Expense Detection

The system should identify repeated transactions.

Examples:

- Rent
- Insurance premium
- EMI
- Electricity bill
- Internet
- Mobile recharge
- Streaming subscription
- Gym membership

The system should detect patterns based on:

- Merchant
- Amount
- Frequency
- Transaction dates
- Category

Possible frequencies:

- Weekly
- Monthly
- Quarterly
- Yearly

The system should estimate the next expected payment date.

---

# 16. Subscription Detection

SmartSpend should identify recurring subscriptions.

Examples:

- Streaming services
- Cloud storage
- Software subscriptions
- Memberships
- Fitness subscriptions
- Digital services

The system should calculate:

```text
Monthly Subscription Cost
Annual Subscription Cost
```

Example:

```text
Monthly: ₹1,850
Estimated Annual: ₹22,200
```

The values must be calculated from actual detected subscriptions.

---

# 17. AI Budget Recommendation

The system can recommend budgets based on historical spending.

Example:

```text
Average Food Spending:
₹5,600/month

Recommended Food Budget:
₹5,800/month
```

The recommendation should consider:

- Historical spending
- Income
- Existing budgets
- Savings goals
- Category trends

The user must remain in control.

AI recommendations should never silently modify budgets.

The user must explicitly approve suggested changes.

---

# 18. Personalized Savings Recommendations

The AI should identify practical opportunities to reduce spending.

Example:

```text
Your food-delivery spending increased by 24%.

Reducing this category by 15% could save
approximately ₹900 per month based on your current spending.
```

Recommendations must be based on real data.

Avoid generic recommendations such as:

> "Spend less money."

Recommendations should explain:

1. What happened
2. Why it matters
3. What the user can do
4. Estimated possible impact

---

# 19. AI Financial Assistant

SmartSpend should provide a conversational AI assistant that answers questions using the user's financial data.

Examples:

```text
"How much did I spend on food this month?"

"Which category increased the most?"

"What was my highest expense?"

"How much did I spend on subscriptions?"

"Am I within my budget?"

"How much did I save this month?"
```

The AI assistant must retrieve relevant data from the backend before generating the response.

## Important

The LLM must NOT invent financial information.

The system should follow:

```text
User Question
↓
Intent Detection
↓
Relevant Database Query
↓
Actual Financial Data
↓
AI Explanation
↓
Response
```

---

# 20. Natural Language Transaction Entry

Users should optionally be able to enter transactions using natural language.

Example:

```text
"Spent ₹450 on dinner at Swiggy yesterday using my HDFC credit card."
```

The AI should extract:

```text
Amount: ₹450
Category: Food
Merchant: Swiggy
Date: Yesterday
Payment Method: Credit Card
```

The system must show the extracted information for user confirmation before permanently saving the transaction.

AI should not automatically save uncertain information without confirmation.

---

# 21. AI Monthly Financial Report

The system should generate an intelligent monthly summary.

Example structure:

```text
Monthly Financial Summary

Total Income
Total Expenses
Total Savings
Savings Rate

Top Spending Category

Largest Expense

Spending Increased/Decreased

Recurring Expenses

Budget Performance

Important Insights

Recommended Actions
```

The report must be generated from actual database data.

The AI can convert calculated financial statistics into natural-language explanations.

---

# 22. Overspending Prediction

The system should detect when a user is likely to exceed a budget before the budget period ends.

Example:

```text
⚠️ Overspending Risk

You have used 78% of your Food budget,
but only 65% of the month has passed.

At your current spending rate,
you may exceed your budget by approximately ₹850.
```

This requires:

- Current spending
- Days elapsed
- Days remaining
- Budget amount
- Historical/current spending rate

The values must be dynamically calculated.

---

# 23. What-If Financial Simulator

Users should be able to test hypothetical scenarios.

Example:

```text
What if I reduce shopping expenses by 20%?
```

The system calculates:

```text
Current Shopping Spending:
₹8,000

20% Reduction:
₹1,600

Potential Savings:
₹1,600/month
```

Another example:

```text
What if I save ₹5,000 every month?
```

The system can estimate:

```text
6 Months:
₹30,000

12 Months:
₹60,000
```

The simulator should not modify actual financial records.

It only calculates hypothetical scenarios.

---

# 24. AI Financial Goal Assistant

Users can define financial goals.

Examples:

- Emergency fund
- New laptop
- Travel
- Education
- Investment target
- General savings

Example:

```text
Goal:
Save ₹60,000

Target:
6 months
```

The system can calculate:

```text
Required Monthly Saving:
₹10,000
```

AI can analyze the user's spending and suggest possible adjustments.

The recommendation must be based on actual income and expenses.

---

# 25. Receipt/OCR Processing

Users may optionally upload a receipt.

The system can extract:

- Merchant
- Date
- Total amount
- Items
- Possible category

Flow:

```text
Receipt
↓
OCR
↓
Text Extraction
↓
Data Processing
↓
Transaction Preview
↓
User Confirmation
↓
Database
```

The extracted transaction must be reviewed before saving.

If OCR fails, the application should provide a clear error and allow manual entry.

---

# 26. Smart Personalized Alerts

The notification system should dynamically generate relevant alerts.

Examples:

### Budget Alert

```text
You have used 90% of your Shopping budget.
```

### Anomaly Alert

```text
A ₹12,000 transaction is significantly higher
than your normal Shopping expenses.
```

### Prediction Alert

```text
You may exceed your Transport budget this month.
```

### Recurring Payment Alert

```text
Your ₹999 subscription may renew soon.
```

Alerts must be generated from actual user data.

Do not display the same fixed alerts to every user.

---

# 27. Merchant Recognition

The system should recognize merchants from transaction descriptions.

Example:

```text
"UPI-ZOMATO-XXXX"
↓
Merchant: Zomato
Category: Food
```

Possible merchant information:

- Merchant name
- Merchant category
- Transaction frequency
- Total spending
- Last transaction
- Average transaction amount

Merchant information should be dynamically generated or stored from actual transactions.

---

# 28. AI vs Traditional Logic

Not every feature requires an LLM.

SmartSpend should use the most appropriate technology.

### Traditional Backend Logic

Use normal programming/database queries for:

- Total income
- Total expenses
- Balance
- Budget calculations
- Savings rate
- Transaction CRUD
- Filtering
- Sorting
- Monthly totals
- Account balances

### Machine Learning

Use ML/statistical models for:

- Anomaly detection
- Expense prediction
- Spending pattern detection
- Categorization where appropriate

### LLM

Use an LLM for:

- AI assistant
- Natural-language transaction extraction
- Financial explanations
- Monthly report generation
- Personalized recommendation wording
- Natural-language queries

This avoids unnecessarily using an LLM for simple mathematical calculations.

---

# 29. AI Architecture

Recommended intelligence architecture:

```text
                    USER
                      │
                      ▼
              React Frontend
                      │
                      ▼
                Flask REST API
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
      MySQL Database          AI/ML Engine
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                  ML Models      LLM          Rules
                    │             │             │
                    └─────────────┼─────────────┘
                                  ▼
                         AI/ML Result
                                  │
                                  ▼
                            Flask Backend
                                  │
                                  ▼
                           React Frontend
```

---

# 30. AI Model Selection

The project should prefer lightweight, practical models.

## Expense Categorization

Possible:

- Rule-based classification
- TF-IDF + Logistic Regression
- Naive Bayes
- Suitable LLM

## Anomaly Detection

Possible:

- Z-score
- IQR
- Isolation Forest

## Expense Prediction

Possible:

- Moving Average
- Linear Regression
- Random Forest
- Time-series model where sufficient data exists

## Natural Language Processing

Use an LLM or suitable NLP model for:

- Transaction extraction
- Financial questions
- Explanations
- Recommendations

## Important Model Rule

Do not use a complex model simply to make the project appear advanced.

Choose models based on:

- Dataset size
- Accuracy
- Speed
- Explainability
- Implementation complexity

---

# 31. AI Data Flow

General AI flow:

```text
User Data
↓
Backend Validation
↓
Database Retrieval
↓
Data Cleaning
↓
Feature Preparation
↓
AI/ML Processing
↓
Validation
↓
Result Explanation
↓
Frontend
```

AI-generated results should be stored where appropriate so that they can be reused and audited.

---

# 32. Dynamic AI Requirement

AI responses must be based on current user data.

For example, if User A has:

```text
Food = ₹5,000
```

and User B has:

```text
Food = ₹12,000
```

the AI must not return the same personalized financial insight to both users.

The AI service must receive the appropriate user's authorized financial context.

---

# 33. User Data Isolation

AI must never access another user's financial information.

Every AI request must be associated with the authenticated user.

Flow:

```text
Authenticated User
↓
User ID
↓
Authorized Database Query
↓
User-specific Data
↓
AI Processing
↓
Response
```

Never send unrelated users' data to the AI service.

---

# 34. AI Hallucination Prevention

The AI assistant must not invent:

- Transaction amounts
- Account balances
- Dates
- Categories
- Predictions
- Financial history
- User information

For factual financial questions, the backend should calculate/retrieve the answer first.

The LLM should primarily explain the retrieved information.

Example:

```text
Database:
Food expenses = ₹5,420

LLM:
"You spent ₹5,420 on food this month..."
```

Not:

```text
LLM guesses:
"You spent approximately ₹6,000..."
```

---

# 35. Explainable AI

Every important AI-generated result should provide an understandable reason.

Example:

```text
Why was this transaction flagged?

Amount: ₹15,000
Normal category average: ₹3,200

Reason:
This transaction is approximately 4.7× higher
than your recent average shopping expense.
```

For predictions:

```text
Why this prediction?

Your food spending has increased during the
last three months.
```

Users should not receive unexplained AI scores wherever an explanation can reasonably be provided.

---

# 36. AI Confidence

Where applicable, the system should store/display confidence.

Example:

```text
Category:
Food

Confidence:
94%
```

If confidence is low:

```text
AI is not confident about this category.

Suggested:
Other

Please select the correct category.
```

The user must be able to override AI decisions.

---

# 37. AI Feedback Learning

Users should be able to correct AI results.

Example:

```text
AI:
Category = Shopping

User:
Change category → Food
```

The system may store this correction for future categorization improvements.

The application should not silently retrain models in production unless such a mechanism has been deliberately implemented.

---

# 38. Insufficient Data Handling

AI features must work safely when the user has little or no data.

Example:

```text
Prediction unavailable.

Add more transactions to generate a reliable
expense prediction.
```

For anomaly detection:

```text
Not enough historical spending data to determine
your normal spending pattern.
```

Never display fake AI results simply to fill an empty UI.

---

# 39. AI Failure Handling

If the AI service is unavailable:

- Core application must continue working
- Transactions must still work
- Dashboard must still work
- Analytics must still work
- Budgets must still work

The UI should display:

```text
AI insights are temporarily unavailable.
Your financial data and core features are still working.
```

The application must never crash because of an AI API failure.

---

# 40. Financial Safety

SmartSpend is a financial management and analysis application.

AI output should be presented as:

- Insights
- Estimates
- Predictions
- Suggestions

The system should avoid presenting uncertain predictions as guaranteed outcomes.

Example:

Use:

> "Estimated savings"

instead of:

> "Guaranteed savings"

Use:

> "Predicted expense"

instead of:

> "Certain future expense"

---

# 41. Privacy

Financial information is sensitive.

The system must:

- Keep user data isolated
- Use authenticated API access
- Avoid exposing financial data in frontend source code
- Never expose API keys in frontend
- Store passwords securely
- Validate authorization for every protected operation
- Minimize data sent to external AI services
- Avoid logging sensitive financial information unnecessarily

---

# 42. MVP AI Features

The minimum AI implementation should prioritize:

1. AI Expense Categorization
2. Anomaly Detection
3. Expense Prediction
4. Spending Pattern Analysis
5. Financial Health Score
6. AI Financial Assistant
7. Personalized Recommendations
8. Recurring Expense Detection

These should be implemented properly before adding optional advanced AI features.

---

# 43. Advanced AI Features

After the MVP is stable:

9. Natural Language Transaction Entry
10. AI Monthly Reports
11. Overspending Prediction
12. AI Budget Recommendation
13. Subscription Detection
14. What-If Simulator
15. Financial Goal Assistant
16. Receipt/OCR Processing
17. Merchant Recognition
18. AI Feedback Learning

---

# 44. Dynamic Feature Rules

Every feature must satisfy the following:

### Rule 1 — Database Connected

Financial data must originate from the database.

### Rule 2 — User Specific

Data must belong to the currently authenticated user.

### Rule 3 — Backend Controlled

Important calculations must be performed or validated by the backend.

### Rule 4 — No Fake Results

Do not create fake AI responses or fake financial statistics.

### Rule 5 — Real-Time UI Updates

After successful changes, relevant UI components should refresh/update from the backend.

### Rule 6 — Error Handling

Every feature must handle:

- Loading
- Success
- Empty data
- Validation failure
- Backend failure
- Database failure
- AI failure

### Rule 7 — Persistent Data

User-created information must be persisted in the database.

### Rule 8 — No Frontend-Only Features

A feature is not considered complete if it only visually exists in the frontend.

---

# 45. Feature Completion Standard

A feature is considered **COMPLETE** only when:

```text
UI
+
Frontend Logic
+
Backend API
+
Database
+
Validation
+
Authentication/Authorization
+
Error Handling
+
Dynamic Data
+
Testing
```

are all implemented where applicable.

For AI features:

```text
UI
+
Backend
+
Actual User Data
+
AI/ML Processing
+
Result Validation
+
Explanation
+
Error/Fallback Handling
```

must be implemented.

---

# 46. Example Complete Dynamic Workflow

## Example: Adding an Expense

User enters:

```text
₹1,250
"Amazon headphones"
```

System:

```text
React Form
↓
POST /api/transactions
↓
Flask validation
↓
AI categorization
↓
Category = Electronics/Shopping
↓
User confirmation if required
↓
MySQL transaction inserted
↓
Dashboard recalculated
↓
Budget recalculated
↓
Analytics updated
↓
Anomaly check
↓
Relevant AI insight generated
↓
Frontend displays updated information
```

Nothing in this flow should depend on hardcoded transaction values.

---

# 47. Example Complete AI Insight Workflow

```text
User opens Dashboard
↓
Backend retrieves user's transactions
↓
Backend calculates financial statistics
↓
ML engine analyzes spending patterns
↓
Anomaly detector checks unusual transactions
↓
Prediction model estimates future spending
↓
Recommendation engine identifies possible actions
↓
AI generates understandable explanations
↓
Backend validates response
↓
Frontend displays personalized insights
```

---

# 48. Final AI Product Identity

SmartSpend should not be presented as simply:

> "An expense tracker with AI."

It should be presented as:

> **An intelligent personal financial management system that transforms transaction data into insights, predictions, alerts, and actionable recommendations.**

The core intelligence pipeline is:

```text
                 FINANCIAL DATA
                       ↓
                DATA PROCESSING
                       ↓
              ┌────────┴────────┐
              ↓                 ↓
          ANALYTICS           AI/ML
              ↓                 ↓
              └────────┬────────┘
                       ↓
                  INSIGHTS
                       ↓
                 PREDICTIONS
                       ↓
                RECOMMENDATIONS
                       ↓
                 USER ACTIONS
```

The ultimate objective is to move the user from:

**"Where did my money go?"**

to:

**"What is happening with my money, what is likely to happen next, and what should I do?"**

---

# 49. Final Implementation Principle

**BUILD A REAL FULL-STACK DYNAMIC APPLICATION, NOT A STATIC PROTOTYPE.**

The system must:

- Use a real frontend
- Use a real backend
- Use a real database
- Use authenticated users
- Store real transactions
- Calculate real financial statistics
- Generate charts from database data
- Generate AI results from actual user data
- Persist user changes
- Handle errors correctly
- Support empty states
- Support loading states
- Support multiple users
- Protect user data
- Keep frontend and backend synchronized
- Avoid hardcoded financial information
- Avoid fake AI responses
- Avoid fake success messages
- Avoid static charts
- Avoid dummy dashboard numbers after real data is available

**A feature should only be marked complete when its complete frontend + backend + database + AI/ML integration is functional and tested.**