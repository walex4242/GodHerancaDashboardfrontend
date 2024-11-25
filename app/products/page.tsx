"use client";
import { PlusCircleIcon, Trash2Icon, EditIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import CreateProductModal from "./CreateProductModal";
import Image from "next/image";
import { useItem, Item } from '../context/ItemContext';
import { useLogin } from '../context/LoginContext';
import { useRouter } from "next/navigation";
import { useSupermarket } from '../context/SupermarketContext';

const Products = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Item | null>(null);

    const { items, deleteItem, fetchItemsBySupermarket } = useItem();
    const { isAuthenticated, user } = useLogin();
    const { supermarketId } = useSupermarket();
    const router = useRouter();

    const fetchItems = useCallback(async () => {
        if (supermarketId) {
            await fetchItemsBySupermarket();
        } else {
            console.warn('supermarketId is undefined');
        }
    }, [fetchItemsBySupermarket, supermarketId]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (isAuthenticated && supermarketId) {
                await fetchItems();
            }
        };

        fetchData().finally(() => {
            if (isMounted) {
                // Set any additional state if needed
            }
        });

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, supermarketId, fetchItems]);

    if (!isAuthenticated || !user) {
        return <p className="text-center text-gray-600">Loading...</p>;
    }

    // Filter products based on the search term
    const filteredProducts = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditProduct = (product: Item) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteItem(productId);
        } catch (error) {
            console.error("Failed to delete product:", error);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
            {/* SEARCH BAR */}
            <div className="mb-6 flex justify-center px-2">
                <input
                    className="w-full max-w-md py-2 px-4 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black sm:max-w-lg"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* HEADER BAR */}
            <div className="flex flex-wrap justify-between items-center mb-6 px-2">
                <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Products</h2>
                <button
                    className="mt-2 sm:mt-0 flex items-center bg-gray-300 hover:bg-black text-white font-bold py-2 px-4 rounded-lg text-sm sm:text-base"
                    onClick={() => {
                        setEditingProduct(null);
                        setIsModalOpen(true);
                    }}
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Create Product
                </button>
            </div>

            {/* BODY PRODUCTS LIST */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-2">
                {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500">No products found</div>
                ) : (
                    filteredProducts.map((product) => {
                        const isPromotionActive =
                            product.promotionEnd && new Date(product.promotionEnd) >= new Date();
                        const displayPrice =
                            isPromotionActive && product.discount
                                ? product.price * (1 - product.discount / 100)
                                : product.price;

                        return (
                            <div
                                key={product._id}
                                className="border rounded-lg shadow-lg bg-white p-4 flex flex-col items-center text-center"
                            >
                                <Image
                                    src={product.image || '/default-image.png'}
                                    alt={product.name}
                                    width={80}
                                    height={80}
                                    className="mb-4 rounded-lg w-24 h-24 sm:w-32 sm:h-32 object-cover"
                                />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                                <div className="text-base font-medium text-gray-800 mb-2">
                                    {product.discount && isPromotionActive ? (
                                        <>
                                            <span className="line-through text-gray-500">${Number(product.price).toFixed(2)}</span>{" "}
                                            <span className="text-red-500">${Number(displayPrice).toFixed(2)}</span>
                                        </>
                                    ) : (
                                        <span>${Number(displayPrice).toFixed(2)}</span>
                                    )}
                                </div>
                                {product.quantityOffers && product.quantityOffers.length > 0 && (
                                    <div className="text-sm text-gray-600 mb-2">
                                        {product.quantityOffers.map((offer, index) => (
                                            <div key={index}>
                                                Offer: Buy {offer.quantity} or more for ${Number(offer.price).toFixed(2)} each
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="text-sm text-gray-600 mb-2">
                                    Stock: {product.stockQuantity || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                    Weight: {product.weight} {product.unit}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">{product.description}</div>
                                {product.promotionEnd && (
                                    <div className="text-sm text-gray-600 mb-4">
                                        Promotion ends: {(new Date(product.promotionEnd)).toLocaleDateString()}
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row sm:space-x-2 w-full">
                                    <button
                                        className="flex-1 flex items-center justify-center bg-gray-600 hover:bg-black text-white font-bold py-2 px-4 rounded-lg text-sm"
                                        onClick={() => handleEditProduct(product)}
                                    >
                                        <EditIcon className="w-5 h-5 mr-2" /> Edit
                                    </button>
                                    <button
                                        className="flex-1 flex items-center justify-center bg-gray-600 hover:bg-black text-white font-bold py-2 px-4 rounded-lg text-sm mt-2 sm:mt-0"
                                        onClick={() => handleDeleteProduct(product._id)}
                                    >
                                        <Trash2Icon className="w-5 h-5 mr-2" /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODAL */}
            <CreateProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingProduct={editingProduct}
            />
        </div>

    );
};

export default Products;
