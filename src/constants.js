// Expense categories
export const SPEND_CATEGORIES = [
  { id: 'travel', label: 'Travel & lodging' },
  { id: 'meals', label: 'Meals & entertainment' },
  { id: 'transport', label: 'Ground transportation' },
  { id: 'equipment', label: 'Equipment & office supplies' },
  { id: 'events', label: 'Events & offsites' },
  { id: 'gifts', label: 'Client gifts & entertainment' },
  { id: 'software', label: 'Software subscriptions' },
  { id: 'development', label: 'Professional development' }
]

// Risk tolerance presets
export const RISK_TOLERANCE_DEFAULTS = {
  strict: {
    highPrioritySingle: 250,
    largeTransaction: 500,
    missingReceipt: 75,
    missingMemo: 75,
    smallViolation: 50,
    patternThreshold: 100,
    geoMismatchAmount: 50,
    lateSubmissionDays: 14,
    newVendorAmount: 250,
    repeatViolationAmount: 250
  },
  balanced: {
    highPrioritySingle: 500,
    largeTransaction: 1000,
    missingReceipt: 150,
    missingMemo: 150,
    smallViolation: 100,
    patternThreshold: 150,
    geoMismatchAmount: 100,
    lateSubmissionDays: 30,
    newVendorAmount: 500,
    repeatViolationAmount: 500
  },
  lenient: {
    highPrioritySingle: 1000,
    largeTransaction: 2000,
    missingReceipt: 250,
    missingMemo: 250,
    smallViolation: 200,
    patternThreshold: 300,
    geoMismatchAmount: 200,
    lateSubmissionDays: 60,
    newVendorAmount: 1000,
    repeatViolationAmount: 1000
  }
}

// Review capacity presets
export const REVIEW_CAPACITY_DEFAULTS = {
  high: {
    autoCloseAmount: 10,
    autoCloseFirstTime: false,
    autoCloseResolved: false,
    escalateAmount: 250,
    escalateRepeatsCount: 2,
    escalateCumulativeAmount: 250,
    escalateNoResponseDays: 5
  },
  medium: {
    autoCloseAmount: 15,
    autoCloseFirstTime: true,
    autoCloseResolved: true,
    escalateAmount: 500,
    escalateRepeatsCount: 3,
    escalateCumulativeAmount: 500,
    escalateNoResponseDays: 7
  },
  low: {
    autoCloseAmount: 25,
    autoCloseFirstTime: true,
    autoCloseResolved: true,
    escalateAmount: 1000,
    escalateRepeatsCount: 5,
    escalateCumulativeAmount: 1000,
    escalateNoResponseDays: 10
  }
}
