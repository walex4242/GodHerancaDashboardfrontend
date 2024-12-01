import React from 'react';

type PasswordChangeModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (currentPassword: string, newPassword: string) => void;
};

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose, onSave }) => {
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [passwordError, setPasswordError] = React.useState<string | null>(null);

    const handleSave = () => {
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Password is too short');
            return;
        }
        onSave(currentPassword, newPassword);
    };

    return (
        isOpen ? (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                    <h2 className="text-xl font-bold">Change Your Password</h2>
                    <div className="mt-4">
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Enter Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg mt-2"
                            placeholder="Enter New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg mt-2"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {passwordError && <p className="text-red-500 mt-2">{passwordError}</p>}
                    </div>
                    <div className="mt-4 flex justify-between">
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={handleSave}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default PasswordChangeModal;
