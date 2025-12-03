
import { extractSalaryFromDescription } from '../src/lib/job-sources/salary-utils';

const testCases = [
  {
    description: "Standard range: $100,000 - $150,000",
    input: "The salary for this position is $100,000 - $150,000 per year.",
    expected: "$100,000 - $150,000"
  },
  {
    description: "K notation: $100k - $150k",
    input: "Compensation: $100k - $150k DOE.",
    expected: "$100k - $150k"
  },
  {
    description: "K notation without dollar sign on second: $100k - 150k",
    input: "Salary range: $100k - 150k",
    expected: "$100k - 150k"
  },
  {
    description: "USD prefix: USD 120,000 - 180,000",
    input: "Base pay: USD 120,000 - 180,000",
    expected: "USD 120,000 - 180,000"
  },
  {
    description: "USD prefix with K: USD 120k - 180k",
    input: "Salary: USD 120k - 180k",
    expected: "USD 120k - 180k"
  },
  {
    description: "With text in between: $100k to $150k",
    input: "Pay is $100k to $150k",
    expected: "$100k to $150k"
  },
  {
    description: "Hourly rate: $50 - $80 per hour",
    input: "Rate: $50 - $80 per hour",
    expected: "$50 - $80"
  },
  {
    description: "Single value: $150,000+",
    input: "Salary starting at $150,000+",
    expected: "$150,000+"
  },
  {
    description: "Complex text: Salary range is $140,000—$180,000 USD",
    input: "The target salary range for this role is $140,000—$180,000 USD.",
    expected: "$140,000—$180,000 USD"
  }
];

console.log("Running Salary Extraction Tests...\n");

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = extractSalaryFromDescription(test.input);
  const isPass = result && (test.expected === result || result.includes(test.expected));
  
  if (isPass) {
    console.log(`✅ Test ${index + 1}: ${test.description}`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: ${test.description}`);
    console.log(`   Input: "${test.input}"`);
    console.log(`   Expected: "${test.expected}"`);
    console.log(`   Actual:   "${result}"`);
    failed++;
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
