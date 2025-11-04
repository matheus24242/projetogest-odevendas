
import React, { useContext, useState, useRef, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { SunIcon, MoonIcon, LogoutIcon } from './icons';
import { supabase } from '../services/mockApi';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
    user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="flex items-center justify-between h-20 px-4 md:px-8 bg-card border-b border-border">
            <div className="flex items-center">
                 <h2 className="text-xl font-semibold text-foreground">Bem-vindo!</h2>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
                        <img
                            src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.id}`}
                            alt="User avatar"
                            className="w-10 h-10 rounded-full bg-secondary"
                        />
                         <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-foreground">{user.email?.split('@')[0]}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-10">
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-accent"
                            >
                                <LogoutIcon className="w-4 h-4 mr-2" />
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;