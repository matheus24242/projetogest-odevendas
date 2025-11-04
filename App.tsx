
import React, { useState, useEffect } from 'react';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import LoginPage from './pages/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import { Page } from './types';
import { supabase } from './services/mockApi';
import type { Session } from '@supabase/supabase-js';

const AppContent: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const { theme } = React.useContext(ThemeContext);

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
    }, [theme]);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);
    
    const renderPage = () => {
        switch (activePage) {
            case 'dashboard':
                return <Dashboard />;
            case 'orders':
                return <Orders />;
            case 'products':
                return <Products />;
            case 'customers':
                return <Customers />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard />;
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    if (!session) {
        return <LoginPage />;
    }

    return (
        <div className="flex h-screen bg-secondary/50">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header user={session.user} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
};

export default App;