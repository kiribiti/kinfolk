# Newsletter Platform Integration (Substack-like Functionality)

## Overview
Transform Kinfolk into a newsletter platform similar to Substack, leveraging the existing Channel architecture as "Publications" and adding newsletter-specific features.

## Core Concept
**Channels → Publications**: Each channel becomes a publication that can send newsletters to its subscribers.

---

## Phase 1: Database Schema Extensions

### New Models

#### 1. **Newsletter** Model
```prisma
model Newsletter {
  id              Int       @id @default(autoincrement())
  channelId       Int
  title           String
  subtitle        String?
  content         String    // Rich text/markdown content
  excerpt         String?   // Preview text
  coverImage      String?
  status          String    // 'draft', 'scheduled', 'published'
  publishedAt     DateTime?
  scheduledFor    DateTime?
  sentAt          DateTime? // When email was sent
  viewCount       Int       @default(0)
  emailsSent      Int       @default(0)
  openRate        Float?
  clickRate       Float?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  channel         Channel   @relation(fields: [channelId], references: [id], onDelete: Cascade)
  sections        NewsletterSection[]
  @@index([channelId])
  @@index([status])
  @@index([publishedAt])
}
```

#### 2. **NewsletterSection** Model (for multi-section newsletters)
```prisma
model NewsletterSection {
  id            Int        @id @default(autoincrement())
  newsletterId  Int
  title         String?
  content       String
  order         Int
  type          String     // 'text', 'image', 'video', 'embed'

  newsletter    Newsletter @relation(fields: [newsletterId], references: [id], onDelete: Cascade)
  @@index([newsletterId])
}
```

#### 3. **EmailSubscriber** Model (separate from Channel subscription)
```prisma
model EmailSubscriber {
  id              Int       @id @default(autoincrement())
  email           String
  channelId       Int
  userId          Int?      // Null if not a registered user
  status          String    @default("active") // 'active', 'unsubscribed', 'bounced'
  emailVerified   Boolean   @default(false)
  verificationToken String?
  unsubscribeToken  String  @unique @default(cuid())
  subscribedAt    DateTime  @default(now())
  unsubscribedAt  DateTime?
  preferences     Json?     // Frequency, topics, etc.

  channel         Channel   @relation(fields: [channelId], references: [id], onDelete: Cascade)
  user            User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@unique([email, channelId])
  @@index([channelId])
  @@index([status])
}
```

#### 4. **NewsletterAnalytics** Model
```prisma
model NewsletterAnalytics {
  id            Int       @id @default(autoincrement())
  newsletterId  Int
  subscriberId  Int
  opened        Boolean   @default(false)
  openedAt      DateTime?
  clicked       Boolean   @default(false)
  clickedAt     DateTime?

  newsletter    Newsletter      @relation(fields: [newsletterId], references: [id], onDelete: Cascade)
  subscriber    EmailSubscriber @relation(fields: [subscriberId], references: [id], onDelete: Cascade)

  @@unique([newsletterId, subscriberId])
  @@index([newsletterId])
}
```

### Updates to Existing Models

#### Channel Model Additions
```prisma
// Add to Channel model:
  isNewsletter      Boolean   @default(false)
  newsletterEnabled Boolean   @default(false)
  emailFrequency    String?   // 'instant', 'daily', 'weekly', 'monthly'
  customDomain      String?   // For custom newsletter URLs
  emailFromName     String?
  emailReplyTo      String?

  // New relations:
  newsletters       Newsletter[]
  emailSubscribers  EmailSubscriber[]
```

#### Subscription Model Updates
```prisma
// Add to Subscription model:
  emailNotifications Boolean @default(true)
```

---

## Phase 2: Backend API Development

### New Controllers

#### 1. **newsletterController.ts**
- `POST /api/newsletters` - Create newsletter draft
- `GET /api/newsletters` - List newsletters (with filters)
- `GET /api/newsletters/:id` - Get single newsletter
- `PUT /api/newsletters/:id` - Update newsletter
- `DELETE /api/newsletters/:id` - Delete newsletter
- `POST /api/newsletters/:id/publish` - Publish newsletter
- `POST /api/newsletters/:id/schedule` - Schedule newsletter
- `POST /api/newsletters/:id/send` - Send to email subscribers
- `GET /api/newsletters/:id/analytics` - Get newsletter analytics

#### 2. **emailSubscriberController.ts**
- `POST /api/channels/:id/subscribe-email` - Subscribe to email list
- `POST /api/channels/:id/unsubscribe-email` - Unsubscribe
- `GET /api/channels/:id/subscribers` - Get email subscribers
- `POST /api/verify-email/:token` - Verify email subscription
- `GET /api/subscriber/preferences/:token` - Get preferences
- `PUT /api/subscriber/preferences/:token` - Update preferences

### Email Service Integration

#### 3. **emailService.ts** - New service for sending emails
Options:
- **Resend** (recommended - modern, developer-friendly)
- **SendGrid** (enterprise, reliable)
- **AWS SES** (cost-effective at scale)
- **Mailgun** (transactional + bulk)

```typescript
class EmailService {
  async sendNewsletter(newsletter, subscribers)
  async sendVerificationEmail(subscriber)
  async sendWelcomeEmail(subscriber, channel)
  async trackOpen(newsletterId, subscriberId)
  async trackClick(newsletterId, subscriberId, url)
}
```

---

## Phase 3: Frontend Components

### New Components

#### 1. **NewsletterEditor** Component
- Rich text editor (TipTap, Quill, or Lexical)
- Drag-and-drop section builder
- Preview mode
- Image upload
- SEO fields (title, description, social cards)
- Save as draft
- Schedule/publish controls

#### 2. **NewsletterList** Component
- Grid/list view of newsletters
- Filter by status (draft, published, scheduled)
- Search functionality
- Analytics summary cards
- Batch actions

#### 3. **NewsletterView** Component
- Public newsletter reading interface
- Social sharing buttons
- Subscribe prompt for non-subscribers
- Related newsletters
- Comments section (optional)

#### 4. **SubscriberManagement** Component
- List of email subscribers
- Import/export functionality
- Segmentation tools
- Bulk actions (send, export)
- Analytics dashboard

#### 5. **NewsletterSettings** Component
- Email branding settings
- Custom domain setup
- Default sender info
- Email templates
- Frequency settings
- Auto-send options

#### 6. **PublicSubscribeForm** Component
- Email collection widget
- Double opt-in flow
- Preference selection
- Success/error states

### Updated Components

#### **ChannelManager** Updates
- Add "Enable Newsletter" toggle
- Newsletter settings tab
- Link to newsletter dashboard

#### **Channel View** Updates
- Show newsletter archive
- Subscribe via email option
- Latest newsletter preview

---

## Phase 4: Routes & Navigation

### New Routes
- `/newsletters` - Newsletter dashboard (creator view)
- `/newsletters/new` - Create new newsletter
- `/newsletters/:id/edit` - Edit newsletter
- `/newsletters/:id` - Public newsletter view
- `/:username/:slug` - Public newsletter URL
- `/subscribe/:channelId` - Subscribe landing page
- `/unsubscribe/:token` - Unsubscribe page
- `/verify/:token` - Email verification
- `/preferences/:token` - Subscriber preferences

### Navigation Updates
- Add "Newsletters" tab to Channel Manager
- Add "Newsletter Dashboard" to user menu
- Add "View as Newsletter" option to channels

---

## Phase 5: Key Features Implementation

### 1. **Rich Text Editor Integration**
- Use **Lexical** or **TipTap** for content editing
- Support for:
  - Headings, paragraphs, lists
  - Bold, italic, links
  - Images, videos
  - Code blocks
  - Embeds (YouTube, Twitter, etc.)
  - Tables
  - Block quotes

### 2. **Email Template System**
- Responsive HTML email templates
- Support for custom branding
- Social media links
- Unsubscribe footer
- View in browser link

### 3. **Scheduling System**
- Cron job or background worker
- Queue system (Bull/BullMQ)
- Retry logic for failed sends
- Rate limiting

### 4. **Analytics Dashboard**
- Open rate tracking (pixel)
- Click tracking (link wrapper)
- Geographic distribution
- Device/client stats
- Subscription growth charts
- Revenue metrics (if monetization added)

### 5. **SEO & Discovery**
- Public archive pages
- RSS feed per channel
- Sitemap generation
- Open Graph meta tags
- Twitter cards

### 6. **Subscriber Management**
- Double opt-in verification
- GDPR compliance (export data, delete)
- Preference center
- Segmentation by engagement
- A/B testing capabilities

---

## Phase 6: Monetization (Optional - Substack Premium)

### Paid Subscriptions
```prisma
model SubscriptionTier {
  id          Int     @id @default(autoincrement())
  channelId   Int
  name        String
  description String?
  price       Float   // Monthly price in cents
  interval    String  // 'monthly', 'yearly'
  benefits    Json    // Array of benefits
  isActive    Boolean @default(true)

  channel     Channel @relation(fields: [channelId], references: [id])
  @@index([channelId])
}

model Payment {
  id              Int      @id @default(autoincrement())
  userId          Int
  channelId       Int
  tierId          Int
  amount          Float
  status          String   // 'pending', 'completed', 'failed', 'refunded'
  stripePaymentId String?
  createdAt       DateTime @default(now())

  user   User              @relation(fields: [userId], references: [id])
  tier   SubscriptionTier  @relation(fields: [tierId], references: [id])
  @@index([userId])
  @@index([channelId])
}
```

### Stripe Integration
- Payment processing
- Subscription management
- Webhooks for status updates
- Paywalls for premium content
- Subscriber-only newsletters

---

## Phase 7: Implementation Priority

### MVP (Minimum Viable Product)
1. Database schema (Newsletter, EmailSubscriber)
2. Basic newsletter CRUD
3. Simple text editor
4. Email sending via Resend
5. Public subscribe/unsubscribe
6. Basic newsletter view

### Phase 2 Enhancement
1. Rich text editor
2. Analytics tracking
3. Scheduling system
4. Subscriber management UI
5. Email templates

### Phase 3 Advanced
1. Segmentation
2. A/B testing
3. Paid subscriptions
4. Advanced analytics
5. Custom domains

---

## Technical Considerations

### Email Deliverability
- SPF, DKIM, DMARC setup
- Dedicated sending domain
- Warm-up strategy for new domains
- Bounce handling
- Complaint handling
- List hygiene

### Performance
- Queue system for bulk sends
- Rate limiting (email provider limits)
- Database indexing for analytics
- Caching for public pages
- CDN for newsletter images

### Compliance
- GDPR (data export, deletion)
- CAN-SPAM Act (unsubscribe, physical address)
- CASL (Canadian anti-spam)
- Double opt-in for EU subscribers
- Privacy policy updates

### Storage
- Rich content storage (large newsletters)
- Image hosting (Cloudinary, S3)
- Email templates storage
- Analytics data retention policy

---

## Estimated Timeline

- **Phase 1** (Schema): 1-2 days
- **Phase 2** (API): 3-5 days
- **Phase 3** (Frontend - MVP): 5-7 days
- **Phase 4** (Email Service): 2-3 days
- **Phase 5** (Analytics): 3-4 days
- **Phase 6** (Monetization): 5-7 days

**Total MVP**: ~2-3 weeks
**Full Feature Set**: ~6-8 weeks

---

## Alternative: Leverage Existing Stories

Instead of creating a separate Newsletter model, you could:
- Flag Stories as "newsletter editions" (`isNewsletter: boolean`)
- Add email sending to existing Story publishing
- Simpler schema, faster implementation
- Trade-off: Less flexibility for newsletter-specific features

This approach would be faster (1-2 weeks for MVP) but less feature-rich.
