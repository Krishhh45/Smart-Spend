# SMARTSPEND — WEBSITE UI/UX & STITCH DESIGN SPECIFICATION

> **Role:** Member 3 — Frontend UI/UX  
> **Purpose:** Complete visual, interaction, responsive and accessibility specification for the Expense Management System.  
> **Primary design tool:** Google Stitch / Stitch MCP  
> **Product direction:** Clean, attractive, premium fintech experience with meaningful animations and a polished background system.

---

# 1. Product Identity

## Product Name

**SMARTSPEND**

## Tagline

**Your money. Clearly understood.**

## Product Description

SmartSpend is a modern personal finance management web application that helps users record transactions, understand spending patterns, manage budgets, monitor upcoming financial obligations, view predictions, and interact with an AI financial assistant.

SmartSpend must NOT look like a generic expense tracker or an ordinary admin dashboard.

The visual experience should communicate:

- Simplicity
- Trust
- Intelligence
- Financial clarity
- Modern technology
- Premium quality

The user should understand their financial situation within approximately **5 seconds** of opening the dashboard.

---

# 2. Core UI/UX Philosophy

The interface follows five principles:

## 2.1 Clean

Use whitespace, strong hierarchy and limited visual noise.

## 2.2 Attractive

Use polished cards, subtle gradients, elegant charts, meaningful illustrations and refined micro-interactions.

## 2.3 Intelligent

AI insights should appear naturally inside the financial experience instead of looking like a separate chatbot feature.

## 2.4 Fast

Important actions such as adding an expense should require minimal interaction.

## 2.5 Consistent

Every page must look like part of the same product.

---

# 3. Visual Style

## Overall Style

Use a **Clean Premium Fintech + Soft Aurora** visual style.

The interface should combine:

- Warm light surfaces
- Deep navy text
- Soft blue/violet accents
- Subtle aurora background effects
- Rounded cards
- Thin borders
- Soft shadows
- Modern charts
- Smooth animations

Avoid:

- Heavy glassmorphism
- Excessive neon
- Crypto-dashboard styling
- Excessive gradients
- Crowded dashboards
- Very dark pages everywhere
- Generic Bootstrap layouts

---

# 4. Background Design

The background is an important part of the visual identity.

## Main Application Background

Use a very light neutral background rather than plain white.

Recommended concept:

```text
Soft off-white / very light cool gray
+
subtle blue-violet ambient glow
+
very faint radial gradients
```

Example visual treatment:

```text
Top-left:
soft indigo glow

Top-right:
very subtle violet glow

Center:
mostly neutral

Bottom:
very subtle blue tint
```

The background must remain readable behind cards.

## Aurora Background

Use extremely subtle blurred gradient blobs.

Example:

```text
        Soft Indigo Glow
              ◉

                    Soft Violet Glow
                          ◉


             MAIN CONTENT


    Soft Blue Glow
          ◉
```

Rules:

- Blur heavily
- Low opacity
- Slow movement
- Never distract from financial data
- Never reduce text contrast

## Dashboard Background

The dashboard can have a slightly more expressive background than internal pages.

Use:

- Soft radial gradients
- Very subtle grid/dot texture
- Ambient blurred shapes

The effect should be visible but understated.

---

# 5. Color System

Use a restrained palette.

## Primary

**Indigo / Electric Blue**

Used for:

- Primary buttons
- Active navigation
- Links
- Important highlights
- Selected states

## Secondary

**Soft Violet**

Used for:

- AI-related elements
- Secondary highlights
- Aurora effects

## Positive

**Emerald Green**

Used for:

- Income
- Savings
- Positive financial changes
- Successful actions

## Warning

**Amber**

Used for:

- Budget nearing limit
- Upcoming payments
- Attention-required states

## Negative

**Coral / Red**

Used for:

- Expenses
- Budget exceeded
- Errors
- Destructive actions

## Neutrals

Use:

- Warm white
- Light gray
- Medium gray
- Slate
- Deep navy

Important:

Do not use color alone to communicate meaning. Pair status colors with icons, labels or text.

---

# 6. Typography

## Primary Font

Use:

**Inter**

Alternative:

**Manrope**

## Typography Hierarchy

```text
Display / Hero:
40–64px

Page Heading:
28–36px

Section Heading:
20–24px

Card Heading:
16–18px

Body:
14–16px

Secondary:
12–14px

Financial Numbers:
28–44px
```

Financial values should be visually strong.

Example:

```text
TOTAL BALANCE

₹42,850
```

The amount should have greater visual weight than the label.

---

# 7. Spacing System

Use a consistent spacing scale:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Cards should generally use:

```text
Padding: 20–28px
Gap: 16–24px
```

Avoid inconsistent spacing between sections.

---

# 8. Border Radius

Recommended:

```text
Small controls: 8–10px
Buttons: 10–12px
Inputs: 10–12px
Cards: 18–22px
Large feature cards: 24px
Modal: 20–24px
```

Use rounded corners consistently.

Do not make every tiny UI element extremely pill-shaped.

---

# 9. Shadows

Use soft shadows only.

Example concept:

```text
Very low opacity
Large blur
Small vertical offset
```

Cards should appear elevated without looking floating or heavy.

---

# 10. Design Tokens

Define reusable tokens in the frontend.

```text
--color-primary
--color-primary-hover
--color-success
--color-warning
--color-danger
--color-background
--color-surface
--color-text-primary
--color-text-secondary
--color-border

--radius-sm
--radius-md
--radius-lg
--radius-xl

--space-xs
--space-sm
--space-md
--space-lg
--space-xl

--shadow-sm
--shadow-md
--shadow-lg
```

All pages should reuse the same tokens.

---

# 11. Global Application Layout

Desktop layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo / Page Context       Search     Notification   Profile │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  Sidebar     │               Main Workspace                  │
│              │                                               │
│  Overview    │                                               │
│  Transactions│                                               │
│  Analytics   │                                               │
│  Budgets     │                                               │
│  Predictions │                                               │
│  AI          │                                               │
│  Calendar    │                                               │
│  Accounts    │                                               │
│  Reports     │                                               │
│              │                                               │
│  Settings    │                                               │
│  Profile     │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

The layout must feel spacious rather than compressed.

---

# 12. Sidebar Design

## Navigation

```text
Overview
Transactions
Add Transaction
Analytics
Budgets
Predictions
AI Companion
Calendar
Accounts
Reports
```

Secondary:

```text
Profile
Settings
```

## Active Item

Do not use a large aggressive filled block.

Use:

- Soft accent background
- Small active indicator
- Accent icon
- Slight text weight increase

## Sidebar Animation

When hovering:

- Background fades in
- Icon moves 1–2px
- Label becomes slightly stronger

Transition duration:

**150–220ms**

---

# 13. Top Bar

Top bar contains:

- Current page title/context
- Global search
- Notification button
- Profile avatar
- Optional month/date selector

The top bar should remain visually light.

On mobile:

- Hamburger menu
- Page title
- Notification icon
- Avatar

---

# 14. Buttons

## Primary Button

Use for:

- Add Transaction
- Save
- Create Budget
- Generate Report
- Ask AI

Interaction:

```text
Default
↓
Hover
↓
Pressed
↓
Loading
↓
Success
```

### Button Animation

On hover:

- Slight upward movement
- Soft shadow increase
- Background transition

On click:

- Tiny scale-down effect

Loading:

```text
[ spinner ] Saving...
```

Success:

```text
✓ Saved
```

---

# 15. Cards

Cards should have:

- Surface background
- Thin border
- Soft shadow
- 18–22px radius
- Consistent internal padding

Cards can support:

- Hover elevation
- Subtle border highlight
- Number animations
- Expand/collapse

Do not animate every card continuously.

---

# 16. Forms

Every form must include:

- Label
- Input
- Optional helper text
- Validation
- Error message
- Clear submit action

Example:

```text
Amount *
[ ₹ 5,000 ]

Category *
[ Food ]

Date *
[ 08 Sep 2026 ]

Account *
[ HDFC Savings ]

Description
[ Dinner ]

[Cancel] [Save Transaction]
```

---

# 17. Charts

Charts must be:

- Minimal
- Easy to understand
- Responsive
- Interactive
- Accessible

Required chart types:

- Line chart
- Bar chart
- Doughnut chart
- Progress ring
- Spending heatmap
- Budget comparison

Chart animations should be short and subtle.

---

# 18. Animation System

Animations are required but must remain professional.

## General Duration

```text
Micro interaction:
120–200ms

Component transition:
200–300ms

Page transition:
250–400ms

Chart entrance:
500–800ms

Large visual entrance:
600–1000ms
```

## Easing

Prefer smooth ease-out transitions.

## Page Entrance

Use:

```text
opacity: 0 → 1
transform: translateY(8px) → 0
```

Avoid dramatic page transitions.

## Card Entrance

Cards can appear sequentially with a very small stagger.

Example:

```text
Card 1 → 0ms
Card 2 → 60ms
Card 3 → 120ms
Card 4 → 180ms
```

Do not make users wait for content.

---

# 19. Number Animations

Financial summary numbers can animate when loaded.

Example:

```text
₹0
↓
₹8,500
↓
₹24,500
↓
₹42,850
```

Use short count-up animation.

Respect reduced-motion preferences.

---

# 20. Chart Animations

Charts should:

- Draw smoothly
- Fade in
- Reveal tooltips naturally
- Avoid continuous looping

Do not repeatedly animate charts after page load.

---

# 21. AI Animation

AI elements should have subtle motion.

Example:

```text
✨ SmartSpend Insight
```

Possible animation:

- Soft glow
- Gentle opacity pulse
- Small sparkle entrance

Never use flashing or distracting AI animations.

---

# 22. Dashboard `/dashboard`

## Purpose

The dashboard is the user's financial command center.

It should provide an immediate overview.

---

## Dashboard Header

```text
Good morning, Krish

Here's how your money is doing.

[ September 2026 ▼ ]
```

Right:

```text
🔔
Profile
```

---

# 23. Dashboard Hero Area

Use a large but clean financial overview.

## Financial Health Card

```text
┌─────────────────────────────────────────┐
│ FINANCIAL HEALTH                        │
│                                         │
│               ◯                         │
│              82                         │
│            Healthy                      │
│                                         │
│ Spending   Savings   Budget   Consistency│
└─────────────────────────────────────────┘
```

Use a circular progress visualization.

---

# 24. Balance Overview

```text
TOTAL AVAILABLE

₹42,850

+₹8,500 this month

Mini balance trend
```

The card may use a very subtle accent gradient.

---

# 25. Income / Expense / Savings

Create a clean horizontal financial summary:

```text
Income
₹65,000

Expenses
₹31,420

Savings
₹33,580
```

Use clear visual distinction.

---

# 26. Cash Flow Chart

Large interactive chart.

Controls:

```text
7D
1M
3M
6M
1Y
```

Show:

- Income
- Expenses
- Net cash flow

Tooltip example:

```text
September 8

Income     ₹5,000
Expenses   ₹1,800
Net        +₹3,200
```

---

# 27. Spending Categories

Use a ranked horizontal visualization.

```text
Food

██████████████
₹8,200     28%

Bills

███████████
₹7,400     24%

Transport

██████
₹4,100     14%
```

Clicking a category opens analytics filtered to that category.

---

# 28. Spending Heatmap Preview

Show a small weekly/monthly spending heatmap on the dashboard.

This gives users a visual understanding of spending frequency.

Hover:

```text
Saturday, Sep 6

₹2,450 spent
```

---

# 29. Smart Insights

Use an AI insight card.

Example:

```text
✨ SMARTSPEND INSIGHT

Your weekend spending is 31% higher
than your weekday average.

[View Analysis] [Ask SmartSpend]
```

The card should have a subtle violet/blue ambient background.

---

# 30. Upcoming Payments

Show the next obligations.

```text
Credit Card
₹8,500
Due Friday

Insurance
₹4,200
Due Sep 18

Subscription
₹799
Due Sep 22
```

Use urgency indicators.

---

# 31. Recent Transactions

Default dashboard view should be a timeline.

```text
TODAY

Swiggy
Food
-₹420

Electricity
Bills
-₹2,100


YESTERDAY

Salary
Income
+₹65,000
```

Button:

```text
View all transactions →
```

---

# 32. Landing Page `/`

## Hero

Headline:

**Your money. Clearly understood.**

Supporting text:

Track spending, plan budgets, understand patterns and make smarter financial decisions.

Buttons:

```text
[Get Started]
[Explore Features]
```

## Visual

Hero should include a floating preview of the financial dashboard.

Use subtle floating animation.

---

# 33. Landing Page Background

Use:

- Soft aurora gradient
- Very subtle grid/dot pattern
- Floating translucent financial shapes
- Gentle blur

Do not overload the hero.

---

# 34. Landing Page Sections

## Features

Six feature cards:

- Smart Expense Tracking
- Budget Intelligence
- Spending Analytics
- Financial Predictions
- AI Companion
- Financial Reports

## How It Works

```text
01 Create account
02 Add accounts
03 Track transactions
04 Understand spending
05 Improve financial decisions
```

## Final CTA

```text
Ready to understand your money?

[Start with SmartSpend]
```

---

# 35. Login `/login`

Use a split layout on desktop.

Left:

- Brand
- Tagline
- Minimal financial illustration

Right:

- Login form

Form:

```text
Email
Password

☐ Remember me

[Login]

Forgot password?

Don't have an account?
Create account
```

Mobile should use a single-column layout.

---

# 36. Register `/register`

Fields:

```text
Full Name
Email
Password
Confirm Password
```

Include password strength indicator.

Example:

```text
Weak
Medium
Strong
```

Success animation:

- Check icon
- Short confirmation
- Redirect

---

# 37. Transactions `/transactions`

Page title:

**Money Activity**

Header actions:

```text
[Search]
[Filter]
[Timeline]
[Table]
[+ Add Transaction]
```

---

# 38. Timeline View

Group by:

```text
Today
Yesterday
Earlier this week
Earlier this month
```

Each transaction:

- Merchant
- Category
- Account
- Date
- Amount

Hover:

- Background highlight
- View details affordance

---

# 39. Table View

Columns:

```text
Date
Transaction
Category
Account
Type
Amount
Status
Actions
```

Support:

- Search
- Sort
- Filter
- Pagination

---

# 40. Transaction Detail Drawer

Clicking a transaction opens a right-side drawer.

Show:

```text
Merchant
Amount
Category
Account
Date
Payment method
Description
```

Additional:

```text
Monthly impact
Similar transactions
```

Actions:

```text
Edit
Delete
```

Desktop:

Right drawer.

Mobile:

Bottom sheet.

---

# 41. Add Transaction `/transactions/add`

Do not make this feel like a long accounting form.

Use a focused transaction composer.

## Step 1 — What happened?

Large amount:

```text
₹ 0.00
```

Toggle:

```text
Expense | Income
```

## Step 2 — Details

```text
Category
Account
Date
Payment method
Description
```

## Category Chips

```text
Food
Transport
Shopping
Bills
Medical
Investment
Credit Card
Other
```

---

# 42. Smart Category Suggestion

After the user enters a description:

```text
Coffee and snacks

Suggested category:
Food & Dining

[Use suggestion]
```

The suggestion should never block the user.

---

# 43. Analytics `/analytics`

Title:

**Understand your spending.**

Controls:

```text
Date range
Category
Account
Compare with previous period
```

---

# 44. Analytics Hero Metrics

```text
Average transaction
₹640

Highest spending category
Food

Most expensive day
Saturday

Monthly change
+14%
```

---

# 45. Spending Trend

Large chart.

Switch:

```text
Weekly
Monthly
Yearly
```

Animate chart entrance once.

---

# 46. Category Intelligence

Rank categories.

Example:

```text
01 Food
₹8,420
28%

02 Bills
₹7,200
24%

03 Transport
₹4,100
14%
```

Click category:

Navigate/filter to category details.

---

# 47. Spending Heatmap

Create a GitHub-style but financial-purpose heatmap.

Meaning:

- Very low spending
- Low spending
- Medium spending
- High spending
- Very high spending

Include a legend.

Never rely only on color.

---

# 48. Budget `/budget`

Title:

**Budget Health**

Top:

```text
Monthly Budget
₹40,000

Spent
₹31,200

Remaining
₹8,800
```

---

# 49. Budget Category Cards

Example:

```text
Food

₹4,100 / ₹5,000

82%

₹900 remaining
```

Use circular progress or horizontal progress.

---

# 50. Budget States

## Normal

```text
82% used
₹900 remaining
```

## Warning

```text
91% used
Budget almost exhausted
```

## Exceeded

```text
108% used

Budget exceeded by ₹400
```

Use icon + text + status.

---

# 51. Create Budget

Use a guided modal:

```text
Step 1
Choose category

Step 2
Set amount

Step 3
Set period

Step 4
Confirm
```

Include progress indicator.

---

# 52. Predictions `/predictions`

Title:

**Where is your money heading?**

Main metrics:

```text
Expected next-month expenses
₹34,800

Expected savings
₹15,200
```

---

# 53. Prediction Timeline

```text
TODAY
  ↓
NEXT WEEK
  ↓
NEXT MONTH
  ↓
NEXT 3 MONTHS
```

Show expected spending at each point.

---

# 54. Prediction Confidence

Every prediction should show:

```text
High confidence
Medium confidence
Low confidence
```

Do not present predictions as guaranteed.

Example:

> Based on your transaction history from the last four months.

---

# 55. AI Companion `/assistant`

Do not copy the generic ChatGPT interface.

Create a dedicated **financial intelligence workspace**.

Header:

```text
Ask SmartSpend

Understand your money in plain language.
```

---

# 56. AI Quick Actions

Display cards:

```text
Where did my money go this month?

How can I save ₹5,000?

What subscriptions am I paying for?

Am I overspending?

Compare this month with last month.
```

---

# 57. AI Responses

AI responses can contain:

- Text
- Financial metrics
- Mini charts
- Recommendation cards
- Transaction references
- Action buttons

Example:

```text
Your expenses increased by 14%.

Main contributors:

Food        +₹1,800
Shopping    +₹1,200
Travel      +₹900

[Explore spending]
```

---

# 58. AI Loading

Use subtle typing/processing animation.

Example:

```text
✨ Analyzing your spending...
```

Do not use an endless spinner.

---

# 59. AI Unavailable

```text
SmartSpend AI is temporarily unavailable.

Your financial dashboard is still available.

[Try Again]
```

---

# 60. Calendar `/calendar`

Title:

**Financial Calendar**

Events:

- Bills
- Insurance
- Credit card
- Subscription
- EMI
- Income
- Investments

Click an event:

Open detail drawer/bottom sheet.

---

# 61. Accounts `/accounts`

Title:

**Money Sources**

Account cards:

```text
HDFC Savings

₹42,500

Savings Account
•••• 2841
```

```text
Credit Card

₹8,420 due

•••• 9214
```

```text
Demat / Investment

₹1,25,000

Investment Account
```

---

# 62. Add Account

Fields:

```text
Account name
Account type
Institution
Current balance
```

Account types:

```text
Bank
Credit Card
Debit Card
Cash
Investment / Demat
Other
```

Do not unnecessarily display sensitive account information.

---

# 63. Reports `/reports`

Title:

**Financial Reports**

Report cards:

```text
Monthly Summary
Expense Breakdown
Budget Performance
Income Report
Account Report
```

Actions:

```text
View
Export PDF
Export CSV
```

---

# 64. Report Preview

Show:

```text
Total Income
Total Expenses
Savings
Top Categories
Budget Performance
Transaction Summary
```

Use professional document-like formatting.

---

# 65. Profile `/profile`

Show:

```text
Profile avatar
Full name
Email
Currency
Default account
Financial preferences
```

Actions:

```text
Edit Profile
Save Changes
```

---

# 66. Settings `/settings`

Sections:

## Appearance

```text
Light
Dark
System
```

## Currency

```text
INR
USD
EUR
```

## Notifications

```text
Budget alerts
Payment reminders
AI insights
```

## Security

```text
Change password
Logout
```

## AI Preferences

```text
Enable financial insights
Show prediction explanations
```

## Data & Privacy

```text
Export data
Delete account
```

---

# 67. Command Palette

Shortcut:

**Ctrl + K**

Open a centered command interface.

Example:

```text
┌───────────────────────────────────────┐
│ Search SmartSpend...                  │
├───────────────────────────────────────┤
│ + Add Transaction                     │
│ 📊 Open Analytics                     │
│ 💰 Check Budget                       │
│ 🤖 Ask SmartSpend                     │
│ 📄 Generate Report                    │
└───────────────────────────────────────┘
```

Support keyboard navigation.

---

# 68. Quick Add

Global floating action button:

```text
+
```

Options:

```text
Add Expense
Add Income
Add Budget
Add Reminder
```

Desktop:

Floating button or top action.

Mobile:

Prominent bottom-center action.

---

# 69. Notifications

Notification center should show:

```text
Budget almost exceeded
Food budget reached 85%

Upcoming payment
Insurance due in 3 days

SmartSpend Insight
Your weekend spending increased
```

Use severity:

```text
Info
Warning
Success
Action required
```

---

# 70. Toast Notifications

Success:

```text
✓ Transaction added successfully.
```

Error:

```text
Unable to save transaction.
Try again.
```

Warning:

```text
Food budget is almost exhausted.
```

Information:

```text
Your report is ready.
```

Toasts should animate in/out quickly.

---

# 71. Empty States

Never show a blank screen.

## No Transactions

```text
No money activity yet.

Add your first transaction and SmartSpend
will begin understanding your spending.

[+ Add Transaction]
```

## No Analytics

```text
We need a little more history.

Add a few transactions to unlock
spending insights.
```

## No Predictions

```text
Predictions will appear after enough
transaction history is available.

[Add Transaction]
```

## No Accounts

```text
Connect your first financial account
to start organizing your money.

[Add Account]
```

---

# 72. Loading States

Use skeleton loading rather than blocking spinners.

Dashboard:

```text
Skeleton summary cards
Skeleton chart
Skeleton insights
Skeleton transaction list
```

Charts should show a simple placeholder shape.

---

# 73. Error States

Use calm, human-readable errors.

Bad:

```text
500 INTERNAL SERVER ERROR
```

Good:

```text
We couldn't load your financial data.

Please try again.

[Try Again]
```

---

# 74. Database Error

```text
Your financial data couldn't be retrieved.

Please try again in a moment.

[Retry]
```

---

# 75. Budget Exceeded State

```text
⚠ Budget exceeded

You have exceeded your Shopping budget
by ₹750.

[View Budget]
```

---

# 76. Responsive Design

## Desktop — 1200px+

```text
Fixed sidebar
Multi-column dashboard
4 metric cards where appropriate
2-column charts
Full transaction table
Contextual right drawer
```

## Laptop — 992–1199px

```text
Compact sidebar
2–4 metric cards
2-column charts where space permits
Scrollable tables
```

## Tablet — 768–991px

```text
Collapsible sidebar
2-column cards
Single-column charts
Horizontal table scrolling
```

## Mobile — below 768px

```text
Sidebar becomes drawer
Bottom navigation
Single-column cards
Full-width charts
Transaction table becomes cards
Drawers become bottom sheets
Forms become single-column
```

---

# 77. Mobile Navigation

Use:

```text
Home
Transactions
Add
Analytics
More
```

The Add action should be visually prominent.

More menu contains:

```text
Budget
Predictions
AI
Calendar
Accounts
Reports
Profile
Settings
```

---

# 78. Mobile Dashboard

Order content:

```text
Greeting
Financial Health
Balance
Income/Expense
Spending chart
Smart insight
Upcoming payments
Recent transactions
```

Do not force desktop layouts onto mobile.

---

# 79. Mobile Add Transaction

Prioritize speed.

```text
₹ 500

Expense

Food

HDFC Savings

Today

[Save]
```

Advanced fields:

```text
More details
```

This keeps the primary workflow extremely fast.

---

# 80. Drawer and Bottom Sheet Rules

Desktop:

Use right-side drawers for details.

Mobile:

Use bottom sheets.

Examples:

- Transaction details
- Account details
- Notifications
- Filters
- AI explanation

---

# 81. Accessibility

The application must include:

- Good text/background contrast
- Keyboard navigation
- Visible focus states
- Clear labels
- Semantic HTML
- Accessible forms
- Meaningful validation
- Screen-reader-friendly structure
- ARIA labels where required
- Accessible chart descriptions
- Non-color-only status indicators

---

# 82. Reduced Motion

Respect:

```text
prefers-reduced-motion
```

When enabled:

- Disable large entrance animations
- Reduce chart animations
- Disable decorative floating motion
- Keep functional transitions minimal

---

# 83. Interaction Rules

Every important user action needs feedback.

Example:

```text
Click Save
↓
Button enters loading
↓
API completes
↓
Success toast
↓
Updated UI
```

Delete:

```text
Delete
↓
Confirmation
↓
Deleting...
↓
Removed
↓
Undo toast if possible
```

---

# 84. Delete Confirmation

Never immediately delete important financial records without confirmation.

Example:

```text
Delete transaction?

This transaction will be permanently removed.

[Cancel] [Delete]
```

---

# 85. Search

Global search should support:

- Transaction names
- Categories
- Accounts
- Reports

Show results grouped by type.

---

# 86. Filters

Use reusable filter components.

Filters:

```text
Date
Category
Account
Payment method
Transaction type
Amount
```

Mobile:

Open filters in a bottom sheet.

---

# 87. Financial Status Language

Use consistent terminology.

Income:

```text
Received
+₹X
```

Expense:

```text
Spent
-₹X
```

Budget:

```text
Remaining
Almost reached
Exceeded
```

Prediction:

```text
Estimated
Expected
Projected
```

Avoid presenting predictions as facts.

---

# 88. Security-Oriented UI

Do not expose unnecessary sensitive details.

Mask account numbers:

```text
•••• 2841
```

For sensitive sections, consider:

```text
Show
Hide
```

Never show passwords.

---

# 89. Design Component Library

Create reusable components:

```text
AppShell
Sidebar
Topbar
MobileNavigation
Button
IconButton
Card
MetricCard
InsightCard
AccountCard
BudgetCard
TransactionItem
TransactionTable
TransactionDrawer
ChartCard
ProgressRing
Heatmap
Modal
BottomSheet
Input
Select
DatePicker
FilterBar
SearchBar
Toast
NotificationCenter
EmptyState
ErrorState
Skeleton
AIChat
CommandPalette
ConfirmDialog
```

---

# 90. Suggested Frontend Structure

```text
src/
│
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── cards/
│   ├── charts/
│   ├── forms/
│   ├── transactions/
│   ├── budgets/
│   ├── accounts/
│   ├── ai/
│   ├── notifications/
│   └── common/
│
├── pages/
│   ├── LandingPage
│   ├── Login
│   ├── Register
│   ├── Dashboard
│   ├── Transactions
│   ├── AddTransaction
│   ├── Analytics
│   ├── Budget
│   ├── Predictions
│   ├── Assistant
│   ├── Calendar
│   ├── Accounts
│   ├── Reports
│   ├── Profile
│   └── Settings
│
├── hooks/
├── services/
├── utils/
├── styles/
└── assets/
```

---

# 91. Stitch Generation Rules

Stitch should generate the UI consistently.

## Rule 1

First create the **design system**.

## Rule 2

Create the **dashboard** as the visual source of truth.

## Rule 3

Every following page must reuse:

- Typography
- Colors
- Spacing
- Border radius
- Cards
- Buttons
- Navigation
- Icon style
- Shadows
- Animation language

## Rule 4

Do not redesign the sidebar independently for every screen.

## Rule 5

Do not introduce unrelated colors.

## Rule 6

Do not create unnecessary components.

## Rule 7

Keep financial data visually dominant.

---

# 92. Stitch Generation Order

Generate in this exact sequence:

```text
01 Design System
        ↓
02 Landing Page
        ↓
03 Login
        ↓
04 Register
        ↓
05 Dashboard
        ↓
06 Add Transaction
        ↓
07 Transactions
        ↓
08 Analytics
        ↓
09 Budget
        ↓
10 Predictions
        ↓
11 AI Companion
        ↓
12 Calendar
        ↓
13 Accounts
        ↓
14 Reports
        ↓
15 Profile
        ↓
16 Settings
        ↓
17 Mobile Responsive Pass
        ↓
18 Interaction / Animation Pass
        ↓
19 Accessibility Pass
        ↓
20 Final Consistency Pass
```

---

# 93. Stitch Master Prompt

Use the following as the master visual instruction:

> Design a premium, clean personal finance web application named **SmartSpend**. It should feel like a modern fintech product rather than a generic expense tracker or admin dashboard. Use a light warm-neutral application background with extremely subtle blue and violet aurora glows, white elevated cards, deep navy typography, restrained indigo/blue primary accents, emerald positive states, amber warnings and coral negative states. Use Inter or Manrope typography, generous whitespace, 18–24px card corners, thin borders and soft shadows. The interface must be highly readable and data-focused.
>
> Create a polished dashboard with financial health, balance, income, expenses, savings, cash-flow visualization, category spending, a spending heatmap, upcoming financial obligations, recent transaction timeline and an AI-powered SmartSpend Insight card. Use meaningful micro-interactions: subtle hover elevation, button press feedback, smooth drawer transitions, count-up financial values, chart entrance animations and gentle AI insight motion. Do not use excessive gradients, neon colors, heavy glassmorphism or crypto aesthetics.
>
> Maintain one unified design system across all screens. The application must be responsive for desktop, laptop, tablet and mobile. On mobile, use a bottom navigation bar, compact cards, full-width charts, transaction cards and bottom sheets. Respect reduced-motion preferences and accessibility requirements.
>
> The overall result should feel **clean, premium, trustworthy, intelligent and hackathon-ready**, with strong visual hierarchy and excellent UX.

---

# 94. Page Quality Checklist

Before considering any page complete, verify:

## Visual

- [ ] Consistent colors
- [ ] Consistent typography
- [ ] Consistent card style
- [ ] Consistent spacing
- [ ] Consistent icons
- [ ] Clean background
- [ ] No visual clutter

## UX

- [ ] Primary action is obvious
- [ ] Navigation is clear
- [ ] Forms are understandable
- [ ] User gets feedback
- [ ] Empty state exists
- [ ] Loading state exists
- [ ] Error state exists

## Responsive

- [ ] Desktop
- [ ] Laptop
- [ ] Tablet
- [ ] Mobile

## Accessibility

- [ ] Keyboard navigation
- [ ] Labels
- [ ] Focus states
- [ ] Contrast
- [ ] Meaningful errors
- [ ] Screen reader support
- [ ] Reduced motion

---

# 95. Final User Experience

The final product should feel like:

**Premium Fintech + Personal Intelligence + Simplicity**

The user journey should be:

```text
Landing
   ↓
Register / Login
   ↓
Financial Setup
   ↓
Dashboard
   ↓
Add Transactions
   ↓
Understand Spending
   ↓
Manage Budgets
   ↓
See Predictions
   ↓
Ask SmartSpend AI
   ↓
Track Upcoming Payments
   ↓
Generate Reports
```

The interface should always answer three questions:

```text
Where is my money?

Where is my money going?

What should I do next?
```

---

# 96. Member 3 Responsibility

Member 3 owns the complete frontend experience.

Responsibilities:

- Define design system
- Define visual identity
- Define page structure
- Define navigation
- Define reusable components
- Define forms
- Define tables
- Define charts
- Define interactions
- Define animations
- Define loading states
- Define success states
- Define errors
- Define empty states
- Define responsive behavior
- Define accessibility
- Maintain visual consistency across all screens

## Final Responsibility Statement

> **Member 3 defines exactly WHAT the user sees, HOW the interface looks, HOW it behaves, HOW it responds to user actions, and HOW it adapts across devices.**
