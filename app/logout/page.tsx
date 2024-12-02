"use client"; // Ensure client-side execution
import { useRouter } from 'next/navigation'; // Correct import
import { useLogin } from '../context/LoginContext';
import Logout from './Logout';
import { useEffect } from 'react';

const LogoutPage: React.FC = () => {
    const { isAuthenticated, user } = useLogin();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) {
        return null; // You could render a loading indicator instead
    }

    return <Logout />;
};

export default LogoutPage;
