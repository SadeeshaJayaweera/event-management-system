import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Globe, Bell, Shield, Calendar, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { profileApi, type UserProfile } from '../services/eventflow';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profileData = await profileApi.getProfile(user.id);
      setProfile(profileData);
    } catch (error: any) {
      // Profile doesn't exist yet
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        try {
          const newProfile = await profileApi.createProfile(user.id);
          setProfile(newProfile);
        } catch (createError) {
          console.error('Failed to create profile:', createError);
          toast.error('Failed to initialize profile');
        }
      } else {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatarUrl) {
      return profile.avatarUrl;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">View and manage your profile information</p>
        </div>
        <button
          onClick={() => {
            const settingsPath = user?.role === 'attendee' ? '/attendee/settings' : '/dashboard/settings';
            navigate(settingsPath);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-white/30 shadow-xl">
            {getAvatarUrl() ? (
              <img src={getAvatarUrl()!} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{user?.name}</h2>
            <div className="flex items-center space-x-4 text-indigo-100">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium capitalize backdrop-blur-sm">
                {user?.role}
              </span>
              {profile?.createdAt && (
                <span className="flex items-center space-x-1 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </span>
              )}
            </div>
            {profile?.bio && (
              <p className="mt-4 text-indigo-50 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-600" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.id ? `user-${user.id.slice(0, 8)}@eventflow.com` : 'Not available'}
                  </p>
                </div>
              </div>

              {profile?.phoneNumber && (
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900">{profile.phoneNumber}</p>
                  </div>
                </div>
              )}

              {(profile?.address || profile?.city || profile?.country) && (
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {[profile?.address, profile?.city, profile?.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {!profile?.phoneNumber && !profile?.address && !profile?.city && !profile?.country && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">No additional contact information provided</p>
                  <button
                    onClick={() => navigate('/dashboard/settings')}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Add contact information
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          {profile?.preferences && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-indigo-600" />
                Preferences
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Language</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {profile.preferences.language === 'en' ? 'English' : profile.preferences.language}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Timezone</p>
                  <p className="text-sm font-medium text-gray-900">{profile.preferences.timezone}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Date Format</p>
                  <p className="text-sm font-medium text-gray-900">{profile.preferences.dateFormat}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Time Format</p>
                  <p className="text-sm font-medium text-gray-900">{profile.preferences.timeFormat}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3">Notification Settings</p>
                <div className="flex flex-wrap gap-2">
                  {profile.preferences.emailNotifications && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      Email ✓
                    </span>
                  )}
                  {profile.preferences.smsNotifications && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      SMS ✓
                    </span>
                  )}
                  {profile.preferences.pushNotifications && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      Push ✓
                    </span>
                  )}
                  {profile.preferences.eventReminders && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      Reminders ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Emergency Contact & Stats */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          {profile?.emergencyContact ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-indigo-600" />
                Emergency Contact
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="text-sm font-medium text-gray-900">{profile.emergencyContact.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Relationship</p>
                  <p className="text-sm font-medium text-gray-900">{profile.emergencyContact.relationship}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{profile.emergencyContact.phoneNumber}</p>
                </div>
                {profile.emergencyContact.email && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {profile.emergencyContact.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h3 className="text-lg font-bold text-amber-900 mb-2 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Emergency Contact
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                {user?.role === 'attendee' 
                  ? 'Add emergency contact information for event safety.'
                  : 'Consider adding emergency contact information.'}
              </p>
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Add Emergency Contact
              </button>
            </div>
          )}

          {/* Account Stats */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Account Type</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{user?.role}</span>
              </div>
              {profile?.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              )}
              {profile?.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(profile.updatedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
