import { useState } from 'react'

function App() {
  const [step, setStep] = useState('welcome') // welcome, questions, results
  const [answers, setAnswers] = useState({})

  const questions = [
    {
      id: 'hardFloor',
      question: 'What is the minimum expense amount that should be audited?',
      subtitle: 'Expenses below this amount will never create audit cases',
      type: 'number',
      placeholder: '100',
      unit: 'USD'
    },
    {
      id: 'docThreshold',
      question: 'At what amount should missing receipts be flagged?',
      subtitle: 'Missing documentation below this amount will be ignored',
      type: 'number',
      placeholder: '150',
      unit: 'USD'
    },
    {
      id: 'highPriority',
      question: 'What amount triggers high-priority review?',
      subtitle: 'Single violations above this amount are escalated immediately',
      type: 'number',
      placeholder: '500',
      unit: 'USD'
    },
    {
      id: 'autoCloseThreshold',
      question: 'What is the maximum amount for auto-closing cases?',
      subtitle: 'Cases below this amount can be automatically resolved',
      type: 'number',
      placeholder: '15',
      unit: 'USD'
    }
  ]

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const generateDocuments = () => {
    const hardFloor = answers.hardFloor || '100'
    const docThreshold = answers.docThreshold || '150'
    const highPriority = answers.highPriority || '500'
    const autoClose = answers.autoCloseThreshold || '15'

    const auditRules = `# Expense Audit Rules

## Key Thresholds

| Threshold | Amount | Description |
| --- | --- | --- |
| Hard floor | $${hardFloor} | No cases created below this amount |
| Documentation requirement | $${docThreshold} | Missing receipt/memo only flagged above this |
| High-priority trigger | $${highPriority} | Single violation triggers HIGH priority |

## Exclusion Criteria (No Case)

Check first. If any exclusion applies, do not create a case.

| Category | Exclusion Rule |
| --- | --- |
| Amount-based | Expense < $${hardFloor} (regardless of other signals) |
| Documentation | Missing receipt, vague memo, or missing business purpose on expenses < $${docThreshold} |

## High Risk (Create Case Immediately)

| Signal | Threshold | Examples |
| --- | --- | --- |
| Prohibited merchant | Any amount | Gambling, Casinos, adult entertainment |
| Personal services | Any amount | Massage, beauty, personal shopping |
| Single large violation | > $${highPriority} | Any policy violation exceeding $${highPriority} |
`

    const reviewSOP = `# Review Instructions

## Purpose

Determine which flagged cases can be automatically resolved vs. escalated for human review.

## Default Auto-Close Scenarios

### Always auto-close when:

- Financial impact less than $${autoClose} USD or equivalent currency
- Incorrect budget/spend limit assignment, unless total impact >$250
- Employees provide missing documentation within policy requirements
- Employees provide missing or vague business justification, and expense isn't otherwise problematic
- Minor timing discrepancies explained by timezones or processing delays
- Violating expenses are refunded
- No or Low Risk cases
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {step === 'welcome' && (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '16px', color: '#1e293b' }}>
              Audit Agent Setup
            </h1>
            <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px' }}>
              Answer a few questions to generate custom audit rules and review instructions for your team.
            </p>
            <button
              onClick={() => setStep('questions')}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.background = '#2563eb'}
            >
              Get Started
            </button>
          </div>
        )}

        {step === 'questions' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '32px', color: '#1e293b' }}>
              Policy Questions
            </h2>
            {questions.map((q, index) => (
              <div key={q.id} style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                    {index + 1}. {q.question}
                  </span>
                  {q.subtitle && (
                    <span style={{ display: 'block', fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                      {q.subtitle}
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type={q.type}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    style={{
                      width: '150px',
                      padding: '12px',
                      fontSize: '16px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px'
                    }}
                  />
                  {q.unit && <span style={{ color: '#64748b', fontSize: '14px' }}>{q.unit}</span>}
                </div>
              </div>
            ))}
            <button
              onClick={() => setStep('results')}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Generate Documents
            </button>
          </div>
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
                border: '1px solid #e2e8f0'
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
                border: '1px solid #e2e8f0'
              }}>
                {reviewSOP}
              </pre>
            </div>

            <button
              onClick={() => {
                setStep('welcome')
                setAnswers({})
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

export default App
