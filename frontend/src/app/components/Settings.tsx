import { User, Bell, Shield } from "lucide-react";
import { useState } from "react";
import { ProfileSettings } from "./ProfileSettings";
import { PreferencesSettings } from "./PreferencesSettings";
import { EmergencyContactSettings } from "./EmergencyContactSettings";
import { useAuth } from "../contexts/AuthContext";

export function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('Profile');

  const sections = [
    { id: 'Profile', label: 'Profile', icon: User },
    { id: 'Preferences', label: 'Preferences', icon: Bell },
    { id: 'Emergency', label: 'Emergency Contact', icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your profile and account preferences. All fields are optional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  section.id === activeSection
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${section.id === activeSection ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2">
          {activeSection === 'Profile' && <ProfileSettings />}
          {activeSection === 'Preferences' && <PreferencesSettings />}
          {activeSection === 'Emergency' && <EmergencyContactSettings />}
        </div>
      </div>
    </div>
  );
}
