import { useState } from 'react'
import { cn } from './lib/utils'

const SPEND_CATEGORIES = [
  { id: 'travel', label: 'Travel & Lodging', icon: '✈️', desc: 'Flights, hotels, ground transport' },
  { id: 'software', label: 'Software & SaaS', icon: '💻', desc: 'Subscriptions, licenses, tools' },
  { id: 'procurement', label: 'Procurement & Vendors', icon: '🏭', desc: 'Supplier spend, contracts' },
  { id: 'marketing', label: 'Marketing & Events', icon: '📣', desc: 'Ads, sponsorships, events' },
  { id: 'office', label: 'Office & Supplies', icon: '🏢', desc: 'Equipment, facilities, supplies' },
  { id: 'meals', label: 'Meals & Entertainment', icon: '🍽️', desc: 'Team meals, client entertainment' },
]

const STEP_SECTIONS = [
  {
    section: 'Upload Policy',
    steps: [
      { id: 'upload', label: 'Upload Document', number: 1 }
    ]
  },
  {
    section: 'Audit Rules',
    steps: [
      { id: 'spend-categories', label: 'Spend Categories', number: 2 },
      { id: 'fraud-signals', label: 'Fraud Signals', number: 3 },
      { id: 'spending-anomalies', label: 'Spending Anomalies', number: 4 }
    ]
  },
  {
    section: 'Review Instructions',
    steps: [
      { id: 'review-thresholds', label: 'Review Thresholds', number: 5 },
      { id: 'auto-close', label: 'Auto-Close Rules', number: 6 }
    ]
  },
  {
    section: 'Download Documents',
    steps: [
      { id: 'results', label: 'Review & Download', number: 7 }
    ]
  }
]

const STEPS = STEP_SECTIONS.flatMap(s => s.steps)

function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [policyFile, setPolicyFile] = useState(null)
  const [policyParsing, setPolicyParsing] = useState(false)
  const [policyInsights, setPolicyInsights] = useState(null)
  const [generatingDocs, setGeneratingDocs] = useState(false)
  const [generatedDocs, setGeneratedDocs] = useState(null)
  const [answers, setAnswers] = useState({
    // Spend Categories
    spendCategories: [],

    // Fraud Signals
    fraudDuplicates: true,
    fraudAI: true,
    fraudMismatch: true,
    fraudCashEquiv: true,
    fraudSplits: true,
    fraudPersonalSignals: true,
    fraudAdditionalContext: '',

    // Spending Anomalies
    anomalyHistorical: true,
    anomalyGeoMismatch: true,
    anomalyGeoAmount: 100,
    anomalyLateSubmission: true,
    anomalyLateDays: 30,
    anomalyNewVendor: true,
    anomalyNewVendorAmount: 500,
    anomalyRepeatViolator: true,
    anomalyRepeatCount: 3,
    anomalyRepeatAmount: 500,
    anomalyAdditionalContext: '',

    // Review Thresholds
    reviewHighAmount: 500,
    reviewAlwaysFraud: true,
    reviewAlwaysAnomaly: true,
    reviewAlwaysRepeat: true,

    // Auto-Close Rules
    autoCloseAmount: 25,
    autoCloseFirstTime: true,
    autoCloseResolved: true,
    autoCloseNoResponseDays: 7,
    autoCloseAdditionalContext: '',
  })

  const currentStep = STEPS[currentStepIndex].id

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) setCurrentStepIndex(i => i + 1)
  }
  const prevStep = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(i => i - 1)
  }
  const goToStep = (index) => {
    if (index <= currentStepIndex) setCurrentStepIndex(index)
  }

  const set = (key, value) => setAnswers(prev => ({ ...prev, [key]: value }))

  const toggleCategory = (id) => {
    setAnswers(prev => {
      const cats = prev.spendCategories
      return {
        ...prev,
        spendCategories: cats.includes(id) ? cats.filter(c => c !== id) : [...cats, id]
      }
    })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPolicyFile(file.name)
    setPolicyInsights(null)
    setPolicyParsing(true)
    try {
      const text = await file.text()
      const res = await fetch('/api/parse-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyText: text }),
      })
      const data = await res.json()
      if (data.extracted && Object.keys(data.extracted).length > 0) {
        setPolicyInsights(data.extracted)
        setAnswers(prev => ({ ...prev, ...data.extracted }))
      }
    } catch (err) {
      console.error('Policy parse failed:', err)
    } finally {
      setPolicyParsing(false)
    }
  }

  const formatFreetext = async (section, freetext) => {
    if (!freetext?.trim()) return ''
    try {
      const context = `Categories: ${answers.spendCategories.join(', ') || 'not specified'}`
      const res = await fetch('/api/format-freetext', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, context, freetext }),
      })
      const data = await res.json()
      return data.formatted || ''
    } catch (err) {
      console.error('Freetext format failed:', err)
      return freetext
    }
  }

  const handleGenerateDocs = async () => {
    setGeneratingDocs(true)
    setCurrentStepIndex(STEPS.findIndex(s => s.id === 'results'))

    const yesNo = (val) => val ? 'Yes' : 'No'
    const categoryLabels = answers.spendCategories
      .map(id => SPEND_CATEGORIES.find(c => c.id === id)?.label)
      .filter(Boolean)

    // Format all freetext fields in parallel via LLM
    const [fraudFormatted, anomalyFormatted, autoCloseFormatted] = await Promise.all([
      formatFreetext('fraudSignals', answers.fraudAdditionalContext),
      formatFreetext('spendingAnomalies', answers.anomalyAdditionalContext),
      formatFreetext('autoClose', answers.autoCloseAdditionalContext),
    ])

    const auditRules = `# Audit Rules
${categoryLabels.length > 0 ? `\n## Spend Categories\n${categoryLabels.map(l => `- ${l}`).join('\n')}\n` : ''}
## Fraud Signals
*Potential violations the audit agent will create a case for.*

| Signal | Enabled | Risk Level |
|--------|---------|------------|
| Duplicate receipts | ${yesNo(answers.fraudDuplicates)} | High |
| AI-generated or modified receipts | ${yesNo(answers.fraudAI)} | High |
| Receipt amount mismatch (claimed > receipt) | ${yesNo(answers.fraudMismatch)} | High |
| Cash-equivalent purchases (gift cards, crypto) | ${yesNo(answers.fraudCashEquiv)} | High |
| Split transactions / threshold clustering | ${yesNo(answers.fraudSplits)} | High |
| Clear personal expense signals (family names, home addresses) | ${yesNo(answers.fraudPersonalSignals)} | High |
${fraudFormatted ? fraudFormatted + '\n' : ''}
## Spending Anomalies
*Behavioral flags the audit agent will create a case for.*

| Anomaly | Enabled | Threshold | Risk Level |
|---------|---------|-----------|------------|
| Spend >2x employee's historical average | ${yesNo(answers.anomalyHistorical)} | — | Medium |
| Geographic mismatch (no travel context) | ${yesNo(answers.anomalyGeoMismatch)} | Above $${answers.anomalyGeoAmount} | Medium |
| Late submission | ${yesNo(answers.anomalyLateSubmission)} | >${answers.anomalyLateDays} days after transaction | Low |
| First-time vendor | ${yesNo(answers.anomalyNewVendor)} | Above $${answers.anomalyNewVendorAmount} | Medium |
| Repeat violator | ${yesNo(answers.anomalyRepeatViolator)} | >${answers.anomalyRepeatCount} violations/month OR cumulative >$${answers.anomalyRepeatAmount} | Medium |
${anomalyFormatted ? anomalyFormatted + '\n' : ''}`

    const reviewSOP = `# Review Instructions

## When to Review Out-of-Policy Spend

### Always Requires Human Review
${answers.reviewAlwaysFraud ? '- Any fraud signal (duplicates, AI receipts, cash equivalents, personal signals)\n' : ''}${answers.reviewAlwaysAnomaly ? '- Spending anomalies (geo mismatch, historical spike)\n' : ''}${answers.reviewAlwaysRepeat ? '- Repeat violator cases\n' : ''}- Out-of-policy spend above **$${answers.reviewHighAmount}**

### Auto-Close (No Review Required)
- Out-of-policy spend **under $${answers.autoCloseAmount}**
${answers.autoCloseFirstTime ? '- First-time procedural violations (missing receipt, vague description, incorrect budget)\n' : ''}${answers.autoCloseResolved ? '- Any case where the employee provides documentation that resolves the issue\n' : ''}${autoCloseFormatted ? autoCloseFormatted + '\n' : ''}
### Never Auto-Close
- Fraud signals (any amount)
- Spending anomalies involving geographic or behavioral red flags
- Cases involving repeat violators

## Response Time
- Escalate if employee does not respond within **${answers.autoCloseNoResponseDays} days**
`

    setGeneratedDocs({ auditRules, reviewSOP })
    setGeneratingDocs(false)
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

  const { auditRules, reviewSOP } = generatedDocs || { auditRules: '', reviewSOP: '' }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex">

      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-200 p-6 flex flex-col shrink-0">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-neutral-950">Audit & Review Agent Setup</h1>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto">
          {STEP_SECTIONS.map((section, sectionIndex) => {
            const sectionStart = STEPS.findIndex(s => s.id === section.steps[0].id)
            const sectionEnd = STEPS.findIndex(s => s.id === section.steps[section.steps.length - 1].id)
            const isActive = currentStepIndex >= sectionStart && currentStepIndex <= sectionEnd
            const isCompleted = currentStepIndex > sectionEnd

            return (
              <div key={sectionIndex}>
                <h3 className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider px-1 mb-1.5",
                  isActive && "text-orange-700",
                  isCompleted && "text-green-700",
                  !isActive && !isCompleted && "text-neutral-500"
                )}>
                  {section.section}
                </h3>

                <div className="space-y-0.5">
                  {section.steps.map((step) => {
                    const globalIndex = STEPS.findIndex(s => s.id === step.id)
                    const isStepActive = globalIndex === currentStepIndex
                    const isStepDone = globalIndex < currentStepIndex
                    const isAccessible = globalIndex <= currentStepIndex

                    return (
                      <button
                        key={step.id}
                        onClick={() => isAccessible && goToStep(globalIndex)}
                        disabled={!isAccessible}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-all",
                          isStepActive && "bg-orange-50 border border-orange-200",
                          !isStepActive && isStepDone && "hover:bg-neutral-50 cursor-pointer",
                          !isStepActive && !isStepDone && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium",
                          isStepActive && "bg-orange-600 text-white",
                          isStepDone && "bg-green-600 text-white",
                          !isStepActive && !isStepDone && "bg-neutral-200 text-neutral-600"
                        )}>
                          {isStepDone ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : step.number}
                        </div>
                        <span className={cn(
                          "text-xs font-medium truncate",
                          isStepActive && "text-orange-900",
                          !isStepActive && isStepDone && "text-neutral-700",
                          !isStepActive && !isStepDone && "text-neutral-500"
                        )}>
                          {step.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-600">Progress</span>
            <span className="font-medium text-neutral-950">{currentStepIndex + 1} of {STEPS.length}</span>
          </div>
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-600 transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-10 px-8">

          {/* ── STEP 1: Upload ── */}
          {currentStep === 'upload' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-8 py-7 border-b border-neutral-100">
                <h2 className="text-2xl font-semibold text-neutral-950">Upload Your Expense Policy</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Your policy defines what employees can and can't spend. We'll use it as the baseline — the next steps configure what to flag <em>beyond</em> standard policy violations.
                </p>
              </div>
              <div className="px-8 py-8">
                <label className="block text-sm font-medium text-neutral-700 mb-3">Policy document</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  className="text-sm text-neutral-600"
                />
                {policyFile && (
                  <p className="mt-3 text-green-600 text-sm font-medium">✓ {policyFile}</p>
                )}
                {policyParsing && (
                  <p className="mt-2 text-neutral-500 text-sm animate-pulse">Reading your policy…</p>
                )}
                {policyInsights && !policyParsing && (
                  <p className="mt-2 text-orange-700 text-sm font-medium">✦ Pre-filled settings from your policy</p>
                )}
                <div className="flex gap-3 pt-8 border-t border-neutral-100 mt-8">
                  <button onClick={nextStep} className="h-10 px-5 rounded-xl bg-neutral-950 text-neutral-50 text-sm font-medium hover:bg-neutral-800 shadow-sm transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-neutral-950/30">
                    {policyFile ? 'Continue' : 'Skip for now'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Spend Categories ── */}
          {currentStep === 'spend-categories' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-8 py-7 border-b border-neutral-100">
                <h2 className="text-2xl font-semibold text-neutral-950">Spend Categories</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Which categories best describe your organization's typical spend? We'll use this to tailor the audit rules to your use case.
                </p>
              </div>
              <div className="px-8 py-8">
                <div className="grid grid-cols-2 gap-3">
                  {SPEND_CATEGORIES.map(({ id, label, icon, desc }) => {
                    const selected = answers.spendCategories.includes(id)
                    return (
                      <button
                        key={id}
                        onClick={() => toggleCategory(id)}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                          selected
                            ? "border-orange-300 bg-orange-50 shadow-sm"
                            : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                        )}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{icon}</span>
                        <div>
                          <p className={cn(
                            "text-sm font-medium",
                            selected ? "text-orange-900" : "text-neutral-900"
                          )}>{label}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                        </div>
                        {selected && (
                          <div className="ml-auto shrink-0">
                            <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-8 border-t border-neutral-100 mt-8">
                  <button
                    onClick={prevStep}
                    className="h-10 px-4 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-neutral-300/50"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="h-10 px-5 rounded-xl bg-neutral-950 text-neutral-50 text-sm font-medium hover:bg-neutral-800 shadow-sm transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-neutral-950/30"
                  >
                    {answers.spendCategories.length > 0 ? 'Continue' : 'Skip for now'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Fraud Signals ── */}
          {currentStep === 'fraud-signals' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-8 py-7 border-b border-neutral-100">
                <h2 className="text-2xl font-semibold text-neutral-950">Fraud Signals</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Which potential fraud violations should the audit agent create a case for?
                </p>
              </div>
              <div className="px-8 py-8 space-y-4">
                {[
                  { key: 'fraudDuplicates', label: 'Duplicate receipts', desc: 'Same receipt submitted more than once' },
                  { key: 'fraudAI', label: 'AI-generated or modified receipts', desc: 'Receipts that appear digitally altered or AI-generated' },
                  { key: 'fraudMismatch', label: 'Receipt amount mismatch', desc: 'Claimed amount exceeds the receipt amount' },
                  { key: 'fraudCashEquiv', label: 'Cash-equivalent purchases', desc: 'Gift cards, money orders, crypto, money transfers' },
                  { key: 'fraudSplits', label: 'Split transactions / threshold clustering', desc: 'Multiple charges just below an approval threshold' },
                  { key: 'fraudPersonalSignals', label: 'Clear personal expense signals', desc: 'Family member names on receipts, personal addresses as destinations' },
                ].map(({ key, label, desc }) => (
                  <ToggleRow
                    key={key}
                    label={label}
                    desc={desc}
                    value={answers[key]}
                    onChange={(v) => set(key, v)}
                  />
                ))}

                <div className="pt-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Anything else you'd want the audit agent to flag?
                  </label>
                  <textarea
                    value={answers.fraudAdditionalContext}
                    onChange={(e) => set('fraudAdditionalContext', e.target.value)}
                    placeholder="e.g. Flag any expense over $200 at a bar or nightclub, even with a valid receipt..."
                    rows={3}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-xs resize-none transition-colors focus-visible:outline-none focus-visible:border-neutral-900 focus-visible:ring-[3px] focus-visible:ring-neutral-900/10"
                  />
                </div>

                <NavButtons onBack={prevStep} onNext={nextStep} />
              </div>
            </div>
          )}

          {/* ── STEP 4: Spending Anomalies ── */}
          {currentStep === 'spending-anomalies' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-8 py-7 border-b border-neutral-100">
                <h2 className="text-2xl font-semibold text-neutral-950">Spending Anomalies</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Which spending anomalies should the audit agent create a case for?
                </p>
              </div>
              <div className="px-8 py-8 space-y-6">

                <ToggleRow
                  label="Historical spending spike"
                  desc="Flag when an employee spends more than 2× their personal historical average in a period"
                  value={answers.anomalyHistorical}
                  onChange={(v) => set('anomalyHistorical', v)}
                />

                <div className="space-y-3">
                  <ToggleRow
                    label="Geographic mismatch"
                    desc="Spend in a distant location with no associated travel context"
                    value={answers.anomalyGeoMismatch}
                    onChange={(v) => set('anomalyGeoMismatch', v)}
                  />
                  {answers.anomalyGeoMismatch && (
                    <div className="ml-6">
                      <AmountInput label="Flag above" value={answers.anomalyGeoAmount} onChange={(v) => set('anomalyGeoAmount', v)} />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <ToggleRow
                    label="Late submissions"
                    desc="Expenses submitted long after the transaction date"
                    value={answers.anomalyLateSubmission}
                    onChange={(v) => set('anomalyLateSubmission', v)}
                  />
                  {answers.anomalyLateSubmission && (
                    <div className="ml-6">
                      <AmountInput label="Flag if submitted more than" value={answers.anomalyLateDays} onChange={(v) => set('anomalyLateDays', v)} unit="days after transaction" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <ToggleRow
                    label="First-time vendor"
                    desc="Spend with a vendor this employee has never used before"
                    value={answers.anomalyNewVendor}
                    onChange={(v) => set('anomalyNewVendor', v)}
                  />
                  {answers.anomalyNewVendor && (
                    <div className="ml-6">
                      <AmountInput label="Flag above" value={answers.anomalyNewVendorAmount} onChange={(v) => set('anomalyNewVendorAmount', v)} />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <ToggleRow
                    label="Repeat violator"
                    desc="Employee with a pattern of policy violations"
                    value={answers.anomalyRepeatViolator}
                    onChange={(v) => set('anomalyRepeatViolator', v)}
                  />
                  {answers.anomalyRepeatViolator && (
                    <div className="ml-6 space-y-3">
                      <AmountInput label="Flag after" value={answers.anomalyRepeatCount} onChange={(v) => set('anomalyRepeatCount', v)} unit="violations in a month" />
                      <AmountInput label="Or cumulative out-of-policy spend above" value={answers.anomalyRepeatAmount} onChange={(v) => set('anomalyRepeatAmount', v)} />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Anything else you'd want the audit agent to flag?
                  </label>
                  <textarea
                    value={answers.anomalyAdditionalContext}
                    onChange={(e) => set('anomalyAdditionalContext', e.target.value)}
                    placeholder="e.g. Flag if an employee submits more than 10 expenses in a single day, even if each is within policy..."
                    rows={3}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-xs resize-none transition-colors focus-visible:outline-none focus-visible:border-neutral-900 focus-visible:ring-[3px] focus-visible:ring-neutral-900/10"
                  />
                </div>

                <NavButtons onBack={prevStep} onNext={nextStep} />
              </div>
            </div>
          )}

          {/* ── STEP 5: Review Thresholds ── */}
          {currentStep === 'review-thresholds' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-8 py-7 border-b border-neutral-100">
                <h2 className="text-2xl font-semibold text-neutral-950">Review Thresholds</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  For cases created from out-of-policy spend, when do you want a human to review?
                </p>
              </div>
              <div className="px-8 py-8 space-y-6">

                <AmountInput
                  label="Always escalate to human review if out-of-policy amount exceeds"
                  value={answers.reviewHighAmount}
                  onChange={(v) => set('reviewHighAmount', v)}
                />

                <div className="space-y-3">
                  <p className="text-sm font-medium text-neutral-700">Also always require review for:</p>
                  {[
                    { key: 'reviewAlwaysFraud', label: 'Any fraud signal', desc: 'Duplicates, AI receipts, cash equivalents, personal signals' },
                    { key: 'reviewAlwaysAnomaly', label: 'Spending anomalies', desc: 'Geographic mismatches, historical spikes' },
                    { key: 'reviewAlwaysRepeat', label: 'Repeat violators', desc: 'Employees with a pattern of violations' },
                  ].map(({ key, label, desc }) => (
                    <ToggleRow key={key} label={label} desc={desc} value={answers[key]} onChange={(v) => set(key, v)} />
                  ))}
                </div>

                <NavButtons onBack={prevStep} onNext={nextStep} />
              </div>
            </div>
          )}

          {/* ── STEP 6: Auto-Close Rules ── */}
          {currentStep === 'auto-close' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-8 py-7 border-b border-neutral-100">
                <h2 className="text-2xl font-semibold text-neutral-950">Auto-Close Rules</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  When should cases be resolved without requiring a human to review?
                </p>
              </div>
              <div className="px-8 py-8 space-y-6">

                <AmountInput
                  label="Auto-close out-of-policy spend under"
                  value={answers.autoCloseAmount}
                  onChange={(v) => set('autoCloseAmount', v)}
                />

                <ToggleRow
                  label="Auto-close first-time procedural violations"
                  desc="Missing receipt, vague description, incorrect budget assignment — on first occurrence only"
                  value={answers.autoCloseFirstTime}
                  onChange={(v) => set('autoCloseFirstTime', v)}
                />

                <ToggleRow
                  label="Auto-close when employee resolves the issue"
                  desc="Employee provides documentation or explanation that addresses the violation"
                  value={answers.autoCloseResolved}
                  onChange={(v) => set('autoCloseResolved', v)}
                />

                <AmountInput
                  label="Escalate if employee doesn't respond within"
                  value={answers.autoCloseNoResponseDays}
                  onChange={(v) => set('autoCloseNoResponseDays', v)}
                  unit="days"
                />

                <div className="pt-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Any other cases you'd want to auto-close?
                  </label>
                  <textarea
                    value={answers.autoCloseAdditionalContext}
                    onChange={(e) => set('autoCloseAdditionalContext', e.target.value)}
                    placeholder="e.g. Auto-close cases where the manager has already approved the expense offline..."
                    rows={3}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-xs resize-none transition-colors focus-visible:outline-none focus-visible:border-neutral-900 focus-visible:ring-[3px] focus-visible:ring-neutral-900/10"
                  />
                </div>

                <NavButtons onBack={prevStep} onNext={handleGenerateDocs} nextLabel="Generate Documents" />
              </div>
            </div>
          )}

          {/* ── STEP 7: Results ── */}
          {currentStep === 'results' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-8 py-7 border-b border-neutral-100">
                <h2 className="text-2xl font-semibold text-neutral-950">Your Generated Documents</h2>
                <p className="text-sm text-neutral-500 mt-1">Download and upload these to configure your audit and review agents.</p>
              </div>
              <div className="px-8 py-8 space-y-6">

                {generatingDocs ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-neutral-500 animate-pulse">Generating your documents…</p>
                  </div>
                ) : (
                  <>
                    <DocCard
                      title="audit_rules.md"
                      desc="Tells the audit agent what to flag — fraud signals and spending anomalies with risk levels."
                      content={auditRules}
                      filename="audit_rules.md"
                      downloadFile={downloadFile}
                    />

                    <DocCard
                      title="review_sop.md"
                      desc="Tells the review agent when to escalate to a human and when to auto-close."
                      content={reviewSOP}
                      filename="review_sop.md"
                      downloadFile={downloadFile}
                    />

                    <div className="pt-2">
                      <button
                        onClick={() => { setCurrentStepIndex(0); setPolicyFile(null); setGeneratedDocs(null); setPolicyInsights(null) }}
                        className="h-9 px-4 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 transition-all active:scale-[0.98]"
                      >
                        Start over
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Shared Components ──

function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        {desc && <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>}
      </div>
      <div className="flex gap-2 shrink-0 mt-0.5">
        <button
          onClick={() => onChange(true)}
          className={cn(
            "h-7 px-3 rounded-md text-xs font-medium transition-all",
            value === true
              ? "bg-neutral-950 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={cn(
            "h-7 px-3 rounded-md text-xs font-medium transition-all",
            value === false
              ? "bg-neutral-950 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          No
        </button>
      </div>
    </div>
  )
}

function AmountInput({ label, value, onChange, unit = 'USD' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        {unit === 'USD' && <span className="text-neutral-500 text-sm">$</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-32 h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-xs transition-colors focus-visible:outline-none focus-visible:border-neutral-900 focus-visible:ring-[3px] focus-visible:ring-neutral-900/10"
        />
        {unit !== 'USD' && <span className="text-neutral-500 text-sm">{unit}</span>}
      </div>
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = 'Continue' }) {
  return (
    <div className="flex gap-3 pt-6 border-t border-neutral-100 mt-2">
      <button
        onClick={onBack}
        className="h-10 px-4 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-neutral-300/50"
      >
        Back
      </button>
      <button
        onClick={onNext}
        className="h-10 px-5 rounded-xl bg-neutral-950 text-neutral-50 text-sm font-medium hover:bg-neutral-800 shadow-sm transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-neutral-950/30"
      >
        {nextLabel}
      </button>
    </div>
  )
}

function DocCard({ title, desc, content, filename, downloadFile }) {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-neutral-50 border-b border-neutral-200 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
        </div>
        <button
          onClick={() => downloadFile(content, filename)}
          className="shrink-0 h-8 px-3 rounded-lg bg-neutral-950 text-white text-xs font-medium hover:bg-neutral-800 transition-all active:scale-[0.98]"
        >
          Download
        </button>
      </div>
      <details className="group">
        <summary className="px-5 py-3 text-xs font-medium text-neutral-500 cursor-pointer hover:text-neutral-700 hover:bg-neutral-50 transition-colors list-none flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Preview
        </summary>
        <pre className="px-5 py-4 text-xs text-neutral-600 bg-white whitespace-pre-wrap leading-relaxed border-t border-neutral-100 font-mono">
          {content}
        </pre>
      </details>
    </div>
  )
}

export default App
