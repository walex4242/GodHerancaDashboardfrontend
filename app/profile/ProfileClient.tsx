import { useState, useEffect, useRef } from "react";
import { useLogin } from "../context/LoginContext";
import Image from "next/image";
import mapboxgl from 'mapbox-gl';

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || '';
mapboxgl.accessToken = mapboxToken;

const ProfileClient = () => {
    const { user, updateUser, updateProfilePicture } = useLogin();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        profilePicture: '',
        address: '',
        phone: '',
        profile: '',
        id: ''
    });
    const [file, setFile] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [manualAddress, setManualAddress] = useState<string>('');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                profilePicture: user.profilePicture || '',
                address: Array.isArray(user.address) ? user.address.join(', ') : user.address || '',
                phone: user.phone || '',
                profile: user.profile || '',
                id: user._id || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (manualAddress) {
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(manualAddress)}.json?access_token=${mapboxToken}`)
                .then(response => response.json())
                .then(data => {
                    if (data.features) {
                        const newSuggestions = data.features.map((feature: any) => feature.place_name);
                        setSuggestions(newSuggestions);
                    }
                })
                .catch(() => {
                    setSuggestions([]);
                });
        } else {
            setSuggestions([]);
        }
    }, [manualAddress, mapboxToken]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name in formData) {
            setFormData(prevState => ({
                ...prevState,
                [name as keyof typeof formData]: value,
            }));
        }

        if (name === 'address') {
            setManualAddress(value);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setManualAddress(suggestion);
        setFormData(prevState => ({
            ...prevState,
            address: suggestion,
        }));
        setSuggestions([]);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);

        if (selectedFile) {
            try {
                setLoading(true);
                await updateProfilePicture(selectedFile);
            } catch (error) {
                console.error('Failed to update profile picture:', error);
                setError('Profile picture update failed.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.username) {
            setError('Username and email are required');
            return;
        }

        if (user) {
            try {
                setLoading(true);
                const data = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    data.append(key, value);
                });

                await updateUser(data);
                setIsEditing(false);
            } catch (error) {
                console.error('Failed to update profile:', error);
                setError('Profile update failed.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-4 w-full h-full border rounded-lg shadow-md">
            <div className="relative w-40 h-40 md:w-60 md:h-60">
                {formData.profilePicture ? (
                    <img
                        src={formData.profilePicture}
                        alt="Profile"
                        className="rounded-full w-full h-full object-cover cursor-pointer"
                        onClick={() => document.getElementById('fileInput')?.click()}
                    />
                ) : (
                    <div
                        className="rounded-full w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 cursor-pointer"
                        onClick={() => document.getElementById('fileInput')?.click()}
                    >
                        <Image src='/imageupload.svg' alt="image upload" width={50} height={50} />
                    </div>
                )}
                <input
                    id="fileInput"
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            <div className="flex flex-col w-full md:w-2/3 gap-4">
                {loading && <div className="text-blue-500">Updating...</div>}
                {error && <div className="text-red-500">{error}</div>}

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Input Fields */}
                        {(['username', 'email', 'address', 'phone', 'profile'] as const).map((field) => (
                            <label key={field}>
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                                {field === 'address' ? (
                                    <div id="addressInput" className="w-full">
                                        <input
                                            type="text"
                                            name={field}
                                            value={manualAddress} // Bind manualAddress state
                                            onChange={handleChange} // Update both manualAddress and formData.address
                                            className="border p-2 rounded w-full"
                                            placeholder="Enter your address"
                                        />
                                        {suggestions.length > 0 && (
                                            <ul className="border border-gray-300 mt-1 p-2 bg-white">
                                                {suggestions.map((suggestion, index) => (
                                                    <li
                                                        key={index}
                                                        className="cursor-pointer hover:bg-gray-200 p-1"
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                    >
                                                        {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <input
                                            type={field === 'email' ? 'email' : 'text'}
                                            name={field}
                                            value={formData[field as keyof typeof formData]} // Type-safe access
                                            onChange={handleChange}
                                            className="border p-2 rounded w-full"
                                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                        />
                                )}
                            </label>
                        ))}

                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded mt-4"
                        >
                            Save Changes
                        </button>
                    </form>
                ) : (
                        <div className="flex flex-col gap-2">
                            <div><strong>Username:</strong> {formData.username}</div>
                            <div><strong>Email:</strong> {formData.email}</div>
                            <div><strong>Address:</strong> {formData.address}</div>
                            <div><strong>Phone:</strong> {formData.phone}</div>
                            <div><strong>Profile:</strong> {formData.profile}</div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-4 px-4 py-2 bg-gray-500 text-white hover:bg-black rounded"
                            >
                                Edit Profile
                            </button>
                        </div>
                )}
            </div>
        </div>
    );
};

export default ProfileClient;
