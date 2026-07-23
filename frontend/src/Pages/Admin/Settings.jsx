// src/Pages/Admin/Settings.jsx
import React, { useState } from 'react';

const Settings = () => {
    const [settings, setSettings] = useState({
        siteName: 'Hospital Management System',
        email: 'admin@hospital.com',
        phone: '+1 234 567 8900',
        address: '123 Hospital Street, Medical City',
        timezone: 'UTC+0',
        language: 'en',
        notifications: true,
        autoBackup: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Settings saved successfully!');
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-6">Settings</h2>
            
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                            <input 
                                type="text" 
                                value={settings.siteName}
                                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                            <input 
                                type="email" 
                                value={settings.email}
                                onChange={(e) => setSettings({...settings, email: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input 
                                type="text" 
                                value={settings.phone}
                                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <input 
                                type="text" 
                                value={settings.address}
                                onChange={(e) => setSettings({...settings, address: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                            <select 
                                value={settings.timezone}
                                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="UTC+0">UTC+0</option>
                                <option value="UTC+1">UTC+1</option>
                                <option value="UTC+2">UTC+2</option>
                                <option value="UTC+3">UTC+3</option>
                                <option value="UTC-5">UTC-5</option>
                                <option value="UTC-8">UTC-8</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <select 
                                value={settings.language}
                                onChange={(e) => setSettings({...settings, language: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="en">English</option>
                                <option value="ar">Arabic</option>
                                <option value="fr">French</option>
                                <option value="es">Spanish</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                                <p className="text-xs text-gray-500">Receive email notifications for system events</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setSettings({...settings, notifications: !settings.notifications})}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Auto Backup</label>
                                <p className="text-xs text-gray-500">Automatically backup data daily</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setSettings({...settings, autoBackup: !settings.autoBackup})}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    settings.autoBackup ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Save Settings
                        </button>
                        <button 
                            type="button" 
                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings; // Make sure this line exists