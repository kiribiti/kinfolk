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
    MessageCircle
} from 'lucide-react';

// Import types
import {Theme, themes, Post, MediaFile, Channel, User, TabType} from './types';

// Import data and utilities
import {
    mockUsers,
    channelsDB,
    postsDB,
    initializeDB,
    ActivitySimulator,
    MockServer,
} from './data/mockData';

// Import API
import {ApiService as api} from './api';

// Import components
import {Avatar} from './components/Avatar';
import {ThemeSelector} from './components/ThemeSelector';
import {Sidebar} from './components/Sidebar';
import {PostComponent} from './components/PostComponent';
import {ChannelManager} from './components/ChannelManager';
import {ProfileScreen} from './components/ProfileScreen';

// ============================================
// MAIN APP
// ============================================

const App: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
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
    const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
    const [showChannelManager, setShowChannelManager] = useState(false);
    const [showChannelSelector, setShowChannelSelector] = useState(false);

    // Initialize database and load posts
    useEffect(() => {
        initializeDB();
        setChannels([...channelsDB]);
        loadPosts();

        // Set default channel for current user
        const userDefaultChannel = channelsDB.find(
            c => c.userId === currentUser.id && c.isPrimary
        );
        if (userDefaultChannel) {
            setSelectedChannelId(userDefaultChannel.id);
        }
    }, []);

    const loadPosts = async () => {
        const response = await api.getPosts();
        if (response.success && response.data) {
            setPosts(response.data);
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
            const response = await api.createPost(
                currentUser.id,
                newPostContent,
                mediaFiles,
                selectedChannelId
            );
            if (response.success && response.data) {
                setPosts(prev => [{...response.data!, isNew: true}, ...prev]);
                setNewPostContent('');
                setMediaFiles([]);

                // Update channel post count
                setChannels(prev => prev.map(c =>
                    c.id === selectedChannelId
                        ? {...c, postCount: c.postCount + 1}
                        : c
                ));

                showNotification('Post created successfully! 🎉');
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

    const handleChannelCreated = (channel: Channel) => {
        channelsDB.push(channel);
        setChannels([...channelsDB]);
        showNotification(`Channel "${channel.name}" created! ✨`);
    };

    const handleChannelUpdated = (updated: Channel) => {
        const index = channelsDB.findIndex(c => c.id === updated.id);
        if (index !== -1) {
            channelsDB[index] = updated;
            setChannels([...channelsDB]);
            showNotification(`Channel "${updated.name}" updated! ✏️`);
        }
    };

    const handleChannelDeleted = (channelId: number) => {
        // Update channels DB in place
        const channelIndex = channelsDB.findIndex(c => c.id === channelId);
        if (channelIndex !== -1) {
            channelsDB.splice(channelIndex, 1);
        }
        setChannels([...channelsDB]);

        // Delete posts from this channel
        const postsToKeep = postsDB.filter(p => p.channelId !== channelId);
        postsDB.length = 0;
        postsDB.push(...postsToKeep);
        setPosts([...postsDB]);

        showNotification('Channel deleted! 🗑️');
    };

    const selectedChannel = channels.find(c => c.id === selectedChannelId);
    const userChannels = channels.filter(c => c.userId === currentUser.id);

    const handleUpdatePost = async (postId: number, content: string) => {
        try {
            const response = await api.updatePost(postId, content);
            if (response.success && response.data) {
                setPosts(prev => prev.map(p => p.id === postId ? response.data! : p));
                showNotification('Post updated successfully! ✏️');
            } else {
                showNotification(response.error || 'Failed to update post');
            }
        } catch (error) {
            showNotification('Failed to update post');
        }
    };

    const handleDeletePost = async (postId: number) => {
        try {
            const response = await api.deletePost(postId, currentUser.id);
            if (response.success) {
                setPosts(prev => prev.filter(p => p.id !== postId));
                showNotification('Post deleted successfully! 🗑️');
            } else {
                showNotification(response.error || 'Failed to delete post');
            }
        } catch (error) {
            showNotification('Failed to delete post');
        }
    };

    const handleLike = async (postId: number) => {
        // Optimistic update
        setPosts(prev =>
            prev.map(post => {
                if (post.id === postId) {
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
            await api.toggleLike(postId, currentUser.id);
        } catch (error) {
            // Revert on error
            loadPosts();
        }
    };

    const handleComment = async (parentId: number, content: string) => {
        try {
            const parentPost = posts.find(p => p.id === parentId);
            if (!parentPost) return;

            const response = await api.createPost(
                currentUser.id,
                content,
                undefined,
                parentPost.channelId,
                parentId
            );

            if (response.success && response.data) {
                setPosts(prev => [{...response.data!, isNew: true}, ...prev]);
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

    const handleViewProfile = (userId: number) => {
        setViewingUserId(userId);
        setViewingPostId(null); // Reset post view
        setActiveTab('profile');
        // Update URL without navigation
        window.history.pushState({}, '', `/@${users[userId]?.username || userId}`);
    };

    const handleViewPost = (postId: number) => {
        setViewingPostId(postId);
        setViewingUserId(null); // Reset profile view
        setActiveTab('home');
        // Update URL without navigation
        window.history.pushState({}, '', `/story/${postId}`);
    };

    useEffect(() => {
        const simulator = new ActivitySimulator(({action, postId, userId}) => {
            if (userId === currentUser.id && action !== 'comment') return;

            setPosts(prevPosts =>
                prevPosts.map(post => {
                    if (post.id === postId) {
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
            const payload = await server.fetchHydration(posts);

            const updatedIds = new Set(payload.updates.map(u => u.id));
            const newIds = new Set(payload.newPosts.map(p => p.id));
            setHydratedPostIds(new Set([...updatedIds, ...newIds]));

            setPosts(prevPosts => {
                let updatedPosts = prevPosts.map(post => {
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

                if (payload.newPosts.length > 0) {
                    updatedPosts = [...payload.newPosts, ...updatedPosts];
                }

                return updatedPosts;
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
    }, [posts, server]);

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
                                        setViewingPostId(null); // Reset to show all posts
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
                    onThemeChange={setCurrentTheme}
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
                                posts={posts}
                                onLike={handleLike}
                                onDelete={handleDeletePost}
                                onUpdate={handleUpdatePost}
                                onComment={handleComment}
                                onViewProfile={handleViewProfile}
                                onViewPost={handleViewPost}
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
                                const viewPost = posts.find(p => p.id === viewingPostId);
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
                                const parentPost = viewPost.parentId ? posts.find(p => p.id === viewPost.parentId) : null;

                                return (
                                    <div className="space-y-6">
                                        {parentPost && (
                                            <div className="transform scale-95 origin-top opacity-75">
                                                <div className="mb-2 text-sm text-gray-500 flex items-center gap-2">
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>Replying to</span>
                                                </div>
                                                <PostComponent
                                                    key={parentPost.id}
                                                    post={parentPost}
                                                    user={users[parentPost.userId]}
                                                    onLike={handleLike}
                                                    onDelete={handleDeletePost}
                                                    onUpdate={handleUpdatePost}
                                                    onComment={handleComment}
                                                    onViewProfile={handleViewProfile}
                                                    onViewPost={handleViewPost}
                                                    currentUserId={currentUser.id}
                                                    isHydrated={hydratedPostIds.has(parentPost.id)}
                                                    theme={currentTheme}
                                                    allPosts={posts}
                                                    expandComments={false}
                                                />
                                            </div>
                                        )}
                                        <PostComponent
                                            key={viewPost.id}
                                            post={viewPost}
                                            user={users[viewPost.userId]}
                                            onLike={handleLike}
                                            onDelete={handleDeletePost}
                                            onUpdate={handleUpdatePost}
                                            onComment={handleComment}
                                            onViewProfile={handleViewProfile}
                                            onViewPost={handleViewPost}
                                            currentUserId={currentUser.id}
                                            isHydrated={hydratedPostIds.has(viewPost.id)}
                                            theme={currentTheme}
                                            allPosts={posts}
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

                            {posts.filter(p => !p.parentId).map(post => (
                                <PostComponent
                                    key={post.id}
                                    post={post}
                                    user={users[post.userId]}
                                    onLike={handleLike}
                                    onDelete={handleDeletePost}
                                    onUpdate={handleUpdatePost}
                                    onComment={handleComment}
                                    onViewProfile={handleViewProfile}
                                    onViewPost={handleViewPost}
                                    currentUserId={currentUser.id}
                                    isHydrated={hydratedPostIds.has(post.id)}
                                    theme={currentTheme}
                                    allPosts={posts}
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