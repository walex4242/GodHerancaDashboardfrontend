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

            <main
                className={`flex flex-col w-full h-full py-4 px-4  sm:px-6 md:px-9 transition-all ${isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
                    }`}
            >
                <Header />
                {children}
            </main>
            
        </div>
    );
};

const ClientSideWrapper = ({ children }: { children: React.ReactNode }) => {
    return <ClientSideLayout>{children}</ClientSideLayout>;
};

export default ClientSideWrapper;
