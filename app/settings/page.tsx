"use client"
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLogin } from "../context/LoginContext";
import PasswordChangeModal from "./passwordChangeModal"; // Import the modal component
import Heading from "../components/Heading";


const Settings = () => {
        
    type UserSetting = {
        label: string;
        value: string | boolean;
        type: "text" | "toggle" | "password";
    };

    const mockSettings: UserSetting[] = [
        { label: "notification", value: true, type: "toggle" },
        // { label: "darkMode", value: false, type: "toggle" },
        { label: "password", value: '', type: "password" },
    ];

        const { t, i18n } = useTranslation();
        const { updatePassword, isAuthenticated, user } = useLogin(); // Destructure the updatePassword function
        const [userSettings, setUserSettings] = useState<UserSetting[]>(mockSettings);
        const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 

        const handleToggleChange = (index: number) => {
            const settingsCopy = [...userSettings];
            settingsCopy[index].value = !settingsCopy[index].value as boolean;
            setUserSettings(settingsCopy);
        };

        const handleTextChange = (index: number, value: string) => {
            const settingsCopy = [...userSettings];
            settingsCopy[index].value = value;
            setUserSettings(settingsCopy);
        };



    const handleSave = async (currentPassword: string, newPassword: string) => {
        setSaveStatus(t('saving'));
        setPasswordError(null);

        // Password validation logic
        if (newPassword.length < 6) {
            setPasswordError(t('passwordTooShort'));
            setSaveStatus(null);
            return;
        }

        // Handle password update
        try {
            // Send both current and new password to the backend for validation
            const response = await updatePassword(currentPassword, newPassword);

            if (response.success) {
                setSaveStatus(t('saved'));
                setIsModalOpen(false); // Close the modal after saving

                // Log the user out
                localStorage.removeItem('token'); // Example for localStorage, adjust as needed
                // or clear context if you're using a context for authentication
                // logout();

                // Redirect to login page
                window.location.href = '/login'; // or use a routing library like react-router
            } else {
                setPasswordError(t('incorrectOldPassword')); // Backend should return this message
                setSaveStatus(null);
            }
        } catch (error) {
            setPasswordError(t('passwordUpdateError'));
            setSaveStatus(null);
        }
    };

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        i18n.changeLanguage(selectedLanguage);
    };

    if (!isAuthenticated || !user) {
        return (
            <p className="text-center justify-center text-black">You do not have permission to view this page.</p>
        );
    }

    return (
        <div className="w-full px-4 py-6 sm:px-6 md:px-8 lg:px-10 light">
            <Heading name={t('userSettings')} />
            <div className="overflow-x-auto mt-5 shadow-md rounded-lg">
                <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">{t('setting')}</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">{t('value')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userSettings.map((setting, index) => (
                            <tr className="hover:bg-gray-100" key={setting.label}>
                                <td className="py-2 px-4 font-medium uppercase">{t(setting.label)}</td>
                                <td className="py-2 px-4">
                                    {setting.type === "toggle" ? (
                                        <label className="inline-flex relative items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={setting.value as boolean}
                                                onChange={() => handleToggleChange(index)}
                                            />
                                            <div
                                                className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-black-300 peer-focus:ring-4 
                          transition peer-checked:after:translate-x-full peer-checked:after:border-white 
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                          after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                          peer-checked:bg-black-300"
                                            ></div>
                                        </label>
                                    ) : setting.type === "password" ? (
                                        <button
                                            className="text-white bg-gray-400 hover:bg-black rounded-lg p-2"
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            {t('Change Your Password')}
                                        </button>
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-gray-500"
                                            value={setting.label === "language" ? t(setting.value as string) : (setting.value as string)}
                                            onChange={(e) => handleTextChange(index, e.target.value)}
                                            disabled={setting.label === "language"}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <select
                    className="border rounded-lg p-2 uppercase"
                    value={i18n.language}
                    onChange={handleLanguageChange}
                >
                    <option value="en">{t('english')}</option>
                    <option value="es">{t('spanish')}</option>
                    <option value="pt">{t('portuguese')}</option>
                </select>
                {saveStatus && (
                    <p className={`mt-2 ${saveStatus.includes('error') ? 'text-red-500' : 'text-green-500'}`}>
                        {saveStatus}
                    </p>
                )}
                {passwordError && <p className="text-red-500 mt-2">{passwordError}</p>}
            </div>

            {/* Password Change Modal */}
            <PasswordChangeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
};

export default Settings;
