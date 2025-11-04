import React from 'react';
import { Page, NavItem } from '../types';
import { DashboardIcon, OrdersIcon, ProductsIcon, CustomersIcon, SettingsIcon, LogoIcon } from './icons';

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'orders', label: 'Pedidos', icon: OrdersIcon },
    { id: 'products', label: 'Produtos', icon: ProductsIcon },
    { id: 'customers', label: 'Clientes', icon: CustomersIcon },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
];

interface SidebarProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
    return (
        <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
            <div className="flex items-center justify-center h-20 border-b border-border">
                <LogoIcon className="h-8 w-8 text-primary"/>
                <h1 className="ml-2 text-xl font-bold text-foreground">SyncSell Hub</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activePage === item.id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;