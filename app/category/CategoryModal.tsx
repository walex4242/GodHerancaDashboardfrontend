import React, { useState, useEffect } from 'react';
import { Category } from '../context/CategoryContext';

interface CategoryFormProps {
    category?: Category;
    onSave: (category: Omit<Category, '_id'>, imageFile?: File) => void;
    onCancel: () => void;
    parentCategories: Category[];
    userId: string;
    supermarketId: string;
    loading: boolean;  // Add the loading prop
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    category,
    onSave,
    onCancel,
    parentCategories,
    userId,
    supermarketId,
    loading,  // Destructure the loading prop
}) => {
    const [name, setName] = useState<string>(category?.name || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [parentCategory, setParentCategory] = useState<string>(category?.parentCategory || '');

    useEffect(() => {
        if (category) {
            setName(category.name);
            setParentCategory(category.parentCategory || '');
        } else {
            setName('');
            setParentCategory('');
        }
    }, [category]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(
            {
                name,
                userId,
                supermarketId,
                parentCategory,
            },
            imageFile || undefined
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-700">Nome da categoria</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 w-full rounded-md"
                    required
                    disabled={loading} // Disable input while saving
                />
            </div>
            <div>
                <label className="block text-gray-700">Carregar imagem</label>
                <input
                    type="file"
                    onChange={handleImageChange}
                    className="border p-2 w-full rounded-md"
                    accept="image/*"
                    disabled={loading} // Disable input while saving
                />
                {imageFile && <p className="mt-2 text-sm text-gray-600"> Arquivo selecionado: {imageFile.name}</p>}
            </div>
            {parentCategories.length > 0 && (
                <div>
                    <label className="block text-gray-700">Categoria pai</label>
                    <select
                        value={parentCategory}
                        onChange={(e) => setParentCategory(e.target.value)}
                        className="border p-2 w-full rounded-md"
                        disabled={loading} // Disable input while saving
                    >
                        <option value="">Nenhum</option>
                        {parentCategories.map(parent => (
                            <option key={parent._id} value={parent._id}>
                                {parent.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                    type="submit"
                    className="bg-gray-500 hover:bg-black text-white px-4 py-2 rounded-xl w-full sm:w-auto"
                    disabled={loading} // Disable button while saving
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-500 hover:bg-black text-white px-4 py-2 rounded-xl w-full sm:w-auto"
                    disabled={loading} // Disable cancel button while saving
                >
                    Cancelar
                </button>
            </div>
        </form>

    );
};

export default CategoryForm;
