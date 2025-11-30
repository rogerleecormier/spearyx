// Test insert script - run with: node test-insert.js
// This is a simple JavaScript file that tests database inserts

const testJobs = [
  {
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    description: 'Build scalable backend systems. 5+ years required. Strong in Java or Go.',
    payRange: '$150,000 - $200,000',
    sourceUrl: 'https://test.example.com/job-1',
    sourceName: 'TestSource',
    categoryId: 1,
    remoteType: 'fully_remote'
  },
  {
    title: 'Product Manager',
    company: 'StartupInc',
    description: 'Lead product strategy and roadmap for our B2B SaaS platform.',
    payRange: '$120,000 - $160,000',
    sourceUrl: 'https://test.example.com/job-2',
    sourceName: 'TestSource',
    categoryId: 1,
    remoteType: 'fully_remote'
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudTech',
    description: 'Manage Kubernetes clusters and CI/CD pipelines on AWS.',
    payRange: '$130,000 - $180,000',
    sourceUrl: 'https://test.example.com/job-3',
    sourceName: 'TestSource',
    categoryId: 1,
    remoteType: 'fully_remote'
  },
  {
    title: 'Data Analyst',
    company: 'AnalyticsPlus',
    description: 'Analyze data and create insights using SQL and Python.',
    payRange: '$90,000 - $130,000',
    sourceUrl: 'https://test.example.com/job-4',
    sourceName: 'TestSource',
    categoryId: 5,
    remoteType: 'fully_remote'
  },
  {
    title: 'UX Designer',
    company: 'DesignStudio',
    description: 'Create user experiences using Figma and user research.',
    payRange: '$100,000 - $140,000',
    sourceUrl: 'https://test.example.com/job-5',
    sourceName: 'TestSource',
    categoryId: 4,
    remoteType: 'fully_remote'
  }
];

// Log the test data as JSON that can be copied into curl or API calls
console.log('Test Jobs Data:');
console.log('===============\n');

testJobs.forEach((job, index) => {
  console.log(`Job ${index + 1}: ${job.title}`);
  console.log(`  Company: ${job.company}`);
  console.log(`  URL: ${job.sourceUrl}`);
  console.log(`  Salary: ${job.payRange}`);
  console.log(`  Description: ${job.description.substring(0, 50)}...`);
  console.log();
});

console.log('\nTo test inserts via API:');
console.log('========================');
console.log('');
console.log('1. Start the dev server:');
console.log('   npx turbo run dev');
console.log('');
console.log('2. In another terminal, test an insert with curl:');
console.log('');
testJobs.slice(0, 1).forEach(job => {
  console.log(`curl -X POST http://localhost:5173/api/test-jobs \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '${JSON.stringify(job, null, 2)}'`);
});

console.log('');
console.log('Or test via the sync page at: http://localhost:5173/jobs/sync');
console.log('');
