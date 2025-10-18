# Kinfolk

A modern social media platform built with channel-based content organization, enabling users to curate their digital presence across multiple topic-specific channels.

## Overview

Kinfolk is a multi-platform social networking application that reimagines content organization through a channel-based system. Users can create multiple channels to organize their stories by topic, manage subscriptions, engage with threaded conversations, and customize their experience with themes.

## Key Features

### Channel System
- **Primary Channels**: Every user gets an automatic primary channel named after them
- **Additional Channels**: Create up to 2 additional channels per platform (3 total)
- **Privacy Controls**: Make any channel public or private with granular access control
- **Subscriptions**: Subscribe to public channels instantly or request access to private ones
- **Platform Scoping**: Channels are scoped to platforms, enabling isolated communities

See [CHANNELS.md](./CHANNELS.md) for comprehensive channel system documentation.

### Content & Engagement
- **Stories**: Create text stories with optional media attachments
- **Threaded Comments**: Full comment system with nested replies (up to 3 levels deep)
- **Likes**: Like stories and comments
- **Real-time Updates**: Live activity simulation with hydration system
- **Timestamps**: Human-readable relative timestamps (e.g., "5m ago", "3h ago")

### User Experience
- **User Profiles**: View user information, channels, and activity
- **Theme System**: Multiple color themes with customizable UI
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type-Safe**: Full TypeScript implementation

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Test Coverage**: 87 tests across 7 test suites

## Project Structure

```
src/
├── api/              # API service layer (mock backend)
├── components/       # React components
│   ├── Avatar.tsx
│   ├── Comment.tsx
│   ├── StoryComponent.tsx
│   ├── ThemeSelector.tsx
│   └── *.test.tsx   # Component tests
├── data/            # Mock data and initialization
│   ├── mockData.ts
│   └── mockData.test.ts
├── test/            # Test utilities and integration tests
│   ├── utils.tsx
│   ├── integration.test.tsx
│   └── README.md
├── types/           # TypeScript type definitions
│   └── index.ts
└── App.tsx          # Main application component
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Data Architecture

### Current Implementation (Mock Data)
The application currently uses an in-memory mock data system for development and testing:

- **Storage**: Module-level arrays (`storiesDB`, `channelsDB`, `subscriptionsDB`, `mockUsers`)
- **Persistence**: Data resets on page refresh
- **API Layer**: `ApiService` provides async CRUD operations with simulated delays
- **Initialization**: `initializeDB()` populates initial mock data on app load

### Mock Data Includes
- 5 mock users with profiles
- 7 channels (5 primary + 2 additional)
- 28 total stories (5 root stories + 17 comments + 6 nested replies)
- Multiple subscriptions between users

## Key Components

### App.tsx
Main application component managing:
- Global state (stories, users, channels, themes)
- View routing (feed, profile, story detail)
- Story creation and management
- Activity simulation

### ApiService
Provides async methods for:
- `getStories()` - Fetch all stories
- `createStory()` - Create stories/comments with validation
- `updateStory()` - Edit story content
- `deleteStory()` - Delete stories/comments
- `toggleLike()` - Like/unlike stories
- `subscribeToChannel()` - Channel subscriptions
- `updateUserProfile()` - Update user profiles

### StoryComponent
Renders stories and comments with:
- User information and avatars
- Like and comment interactions
- Nested comment threading
- Edit/delete functionality (for owners)
- Timestamp navigation

### Comment Component
Handles threaded conversations:
- Reply functionality
- Nested reply display
- Comment-specific interactions
- Recursive rendering for deep threads

## Testing

The project has comprehensive test coverage:

- **Unit Tests**: Component tests for all major UI components
- **Integration Tests**: End-to-end workflow tests
- **Test Utilities**: Custom render functions and mock data
- **Coverage**: 87 passing tests across 7 test files

## Development Notes

### Type Safety
All components, functions, and data structures are fully typed with TypeScript. See `src/types/index.ts` for type definitions.

### Theme System
Themes are defined in `src/types/index.ts` with support for:
- Primary, secondary, and accent colors
- Background and text colors
- Border colors
- Full Tailwind CSS compatibility

### Mock Server
The `MockServer` class simulates real-time updates by:
- Randomly modifying story likes/comments
- Simulating network delays
- Providing hydration payloads

## Future Enhancements

- **Backend Integration**: Replace mock data with real API
- **Persistent Storage**: Database integration
- **Authentication**: User login/registration
- **File Uploads**: Media attachment support
- **Channel Invitations**: Direct invite system for private channels
- **Notifications**: Real-time notification system
- **Channel Analytics**: Insights and metrics
- **Search**: Full-text search for stories and channels

## License

Private project - All rights reserved

## Contributing

This is a private project. For questions or collaboration inquiries, please contact the repository owner.
