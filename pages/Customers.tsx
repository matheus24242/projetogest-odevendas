
import React, { useEffect, useState } from 'react';
import { getCustomers, getCustomersDashboardData } from '../services/mockApi';
import { Customer, PaymentMethod } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CustomersIcon, OrdersIcon, CheckCircleIcon, XCircleIcon, CreditCardIcon, BarcodeIcon, PixIcon } from '../components/icons';

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customersResult, dashboardResult] = await Promise.all([
                    getCustomers(),
                    getCustomersDashboardData()
                ]);
                setCustomers(customersResult as Customer[]);
                setDashboardData(dashboardResult);
            } catch (error) {
                console.error("Failed to fetch customers data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const renderDashboard = () => {
        if (!dashboardData) return null;

        return (
            <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total de Clientes</CardTitle>
                            <CustomersIcon className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.totalCustomers}</div>
                            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total de Compras</CardTitle>
                            <OrdersIcon className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
                            <p className="text-xs text-muted-foreground">Pedidos realizados</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Compras Sucedidas</CardTitle>
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.successfulOrders}</div>
                            <p className="text-xs text-muted-foreground">Pagamentos confirmados</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Compras com Falha</CardTitle>
                            <XCircleIcon className="h-5 w-5 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.failedOrders}</div>
                            <p className="text-xs text-muted-foreground">Pedidos cancelados</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Compras por Método de Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center space-x-4">
                            <CreditCardIcon className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-muted-foreground">Cartão de Crédito</p>
                                <p className="text-xl font-bold">{dashboardData.paymentMethods[PaymentMethod.Cartao] || 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <BarcodeIcon className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-muted-foreground">Boleto</p>
                                <p className="text-xl font-bold">{dashboardData.paymentMethods[PaymentMethod.Boleto] || 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <PixIcon className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-muted-foreground">Pix</p>
                                <p className="text-xl font-bold">{dashboardData.paymentMethods[PaymentMethod.Pix] || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            </div>
            
            {loading ? <div className="text-center p-8">Carregando dados dos clientes...</div> : (
                <>
                    {renderDashboard()}
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nome</th>
                                        <th scope="col" className="px-6 py-3">Email</th>
                                        <th scope="col" className="px-6 py-3">Telefone</th>
                                        <th scope="col" className="px-6 py-3">Pedidos</th>
                                        <th scope="col" className="px-6 py-3">Cliente Desde</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map(customer => (
                                        <tr key={customer.id} className="bg-card border-b border-border hover:bg-accent">
                                            <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">{customer.name}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{customer.email}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{customer.phone}</td>
                                            <td className="px-6 py-4 text-center">{customer.orders.length}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{formatDate(customer.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Customers;