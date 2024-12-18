
"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector, RootState } from './redux';
import Header from "../app/components/Header";
import Sidebar from "../app/components/Sidebar";
import { Menu } from "lucide-react";

const ClientSideLayout = ({ children }: { children: React.ReactNode }) => {
    const isSidebarCollapsed = useAppSelector((state: RootState) => state.global.isSidebarCollapsed);
    const isDarkMode = useAppSelector((state: RootState) => state.global.isDarkMode);
    const [mounted, setMounted] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div>Loading...</div>;

    const toggleSidebarVisibility = () => {
        setIsMobileSidebarOpen((prevState) => !prevState);
    };

    return (
        <div
            className={`flex min-h-screen ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
        >
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0`}
            >
                <Sidebar
                    isSidebarVisible={isMobileSidebarOpen}
                    toggleSidebarVisibility={toggleSidebarVisibility}
                />
            </div>

            <main
                className={`flex flex-col w-full h-full overflow-y-auto py-4 px-4 sm:px-6 md:px-9 transition-all ${isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
                    }`}
            >
                <Header>
                    <button
                        className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
                        onClick={toggleSidebarVisibility}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </Header>
                {children}
            </main>
        </div>
    );
};

export default ClientSideLayout;