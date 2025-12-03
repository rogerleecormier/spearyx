import * as cheerio from 'cheerio'

/**
 * Sanitizes HTML while preserving basic formatting
 * Keeps: <p>, <br>, <b>, <strong>, <i>, <em>, <u>, <ul>, <li>, <h1-h6>
 * Removes: <script>, <style>, dangerous attributes, inline styles
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  
  // First fix common encoding issues before processing
  let cleaned = html
    .replace(/&nbsp;/g, ' ') // Replace literal &nbsp; with space
    .replace(/\u00A0/g, ' ') // Replace non-breaking space char with space
    .replace(/â€™/g, "'")   // Right single quote
    .replace(/â€œ/g, '"')   // Left double quote
    .replace(/â€/g, '"')    // Right double quote
    .replace(/â€“/g, '–')   // En dash
    .replace(/â€”/g, '—')   // Em dash
    .replace(/â€¢/g, '•')   // Bullet
    .replace(/Â/g, '')      // Non-breaking space artifact
    .replace(/\\n/g, '') // Remove literal \n characters
  
  // Load HTML with cheerio
  const $ = cheerio.load(cleaned)
  
  // Remove dangerous tags entirely
  $('script, style, iframe, object, embed, form, input').remove()
  
  // Remove all attributes (styles, classes, IDs, etc.)
  $('*').each((_, el) => {
    if (el.type === 'tag') {
      const $el = $(el)
      const attrs = $el.attr()
      if (attrs) {
        Object.keys(attrs).forEach(attr => {
          $el.removeAttr(attr)
        })
      }
    }
  })
  
  // Remove links but keep their text content
  $('a').each((_, el) => {
    const text = $(el).text()
    $(el).replaceWith(text)
  })
  
  // Convert div tags to paragraphs for better spacing, but avoid invalid nesting
  $('div').each((_, el) => {
    const $el = $(el)
    // If div contains block elements, unwrap it to avoid <p><div>...</div></p> or <p><p>...</p></p>
    if ($el.find('p, ul, ol, div, h1, h2, h3, h4, h5, h6, blockquote, pre').length > 0) {
       $el.replaceWith($el.html() || '')
    } else {
       // Otherwise it's likely text or inline elements, wrap in p
       const content = $el.html()
       if (content && content.trim()) {
         $el.replaceWith(`<p>${content}</p>`)
       } else {
         $el.remove()
       }
    }
  })
  
  // Headings are now allowed (h1-h6), so we don't convert them
  
  // Convert "fake" lists (paragraphs starting with bullets) to real lists
  // Lever often does: <p><span>•</span> Text</p> or <p>• Text</p>
  // Regex includes: •, -, ⁃, ∙, ●, ▪, *, · (middle dot), and various unicode bullets
  const bulletRegex = /^[\s\u200B]*[•\-\u2022\u2023\u25E6\u2043\u2219\u25CF\u25AA*·]\s*/;
  
  // First pass: identify and mark potential list items
  $('p').each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    const spanText = $el.find('span').text().trim();
    const hasBulletSpan = spanText.match(/^[•\-\u2022\u2023\u25E6\u2043\u2219\u25CF\u25AA*·]/);
    
    if (text.match(bulletRegex) || hasBulletSpan) {
      // Remove the bullet character/span from the content
      let content = $el.html() || '';
      
      // If it has a span bullet, remove the bullet from the span
      if (hasBulletSpan) {
        const $clone = $el.clone();
        $clone.find('span').each((_, span) => {
           const $span = $(span);
           const sText = $span.text().trim();
           // Check if this span starts with a bullet
           if (sText.match(/^[•\-\u2022\u2023\u25E6\u2043\u2219\u25CF\u25AA*·]/)) {
             // Replace the bullet in the text, keeping the rest
             const newText = $span.text().replace(bulletRegex, '');
             if (newText.trim() === '') {
               $span.remove();
             } else {
               $span.text(newText);
             }
           } else if (sText === '') {
             $span.remove();
           }
        });
        content = $clone.html() || '';
      } else {
        // Text bullet, remove via regex
        content = content.replace(bulletRegex, '');
      }
      
      $el.replaceWith(`<li data-converted="true">${content.trim()}</li>`);
    }
  });

  // Second pass: Wrap consecutive <li> elements in <ul>
  // We iterate through all converted li elements and group them
  $('li[data-converted="true"]').each((_, el) => {
    const $el = $(el);
    // Remove the marker attribute
    $el.removeAttr('data-converted');
    
    // Check if previous sibling is a UL
    const $prev = $el.prev();
    if ($prev.length > 0 && $prev[0].tagName === 'ul') {
      // Append to existing UL
      $prev.append($el);
    } else {
      // Create new UL and wrap this LI
      const $ul = $('<ul></ul>');
      $el.before($ul);
      $ul.append($el);
    }
  });

  // Lists are preserved as is

  
  // Get the sanitized HTML
  const bodyHtml = $('body').html()
  let sanitized = bodyHtml || ''
  
  // Clean up excessive whitespace and empty tags
  sanitized = sanitized
    .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
    .replace(/<p>\s*•\s*<\/p>/g, '') // Remove empty bullet points
    .replace(/<p><br\s*\/?><\/p>/g, '') // Remove paragraphs with only br
    .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '<br>') // Remove duplicate breaks
    .replace(/\s+/g, ' ') // Normalize whitespace to single spaces
    .replace(/<\/p>\s*<p>/g, '</p><p>') // Clean paragraph spacing
    .replace(/\\n/g, '') // Remove any remaining literal \n
    .trim()
  
  return sanitized
}

/**
 * Decodes HTML entities and fixes common UTF-8/Latin-1 mojibake issues
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return ''
  
  // 1. Basic named entities lookup
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&ndash;': '–',
    '&mdash;': '—',
    '&bull;': '•',
    '&middot;': '·',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&euro;': '€',
    '&pound;': '£',
    '&cent;': '¢',
    '&yen;': '¥',
  }

  // 2. Replace named entities
  let decoded = text.replace(/&[a-zA-Z0-9]+;/g, (match) => {
    return entities[match] || match
  })

  // 3. Replace numeric entities (decimal and hex)
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  // 4. Fix common UTF-8 mojibake (text that was UTF-8 but decoded as Latin-1)
  decoded = decoded
    // Quotes
    .replace(/â€™/g, "'")   // Right single quote (')
    .replace(/â€˜/g, "'")   // Left single quote (')
    .replace(/â€œ/g, '"')   // Left double quote (")
    .replace(/â€/g, '"')    // Right double quote (")
    .replace(/â€¦/g, '…')   // Ellipsis
    
    // Dashes
    .replace(/â€"/g, '–')   // En dash
    .replace(/â€"/g, '—')   // Em dash
    
    // Bullets and symbols
    .replace(/â€¢/g, '•')   // Bullet
    .replace(/Â·/g, '·')    // Middle dot
    .replace(/Â®/g, '®')    // Registered trademark
    .replace(/Â©/g, '©')    // Copyright
    .replace(/â„¢/g, '™')   // Trademark
    
    // Spaces and formatting
    .replace(/Â/g, '')      // Non-breaking space artifacts
    .replace(/\u00A0/g, ' ') // Non-breaking space to regular space
    
    // Other common mojibake patterns
    .replace(/Ã©/g, 'é')    // e with acute
    .replace(/Ã¨/g, 'è')    // e with grave
    .replace(/Ã /g, 'à')    // a with grave
    .replace(/Ã¡/g, 'á')    // a with acute
    .replace(/Ã­/g, 'í')    // i with acute
    .replace(/Ã³/g, 'ó')    // o with acute
    .replace(/Ãº/g, 'ú')    // u with acute
    .replace(/Ã±/g, 'ñ')    // n with tilde
  
  return decoded
}

/**
 * Truncates HTML to a specific length while preserving tags
 */
export function truncateHtml(html: string, maxLength: number = 500): string {
  const $ = cheerio.load(html)
  const text = $.text()
  
  if (text.length <= maxLength) return html
  
  // If too long, truncate and add ellipsis
  const truncated = html.substring(0, maxLength)
  return truncated + '...'
}
