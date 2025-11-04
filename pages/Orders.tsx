import React, { useEffect, useState, useCallback } from 'react';
import { getOrders, syncMercadoLivreOrders } from '../services/mockApi';
import { Order, OrderStatus, Platform } from '../types';
import { Card } from '../components/ui/Card';
import { ShopeeIcon, MercadoLivreIcon } from '../components/icons';

const getStatusClass = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.Concluido: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case OrderStatus.Enviado: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case OrderStatus.Pago: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case OrderStatus.Pendente: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case OrderStatus.Cancelado: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        default: return 'bg-gray-200 text-gray-800';
    }
};

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterPlatform, setFilterPlatform] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getOrders({ platform: filterPlatform, status: filterStatus });
            setOrders(result as Order[]);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    }, [filterPlatform, filterStatus]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSync = async () => {
        setSyncing(true);
        setSyncMessage(null);
        try {
            const result = await syncMercadoLivreOrders();
            setSyncMessage(`${result.synced} pedidos do Mercado Livre foram sincronizados com sucesso! A lista será atualizada.`);
            fetchData(); // Refresh the list of orders
        } catch (error: any) {
            setSyncMessage(`Erro na sincronização: ${error.message}`);
        } finally {
            setSyncing(false);
            setTimeout(() => setSyncMessage(null), 5000); // Clear message after 5 seconds
        }
    };
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                 <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
                 <button 
                    onClick={handleSync}
                    disabled={syncing}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    {syncing ? 'Sincronizando...' : 'Sincronizar Pedidos do Mercado Livre'}
                </button>
            </div>
             {syncMessage && (
                <div className={`p-4 text-sm rounded-md ${syncMessage.startsWith('Erro') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {syncMessage}
                </div>
            )}
            <Card>
                <div className="p-4 border-b border-border flex items-center space-x-4">
                    <select
                        value={filterPlatform}
                        onChange={(e) => setFilterPlatform(e.target.value)}
                        className="bg-card border border-input rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">Todas as Plataformas</option>
                        <option value={Platform.Shopee}>Shopee</option>
                        <option value={Platform.MercadoLivre}>Mercado Livre</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-card border border-input rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">Todos os Status</option>
                        {Object.values(OrderStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3">Pedido</th>
                                <th scope="col" className="px-6 py-3">Plataforma</th>
                                <th scope="col" className="px-6 py-3">Cliente</th>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Valor</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-8">Carregando pedidos...</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="bg-card border-b border-border hover:bg-accent">
                                        <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">#{order.order_number}</td>
                                        <td className="px-6 py-4">
                                            {order.platform === Platform.Shopee ? 
                                                <ShopeeIcon className="w-6 h-6"/> : <MercadoLivreIcon className="w-6 h-6"/>}
                                        </td>
                                        <td className="px-6 py-4">{order.customers?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{formatDate(order.created_at)}</td>
                                        <td className="px-6 py-4 font-semibold">{formatCurrency(order.total_value)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Orders;