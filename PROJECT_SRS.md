# SmartSpend — Software Requirements Specification (SRS)

**Project:** SmartSpend: Intelligent Personal Expense Management and Financial Wellness Platform  
**Document:** PROJECT_SRS.md  
**Version:** 1.0  
**Owner:** Member 1 — Requirements, Scope and Outcomes  
**Status:** Draft for Team Review

---

## 1. Introduction

### 1.1 Purpose

This document defines the requirements for **SmartSpend**, a dynamic web application that helps individuals understand, control and plan their personal finances. It is intended for the project team, faculty evaluators, testers and future maintainers.

SmartSpend is not only a transaction register. It converts financial activity into proactive, explainable guidance: it detects patterns, identifies recurring commitments, warns about unusual spending, predicts near-term expenditure and shows how small behavioural changes can affect savings goals.

### 1.2 Product Vision

> **SmartSpend is a financial early-warning and decision-support system, not merely an expense diary.**

The application will bring multiple financial sources—cash, bank accounts, UPI, debit cards, credit cards, investments/Demat records, insurance premiums, medical costs, EMIs and subscriptions—into one understandable view. It must minimize repeated manual work: users can enter a transaction once, import a statement/CSV, scan a receipt, or connect an approved data source when integration is available.

### 1.3 Background

People commonly make payments through several channels and receive financial information across different applications. As a result, they may know individual transactions but not their total spending, upcoming obligations, subscription burden, category-wise trends or capacity to save.

Traditional spreadsheets and basic trackers often require continuous manual entry and show only past totals. SmartSpend addresses this gap with automation, adaptive budgets, financial commitments tracking, visual analytics and intelligent recommendations.

### 1.4 Problem Statement

Individuals manage expenses across UPI, bank accounts, cards, cash, insurance, medical policies, subscriptions and investment-related payments. This fragmented and largely manual process makes it difficult to monitor total spending, recognize overspending early, identify forgotten recurring payments and make informed financial decisions.

The required solution is a secure, responsive web application that records and organizes financial transactions, presents a unified financial view and provides dynamic alerts, predictions and explainable insights while keeping each user's data private.

### 1.5 Existing Approaches and Gaps

| Existing approach | Common strengths | Key limitations SmartSpend addresses |
|---|---|---|
| Paper notes or spreadsheets | Flexible and familiar | High manual effort, inconsistent categories, no live alerts or prediction |
| Basic expense trackers | Transaction recording and category totals | Primarily historical reporting; limited automation and personal guidance |
| Bank/UPI applications | Accurate records for one provider | Data is isolated by provider; lacks complete spending and goal view |
| Subscription lists | Renewal-date tracking | Do not connect recurring costs to budgets, annual impact or user behaviour |

### 1.6 Proposed System

SmartSpend will provide:

- A unified dashboard for income, expenditure, balances, commitments, savings progress and financial health.
- Transaction capture through manual form entry, CSV import and receipt scanning; optional account/statement synchronization may be added where legal APIs and consent are available.
- Automatic category suggestions based on transaction descriptions and merchant patterns, with user correction and learning feedback.
- Budget monitoring, trend comparison, recurring-payment detection and financial-calendar reminders.
- Anomaly alerts that explain why an amount appears unusual relative to the user's own historical patterns.
- Near-term expenditure forecasts and a what-if savings simulator.
- An AI assistant limited to the user's authorized financial data, with source-based explanations and clear “estimate, not financial advice” wording.

### 1.7 Objectives

1. Centralize financial records from multiple accounts and payment modes in one user-specific workspace.
2. Reduce repetitive manual tracking through imports, receipt extraction and automatic category suggestions.
3. Enable timely monitoring through dashboards, filters, charts, budgets and notifications.
4. Detect recurring expenses, upcoming commitments and potentially unnecessary subscriptions.
5. Identify unusual or rapidly increasing spending with clear reasons and user control over alerts.
6. Forecast category-level and overall expenditure using available historical data, while communicating uncertainty.
7. Provide personalized, explainable recommendations rather than generic “spend less” advice.
8. Help users evaluate saving decisions using a what-if simulator and measurable goals.
9. Protect financial data using authentication, authorization, validation and privacy-by-design practices.
10. Deliver a responsive, accessible and maintainable web application suitable for future scaling.

### 1.8 Success Criteria

| Metric | MVP target | Measurement |
|---|---:|---|
| Core transaction calculation accuracy | 100% for validated test cases | Automated and manual test cases |
| Dashboard update after transaction change | Within 2 seconds under normal demo load | API/UI timing tests |
| Category suggestion coverage | Suggestions shown for at least 80% of supported descriptions | Test dataset evaluation |
| Categorization quality | At least 85% accuracy after training/test validation | Labeled evaluation set |
| Budget alert delivery | Alert generated at configured threshold | Functional test logs |
| Explainable insight coverage | Every alert/recommendation shows a reason and underlying comparison | Review checklist |
| Data isolation | Zero cross-user data-access failures in authorization tests | Security test cases |
| User task completion | User can add a transaction and view its dashboard effect without assistance | Usability test |

---

## 2. Scope

### 2.1 In Scope

- Individual user registration, login, logout, profile and preferences.
- Multiple account records: cash, bank, UPI, debit card, credit card, investment/Demat, insurance and other user-defined accounts.
- Income, expense, transfer, bill, EMI, subscription, investment and refund transaction records.
- Predefined and user-created expense categories, tags and merchant descriptions.
- Add, edit, delete, search, sort, filter and import transactions.
- Visual dashboard, monthly and category analytics, reports and data export.
- Category and total budget creation, progress monitoring and threshold alerts.
- Recurring-expense and subscription-pattern detection.
- Anomaly detection, expense prediction, financial health score, what-if analysis and explainable recommendations.
- Financial calendar for expected bills, renewals, income events and manual reminders.
- Notifications for budgets, anomalies, due dates, goals and system events.
- Secure APIs and user-specific access control.

### 2.2 Out of Scope for MVP

- Processing payments, UPI transfers, bank transfers or card payments within SmartSpend.
- Executing stock, mutual fund, cryptocurrency or insurance transactions.
- Tax filing or regulated investment advice.
- Guaranteeing bank-account synchronization for every institution; integrations depend on consent, provider availability and applicable rules.
- Credit-score decisions, lending, insurance underwriting or fraud adjudication.
- Multi-language support and native mobile applications in the first release.

### 2.3 Dynamic-First Principle

SmartSpend must not rely on hard-coded financial records or static dashboard values. Every displayed balance, chart, score, recommendation, alert and report must be calculated from the authenticated user's stored data or from clearly identified sample/demo data.

The only intentional manual inputs are initial onboarding details, optional account setup, cash/non-digital transactions, corrections to imported information, custom budgets/goals, and explicit user confirmation where automation has low confidence.

---

## 3. Target Users

| User group | Typical situation | SmartSpend value |
|---|---|---|
| Students | Pocket money, scholarships, UPI-heavy transactions and irregular spending | Daily awareness, no-spend challenges, simple budgets and goal tracking |
| Working professionals | Salary, cards, rent, EMIs, subscriptions and investments | Unified view, proactive alerts, cash-flow forecast and subscription review |
| Families/individual households | Shared recurring bills, groceries, insurance and education expenses | Household spending visibility and commitment calendar |
| Freelancers/gig workers | Irregular income and work-related costs | Income-versus-expense trend view, cash-flow planning and exports |
| Financially conscious users | Already record expenses but want better decisions | Automation, explanations, forecasts and configurable analytics |

---

## 4. Functional Requirements

### 4.1 Authentication and Profile

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | The system shall allow a new user to register with name, email and password after validating mandatory fields and uniqueness of email. | Must |
| FR-02 | The system shall authenticate registered users and issue a secure session/token for authorized access. | Must |
| FR-03 | The system shall allow users to log out and invalidate/remove the active session on the client. | Must |
| FR-04 | The system shall allow users to view and update permitted profile details and preferences. | Should |
| FR-05 | The system shall provide a secure password-reset flow. | Should |
| FR-06 | The system shall ensure that a user can access only their own accounts, transactions, budgets, reports and insights. | Must |

### 4.2 Accounts and Financial Sources

| ID | Requirement | Priority |
|---|---|---|
| FR-07 | The system shall allow users to create, edit, archive and view financial accounts, including cash, bank, UPI, debit card, credit card, Demat/investment and insurance records. | Must |
| FR-08 | The system shall maintain account-specific transaction history and calculated balance where applicable. | Must |
| FR-09 | The system shall permit users to import historical transactions through a validated CSV file. | Should |
| FR-10 | The system shall support receipt-image upload and extract candidate amount, date and merchant information when OCR is available; the user must confirm before saving. | Should |
| FR-11 | The system shall support approved consent-based account/statement synchronization as an optional integration; if unavailable, manual and CSV alternatives must remain functional. | Could |

### 4.3 Transaction Management

| ID | Requirement | Priority |
|---|---|---|
| FR-12 | The system shall allow users to add income, expense, transfer, refund, investment and bill transactions with amount, date, account and transaction type. | Must |
| FR-13 | The system shall validate transaction amount, date, account ownership and required fields before storing a transaction. | Must |
| FR-14 | The system shall allow users to edit or delete their own transactions and update all dependent summaries. | Must |
| FR-15 | The system shall provide transaction detail pages including category, merchant, notes, source, tags and attached receipt where available. | Should |
| FR-16 | The system shall support duplicate-detection warnings based on similar amount, date, account and merchant information before creating a transaction. | Should |
| FR-17 | The system shall allow users to search, sort and filter transactions by date, category, merchant, account, amount range, type and tags. | Must |

### 4.4 Categories and Classification

| ID | Requirement | Priority |
|---|---|---|
| FR-18 | The system shall provide default categories such as food, travel, shopping, bills, healthcare, education, entertainment, investments and insurance. | Must |
| FR-19 | The system shall allow users to create and manage custom categories and tags. | Should |
| FR-20 | The system shall suggest a category for supported transactions using description, merchant and prior user corrections. | Should |
| FR-21 | The system shall allow users to override any suggested category and record that correction as feedback for future suggestions. | Must |
| FR-22 | The system shall display category-confidence information when the prediction confidence is below a configured threshold and request confirmation. | Should |

### 4.5 Dashboard and Analytics

| ID | Requirement | Priority |
|---|---|---|
| FR-23 | The dashboard shall display current-period income, expenditure, net balance, savings rate and selected account summaries. | Must |
| FR-24 | The dashboard shall refresh calculated summaries after a relevant transaction, account or budget change. | Must |
| FR-25 | The system shall show category-wise expenditure, monthly trends and current-versus-prior-period comparisons through accessible charts and tables. | Must |
| FR-26 | The system shall support a selectable date range and account/category filters across analytics views. | Must |
| FR-27 | The system shall calculate net worth as eligible assets minus eligible liabilities, clearly labeling data that is user-entered versus synced/imported. | Should |
| FR-28 | The system shall surface actionable insight cards rather than only visual totals. | Must |

### 4.6 Budgets, Goals and Calendar

| ID | Requirement | Priority |
|---|---|---|
| FR-29 | The system shall let users create overall and category-specific weekly or monthly budgets. | Must |
| FR-30 | The system shall show spent, remaining and percentage-used values for each active budget. | Must |
| FR-31 | The system shall generate configurable alerts at budget thresholds such as 50%, 80% and 100%. | Must |
| FR-32 | The system shall permit users to create financial goals with target amount, target date and optional monthly contribution plan. | Should |
| FR-33 | The system shall show goal progress and calculate required periodic savings based on remaining time and target amount. | Should |
| FR-34 | The system shall display recurring bills, EMI dates, insurance renewals, subscriptions and user-created reminders on a financial calendar. | Should |

### 4.7 Intelligent and Differentiating Features

| ID | Requirement | Priority |
|---|---|---|
| FR-35 | The system shall identify recurring transactions using repeated merchant/description, interval and amount patterns, and allow the user to confirm, ignore or edit each detected pattern. | Must |
| FR-36 | The system shall calculate monthly and annual cost for confirmed subscriptions and show renewal dates and the impact on available budget. | Must |
| FR-37 | The system shall flag potentially unusual spending using each user's historical baseline, category, frequency and amount; it shall show why the transaction was flagged. | Should |
| FR-38 | The system shall predict upcoming total and category expenditure when sufficient historical data exists, showing a range/confidence indicator and “estimate only” notice. | Should |
| FR-39 | The system shall generate a Financial Health Score from transparent, configurable indicators such as savings rate, budget adherence, recurring-commitment ratio, debt/liability indicator and goal progress. | Should |
| FR-40 | The system shall break down the Financial Health Score so users can see score contributors and practical actions that may improve it. | Must |
| FR-41 | The system shall provide a what-if simulator where a user changes a category, budget or recurring payment assumption and sees projected monthly/annual savings and goal impact without changing real data. | Should |
| FR-42 | The system shall create explainable recommendations using measurable evidence, for example: “Dining spending is 28% above your three-month average.” | Must |
| FR-43 | The system shall provide an AI assistant for approved natural-language questions over the authenticated user's financial data and return grounded answers, relevant period and calculation basis. | Could |
| FR-44 | The AI assistant shall refuse or safely redirect requests outside its authorized data scope and shall not claim to provide regulated financial advice. | Must |
| FR-45 | The system shall allow users to mute, dismiss or configure alerts and record alert status. | Should |

### 4.8 Reports, Export and Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-46 | The system shall generate downloadable monthly and custom-period reports containing totals, category analysis, charts and notable insights. | Must |
| FR-47 | The system shall export the user's selected transactions and summaries as CSV and, where implemented, PDF. | Should |
| FR-48 | The system shall send in-app notifications for budget thresholds, recurring-payment dates, anomalies, predictions, goal milestones and system errors where configured. | Must |
| FR-49 | The system shall allow users to manage notification channels and frequency. | Should |
| FR-50 | The system shall provide a data-export and account-deletion request process consistent with the project's privacy policy. | Must |

---

## 5. Non-Functional Requirements

| ID | Area | Requirement |
|---|---|---|
| NFR-01 | Performance | Under ordinary demo load, key dashboard requests should complete within 2 seconds and standard API requests within 500 ms where no external AI/provider call is required. |
| NFR-02 | Reliability | Failed requests must return a clear user-safe error state; no partially saved transaction may be presented as successful. |
| NFR-03 | Data integrity | Financial changes must use validated server-side operations and database transactions where multiple records are updated. |
| NFR-04 | Security | Passwords must be hashed; authenticated endpoints must verify identity and ownership; secrets must not be committed to client code or source control. |
| NFR-05 | Privacy | The system shall collect only data necessary for stated functions, request consent for integrations and avoid exposing financial data in logs or error messages. |
| NFR-06 | Availability | The MVP should be deployable with health checks and graceful degradation when a non-core AI or integration service is unavailable. |
| NFR-07 | Usability | A first-time user should be able to create an account, add/import a transaction and understand the dashboard without documentation. |
| NFR-08 | Accessibility | The UI shall provide readable contrast, keyboard navigation, semantic labels, meaningful error text and non-color-only status cues. |
| NFR-09 | Responsiveness | Core pages shall work on desktop, tablet and mobile browsers without loss of essential functions. |
| NFR-10 | Maintainability | Code shall be modular, documented at interfaces and version-controlled; APIs must have clear request/response contracts. |
| NFR-11 | Explainability | Automated category suggestions, alerts, forecasts, scores and recommendations shall show an understandable reason, data period or confidence where relevant. |
| NFR-12 | Accuracy | Totals, balances, ratios and report calculations must be tested against known expected values. Predictions are estimates and must never be displayed as guaranteed outcomes. |
| NFR-13 | Backup and recovery | The deployment plan shall include periodic database backup, restoration verification and error logging without secrets or raw sensitive data. |
| NFR-14 | Compatibility | The application shall support current major versions of Chrome, Firefox, Edge and Safari. |

---

## 6. System Constraints

1. The project is developed by a four-member academic team with limited time, infrastructure and third-party API budgets.
2. The MVP must function fully with manual entry, CSV import and sample data even if live banking/UPI integration is unavailable.
3. Account access must be consent-based; the system must not collect banking passwords or bypass provider security controls.
4. AI features depend on adequate, clean historical data. When insufficient data exists, the system must explain this rather than fabricate an insight.
5. SmartSpend is an informational tool, not a payment processor, investment broker, tax-filing service or licensed financial adviser.
6. Third-party OCR, LLM and data-provider services may have rate limits, cost limits or service interruptions.
7. Financial data rules and privacy requirements must be considered before production use; the academic MVP will use demo or explicitly consented data only.

---

## 7. Assumptions

1. Users have access to a modern web browser and an internet connection.
2. Users will provide accurate transaction details when using manual entry or confirming extracted/imported data.
3. Users understand that data-driven forecasts and recommendations are estimates, not guarantees.
4. The team will maintain a shared API contract, data model and Git repository to avoid feature mismatch.
5. The system has enough transaction history before enabling personalized forecasts and anomaly models.
6. Optional integrations are used only after required credentials, sandbox access and user consent are available.

---

## 8. Use Cases

### UC-01: Onboard and Create a Financial Workspace

- **Primary actor:** New user
- **Preconditions:** User is not authenticated.
- **Trigger:** User selects “Create Account.”
- **Main flow:**
  1. User submits name, email and password.
  2. System validates inputs and creates a secured user account.
  3. User logs in and selects currency, preferred financial period and optional goals.
  4. System displays an onboarding checklist: add account, import/enter transactions, create budget and review first insight.
- **Outcome:** An individual, empty but usable financial workspace exists.
- **Alternative:** If email already exists or validation fails, the system explains the issue without exposing sensitive details.

### UC-02: Add or Import Transaction with Minimal Manual Work

- **Primary actor:** Authenticated user
- **Preconditions:** User owns at least one account.
- **Trigger:** User adds a transaction, uploads a CSV or scans a receipt.
- **Main flow:**
  1. System captures/imports amount, date, merchant and account information.
  2. System validates ownership and required values, then checks for likely duplicates.
  3. System suggests a category and confidence score.
  4. User confirms or corrects uncertain values.
  5. System saves the transaction and recalculates dashboards, budgets and relevant alerts.
- **Outcome:** The financial record is stored and visual summaries update dynamically.
- **Alternative:** If extraction/import fails, the system retains no incomplete record and offers a corrective manual form.

### UC-03: Detect a Subscription Leak

- **Primary actor:** Authenticated user
- **Preconditions:** The user has sufficient recurring transaction history or manually confirmed subscriptions.
- **Trigger:** Scheduled analysis or user opens Subscription Review.
- **Main flow:**
  1. System detects repeat patterns by merchant, date interval and amount.
  2. System proposes a recurring payment and asks for confirmation where uncertain.
  3. System calculates monthly/annual impact and upcoming renewal date.
  4. System shows the commitment against the user's available budget and saving goal.
  5. User can mark it as essential, review later or add a reminder to cancel.
- **Outcome:** The user receives an actionable commitment overview—not merely a list of transactions.

### UC-04: Respond to Unusual Spending

- **Primary actor:** Authenticated user
- **Preconditions:** A historical baseline exists for a category/merchant or a configured absolute threshold is exceeded.
- **Trigger:** New transaction is analyzed.
- **Main flow:**
  1. System detects an unusually high amount or rapid category increase.
  2. System creates an alert with comparison data, such as current amount versus historical average.
  3. User opens the alert, verifies the transaction or marks it expected.
  4. System records the user's response to reduce repeated irrelevant alerts.
- **Outcome:** The user receives early awareness with a transparent reason.

### UC-05: Simulate a Saving Decision

- **Primary actor:** Authenticated user
- **Preconditions:** User has at least one expense category or recurring payment.
- **Trigger:** User opens What-If Simulator.
- **Main flow:**
  1. User selects a category or subscription and changes an assumption, such as reducing shopping by 20%.
  2. System calculates estimated monthly and annual difference from relevant historical spending.
  3. System shows projected impact on selected goals and financial health indicators.
  4. User may convert the scenario into a proposed budget, but only after explicit confirmation.
- **Outcome:** The user can explore options without modifying actual financial data.

### UC-06: Ask a Data-Grounded Financial Question

- **Primary actor:** Authenticated user
- **Preconditions:** AI Assistant is enabled and relevant user data exists.
- **Trigger:** User asks, “How much did I spend on food last month?”
- **Main flow:**
  1. System verifies session and user ownership scope.
  2. System converts the question into an approved query over the user's data.
  3. System returns total, date range, category basis and, where useful, a short explanation.
  4. System clearly marks estimates and does not invent unavailable data.
- **Outcome:** User receives an understandable answer tied to their own records.

---

## 9. Key Business Rules

1. An expense amount reduces available balance only for account types where balance tracking is enabled; transfers must not be double-counted as expense and income.
2. A transaction belongs to exactly one user and must reference an account owned by that user.
3. Only the transaction owner can modify, delete or export it.
4. A deleted transaction must be excluded from normal analytics and reports; the implementation may retain a secure audit record where required.
5. Auto-categorization is a suggestion, not an immutable decision; user corrections take priority.
6. Recurring-payment detections remain “candidate” until confirmed or system confidence exceeds an agreed threshold.
7. Forecasts require a minimum data threshold defined by the ML module; otherwise the UI displays “Not enough history for a reliable forecast.”
8. Financial Health Score must show its contributing indicators and cannot be used for lending, insurance or credit decisions.
9. Recommendations must be based on a user-specific calculation or rule and include the time period used.
10. What-if scenarios must remain separate from actual transactions until the user explicitly creates a budget/goal change.

---

## 10. Expected Outcomes

### User Outcomes

- A single, continuously updated view of financial activity rather than disconnected account histories.
- Reduced repetitive work through import, OCR-assisted entry, reusable merchant/category patterns and automated insights.
- Earlier awareness of budget pressure, unusual payments and upcoming recurring obligations.
- Clearer understanding of where money is spent, what can be changed and how changes could influence goals.
- Greater confidence in expense decisions through evidence-based, explainable insights.

### Academic and Technical Outcomes

- A working full-stack project with integrated frontend, backend, database and AI/ML components.
- Demonstrable dynamic behaviour: adding/importing a transaction changes calculations, charts, budgets, alerts and reports.
- A practical example of secure user-data isolation, API-based integration and responsible AI principles.

---

## 11. Future Scope

- Consent-based bank/UPI account aggregation where supported by providers and regulations.
- Family/roommate shared budgets, bill splitting and multi-user permissions.
- Native Android/iOS applications with biometric authentication and offline queueing.
- Multi-language interface and voice transaction capture.
- Investment price feeds for portfolio tracking only, with clear market-data disclaimers.
- Deeper receipt itemization, GST/tax organization and accountant-ready exports.
- Personalized engagement features such as saving challenges and progress milestones.
- Improved models trained using privacy-preserving methods and user-approved data.

---

## 12. Integration Checklist for the Team

Every approved feature described here must map to a page, API, data model and test case before it is marked complete.

| Feature | UI owner requirement | Technical owner requirement | Acceptance evidence |
|---|---|---|---|
| Add transaction | Form, validation feedback, success/error/loading states | Persist via API, validate server-side, update summaries | New transaction appears in list and dashboard totals change |
| Category suggestion | Suggested category, confidence and override control | Classification endpoint/model and feedback storage | Corrected category is saved and used in analytics |
| Budget alert | Budget progress and alert centre | Threshold calculation and notification record | Alert appears when threshold is crossed |
| Recurring/subscription detector | Subscription review, confirm/ignore controls | Pattern detection, recurrence records and annual-cost calculation | Confirmed item appears in calendar and summary |
| Anomaly detection | Alert explanation and dismiss/verify actions | Baseline calculation, anomaly record and audit status | Alert shows measurable comparison |
| Forecast | Prediction card with uncertainty/insufficient-data state | Forecast pipeline and stored results | Forecast updates after eligible new data |
| What-if simulator | Parameter input and scenario output | Read-only calculation service; no accidental data mutation | Scenario does not change actual totals |
| AI assistant | Chat UI with source/time-period display | Authorized, constrained data query and safe fallback | Answer is tied to user data or says data is unavailable |

---

## 13. Acceptance Criteria for MVP

The MVP is accepted only when all of the following work end-to-end:

- A user can register, log in and access only their own data.
- A user can create accounts and add, edit, delete, search and filter transactions.
- Transaction data is stored in the database and dashboard/analytics values are calculated dynamically.
- Users can create budgets and receive threshold alerts.
- CSV import functions with validation and duplicate warnings.
- At least one intelligent workflow is demonstrably functional: category suggestion, recurring detection, anomaly alert or forecast.
- The selected intelligent workflow provides an explanation, safe failure state and no fabricated result when data is insufficient.
- Reports/export and responsive UI operate with real user-specific data.
- Error, empty, loading and unauthorized states are handled without raw technical errors.

---

## 14. Glossary

| Term | Meaning |
|---|---|
| Account | A source or container of money/financial value, such as cash, bank, card or investment record |
| Anomaly | A transaction or trend that significantly differs from an individual's usual pattern |
| Demat account | An account used to hold securities electronically in India |
| Financial Health Score | Transparent indicator summarizing selected money-management behaviours; not a credit score |
| Recurring expense | A transaction likely to repeat at regular or near-regular intervals |
| Subscription leak | A recurring payment that may be forgotten, unwanted or disproportionately costly |
| UPI | Unified Payments Interface, an Indian instant-payment system |
| What-if simulator | A non-destructive tool for estimating results of hypothetical spending changes |

---

## 15. Document Ownership

Member 1 owns the problem definition, scope, requirements, use cases, constraints, assumptions, outcomes and acceptance criteria in this document. Member 2, Member 3 and Member 4 must review it to ensure AI features, UI flows and technical implementation remain aligned.
