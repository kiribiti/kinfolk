import React, {useState, useEffect, useCallback} from 'react';
import {
    Search,
    Home,
    Bell,
    User as UserIcon,
    Plus,
    RefreshCw,
    Palette,
    Camera,
    XCircle,
    Lock,
    Globe,
    ChevronDown,
    MessageCircle,
    LogIn,
    LogOut,
    Menu
} from 'lucide-react';

// Import types
import {Theme, themes, Story, MediaFile, Channel, User, TabType} from './types';

// Import data and utilities
import {
    mockUsers,
    initializeDB,
    ActivitySimulator,
    MockServer,
} from './data/mockData';

// Import API
import {ApiService as api, getAuthToken, clearAuthToken} from './api';

// Import localStorage utilities
import {saveThemeToLocalStorage, loadThemeFromLocalStorage} from './utils/localStorage';

// Import components
import {Avatar} from './components/Avatar';
import {ThemeSelector} from './components/ThemeSelector';
import {Sidebar} from './components/Sidebar';
import {StoryComponent} from './components/StoryComponent';
import {ChannelManager} from './components/ChannelManager';
import {ProfileScreen} from './components/ProfileScreen';
import {LoginModal} from './components/LoginModal';

// ============================================
// MAIN APP
// ============================================

const App: React.FC = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [users] = useState<Record<number, User>>(
        mockUsers.reduce((acc, user) => ({...acc, [user.id]: user}), {})
    );
    const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [viewingUserId, setViewingUserId] = useState<number | null>(null);
    const [viewingPostId, setViewingPostId] = useState<number | null>(null);
    const [hydratedPostIds, setHydratedPostIds] = useState<Set<number>>(new Set());
    const [lastHydration, setLastHydration] = useState<string | null>(null);
    const [isHydrating, setIsHydrating] = useState(false);
    const [hydrationMessage, setHydrationMessage] = useState<string | null>(null);
    const [server] = useState(() => new MockServer());
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
        // Load theme from localStorage on initialization
        const savedThemeId = loadThemeFromLocalStorage();
        if (savedThemeId) {
            const savedTheme = themes.find(t => t.id === savedThemeId);
            if (savedTheme) {
                return savedTheme;
            }
        }
        // Fallback to Kinfolk Heritage (default theme)
        return themes[0];
    });
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
    const [showChannelManager, setShowChannelManager] = useState(false);
    const [showChannelSelector, setShowChannelSelector] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getAuthToken());
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Initialize and load data from API
    useEffect(() => {
        initializeDB(); // Still needed for mock users temporarily
        loadStories();
        loadChannels();
    }, []);

    const loadStories = async () => {
        const response = await api.getStories();
        if (response.success && response.data) {
            setStories(response.data);
        }
    };

    const loadChannels = async () => {
        const response = await api.getChannels(currentUser.id);
        if (response.success && response.data) {
            setChannels(response.data);

            // Set default channel to primary channel
            const primaryChannel = response.data.find((c: Channel) => c.isPrimary);
            if (primaryChannel) {
                setSelectedChannelId(primaryChannel.id);
            }
        }
    };

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && mediaFiles.length === 0) return;
        if (!selectedChannelId) {
            showNotification('Please select a channel');
            return;
        }

        setIsPosting(true);
        try {
            const response = await api.createStory(
                currentUser.id,
                newPostContent,
                mediaFiles,
                selectedChannelId
            );
            if (response.success && response.data) {
                setStories(prev => [{...response.data!, isNew: true}, ...prev]);
                setNewPostContent('');
                setMediaFiles([]);

                // Update channel post count
                setChannels(prev => prev.map(c =>
                    c.id === selectedChannelId
                        ? {...c, storyCount: c.storyCount + 1}
                        : c
                ));

                showNotification('Story created successfully! 🎉');
            } else {
                showNotification(response.error || 'Failed to create post');
            }
        } catch (error) {
            showNotification('Failed to create post');
        } finally {
            setIsPosting(false);
        }
    };

    const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        if (mediaFiles.length + files.length > 4) {
            showNotification('Maximum 4 media files allowed per post');
            return;
        }

        setIsUploadingMedia(true);

        Array.from(files).forEach((file) => {
            if (file.size > 10 * 1024 * 1024) {
                showNotification('File size must be less than 10MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const mediaFile: MediaFile = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: file.type.startsWith('video/') ? 'video' : 'image',
                    url: reader.result as string,
                };

                setMediaFiles(prev => [...prev, mediaFile]);
                setIsUploadingMedia(false);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveMedia = (id: string) => {
        setMediaFiles(prev => prev.filter(file => file.id !== id));
    };

    const handleChannelCreated = async (channel: Channel) => {
        // Reload channels from API to get the latest data
        await loadChannels();
        showNotification(`Channel "${channel.name}" created! ✨`);
    };

    const handleChannelUpdated = async (updated: Channel) => {
        // Reload channels from API to get the latest data
        await loadChannels();
        showNotification(`Channel "${updated.name}" updated! ✏️`);
    };

    const handleChannelDeleted = async (channelId: number) => {
        // Reload channels and stories from API to get the latest data
        await loadChannels();
        await loadStories();

        // Clear selected channel if it was the deleted one
        if (selectedChannelId === channelId) {
            const primaryChannel = channels.find(c => c.isPrimary);
            if (primaryChannel) {
                setSelectedChannelId(primaryChannel.id);
            } else {
                setSelectedChannelId(null);
            }
        }

        showNotification('Channel deleted! 🗑️');
    };

    const selectedChannel = channels.find(c => c.id === selectedChannelId);
    const userChannels = channels.filter(c => c.userId === currentUser.id);

    const handleUpdatePost = async (storyId: number, content: string) => {
        try {
            const response = await api.updateStory(storyId, content);
            if (response.success && response.data) {
                setStories(prev => prev.map(p => p.id === storyId ? response.data! : p));
                showNotification('Story updated successfully! ✏️');
            } else {
                showNotification(response.error || 'Failed to update post');
            }
        } catch (error) {
            showNotification('Failed to update post');
        }
    };

    const handleDeletePost = async (storyId: number) => {
        try {
            const response = await api.deleteStory(storyId, currentUser.id);
            if (response.success) {
                setStories(prev => prev.filter(p => p.id !== storyId));
                showNotification('Story deleted successfully! 🗑️');
            } else {
                showNotification(response.error || 'Failed to delete post');
            }
        } catch (error) {
            showNotification('Failed to delete post');
        }
    };

    const handleLike = async (storyId: number) => {
        // Optimistic update
        setStories(prev =>
            prev.map(post => {
                if (post.id === storyId) {
                    const isCurrentlyLiked = post.likedBy.includes(currentUser.id);
                    return {
                        ...post,
                        likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
                        likedBy: isCurrentlyLiked
                            ? post.likedBy.filter(id => id !== currentUser.id)
                            : [...post.likedBy, currentUser.id]
                    };
                }
                return post;
            })
        );

        try {
            await api.toggleLike(storyId, currentUser.id);
        } catch (error) {
            // Revert on error
            loadStories();
        }
    };

    const handleComment = async (parentId: number, content: string) => {
        try {
            const parentPost = stories.find(p => p.id === parentId);
            if (!parentPost) return;

            const response = await api.createStory(
                currentUser.id,
                content,
                undefined,
                parentPost.channelId,
                parentId
            );

            if (response.success && response.data) {
                setStories(prev => [{...response.data!, isNew: true}, ...prev]);
                showNotification(response.message || 'Comment posted! 💬');
            } else {
                showNotification(response.error || 'Failed to post comment');
            }
        } catch (error) {
            showNotification('Failed to post comment');
        }
    };

    const handleUserUpdate = async (updatedFields: Partial<User>) => {
        try {
            const response = await api.updateUserProfile(currentUser.id, updatedFields);
            if (response.success && response.data) {
                setCurrentUser(response.data);
                showNotification('Profile updated successfully! ✓');
            } else {
                showNotification(response.error || 'Failed to update profile');
            }
        } catch (error) {
            showNotification('Failed to update profile');
        }
    };

    const handleThemeChange = async (theme: Theme) => {
        // Update state immediately for UI responsiveness
        setCurrentTheme(theme);

        // Save to localStorage for fast loading on next visit
        saveThemeToLocalStorage(theme.id);

        // Save to user profile for backup/sync
        try {
            const response = await api.updateUserProfile(currentUser.id, { themeId: theme.id });
            if (response.success && response.data) {
                setCurrentUser(response.data);
                showNotification('Theme updated! 🎨');
            }
        } catch (error) {
            // Theme is still applied locally even if API fails
            console.warn('Failed to save theme to user profile:', error);
            showNotification('Theme applied locally');
        }
    };

    const handleLogin = () => {
        setShowLoginModal(true);
    };

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        clearAuthToken();
        setIsAuthenticated(false);
        showNotification('Logged out successfully');
    };

    const handleViewProfile = (userId: number) => {
        setViewingUserId(userId);
        setViewingPostId(null); // Reset post view
        setActiveTab('profile');
        // Update URL without navigation
        window.history.pushState({}, '', `/@${users[userId]?.username || userId}`);
    };

    const handleViewStory = (storyId: number) => {
        setViewingPostId(storyId);
        setViewingUserId(null); // Reset profile view
        setActiveTab('home');
        // Update URL without navigation
        window.history.pushState({}, '', `/story/${storyId}`);
    };

    useEffect(() => {
        const simulator = new ActivitySimulator(({action, storyId, userId}) => {
            if (userId === currentUser.id && action !== 'comment') return;

            setStories(prevStories =>
                prevStories.map(post => {
                    if (post.id === storyId) {
                        const updatedPost = {...post};

                        if (action === 'like') {
                            if (!updatedPost.likedBy.includes(userId)) {
                                updatedPost.previousLikes = updatedPost.likes;
                                updatedPost.likes += 1;
                                updatedPost.likedBy = [...updatedPost.likedBy, userId];
                                updatedPost.lastActivityUserId = userId;
                            }
                        } else if (action === 'unlike') {
                            if (updatedPost.likedBy.includes(userId)) {
                                updatedPost.previousLikes = updatedPost.likes;
                                updatedPost.likes -= 1;
                                updatedPost.likedBy = updatedPost.likedBy.filter(id => id !== userId);
                                updatedPost.lastActivityUserId = userId;
                            }
                        } else if (action === 'comment') {
                            updatedPost.previousComments = updatedPost.comments;
                            updatedPost.comments += 1;
                            updatedPost.lastActivityUserId = userId;
                        }

                        return updatedPost;
                    }
                    return post;
                })
            );
        });

        simulator.start();
        return () => simulator.stop();
    }, [currentUser.id]);

    const handleHydration = useCallback(async () => {
        setIsHydrating(true);
        setHydratedPostIds(new Set());

        try {
            const payload = await server.fetchHydration(stories);

            const updatedIds = new Set(payload.updates.map(u => u.id));
            const newIds = new Set(payload.newStories.map(p => p.id));
            setHydratedPostIds(new Set([...updatedIds, ...newIds]));

            setStories(prevStories => {
                let updatedStories = prevStories.map(post => {
                    const update = payload.updates.find(u => u.id === post.id);
                    if (update) {
                        return {
                            ...post,
                            previousLikes: post.likes,
                            previousComments: post.comments,
                            likes: update.likes,
                            comments: update.comments,
                        };
                    }
                    return post;
                });

                if (payload.newStories.length > 0) {
                    updatedStories = [...payload.newStories, ...updatedStories];
                }

                return updatedStories;
            });

            setLastHydration(new Date().toLocaleTimeString());
            setHydrationMessage(payload.message);

            setTimeout(() => {
                setHydratedPostIds(new Set());
                setHydrationMessage(null);
            }, 3000);
        } catch (error) {
            console.error('Hydration failed:', error);
        } finally {
            setIsHydrating(false);
        }
    }, [stories, server]);

    return (
        <div className="min-h-screen" style={{backgroundColor: currentTheme.background}}>
            <header className="border-b sticky top-0 z-50" style={{
                backgroundColor: currentTheme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
                borderColor: currentTheme.accent
            }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-bold" style={{color: currentTheme.primary}}>
                                kinfolk
                            </h1>

                            <div className="hidden md:flex items-center gap-6">
                                <button
                                    onClick={() => {
                                        setActiveTab('home');
                                        setViewingPostId(null); // Reset to show all stories
                                        setViewingUserId(null);
                                        window.history.pushState({}, '', '/');
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors`}
                                    style={activeTab === 'home' ? {
                                        backgroundColor: currentTheme.background,
                                        color: currentTheme.primary
                                    } : {color: '#6b7280'}}
                                >
                                    <Home className="w-5 h-5"/>
                                    <span className="font-medium">Home</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors`}
                                    style={activeTab === 'notifications' ? {
                                        backgroundColor: currentTheme.background,
                                        color: currentTheme.secondary
                                    } : {color: '#6b7280'}}
                                >
                                    <Bell className="w-5 h-5"/>
                                    <span className="font-medium">Notifications</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setActiveTab('profile');
                                        setViewingUserId(null); // Reset to show current user's profile
                                        window.history.pushState({}, '', `/@${currentUser.username}`);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors`}
                                    style={activeTab === 'profile' ? {
                                        backgroundColor: currentTheme.background,
                                        color: currentTheme.primary
                                    } : {color: '#6b7280'}}
                                >
                                    <UserIcon className="w-5 h-5"/>
                                    <span className="font-medium">Profile</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative hidden sm:block">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent w-64"
                                    style={{
                                        borderColor: currentTheme.accent,
                                    }}
                                />
                            </div>

                            {/* Mobile Sidebar Toggle - visible only on mobile/tablet */}
                            <button
                                onClick={() => setShowMobileSidebar(true)}
                                className="lg:hidden p-2 rounded-lg transition-colors"
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = currentTheme.id === 'midnight' ? '#3C3C3E' : '#F3F4F6'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                title="Open sidebar"
                            >
                                <Menu className="w-5 h-5" style={{ color: currentTheme.text }} />
                            </button>

                            {isAuthenticated ? (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
                                    title="Logout"
                                    style={{color: currentTheme.text}}
                                >
                                    <LogOut className="w-5 h-5"/>
                                    <span className="hidden md:inline text-sm font-medium">Logout</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white"
                                    style={{backgroundColor: currentTheme.primary}}
                                >
                                    <LogIn className="w-5 h-5"/>
                                    <span>Login</span>
                                </button>
                            )}

                            <button
                                onClick={() => setShowThemeSelector(true)}
                                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                title="Change theme"
                            >
                                <Palette className="w-5 h-5" style={{color: currentTheme.primary}}/>
                            </button>

                            <Avatar user={currentUser} size="sm" theme={currentTheme}/>
                        </div>
                    </div>
                </div>
            </header>

            {showThemeSelector && (
                <ThemeSelector
                    currentTheme={currentTheme}
                    onThemeChange={handleThemeChange}
                    onClose={() => setShowThemeSelector(false)}
                />
            )}

            {showChannelManager && (
                <ChannelManager
                    user={currentUser}
                    channels={channels}
                    theme={currentTheme}
                    onClose={() => setShowChannelManager(false)}
                    onChannelCreated={handleChannelCreated}
                    onChannelUpdated={handleChannelUpdated}
                    onChannelDeleted={handleChannelDeleted}
                />
            )}

            {showLoginModal && (
                <LoginModal
                    theme={currentTheme}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={handleLoginSuccess}
                    showNotification={showNotification}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            {showMobileSidebar && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setShowMobileSidebar(false)}
                    />
                    {/* Sidebar Drawer */}
                    <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 lg:hidden overflow-y-auto shadow-2xl"
                        style={{
                            backgroundColor: currentTheme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF'
                        }}
                    >
                        <div className="p-4">
                            <Sidebar
                                currentUser={currentUser}
                                lastHydration={lastHydration}
                                onHydrate={handleHydration}
                                isHydrating={isHydrating}
                                theme={currentTheme}
                                onClose={() => setShowMobileSidebar(false)}
                            />
                        </div>
                    </div>
                </>
            )}

            {(hydrationMessage || notification) && (
                <div
                    className="fixed top-20 left-1/2 transform -translate-x-1/2 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down"
                    style={{
                        backgroundColor: currentTheme.secondary
                    }}>
                    <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4"/>
                        <span className="font-medium">{hydrationMessage || notification}</span>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'profile' ? (
                            <ProfileScreen
                                user={viewingUserId ? users[viewingUserId] : currentUser}
                                currentUser={currentUser}
                                theme={currentTheme}
                                stories={stories}
                                onLike={handleLike}
                                onDelete={handleDeletePost}
                                onUpdate={handleUpdatePost}
                                onComment={handleComment}
                                onViewProfile={handleViewProfile}
                                onViewStory={handleViewStory}
                                onUserUpdate={handleUserUpdate}
                                hydratedPostIds={hydratedPostIds}
                            />
                        ) : activeTab === 'notifications' ? (
                            <div className="rounded-lg border p-12 text-center" style={{
                                backgroundColor: currentTheme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
                                borderColor: currentTheme.accent
                            }}>
                                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h2 className="text-2xl font-bold mb-2" style={{color: currentTheme.text}}>Notifications</h2>
                                <p className="text-gray-500">You're all caught up! No new notifications.</p>
                            </div>
                        ) : viewingPostId ? (
                            <>
                            {/* Single Post View */}
                            {(() => {
                                const viewPost = stories.find(p => p.id === viewingPostId);
                                if (!viewPost) {
                                    return (
                                        <div className="rounded-lg border p-12 text-center" style={{
                                            backgroundColor: currentTheme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
                                            borderColor: currentTheme.accent
                                        }}>
                                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                            <h2 className="text-2xl font-bold mb-2" style={{color: currentTheme.text}}>Post Not Found</h2>
                                            <p className="text-gray-500">This post may have been deleted.</p>
                                        </div>
                                    );
                                }

                                // If this is a comment, show the parent post first
                                const parentPost = viewPost.parentId ? stories.find(p => p.id === viewPost.parentId) : null;

                                return (
                                    <div className="space-y-6">
                                        {parentPost && (
                                            <div className="transform scale-95 origin-top opacity-75">
                                                <div className="mb-2 text-sm text-gray-500 flex items-center gap-2">
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>Replying to</span>
                                                </div>
                                                <StoryComponent
                                                    key={parentPost.id}
                                                    story={parentPost}
                                                    user={users[parentPost.userId]}
                                                    onLike={handleLike}
                                                    onDelete={handleDeletePost}
                                                    onUpdate={handleUpdatePost}
                                                    onComment={handleComment}
                                                    onViewProfile={handleViewProfile}
                                                    onViewStory={handleViewStory}
                                                    currentUserId={currentUser.id}
                                                    isHydrated={hydratedPostIds.has(parentPost.id)}
                                                    theme={currentTheme}
                                                    allStories={stories}
                                                    expandComments={false}
                                                />
                                            </div>
                                        )}
                                        <StoryComponent
                                            key={viewPost.id}
                                            story={viewPost}
                                            user={users[viewPost.userId]}
                                            onLike={handleLike}
                                            onDelete={handleDeletePost}
                                            onUpdate={handleUpdatePost}
                                            onComment={handleComment}
                                            onViewProfile={handleViewProfile}
                                            onViewStory={handleViewStory}
                                            currentUserId={currentUser.id}
                                            isHydrated={hydratedPostIds.has(viewPost.id)}
                                            theme={currentTheme}
                                            allStories={stories}
                                            expandComments={true}
                                        />
                                    </div>
                                );
                            })()}
                            </>
                        ) : (
                            <>
                            <div className="rounded-lg border p-6" style={{
                                backgroundColor: currentTheme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
                                borderColor: currentTheme.accent
                            }}>
                                <div className="flex gap-3">
                                    <Avatar user={currentUser} theme={currentTheme}/>
                                    <div className="flex-1">
                                        {/* Channel Selector */}
                                        <div className="mb-3 relative">
                                            <button
                                                onClick={() => setShowChannelSelector(!showChannelSelector)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium"
                                                style={{
                                                    borderColor: currentTheme.accent,
                                                    color: currentTheme.text,
                                                    backgroundColor: currentTheme.id === 'midnight' ? '#1C1C1E' : currentTheme.background
                                                }}
                                            >
                                                {selectedChannel ? (
                                                    <>
                                                        {selectedChannel.isPrivate ? (
                                                            <Lock className="w-4 h-4"/>
                                                        ) : (
                                                            <Globe className="w-4 h-4"/>
                                                        )}
                                                        <span>{selectedChannel.name}</span>
                                                    </>
                                                ) : (
                                                    <span>Select channel</span>
                                                )}
                                                <ChevronDown className="w-4 h-4 ml-auto"/>
                                            </button>

                                            {showChannelSelector && (
                                                <div
                                                    className="absolute top-full left-0 mt-1 w-full rounded-lg border shadow-lg z-10 py-1"
                                                    style={{
                                                        backgroundColor: currentTheme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF',
                                                        borderColor: currentTheme.accent
                                                    }}>
                                                    {userChannels.map(channel => (
                                                        <button
                                                            key={channel.id}
                                                            onClick={() => {
                                                                setSelectedChannelId(channel.id);
                                                                setShowChannelSelector(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                            style={{
                                                                color: currentTheme.text,
                                                                backgroundColor: selectedChannelId === channel.id ? currentTheme.background : 'transparent'
                                                            }}
                                                        >
                                                            {channel.isPrivate ? (
                                                                <Lock className="w-4 h-4"/>
                                                            ) : (
                                                                <Globe className="w-4 h-4"/>
                                                            )}
                                                            <span>{channel.name}</span>
                                                            {channel.isPrimary && (
                                                                <span
                                                                    className="ml-auto text-xs text-gray-500">Primary</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                    <div className="border-t my-1"
                                                         style={{borderColor: currentTheme.accent}}></div>
                                                    <button
                                                        onClick={() => {
                                                            setShowChannelSelector(false);
                                                            setShowChannelManager(true);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                                                        style={{color: currentTheme.primary}}
                                                    >
                                                        <Plus className="w-4 h-4 inline mr-2"/>
                                                        Manage Channels
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <textarea
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            placeholder="Share your story..."
                                            rows={3}
                                            maxLength={500}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                                            style={{
                                                borderColor: currentTheme.accent,
                                                backgroundColor: currentTheme.id === 'midnight' ? '#1C1C1E' : '#FFFFFF',
                                                color: currentTheme.text
                                            }}
                                        />

                                        {mediaFiles.length > 0 && (
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                {mediaFiles.map((file) => (
                                                    <div key={file.id}
                                                         className="relative rounded-lg overflow-hidden border"
                                                         style={{borderColor: currentTheme.accent}}>
                                                        <button
                                                            onClick={() => handleRemoveMedia(file.id)}
                                                            className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-opacity"
                                                        >
                                                            <XCircle className="w-4 h-4"/>
                                                        </button>
                                                        {file.type === 'image' ? (
                                                            <img src={file.url} alt="Upload preview"
                                                                 className="w-full h-32 object-cover"/>
                                                        ) : (
                                                            <video src={file.url} className="w-full h-32 object-cover"/>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mt-3">
                                            <div className="flex items-center gap-2">
                                                <label
                                                    className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                                    onMouseOver={(e) => currentTheme.id === 'midnight' && (e.currentTarget.style.backgroundColor = '#3C3C3E')}
                                                    onMouseOut={(e) => currentTheme.id === 'midnight' && (e.currentTarget.style.backgroundColor = 'transparent')}
                                                >
                                                    <input
                                                        type="file"
                                                        accept="image/*,video/*"
                                                        multiple
                                                        onChange={handleMediaUpload}
                                                        className="hidden"
                                                        disabled={mediaFiles.length >= 4 || isUploadingMedia}
                                                    />
                                                    <Camera className="w-5 h-5" style={{color: currentTheme.primary}}/>
                                                </label>
                                                <span className="text-xs text-gray-500">
                                                    {newPostContent.length}/500
                                                    {mediaFiles.length > 0 && ` • ${mediaFiles.length}/4 media`}
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleCreatePost}
                                                disabled={isPosting || (!newPostContent.trim() && mediaFiles.length === 0) || isUploadingMedia}
                                                className="px-6 py-2 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                style={{backgroundColor: (isPosting || (!newPostContent.trim() && mediaFiles.length === 0) || isUploadingMedia) ? undefined : currentTheme.primary}}
                                            >
                                                {isPosting ? 'Posting...' : isUploadingMedia ? 'Uploading...' : 'Post'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {stories.filter(p => !p.parentId).map(post => (
                                <StoryComponent
                                    key={post.id}
                                    story={post}
                                    user={users[post.userId]}
                                    onLike={handleLike}
                                    onDelete={handleDeletePost}
                                    onUpdate={handleUpdatePost}
                                    onComment={handleComment}
                                    onViewProfile={handleViewProfile}
                                    onViewStory={handleViewStory}
                                    currentUserId={currentUser.id}
                                    isHydrated={hydratedPostIds.has(post.id)}
                                    theme={currentTheme}
                                    allStories={stories}
                                />
                            ))}
                            </>
                        )}
                    </div>

                    <div className="hidden lg:block">
                        <Sidebar
                            currentUser={currentUser}
                            lastHydration={lastHydration}
                            onHydrate={handleHydration}
                            isHydrating={isHydrating}
                            theme={currentTheme}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;