import { useState, useEffect } from 'react'
import { SPEND_CATEGORIES, RISK_TOLERANCE_DEFAULTS, REVIEW_CAPACITY_DEFAULTS } from './constants'

const STEPS = [
  'upload',
  'amount-thresholds',
  'expense-categories',
  'risk-tolerance',
  'fraud-detection',
  'spending-patterns',
  'amount-thresholds-audit',
  'category-rules',
  'review-capacity',
  'auto-close',
  'escalation',
  'results'
]

function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [policyFile, setPolicyFile] = useState(null)
  const [answers, setAnswers] = useState({
    // Step 1: Policy confirmation
    receiptThreshold: 75,
    perDiemLimit: 75,
    hotelLimit: '',
    giftLimit: '',
    selectedCategories: [],

    // Step 2: Risk tolerance
    riskTolerance: 'balanced',

    // Step 3: Universal rules (will be auto-filled based on risk tolerance)
    fraudDuplicates: true,
    fraudAI: true,
    fraudMismatches: true,
    fraudCashEquiv: true,
    fraudSplits: true,
    patternAnomalies: true,
    patternGeoMismatch: true,
    patternLateSubmission: true,

    // Step 4: Category-specific (conditional)
    travelManagedTool: 'all',
    travelFlagUpgrades: true,
    travelFlagNoContext: true,
    travelFlagExtensions: true,
    mealsAttendeeThreshold: 75,
    mealsFlag1on1: false,
    mealsFlagPersonalBudget: true,
    transportFlagPremium: true,
    transportFlagPersonal: true,
    transportRentalThreshold: 75,
    equipmentPurchaseThreshold: 75,
    equipmentFlagNoReceipt: true,
    eventsFlagOutsideDates: true,
    eventsFlagAfterEnd: true,
    giftsThreshold: 100,
    giftsFlagNoRecipient: true,
    softwareFlagDuplicates: true,
    softwareFlagPersonal: true,
    softwareFlagNoPurpose: true,
    developmentFlagNoApproval: true,

    // Step 5: Review capacity
    reviewCapacity: 'medium',

    // Step 6-7: Auto-close and escalation (will be auto-filled)
    autoCloseFirstTimeTypes: ['receipt', 'budget', 'overage']
  })

  // Apply risk tolerance defaults when risk tolerance changes
  useEffect(() => {
    if (answers.riskTolerance) {
      const defaults = RISK_TOLERANCE_DEFAULTS[answers.riskTolerance]
      setAnswers(prev => ({
        ...prev,
        highPrioritySingle: defaults.highPrioritySingle,
        largeTransaction: defaults.largeTransaction,
        missingReceipt: defaults.missingReceipt,
        missingMemo: defaults.missingMemo,
        smallViolation: defaults.smallViolation,
        patternThreshold: defaults.patternThreshold,
        geoMismatchAmount: defaults.geoMismatchAmount,
        lateSubmissionDays: defaults.lateSubmissionDays,
        newVendorAmount: defaults.newVendorAmount,
        repeatViolationAmount: defaults.repeatViolationAmount
      }))
    }
  }, [answers.riskTolerance])

  // Apply review capacity defaults when capacity changes
  useEffect(() => {
    if (answers.reviewCapacity) {
      const defaults = REVIEW_CAPACITY_DEFAULTS[answers.reviewCapacity]
      setAnswers(prev => ({
        ...prev,
        autoCloseAmount: defaults.autoCloseAmount,
        autoCloseFirstTime: defaults.autoCloseFirstTime,
        autoCloseResolved: defaults.autoCloseResolved,
        escalateAmount: defaults.escalateAmount,
        escalateRepeatsCount: defaults.escalateRepeatsCount,
        escalateCumulativeAmount: defaults.escalateCumulativeAmount,
        escalateNoResponseDays: defaults.escalateNoResponseDays
      }))
    }
  }, [answers.reviewCapacity])

  const currentStep = STEPS[currentStepIndex]

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const handleCategoryToggle = (categoryId) => {
    setAnswers(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPolicyFile(file.name)
      // Mock extraction - in production, this would parse the document
      setAnswers(prev => ({
        ...prev,
        receiptThreshold: 75,
        perDiemLimit: 75,
        selectedCategories: ['travel', 'meals', 'transport', 'events']
      }))
    }
  }

  const generateDocuments = () => {
    const getTravelToolText = () => {
      const val = answers.travelManagedTool
      if (val === 'all') return 'Flag all travel (hotels + flights) booked outside managed travel tool'
      if (val === 'hotels') return 'Flag hotels booked outside managed travel tool'
      if (val === 'flights') return 'Flag flights booked outside managed travel tool'
      if (val === 'none') return 'Not applicable (no managed travel tool)'
      return 'Not specified'
    }

    const getRiskLevel = () => {
      if (answers.riskTolerance === 'strict') return 'Strict — Flag any deviation from policy'
      if (answers.riskTolerance === 'balanced') return 'Balanced — Flag clear violations and patterns'
      if (answers.riskTolerance === 'lenient') return 'Lenient — Only flag fraud and significant violations'
      return 'Not specified'
    }

    const auditRules = `# Expense Audit Rules

## Risk Tolerance

${getRiskLevel()}

## Spend Categories in Scope

${answers.selectedCategories.map(cat => {
  const category = SPEND_CATEGORIES.find(c => c.id === cat)
  return `- ${category.label}`
}).join('\n')}

## Universal Rules

### Fraud Detection (Always Monitored)

- Duplicate receipts: ${answers.fraudDuplicates ? 'Yes' : 'No'}
- AI-generated or modified receipts: ${answers.fraudAI ? 'Yes' : 'No'}
- Receipt amount mismatches: ${answers.fraudMismatches ? 'Yes' : 'No'}
- Cash-equivalent purchases: ${answers.fraudCashEquiv ? 'Yes' : 'No'}
- Split transactions: ${answers.fraudSplits ? 'Yes' : 'No'}

### Spending Patterns

- Spending anomalies (>2x historical average): ${answers.patternAnomalies ? 'Yes' : 'No'}
- Geographic mismatches above: $${answers.geoMismatchAmount || '___'}
- Late submissions after: ${answers.lateSubmissionDays || '___'} days
- New vendor spend above: $${answers.newVendorAmount || '___'}
- Repeat violations cumulative above: $${answers.repeatViolationAmount || '___'}

### Amount Thresholds

**High-priority (immediate escalation):**
- Single violation over: $${answers.highPrioritySingle || '___'}

**Medium-priority (investigate):**
- Large single transaction: $${answers.largeTransaction || '___'}
- Missing receipt above: $${answers.missingReceipt || '___'}
- Missing memo/business purpose above: $${answers.missingMemo || '___'}

**Low-priority (pattern monitoring):**
- Small violation threshold: $${answers.smallViolation || '___'}
- Pattern threshold (cumulative): $${answers.patternThreshold || '___'}

## Category-Specific Rules

${answers.selectedCategories.includes('travel') ? `### Travel & Lodging

- Managed travel tool: ${getTravelToolText()}
- Flag flight upgrades: ${answers.travelFlagUpgrades ? 'Yes' : 'No'}
- Flag hotel stays with no trip context: ${answers.travelFlagNoContext ? 'Yes' : 'No'}
- Flag personal trip extensions: ${answers.travelFlagExtensions ? 'Yes' : 'No'}
` : ''}

${answers.selectedCategories.includes('meals') ? `### Meals & Entertainment

- Flag meals above $${answers.mealsAttendeeThreshold || '___'} per person with no attendees listed
- Flag 1-on-1 meals: ${answers.mealsFlag1on1 ? 'Yes' : 'No'}
- Flag meals on personal budget: ${answers.mealsFlagPersonalBudget ? 'Yes' : 'No'}
` : ''}

${answers.selectedCategories.includes('transport') ? `### Ground Transportation

- Flag premium rideshare: ${answers.transportFlagPremium ? 'Yes' : 'No'}
- Flag rides with personal destinations: ${answers.transportFlagPersonal ? 'Yes' : 'No'}
- Flag car rentals over: $${answers.transportRentalThreshold || '___'}/day
` : ''}

${answers.selectedCategories.includes('equipment') ? `### Equipment & Office Supplies

- Flag single purchases over: $${answers.equipmentPurchaseThreshold || '___'} without itemized receipt
- Flag purchases without itemized receipt: ${answers.equipmentFlagNoReceipt ? 'Yes' : 'No'}
` : ''}

${answers.selectedCategories.includes('events') ? `### Events & Offsites

- Flag spend outside event dates: ${answers.eventsFlagOutsideDates ? 'Yes' : 'No'}
- Flag T&E charges after event end: ${answers.eventsFlagAfterEnd ? 'Yes' : 'No'}
` : ''}

${answers.selectedCategories.includes('gifts') ? `### Client Gifts & Entertainment

- Flag gifts over: $${answers.giftsThreshold || '___'}
- Flag gifts with no recipient/purpose: ${answers.giftsFlagNoRecipient ? 'Yes' : 'No'}
` : ''}

${answers.selectedCategories.includes('software') ? `### Software Subscriptions

- Flag duplicate subscriptions: ${answers.softwareFlagDuplicates ? 'Yes' : 'No'}
- Flag personal-category software: ${answers.softwareFlagPersonal ? 'Yes' : 'No'}
- Flag recurring charges with no business purpose: ${answers.softwareFlagNoPurpose ? 'Yes' : 'No'}
` : ''}

${answers.selectedCategories.includes('development') ? `### Professional Development

- Flag conferences without approval: ${answers.developmentFlagNoApproval ? 'Yes' : 'No'}
` : ''}
`

    const getReviewCapacity = () => {
      if (answers.reviewCapacity === 'high') return 'High capacity — We can review most cases (100+ per month)'
      if (answers.reviewCapacity === 'medium') return 'Medium capacity — We review significant issues (50-100 per month)'
      if (answers.reviewCapacity === 'low') return 'Low capacity — Only critical issues (< 50 per month)'
      return 'Not specified'
    }

    const reviewSOP = `# Review Instructions

## Review Capacity

${getReviewCapacity()}

## Auto-Close Rules

- Auto-close violations under: $${answers.autoCloseAmount || '___'}
- Auto-close first-time procedural issues: ${answers.autoCloseFirstTime ? 'Yes' : 'No'}
${answers.autoCloseFirstTime ? `  - Types: ${answers.autoCloseFirstTimeTypes.includes('receipt') ? 'Missing receipt/memo' : ''} ${answers.autoCloseFirstTimeTypes.includes('budget') ? 'Incorrect budget assignment' : ''} ${answers.autoCloseFirstTimeTypes.includes('overage') ? 'Minor overage (<$25)' : ''}` : ''}
- Never auto-close: Duplicate receipts, AI-generated receipts, cash-equivalent purchases, receipt mismatches
- Auto-close when employee resolves: ${answers.autoCloseResolved ? 'Yes' : 'No'}

## Escalation Triggers

**Amount-based escalation:**
- Always escalate if amount exceeds: $${answers.escalateAmount || '___'}

**Pattern-based escalation:**
- Escalate repeat violations after: ${answers.escalateRepeatsCount || '___'} occurrences
- Escalate cumulative violations when total exceeds: $${answers.escalateCumulativeAmount || '___'}

**Type-based escalation (always escalate):**
- Suspected fraud (duplicates, AI receipts, split transactions)
- Prohibited merchant categories
- Receipt/claim mismatch

**Response time:**
- Escalate if employee does not respond within: ${answers.escalateNoResponseDays || '___'} days
`

    return { auditRules, reviewSOP }
  }

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      maxWidth: '900px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    header: {
      padding: '32px 40px',
      borderBottom: '1px solid #e2e8f0'
    },
    title: {
      fontSize: '28px',
      marginBottom: '8px',
      color: '#1e293b'
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b'
    },
    content: {
      padding: '40px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      paddingTop: '24px',
      borderTop: '1px solid #e2e8f0',
      marginTop: '32px'
    },
    button: {
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '8px',
      cursor: 'pointer',
      border: 'none',
      transition: 'background 0.2s'
    },
    primaryButton: {
      background: '#2563eb',
      color: 'white'
    },
    secondaryButton: {
      background: '#e2e8f0',
      color: '#475569'
    },
    progressBar: {
      height: '4px',
      background: '#e2e8f0',
      position: 'relative'
    },
    progressFill: {
      height: '100%',
      background: '#2563eb',
      transition: 'width 0.3s',
      width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`
    }
  }

  const { auditRules, reviewSOP } = currentStep === 'results' ? generateDocuments() : { auditRules: '', reviewSOP: '' }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>

        {/* STEP 0: Upload */}
        {currentStep === 'upload' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Upload Your Expense Policy</h2>
              <p style={styles.subtitle}>We'll help you create audit rules and review instructions that enforce your policy</p>
            </div>
            <div style={styles.content}>
              <div style={{ marginBottom: '32px' }}>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ fontSize: '14px' }}
                />
                {policyFile && (
                  <p style={{ marginTop: '12px', color: '#16a34a', fontSize: '14px' }}>
                    ✓ Uploaded: {policyFile}
                  </p>
                )}
              </div>
              <div style={styles.buttonGroup}>
                <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
                  {policyFile ? 'Continue' : 'Skip for Now'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 1: Amount Thresholds */}
        {currentStep === 'amount-thresholds' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Step 1: Amount Thresholds</h2>
              <p style={styles.subtitle}>Confirm or adjust key policy thresholds</p>
            </div>
            <div style={styles.content}>
              <QuestionInput
                label="Receipt required above"
                id="receiptThreshold"
                answers={answers}
                handleAnswer={handleAnswer}
                type="number"
                unit="USD"
              />
              <QuestionInput
                label="Per diem limit"
                id="perDiemLimit"
                answers={answers}
                handleAnswer={handleAnswer}
                type="number"
                unit="USD"
              />
              <QuestionInput
                label="Hotel per night limit (optional)"
                id="hotelLimit"
                answers={answers}
                handleAnswer={handleAnswer}
                type="number"
                unit="USD"
              />
              <QuestionInput
                label="Gift limit (optional)"
                id="giftLimit"
                answers={answers}
                handleAnswer={handleAnswer}
                type="number"
                unit="USD"
              />

              <div style={styles.buttonGroup}>
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
                  Continue
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: Expense Categories */}
        {currentStep === 'expense-categories' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Step 2: Expense Categories</h2>
              <p style={styles.subtitle}>Which expense categories are most relevant to your business?</p>
            </div>
            <div style={styles.content}>
              {SPEND_CATEGORIES.map(category => (
                <CategoryCheckbox
                  key={category.id}
                  category={category}
                  selected={answers.selectedCategories.includes(category.id)}
                  onToggle={handleCategoryToggle}
                />
              ))}

              <div style={styles.buttonGroup}>
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button
                  onClick={nextStep}
                  style={{ ...styles.button, ...styles.primaryButton }}
                  disabled={answers.selectedCategories.length === 0}
                >
                  Continue
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 3: Risk Tolerance */}
        {currentStep === 'risk-tolerance' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Step 3: Risk Tolerance</h2>
              <p style={styles.subtitle}>This sets default thresholds for all audit rules</p>
            </div>
            <div style={styles.content}>
              <label style={{ display: 'block', marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                What's your tolerance for policy violations?
              </label>
              {[
                { value: 'strict', label: 'Strict — Flag any deviation from policy', desc: 'Creates more cases, catches minor violations. Recommended for: Organizations with tight compliance requirements.' },
                { value: 'balanced', label: 'Balanced — Flag clear violations and patterns (Recommended)', desc: 'Focus on meaningful violations and repeated issues. Recommended for: Most organizations.' },
                { value: 'lenient', label: 'Lenient — Only flag fraud and significant violations', desc: 'Creates fewer cases, focuses on high-impact issues. Recommended for: Small teams with limited review capacity.' }
              ].map(option => (
                <RiskOption
                  key={option.value}
                  option={option}
                  selected={answers.riskTolerance === option.value}
                  onSelect={() => handleAnswer('riskTolerance', option.value)}
                />
              ))}

              <div style={styles.buttonGroup}>
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
                  Continue
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 4: Fraud Detection */}
        {currentStep === 'fraud-detection' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Step 4: Fraud Detection</h2>
              <p style={styles.subtitle}>These fraud signals are always flagged</p>
            </div>
            <div style={styles.content}>
              <YesNoToggle label="Duplicate receipts (same receipt submitted multiple times)" id="fraudDuplicates" answers={answers} handleAnswer={handleAnswer} />
              <YesNoToggle label="AI-generated or modified receipts" id="fraudAI" answers={answers} handleAnswer={handleAnswer} />
              <YesNoToggle label="Receipt amount mismatches (claimed > receipt amount)" id="fraudMismatches" answers={answers} handleAnswer={handleAnswer} />
              <YesNoToggle label="Cash-equivalent purchases (gift cards, money transfers, crypto)" id="fraudCashEquiv" answers={answers} handleAnswer={handleAnswer} />
              <YesNoToggle label="Split transactions (multiple charges just below approval threshold)" id="fraudSplits" answers={answers} handleAnswer={handleAnswer} />

              <div style={styles.buttonGroup}>
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
                  Continue
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 5: Spending Patterns */}
        {currentStep === 'spending-patterns' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Step 5: Spending Patterns</h2>
              <p style={styles.subtitle}>Configure pattern-based detection rules</p>
            </div>
            <div style={styles.content}>
              <YesNoToggle label="Flag when user spends >2x their historical average?" id="patternAnomalies" answers={answers} handleAnswer={handleAnswer} />
              <YesNoToggle label="Flag spend in distant locations with no travel context?" id="patternGeoMismatch" answers={answers} handleAnswer={handleAnswer} />
              {answers.patternGeoMismatch && (
                <QuestionInput label="Above amount" id="geoMismatchAmount" answers={answers} handleAnswer={handleAnswer} />
              )}

              <QuestionInput label="Flag expenses submitted more than X days after transaction" id="lateSubmissionDays" answers={answers} handleAnswer={handleAnswer} type="number" unit="days" />
              <QuestionInput label="Flag first-time vendor spend above" id="newVendorAmount" answers={answers} handleAnswer={handleAnswer} />
              <QuestionInput label="Flag when same user has cumulative violations above" id="repeatViolationAmount" answers={answers} handleAnswer={handleAnswer} />

              <div style={styles.buttonGroup}>
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
                  Continue
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 6: Amount Thresholds (Audit) */}
        {currentStep === 'amount-thresholds-audit' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Step 6: Audit Amount Thresholds</h2>
              <p style={styles.subtitle}>These values are auto-filled based on your risk tolerance</p>
            </div>
            <div style={styles.content}>
              <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#475569' }}>High-priority (immediate escalation):</h4>
              <QuestionInput label="Single violation over" id="highPrioritySingle" answers={answers} handleAnswer={handleAnswer} />

              <h4 style={{ fontSize: '16px', marginTop: '24px', marginBottom: '12px', color: '#475569' }}>Medium-priority (investigate):</h4>
              <QuestionInput label="Large single transaction" id="largeTransaction" answers={answers} handleAnswer={handleAnswer} />
              <QuestionInput label="Missing receipt above" id="missingReceipt" answers={answers} handleAnswer={handleAnswer} />
              <QuestionInput label="Missing memo/business purpose above" id="missingMemo" answers={answers} handleAnswer={handleAnswer} />

              <h4 style={{ fontSize: '16px', marginTop: '24px', marginBottom: '12px', color: '#475569' }}>Low-priority (pattern monitoring):</h4>
              <QuestionInput label="Small violation threshold" id="smallViolation" answers={answers} handleAnswer={handleAnswer} />
              <QuestionInput label="Pattern threshold (cumulative)" id="patternThreshold" answers={answers} handleAnswer={handleAnswer} />

              <div style={styles.buttonGroup}>
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
                  Continue
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 7: Category-Specific Rules */}
        {currentStep === 'category-rules' && (
          <CategoryRulesStep
            answers={answers}
            handleAnswer={handleAnswer}
            nextStep={nextStep}
            prevStep={prevStep}
            styles={styles}
          />
        )}

        {/* STEP 8: Review Capacity */}
        {currentStep === 'review-capacity' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Step 8: Review Capacity</h2>
              <p style={styles.subtitle}>This sets default thresholds for auto-close and escalation</p>
            </div>
            <div style={styles.content}>
              <label style={{ display: 'block', marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                How many cases can your team realistically review per month?
              </label>
              {[
                { value: 'high', label: 'High capacity — We can review most cases (100+ per month)', desc: 'More restrictive auto-close thresholds. Human review for medium and high-risk cases.' },
                { value: 'medium', label: 'Medium capacity — We review significant issues (50-100 per month) (Recommended)', desc: 'Balanced auto-close thresholds. Auto-close low-risk, review medium/high.' },
                { value: 'low', label: 'Low capacity — Only critical issues (<50 per month)', desc: 'Generous auto-close thresholds. Only high-risk cases reach human review.' }
              ].map(option => (
                <RiskOption
                  key={option.value}
                  option={option}
                  selected={answers.reviewCapacity === option.value}
                  onSelect={() => handleAnswer('reviewCapacity', option.value)}
                />
              ))}

              <div style={styles.buttonGroup}>
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
                  Continue
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 9: Auto-Close Rules */}
        {currentStep === 'auto-close' && (
          <AutoCloseStep
            answers={answers}
            handleAnswer={handleAnswer}
            nextStep={nextStep}
            prevStep={prevStep}
            styles={styles}
          />
        )}

        {/* STEP 10: Escalation Triggers */}
        {currentStep === 'escalation' && (
          <EscalationStep
            answers={answers}
            handleAnswer={handleAnswer}
            nextStep={nextStep}
            prevStep={prevStep}
            styles={styles}
          />
        )}

        {/* STEP 11: Results */}
        {currentStep === 'results' && (
          <ResultsStep
            auditRules={auditRules}
            reviewSOP={reviewSOP}
            downloadFile={downloadFile}
            onReset={() => {
              setCurrentStepIndex(0)
              setPolicyFile(null)
              setAnswers({
                receiptThreshold: 75,
                perDiemLimit: 75,
                hotelLimit: '',
                giftLimit: '',
                selectedCategories: [],
                riskTolerance: 'balanced',
                fraudDuplicates: true,
                fraudAI: true,
                fraudMismatches: true,
                fraudCashEquiv: true,
                fraudSplits: true,
                patternAnomalies: true,
                patternGeoMismatch: true,
                patternLateSubmission: true,
                reviewCapacity: 'medium',
                autoCloseFirstTimeTypes: ['receipt', 'budget', 'overage']
              })
            }}
            styles={styles}
          />
        )}
      </div>
    </div>
  )
}

// ========== COMPONENT DEFINITIONS ==========

// QuestionInput: handles number inputs with units, yes/no radio buttons
function QuestionInput({ label, id, answers, handleAnswer, type = 'number', unit = 'USD' }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {unit === 'USD' && <span style={{ color: '#64748b', fontSize: '16px' }}>$</span>}
        <input
          id={id}
          type={type}
          value={answers[id] || ''}
          onChange={(e) => handleAnswer(id, e.target.value)}
          style={{
            padding: '10px 12px',
            fontSize: '16px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            width: '200px'
          }}
        />
        {unit === 'days' && <span style={{ color: '#64748b', fontSize: '14px' }}>days</span>}
      </div>
    </div>
  )
}

// YesNoToggle: Yes/No radio buttons
function YesNoToggle({ label, id, answers, handleAnswer }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="radio"
            name={id}
            checked={answers[id] === true}
            onChange={() => handleAnswer(id, true)}
          />
          <span style={{ fontSize: '14px', color: '#475569' }}>Yes</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="radio"
            name={id}
            checked={answers[id] === false}
            onChange={() => handleAnswer(id, false)}
          />
          <span style={{ fontSize: '14px', color: '#475569' }}>No</span>
        </label>
      </div>
    </div>
  )
}

// CategoryCheckbox: Expense category selection
function CategoryCheckbox({ category, selected, onToggle }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        marginBottom: '8px',
        border: selected ? '2px solid #2563eb' : '1px solid #e2e8f0',
        borderRadius: '8px',
        cursor: 'pointer',
        background: selected ? '#eff6ff' : 'white',
        transition: 'all 0.2s'
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(category.id)}
        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
      />
      <span style={{ fontSize: '15px', color: '#1e293b' }}>{category.label}</span>
    </label>
  )
}

// RiskOption: Risk tolerance and review capacity selection cards
function RiskOption({ option, selected, onSelect }) {
  return (
    <label
      style={{
        display: 'block',
        padding: '16px',
        marginBottom: '12px',
        border: selected ? '2px solid #2563eb' : '1px solid #e2e8f0',
        borderRadius: '8px',
        cursor: 'pointer',
        background: selected ? '#eff6ff' : 'white',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
        <input
          type="radio"
          checked={selected}
          onChange={onSelect}
          style={{ marginTop: '4px', cursor: 'pointer' }}
        />
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
            {option.label}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            {option.desc}
          </div>
        </div>
      </div>
    </label>
  )
}

// CategoryRulesStep: Step 7 - conditional questions for each selected category
function CategoryRulesStep({ answers, handleAnswer, nextStep, prevStep, styles }) {
  const hasCategories = answers.selectedCategories.length > 0

  if (!hasCategories) {
    return (
      <>
        <div style={styles.header}>
          <h2 style={styles.title}>Step 7: Category-Specific Rules</h2>
          <p style={styles.subtitle}>No categories selected - skipping to review capacity</p>
        </div>
        <div style={styles.content}>
          <div style={styles.buttonGroup}>
            <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
              Back
            </button>
            <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
              Continue
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={styles.header}>
        <h2 style={styles.title}>Step 7: Category-Specific Rules</h2>
        <p style={styles.subtitle}>Configure rules for your selected expense categories</p>
      </div>
      <div style={styles.content}>
        {/* Travel & Lodging */}
        {answers.selectedCategories.includes('travel') && (
          <>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1e293b' }}>Travel & Lodging</h3>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                Which travel bookings should be flagged if made outside your managed travel tool?
              </label>
              {[
                { value: 'all', label: 'All (flights + hotels)' },
                { value: 'hotels', label: 'Hotels only' },
                { value: 'flights', label: 'Flights only' },
                { value: 'none', label: 'None (not applicable)' }
              ].map(option => (
                <label key={option.value} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="travelManagedTool"
                    checked={answers.travelManagedTool === option.value}
                    onChange={() => handleAnswer('travelManagedTool', option.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '14px', color: '#475569' }}>{option.label}</span>
                </label>
              ))}
            </div>

            <YesNoToggle label="Flag flight upgrades on flights <6 hours?" id="travelFlagUpgrades" answers={answers} handleAnswer={handleAnswer} />
            <YesNoToggle label="Flag hotel stays with no corresponding trip/travel context?" id="travelFlagNoContext" answers={answers} handleAnswer={handleAnswer} />
            <YesNoToggle label="Flag personal trip extensions (extra nights before/after business dates)?" id="travelFlagExtensions" answers={answers} handleAnswer={handleAnswer} />
          </>
        )}

        {/* Meals & Entertainment */}
        {answers.selectedCategories.includes('meals') && (
          <>
            <h3 style={{ fontSize: '18px', margin: '32px 0 16px', color: '#1e293b' }}>Meals & Entertainment</h3>
            <QuestionInput label="Flag meals above X per person with no attendees listed" id="mealsAttendeeThreshold" answers={answers} handleAnswer={handleAnswer} />
            <YesNoToggle label="Flag 1-on-1 meals (if prohibited by your policy)?" id="mealsFlag1on1" answers={answers} handleAnswer={handleAnswer} />
            <YesNoToggle label="Flag meals expensed on personal incidentals budget vs event/travel budget?" id="mealsFlagPersonalBudget" answers={answers} handleAnswer={handleAnswer} />
          </>
        )}

        {/* Ground Transportation */}
        {answers.selectedCategories.includes('transport') && (
          <>
            <h3 style={{ fontSize: '18px', margin: '32px 0 16px', color: '#1e293b' }}>Ground Transportation</h3>
            <YesNoToggle label="Flag premium rideshare (Uber Black, Lyft Lux)?" id="transportFlagPremium" answers={answers} handleAnswer={handleAnswer} />
            <YesNoToggle label="Flag rides where destination suggests personal use (home, gym)?" id="transportFlagPersonal" answers={answers} handleAnswer={handleAnswer} />
            <QuestionInput label="Flag car rentals above (per day)" id="transportRentalThreshold" answers={answers} handleAnswer={handleAnswer} />
          </>
        )}

        {/* Equipment & Office Supplies */}
        {answers.selectedCategories.includes('equipment') && (
          <>
            <h3 style={{ fontSize: '18px', margin: '32px 0 16px', color: '#1e293b' }}>Equipment & Office Supplies</h3>
            <QuestionInput label="Flag single purchases above X without itemized receipt" id="equipmentPurchaseThreshold" answers={answers} handleAnswer={handleAnswer} />
            <YesNoToggle label="Flag purchases at general merchandise retailers (Amazon, Walmart) without itemized receipt?" id="equipmentFlagNoReceipt" answers={answers} handleAnswer={handleAnswer} />
          </>
        )}

        {/* Events & Offsites */}
        {answers.selectedCategories.includes('events') && (
          <>
            <h3 style={{ fontSize: '18px', margin: '32px 0 16px', color: '#1e293b' }}>Events & Offsites</h3>
            <YesNoToggle label="Flag spend assigned to an event budget outside the event dates?" id="eventsFlagOutsideDates" answers={answers} handleAnswer={handleAnswer} />
            <YesNoToggle label="Flag T&E charges on event budgets after event end date?" id="eventsFlagAfterEnd" answers={answers} handleAnswer={handleAnswer} />
          </>
        )}

        {/* Client Gifts & Entertainment */}
        {answers.selectedCategories.includes('gifts') && (
          <>
            <h3 style={{ fontSize: '18px', margin: '32px 0 16px', color: '#1e293b' }}>Client Gifts & Entertainment</h3>
            <QuestionInput label="Flag gifts above" id="giftsThreshold" answers={answers} handleAnswer={handleAnswer} />
            <YesNoToggle label="Flag gifts with no recipient name or business purpose documented?" id="giftsFlagNoRecipient" answers={answers} handleAnswer={handleAnswer} />
          </>
        )}

        {/* Software Subscriptions */}
        {answers.selectedCategories.includes('software') && (
          <>
            <h3 style={{ fontSize: '18px', margin: '32px 0 16px', color: '#1e293b' }}>Software Subscriptions</h3>
            <YesNoToggle label="Flag duplicate subscriptions (same tool, multiple employees)?" id="softwareFlagDuplicates" answers={answers} handleAnswer={handleAnswer} />
            <YesNoToggle label="Flag personal-category software (streaming, gaming, entertainment)?" id="softwareFlagPersonal" answers={answers} handleAnswer={handleAnswer} />
            <YesNoToggle label="Flag recurring charges with no clear business purpose?" id="softwareFlagNoPurpose" answers={answers} handleAnswer={handleAnswer} />
          </>
        )}

        {/* Professional Development */}
        {answers.selectedCategories.includes('development') && (
          <>
            <h3 style={{ fontSize: '18px', margin: '32px 0 16px', color: '#1e293b' }}>Professional Development</h3>
            <YesNoToggle label="Flag conferences or trainings without prior approval signal?" id="developmentFlagNoApproval" answers={answers} handleAnswer={handleAnswer} />
          </>
        )}

        <div style={styles.buttonGroup}>
          <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
            Back
          </button>
          <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
            Continue
          </button>
        </div>
      </div>
    </>
  )
}

// AutoCloseStep: Step 9 - auto-close rule configuration
function AutoCloseStep({ answers, handleAnswer, nextStep, prevStep, styles }) {
  const toggleAutoCloseType = (type) => {
    const current = answers.autoCloseFirstTimeTypes || []
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]
    handleAnswer('autoCloseFirstTimeTypes', updated)
  }

  return (
    <>
      <div style={styles.header}>
        <h2 style={styles.title}>Step 9: Auto-Close Rules</h2>
        <p style={styles.subtitle}>Define thresholds for automatic case resolution</p>
      </div>
      <div style={styles.content}>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
          These values are auto-filled based on your review capacity. Adjust as needed.
        </p>

        <QuestionInput label="Auto-close violations under" id="autoCloseAmount" answers={answers} handleAnswer={handleAnswer} />

        <div style={{ marginTop: '32px' }}>
          <YesNoToggle label="Auto-close first-time procedural issues?" id="autoCloseFirstTime" answers={answers} handleAnswer={handleAnswer} />

          {answers.autoCloseFirstTime && (
            <div style={{ marginLeft: '24px', marginTop: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>
                Which types should be auto-closed?
              </p>
              {[
                { id: 'receipt', label: 'Missing receipt or memo' },
                { id: 'budget', label: 'Incorrect budget/spend limit assignment' },
                { id: 'overage', label: 'Minor policy overage (<$25)' }
              ].map(type => (
                <label
                  key={type.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={(answers.autoCloseFirstTimeTypes || []).includes(type.id)}
                    onChange={() => toggleAutoCloseType(type.id)}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#475569' }}>{type.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '32px', padding: '16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
            Never auto-close (always require review):
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#92400e' }}>
            <li>Duplicate receipts</li>
            <li>AI-generated or modified receipts</li>
            <li>Cash-equivalent purchases</li>
            <li>Receipt amount mismatches</li>
            <li>Suspected fraud or policy circumvention</li>
          </ul>
        </div>

        <div style={{ marginTop: '32px' }}>
          <YesNoToggle label="Auto-close when employee provides clarification that resolves the issue?" id="autoCloseResolved" answers={answers} handleAnswer={handleAnswer} />
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
            Back
          </button>
          <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
            Continue
          </button>
        </div>
      </div>
    </>
  )
}

// EscalationStep: Step 10 - escalation trigger configuration
function EscalationStep({ answers, handleAnswer, nextStep, prevStep, styles }) {
  return (
    <>
      <div style={styles.header}>
        <h2 style={styles.title}>Step 10: Escalation Triggers</h2>
        <p style={styles.subtitle}>Define when cases should be escalated to human review</p>
      </div>
      <div style={styles.content}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1e293b' }}>Amount-based escalation</h3>
        <QuestionInput label="Always escalate to human review if amount exceeds" id="escalateAmount" answers={answers} handleAnswer={handleAnswer} />

        <h3 style={{ fontSize: '18px', margin: '32px 0 16px', color: '#1e293b' }}>Pattern-based escalation</h3>
        <QuestionInput label="Escalate repeat violations after X occurrences" id="escalateRepeatsCount" answers={answers} handleAnswer={handleAnswer} type="number" unit="occurrences" />
        <QuestionInput label="Escalate cumulative violations when total exceeds" id="escalateCumulativeAmount" answers={answers} handleAnswer={handleAnswer} />

        <h3 style={{ fontSize: '18px', margin: '32px 0 16px', color: '#1e293b' }}>Type-based escalation</h3>
        <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #ef4444' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#7f1d1d', marginBottom: '8px' }}>
            Always escalate these types:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#7f1d1d' }}>
            <li>Suspected fraud (duplicates, AI receipts, split transactions)</li>
            <li>Prohibited merchant categories</li>
            <li>Receipt/claim mismatch</li>
          </ul>
        </div>

        <h3 style={{ fontSize: '18px', margin: '32px 0 16px', color: '#1e293b' }}>Response time</h3>
        <QuestionInput label="Escalate if employee does not respond within X days" id="escalateNoResponseDays" answers={answers} handleAnswer={handleAnswer} type="number" unit="days" />

        <div style={styles.buttonGroup}>
          <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
            Back
          </button>
          <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
            Continue to Results
          </button>
        </div>
      </div>
    </>
  )
}

// ResultsStep: Step 8 - document preview and download
function ResultsStep({ auditRules, reviewSOP, downloadFile, onReset, styles }) {
  return (
    <>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Generated Documents</h2>
        <p style={styles.subtitle}>Download your custom audit rules and review instructions</p>
      </div>
      <div style={styles.content}>
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#1e293b' }}>1. audit_rules.md</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
            Defines what creates cases (fraud detection, spending patterns, category-specific violations)
          </p>
          <button
            onClick={() => downloadFile(auditRules, 'audit_rules.md')}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              width: '100%',
              marginBottom: '16px'
            }}
          >
            Download audit_rules.md
          </button>
          <details style={{ fontSize: '14px', color: '#475569', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '12px' }}>
              Preview document
            </summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
              {auditRules}
            </pre>
          </details>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#1e293b' }}>2. review_sop.md</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
            Defines case handling (auto-close criteria, escalation triggers, response time requirements)
          </p>
          <button
            onClick={() => downloadFile(reviewSOP, 'review_sop.md')}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              width: '100%',
              marginBottom: '16px'
            }}
          >
            Download review_sop.md
          </button>
          <details style={{ fontSize: '14px', color: '#475569', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '12px' }}>
              Preview document
            </summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
              {reviewSOP}
            </pre>
          </details>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={onReset}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Start Over
          </button>
        </div>
      </div>
    </>
  )
}

export default App
