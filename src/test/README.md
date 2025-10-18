# Test Suite Documentation

## Overview

This test suite uses **Vitest** and **React Testing Library** to ensure the quality and reliability of the Kinfolk application.

## Running Tests

### Install Dependencies

First, install the testing dependencies:

```bash
npm install
```

### Test Commands

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once (useful for CI/CD)
npm run test:run

# Run tests with UI (visual test runner)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Test Files

- `src/api/index.test.ts` - API service tests
- `src/components/Avatar.test.tsx` - Avatar component tests
- `src/components/PostComponent.test.tsx` - Post component tests
- `src/components/ThemeSelector.test.tsx` - Theme selector tests
- `src/data/mockData.test.ts` - Mock data and utility function tests

### Test Utilities

- `src/test/setup.ts` - Global test setup and configuration
- `src/test/utils.tsx` - Test helpers, mock data, and custom render functions

## Coverage

The test suite covers:

### API Layer (src/api/index.test.ts)
- ✅ Post creation (including comments)
- ✅ Post updates
- ✅ Post deletion with authorization
- ✅ Like/unlike functionality
- ✅ User profile updates
- ✅ Input validation
- ✅ Error handling

### Components
- ✅ Avatar rendering and theming (src/components/Avatar.test.tsx)
- ✅ Post display and interactions (src/components/PostComponent.test.tsx)
- ✅ Comment functionality
- ✅ Profile navigation
- ✅ Theme selection (src/components/ThemeSelector.test.tsx)

### Utilities (src/data/mockData.test.ts)
- ✅ Timestamp formatting
- ✅ Database initialization
- ✅ Channel creation
- ✅ Mock data structure

## Writing New Tests

### Example Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/utils';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const mockHandler = vi.fn();

    render(<YourComponent onClick={mockHandler} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### Best Practices

1. **Use descriptive test names** - Test names should clearly describe what is being tested
2. **Arrange-Act-Assert** - Structure tests with clear setup, action, and assertion phases
3. **Test user behavior** - Focus on testing from the user's perspective
4. **Mock external dependencies** - Use `vi.fn()` for mocks and spies
5. **Clean up** - Let the test setup handle cleanup automatically
6. **Avoid implementation details** - Test behavior, not implementation

## Mock Data

The test utilities provide pre-configured mock data:

```typescript
import {
  mockUser,
  mockVerifiedUser,
  mockPost,
  mockPostWithComment,
  mockTheme,
} from '../test/utils';
```

## Coverage Goals

Current coverage targets:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View detailed coverage reports by running:
```bash
npm run test:coverage
```

Then open `coverage/index.html` in your browser.

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Use:

```bash
npm run test:run
```

This command runs all tests once and exits, perfect for automated testing environments.

## Troubleshooting

### Tests timing out
Increase the timeout in `vitest.config.ts`:
```typescript
test: {
  testTimeout: 10000, // 10 seconds
}
```

### Mock data conflicts
Reset mock data in `beforeEach`:
```typescript
import { postsDB } from '../data/mockData';

beforeEach(() => {
  postsDB.length = 0;
});
```

### Component not rendering
Make sure you're using the custom render function:
```typescript
import { render } from '../test/utils';
```

## Future Enhancements

Planned test additions:
- [ ] Integration tests for complete user flows
- [ ] E2E tests with Playwright
- [ ] Performance tests
- [ ] Accessibility tests
- [ ] Visual regression tests
