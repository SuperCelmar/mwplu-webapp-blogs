# Blog Feature Implementation Guide
## Step-by-Step Feature Development for MWPLU Blog System

This document provides a comprehensive, feature-by-feature implementation guide for building the MWPLU blog system that assists human experts in creating, reviewing, and publishing SEO-optimized content.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Database Schema Design](#database-schema-design)
3. [Backend Infrastructure](#backend-infrastructure)
4. [Frontend Components](#frontend-components)
5. [SEO & Analytics Integration](#seo--analytics-integration)
6. [Implementation Phases](#implementation-phases)
7. [Testing Strategy](#testing-strategy)
8. [Deployment & Monitoring](#deployment--monitoring)

---

## Project Overview

### Goal
Create a software interface that assists human experts in creating, reviewing, and publishing SEO-optimized blog content to improve MWPLU's search engine rankings.

### Core Features
- Admin/editor interface with SEO guidance and validation
- Company-wide context management for consistent AI-assisted drafting
- Article lifecycle management (draft → scheduled → published → archived)
- LLM-assisted content generation with Human-In-The-Loop (HITL) review
- SEO hygiene enforcement and monitoring
- Analytics and performance tracking

---

## Database Schema Design

### Phase 1: Core Tables

#### 1.1 Company Context Table
```sql
CREATE TABLE company_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  mission TEXT,
  values TEXT[],
  tone VARCHAR(100),
  messaging TEXT,
  brand_voice_guidelines TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

#### 1.2 Blog Categories Table
```sql
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#000000',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.3 Blog Tags Table
```sql
CREATE TABLE blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.4 Blog Articles Table
```sql
CREATE TABLE blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  markdown_content TEXT,
  cover_image_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'scheduled', 'published', 'archived')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO Fields
  meta_title VARCHAR(255),
  meta_description TEXT,
  canonical_url TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image_url TEXT,
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image_url TEXT,
  
  -- Content Structure
  category_id UUID REFERENCES blog_categories(id),
  tags UUID[] DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id),
  company_context_id UUID REFERENCES company_context(id),
  
  -- AI Generation
  ai_generated BOOLEAN DEFAULT false,
  ai_prompts_used TEXT[],
  human_edit_ratio DECIMAL(3,2) DEFAULT 1.0,
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  scroll_depth_avg DECIMAL(5,2) DEFAULT 0,
  cta_clicks INTEGER DEFAULT 0,
  outlink_clicks INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

#### 1.5 Article Tags Junction Table
```sql
CREATE TABLE blog_article_tags (
  article_id UUID REFERENCES blog_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
```

#### 1.6 Content Planning Table
```sql
CREATE TABLE blog_content_planner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  topic TEXT NOT NULL,
  target_keywords TEXT[],
  content_brief TEXT,
  target_publish_date DATE,
  priority INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  article_id UUID REFERENCES blog_articles(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Phase 2: Analytics & Monitoring Tables

#### 2.1 Blog Analytics Events Table
```sql
CREATE TABLE blog_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES blog_articles(id),
  event_type VARCHAR(50) NOT NULL, -- 'view', 'scroll', 'cta_click', 'outlink_click'
  event_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.2 SEO Audit Results Table
```sql
CREATE TABLE blog_seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES blog_articles(id),
  audit_type VARCHAR(50) NOT NULL, -- 'pre_publish', 'post_publish', 'periodic'
  lighthouse_score INTEGER,
  seo_score INTEGER,
  issues JSONB,
  recommendations JSONB,
  audited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Backend Infrastructure

### Phase 1: Supabase Functions

#### 1.1 Content Generation Function
```typescript
// supabase/functions/generate-blog-content/index.ts
interface GenerateContentRequest {
  topic: string;
  target_keywords: string[];
  company_context_id: string;
  content_type: 'outline' | 'full_draft' | 'seo_optimization';
  existing_content?: string;
}

interface GenerateContentResponse {
  content: string;
  seo_suggestions: SEOAnalysis;
  brand_voice_alignment: number;
  prompts_used: string[];
}
```

#### 1.2 SEO Validation Function
```typescript
// supabase/functions/validate-seo/index.ts
interface SEOValidationRequest {
  article_id: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  target_keywords: string[];
}

interface SEOValidationResponse {
  score: number;
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  lighthouse_data?: LighthouseResult;
}
```

#### 1.3 Scheduling Service Function
```typescript
// supabase/functions/schedule-publication/index.ts
interface ScheduleRequest {
  article_id: string;
  scheduled_at: string;
  auto_publish: boolean;
}

interface ScheduleResponse {
  success: boolean;
  job_id?: string;
  next_check?: string;
}
```

#### 1.4 Analytics Processing Function
```typescript
// supabase/functions/process-analytics/index.ts
interface AnalyticsEvent {
  article_id: string;
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  session_id: string;
}
```

### Phase 2: Database Triggers & Policies

#### 2.1 Row Level Security Policies
```sql
-- Company Context Policies
CREATE POLICY "Users can view active company context" ON company_context
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage company context" ON company_context
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Blog Articles Policies
CREATE POLICY "Public can view published articles" ON blog_articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can manage their articles" ON blog_articles
  FOR ALL USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'editor')
    )
  );
```

#### 2.2 Database Triggers
```sql
-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_company_context_updated_at 
  BEFORE UPDATE ON company_context 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_articles_updated_at 
  BEFORE UPDATE ON blog_articles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Frontend Components

### Phase 1: Core Admin Interface

#### 1.1 Blog Dashboard Component
```vue
<!-- src/views/admin/BlogDashboard.vue -->
<template>
  <div class="blog-dashboard">
    <BlogStatsOverview />
    <BlogContentPlanner />
    <BlogArticleList />
    <BlogSchedulingCalendar />
  </div>
</template>
```

**Features:**
- Overview of published/scheduled/draft articles
- Content planning calendar
- SEO performance metrics
- Quick actions for common tasks

#### 1.2 Blog Editor Component
```vue
<!-- src/components/blog/BlogEditor.vue -->
<template>
  <div class="blog-editor">
    <BlogEditorHeader />
    <BlogEditorSidebar />
    <BlogEditorMain />
    <BlogEditorFooter />
  </div>
</template>
```

**Features:**
- Rich text editor with markdown support
- Real-time SEO validation
- Company context integration
- AI assistance panel
- Preview functionality

#### 1.3 Company Context Manager
```vue
<!-- src/components/blog/CompanyContextManager.vue -->
<template>
  <div class="company-context-manager">
    <CompanyContextForm />
    <CompanyContextPreview />
    <CompanyContextHistory />
  </div>
</template>
```

**Features:**
- Global context editing
- Brand voice guidelines
- Context versioning
- Usage tracking across articles

### Phase 2: Public Blog Interface

#### 2.1 Blog Listing Page
```vue
<!-- src/views/BlogView.vue -->
<template>
  <div class="blog-listing">
    <BlogHero />
    <BlogFilters />
    <BlogArticleGrid />
    <BlogPagination />
  </div>
</template>
```

**Features:**
- Responsive article grid
- Category and tag filtering
- Search functionality
- SEO-optimized pagination

#### 2.2 Article Detail Page
```vue
<!-- src/views/BlogArticleView.vue -->
<template>
  <div class="blog-article">
    <BlogArticleHeader />
    <BlogArticleContent />
    <BlogArticleFooter />
    <BlogRelatedArticles />
  </div>
</template>
```

**Features:**
- Structured data (JSON-LD)
- Social sharing buttons
- Related articles
- Reading time estimation
- Table of contents

### Phase 3: Advanced Features

#### 3.1 AI Content Assistant
```vue
<!-- src/components/blog/AIContentAssistant.vue -->
<template>
  <div class="ai-content-assistant">
    <AIPromptBuilder />
    <AIContentGenerator />
    <AIContentReview />
    <AIUsageTracking />
  </div>
</template>
```

**Features:**
- Prompt templates
- Content generation with company context
- Brand voice alignment checking
- Plagiarism detection

#### 3.2 SEO Analysis Panel
```vue
<!-- src/components/blog/SEOAnalysisPanel.vue -->
<template>
  <div class="seo-analysis-panel">
    <SEOScoreIndicator />
    <SEOIssuesList />
    <SEORecommendations />
    <LighthouseResults />
  </div>
</template>
```

**Features:**
- Real-time SEO scoring
- Issue identification and fixes
- Keyword density analysis
- Lighthouse integration

---

## SEO & Analytics Integration

### Phase 1: SEO Implementation

#### 1.1 Meta Tags Management
```typescript
// src/composables/useSEO.ts
export function useSEO() {
  const setArticleMeta = (article: BlogArticle) => {
    // Set document title
    document.title = article.meta_title || article.title
    
    // Set meta description
    updateMetaTag('description', article.meta_description || article.excerpt)
    
    // Set canonical URL
    updateMetaTag('canonical', article.canonical_url)
    
    // Set Open Graph tags
    setOpenGraphTags(article)
    
    // Set Twitter Card tags
    setTwitterCardTags(article)
  }
  
  const setOpenGraphTags = (article: BlogArticle) => {
    updateMetaTag('og:title', article.og_title || article.title)
    updateMetaTag('og:description', article.og_description || article.excerpt)
    updateMetaTag('og:image', article.og_image_url || article.cover_image_url)
    updateMetaTag('og:type', 'article')
    updateMetaTag('og:url', window.location.href)
  }
  
  return { setArticleMeta }
}
```

#### 1.2 Structured Data (JSON-LD)
```typescript
// src/utils/structuredData.ts
export function generateArticleStructuredData(article: BlogArticle): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.cover_image_url,
    "author": {
      "@type": "Person",
      "name": article.author?.name || "MWPLU Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MWPLU",
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.png"
      }
    },
    "datePublished": article.published_at,
    "dateModified": article.updated_at
  }
}
```

#### 1.3 Sitemap Generation
```typescript
// supabase/functions/generate-sitemap/index.ts
export async function generateBlogSitemap() {
  const articles = await supabase
    .from('blog_articles')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${SITE_URL}/blog</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
      ${articles.data?.map(article => `
        <url>
          <loc>${SITE_URL}/blog/${article.slug}</loc>
          <lastmod>${article.updated_at}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.6</priority>
        </url>
      `).join('')}
    </urlset>`
  
  return sitemap
}
```

### Phase 2: Analytics Implementation

#### 2.1 User-Facing Analytics
```typescript
// src/composables/useBlogAnalytics.ts
export function useBlogAnalytics() {
  const trackArticleView = (articleId: string) => {
    analytics.trackEvent('blog_article_view', {
      article_id: articleId,
      page_url: window.location.href,
      referrer: document.referrer
    })
  }
  
  const trackScrollDepth = (articleId: string, depth: number) => {
    analytics.trackEvent('blog_article_scroll', {
      article_id: articleId,
      scroll_depth: depth
    })
  }
  
  const trackCTAClick = (articleId: string, ctaType: string) => {
    analytics.trackEvent('blog_cta_click', {
      article_id: articleId,
      cta_type: ctaType
    })
  }
  
  return { trackArticleView, trackScrollDepth, trackCTAClick }
}
```

#### 2.2 Editor Analytics
```typescript
// src/composables/useEditorAnalytics.ts
export function useEditorAnalytics() {
  const trackContentGeneration = (prompts: string[], wordCount: number) => {
    analytics.trackEvent('blog_ai_generation', {
      prompts_used: prompts,
      word_count: wordCount,
      generation_time: Date.now() - startTime
    })
  }
  
  const trackSEOValidation = (score: number, issues: string[]) => {
    analytics.trackEvent('blog_seo_validation', {
      seo_score: score,
      issues_found: issues.length,
      issues: issues
    })
  }
  
  const trackHITLReview = (articleId: string, reviewTime: number) => {
    analytics.trackEvent('blog_hitl_review', {
      article_id: articleId,
      review_time_minutes: reviewTime
    })
  }
  
  return { trackContentGeneration, trackSEOValidation, trackHITLReview }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
**Goal:** Set up core infrastructure and basic functionality

#### Week 1: Database & Backend Setup
- [x] Create database schema with all tables
- [x] Set up Row Level Security policies
- [x] Create basic Supabase functions
- [x] Set up database triggers and constraints
- [ ] Create seed data for categories and tags

#### Week 2: Core Admin Interface
- [x] Build BlogDashboard component
- [x] Create BlogEditor with basic functionality
- [x] Implement CompanyContextManager
- [x] Set up routing for admin blog section
- [ ] Add authentication guards for admin routes

#### Week 3: Basic Article Management
- [ ] Implement CRUD operations for articles
- [x] Create article listing and filtering (UI skeleton)
- [ ] Build basic SEO meta tag management
- [ ] Set up article preview functionality
- [x] Implement basic scheduling system (UI skeleton)

### Phase 2: Content Generation & SEO (Weeks 4-6)
**Goal:** Add AI assistance and SEO validation

#### Week 4: AI Content Generation
- [x] Integrate LLM API for content generation
- [ ] Build AI Content Assistant component
- [ ] Implement company context integration
- [ ] Create prompt templates and management
- [ ] Add brand voice alignment checking

#### Week 5: SEO Validation & Analysis
- [ ] Build SEO Analysis Panel
- [ ] Implement real-time SEO scoring
- [ ] Integrate Lighthouse API
- [x] Create SEO issue detection and recommendations
- [x] Add keyword density analysis

#### Week 6: Advanced Editor Features
- [ ] Implement markdown editor with live preview
- [ ] Add rich text formatting options
- [ ] Create image upload and management
- [ ] Build internal linking suggestions
- [ ] Add content structure analysis

### Phase 3: Public Interface & Analytics (Weeks 7-9)
**Goal:** Complete public blog and analytics

#### Week 7: Public Blog Interface
- [ ] Build BlogView with article listing
- [ ] Create BlogArticleView for individual articles
- [ ] Implement responsive design
- [ ] Add social sharing functionality
- [ ] Create related articles suggestions

#### Week 8: Analytics & Tracking
- [ ] Implement user-facing analytics tracking
- [ ] Build editor analytics dashboard
- [ ] Create performance monitoring
- [ ] Add SEO audit scheduling
- [x] Implement content planning calendar (UI skeleton)

#### Week 9: SEO & Performance
- [ ] Generate and serve sitemaps
- [ ] Implement structured data (JSON-LD)
- [ ] Optimize Core Web Vitals
- [ ] Set up automated SEO audits
- [ ] Create robots.txt and meta tags

### Phase 4: Advanced Features & Optimization (Weeks 10-12)
**Goal:** Polish and optimize the system

#### Week 10: Content Planning & Workflow
- [ ] Build content planning interface
- [ ] Implement editorial calendar
- [ ] Create content brief templates
- [ ] Add collaboration features
- [ ] Build approval workflows

#### Week 11: Performance & Monitoring
- [ ] Optimize database queries
- [ ] Implement caching strategies
- [ ] Set up monitoring and alerting
- [ ] Create performance dashboards
- [ ] Add error tracking and logging

#### Week 12: Testing & Documentation
- [ ] Write comprehensive tests
- [ ] Create user documentation
- [ ] Build admin training materials
- [ ] Perform security audit
- [ ] Finalize deployment procedures

---

## Testing Strategy

### Unit Tests
- Component testing with Vue Test Utils
- Service function testing with Jest
- Database function testing with Supabase test suite
- Utility function testing

### Integration Tests
- API endpoint testing
- Database integration testing
- Authentication flow testing
- SEO validation testing

### End-to-End Tests
- Complete article creation workflow
- Public blog browsing experience
- Admin dashboard functionality
- SEO audit and reporting

### Performance Tests
- Lighthouse audits
- Database query performance
- API response times
- Page load speeds

---

## Deployment & Monitoring

### Environment Setup
- Development environment with local Supabase
- Staging environment for testing
- Production environment with monitoring

### CI/CD Pipeline
- Automated testing on pull requests
- Staging deployment on merge to develop
- Production deployment on release tags
- Database migration management

### Monitoring & Alerting
- Application performance monitoring
- SEO score tracking
- Content generation success rates
- User engagement metrics

### Backup & Recovery
- Automated database backups
- Content versioning and rollback
- Disaster recovery procedures
- Data export capabilities

---

## Success Metrics

### Technical Metrics
- Lighthouse SEO score ≥ 90
- Page load time < 3 seconds
- 99.9% uptime
- Zero critical security vulnerabilities

### Content Metrics
- Articles created with company context: >90%
- SEO validation pass rate: >95%
- Average HITL review time: <30 minutes
- AI vs human edit ratio tracking

### Business Metrics
- Organic traffic increase
- Search ranking improvements
- Content engagement rates
- Lead generation from blog content

---

## Risk Mitigation

### Technical Risks
- **LLM API reliability**: Implement fallback content generation
- **SEO validation accuracy**: Manual review processes
- **Database performance**: Query optimization and caching
- **Security vulnerabilities**: Regular audits and updates

### Content Risks
- **Brand voice consistency**: Automated alignment checking
- **SEO compliance**: Real-time validation and warnings
- **Content quality**: HITL review requirements
- **Publishing schedule**: Automated scheduling and monitoring

### Operational Risks
- **User training**: Comprehensive documentation and training
- **System maintenance**: Automated monitoring and alerting
- **Data loss**: Regular backups and versioning
- **Scalability**: Performance monitoring and optimization

---

This implementation guide provides a comprehensive roadmap for building the MWPLU blog system. Each phase builds upon the previous one, ensuring a solid foundation while progressively adding advanced features. The modular approach allows for iterative development and testing, reducing risk and ensuring quality throughout the development process.
