import { useDispatch } from 'react-redux';
import { clearUser } from '../state/authSlice';
import { useRouter } from 'next/router';
import { useItem } from '../context/ItemContext';

const Logout = () => {
    const dispatch = useDispatch();
    const router = useRouter();
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
            router.push('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-black-700 light">
            Logout
        </button>
    );
};

export default Logout;
