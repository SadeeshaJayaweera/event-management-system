'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';

type SettingsTab = 'Profile' | 'Notifications' | 'Security' | 'Billing';

export default function OrganizerSettingsPage() {
    const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        eventReminders: true,
        weeklyDigest: false,
        marketingEmails: false,
    });

    const [securityForm, setSecurityForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || (user && user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
                router.push('/auth/login');
            } else if (user) {
                setProfileForm({
                    firstName: user.firstName || 'Admin',
                    lastName: user.lastName || 'User',
                    email: user.email || 'admin@eventflow.com',
                    bio: '',
                });
            }
        }
    }, [isAuthenticated, user, authLoading, router]);

    const handleProfileSave = async () => {
        setSaving(true);
        setSaveMessage('');
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveMessage('Profile updated successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleNotificationsSave = async () => {
        setSaving(true);
        setSaveMessage('');
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveMessage('Notification preferences updated!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (securityForm.newPassword !== securityForm.confirmPassword) {
            setSaveMessage('Passwords do not match');
            return;
        }
        setSaving(true);
        setSaveMessage('');
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveMessage('Password changed successfully!');
            setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const tabs: SettingsTab[] = ['Profile', 'Notifications', 'Security', 'Billing'];

    return (
        <main className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account preferences and system settings.</p>
            </div>

            {/* Success Message */}
            {saveMessage && (
                <div className={`mb-6 p-4 rounded-lg ${
                    saveMessage.includes('success') || saveMessage.includes('updated')
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    <p className="text-sm font-medium">{saveMessage}</p>
                </div>
            )}

            <div className="flex gap-8">
                {/* Sidebar Tabs */}
                <div className="w-64 flex-shrink-0">
                    <nav className="space-y-1 bg-gray-50 rounded-lg p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                                    activeTab === tab
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-gray-700 hover:bg-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {/* Profile Tab */}
                    {activeTab === 'Profile' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.firstName}
                                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.lastName}
                                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        value={profileForm.bio}
                                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                        rows={4}
                                        placeholder="Tell us about yourself..."
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleProfileSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'Notifications' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                            <div className="space-y-6">
                                {[
                                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates about your events and bookings' },
                                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get push notifications for important updates' },
                                    { key: 'eventReminders', label: 'Event Reminders', desc: 'Receive reminders before your events start' },
                                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Get a weekly summary of your event performance' },
                                    { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive tips, updates, and promotional content' },
                                ].map((setting) => (
                                    <div key={setting.key} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{setting.label}</p>
                                            <p className="text-sm text-gray-600 mt-1">{setting.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications({
                                                ...notifications,
                                                [setting.key]: !notifications[setting.key as keyof typeof notifications]
                                            })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                notifications[setting.key as keyof typeof notifications]
                                                    ? 'bg-indigo-600'
                                                    : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    notifications[setting.key as keyof typeof notifications]
                                                        ? 'translate-x-6'
                                                        : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                ))}

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleNotificationsSave}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
                                    >
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'Security' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>

                            <div className="space-y-6 max-w-xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={securityForm.currentPassword}
                                        onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={securityForm.newPassword}
                                        onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={securityForm.confirmPassword}
                                        onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
                                    >
                                        {saving ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'Billing' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Billing & Subscription</h2>

                            <div className="space-y-6">
                                {/* Current Plan */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Pro Plan</h3>
                                            <p className="text-sm text-gray-600 mt-1">Unlimited events and advanced features</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">$49</p>
                                            <p className="text-sm text-gray-600">per month</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                        Change Plan
                                    </button>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
                                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                                                <p className="text-sm text-gray-600">Expires 12/2026</p>
                                            </div>
                                        </div>
                                        <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                                            Update
                                        </button>
                                    </div>
                                </div>

                                {/* Billing History */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Billing History</h3>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                <tr>
                                                    <td className="px-4 py-3 text-sm text-gray-900">Jan 1, 2026</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">$49.00</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Paid
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                                            Download
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-sm text-gray-900">Dec 1, 2025</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">$49.00</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Paid
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                                            Download
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
