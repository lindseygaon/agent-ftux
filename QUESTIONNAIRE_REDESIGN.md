# Redesigned Questionnaire Flow

## Step 0: Introduction & Upload
**Upload Your Expense Policy**
"Upload your employee expense policy document. We'll help you create audit rules and review instructions that enforce your policy."

[File upload]

---

## Step 1: Policy Confirmation (Auto-extracted from uploaded document)

**"We extracted these key values from your policy. Confirm or adjust:"**

### Amount Thresholds
- Receipt required above: $**75** (detected from policy)
- Per diem limit: $**75** (detected from policy)
- Hotel per night limit: $**___** (enter if applicable)
- Gift limit: $**___** (enter if applicable)

### Expense Categories
"We found these expense categories in your policy. Which should be monitored for violations?"

Select all that apply:
- [x] Travel & lodging *(detected)*
- [x] Meals & entertainment *(detected)*
- [x] Ground transportation *(detected)*
- [ ] Equipment & office supplies
- [x] Events & offsites *(detected)*
- [ ] Client gifts & entertainment
- [ ] Software subscriptions
- [ ] Professional development

---

## Step 2: Risk Tolerance (Sets default thresholds)

**"What's your tolerance for policy violations?"**

This determines default thresholds for all subsequent questions.

- [ ] **Strict** — Flag any deviation from policy
  - Creates more cases, catches minor violations
  - Recommended for: Organizations with tight compliance requirements

- [ ] **Balanced** — Flag clear violations and patterns *(Recommended)*
  - Focus on meaningful violations and repeated issues
  - Recommended for: Most organizations

- [ ] **Lenient** — Only flag fraud and significant violations
  - Creates fewer cases, focuses on high-impact issues
  - Recommended for: Small teams with limited review capacity

*This will pre-populate suggested thresholds in the questions below. You can adjust any threshold.*

---

## Part 1: Audit Rules (What Creates Cases)

### Step 3: Universal Rules (Always Asked)

These rules apply regardless of expense categories.

#### Fraud Detection (Always Monitored)
**"These fraud signals are always flagged. Confirm you want to detect:"**
- [x] Duplicate receipts (same receipt submitted multiple times)
- [x] AI-generated or modified receipts
- [x] Receipt amount mismatches (claimed > receipt amount)
- [x] Cash-equivalent purchases (gift cards, money transfers, crypto)
- [x] Split transactions (multiple charges just below approval threshold)

#### Spending Patterns
**"Should we flag these spending patterns?"**

**Spending anomalies:**
- Flag when user spends >2x their historical average? **Yes** / No

**Geographic mismatches:**
- Flag spend in distant locations with no travel context? **Yes** / No
- Above amount: $**100** *(auto-filled based on risk tolerance)*

**Late submissions:**
- Flag expenses submitted more than **30** days after transaction *(auto-filled)*

**New vendors:**
- Flag first-time vendor spend above: $**500** *(auto-filled)*

**Repeat violations:**
- Flag when same user has cumulative violations above: $**500** *(auto-filled)*

#### Amount Thresholds (Universal)
**"At what amounts should violations trigger cases?"**

*These values are auto-filled based on your risk tolerance. Adjust as needed.*

**High-priority** (immediate escalation):
- Single violation over: $**500** *(auto-filled)*

**Medium-priority** (investigate):
- Large single transaction: $**1,000** *(auto-filled)*
- Missing receipt above: $**150** *(auto-filled)*
- Missing memo/business purpose above: $**150** *(auto-filled)*

**Low-priority** (pattern monitoring):
- Small violation threshold: $**100** *(auto-filled)*
- Pattern threshold (cumulative): $**150** *(auto-filled)*

---

### Step 4: Category-Specific Rules (Conditional)

*Only shown for categories selected in Step 1.*

#### Travel & Lodging
*(Only shown if "Travel & lodging" selected)*

**Managed travel tool:**
- Which travel bookings should be flagged if made outside your managed travel tool?
  - [ ] All (flights + hotels)
  - [x] Hotels only *(recommended based on your policy)*
  - [ ] Flights only
  - [ ] None (not applicable)

**Flight policies:**
- Flag flight upgrades on flights <6 hours? **Yes** / No
- Flag flights booked personally instead of through corporate tool? **Yes** / No

**Hotel policies:**
- Flag hotel stays with no corresponding trip/travel context? **Yes** / No
- Flag personal trip extensions (extra nights before/after business dates)? **Yes** / No

**Out-of-policy travel:**
- Flag premium car rentals above: $**75** per day (most cities), $**125** (NYC/SF) *(from your policy)*

---

#### Meals & Entertainment
*(Only shown if "Meals & entertainment" selected)*

**Meal thresholds:**
- Flag meals above $**75** per person with no attendees listed? *(from your policy)*

**Policy compliance:**
- Flag 1-on-1 meals (if prohibited by your policy)? **Yes** / No
- Flag meals expensed on personal incidentals budget vs event/travel budget? **Yes** / No

---

#### Ground Transportation
*(Only shown if "Ground transportation" selected)*

**Premium rideshare:**
- Flag premium rideshare (Uber Black, Lyft Lux)? **Yes** / No

**Personal use:**
- Flag rides where destination suggests personal use (home, gym)? **Yes** / No

**Car rentals:**
- Flag car rentals above: $**75** per day *(from your policy)*

---

#### Equipment & Office Supplies
*(Only shown if "Equipment & office supplies" selected)*

**Purchase limits:**
- Flag single purchases above: $**75** without itemized receipt? *(from your policy)*

**Merchant restrictions:**
- Flag purchases at general merchandise retailers (Amazon, Walmart) without itemized receipt? **Yes** / No

---

#### Events & Offsites
*(Only shown if "Events & offsites" selected)*

**Event timing:**
- Flag spend assigned to an event budget outside the event dates? **Yes** / No
- Flag T&E charges on event budgets after event end date? **Yes** / No

---

#### Client Gifts & Entertainment
*(Only shown if "Client gifts & entertainment" selected)*

**Gift limits:**
- Flag gifts above: $**___** *(enter based on your policy)*

**Documentation:**
- Flag gifts with no recipient name or business purpose documented? **Yes** / No

---

#### Software Subscriptions
*(Only shown if "Software subscriptions" selected)*

**Duplicate subscriptions:**
- Flag duplicate subscriptions (same tool, multiple employees)? **Yes** / No

**Personal software:**
- Flag personal-category software (streaming, gaming, entertainment)? **Yes** / No

**Recurring charges:**
- Flag recurring charges with no clear business purpose? **Yes** / No

---

#### Professional Development
*(Only shown if "Professional development" selected)*

**Approval requirements:**
- Flag conferences or trainings without prior approval signal? **Yes** / No

---

## Part 2: Review Instructions (What Gets Escalated)

### Step 5: Review Capacity (Sets auto-close defaults)

**"How many cases can your team realistically review per month?"**

- [ ] **High capacity** — We can review most cases (100+ per month)
  - More restrictive auto-close thresholds
  - Human review for medium and high-risk cases

- [ ] **Medium capacity** — We want to review significant issues (50-100 per month) *(Recommended)*
  - Balanced auto-close thresholds
  - Auto-close low-risk, review medium/high

- [ ] **Low capacity** — Only critical issues should reach us (<50 per month)
  - Generous auto-close thresholds
  - Only high-risk cases reach human review

*This will pre-populate auto-close thresholds below. You can adjust any threshold.*

---

### Step 6: Auto-Close Rules

*These values are auto-filled based on your review capacity. Adjust as needed.*

#### Amount threshold:
- Auto-close violations under: $**15** *(auto-filled)*

#### First-time violations:
- Auto-close first-time procedural issues? **Yes** / No *(auto-filled)*
  - If yes, which types?
    - [x] Missing receipt or memo *(auto-filled)*
    - [x] Incorrect budget/spend limit assignment *(auto-filled)*
    - [x] Minor policy overage (<$25) *(auto-filled)*

#### Never auto-close (always require review):
- Duplicate receipts
- AI-generated or modified receipts
- Cash-equivalent purchases
- Receipt amount mismatches
- Suspected fraud or policy circumvention

#### Employee resolution:
- Auto-close when employee provides clarification that resolves the issue? **Yes** / No *(auto-filled)*

---

### Step 7: Escalation Triggers

**Amount-based escalation:**
- Always escalate to human review if amount exceeds: $**500** *(from risk tolerance)*

**Pattern-based escalation:**
- Escalate repeat violations after: **3** occurrences *(auto-filled)*
- Escalate cumulative violations when total exceeds: $**500** *(from risk tolerance)*

**Type-based escalation (always escalate):**
- [x] Suspected fraud (duplicates, AI receipts, split transactions)
- [x] Prohibited merchant categories
- [x] Receipt/claim mismatch
- [ ] Policy circumvention (split transactions, threshold clustering)
- [ ] Geographic anomalies (spend far from home with no travel)

**Response time:**
- Escalate if employee doesn't respond within: **7** days *(auto-filled)*

---

## Step 8: Results & Download

**Your Generated Documents:**

### 1. audit_rules.md
Defines what creates cases

**Universal Rules** (always apply):
- Fraud detection signals
- Spending pattern flags
- Amount thresholds by priority

**Category-Specific Rules** (for selected categories only):
- Travel & lodging violations
- Meals & entertainment violations
- [Other selected categories...]

### 2. review_sop.md
Defines case handling

**Auto-Close Criteria:**
- Amount thresholds
- First-time violation handling
- Employee resolution rules

**Escalation Triggers:**
- Amount-based escalation
- Pattern-based escalation
- Type-based escalation
- Response time requirements

[Download buttons + preview of both documents]

---

## Summary: Question Flow

### Step 0: Upload
- Upload expense policy document

### Step 1: Policy Confirmation (Auto-extracted)
- Confirm/adjust extracted thresholds
- Select expense categories

### Step 2: Risk Tolerance (Sets defaults)
- Choose: Strict / Balanced / Lenient

### Part 1: Audit Rules
**Step 3: Universal Rules** (~15 questions, always asked)
- Fraud detection
- Spending patterns
- Amount thresholds

**Step 4: Category-Specific Rules** (3-7 questions per category, conditional)
- Only shown for selected categories

### Part 2: Review Instructions
**Step 5: Review Capacity** (Sets auto-close defaults)
- Choose: High / Medium / Low capacity

**Step 6: Auto-Close Rules** (~4 questions)
- Amount threshold
- First-time violations
- Employee resolution

**Step 7: Escalation Triggers** (~5 questions)
- Amount-based
- Pattern-based
- Type-based
- Response time

### Step 8: Results
- Download audit_rules.md
- Download review_sop.md

---

## Total Questions: ~25-40
- **Always asked:** ~20 questions (steps 1-3, 5-7)
- **Conditional:** 3-7 questions per selected category (step 4)

---

## Key Features:

### 1. Auto-Extraction from Policy
- Parse uploaded document for thresholds
- Pre-fill amounts throughout questionnaire
- User confirms or adjusts

### 2. Risk Tolerance Framework
- One question sets defaults for all thresholds
- Strict → lower thresholds, more cases
- Lenient → higher thresholds, fewer cases
- All values remain adjustable

### 3. Capacity-Aware Tuning
- One question sets auto-close behavior
- High capacity → less auto-closing
- Low capacity → more auto-closing
- Optimizes for team size

### 4. Progressive Disclosure
- Universal rules shown to everyone
- Category-specific rules only shown if relevant
- Reduces cognitive load

### 5. Smart Defaults
- Every field pre-populated
- Based on policy + risk tolerance + capacity
- User can accept defaults or customize

---

## Example: Default Values by Risk Tolerance

| Threshold | Strict | Balanced | Lenient |
|-----------|--------|----------|---------|
| High-priority single violation | $250 | $500 | $1,000 |
| Large transaction review | $500 | $1,000 | $2,000 |
| Missing receipt flag | $75 | $150 | $250 |
| Auto-close under | $10 | $15 | $25 |
| New vendor flag | $250 | $500 | $1,000 |
| Late submission days | 14 | 30 | 60 |

## Example: Default Values by Review Capacity

| Setting | High Capacity | Medium Capacity | Low Capacity |
|---------|---------------|-----------------|--------------|
| Auto-close under | $10 | $15 | $25 |
| Auto-close first-time | Some types | Most types | All types |
| Auto-close on employee response | No | Yes | Yes |
| Escalation threshold | $250 | $500 | $1,000 |
