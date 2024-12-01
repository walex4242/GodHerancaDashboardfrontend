import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios, { isAxiosError } from 'axios';
import { useLogin } from './LoginContext';
import { useSupermarket } from './SupermarketContext';

export interface QuantityOffer {
    quantity: number;
    price: number;
}
export interface Item {
    _id: string;
    category: string;
    name: string;
    image: string;
    price: number;
    discountedPrice?: number; // Make this optional
    description: string;
    weight: number;
    stockQuantity: number;
    unit: string;
    discount?: number; // This is possibly undefined
    promotionEnd?: Date; // This is possibly undefined
    supermarket: string;
    quantityOffers?: QuantityOffer[]; // New property for quantity offers
}

interface ItemContextType {
    items: Item[];
    createItem: (item: Partial<Item>, image: File) => Promise<void>;
    fetchItemById: (id: string) => Promise<Item | null>;
    fetchItemsBySupermarket: () => Promise<Item[]>;  // This should return Item[]
    fetchItemsByCategory: (categoryId: string) => Promise<Item[]>;
    updateItem: (id: string, updatedItem: Partial<Item>, image?: File) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    clearItems: () => void;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<Item[]>([]);
    const { user, isAuthenticated } = useLogin();
    const { supermarketId } = useSupermarket();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItemsBySupermarket = async (): Promise<Item[]> => {
        if (!isAuthenticated || !supermarketId) return []; // return an empty array if conditions are not met
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<Item[]>(`${process.env.NEXT_PUBLIC_API_URL}/supermarket/${supermarketId}/items`, {
                headers: { Authorization: `Bearer ${user?._id}` },
                withCredentials: true,
            });
            setItems(response.data); // Update state with the fetched items
            return response.data; // Return the fetched items
        } catch (err) {
            const errorMsg = isAxiosError(err) ? err.response?.data?.message || err.message : 'Unexpected error occurred.';
            setError(errorMsg);
            return []; // Return an empty array in case of error
        } finally {
            setLoading(false);
        }
    };

    const clearItems = () => {
        setItems([]); // Clear items
        setTimeout(() => {
            setItems([]); // Ensure double clearing in case of async issues
        }, 0);
    };
    
    useEffect(() => {
        if (!isAuthenticated || !supermarketId || !user) {
            clearItems(); // Clear items immediately if the user is logged out
        } else {
            fetchItemsBySupermarket(); // Fetch items for the current supermarket/user
        }
    }, [isAuthenticated, supermarketId, user]);

    const createItem = async (item: Partial<Item>, image: File): Promise<void> => {
        if (!user || !isAuthenticated) return;
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(item).forEach((key) => {
                const value = item[key as keyof Item];
                if (value !== undefined) {
                    if (key === 'promotionEnd' && value instanceof Date) {
                        formData.append(key, value.toISOString());
                    } else {
                        formData.append(key, value as string | Blob);
                    }
                }
            });
            formData.append('imageUrl', image);
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/item/${supermarketId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            fetchItemsBySupermarket(); // Fetch items after creating the item
        } catch (err) {
            setError('Error creating item');
            console.error('Error creating item:', err);
        } finally {
            setLoading(false);
        }
    };


    const fetchItemById = async (id: string): Promise<Item | null> => {
        try {
            const response = await axios.get<Item>(`${process.env.NEXT_PUBLIC_API_URL}/item/${id}`, {
                headers: {
                    Authorization: `Bearer ${user?._id}`,
                },
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching item by ID:', error);
            return null;
        }
    };

    const fetchItemsByCategory = async (categoryId: string): Promise<Item[]> => {
        try {
            const response = await axios.get<Item[]>(`${process.env.NEXT_PUBLIC_API_URL}/category/${categoryId}/items`, {
                headers: {
                    Authorization: `Bearer ${user?._id}`,
                },
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching items by category:', error);
            return [];
        }
    };

    const updateItem = async (id: string, updatedItem: Partial<Item>, image?: File) => {
        if (!user || !isAuthenticated) return;
        setLoading(true);

        try {
            const formData = new FormData();

            // Add updated item fields to formData
            Object.keys(updatedItem).forEach((key) => {
                const value = updatedItem[key as keyof Item];
                if (value !== undefined) formData.append(key, value as string | Blob);
            });
            // Add the image if provided
            if (image) formData.append('imageUrl', image);

            // Make the request to update the item
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/item/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            // Refresh the items after update
            await fetchItemsBySupermarket();
        } catch (err) {
            setError('Error updating item.');
            console.error('Update Item Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id: string) => {
        if (!user || !isAuthenticated) return;
        setLoading(true);
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/item/${id}`, { withCredentials: true });
            setItems((prev) => prev.filter((item) => item._id !== id));
        } catch (err) {
            setError('Error deleting item.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ItemContext.Provider
            value={{
                items,
                createItem,
                fetchItemById,
                fetchItemsBySupermarket,
                fetchItemsByCategory,
                updateItem,
                deleteItem,
                clearItems
            }}
        >
            {children}
        </ItemContext.Provider>
    );
};

export const useItem = () => {
    const context = useContext(ItemContext);
    if (!context) {
        throw new Error('useItem must be used within an ItemProvider');
    }
    return context;
};
