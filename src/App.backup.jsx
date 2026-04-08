import { useState } from 'react'

const SPEND_CATEGORIES = [
  { id: 'travel', label: 'Travel & lodging' },
  { id: 'meals', label: 'Meals & entertainment' },
  { id: 'transport', label: 'Ground transportation / rideshare' },
  { id: 'software', label: 'Software & subscriptions' },
  { id: 'equipment', label: 'Equipment & supplies' },
  { id: 'events', label: 'Events & offsites' },
  { id: 'gifts', label: 'Gifts & client entertainment' },
  { id: 'development', label: 'Professional development' }
]

function App() {
  const [step, setStep] = useState('welcome')
  const [policyFile, setPolicyFile] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [answers, setAnswers] = useState({})

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPolicyFile(file.name)
    }
  }

  const nextStep = () => {
    const steps = [
      'welcome',
      'upload',
      'categories',
      'category-questions',
      'fraud',
      'review-appetite',
      'auto-close',
      'escalation',
      'documentation',
      'results'
    ]
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps = [
      'welcome',
      'upload',
      'categories',
      'category-questions',
      'fraud',
      'review-appetite',
      'auto-close',
      'escalation',
      'documentation',
      'results'
    ]
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  const generateDocuments = () => {
    // Helper to format travel tool answer
    const getTravelToolText = () => {
      const val = answers.travelManagedTool
      if (val === 'all') return 'Flag all travel (hotels + flights) booked outside managed travel tool'
      if (val === 'hotels') return 'Flag hotels booked outside managed travel tool'
      if (val === 'flights') return 'Flag flights booked outside managed travel tool'
      if (val === 'none') return 'Not applicable (no managed travel tool)'
      return 'Not specified'
    }

    // Generate audit_rules.md
    const auditRules = `# Expense Audit Rules

## Spend Categories in Scope

${selectedCategories.map(cat => {
  const category = SPEND_CATEGORIES.find(c => c.id === cat)
  return `- ${category.label}`
}).join('\n')}

## Category-Specific Rules

${selectedCategories.includes('travel') ? `### Travel & lodging
- Managed travel tool: ${getTravelToolText()}
- Flag flight upgrades: ${answers.travelFlagUpgrades || 'Not specified'}
- Flag hotel stays with no trip context: ${answers.travelFlagNoContext || 'Not specified'}
- Flag personal trip extensions: ${answers.travelFlagExtensions || 'Not specified'}
` : ''}

${selectedCategories.includes('meals') ? `### Meals & entertainment
- Review threshold per person: $${answers.mealsReviewThreshold || '___'}
- Flag meals with no attendees above: $${answers.mealsFlagNoAttendees || '___'}
- Flag meals on personal budget: ${answers.mealsFlagPersonalBudget || 'Not specified'}
- Flag 1-on-1 meals: ${answers.mealsFlag1on1 || 'Not specified'}
` : ''}

${selectedCategories.includes('transport') ? `### Ground transportation / rideshare
- Flag premium rideshare: ${answers.transportFlagPremium || 'Not specified'}
- Flag rides with personal destinations: ${answers.transportFlagPersonal || 'Not specified'}
- Flag car rentals over: $${answers.transportRentalThreshold || '___'}/day
` : ''}

${selectedCategories.includes('software') ? `### Software & subscriptions
- Flag duplicate subscriptions: ${answers.softwareFlagDuplicates || 'Not specified'}
- Flag personal-category software: ${answers.softwareFlagPersonal || 'Not specified'}
- Flag recurring charges with no business purpose: ${answers.softwareFlagNoPurpose || 'Not specified'}
` : ''}

${selectedCategories.includes('equipment') ? `### Equipment & supplies
- Flag single purchases over: $${answers.equipmentPurchaseThreshold || '___'}
- Flag purchases without itemized receipt: ${answers.equipmentFlagNoReceipt || 'Not specified'}
` : ''}

${selectedCategories.includes('events') ? `### Events & offsites
- Flag spend outside event dates: ${answers.eventsFlagOutsideDates || 'Not specified'}
- Flag T&E charges after event end: ${answers.eventsFlagAfterEnd || 'Not specified'}
` : ''}

${selectedCategories.includes('gifts') ? `### Gifts & client entertainment
- Flag gifts over: $${answers.giftsThreshold || '___'}
- Flag gifts with no recipient/purpose: ${answers.giftsFlagNoRecipient || 'Not specified'}
` : ''}

${selectedCategories.includes('development') ? `### Professional development
- Flag conferences without approval: ${answers.developmentFlagNoApproval || 'Not specified'}
` : ''}

## Fraud Vectors

- Flag duplicate receipts: ${answers.fraudDuplicates || 'Yes'}
- Flag receipt amount mismatches: ${answers.fraudMismatches || 'Yes'}
- Flag AI-generated receipts: ${answers.fraudAI || 'Yes'}
- Flag split transactions: ${answers.fraudSplits || 'Yes'}
- Flag even-dollar amounts: After ${answers.fraudEvenDollarCount || '___'} in a month
- Flag bulk submissions: After ${answers.fraudBulkCount || '___'} on same day
- Flag cash-equivalent purchases: ${answers.fraudCashEquiv || 'Yes'}
- Flag new vendors over: $${answers.fraudNewVendorThreshold || '___'}
- Flag late submissions: Over ${answers.fraudLateDays || '___'} days after transaction
`

    // Generate review_sop.md
    const getReviewPosture = () => {
      if (answers.reviewAppetite === 'all') return 'Review everything — human reviews all cases'
      if (answers.reviewAppetite === 'tiered') return 'Review by risk tier — auto-close low risk, human reviews medium and high'
      if (answers.reviewAppetite === 'minimal') return 'Minimal review — auto-close anything that does not meet a high bar'
      return 'Not specified'
    }

    const reviewSOP = `# Review Instructions

## Overall Review Approach

Default review posture: ${getReviewPosture()}

## Auto-Close Rules

- Auto-close cases under: $${answers.autoCloseThreshold || '___'}
- Auto-close first-time violations: ${answers.autoCloseFirstTime || 'Not specified'}
  ${answers.autoCloseFirstTime === 'Yes' ? `  - Types: ${answers.autoCloseFirstTimeTypes || 'Missing receipt/memo, incorrect budget assignment, minor overage'}` : ''}
- Never auto-close: Duplicate receipts, cash-equivalent purchases, AI-generated receipts
- Auto-close if employee resolves: ${answers.autoCloseResolved || 'Not specified'}

## Escalation Triggers

- Always escalate if amount exceeds: $${answers.escalateAmount || '___'}
- Always escalate repeat violations: ${answers.escalateRepeats || 'Not specified'}
  ${answers.escalateRepeats === 'Yes' ? `  - After ${answers.escalateRepeatsCount || '___'} occurrences` : ''}
- Always escalate specific types: ${answers.escalateTypes || 'Suspected fraud, prohibited merchant, receipt/claim mismatch'}
- Escalate if no employee response within: ${answers.escalateNoResponseDays || '___'} days

## Missing Documentation

- Flag missing receipt above: $${answers.docMissingReceiptThreshold || '___'}
- Flag missing memo/business purpose above: $${answers.docMissingMemoThreshold || '___'}
- Categories requiring documentation always: ${answers.docAlwaysRequired || 'Hotels, entertainment'}
`

    return { auditRules, reviewSOP }
  }

  const { auditRules, reviewSOP } = step === 'results' ? generateDocuments() : { auditRules: '', reviewSOP: '' }

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
    question: {
      marginBottom: '32px'
    },
    label: {
      display: 'block',
      marginBottom: '12px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b'
    },
    input: {
      width: '200px',
      padding: '12px',
      fontSize: '16px',
      border: '1px solid #cbd5e1',
      borderRadius: '6px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      marginBottom: '8px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background 0.2s'
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
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {step === 'welcome' && (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '16px', color: '#1e293b' }}>
              Audit Agent Policy Setup
            </h1>
            <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px' }}>
              Build custom audit rules and review instructions for your team.<br/>
              This takes about 5 minutes.
            </p>
            <button
              onClick={nextStep}
              style={{ ...styles.button, ...styles.primaryButton }}
            >
              Get Started
            </button>
          </div>
        )}

        {step === 'upload' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Upload Your Expense Policy</h2>
              <p style={styles.subtitle}>Optional: We'll extract spend categories and limits as context</p>
            </div>
            <div style={styles.content}>
              <div style={styles.question}>
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
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
                  {policyFile ? 'Continue' : 'Skip'}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'categories' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Part 1: Audit Rules</h2>
              <p style={styles.subtitle}>Which expense categories are most relevant to your business? (Select all that apply)</p>
            </div>
            <div style={styles.content}>
              {SPEND_CATEGORIES.map(category => (
                <div
                  key={category.id}
                  style={{
                    ...styles.checkbox,
                    background: selectedCategories.includes(category.id) ? '#eff6ff' : 'transparent',
                    borderColor: selectedCategories.includes(category.id) ? '#2563eb' : '#e2e8f0'
                  }}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    readOnly
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '16px', color: '#1e293b' }}>{category.label}</span>
                </div>
              ))}
              <div style={styles.buttonGroup}>
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button
                  onClick={nextStep}
                  style={{ ...styles.button, ...styles.primaryButton }}
                  disabled={selectedCategories.length === 0}
                >
                  Continue
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'category-questions' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Part 1: Audit Rules</h2>
              <p style={styles.subtitle}>Category-specific rules</p>
            </div>
            <div style={styles.content}>
              {selectedCategories.includes('travel') && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>Travel & lodging</h3>
                  <QuestionInput
                    label="Which travel bookings should be flagged if made outside your managed travel tool?"
                    id="travelManagedTool"
                    answers={answers}
                    handleAnswer={handleAnswer}
                    type="radio"
                    options={[
                      { value: 'all', label: 'Flag all travel (hotels + flights)' },
                      { value: 'hotels', label: 'Flag hotels only' },
                      { value: 'flights', label: 'Flag flights only' },
                      { value: 'none', label: 'Not applicable (we do not use managed travel)' }
                    ]}
                  />
                  <QuestionInput label="Flag flight upgrades?" id="travelFlagUpgrades" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                  <QuestionInput label="Flag hotel stays with no corresponding trip/travel context?" id="travelFlagNoContext" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                  <QuestionInput label="Flag personal trip extensions?" id="travelFlagExtensions" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                </div>
              )}

              {selectedCategories.includes('meals') && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>Meals & entertainment</h3>
                  <QuestionInput label="At what dollar amount per person does a meal become worth reviewing?" id="mealsReviewThreshold" answers={answers} handleAnswer={handleAnswer} type="number" unit="USD" />
                  <QuestionInput label="Flag meals with no attendees listed above $___?" id="mealsFlagNoAttendees" answers={answers} handleAnswer={handleAnswer} type="number" unit="USD" />
                  <QuestionInput label="Flag meals expensed on a personal incidentals budget?" id="mealsFlagPersonalBudget" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                  <QuestionInput label="Flag 1-on-1 meals if your policy prohibits them?" id="mealsFlag1on1" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                </div>
              )}

              {selectedCategories.includes('transport') && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>Ground transportation / rideshare</h3>
                  <QuestionInput label="Flag premium rideshare (Uber Black, Lyft Lux)?" id="transportFlagPremium" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                  <QuestionInput label="Flag rides where destination suggests personal use?" id="transportFlagPersonal" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                  <QuestionInput label="Flag car rentals over $___/day?" id="transportRentalThreshold" answers={answers} handleAnswer={handleAnswer} type="number" unit="USD/day" />
                </div>
              )}

              {selectedCategories.includes('software') && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>Software & subscriptions</h3>
                  <QuestionInput label="Flag duplicate subscriptions?" id="softwareFlagDuplicates" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                  <QuestionInput label="Flag personal-category software?" id="softwareFlagPersonal" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                  <QuestionInput label="Flag recurring charges with no clear business purpose?" id="softwareFlagNoPURPOSE" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                </div>
              )}

              {selectedCategories.includes('equipment') && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>Equipment & supplies</h3>
                  <QuestionInput label="Flag single purchases over $___?" id="equipmentPurchaseThreshold" answers={answers} handleAnswer={handleAnswer} type="number" unit="USD" />
                  <QuestionInput label="Flag purchases without itemized receipt?" id="equipmentFlagNoReceipt" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                </div>
              )}

              {selectedCategories.includes('events') && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>Events & offsites</h3>
                  <QuestionInput label="Flag spend assigned to an event budget outside the event dates?" id="eventsFlagOutsideDates" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                  <QuestionInput label="Flag T&E charges on event budgets after event end date?" id="eventsFlagAfterEnd" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                </div>
              )}

              {selectedCategories.includes('gifts') && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>Gifts & client entertainment</h3>
                  <QuestionInput label="Flag gifts over $___?" id="giftsThreshold" answers={answers} handleAnswer={handleAnswer} type="number" unit="USD" />
                  <QuestionInput label="Flag gifts with no recipient or business purpose documented?" id="giftsFlagNoRecipient" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                </div>
              )}

              {selectedCategories.includes('development') && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>Professional development</h3>
                  <QuestionInput label="Flag conferences or trainings without prior approval signal?" id="developmentFlagNoApproval" answers={answers} handleAnswer={handleAnswer} type="yesno" />
                </div>
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
        )}

        {step === 'fraud' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Part 1: Audit Rules</h2>
              <p style={styles.subtitle}>Fraud vectors</p>
            </div>
            <div style={styles.content}>
              <QuestionInput label="Flag duplicate receipts?" id="fraudDuplicates" answers={answers} handleAnswer={handleAnswer} type="yesno" defaultValue="Yes" />
              <QuestionInput label="Flag receipt amount mismatches?" id="fraudMismatches" answers={answers} handleAnswer={handleAnswer} type="yesno" defaultValue="Yes" />
              <QuestionInput label="Flag AI-generated or modified receipts?" id="fraudAI" answers={answers} handleAnswer={handleAnswer} type="yesno" defaultValue="Yes" />
              <QuestionInput label="Flag split transactions?" id="fraudSplits" answers={answers} handleAnswer={handleAnswer} type="yesno" defaultValue="Yes" />
              <QuestionInput label="Flag even-dollar amounts — how many in a month before flagging?" id="fraudEvenDollarCount" answers={answers} handleAnswer={handleAnswer} type="number" unit="occurrences" />
              <QuestionInput label="Flag bulk submissions — how many expenses on same day before flagging?" id="fraudBulkCount" answers={answers} handleAnswer={handleAnswer} type="number" unit="expenses" />
              <QuestionInput label="Flag cash-equivalent purchases?" id="fraudCashEquiv" answers={answers} handleAnswer={handleAnswer} type="yesno" defaultValue="Yes" />
              <QuestionInput label="Flag new vendors over $___?" id="fraudNewVendorThreshold" answers={answers} handleAnswer={handleAnswer} type="number" unit="USD" />
              <QuestionInput label="Flag expenses submitted more than ___ days after transaction date?" id="fraudLateDays" answers={answers} handleAnswer={handleAnswer} type="number" unit="days" />

              <div style={styles.buttonGroup}>
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
                  Continue to Review Instructions
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'review-appetite' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Part 2: Review Instructions</h2>
              <p style={styles.subtitle}>Overall review appetite</p>
            </div>
            <div style={styles.content}>
              <div style={styles.question}>
                <label style={styles.label}>When a case is created, what's your default posture?</label>
                {[
                  { value: 'all', label: 'Review everything — we want a human to see all cases' },
                  { value: 'tiered', label: 'Review by risk tier — auto-close low risk, human reviews medium and high' },
                  { value: 'minimal', label: 'Minimal review — auto-close anything that does not meet a high bar' }
                ].map(option => (
                  <div
                    key={option.value}
                    style={{
                      ...styles.checkbox,
                      background: answers.reviewAppetite === option.value ? '#eff6ff' : 'transparent',
                      borderColor: answers.reviewAppetite === option.value ? '#2563eb' : '#e2e8f0'
                    }}
                    onClick={() => handleAnswer('reviewAppetite', option.value)}
                  >
                    <input
                      type="radio"
                      name="reviewAppetite"
                      checked={answers.reviewAppetite === option.value}
                      readOnly
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '16px', color: '#1e293b' }}>{option.label}</span>
                  </div>
                ))}
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
        )}

        {step === 'auto-close' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Part 2: Review Instructions</h2>
              <p style={styles.subtitle}>Auto-close rules</p>
            </div>
            <div style={styles.content}>
              <QuestionInput label="Auto-close cases where the violation amount is under $___?" id="autoCloseThreshold" answers={answers} handleAnswer={handleAnswer} type="number" unit="USD" />
              <QuestionInput label="Auto-close first-time violations?" id="autoCloseFirstTime" answers={answers} handleAnswer={handleAnswer} type="yesno" />
              {answers.autoCloseFirstTime === 'Yes' && (
                <div style={{ marginLeft: '20px', marginBottom: '24px' }}>
                  <label style={{ ...styles.label, fontSize: '14px', color: '#64748b' }}>Which types?</label>
                  <input
                    type="text"
                    value={answers.autoCloseFirstTimeTypes || ''}
                    onChange={(e) => handleAnswer('autoCloseFirstTimeTypes', e.target.value)}
                    placeholder="e.g., Missing receipt, incorrect budget assignment"
                    style={{ ...styles.input, width: '100%' }}
                  />
                </div>
              )}
              <QuestionInput label="Auto-close if employee provides a response that resolves the question?" id="autoCloseResolved" answers={answers} handleAnswer={handleAnswer} type="yesno" />

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

        {step === 'escalation' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Part 2: Review Instructions</h2>
              <p style={styles.subtitle}>Escalation triggers</p>
            </div>
            <div style={styles.content}>
              <QuestionInput label="Always escalate to human review if amount exceeds $___?" id="escalateAmount" answers={answers} handleAnswer={handleAnswer} type="number" unit="USD" />
              <QuestionInput label="Always escalate repeat violations?" id="escalateRepeats" answers={answers} handleAnswer={handleAnswer} type="yesno" />
              {answers.escalateRepeats === 'Yes' && (
                <div style={{ marginLeft: '20px', marginBottom: '24px' }}>
                  <QuestionInput label="After how many occurrences?" id="escalateRepeatsCount" answers={answers} handleAnswer={handleAnswer} type="number" unit="occurrences" />
                </div>
              )}
              <div style={styles.question}>
                <label style={styles.label}>Always escalate specific violation types regardless of amount?</label>
                <input
                  type="text"
                  value={answers.escalateTypes || ''}
                  onChange={(e) => handleAnswer('escalateTypes', e.target.value)}
                  placeholder="e.g., Suspected fraud, prohibited merchant"
                  style={{ ...styles.input, width: '100%' }}
                />
              </div>
              <QuestionInput label="Escalate if employee does not respond within ___ days?" id="escalateNoResponseDays" answers={answers} handleAnswer={handleAnswer} type="number" unit="days" />

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

        {step === 'documentation' && (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Part 2: Review Instructions</h2>
              <p style={styles.subtitle}>Missing documentation</p>
            </div>
            <div style={styles.content}>
              <QuestionInput label="Flag missing receipt above $___?" id="docMissingReceiptThreshold" answers={answers} handleAnswer={handleAnswer} type="number" unit="USD" />
              <QuestionInput label="Flag missing memo/business purpose above $___?" id="docMissingMemoThreshold" answers={answers} handleAnswer={handleAnswer} type="number" unit="USD" />
              <div style={styles.question}>
                <label style={styles.label}>Are there spend categories where documentation is always required?</label>
                <input
                  type="text"
                  value={answers.docAlwaysRequired || ''}
                  onChange={(e) => handleAnswer('docAlwaysRequired', e.target.value)}
                  placeholder="e.g., Hotels, entertainment"
                  style={{ ...styles.input, width: '100%' }}
                />
              </div>

              <div style={styles.buttonGroup}>
                <button onClick={prevStep} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Back
                </button>
                <button onClick={nextStep} style={{ ...styles.button, ...styles.primaryButton }}>
                  Generate Documents
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'results' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#1e293b' }}>
              Your Policy Documents
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px' }}>
              Download these files and use them to train your audit and review agents.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <button
                onClick={() => downloadFile(auditRules, 'audit_rules.md')}
                style={{
                  flex: 1,
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                📋 Download Audit Rules
              </button>
              <button
                onClick={() => downloadFile(reviewSOP, 'review_sop.md')}
                style={{
                  flex: 1,
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                📋 Download Review Instructions
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#1e293b' }}>
                Preview: audit_rules.md
              </h3>
              <pre style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '6px',
                fontSize: '13px',
                overflow: 'auto',
                border: '1px solid #e2e8f0',
                maxHeight: '300px'
              }}>
                {auditRules}
              </pre>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#1e293b' }}>
                Preview: review_sop.md
              </h3>
              <pre style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '6px',
                fontSize: '13px',
                overflow: 'auto',
                border: '1px solid #e2e8f0',
                maxHeight: '300px'
              }}>
                {reviewSOP}
              </pre>
            </div>

            <button
              onClick={() => {
                setStep('welcome')
                setSelectedCategories([])
                setAnswers({})
                setPolicyFile(null)
              }}
              style={{
                background: '#64748b',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionInput({ label, id, answers, handleAnswer, type, unit, defaultValue, options }) {
  const styles = {
    question: { marginBottom: '24px' },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '15px',
      fontWeight: '500',
      color: '#1e293b'
    },
    input: {
      width: type === 'number' ? '150px' : '100%',
      padding: '10px',
      fontSize: '15px',
      border: '1px solid #cbd5e1',
      borderRadius: '6px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '8px',
      transition: 'background 0.2s'
    }
  }

  if (type === 'radio' && options) {
    return (
      <div style={styles.question}>
        <label style={styles.label}>{label}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map(option => (
            <div
              key={option.value}
              style={{
                ...styles.checkbox,
                background: answers[id] === option.value ? '#eff6ff' : 'transparent',
                borderColor: answers[id] === option.value ? '#2563eb' : '#e2e8f0'
              }}
              onClick={() => handleAnswer(id, option.value)}
            >
              <input
                type="radio"
                name={id}
                checked={answers[id] === option.value}
                readOnly
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '15px', color: '#1e293b' }}>{option.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'yesno') {
    return (
      <div style={styles.question}>
        <label style={styles.label}>{label}</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          {['Yes', 'No'].map(option => (
            <div
              key={option}
              style={{
                ...styles.checkbox,
                background: answers[id] === option ? '#eff6ff' : 'transparent',
                borderColor: answers[id] === option ? '#2563eb' : '#e2e8f0',
                flex: 1
              }}
              onClick={() => handleAnswer(id, option)}
            >
              <input
                type="radio"
                name={id}
                checked={answers[id] === option}
                readOnly
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '15px', color: '#1e293b' }}>{option}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.question}>
      <label style={styles.label}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type={type}
          value={answers[id] || defaultValue || ''}
          onChange={(e) => handleAnswer(id, e.target.value)}
          style={styles.input}
        />
        {unit && <span style={{ color: '#64748b', fontSize: '14px' }}>{unit}</span>}
      </div>
    </div>
  )
}

export default App
