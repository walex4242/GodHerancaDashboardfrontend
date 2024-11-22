import { useDispatch } from 'react-redux';
import { clearUser } from '../state/authSlice';
import { useRouter } from 'next/router';

const Logout = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            dispatch(clearUser());
            router.push('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-black-700">
            Logout
        </button>
    );
};

export default Logout;
