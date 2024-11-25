import { useAppDispatch, useAppSelector, RootState } from "../redux";
import { useState, useEffect } from "react";
import { setIsSidebarCollapsed, setIsDarkMode } from "../state";
import { Menu, Moon, Sun } from "lucide-react";
import { FaCog, FaSearch, FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useLogin } from "../context/LoginContext";

interface HeaderProps {
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const isSidebarCollapsed = useAppSelector(
        (state: RootState) => state.global.isSidebarCollapsed
    );

    const [isMounted, setIsMounted] = useState(false);
    const { isAuthenticated, logout, user } = useLogin();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const toggleSidebar = () => {
        dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

    if (!isMounted) return null;

    return (
        <div className="flex justify-between items-center w-full mb-4 p-3 bg-white dark:bg-gray-900 shadow-sm ">
            {/* Left Section */}
            <div className="flex items-center gap-5 pr-2">
                <button
                    className="px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 hidden md:block "
                    onClick={toggleSidebar}
                >
                    <Menu className="w-5 h-5 text-black dark:text-white " />
                </button>
                <div className="relative w-full max-w-xs md:max-w-sm">
                    <input
                        type="search"
                        placeholder="Search groups & products"
                        className="pl-10 pr-4 py-2 w-full border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-500 dark:text-gray-300" size={20} />
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex justify-end items-center gap-5 ml-auto ">
                <div className="relative">
                    <button onClick={toggleDropdown} className="flex items-center gap-2 cursor-pointer">
                        {isAuthenticated && user ? (
                            <div className="relative w-20 h-20 rounded-full overflow-hidden"
                                style={{ width: "40px", height: "40px" }}>
                                <Image
                                    src={user.profilePicture || "/default-profile.png"}
                                    alt="Profile"
                                    fill
                                    className=" object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                        ) : (
                            <FaUserCircle size={30} className="text-gray-500 dark:text-gray-300" />
                        )}
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0  mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={closeDropdown}
                                    >
                                        View Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            closeDropdown();
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            onClick={closeDropdown}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/signup"
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={closeDropdown}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {isAuthenticated && (
                    <Link href="/settings">
                        <FaCog size={30} className="text-2xl cursor-pointer text-gray-500 dark:text-gray-300" title="Settings" />
                    </Link>
                )}
            </div>

            {/* Injected Children */}
            {children && <div className="ml-4">{children}</div>}
        </div>
    );
};

export default Header;
