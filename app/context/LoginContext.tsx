import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the shape of the user data
export interface User {
    _id: string;
    username: string;
    email: string;
    profile?: string;
    address: string | string[] | undefined;
    phone: string;
    supermarketId?: string;
    userType: string;
    profilePicture: string;
    isVerified: boolean;
    uid: string;
    authentication: {
        password: string;
        sessionToken?: string; // Optional
        salt?: string;
    };
    createdAt: string;
    updatedAt: string;
    __v?: number; // Optional
}

interface LoginContextType {
    isAuthenticated: boolean;
    user: User | null;
    updateUser: (data: FormData) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
    updateProfilePicture: (picture: File) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>; // Added setUser to context
    supermarketId: string | null;
}

const LoginContext = createContext<LoginContextType | null>(null);

export const LoginProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    // Function for logging in a user
    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const responseData = await response.json();
            if (responseData?.token) {
                document.cookie = `token=${responseData.token}; path=/; secure; HttpOnly`; // Store token securely
                setIsAuthenticated(true);
                setUser(responseData);
            } else {
                throw new Error('Token or user data not available');
            }
        } catch (error) {
            console.error('Failed to login:', error);
            throw error;
        }
    };

    // Function to update user data (such as profile or address)
    const updateUser = async (data: FormData) => {
        if (!user?._id) {
            console.error('User ID is missing.');
            return;
        }

        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${user._id}`;

            const response = await fetch(apiUrl, {
                method: 'PATCH',
                credentials: 'include', // Ensure cookies are sent with the request
                body: data,
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error('Error response:', errorMessage);
                throw new Error('Failed to update user');
            }

            const updatedUser = await response.json();
            setUser(updatedUser.user); // Update the user context with the new data
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    // Function to update the user's password
    const updatePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${user?._id}/password`;
            const response = await fetch(apiUrl, {
                method: 'PATCH',
                credentials: 'include',  // Make sure cookies are sent with the request
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error('Error updating password:', errorMessage);
                return { success: false, message: 'Failed to update password' };
            }

            const result = await response.json();
            if (result.token) {
                document.cookie = `token=${result.token}; path=/; secure; HttpOnly;`;
            }

            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'An error occurred while updating the password' };
        }
    };

    // Function to update the user's profile picture
    const updateProfilePicture = async (picture: File) => {
        if (!user?._id) {
            console.error('User ID is missing.');
            return;
        }

        const formData = new FormData();
        formData.append('profilePicture', picture);

        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${user?._id}`;

            const response = await fetch(apiUrl, {
                method: 'PATCH',
                credentials: 'include', // Ensure cookies are sent with the request
                body: formData,
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error('Error response:', errorMessage);
                throw new Error('Failed to update profile picture');
            }

            const updatedUser = await response.json();
            setUser(updatedUser.user); // Update the user context with the new profile picture
        } catch (error) {
            console.error('Error updating profile picture:', error);
        }
    };

    // Fetch the user data if the token exists
    useEffect(() => {
        const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
        if (!token) {
            setIsAuthenticated(false);
            setUser(null);
            return;
        }

        const checkAuth = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?._id}`, { // 'me' endpoint for authenticated user
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token.split('=')[1]}`, // Extract token
                    },
                });

                if (response.ok) {
                    const responseData = await response.json();
                    setIsAuthenticated(true);
                    setUser(responseData);
                } else {
                    console.error('Failed to fetch user data');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setIsAuthenticated(false);
                setUser(null);
            }
        };

        checkAuth();
    }, []); // Empty dependency array means this will only run on component mount

    return (
        <LoginContext.Provider value={{
            isAuthenticated,
            user,
            login,
            updateUser,
            updatePassword,
            updateProfilePicture,
            setUser,
            supermarketId: user?.supermarketId || null
        }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => {
    const context = useContext(LoginContext);
    if (!context) {
        throw new Error('useLogin must be used within a LoginProvider');
    }
    return context;
};