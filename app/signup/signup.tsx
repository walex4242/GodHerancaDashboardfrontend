"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';

// Define the form inputs type
interface SignupFormInputs {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    address: string;
    phone: string;
    userType: 'Admin' | 'Driver' | 'Supermarket' | 'Client' | 'Picker';
    profile: string;
}
// Define the validation schema
const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/\d/, "Password must contain at least one number")
        .matches(/[@$!%*?&#]/, "Password must contain at least one special character")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
    address: Yup.string().required("Address is required"),
    phone: Yup.string().required("Phone is required"),
    userType: Yup.mixed<'Admin' | 'Driver' | 'Supermarket' | 'Client' | 'Picker'>()
        .oneOf(['Admin', 'Driver', 'Supermarket', 'Client', 'Picker'], "Invalid user type")
        .required("User Type is required"),
    profile: Yup.string().required("Profile is required"),
});

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || '';
mapboxgl.accessToken = mapboxToken;

const Signup = () => {
    const { register, handleSubmit, formState: { errors, isValid }, setValue } = useForm<SignupFormInputs>({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',  // Enables real-time form validation
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const [manualAddress, setManualAddress] = useState<string>('');
    const [suggestions, setSuggestions] = useState<string[]>([]);


    const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
        try {
            const addressArray = data.address.split(',').map(addr => addr.trim());
            const registrationData = { ...data, address: addressArray };

            const registrationResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, registrationData, { 
                headers: {
                    'Content-Type': 'application/json',
                },
             });
            if (registrationResponse.status === 201) {
                setSuccess('Registration successful! A verification email has been sent to your inbox.');
                setError('');
                // Redirect to the verification page
                router.push(`/verification?email=${data.email}`);
            } else {
                setError('Registration failed. Please try again.');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    setError(`Registration failed: ${err.response.data.message || 'Please try again.'}`);
                } else if (err.request) {
                    setError('No response from the server. Please try again.');
                } else {
                    setError(`Error: ${err.message}`);
                }
            } else if (err instanceof Error) {
                setError(`Error: ${err.message}`);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

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

        if (name === 'address') {
            setManualAddress(value);  // Update state
            setValue('address', value);  // Update form value
        }
    };

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-50 pt-12 sm:pt-20 px-4 light">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}
                <form onSubmit={handleSubmit(onSubmit)} method="post">
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username:</label>
                        <input
                            type="text"
                            id="username"
                            {...register('username')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                        <input
                            type="email"
                            id="email"
                            {...register('email')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                        <input
                            type="password"
                            id="password"
                            {...register('password')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            {...register('confirmPassword')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address:</label>
                        <input
                            type="text"
                            id="address"
                            {...register("address")}  // Register from react-hook-form
                            value={manualAddress}  // Controlled value for custom handling
                            onChange={(e) => {
                                handleChange(e);  // Custom change handler
                                setValue("address", e.target.value);  // Set the value in react-hook-form
                                // Show suggestions only if there is text
                                setSuggestions(e.target.value ? suggestions : []);
                            }}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}

                        {/* Suggestion box */}
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-lg z-10">
                                <ul className="autocomplete-suggestions">
                                    {suggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            onClick={() => {
                                                setManualAddress(suggestion); // Set the selected suggestion as the manual address
                                                setValue('address', suggestion); // Set the address value in react-hook-form
                                                setSuggestions([]); // Clear suggestions after selection
                                            }}
                                            className="cursor-pointer p-2 hover:bg-gray-200"
                                        >
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>


                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone:</label>
                        <input
                            type="text"
                            id="phone"
                            {...register('phone')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="userType" className="block text-sm font-medium text-gray-700">User Type:</label>
                        <select
                            id="userType"
                            {...register('userType')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">Select a type</option>
                            <option value="Admin">Admin</option>
                            <option value="Driver">Driver</option>
                            <option value="Supermarket">Supermarket</option>
                            <option value="Client">Client</option>
                            <option value="Picker">Picker</option>
                        </select>
                        {errors.userType && <p className="text-red-500 text-sm">{errors.userType.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="profile" className="block text-sm font-medium text-gray-700">Profile:</label>
                        <input
                            type="text"
                            id="profile"
                            {...register('profile')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.profile && <p className="text-red-500 text-sm">{errors.profile.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={!isValid}
                        className={`w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?
                    <Link href="/login" className="text-blue-600 hover:text-blue-800"> Log in</Link>
                </p>
            </div>
        </div>
    );
};
export default Signup;
