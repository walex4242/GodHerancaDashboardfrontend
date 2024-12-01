import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios, { isAxiosError } from 'axios';
import { useLogin } from './LoginContext';
import { useSupermarket } from './SupermarketContext';

export interface Category {
    _id: string;
    name: string;
    image?: string;
    userId: string;
    supermarketId: string;
    parentCategory?: string;
    subcategories?: string[];
}

interface CategoryContextType {
    categories: Category[];
    fetchCategories: () => Promise<void>;
    createCategory: (formData: FormData, parentCategoryId?: string) => Promise<void>;
    updateCategory: (id: string, formData: FormData) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { user, isAuthenticated } = useLogin();
    const { supermarketId } = useSupermarket();

    const fetchCategories = async () => {
        if (!isAuthenticated || !supermarketId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<Category[]>(
                `${process.env.NEXT_PUBLIC_API_URL}/supermarket/${supermarketId}/categories`,
                { withCredentials: true }
            );
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const clearCategory = () => {
        setCategories([]);
        setLoading(false); // Ensure loading is reset when clearing items
    };

    useEffect(() => {
        if (!isAuthenticated && !supermarketId && !user) {
            clearCategory()
        } else {
            fetchCategories(); 
        }
        // Only run when user authentication state or supermarketId changes
    }, [isAuthenticated, supermarketId]);

    const createCategory = async (formData: FormData, parentCategoryId?: string) => {
        try {
            // Append parentCategoryId to formData if it's provided
            if (parentCategoryId) {
                formData.append('parentCategory', parentCategoryId);
            }

            // Ensure user has supermarketId and append it to formData
            if (user?.supermarketId) {
                formData.append('supermarketId', user.supermarketId); // Use user's supermarketId
            }

            // Send the request to the backend
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/category/${user?._id}`;
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Change to 'multipart/form-data' for sending FormData
                    'Accept': 'application/json', // Accept JSON response
                },
                withCredentials: true, // Send cookies along with the request if needed
            });

            // Handle the successful creation of the category
            console.log('Category created:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error; // Re-throw the error so it can be handled elsewhere if needed
        }
    };
    
    const updateCategory = async (id: string, formData: FormData) => {
        if (!isAuthenticated) {
            setError('User is not authenticated');
            return;
        }

        setLoading(true); // Set loading state before making the API call

        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/category/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
                withCredentials: true, // Ensure cookies (JWT) are sent
            });

            await fetchCategories(); // Refresh categories after successful update
        } catch (error) {
            console.error('Error updating category:', error);
            setError('Failed to update category. Please try again.');
        } finally {
            setLoading(false); // Reset loading state after API call
        }
    };

    const deleteCategory = async (id: string) => {
        if (!isAuthenticated || !user) {
            setError('User is not authenticated');
            return;
        }

        setLoading(true); // Set loading state before making the API call

        try {

            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/category/${id}`, {
                headers: {
                    'Accept': 'application/json', // Accept JSON response
                },
                withCredentials: true, // Ensure cookies (JWT) are sent
            });

            await fetchCategories(); // Refresh categories after successful deletion
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Axios error handling
                console.error('Error deleting category:', error.response?.data);
                if (error.response?.status === 403) {
                    setError('You do not have permission to delete this category.');
                } else {
                    setError('Failed to delete category. Please try again.');
                }
            } else {
                // Generic error handling
                console.error('Unexpected error:', error);
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false); // Reset loading state after API call
        }
    };



    return (
        <CategoryContext.Provider value={{ categories, fetchCategories, createCategory, updateCategory, deleteCategory }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategory must be used within a CategoryProvider');
    }
    return context;
};
