import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  User,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem('authToken') || localStorage.getItem('token');

      const response = await fetch(`${apiBaseUrl}/api/user/getUserProfile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setProfileData(result.data);
        setEditFormData(result.data);
        setError(null);
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const token =
        localStorage.getItem('authToken') || localStorage.getItem('token');

      const response = await fetch(`${apiBaseUrl}/api/user/updateProfile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          phone: editFormData.phone,
          gender: editFormData.gender,
          dob: editFormData.dob,
          bio: editFormData.bio,
          location: editFormData.location,
          timezone: editFormData.timezone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      if (result.success) {
        setProfileData(editFormData);
        setIsEditing(false);
        setError(null);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.bg.primary }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-transparent animate-spin mx-auto mb-4"
            style={{
              borderTopColor: colors.accent.blue,
              borderRightColor: colors.accent.purple,
            }}
          ></div>
          <p style={{ color: colors.text.secondary }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.bg.primary }}
      >
        <div
          className="rounded-xl p-8 max-w-md w-full"
          style={{
            backgroundColor: colors.bg.secondary,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: colors.text.primary }}
          >
            Error
          </h2>
          <p style={{ color: colors.text.secondary }} className="mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/superadmin/dashboard')}
            className="w-full px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.accent.blue,
              color: 'white',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div
      className="w-full min-h-screen"
      style={{ backgroundColor: colors.bg.primary }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 px-6 lg:px-8 pt-2">
        <button
          onClick={() => navigate('/superadmin/dashboard')}
          className="p-2 rounded-lg transition-all duration-300 hover:scale-110 flex-shrink-0"
          style={{
            backgroundColor: colors.bg.secondary,
            color: colors.text.secondary,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.backgroundColor = colors.bg.hover)
          }
          onMouseLeave={e =>
            (e.currentTarget.style.backgroundColor = colors.bg.secondary)
          }
        >
          <ArrowLeft size={20} />
        </button>
        {/* <div className="flex-1">
          <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
            My Profile
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
            Manage and update your account information
          </p>
        </div> */}
      </div>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg border backdrop-blur-sm mx-6 lg:mx-8 text-sm"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#EF4444',
            color: '#EF4444',
          }}
        >
          {error}
        </div>
      )}

      <div className="pb-8 px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 w-full">
          {/* Spacer for sidebar */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Profile Card - Sidebar */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 h-fit"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
              boxShadow:
                theme === 'dark'
                  ? '0 12px 40px rgba(0,0,0,0.25)'
                  : '0 8px 24px rgba(0,0,0,0.1)',
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg"
                style={{
                  background:
                    'linear-gradient(135deg, #FF7A3D 0%, #A065F4 100%)',
                  boxShadow: '0 8px 24px rgba(255, 122, 61, 0.3)',
                }}
              >
                {profileData.first_name?.[0]?.toUpperCase()}
                {profileData.last_name?.[0]?.toUpperCase()}
              </div>
              <h2
                className="text-xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {profileData.first_name} {profileData.last_name}
              </h2>
              <div
                className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(160, 101, 244, 0.15)',
                  color: '#A065F4',
                }}
              >
                {profileData.user_roles?.[0]?.role
                  ?.replace('_', ' ')
                  .toUpperCase() || 'User'}
              </div>
              <div
                className="mt-4 w-full p-3 rounded-lg"
                style={{
                  backgroundColor: colors.bg.primary,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <p className="text-xs" style={{ color: colors.text.muted }}>
                  MEMBER SINCE
                </p>
                <p
                  className="text-xs font-semibold mt-1"
                  style={{ color: colors.text.primary }}
                >
                  {formatDate(profileData.created_at)}
                </p>
              </div>
              {profileData.last_login && (
                <div
                  className="mt-2 w-full p-3 rounded-lg"
                  style={{
                    backgroundColor: colors.bg.primary,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <p className="text-xs" style={{ color: colors.text.muted }}>
                    LAST LOGIN
                  </p>
                  <p
                    className="text-xs font-semibold mt-1"
                    style={{ color: colors.text.primary }}
                  >
                    {formatDate(profileData.last_login)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details Card - Main Content */}
          <div className="lg:col-span-7 col-span-1">
            <div
              className="rounded-2xl p-8"
              style={{
                backgroundColor: colors.bg.secondary,
                border: `1px solid ${colors.border}`,
                boxShadow:
                  theme === 'dark'
                    ? '0 12px 40px rgba(0,0,0,0.25)'
                    : '0 8px 24px rgba(0,0,0,0.1)',
              }}
            >
              <div
                className="flex items-center justify-between mb-8 pb-6"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    Account Information
                  </h3>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    {isEditing
                      ? 'Update your personal details'
                      : 'View your account details'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (isEditing) {
                      setEditFormData(profileData);
                    }
                    setIsEditing(!isEditing);
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: isEditing
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(160, 101, 244, 0.15)',
                    color: isEditing ? '#EF4444' : '#A065F4',
                    border: isEditing
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid rgba(160, 101, 244, 0.3)',
                  }}
                >
                  {isEditing ? (
                    <>
                      <X size={16} />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 size={16} />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              {/* Contact Information */}
              <div className="mb-10">
                <h4
                  className="text-xs font-bold mb-5 uppercase tracking-wider"
                  style={{ color: colors.text.muted }}
                >
                  📧 Contact Information
                </h4>
                <div className="space-y-4">
                  {/* Email */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.bg.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Mail
                        size={18}
                        style={{
                          color: colors.accent.blue,
                          marginTop: '0.25rem',
                          flexShrink: 0,
                        }}
                      />
                      <div className="flex-1">
                        <p
                          className="text-xs font-semibold"
                          style={{ color: colors.text.muted }}
                        >
                          EMAIL ADDRESS
                        </p>
                        <p
                          className="font-medium mt-1"
                          style={{ color: colors.text.primary }}
                        >
                          {profileData.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.bg.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Phone
                        size={18}
                        style={{
                          color: colors.accent.blue,
                          marginTop: '0.25rem',
                          flexShrink: 0,
                        }}
                      />
                      <div className="flex-1">
                        <p
                          className="text-xs font-semibold"
                          style={{ color: colors.text.muted }}
                        >
                          PHONE NUMBER
                        </p>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editFormData.phone || ''}
                            onChange={e =>
                              handleEditChange('phone', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg border mt-2 outline-none transition-colors font-medium"
                            style={{
                              backgroundColor: colors.bg.secondary,
                              borderColor: colors.border,
                              color: colors.text.primary,
                            }}
                            onFocus={e =>
                              (e.currentTarget.style.borderColor =
                                colors.accent.blue)
                            }
                            onBlur={e =>
                              (e.currentTarget.style.borderColor =
                                colors.border)
                            }
                          />
                        ) : (
                          <p
                            className="font-medium mt-1"
                            style={{ color: colors.text.primary }}
                          >
                            {profileData.phone || 'Not provided'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="mb-10">
                <h4
                  className="text-xs font-bold mb-5 uppercase tracking-wider"
                  style={{ color: colors.text.muted }}
                >
                  👤 Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.bg.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <label
                      className="text-xs font-semibold"
                      style={{ color: colors.text.muted }}
                    >
                      FIRST NAME
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.first_name || ''}
                        onChange={e =>
                          handleEditChange('first_name', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border mt-2 outline-none transition-colors font-medium"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          borderColor: colors.border,
                          color: colors.text.primary,
                        }}
                        onFocus={e =>
                          (e.currentTarget.style.borderColor =
                            colors.accent.blue)
                        }
                        onBlur={e =>
                          (e.currentTarget.style.borderColor = colors.border)
                        }
                      />
                    ) : (
                      <p
                        className="font-medium mt-2"
                        style={{ color: colors.text.primary }}
                      >
                        {profileData.first_name}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.bg.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <label
                      className="text-xs font-semibold"
                      style={{ color: colors.text.muted }}
                    >
                      LAST NAME
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.last_name || ''}
                        onChange={e =>
                          handleEditChange('last_name', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border mt-2 outline-none transition-colors font-medium"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          borderColor: colors.border,
                          color: colors.text.primary,
                        }}
                        onFocus={e =>
                          (e.currentTarget.style.borderColor =
                            colors.accent.blue)
                        }
                        onBlur={e =>
                          (e.currentTarget.style.borderColor = colors.border)
                        }
                      />
                    ) : (
                      <p
                        className="font-medium mt-2"
                        style={{ color: colors.text.primary }}
                      >
                        {profileData.last_name}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.bg.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <label
                      className="text-xs font-semibold"
                      style={{ color: colors.text.muted }}
                    >
                      GENDER
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.gender || ''}
                        onChange={e =>
                          handleEditChange('gender', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border mt-2 outline-none transition-colors font-medium"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          borderColor: colors.border,
                          color: colors.text.primary,
                        }}
                        onFocus={e =>
                          (e.currentTarget.style.borderColor =
                            colors.accent.blue)
                        }
                        onBlur={e =>
                          (e.currentTarget.style.borderColor = colors.border)
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p
                        className="font-medium mt-2"
                        style={{ color: colors.text.primary }}
                      >
                        {profileData.gender
                          ? profileData.gender.charAt(0).toUpperCase() +
                            profileData.gender.slice(1)
                          : 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.bg.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <label
                      className="text-xs font-semibold"
                      style={{ color: colors.text.muted }}
                    >
                      DATE OF BIRTH
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={
                          editFormData.dob ? editFormData.dob.split('T')[0] : ''
                        }
                        onChange={e => handleEditChange('dob', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border mt-2 outline-none transition-colors font-medium"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          borderColor: colors.border,
                          color: colors.text.primary,
                        }}
                        onFocus={e =>
                          (e.currentTarget.style.borderColor =
                            colors.accent.blue)
                        }
                        onBlur={e =>
                          (e.currentTarget.style.borderColor = colors.border)
                        }
                      />
                    ) : (
                      <p
                        className="font-medium mt-2"
                        style={{ color: colors.text.primary }}
                      >
                        {formatDate(profileData.dob)}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.bg.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <label
                      className="text-xs font-semibold"
                      style={{ color: colors.text.muted }}
                    >
                      LOCATION
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.location || ''}
                        onChange={e =>
                          handleEditChange('location', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border mt-2 outline-none transition-colors font-medium"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          borderColor: colors.border,
                          color: colors.text.primary,
                        }}
                        onFocus={e =>
                          (e.currentTarget.style.borderColor =
                            colors.accent.blue)
                        }
                        onBlur={e =>
                          (e.currentTarget.style.borderColor = colors.border)
                        }
                      />
                    ) : (
                      <p
                        className="font-medium mt-2"
                        style={{ color: colors.text.primary }}
                      >
                        {profileData.location || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Timezone */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.bg.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <label
                      className="text-xs font-semibold"
                      style={{ color: colors.text.muted }}
                    >
                      TIMEZONE
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.timezone || ''}
                        onChange={e =>
                          handleEditChange('timezone', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border mt-2 outline-none transition-colors font-medium"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          borderColor: colors.border,
                          color: colors.text.primary,
                        }}
                        onFocus={e =>
                          (e.currentTarget.style.borderColor =
                            colors.accent.blue)
                        }
                        onBlur={e =>
                          (e.currentTarget.style.borderColor = colors.border)
                        }
                      />
                    ) : (
                      <p
                        className="font-medium mt-2"
                        style={{ color: colors.text.primary }}
                      >
                        {profileData.timezone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio - Full Width */}
                <div
                  className="p-4 rounded-xl mt-4"
                  style={{
                    backgroundColor: colors.bg.primary,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <label
                    className="text-xs font-semibold"
                    style={{ color: colors.text.muted }}
                  >
                    BIO
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editFormData.bio || ''}
                      onChange={e => handleEditChange('bio', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border mt-2 outline-none transition-colors resize-none font-medium"
                      rows="3"
                      style={{
                        backgroundColor: colors.bg.secondary,
                        borderColor: colors.border,
                        color: colors.text.primary,
                      }}
                      onFocus={e =>
                        (e.currentTarget.style.borderColor = colors.accent.blue)
                      }
                      onBlur={e =>
                        (e.currentTarget.style.borderColor = colors.border)
                      }
                    />
                  ) : (
                    <p
                      className="font-medium mt-2"
                      style={{ color: colors.text.primary }}
                    >
                      {profileData.bio || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Organization Information */}
              {profileData.organizations && (
                <div className="mb-10">
                  <h4
                    className="text-xs font-bold mb-5 uppercase tracking-wider"
                    style={{ color: colors.text.muted }}
                  >
                    🏢 Organization
                  </h4>
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.bg.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Building
                        size={18}
                        style={{
                          color: colors.accent.blue,
                          marginTop: '0.25rem',
                          flexShrink: 0,
                        }}
                      />
                      <div className="flex-1">
                        <p
                          className="text-xs font-semibold"
                          style={{ color: colors.text.muted }}
                        >
                          ORGANIZATION NAME
                        </p>
                        <p
                          className="font-medium mt-1"
                          style={{ color: colors.text.primary }}
                        >
                          {profileData.organizations.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {isEditing && (
                <div
                  className="flex gap-3 pt-8 border-t"
                  style={{ borderColor: colors.border }}
                >
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    style={{
                      background:
                        'linear-gradient(135deg, #FF7A3D 0%, #A065F4 100%)',
                      color: 'white',
                      boxShadow: '0 4px 15px rgba(255, 122, 61, 0.3)',
                    }}
                  >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
