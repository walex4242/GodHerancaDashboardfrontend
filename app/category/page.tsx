"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Category } from '../context/CategoryContext';
import { useCategory } from '../context/CategoryContext';
import { useLogin } from '../context/LoginContext';
import CategoryForm from './CategoryModal';
import { useSupermarket } from '../context/SupermarketContext';
import { EditIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';

const CategoriesPage = () => {
    const { isAuthenticated, user } = useLogin();
    const { categories, createCategory, updateCategory, deleteCategory, fetchCategories } = useCategory();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const { supermarketId } = useSupermarket();

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (isMounted && isAuthenticated && user && supermarketId) {
                try {
                    await fetchCategories();
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    setError('Error fetching categories. Please try again later.');
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, user, supermarketId]);



    useEffect(() => {
        if (categories) {
            setParentCategories(categories.filter(cat => !cat.parentCategory));
        }
    }, [categories]);

    const handleCreate = () => {
        setEditingCategory(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const handleSave = async (category: Omit<Category, '_id'>, imageFile?: File) => {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('name', category.name);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (category.parentCategory) {
            formData.append('parentCategory', category.parentCategory);
        }

        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, formData);
            } else {
                // Pass parentCategoryId (category.parentCategory) along with formData to createCategory
                await createCategory(formData, category.parentCategory);
            }

            await fetchCategories(); // Refresh categories after creation or update

            setIsFormOpen(false); // Close the form after saving successfully
            setEditingCategory(undefined); // Reset editing category
        } catch (error) {
            console.error('Failed to save category:', error);
            setError('Failed to save category. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsFormOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setLoading(true);
            setError(null);
            try {
                await deleteCategory(id);

                // Update local categories state
                const updatedCategories = categories.filter(category => category._id !== id);
                setParentCategories(updatedCategories);

                // Optionally re-fetch categories
                await fetchCategories();

                // Close the modal if open
                setIsFormOpen(false);
            } catch (error) {
                console.error('Failed to delete category:', error);
                setError('Failed to delete category. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderCategory = (category: Category) => (
        <div key={category._id} className="border shadow rounded-lg p-4 bg-white">
            {category.image && (
                <img
                    src={category.image}
                    alt={category.name}
                    className="w-32 h-32 object-cover rounded-full mx-auto"
                />
            )}
            <h2 className="text-xl font-semibold mt-4 text-center">{category.name}</h2>
            <div className="flex flex-col sm:flex-row sm:space-x-2 w-full">
                <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center bg-gray-600 hover:bg-black text-white font-bold py-2 px-4 rounded-lg text-sm"
                >
                    <EditIcon className="w-5 h-5 mr-2" /> Editar
                </button>
                <button
                    onClick={() => handleDelete(category._id)}
                    className="flex-1 flex items-center justify-center bg-gray-600 hover:bg-black text-white font-bold py-2 px-4 rounded-lg text-sm mt-2 sm:mt-0"
                >
                    <Trash2Icon className="w-5 h-5 mr-2" /> Excluir
                </button>
            </div>
        </div>
    );

    if (!isAuthenticated || !user) {
        return (
            <p className='text-center justify-center text-black'> Você não tem permissão para visualizar esta página. </p>
        )
    }

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="Categorias de pesquisa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-xs md:max-w-md py-2 px-4 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
            </div>
            <div className="flex flex-wrap justify-between items-center mb-6 ">
                <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Categorias</h2>
                <button
                    onClick={handleCreate}
                    className="mt-2 sm:mt-0 flex items-center bg-gray-300 hover:bg-black text-white font-bold py-2 px-4 rounded-lg text-sm sm:text-base"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Criar categoria
                </button>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCategories.map(renderCategory)}
            </div>
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded shadow-lg w-full sm:w-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl">
                        <CategoryForm
                            category={editingCategory}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            parentCategories={parentCategories}
                            userId={user?._id || ''}
                            supermarketId={supermarketId || ''}
                            loading={loading}
                        />
                    </div>
                </div>
            )}
        </div>


    );
};

export default CategoriesPage;
