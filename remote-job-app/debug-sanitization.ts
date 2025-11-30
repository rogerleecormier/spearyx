import * as cheerio from 'cheerio';

const html = `
<p>
  <span>•</span>
  <span> </span>
  Own the overall strategy and roadmap for our technology
</p>
<p><span>• Bullet and text in same span</span></p>
<p><span>•</span><span> </span>Test 2</p>
<p>• Test 3</p>
`;

const $ = cheerio.load(html);

const bulletRegex = /^[\s\u200B]*[•\-\u2022\u2023\u25E6]\s*/;

$('p').each((_, el) => {
  const $el = $(el);
  const text = $el.text().trim();
  const spanText = $el.find('span').text().trim();
  const hasBulletSpan = spanText.match(/^[•\-\u2022\u2023\u25E6]/);
  
  console.log('--- Paragraph ---');
  console.log('HTML:', $el.html()?.trim());
  console.log('Text:', text);
  console.log('Span Text:', spanText);
  console.log('Has Bullet Span:', !!hasBulletSpan);
  console.log('Matches Regex:', !!text.match(bulletRegex));
  
  if (text.match(bulletRegex) || hasBulletSpan) {
    console.log('>> DETECTED AS LIST ITEM');
    
    let content = $el.html() || '';
    
    if (hasBulletSpan) {
      const $clone = $el.clone();
      $clone.find('span').each((_, span) => {
         const $span = $(span);
         const sText = $span.text().trim();
         console.log('  Checking span:', sText);
         
         if (sText.match(/^[•\-\u2022\u2023\u25E6\u2043\u2219\u25CF\u25AA*]/)) {
           console.log('  Span starts with bullet');
           const newText = $span.text().replace(bulletRegex, '');
           console.log('  New text:', newText);
           
           if (newText.trim() === '') {
             console.log('  Removing empty span after replacement');
             $span.remove();
           } else {
             console.log('  Updating span text');
             $span.text(newText);
           }
         } else if (sText === '') {
           console.log('  Removing empty span');
           $span.remove(); 
         }
      });
      content = $clone.html() || '';
    } else {
      content = content.replace(bulletRegex, '');
    }
    
    console.log('Converted Content:', content.trim());
  } else {
    console.log('>> NOT DETECTED');
  }
});
