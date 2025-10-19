# Kinfolk - Development Roadmap

## High-Priority Features

### 1. Wire up Subscribe buttons
The sidebar and profile screens have subscribe buttons that aren't functional yet. Connect them to the subscription API endpoints.

**Tasks:**
- Connect subscribe buttons to `ApiService.subscribe()`
- Handle subscription state updates
- Show pending/approved status
- Update subscriber counts in real-time

### 2. Implement Stories feed filtering
Currently showing all stories. Could add:
- Filter by subscribed channels only
- Filter by specific channel
- Show only stories from followed users
- Add filter UI/controls

### 3. Add real-time features
You have the hydration system, but could enhance with:
- WebSocket connection for live updates
- Real-time notifications
- Live activity indicators
- Typing indicators for comments

### 4. Search functionality
The search bar in the header isn't connected. Implement:
- Search stories by content
- Search users
- Search channels
- Search hashtags
- Search results page

### 5. Profile completion
The profile screen could use:
- Show user's channels
- Display subscription lists
- Show followers/following counts
- Add tabs for stories/channels/subscriptions

### 6. Image/Video upload
Currently using data URLs. Could add:
- Actual file upload to server/cloud storage (S3, Cloudinary, etc.)
- Image optimization and resizing
- Video thumbnail generation
- Progress indicators for uploads

### 7. Notifications system
Build out the notifications tab with:
- Like notifications
- Comment notifications
- Subscription request notifications
- New follower notifications
- Mark as read functionality
- Real-time notification badges

### 8. Private channels workflow
Implement:
- Subscription request flow
- Approval/rejection UI for channel owners
- Pending requests indicator
- Request messages from subscribers

---

## Quick Wins

### Keyboard shortcuts
- ESC to close modals/sidebar
- Keyboard navigation for feeds
- CMD+K for search
- Shortcuts for posting

### Loading states
- Add skeleton screens for data loading
- Shimmer effects for images
- Loading spinners for actions
- Optimistic UI updates

### Error boundaries
- Better error handling UI
- Graceful degradation
- Error reporting
- Retry mechanisms

### Infinite scroll
- For stories feed
- Lazy loading of stories
- "Load more" button fallback
- Scroll position restoration

### Story timestamps
- Show relative time (e.g., "2 hours ago")
- Full timestamp on hover
- Auto-update timestamps
- Localized date/time formatting

---

## Additional Features (Future)

- **Direct messaging** - Private messages between users
- **Story bookmarks** - Save stories for later
- **Analytics dashboard** - For channel owners
- **Export/Import data** - User data portability
- **Two-factor authentication** - Enhanced security
- **Email notifications** - Digest emails, activity alerts
- **Mobile apps** - React Native or PWA
- **Moderation tools** - Report/block functionality
- **Rich text editor** - Markdown or WYSIWYG for stories
- **Polls and surveys** - Interactive content types
- **Story scheduling** - Post at specific times
- **API rate limiting** - Prevent abuse
- **CDN integration** - Faster media delivery
