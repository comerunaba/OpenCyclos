"use client";

import { useEffect, useState } from "react";

interface Settings {
  applicationName: string;
  allowNewRegistrations: boolean;
  theme: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:6001/rest/admin/settings");
        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }
        const data = await response.json();
        setSettings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const isCheckbox = type === 'checkbox';
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    if (settings) {
      setSettings({ ...settings, [name]: inputValue });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setError(null);
      setSuccessMessage(null);
      const response = await fetch("http://localhost:6001/rest/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
      await response.json();
      setSuccessMessage("Settings saved successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      {settings && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div>
            <label htmlFor="applicationName" className="block text-sm font-medium text-gray-700">
              Application Name
            </label>
            <input
              type="text"
              id="applicationName"
              name="applicationName"
              value={settings.applicationName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Theme
            </label>
            <select
              id="theme"
              name="theme"
              value={settings.theme}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowNewRegistrations"
              name="allowNewRegistrations"
              checked={settings.allowNewRegistrations}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="allowNewRegistrations" className="ml-2 block text-sm text-gray-900">
              Allow New User Registrations
            </label>
          </div>
          <div>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Settings
            </button>
          </div>
          {successMessage && <p className="text-green-600">{successMessage}</p>}
        </div>
      )}
    </div>
  );
}