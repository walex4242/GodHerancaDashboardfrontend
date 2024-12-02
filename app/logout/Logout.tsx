"use client"; // Ensure client-side execution
import { useDispatch } from 'react-redux';
import { clearUser } from '../state/authSlice';
import { useItem } from '../context/ItemContext';

const Logout = () => {
    const dispatch = useDispatch();
    const { clearItems } = useItem();

    const handleLogout = async () => {
        try {
            console.log('Clearing items...');
            clearItems();
            console.log('Items cleared, clearing user...');
            dispatch(clearUser());
            console.log('User cleared, clearing token...');
            document.cookie = 'token=; Max-Age=0; path=/';
            localStorage.removeItem('token');
            console.log('Redirecting to login...');
            window.location.href = '/login'; // Use window.location as fallback
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-black">
            Sair
        </button>
    );
};

export default Logout;
