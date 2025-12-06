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
  const descriptionLower = (description || '').toLowerCase()
  const tagsLower = tags.map(t => t.toLowerCase())
  
  // Score each category based on keyword matches
  const scores = categoryKeywords.map(category => {
    let score = 0
    
    // Check keywords
    for (const keyword of category.keywords) {
      const keywordLower = keyword.toLowerCase()
      
      // Title matches get high weight (5 points)
      if (titleLower.includes(keywordLower)) {
        score += 5
      }
      
      // Tag matches get medium weight (3 points)
      if (tagsLower.some(t => t.includes(keywordLower))) {
        score += 3
      }
      
      // Description matches get low weight (1 point)
      // We only count one match per keyword to avoid keyword stuffing skewing results
      if (descriptionLower.includes(keywordLower)) {
        score += 1
      }
    }
    
    return {
      id: category.id,
      score
    }
  })
  
  // Sort by score and return the highest scoring category
  scores.sort((a, b) => b.score - a.score)
  
  // If no matches, default to Programming & Development (most common for remote jobs)
  return scores[0].score > 0 ? scores[0].id : 1
}
