# Card Components Library

A comprehensive collection of 15 reusable card components built with React, TypeScript, and Tailwind CSS. Perfect for building modern, consistent user interfaces across your application.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Card Types](#card-types)
4. [Best Practices](#best-practices)
5. [Patterns & Examples](#patterns--examples)

---

## Installation

All card components are located in `src/components/Cards/` and can be imported from the index:

```tsx
import {
  BasicCard,
  FeaturedCard,
  StatCard,
  TestimonialCard,
  ImageCard,
  CTACard,
  PricingCard,
  AlertCard,
  ColorVariantCard,
  ProductCard,
  ProfileCard,
  ProgressCard,
  TimelineCard,
  SkeletonCard,
  EmptyStateCard,
} from '@/components/Cards'
```

---

## Basic Usage

```tsx
import { BasicCard } from '@/components/Cards'

export function MyComponent() {
  return (
    <BasicCard
      title="Hello World"
      description="This is a basic card example"
    />
  )
}
```

---

## Card Types

### 1. BasicCard

The simplest card component. Perfect for displaying basic information with title and description.

**When to use:**
- Displaying simple information blocks
- Feature lists
- Quick informational cards
- Default card container

**Props:**

```typescript
interface BasicCardProps {
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}
```

**Examples:**

```tsx
// Simple card
<BasicCard
  title="Welcome"
  description="Get started with our platform"
/>

// With custom content
<BasicCard
  title="Features"
  description="Check out what we offer"
>
  <ul className="list-disc list-inside space-y-2">
    <li>Feature one</li>
    <li>Feature two</li>
    <li>Feature three</li>
  </ul>
</BasicCard>
```

---

### 2. FeaturedCard

A card with a colored left border accent. Great for highlighting important information.

**When to use:**
- Highlighting important content
- Categorizing items by color
- Featured items in lists
- Visual hierarchy emphasis

**Props:**

```typescript
interface FeaturedCardProps {
  title: string
  description?: string
  accentColor?: 'primary' | 'accent' | 'slate'
  className?: string
  children?: React.ReactNode
}
```

**Examples:**

```tsx
// Red accent (primary)
<FeaturedCard
  title="Critical Update"
  description="Important changes to our service"
  accentColor="primary"
/>

// Green accent (accent)
<FeaturedCard
  title="New Feature"
  description="We just launched something new"
  accentColor="accent"
/>

// Gray accent (slate)
<FeaturedCard
  title="General Info"
  description="Standard information"
  accentColor="slate"
/>
```

---

### 3. StatCard

Display key metrics with trend indicators and icons.

**When to use:**
- Dashboard metrics
- KPIs and analytics
- Statistics display
- Numerical data highlighting

**Props:**

```typescript
interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    direction: 'up' | 'down'
    value: number | string
  }
  className?: string
}
```

**Examples:**

```tsx
import { TrendingUp } from 'lucide-react'

// Simple stat
<StatCard
  title="Total Users"
  value="12,345"
/>

// With trend
<StatCard
  title="Monthly Revenue"
  value="$45,678"
  icon={<DollarSign className="w-6 h-6" />}
  trend={{
    direction: 'up',
    value: '12%'
  }}
/>

// Negative trend
<StatCard
  title="Churn Rate"
  value="2.3%"
  trend={{
    direction: 'down',
    value: '0.5%'
  }}
/>
```

---

### 4. TestimonialCard

Display customer testimonials with ratings and avatars.

**When to use:**
- Customer testimonials
- User reviews
- Social proof
- Rating displays

**Props:**

```typescript
interface TestimonialCardProps {
  quote: string
  authorName: string
  authorRole?: string
  rating?: number
  avatarImage?: string
  className?: string
}
```

**Examples:**

```tsx
<TestimonialCard
  quote="This product transformed the way we work. Highly recommended!"
  authorName="Sarah Johnson"
  authorRole="CEO at TechCorp"
  rating={5}
  avatarImage="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
/>

<TestimonialCard
  quote="Great service and excellent support team."
  authorName="Mike Chen"
  authorRole="Product Manager"
  rating={4.5}
  avatarImage="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
/>
```

---

### 5. ImageCard

Display images with flexible layouts and overlay options.

**When to use:**
- Image galleries
- Portfolio displays
- Product images
- Featured images with text overlay

**Props:**

```typescript
interface ImageCardProps {
  image: string
  imageAlt?: string
  title: string
  description?: string
  overlay?: boolean
  className?: string
}
```

**Examples:**

```tsx
// Standard layout
<ImageCard
  image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
  imageAlt="Mountain landscape"
  title="Mountain Landscape"
  description="Beautiful alpine scenery"
/>

// With overlay effect
<ImageCard
  image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
  imageAlt="Mountain landscape"
  title="Mountain Adventure"
  description="Explore the peaks"
  overlay={true}
/>
```

---

### 6. CTACard

Call-to-action cards with primary and secondary buttons.

**When to use:**
- Sign up prompts
- Feature promotions
- Action-oriented content
- Conversion-focused sections

**Props:**

```typescript
interface CTACardProps {
  title: string
  description?: string
  primaryButtonText?: string
  secondaryButtonText?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  primaryButtonVariant?: 'default' | 'secondary' | 'outline' | 'ghost'
  secondaryButtonVariant?: 'default' | 'secondary' | 'outline' | 'ghost'
  className?: string
}
```

**Examples:**

```tsx
<CTACard
  title="Ready to get started?"
  description="Join thousands of users who are already using our platform"
  primaryButtonText="Sign Up Free"
  secondaryButtonText="Learn More"
  onPrimaryClick={() => navigate('/signup')}
  onSecondaryClick={() => navigate('/features')}
/>

<CTACard
  title="Upgrade Your Plan"
  description="Unlock premium features and get priority support"
  primaryButtonText="Upgrade Now"
  primaryButtonVariant="default"
  secondaryButtonText="View Plans"
  secondaryButtonVariant="outline"
/>
```

---

### 7. PricingCard

Display pricing tiers with features and CTA buttons.

**When to use:**
- Pricing pages
- Plan selection
- Subscription options
- Feature comparison

**Props:**

```typescript
interface PricingCardProps {
  name: string
  price: string | number
  description?: string
  features: string[]
  buttonText?: string
  buttonVariant?: 'default' | 'secondary' | 'outline' | 'ghost'
  onButtonClick?: () => void
  featured?: boolean
  currency?: string
  billingPeriod?: string
  className?: string
}
```

**Examples:**

```tsx
// Basic plan
<PricingCard
  name="Starter"
  price="29"
  description="Perfect for getting started"
  features={[
    'Up to 5 projects',
    '2 GB storage',
    'Basic support',
    'Community access',
  ]}
  buttonText="Choose Plan"
  buttonVariant="outline"
  onButtonClick={() => selectPlan('starter')}
/>

// Featured plan
<PricingCard
  name="Professional"
  price="79"
  description="Most popular for teams"
  featured={true}
  features={[
    'Unlimited projects',
    '100 GB storage',
    'Priority support',
    'Advanced analytics',
    'API access',
    'Team collaboration',
  ]}
  buttonText="Start Trial"
  onButtonClick={() => selectPlan('professional')}
/>

// Enterprise plan
<PricingCard
  name="Enterprise"
  price="Custom"
  description="For large organizations"
  features={[
    'Everything in Pro',
    'Unlimited storage',
    '24/7 support',
    'Custom integrations',
    'Dedicated manager',
  ]}
  buttonText="Contact Sales"
  buttonVariant="secondary"
  currency=""
  billingPeriod=""
/>
```

---

### 8. AlertCard

Display alerts, notifications, and status messages.

**When to use:**
- Error messages
- Warning notifications
- Success confirmations
- Informational messages

**Props:**

```typescript
interface AlertCardProps {
  title?: string
  description?: string
  variant?: 'success' | 'warning' | 'error' | 'info'
  dismissible?: boolean
  onDismiss?: () => void
  children?: React.ReactNode
  className?: string
}
```

**Examples:**

```tsx
// Success alert
<AlertCard
  variant="success"
  title="Success!"
  description="Your changes have been saved successfully."
/>

// Warning alert
<AlertCard
  variant="warning"
  title="Warning"
  description="This action will affect 3 team members."
  dismissible={true}
  onDismiss={() => closeAlert()}
/>

// Error alert
<AlertCard
  variant="error"
  title="Error Occurred"
  description="Unable to process your request. Please try again later."
/>

// Info alert with content
<AlertCard
  variant="info"
  title="System Maintenance"
  description="We'll be performing scheduled maintenance."
  dismissible={true}
>
  <ul className="list-disc list-inside space-y-1 mt-3">
    <li>Maintenance window: 2:00 AM - 4:00 AM UTC</li>
    <li>Expected downtime: 30 minutes</li>
  </ul>
</AlertCard>
```

---

### 9. ColorVariantCard

Cards with 9 different color themes for organization and categorization.

**When to use:**
- Color-coded content categories
- Organizing information visually
- Highlighting different content types
- Visual organization system

**Props:**

```typescript
interface ColorVariantCardProps {
  title: string
  description?: string
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink' | 'slate'
  className?: string
  children?: React.ReactNode
}
```

**Available Colors:**
- `red` — Critical, alerts, errors
- `orange` — Warnings, caution
- `yellow` — Highlights, tips
- `green` — Success, positive actions
- `blue` — Information, neutral (default)
- `indigo` — Premium, professional
- `purple` — Creative, innovative
- `pink` — Friendly, approachable
- `slate` — Neutral, secondary

**Examples:**

```tsx
// Red for critical
<ColorVariantCard
  color="red"
  title="System Alert"
  description="Important system notification"
>
  This requires immediate attention
</ColorVariantCard>

// Green for success
<ColorVariantCard
  color="green"
  title="Deployment Complete"
  description="Your application is live"
>
  All systems operational
</ColorVariantCard>

// Purple for features
<ColorVariantCard
  color="purple"
  title="New Feature"
  description="Check out what's new"
>
  Exciting updates available
</ColorVariantCard>
```

---

### 10. ProductCard

E-commerce product display with images, pricing, ratings, and cart functionality.

**When to use:**
- Product grids and catalogs
- E-commerce listings
- Product showcases
- Item displays with pricing

**Props:**

```typescript
interface ProductCardProps {
  image: string
  imageAlt?: string
  title: string
  price: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  description?: string
  badge?: string
  badgeVariant?: 'sale' | 'new' | 'featured'
  onAddToCart?: () => void
  onFavorite?: () => void
  isFavorited?: boolean
  className?: string
}
```

**Examples:**

```tsx
// Basic product
<ProductCard
  image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  title="Wireless Headphones"
  price={129.99}
  rating={4.5}
  reviewCount={248}
  description="Premium sound quality"
  onAddToCart={() => addToCart(productId)}
/>

// On sale
<ProductCard
  image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  title="Wireless Headphones"
  price={99.99}
  originalPrice={199.99}
  rating={4.5}
  reviewCount={248}
  description="Premium sound quality"
  badge="Sale"
  badgeVariant="sale"
  onAddToCart={() => addToCart(productId)}
/>

// Featured product
<ProductCard
  image="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
  title="Smart Watch"
  price={299.99}
  rating={5}
  reviewCount={512}
  description="Latest features with health tracking"
  badge="Featured"
  badgeVariant="featured"
  isFavorited={true}
  onAddToCart={() => addToCart(productId)}
  onFavorite={() => toggleFavorite(productId)}
/>
```

---

### 11. ProfileCard

Display user profiles with avatars, roles, and action buttons.

**When to use:**
- Team member directories
- User profiles
- Member listings
- Contact cards
- Social profiles

**Props:**

```typescript
interface ProfileCardProps {
  avatar: string
  avatarAlt?: string
  name: string
  title: string
  description?: string
  socialLinks?: Array<{
    label: string
    icon: React.ReactNode
    href?: string
    onClick?: () => void
  }>
  actionButton?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  }
  className?: string
  layout?: 'vertical' | 'horizontal'
}
```

**Examples:**

```tsx
// Vertical layout
<ProfileCard
  avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  name="Sarah Johnson"
  title="Product Designer"
  description="Passionate about creating beautiful user experiences"
  actionButton={{
    label: 'View Profile',
    onClick: () => navigate(`/profile/sarah`)
  }}
/>

// Horizontal layout
<ProfileCard
  layout="horizontal"
  avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
  name="Alex Chen"
  title="Full Stack Developer"
  description="Building scalable web applications"
  actionButton={{
    label: 'Connect',
    onClick: () => sendConnection('alex'),
    variant: 'outline'
  }}
/>

// With social links
<ProfileCard
  avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan"
  name="Jordan Davis"
  title="Project Manager"
  socialLinks={[
    { label: 'Twitter', icon: <Twitter />, href: 'https://twitter.com' },
    { label: 'LinkedIn', icon: <Linkedin />, href: 'https://linkedin.com' },
    { label: 'GitHub', icon: <Github />, href: 'https://github.com' }
  ]}
  actionButton={{
    label: 'Message',
    onClick: () => openChat('jordan')
  }}
/>
```

---

### 12. ProgressCard

Display progress in multiple formats: linear bars, circular indicators, and step-based tracking.

**When to use:**
- Project progress tracking
- Skill levels
- Task completion
- Onboarding steps
- File uploads
- Installation progress

**Props:**

```typescript
interface ProgressCardProps {
  title: string
  description?: string
  progress: number
  progressColor?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'
  variant?: 'linear' | 'circular' | 'steps'
  steps?: Array<{
    label: string
    completed: boolean
  }>
  showPercentage?: boolean
  className?: string
}
```

**Examples:**

```tsx
// Linear progress
<ProgressCard
  title="Project Completion"
  description="Overall progress on current project"
  progress={65}
  progressColor="blue"
  variant="linear"
  showPercentage={true}
/>

// Circular progress
<ProgressCard
  title="Download Progress"
  progress={45}
  progressColor="green"
  variant="circular"
/>

// Steps progress
<ProgressCard
  title="Onboarding Steps"
  description="Complete your profile setup"
  progress={60}
  variant="steps"
  steps={[
    { label: 'Create Account', completed: true },
    { label: 'Verify Email', completed: true },
    { label: 'Add Profile Photo', completed: true },
    { label: 'Choose Preferences', completed: false },
    { label: 'Get Started', completed: false },
  ]}
  progressColor="green"
/>
```

---

### 13. TimelineCard

Display activity feeds, project history, and event timelines.

**When to use:**
- Activity feeds
- Project history
- Event timelines
- Release notes
- Changelog
- Workflow status

**Props:**

```typescript
interface TimelineEvent {
  date: string
  title: string
  description: string
  icon?: React.ReactNode
  status?: 'completed' | 'current' | 'upcoming'
}

interface TimelineCardProps {
  events: TimelineEvent[]
  className?: string
}
```

**Examples:**

```tsx
<TimelineCard
  events={[
    {
      date: 'Today at 2:30 PM',
      title: 'Project Launched',
      description: 'Your new product is now live',
      status: 'completed',
    },
    {
      date: 'Yesterday at 10:15 AM',
      title: 'Design Review Complete',
      description: 'All design assets approved',
      status: 'completed',
    },
    {
      date: 'Tomorrow at 3:00 PM',
      title: 'Team Meeting',
      description: 'Q&A session with stakeholders',
      status: 'current',
    },
    {
      date: 'Next Week',
      title: 'Beta Testing Phase',
      description: 'Open beta for early adopters',
      status: 'upcoming',
    },
  ]}
/>
```

---

### 14. SkeletonCard

Loading placeholder cards that maintain layout stability during data fetching.

**When to use:**
- Loading states
- Data fetching
- Streaming content
- Layout stability
- Perceived performance

**Props:**

```typescript
interface SkeletonCardProps {
  variant?: 'product' | 'profile' | 'basic' | 'feature'
  className?: string
}
```

**Available Variants:**
- `product` — Product card skeleton
- `profile` — Profile card skeleton
- `basic` — Basic card skeleton
- `feature` — Feature card skeleton

**Examples:**

```tsx
// Product loading state
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <SkeletonCard variant="product" />
    <SkeletonCard variant="product" />
    <SkeletonCard variant="product" />
  </div>
) : (
  <ProductGrid products={products} />
)}

// Profile loading state
{isLoadingProfile ? (
  <SkeletonCard variant="profile" />
) : (
  <ProfileCard {...profileData} />
)}

// Feature list loading
{isLoadingFeatures ? (
  <div className="space-y-4">
    <SkeletonCard variant="feature" />
    <SkeletonCard variant="feature" />
    <SkeletonCard variant="feature" />
  </div>
) : (
  <FeatureList features={features} />
)}
```

---

### 15. EmptyStateCard

Display when there's no content to show with guidance and action options.

**When to use:**
- Empty content states
- First-time user experience
- No search results
- No items in list
- Call-to-action for empty sections

**Props:**

```typescript
interface EmptyStateCardProps {
  icon: React.ReactNode
  title: string
  description: string
  actionButton?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  }
  className?: string
}
```

**Examples:**

```tsx
import { Inbox, Package, Grid } from 'lucide-react'

// No messages
<EmptyStateCard
  icon={<Inbox className="w-12 h-12" />}
  title="No Messages"
  description="You don't have any messages yet. Start a conversation."
  actionButton={{
    label: 'Send a Message',
    onClick: () => openComposer()
  }}
/>

// No orders
<EmptyStateCard
  icon={<Package className="w-12 h-12" />}
  title="No Orders"
  description="You haven't placed any orders yet."
  actionButton={{
    label: 'Start Shopping',
    onClick: () => navigate('/shop'),
    variant: 'secondary'
  }}
/>

// No projects
<EmptyStateCard
  icon={<Grid className="w-12 h-12" />}
  title="No Projects"
  description="Create your first project to get started."
  actionButton={{
    label: 'Create Project',
    onClick: () => showCreateProjectModal()
  }}
/>
```

---

## Best Practices

### 1. Consistency

Use the same card type for similar information across your app:

```tsx
// ✅ Good - Consistent patterns
<ProductCard {...product1} />
<ProductCard {...product2} />
<ProductCard {...product3} />

// ❌ Avoid - Mixing card types for same data
<ProductCard {...product1} />
<BasicCard title={product2.name} />
<ImageCard image={product3.image} />
```

### 2. Prop Validation

Always validate required props before rendering:

```tsx
// ✅ Good
function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return <EmptyStateCard icon={<Box />} title="No Products" />
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(p => <ProductCard key={p.id} {...p} />)}
    </div>
  )
}
```

### 3. Loading States

Use SkeletonCard while data is loading:

```tsx
// ✅ Good
function ProductListing() {
  const { data, isLoading } = useProducts()
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <SkeletonCard key={i} variant="product" />)}
      </div>
    )
  }
  
  return <ProductGrid products={data} />
}
```

### 4. Color Semantics

Use ColorVariantCard colors meaningfully:

```tsx
// ✅ Good - Colors convey meaning
<ColorVariantCard color="red" title="Critical Issue" />    // Red = urgent
<ColorVariantCard color="green" title="Deployment OK" />   // Green = success
<ColorVariantCard color="yellow" title="Warning" />        // Yellow = caution
<ColorVariantCard color="blue" title="Information" />      // Blue = info
```

### 5. Responsive Grids

Use responsive grid layouts:

```tsx
// ✅ Good - Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// ✅ Also good - 2 columns on mobile, 4 on desktop
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### 6. Error Handling

Handle errors gracefully with AlertCard:

```tsx
// ✅ Good
function DataDisplay() {
  const { data, error, isLoading } = useData()
  
  if (error) {
    return (
      <AlertCard
        variant="error"
        title="Error Loading Data"
        description={error.message}
        dismissible
      />
    )
  }
  
  if (isLoading) return <SkeletonCard />
  
  return <DisplayData data={data} />
}
```

### 7. Accessibility

Add proper ARIA labels and keyboard support:

```tsx
// ✅ Good - Accessible
<ProductCard
  {...product}
  onAddToCart={() => addToCart(product.id)}
  role="article"
  aria-label={`Product: ${product.title}`}
/>

// Include alt text for images
<ProductCard
  image={product.image}
  imageAlt={`${product.title} product image`}
  {...product}
/>
```

### 8. Performance

Lazy load images and optimize for performance:

```tsx
// ✅ Good - Lazy loading images
<ProductCard
  image={product.image}
  {...product}
/>

// For large grids, consider virtual scrolling
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={products.length}
  itemSize={350}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ProductCard {...products[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## Patterns & Examples

### Pattern 1: Product Grid with Filters

```tsx
function ProductCatalog() {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const products = useProducts(filter, sort)
  
  if (!products.length) {
    return (
      <EmptyStateCard
        icon={<ShoppingBag />}
        title="No Products Found"
        description="Try adjusting your filters"
        actionButton={{
          label: 'Clear Filters',
          onClick: () => setFilter('all')
        }}
      />
    )
  }
  
  return (
    <div>
      <div className="flex gap-4 mb-8">
        <select onChange={e => setFilter(e.target.value)}>
          <option value="all">All Products</option>
          <option value="new">New</option>
          <option value="sale">On Sale</option>
        </select>
        <select onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard
            key={product.id}
            {...product}
            onAddToCart={() => addToCart(product)}
            onFavorite={() => toggleFavorite(product.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

### Pattern 2: Team Directory with Search

```tsx
function TeamDirectory() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const members = useTeamMembers(search, department)
  
  return (
    <div>
      <div className="mb-8 flex gap-4">
        <input
          type="search"
          placeholder="Search team members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <select onChange={e => setDepartment(e.target.value)}>
          <option value="all">All Departments</option>
          <option value="engineering">Engineering</option>
          <option value="design">Design</option>
          <option value="product">Product</option>
        </select>
      </div>
      
      {!members.length ? (
        <EmptyStateCard
          icon={<Users />}
          title="No Team Members Found"
          description="Try adjusting your search"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <ProfileCard
              key={member.id}
              avatar={member.avatar}
              name={member.name}
              title={member.title}
              description={member.bio}
              actionButton={{
                label: 'View Profile',
                onClick: () => navigate(`/team/${member.id}`)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Pattern 3: Dashboard with Multiple Card Types

```tsx
function Dashboard() {
  const { stats, progress, timeline, isLoading } = useDashboard()
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} variant="feature" />)}
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      {/* KPI Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(stat => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>
      </div>
      
      {/* Progress Trackers */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {progress.map(item => (
            <ProgressCard
              key={item.id}
              title={item.title}
              progress={item.value}
              progressColor={item.color}
              variant="circular"
            />
          ))}
        </div>
      </div>
      
      {/* Timeline */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <TimelineCard events={timeline} />
      </div>
    </div>
  )
}
```

### Pattern 4: Pricing Page

```tsx
function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  const plans = getPricingPlans(billingPeriod)
  
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={billingPeriod === 'monthly' ? 'font-bold' : ''}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={billingPeriod === 'annual' ? 'font-bold' : ''}
          >
            Annual (Save 20%)
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <PricingCard
            key={plan.id}
            {...plan}
            featured={idx === 1}
            onButtonClick={() => selectPlan(plan.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

### Pattern 5: Form with Validation States

```tsx
function UserForm() {
  const [formState, setFormState] = useState({})
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  
  const handleSubmit = async () => {
    const newErrors = validate(formState)
    
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true)
      return (
        <AlertCard
          variant="success"
          title="Success!"
          description="Your form has been submitted."
        />
      )
    }
    
    setErrors(newErrors)
  }
  
  return (
    <div className="space-y-6">
      {Object.keys(errors).map(field => (
        <AlertCard
          key={field}
          variant="error"
          title="Validation Error"
          description={errors[field]}
          dismissible
          onDismiss={() => setErrors(e => ({ ...e, [field]: undefined }))}
        />
      ))}
      
      {/* Form fields here */}
      
      <button onClick={handleSubmit}>Submit</button>
    </div>
  )
}
```

---

## Color Reference

### Alert/Info Card Colors

- **Success** (Green) — Confirmations, positive feedback
- **Info** (Blue) — Informational messages
- **Warning** (Yellow) — Cautions, warnings
- **Error** (Red) — Errors, critical issues

### ColorVariantCard Colors

| Color | Use Case | Icon/Status |
|-------|----------|------------|
| Red | Critical, alerts, errors | High priority |
| Orange | Warnings, caution | Medium priority |
| Yellow | Highlights, tips | Attention needed |
| Green | Success, positive actions | Complete |
| Blue | Information, neutral (default) | Standard |
| Indigo | Premium, professional | Exclusive |
| Purple | Creative, innovative | New feature |
| Pink | Friendly, approachable | Community |
| Slate | Neutral, secondary | Background |

---

## Browser Support

All card components are built with:
- React 19+
- TypeScript
- Tailwind CSS 4.0+

Supported browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

## Performance Tips

1. **Use memoization for card lists:**
   ```tsx
   const MemoizedProductCard = React.memo(ProductCard)
   ```

2. **Lazy load images:**
   ```tsx
   <img src={image} loading="lazy" alt={alt} />
   ```

3. **Virtual scrolling for large lists:**
   ```tsx
   import { FixedSizeList } from 'react-window'
   ```

4. **Code splitting for card components:**
   ```tsx
   const ProductCard = React.lazy(() => import('./ProductCard'))
   ```

---

## Contributing

To add new card types or improve existing ones:

1. Create component in `src/components/Cards/`
2. Export from `src/components/Cards/index.ts`
3. Add showcase section to `src/routes/cards.tsx`
4. Update this documentation
5. Ensure TypeScript types are complete
6. Add accessibility features (ARIA labels, keyboard support)

---

## License

These card components are part of the Spearyx project.

---

## Quick Links

- [Component Showcase](/cards)
- [TypeScript Definitions](/src/components/Cards)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
