import { sanitizeHtml } from './src/lib/html-utils';

const leverHtml = `
<p>
  <span>•</span>
  <span> </span>
  Own the overall strategy and roadmap for our technology
</p>
<p>• Another item</p>
<p>Normal paragraph</p>
`;

console.log('Original:');
console.log(leverHtml);
console.log('\nSanitized:');
console.log(sanitizeHtml(leverHtml));
