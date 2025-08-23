import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Post from './Post';
import Notifications from './Notifications';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [profileTab, setProfileTab] = useState('posts');
  const [userPostsCount, setUserPostsCount] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/api/auth/me', {
          withCredentials: true
        });

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUnreadNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications/unread', {
          withCredentials: true
        });

        if (response.data.success) {
          setUnreadNotifications(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUserProfile();
    fetchUnreadNotifications();
  }, []);

  useEffect(() => {
    if (user?.following) {
      fetchFollowingUsers();
    }
  }, [user?.following]);

  // Fetch user posts count when user loads
  useEffect(() => {
    const fetchUserPostsCount = async () => {
      if (user?.username) {
        try {
          const results = await axios.get(`http://localhost:5000/api/user/${user.username}`, {
            withCredentials: true
          });

          if (results.data && results.data.posts) {
            setUserPostsCount(results.data.posts.length);
          }
        } catch (error) {
          console.error('Error fetching user posts count:', error);
          setUserPostsCount(0);
        }
      }
    };

    fetchUserPostsCount();
  }, [user?.username]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handlePostCreated = () => {
    console.log('Post created successfully');
    // Update post count when a new post is created
    setUserPostsCount(prev => prev + 1);
  };

  const handlePostDeleted = () => {
    console.log('Post deleted successfully');
    // Update post count when a post is deleted
    setUserPostsCount(prev => Math.max(0, prev - 1));
  };

  const handleFollowUpdate = async (userId, isFollowing) => {
    if (!user) return;

    try {
      const response = await axios.post(`/api/user/follow/${userId}`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        setUser(prevUser => {
          if (!prevUser) return prevUser;

          if (isFollowing) {
            return {
              ...prevUser,
              following: [...(prevUser.following || []), userId]
            };
          } else {
            return {
              ...prevUser,
              following: (prevUser.following || []).filter(id => id !== userId)
            };
          }
        });

        if (isFollowing) {
          setFollowingUsers(prev => {
            const userExists = prev.find(u => u._id === userId);
            if (!userExists) {
              fetchFollowingUsers();
            }
            return prev;
          });
        } else {
          setFollowingUsers(prev => prev.filter(u => u._id !== userId));
        }
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      alert('Failed to update follow status. Please try again.');
    }
  };

  const fetchFollowingUsers = async () => {
    if (!user?.following || user.following.length === 0) {
      setFollowingUsers([]);
      return;
    }

    try {
      const response = await axios.get('/api/user/users', {
        withCredentials: true
      });

      if (response.data.success) {
        const followingUserDetails = response.data.users.filter(userDetail =>
          user.following.includes(userDetail._id)
        );
        setFollowingUsers(followingUserDetails);
      }
    } catch (error) {
      console.error('Error fetching following users:', error);
    }
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfileImage = async () => {
    if (!profileImage) {
      alert('Please select an image first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', profileImage);

      const response = await axios.put('/api/user/profile-picture', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          profileImg: response.data.profilePicture
        }));
        setProfileImage(null);
        setImagePreview(null);
        const fileInput = document.getElementById('profile-image-upload');
        if (fileInput) fileInput.value = '';
        alert('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Error updating profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('profile-image-upload');
    if (fileInput) fileInput.value = '';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const renderRightSidebar = () => (
    <div className="right-sidebar">
      <div className="sidebar-widget">
        <div className="widget-header">
          <h3>What's happening</h3>
        </div>
        <div className="widget-content">
          <div className="trending-item">
            <p className="trending-category">Trending in Technology</p>
            <h4 className="trending-topic">React Development</h4>
            <p className="trending-posts">15.2K posts</p>
          </div>
          <div className="trending-item">
            <p className="trending-category">Trending</p>
            <h4 className="trending-topic">Web Development</h4>
            <p className="trending-posts">8,547 posts</p>
          </div>
          <div className="trending-item">
            <p className="trending-category">Technology • Trending</p>
            <h4 className="trending-topic">JavaScript</h4>
            <p className="trending-posts">25.1K posts</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadNotifications={unreadNotifications}
      />

      <div className="main-content">
        <div className="content-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        </div>

        <div className="content-body">
          {activeTab === 'home' && (
            <div className="home-content">
              <Post
                user={user}
                onPostCreated={handlePostCreated}
                onPostDeleted={handlePostDeleted}
                onFollowUpdate={handleFollowUpdate}
              />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-content">
              <div className="profile-header">
                <div className="profile-banner"></div>
                <div className="profile-avatar">
                  <img
                    src={user?.profileImg || 'https://via.placeholder.com/140'}
                    alt="Profile"
                  />
                  <div className="avatar-upload-overlay">
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="file-input"
                    />
                    <label htmlFor="profile-image-upload" className="avatar-upload-btn">
                      <svg viewBox="0 0 24 24" className="camera-icon">
                        <path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zM6 10V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/>
                      </svg>
                    </label>
                  </div>
                </div>
                <div className="profile-info">
                  <h2>{user?.fullName}</h2>
                  <p className="username">@{user?.username}</p>
                  <p className="email">{user?.email}</p>
                  <div className="profile-bio">
                    Welcome to my profile! I love sharing thoughts and connecting with amazing people.
                  </div>
                  <div className="profile-metadata">
                    <div className="metadata-item">
                      <svg viewBox="0 0 24 24" className="metadata-icon">
                        <path d="M7 4V2C7 1.45 7.45 1 8 1s1 .45 1 1v2h6V2c0-.55.45-1 1-1s1 .45 1 1v2h1c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h1zM6 8v10h12V8H6z"/>
                      </svg>
                      <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {imagePreview && (
                <div className="profile-upload-section">
                  <div className="upload-preview-card">
                    <h3>Update Profile Picture</h3>
                    <div className="preview-container">
                      <img src={imagePreview} alt="Preview" className="preview-image" />
                    </div>
                    <div className="upload-actions">
                      <button
                        className="update-profile-btn"
                        onClick={handleUpdateProfileImage}
                        disabled={uploading}
                      >
                        {uploading ? 'Updating...' : 'Save'}
                      </button>
                      <button className="cancel-btn" onClick={removeProfileImage}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{user?.following?.length || 0}</span>
                  <span className="stat-label">Following</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user?.followers?.length || 0}</span>
                  <span className="stat-label">Followers</span>
                </div>
              </div>

              {/* <div className="profile-tabs">
                <button
                  className={`profile-tab ${profileTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setProfileTab('posts')}
                >
                  Posts
                </button>
              </div> */}

              {/* {profileTab === 'posts' && (
                <div>
                  <Post
                    user={user}
                    onPostCreated={handlePostCreated}
                    onPostDeleted={handlePostDeleted}
                    onFollowUpdate={handleFollowUpdate}
                    showOnlyUserPosts={true}
                    profileUserId={user?._id}
                    hideCreatePost={true}
                  />
                </div>
              )} */}

              {profileTab === 'likes' && (
                <div className="no-posts">
                  <p>Liked posts will appear here.</p>
                </div>
              )}

              {followingUsers.length > 0 && profileTab === 'posts' && (
                <div className="following-section">
                  <h3>Following</h3>
                  <div className="following-list">
                    {followingUsers.map((followedUser) => (
                      <div key={followedUser._id} className="following-item">
                        <img
                          src={followedUser.profileImg || 'https://via.placeholder.com/40'}
                          alt="Profile"
                          className="following-avatar"
                        />
                        <div className="following-info">
                          <span className="following-name">{followedUser.fullName}</span>
                          <span className="following-username">@{followedUser.username}</span>
                        </div>
                        <button className="unfollow-btn">Following</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-content">
              <Notifications />
            </div>
          )}

          {activeTab === 'explore' && (
            <div className="home-content">
              <div className="welcome-card">
                <h2>Explore</h2>
                <p>Discover what's happening around the world.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {renderRightSidebar()}
    </div>
  );
};
export default Dashboard;
