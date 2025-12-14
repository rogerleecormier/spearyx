import type { CategoryKeywords } from './types'

// Category keyword mappings for automatic categorization
export const categoryKeywords: CategoryKeywords[] = [
  {
    id: 1, // Programming & Development
    keywords: [
      'developer', 'engineer', 'programmer', 'software', 'frontend', 'backend',
      'full stack', 'fullstack', 'web developer', 'mobile developer', 'react',
      'angular', 'vue', 'node', 'python', 'java', 'javascript', 'typescript',
      'php', 'ruby', 'golang', 'rust', 'kotlin', 'swift', 'flutter', 'ios',
      'android', 'coding', 'dev', 'programming'
    ]
  },
  {
    id: 2, // Project Management
    keywords: [
      'project manager', 'scrum master', 'agile',
      'program manager', 'delivery manager', 'pmo', 'kanban',
      'project coordinator', 'technical project manager',
      'tpm', 'technical program manager'
    ]
  },
  {
    id: 9, // Product Management
    keywords: [
      'product manager', 'product owner', 'product lead',
      'head of product', 'vp of product', 'director of product',
      'associate product manager', 'apm', 'group product manager',
      'gpm', 'pm'
    ]
  },
  {
    id: 3, // Design
    keywords: [
      'designer', 'ui', 'ux', 'ui/ux', 'graphic design', 'web design',
      'product design', 'visual design', 'interaction design', 'figma',
      'sketch', 'adobe', 'illustrator', 'photoshop', 'creative'
    ]
  },
  {
    id: 4, // Marketing
    keywords: [
      'marketing', 'content', 'seo', 'sem', 'social media', 'digital marketing',
      'growth', 'brand', 'copywriter', 'content writer', 'marketing manager',
      'social media manager', 'email marketing', 'demand generation'
    ]
  },
  {
    id: 5, // Data Science & Analytics
    keywords: [
      'data scientist', 'data analyst', 'machine learning', 'ml', 'ai',
      'artificial intelligence', 'data engineer', 'analytics', 'business intelligence',
      'bi', 'tableau', 'power bi', 'sql', 'data', 'statistics', 'analyst'
    ]
  },
  {
    id: 6, // DevOps & Infrastructure
    keywords: [
      'devops', 'sre', 'site reliability', 'infrastructure', 'cloud', 'aws',
      'azure', 'gcp', 'kubernetes', 'docker', 'terraform', 'ci/cd',
      'jenkins', 'automation', 'system administrator', 'sysadmin'
    ]
  },
  {
    id: 7, // Customer Support
    keywords: [
      'customer support', 'customer service', 'technical support', 'help desk',
      'customer success', 'support engineer', 'support specialist', 'client success'
    ]
  },
  {
    id: 8, // Sales
    keywords: [
      'sales', 'account executive', 'bdr', 'sdr', 'business development',
      'sales representative', 'account manager', 'sales manager', 'inside sales'
    ]
  }
]

export function determineCategoryId(title: string | null | undefined, description: string | null | undefined, tags: string[] = []): number {
  const titleLower = (title || '').toLowerCase()
  const tagsLower = tags.map(t => t.toLowerCase())

  // TIER 1: Title Match (Fastest & Highest Confidence)
  // If we find a match here, we return immediately and skip description scanning.
  for (const category of categoryKeywords) {
    for (const keyword of category.keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        return category.id
      }
    }
  }

  // TIER 2: Tag Match (Fast & Medium Confidence)
  // If we find a tag match, we return immediately.
  for (const category of categoryKeywords) {
    for (const keyword of category.keywords) {
      const keywordLower = keyword.toLowerCase()
      if (tagsLower.some(t => t.includes(keywordLower))) {
        return category.id
      }
    }
  }

  // TIER 3: Description Match (Slowest & Low Confidence / Fallback)
  // Only scan description if we found NOTHING in title or tags.
  // Truncate description to safegaurd CPU even in fallback case.
  const descriptionLower = (description || '').slice(0, 2000).toLowerCase()
  if (!descriptionLower) return 1 // Programming

  let bestScore = 0
  let bestCategoryId = 1

  for (const category of categoryKeywords) {
    let score = 0
    for (const keyword of category.keywords) {
      if (descriptionLower.includes(keyword.toLowerCase())) {
        score += 1
      }
    }
    
    if (score > bestScore) {
      bestScore = score
      bestCategoryId = category.id
    }
  }
  
  return bestCategoryId
}
