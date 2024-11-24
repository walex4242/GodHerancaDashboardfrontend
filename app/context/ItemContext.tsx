import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
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
    fetchItemsBySupermarket: () => Promise<Item[]>;
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

    useEffect(() => {
        if (!isAuthenticated || !supermarketId || !user) {
            clearItems(); // Clear items immediately if the user is logged out
        } else {
            fetchItemsBySupermarket(); // Fetch items for the current supermarket/user
        }
    }, [isAuthenticated, supermarketId, user]);

    // useEffect(() => {
    //     console.log("isAuthenticated or supermarketId changed", { isAuthenticated, supermarketId });
    //     if (isAuthenticated && supermarketId && user) {
    //         fetchItemsBySupermarket();
    //     } 
    // }, [isAuthenticated, supermarketId, user]);

    const createItem = async (item: Partial<Item>, image: File) => {
        if (!user || !isAuthenticated) {
            console.error('User is not authenticated');
            return;
        }

        try {
            const formData = new FormData();
            Object.keys(item).forEach((key) => {
                const value = item[key as keyof Item];
                if (value !== undefined) {
                    if (key === 'promotionEnd' && value instanceof Date) {
                        formData.append(key, value.toISOString());
                    } else if (key === 'quantityOffers') {
                        formData.append(key, JSON.stringify(value)); // Stringify quantityOffers array
                    } else {
                        formData.append(key, value as string | Blob);
                    }
                }
            });

            if (image) {
                formData.append('imageUrl', image);
            }

            await axios.post<Item>(`${process.env.NEXT_PUBLIC_API_URL}/item/${supermarketId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${user?._id}`,
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
                withCredentials: true,
            });

            fetchItemsBySupermarket();
        } catch (error) {
            console.error('Error creating item:', error);
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

    const clearItems = () => {
        setItems([]);
        setLoading(false); // Ensure loading is reset when clearing items
    };

    const fetchItemsBySupermarket = async (): Promise<Item[]> => {
        if (!user || !isAuthenticated || !supermarketId) {
            console.error('Supermarket ID is not available');
            clearItems();
            return [];
        }

        setLoading(true); // Start loading before fetching
        try {
            const response = await axios.get<Item[]>(`${process.env.NEXT_PUBLIC_API_URL}/supermarket/${supermarketId}/items`, {
                headers: {
                    'Authorization': `Bearer ${user?._id}`,
                },
                withCredentials: true,
            });

            if (response.data.length === 0) {
                clearItems();
            } else {
                setItems(response.data);
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching items by supermarket:', error);
            clearItems();
            return [];
        } finally {
            setLoading(false); // Stop loading after fetching
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
        if (!user || !isAuthenticated) {
            console.error('User is not authenticated');
            return;
        }

        try {
            const formData = new FormData();

            // Append updated item properties to FormData
            Object.keys(updatedItem).forEach((key) => {
                const value = updatedItem[key as keyof Item];
                if (value !== undefined) {
                    if (key === 'promotionEnd' && value instanceof Date) {
                        formData.append(key, value.toISOString());
                    } else if (key === 'quantityOffers') {
                        formData.append(key, JSON.stringify(value)); // Stringify quantityOffers array
                    } else {
                        formData.append(key, value as string | Blob);
                    }
                }
            });

            // Append image if provided
            if (image) {
                formData.append('imageUrl', image); // Ensure this matches backend field name
            }

            console.log('FormData content:', Array.from(formData.entries()));

            // Make PATCH request to update item
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/item/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${user._id}`, // Ensure correct token
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
                withCredentials: true, // Adjust as needed
            });

            console.log('Update response:', response.data);

            // Update local state to reflect changes
            setItems((prevItems) =>
                prevItems.map((item) => (item._id === id ? { ...item, ...response.data } : item))
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error updating item:', error.response?.data || error.message || error);
            } else {
                console.error('Unexpected error updating item:', error);
            }
        }
    };



    const deleteItem = async (id: string) => {
        if (!user || !isAuthenticated) {
            console.error('User is not authenticated');
            return;
        }

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/item/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user?._id}`,
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
                withCredentials: true,
            });
            setItems((prevItems) => prevItems.filter((item) => item._id !== id));
        } catch (error) {
            console.error('Error deleting item:', error);
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
