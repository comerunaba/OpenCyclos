"use client";

import { useEffect, useState, ReactNode } from "react";

// Matches the comprehensive structure in the mock backend
type Settings = {
  general: {
    applicationName: string;
    rootUrl: string;
    language: string;
    theme: string;
    cyclosId: string;
    applicationUsername: string;
  };
  localization: {
    charset: string;
    numberLocale: string;
    precision: string;
    datePattern: string;
    timePattern: string;
    timeZone: string;
  };
  registration: {
    allowNewRegistrations: boolean;
    emailRequired: boolean;
    emailUnique: boolean;
    deletePendingRegistrationsAfter: { value: number; field: string };
  };
  members: {
    memberSortOrder: string;
    memberResultDisplay: string;
    referenceLevels: number;
  };
  transactions: {
    transactionNumber: { prefix: string; padLength: number; suffix: string; enabled: boolean };
    maxChargebackTime: { value: number; field: string };
  };
  messaging: {
    deleteMessagesOnTrashAfter: { value: number; field: string };
    messageFormat: string;
  };
  uploads: {
    maxUploadSize: number;
    maxImageWidth: number;
    maxImageHeight: number;
    maxThumbnailWidth: number;
    maxThumbnailHeight: number;
  };
  system: {
    maxPageResults: number;
    schedulingHour: number;
    schedulingMinute: number;
  };
};

type Tab = keyof Settings;

const timePeriodFields = ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'];

// A helper component for TimePeriod objects
const TimePeriodInput = ({ name, value, category, onChange }: { name: string, value: { value: number; field: string }, category: keyof Settings, onChange: any }) => (
  <div className="flex items-center space-x-2">
    <input
      type="number"
      name={name}
      data-category={category}
      data-sub-key="value"
      value={value.value}
      onChange={onChange}
      className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
    />
    <select
      name={name}
      data-category={category}
      data-sub-key="field"
      value={value.field}
      onChange={onChange}
      className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
    >
      {timePeriodFields.map(field => <option key={field} value={field}>{field}</option>)}
    </select>
  </div>
);


export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('general');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:6001/rest/admin/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        setSettings(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, dataset } = e.target;
    const category = dataset.category as keyof Settings;
    const subKey = dataset.subKey as string | undefined;

    if (settings && category) {
      const isCheckbox = type === 'checkbox';
      const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : (type === 'number' ? Number(value) : value);

      let newCategoryState = { ...settings[category] };
      if (subKey) {
        // Handle nested objects like TimePeriod or TransactionNumber
        (newCategoryState as any)[name] = { ... (newCategoryState as any)[name], [subKey]: inputValue };
      } else {
        (newCategoryState as any)[name] = inputValue;
      }

      setSettings({ ...settings, [category]: newCategoryState });
    }
  };
  
  const handleSave = async () => {
    if (!settings) return;
    try {
      setError(null);
      setSuccessMessage(null);
      const response = await fetch("http://localhost:6001/rest/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const renderTabContent = (): ReactNode => {
    if (!settings) return null;
    
    // Generic function to create form fields
    const renderField = (label: string, name: string, category: keyof Settings, type: 'text' | 'number' | 'select' | 'checkbox' = 'text', options: string[] = []) => {
      const value = (settings[category] as any)[name];
      // A helper function to create a label
      const Label = () => <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>

      if (type === 'checkbox') {
         return (
            <div className="flex items-center">
              <input type="checkbox" id={name} name={name} data-category={category} checked={value} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
              <label htmlFor={name} className="ml-2 block text-sm text-gray-900">{label}</label>
            </div>
         );
      }
      return (
        <div>
          <Label />
          {type === 'select' ? (
             <select id={name} name={name} data-category={category} value={value} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
             </select>
          ) : (
            <input type={type} id={name} name={name} data-category={category} value={value} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          )}
        </div>
      );
    };

    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General</h3>
            {renderField('Application Name', 'applicationName', 'general')}
            {renderField('Root URL', 'rootUrl', 'general')}
            {renderField('Language', 'language', 'general', 'select', ['ENGLISH', 'SPANISH', 'GERMAN', 'DUTCH'])}
            {renderField('Theme', 'theme', 'general', 'select', ['light', 'dark'])}
            {renderField('Cyclos ID', 'cyclosId', 'general')}
            {renderField('Application Username', 'applicationUsername', 'general')}
          </div>
        );
      case 'localization':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Localization</h3>
            {renderField('Charset', 'charset', 'localization', 'select', ['UTF-8', 'ISO-8859-1'])}
            {renderField('Number Locale', 'numberLocale', 'localization', 'select', ['COMMA_AS_DECIMAL', 'PERIOD_AS_DECIMAL'])}
            {renderField('Precision', 'precision', 'localization', 'select', ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'])}
            {renderField('Date Pattern', 'datePattern', 'localization', 'select', ['DD_MM_YYYY_SLASH', 'YYYY_MM_DD_DASH', 'MM_DD_YYYY_PERIOD'])}
            {renderField('Time Pattern', 'timePattern', 'localization', 'select', ['HH24_MM_SS', 'HH12_MM_SS'])}
          </div>
        );
      case 'registration':
         return (
          <div className="space-y-4">
             <h3 className="text-lg font-medium">User Registration</h3>
             {renderField('Allow New User Registrations', 'allowNewRegistrations', 'registration', 'checkbox')}
             {renderField('Email Is Required', 'emailRequired', 'registration', 'checkbox')}
             {renderField('Email Is Unique', 'emailUnique', 'registration', 'checkbox')}
             <div>
                <label className="block text-sm font-medium text-gray-700">Delete Pending Registrations After</label>
                <TimePeriodInput name="deletePendingRegistrationsAfter" value={settings.registration.deletePendingRegistrationsAfter} category="registration" onChange={handleInputChange} />
             </div>
          </div>
        );
      case 'members':
         return (
          <div className="space-y-4">
             <h3 className="text-lg font-medium">Members</h3>
             {renderField('Member List Sort Order', 'memberSortOrder', 'members', 'select', ['CHRONOLOGICAL', 'ALPHABETICAL'])}
             {renderField('Member List Display Field', 'memberResultDisplay', 'members', 'select', ['USERNAME', 'NAME'])}
             {renderField('Number of Reference Levels', 'referenceLevels', 'members', 'number')}
          </div>
        );
      case 'transactions':
          const txNum = settings.transactions.transactionNumber;
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Transactions</h3>
              <div className="p-4 border rounded-md space-y-3">
                  <h4 className="font-medium">Transaction Number Format</h4>
                  <div className="flex items-center">
                    <input type="checkbox" id="txEnabled" name="transactionNumber" data-category="transactions" data-sub-key="enabled" checked={txNum.enabled} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                    <label htmlFor="txEnabled" className="ml-2 block text-sm text-gray-900">Enable Custom Transaction Numbers</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prefix</label>
                    <input type="text" name="transactionNumber" data-category="transactions" data-sub-key="prefix" value={txNum.prefix} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID Padding Length</label>
                    <input type="number" name="transactionNumber" data-category="transactions" data-sub-key="padLength" value={txNum.padLength} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Suffix</label>
                    <input type="text" name="transactionNumber" data-category="transactions" data-sub-key="suffix" value={txNum.suffix} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Chargeback Time</label>
                <TimePeriodInput name="maxChargebackTime" value={settings.transactions.maxChargebackTime} category="transactions" onChange={handleInputChange} />
              </div>
            </div>
          );
      case 'system':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">System Performance & Limits</h3>
            {renderField('Results per Page', 'maxPageResults', 'system', 'number')}
            {renderField('Max Autocomplete Results', 'maxAjaxResults', 'system', 'number')}
            {renderField('Max Internal Iterator Results', 'maxIteratorResults', 'system', 'number')}
            <h3 className="text-lg font-medium pt-4">Scheduled Tasks</h3>
             <div className="flex items-center space-x-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Execution Time (24h)</label>
                  <div className="flex items-center space-x-2">
                    <input type="number" name="schedulingHour" data-category="system" value={settings.system.schedulingHour} onChange={handleInputChange} className="mt-1 block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    <span>:</span>
                    <input type="number" name="schedulingMinute" data-category="system" value={settings.system.schedulingMinute} onChange={handleInputChange} className="mt-1 block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                </div>
             </div>
            <h3 className="text-lg font-medium pt-4">Advanced</h3>
            {renderField('Container URL', 'containerUrl', 'system')}
            {renderField('Custom Transfer Listener Class', 'transferListenerClass', 'system')}
          </div>
        );
      // Other cases would follow...
      default:
        return <p>Settings for {activeTab} would go here.</p>;
    }
  };

  if (isLoading) return <div>Loading settings...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const tabs = settings ? Object.keys(settings) as Tab[] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      <div className="flex">
        <div className="w-1/4">
            <nav className="flex flex-col space-y-1 pr-4">
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`p-2 rounded-md text-left capitalize ${activeTab === tab ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'}`}>
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
        <div className="w-3/4 bg-white p-6 rounded-lg shadow-md">
            {renderTabContent()}
            <div className="mt-6 border-t pt-6">
                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">
                    Save All Settings
                </button>
                {successMessage && <p className="inline-block ml-4 text-green-600">{successMessage}</p>}
            </div>
        </div>
      </div>
    </div>
  );
}