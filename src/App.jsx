import { useState } from 'react'
import { cn } from './lib/utils'

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
      { id: 'fraud-signals', label: 'Fraud Signals', number: 2 },
      { id: 'spending-anomalies', label: 'Spending Anomalies', number: 3 }
    ]
  },
  {
    section: 'Review Instructions',
    steps: [
      { id: 'review-thresholds', label: 'Review Thresholds', number: 4 },
      { id: 'auto-close', label: 'Auto-Close Rules', number: 5 }
    ]
  },
  {
    section: 'Download Documents',
    steps: [
      { id: 'results', label: 'Review & Download', number: 6 }
    ]
  }
]

const STEPS = STEP_SECTIONS.flatMap(s => s.steps)

function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [policyFile, setPolicyFile] = useState(null)
  const [answers, setAnswers] = useState({
    // Fraud Signals
    fraudDuplicates: true,
    fraudAI: true,
    fraudMismatch: true,
    fraudCashEquiv: true,
    fraudSplits: true,
    fraudPersonalSignals: true,

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) setPolicyFile(file.name)
  }

  const generateDocuments = () => {
    const yesNo = (val) => val ? 'Yes' : 'No'

    const auditRules = `# Audit Rules

## Fraud Signals
*These are flagged regardless of amount and always require human review.*

| Signal | Enabled | Risk Level |
|--------|---------|------------|
| Duplicate receipts | ${yesNo(answers.fraudDuplicates)} | High |
| AI-generated or modified receipts | ${yesNo(answers.fraudAI)} | High |
| Receipt amount mismatch (claimed > receipt) | ${yesNo(answers.fraudMismatch)} | High |
| Cash-equivalent purchases (gift cards, crypto) | ${yesNo(answers.fraudCashEquiv)} | High |
| Split transactions / threshold clustering | ${yesNo(answers.fraudSplits)} | High |
| Clear personal expense signals (family names, home addresses) | ${yesNo(answers.fraudPersonalSignals)} | High |

## Spending Anomalies
*Behavioral flags that may indicate misuse even when individual transactions look valid.*

| Anomaly | Enabled | Threshold | Risk Level |
|---------|---------|-----------|------------|
| Spend >2x employee's historical average | ${yesNo(answers.anomalyHistorical)} | — | Medium |
| Geographic mismatch (no travel context) | ${yesNo(answers.anomalyGeoMismatch)} | Above $${answers.anomalyGeoAmount} | Medium |
| Late submission | ${yesNo(answers.anomalyLateSubmission)} | >${answers.anomalyLateDays} days after transaction | Low |
| First-time vendor | ${yesNo(answers.anomalyNewVendor)} | Above $${answers.anomalyNewVendorAmount} | Medium |
| Repeat violator | ${yesNo(answers.anomalyRepeatViolator)} | >${answers.anomalyRepeatCount} violations/month OR cumulative >$${answers.anomalyRepeatAmount} | Medium |
`

    const reviewSOP = `# Review Instructions

## When to Review Out-of-Policy Spend

### Always Requires Human Review
${answers.reviewAlwaysFraud ? '- Any fraud signal (duplicates, AI receipts, cash equivalents, personal signals)\n' : ''}${answers.reviewAlwaysAnomaly ? '- Spending anomalies (geo mismatch, historical spike)\n' : ''}${answers.reviewAlwaysRepeat ? '- Repeat violator cases\n' : ''}- Out-of-policy spend above **$${answers.reviewHighAmount}**

### Auto-Close (No Review Required)
- Out-of-policy spend **under $${answers.autoCloseAmount}**
${answers.autoCloseFirstTime ? '- First-time procedural violations (missing receipt, vague description, incorrect budget)\n' : ''}${answers.autoCloseResolved ? '- Any case where the employee provides documentation that resolves the issue\n' : ''}
### Never Auto-Close
- Fraud signals (any amount)
- Spending anomalies involving geographic or behavioral red flags
- Cases involving repeat violators

## Response Time
- Escalate if employee does not respond within **${answers.autoCloseNoResponseDays} days**
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

  const { auditRules, reviewSOP } = currentStep === 'results'
    ? generateDocuments()
    : { auditRules: '', reviewSOP: '' }

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
                <div className="flex gap-3 pt-8 border-t border-neutral-100 mt-8">
                  <button onClick={nextStep} className="h-10 px-5 rounded-xl bg-neutral-950 text-neutral-50 text-sm font-medium hover:bg-neutral-800 shadow-sm transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-neutral-950/30">
                    {policyFile ? 'Continue' : 'Skip for now'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Fraud Signals ── */}
          {currentStep === 'fraud-signals' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-8 py-7 border-b border-neutral-100">
                <h2 className="text-2xl font-semibold text-neutral-950">Fraud Signals</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  These are always flagged for human review regardless of amount. Deselect any that don't apply to your organization.
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

                <NavButtons onBack={prevStep} onNext={nextStep} />
              </div>
            </div>
          )}

          {/* ── STEP 3: Spending Anomalies ── */}
          {currentStep === 'spending-anomalies' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-8 py-7 border-b border-neutral-100">
                <h2 className="text-2xl font-semibold text-neutral-950">Spending Anomalies</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Behavioral patterns that may indicate misuse even when individual transactions appear valid.
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

                <NavButtons onBack={prevStep} onNext={nextStep} />
              </div>
            </div>
          )}

          {/* ── STEP 4: Review Thresholds ── */}
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

          {/* ── STEP 5: Auto-Close Rules ── */}
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

                <NavButtons onBack={prevStep} onNext={nextStep} nextLabel="Generate Documents" />
              </div>
            </div>
          )}

          {/* ── STEP 6: Results ── */}
          {currentStep === 'results' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-8 py-7 border-b border-neutral-100">
                <h2 className="text-2xl font-semibold text-neutral-950">Your Generated Documents</h2>
                <p className="text-sm text-neutral-500 mt-1">Download and upload these to configure your audit and review agents.</p>
              </div>
              <div className="px-8 py-8 space-y-6">

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
                    onClick={() => { setCurrentStepIndex(0); setPolicyFile(null) }}
                    className="h-9 px-4 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 transition-all active:scale-[0.98]"
                  >
                    Start over
                  </button>
                </div>
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
