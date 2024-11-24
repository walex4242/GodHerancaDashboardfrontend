"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector, RootState } from './redux';
import Header from "../app/components/Header";
import Sidebar from "../app/components/Sidebar";

const ClientSideLayout = ({ children }: { children: React.ReactNode }) => {
    const isSidebarCollapsed = useAppSelector((state: RootState) => state.global.isSidebarCollapsed);
    const isDarkMode = useAppSelector((state: RootState) => state.global.isDarkMode);
    const [mounted, setMounted] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Apply or remove the dark class based on theme state
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    if (!mounted) return <div>Loading...</div>;

    return (
        <div
            className={`flex min-h-screen ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
        >
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0 transition-transform duration-300 ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}>
                <Sidebar />
            </div>

            {/* Overlay for mobile sidebar */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></div>
            )}

            <main
                className={`flex flex-col w-full h-full py-4 px-4  sm:px-6 md:px-9 transition-all ${isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
                    }`}
            >
                <Header>
                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            />
                        </svg>
                    </button>
                </Header>
                {children}
            </main>
        </div>
    );
};

const ClientSideWrapper = ({ children }: { children: React.ReactNode }) => {
    return <ClientSideLayout>{children}</ClientSideLayout>;
};

export default ClientSideWrapper;
