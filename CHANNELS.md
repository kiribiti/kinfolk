# Kinfolk Channels System

## Overview

Kinfolk uses a channel-based content distribution system where users can organize their stories into distinct channels. Each user gets one primary channel automatically, with the ability to create up to two additional channels (3 total).

**Multi-Platform Architecture**: Kinfolk operates as a multi-platform system where channels are scoped to specific platforms. Each channel belongs to both a user and a platform, enabling isolated communities and content spaces within the broader kinfolk ecosystem.

---

## Core Features

### 1. Channel Creation & Management

#### Automatic Primary Channel

-   **Auto-Creation**: Every user automatically receives a primary channel upon registration
-   **Naming**: Primary channel is named after the user (e.g., "Sarah Chen")
-   **Default Storying**: All stories go to the primary channel by default
-   **Cannot Be Deleted**: Primary channel is permanent (but can be made private)

#### Additional Channels

-   **Limit**: Users can create up to 2 additional channels (3 total including primary)
-   **Custom Naming**: Users choose their own channel names (e.g., "Archive Stories", "Family History")
-   **Description**: Each channel can have a description explaining its purpose
-   **Deletion**: Additional channels can be deleted by the owner
-   **Reordering**: Users can set which channel is their default for storying

#### Channel Properties

-   `id`: Unique identifier
-   `platformId`: Platform the channel belongs to (required)
-   `userId`: Owner of the channel
-   `name`: Channel display name
-   `description`: Optional channel description
-   `isPrimary`: Boolean flag for primary channel
-   `isPrivate`: Privacy setting (public/private)
-   `subscriberCount`: Number of subscribers
-   `createdAt`: Creation timestamp
-   `updatedAt`: Last modified timestamp

---

## 2. Privacy Settings

### Public Channels

-   **Default State**: Channels are public by default
-   **Visibility**: Anyone can discover and view public channel content
-   **Subscription**: Users can freely subscribe to any public channel
-   **Discovery**: Public channels appear in search, user profiles, and recommendations

### Private Channels

-   **Restricted Access**: Only approved subscribers can view channel content
-   **Hidden Content**: Stories in private channels are not visible to non-subscribers
-   **Opt-In**: Channel owners can make any channel (including primary) private
-   **Discovery**: Private channels show as "Private Channel" with a lock icon
    -   Channel name and description are visible
    -   Story content and count are hidden from non-subscribers

---

## 3. Subscription System

### Public Channel Subscriptions

-   **One-Click Subscribe**: Users can instantly subscribe to any public channel
-   **Unsubscribe**: Users can unsubscribe at any time
-   **No Approval Needed**: Subscriptions are immediate

### Private Channel Subscriptions

#### Subscription Requests

-   **Request Access**: Users can request to subscribe to private channels
-   **Request Status**: Pending, Approved, or Denied
-   **Notification**: Channel owner receives notification of subscription request
-   **Request Message**: (Optional) User can include a message explaining why they want to subscribe

#### Channel Owner Actions

-   **Approve Requests**: Grant access to pending subscription requests
-   **Deny Requests**: Reject subscription requests
-   **Revoke Access**: Remove existing subscribers at any time
-   **View Subscribers**: See list of all current subscribers
-   **View Pending Requests**: See all pending subscription requests

#### Invitations

-   **Direct Invites**: Channel owners can invite specific users to subscribe
-   **Invite by Username**: Send invitation using username
-   **Invite by Email**: (Optional) Send invitation to email address
-   **Invite Link**: (Optional) Generate a shareable invite link with expiration
-   **Accept/Decline**: Invited users can accept or decline the invitation
-   **Notification**: Invited users receive notification of the invitation

---

## 4. Storying to Channels

### Channel Selection

-   **Default Channel**: Stories default to user's designated default channel
-   **Channel Picker**: Dropdown/selector in compose box to choose channel
-   **Single Channel**: Each story belongs to exactly one channel (no cross-storying)
-   **Cannot Change**: Once storyed, the channel cannot be changed (story must be deleted and recreated)

### Visibility Rules

-   **Public Channel Stories**: Visible to all subscribers and discoverable
-   **Private Channel Stories**: Only visible to approved subscribers
-   **Feed Aggregation**: User's home feed shows stories from all their subscribed channels

---

## 5. Discovery & Search

### Finding Channels

-   **User Profiles**: View all user's public channels (private shown as locked)
-   **Search**: Search for channels by name or description
-   **Recommendations**: Suggested channels based on subscriptions and activity
-   **Browse by User**: Find a user, then explore their channels

### Channel Previews

-   **Public Channels**: Show recent stories, subscriber count, description
-   **Private Channels**: Show channel name, description, subscriber count (if public), lock icon
    -   No story previews or content visible

---

## 6. Channel Management UI

### Owner Capabilities

-   **Edit Channel**: Change name, description, privacy setting
-   **View Analytics**: See subscriber count, story count, engagement metrics
-   **Manage Subscribers**: View, approve, deny, or remove subscribers (private channels)
-   **Manage Invites**: Send, view, and cancel pending invitations
-   **Delete Channel**: Remove additional channels (not primary)
-   **Set Default**: Choose which channel is default for storying

### Subscriber Capabilities

-   **Subscribe/Unsubscribe**: Manage channel subscriptions
-   **Request Access**: Request to subscribe to private channels
-   **Notification Preferences**: Customize notifications per channel
-   **View Channel**: See channel description, stories, and activity

---

## 7. Notifications

### Channel Owner Notifications

-   New subscription request for private channel
-   User accepted channel invitation
-   User subscribed to public channel (optional)
-   User unsubscribed from channel (optional)

### Subscriber Notifications

-   Invitation to subscribe to private channel
-   Subscription request approved
-   Subscription request denied
-   New story in subscribed channel (configurable per channel)

---

## 8. Data Model

### Channel Table

```typescript
{
    id: string;
    platformId: string; // platform this channel belongs to
    userId: string;
    name: string;
    description: string | null;
    isPrimary: boolean;
    isPrivate: boolean;
    subscriberCount: number;
    storyCount: number;
    createdAt: Date;
    updatedAt: Date;
}
```

### Subscription Table

```typescript
{
    id: string;
    subscriberId: string; // user subscribing
    channelId: string; // channel being subscribed to
    status: "active" | "pending" | "denied";
    requestMessage: string | null;
    createdAt: Date;
    approvedAt: Date | null;
}
```

### Invitation Table

```typescript
{
    id: string;
    channelId: string;
    inviterId: string; // channel owner
    inviteeId: string | null; // specific user (if user-based)
    inviteEmail: string | null; // email (if email-based)
    inviteCode: string | null; // unique code (if link-based)
    status: "pending" | "accepted" | "declined" | "expired";
    expiresAt: Date | null;
    createdAt: Date;
}
```

### Story Table (Updated)

```typescript
{
  id: string
  platformId: string  // platform this story belongs to
  userId: string
  channelId: string  // required - every story belongs to a channel
  content: string
  media: MediaFile[]
  likes: number
  comments: number
  createdAt: Date
}
```

---

## 9. Business Rules

### Platform Scoping

-   ✅ Every channel must belong to a platform (`platformId` is required)
-   ✅ Users can have channels across multiple platforms
-   ✅ Channel names must be unique per user per platform (not globally unique)
-   ✅ Subscriptions are platform-scoped (subscribe to a channel within a platform)
-   ✅ Stories are platform-scoped (stories belong to a channel on a specific platform)
-   ✅ Users cannot cross-story between platforms

### Channel Limits

-   ✅ Every user has exactly 1 primary channel per platform (auto-created)
-   ✅ Users can create up to 2 additional channels per platform
-   ✅ Maximum 3 channels per user per platform
-   ✅ Primary channel cannot be deleted
-   ✅ Channel names must be unique per user per platform
-   ✅ Channel names: 3-50 characters

### Subscription Rules

-   ✅ Users cannot subscribe to their own channels
-   ✅ Public channels: instant subscription
-   ✅ Private channels: requires approval or invitation
-   ✅ Users can unsubscribe at any time
-   ✅ Channel owners can remove subscribers at any time

### Privacy Rules

-   ✅ Any channel can be made private (including primary)
-   ✅ Making a channel private does not remove existing subscribers
-   ✅ Private channel stories are only visible to approved subscribers
-   ✅ Channel owners always see their own private channel content

### Storying Rules

-   ✅ Every story must belong to exactly one channel
-   ✅ Stories cannot be moved between channels
-   ✅ Users can only story to channels they own
-   ✅ Private channel stories are not visible in public feeds

---

## 10. User Experience Flows

### New User Flow

1. User registers account or joins a platform
2. Primary channel auto-created with user's name (scoped to that platform)
3. User stories to primary channel by default (within that platform)
4. (Optional) User creates additional channels for specific topics (within that platform)
5. (Optional) User makes channels private and manages access
6. (Optional) User joins additional platforms and gets new primary channels on each

### Subscribing to Public Channel Flow

1. User discovers channel (search, profile, recommendations)
2. User clicks "Subscribe" button
3. Subscription is instant
4. User sees stories from channel in their feed

### Subscribing to Private Channel Flow

1. User discovers private channel (shows lock icon)
2. User clicks "Request to Subscribe"
3. (Optional) User adds a message with their request
4. Channel owner receives notification
5. Channel owner approves or denies request
6. User receives notification of decision
7. If approved, user sees channel stories in their feed

### Channel Invitation Flow

1. Channel owner navigates to channel settings
2. Owner clicks "Invite Subscribers"
3. Owner enters username or generates invite link
4. Invited user receives notification or link
5. User accepts or declines invitation
6. If accepted, user is subscribed to channel
7. Channel owner receives notification

---

## 11. Platform Architecture Notes

### Multi-Platform System

-   **Platform Isolation**: Channels, stories, and subscriptions are scoped to specific platforms
-   **User Portability**: A single user account can participate in multiple platforms
-   **Primary Channel per Platform**: Users automatically receive a primary channel when joining each platform
-   **Independent Channel Limits**: The 3-channel limit applies per platform (user could have 3 channels on Platform A and 3 on Platform B)
-   **Cross-Platform Discovery**: (Future) Users might discover content across platforms they belong to
-   **Platform-Specific Settings**: Channel settings, privacy, and subscriptions are managed per platform

### Platform ID Usage

-   Every channel has a `platformId` foreign key
-   Every story has a `platformId` foreign key (inherited from its channel)
-   Subscriptions reference channels, which are already platform-scoped
-   Feeds aggregate stories from channels within the current platform context
-   Search and discovery are filtered by current platform

### Implementation Considerations

-   **Context Awareness**: The application always knows which platform context the user is in
-   **Data Isolation**: Queries must always filter by `platformId` to ensure data isolation
-   **URL Structure**: Platform likely appears in URL (e.g., `kinfolk.com/platform-name/...`)
-   **Navigation**: Users can switch between platforms they belong to
-   **Analytics**: Platform-specific metrics and insights

> **Note**: Detailed platform architecture (Platform model, membership, roles, permissions) will be specified in a separate PLATFORM.md document.

### Potential Enhancements

-   **Channel Analytics**: Detailed insights on subscriber growth, engagement, popular stories
-   **Scheduled Stories**: Story to channels at specific times
-   **Channel Themes**: Custom colors/styling per channel
-   **Channel Collaboration**: Multiple owners/moderators per channel
-   **Channel Categories/Tags**: Organize channels by topic
-   **Featured Stories**: Pin important stories to top of channel
-   **Channel Archives**: Download all stories from a channel
-   **Subscriber Tiers**: Different access levels within private channels
-   **Cross-Storying**: Allow stories to appear in multiple owned channels
-   **Channel Templates**: Quick-start templates for common channel types

---

## Summary

The kinfolk channel system provides a flexible, user-centric approach to content organization and distribution. With automatic primary channels, optional additional channels, granular privacy controls, and a robust subscription system, users can curate their content and audience while maintaining full control over their digital presence.
