# Testing Guide

## Overview

This project includes a comprehensive test suite with 46 tests covering all financial calculations in the Living Standard Simulator.

## Quick Start

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with interactive UI
npm run test:ui
```

## Test Coverage

✅ **46 tests covering:**

1. **Helper Functions (9 tests)**
   - Bitcoin price retrieval
   - Date calculations (leap years, month-end handling)
   - Salary and expense timing

2. **Scenario 1: Euro-Only (4 tests)**
   - Basic balance calculations
   - Negative balances
   - Edge cases (zero salary/expenses)

3. **Scenario 2: Bitcoin No-Selling (4 tests)**
   - Bitcoin conversion
   - Accumulation over time
   - Never selling Bitcoin

4. **Scenario 3: Bitcoin With-Selling (6 tests)**
   - Selling Bitcoin for expenses
   - Using EUR cash first
   - Bitcoin depletion
   - Multiple sales

5. **Inflation & Growth (4 tests)**
   - Annual compound growth
   - Independent salary/expense multipliers
   - Year transitions

6. **Percentage Calculations (4 tests)**
   - Gain percentages
   - Division by zero handling
   - Negative balance handling

7. **Data Points & Charts (6 tests)**
   - Daily/monthly precision
   - Chart data sampling
   - Data integrity

8. **Edge Cases (9 tests)**
   - Single-day simulations
   - Multi-year transitions
   - Leap years
   - Very small/large amounts

9. **Regression Tests (3 tests)**
   - Previously fixed bugs
   - Balance consistency
   - Independent scenarios

## Test Files

- `src/lib/calculator.test.ts` - Main test suite
- `vitest.config.ts` - Test configuration
- `CALCULATION_VERIFICATION_REPORT.md` - Detailed verification report

## Test Framework

- **Framework:** Vitest 4.0.3
- **Environment:** Node.js
- **Execution Time:** ~300ms for all 46 tests

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
# Example for GitHub Actions
- name: Run tests
  run: npm test
```

## Writing New Tests

```typescript
import { describe, it, expect } from 'vitest'
import { runSimulation } from './calculator'

describe('My Feature', () => {
  it('should do something', () => {
    const inputs = createSimulationInput({
      // your test data
    })
    const results = runSimulation(inputs)
    
    expect(results.finalEuroBalance).toBe(expectedValue)
  })
})
```

## Debugging Tests

```bash
# Run specific test file
npm test calculator.test.ts

# Run tests matching pattern
npm test -- --grep "Bitcoin"

# Run with verbose output
npm test -- --reporter=verbose
```

## Coverage

To generate coverage report (if needed in future):

```bash
npm test -- --coverage
```

## Troubleshooting

### Tests not running

Make sure dependencies are installed:
```bash
npm install
```

### Tests failing

1. Check that you're on the correct branch
2. Ensure no local modifications to `calculator.ts`
3. Run `npm test -- --reporter=verbose` for detailed output

### Slow tests

The test suite should complete in under 1 second. If it's slower:
1. Check system resources
2. Restart your terminal
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [CALCULATION_VERIFICATION_REPORT.md](./CALCULATION_VERIFICATION_REPORT.md) - Detailed test results

