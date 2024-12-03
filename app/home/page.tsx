"use client"
import Image from 'next/image';
import { useLogin } from '../context/LoginContext'; // Adjust the import path accordingly

const HomePage: React.FC = () => {
    const { isAuthenticated } = useLogin();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-white">
            <div className="text-center max-w-4xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
                    Bem-vindo ao Painel do Supermercado
                </h1>
                <p className="mt-4 text-lg leading-6 text-gray-600 sm:text-xl">
                    Gerencie os produtos do seu supermercado, monitore as vendas e fique à frente da concorrência com nossa solução multifuncional.
                </p>
            </div>

            <div className="mt-8 flex justify-center">
                <Image
                    src="/godheranca.png"
                    alt="Supermarket Dashboard"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-lg h-auto w-auto"
                    priority={true}
                />
            </div>

            <div className="mt-10 text-center">
                <p className="text-md text-gray-600 sm:text-lg">
                    Adicione produtos, monitore o estoque e analise tendências de vendas com facilidade, tudo em um só lugar.
                </p>
                {!isAuthenticated && (
                    <a
                        href="/signup"
                        className="mt-6 inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-700 hover:bg-black-400"
                    >
                        Comece
                    </a>
                )}
            </div>
        </div>
    );
};

export default HomePage;
