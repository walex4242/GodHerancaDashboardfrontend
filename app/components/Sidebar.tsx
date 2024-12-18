"use client"
import { useAppSelector } from "../redux";
import {
    Archive,
    Clipboard,
    LucideIcon,
    Menu,
    SlidersHorizontal,
    User,
    ChartColumnStacked
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogin } from "../context/LoginContext"; // Import the useLogin hook

interface SidebarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    isCollapsed: boolean;
}

interface SidebarProps {
    isSidebarVisibled: boolean;
}
const SidebarLink = ({
    href,
    icon: Icon,
    label,
    isCollapsed,
}: SidebarLinkProps) => {
    const pathname = usePathname();
    const isActive =
        pathname === href || (pathname === "/" && href === "/home");

    return (
        <Link href={href}>
            <div
                className={`cursor-pointer flex items-center ${isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
                    } hover:text-gray-500 hover:bg-gray-300 gap-3 transition-colors ${isActive ? "bg-gray-200 text-white" : ""
                    }`}
            >
                <Icon className="w-6 h-6 !text-gray-700" />
                <span
                    className={`${isCollapsed ? "hidden" : "block"
                        } font-medium text-gray-700`}
                >
                    {label}
                </span>
            </div>
        </Link>
    );
};

const Sidebar = ({
    isSidebarVisible,
    toggleSidebarVisibility,
}: {
    isSidebarVisible: boolean;
    toggleSidebarVisibility: () => void;
}) => {
    const isSidebarCollapsed = useAppSelector(
        (state) => state.global.isSidebarCollapsed
    );
    const { isAuthenticated } = useLogin(); // Get the authentication state from LoginContext


    const sidebarClassNames = `fixed flex flex-col transform ${isSidebarCollapsed ? "w-16" : "w-64"} bg-white transition-transform duration-300 overflow-hidden h-full shadow-md z-40 ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`;


    return (
        <>
            {/* Overlay for small screens */}
            {isSidebarVisible && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-50 md:hidden"
                    onClick={toggleSidebarVisibility}
                ></div>
            )}

            <div className={sidebarClassNames}>
                <div
                    className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${isSidebarCollapsed ? "px-5" : "px-8"
                        }`}
                >
                    <Link href="/home">
                        <Image
                            src="/logo.svg"
                            alt="Godheranca"
                            width={27}
                            height={27}
                            className="rounded w-8"
                        />
                    </Link>
                    <Link href="/home">
                        {!isSidebarCollapsed && (
                            <h1 className="font-extrabold text-xl">GodHerança</h1>
                        )}
                    </Link>

                    <button
                        className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
                        onClick={toggleSidebarVisibility}
                    >
                        <Menu className="w-4 h-4" />
                    </button>
                </div>

                {isAuthenticated && (
                    <div className="flex-grow mt-8">
                        <SidebarLink
                            href="/inventory"
                            icon={Archive}
                            label="Inventário"
                            isCollapsed={isSidebarCollapsed}
                        />
                        <SidebarLink
                            href="/category"
                            icon={ChartColumnStacked}
                            label="Categoria"
                            isCollapsed={isSidebarCollapsed}
                        />
                        <SidebarLink
                            href="/products"
                            icon={Clipboard}
                            label="Produtos"
                            isCollapsed={isSidebarCollapsed}
                        />
                        <SidebarLink
                            href="/profile"
                            icon={User}
                            label="Perfil"
                            isCollapsed={isSidebarCollapsed}
                        />
                        <SidebarLink
                            href="/settings"
                            icon={SlidersHorizontal}
                            label="Configurações"
                            isCollapsed={isSidebarCollapsed}
                        />
                    </div>
                )}

                {!isSidebarCollapsed && (
                    <div className="mb-10">
                        <p className="text-center text-xs text-gray-500">
                            &copy; 2024 GodHeranca
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;