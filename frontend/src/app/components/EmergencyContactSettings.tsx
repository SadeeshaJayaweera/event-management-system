import { useState, useEffect } from 'react';
import { Shield, Save, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { profileApi, type EmergencyContactRequest, type EmergencyContact } from '../services/eventflow';
import { LoadingSpinner } from './LoadingSpinner';

export function EmergencyContactSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasContact, setHasContact] = useState(false);
  const [formData, setFormData] = useState<EmergencyContactRequest>({
    fullName: '',
    relationship: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      loadEmergencyContact();
    }
  }, [user?.id]);

  const loadEmergencyContact = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const contact: EmergencyContact = await profileApi.getEmergencyContact(user.id);
      setHasContact(true);
      setFormData({
        fullName: contact.fullName,
        relationship: contact.relationship,
        phoneNumber: contact.phoneNumber,
        alternatePhoneNumber: contact.alternatePhoneNumber || '',
        email: contact.email || '',
        address: contact.address || '',
      });
    } catch (error: any) {
      // No emergency contact exists yet
      setHasContact(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate required fields
    if (!formData.fullName || !formData.relationship || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await profileApi.updateEmergencyContact(user.id, formData);
      setHasContact(true);
      toast.success('Emergency contact saved successfully!');
    } catch (error) {
      console.error('Failed to update emergency contact:', error);
      toast.error('Failed to save emergency contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (!confirm('Are you sure you want to remove your emergency contact?')) {
      return;
    }

    try {
      setSaving(true);
      await profileApi.deleteEmergencyContact(user.id);
      setHasContact(false);
      setFormData({
        fullName: '',
        relationship: '',
        phoneNumber: '',
        alternatePhoneNumber: '',
        email: '',
        address: '',
      });
      toast.success('Emergency contact removed');
    } catch (error) {
      console.error('Failed to delete emergency contact:', error);
      toast.error('Failed to remove emergency contact');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    toast.info('You can add emergency contact information anytime');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-gray-400" />
            Emergency Contact
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {user?.role === 'attendee' 
              ? 'Add emergency contact information for event safety (recommended for attendees)'
              : 'Add emergency contact information (optional)'}
          </p>
        </div>
        {hasContact && (
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Required Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select relationship</option>
              <option value="Parent">Parent</option>
              <option value="Spouse">Spouse</option>
              <option value="Sibling">Sibling</option>
              <option value="Child">Child</option>
              <option value="Friend">Friend</option>
              <option value="Partner">Partner</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1 (234) 567-8900"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alternate Phone
            </label>
            <input
              type="tel"
              value={formData.alternatePhoneNumber}
              onChange={(e) => setFormData({ ...formData, alternatePhoneNumber: e.target.value })}
              placeholder="+1 (234) 567-8901"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="emergency@example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, State"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {user?.role === 'attendee' && !hasContact && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">Safety Recommendation</h4>
                <p className="text-xs text-amber-700 mt-1">
                  As an event attendee, we recommend adding emergency contact information. This helps event organizers reach someone in case of emergencies during events.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {!hasContact && (
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>
        )}
        <div className={hasContact ? 'w-full flex justify-end' : ''}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {saving ? (
              <>
                <LoadingSpinner />
                <span>Saving...</span>
              </>
            ) : (
              <>
                {hasContact ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{hasContact ? 'Update Contact' : 'Add Contact'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
