import { createClient } from '@supabase/supabase-js';
import { OrderStatus, PaymentMethod, Platform, Settings } from '../types';

const supabaseUrl = 'https://fsqszjpvaytleyibxzoz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzcXN6anB2YXl0bGV5aWJ4em96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjEwMTQsImV4cCI6MjA3Njc5NzAxNH0.8rW9uq2i64KbfhQElH3DopIhpxSqG__shgFpPgdtRhA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Products
export const getProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

// Customers
export const getCustomers = async () => {
    const { data, error } = await supabase.from('customers').select('*, orders(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

// Orders
export const getOrders = async (filters: { platform: string, status: string }) => {
    let query = supabase.from('orders').select('*, customers(name)').order('created_at', { ascending: false });

    if (filters.platform !== 'all') {
        query = query.eq('platform', filters.platform);
    }
    if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

// Dashboard
export const getDashboardData = async () => {
    const { data: orders, error: ordersError } = await supabase.from('orders').select('total_value, platform, created_at');
    if (ordersError) throw ordersError;
    
    const { count: totalCustomers, error: customersError } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    if (customersError) throw customersError;

    const totalRevenue = orders.reduce((sum, order) => sum + order.total_value, 0);
    const totalOrders = orders.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const salesByPlatform = orders.reduce((acc, order) => {
        acc[order.platform] = (acc[order.platform] || 0) + order.total_value;
        return acc;
    }, {} as Record<Platform, number>);

    const monthlySalesData = orders.reduce((acc, order) => {
        const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
        const existing = acc.find(d => d.name === month);
        if (existing) {
            existing.vendas += order.total_value;
        } else {
            acc.push({ name: month, vendas: order.total_value });
        }
        return acc;
    }, [] as { name: string; vendas: number }[]).reverse();

    return {
        stats: {
            totalRevenue,
            totalOrders,
            totalCustomers: totalCustomers ?? 0,
            avgTicket,
        },
        salesByPlatform,
        monthlySalesData
    };
};

// Customers Dashboard
export const getCustomersDashboardData = async () => {
    const { data: orders, error: ordersError } = await supabase.from('orders').select('status, payment_method');
    if (ordersError) throw ordersError;

    const { count: totalCustomers, error: customersError } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    if(customersError) throw customersError;

    const successfulOrders = orders.filter(o => 
        o.status === OrderStatus.Concluido || 
        o.status === OrderStatus.Enviado || 
        o.status === OrderStatus.Pago
    ).length;

    const failedOrders = orders.filter(o => o.status === OrderStatus.Cancelado).length;

    const paymentMethods = orders.reduce((acc, order) => {
        acc[order.payment_method] = (acc[order.payment_method] || 0) + 1;
        return acc;
    }, {} as Record<PaymentMethod, number>);

    return {
        totalCustomers: totalCustomers ?? 0,
        totalOrders: orders.length,
        successfulOrders,
        failedOrders,
        paymentMethods
    };
};

// Settings
export const getSettings = async () => {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (error) throw error;
    return data;
};

export const updateSettings = async (settings: Partial<Settings>) => {
    const { data, error } = await supabase.from('settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('id', 1).select();
    if (error) throw error;
    return data;
};

export const getUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data;
};

export const getCurrentUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();
    
    if (error) {
        // It's possible a user exists in auth but not in the public users table yet
        console.error("Error fetching user profile:", error.message);
        return null;
    }

    return data;
};


export const syncMercadoLivreOrders = async () => {
    // --- CREDENCIAIS DA APLICAÇÃO (ID do Aplicativo e Chave Secreta) ---
    // Estes são os valores que você me forneceu.
    const meli_app_id = '3108943639564569';
    const meli_secret_key = 'dIqnc55gd8rMmRb6IXzxnQA068cd7YBb';
    // ---------------------------------------------------------------

    // --- DADOS NECESSÁRIOS PARA A API ---
    // ATENÇÃO: A API de pedidos precisa de um "Access Token" e do seu "Seller ID" (ID de Vendedor).
    // As credenciais acima são usadas para GERAR o Access Token, mas não são a mesma coisa.
    // A sincronização só funcionará com os dados corretos.

    // 1. Access Token: Precisa ser gerado no painel do Mercado Livre. A "Chave Secreta" NÃO é o Access Token.
    const meli_access_token = meli_secret_key; // <-- SUBSTITUA pelo seu Access Token real.

    // 2. Seller ID: É o seu ID de VENDEDOR. O "ID do Aplicativo" NÃO é o Seller ID.
    const meli_seller_id = meli_app_id; // <-- SUBSTITUA pelo seu Seller ID real.
    // --------------------------------------------------------------------

    if (!meli_access_token || !meli_seller_id) {
        throw new Error('Credenciais do Mercado Livre não configuradas no código. Edite o arquivo services/mockApi.ts.');
    }
    
    // PROXY PARA CONTORNAR O CORS
    // O proxy anterior estava instável. Este novo deve resolver o erro "Failed to fetch".
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = `https://api.mercadolibre.com/orders/search?seller=${meli_seller_id}&sort=date_desc`;

    const response = await fetch(`${proxyUrl}${encodeURIComponent(apiUrl)}`, {
        headers: {
            'Authorization': `Bearer ${meli_access_token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('ML API Error:', errorData);
        throw new Error(`Erro ao buscar pedidos do Mercado Livre: ${errorData.message || 'Verifique as credenciais e tente novamente.'}`);
    }

    const data = await response.json();
    const ordersFromML = data.results || [];

    if (ordersFromML.length === 0) {
        return { synced: 0 };
    }
    
    const mappedCustomers = ordersFromML.map((order: any) => ({
        id: order.buyer.id.toString(),
        name: order.buyer.nickname,
        email: order.buyer.email,
        phone: order.buyer.phone?.number || 'N/A',
        address: 'N/A', 
    }));
    
    const { error: customerError } = await supabase.from('customers').upsert(mappedCustomers, { onConflict: 'id' });
    if (customerError) {
        console.error("Error upserting customers:", customerError);
        throw new Error('Falha ao sincronizar clientes.');
    }

    const mappedOrders = ordersFromML.map((order: any) => ({
        order_number: order.id.toString(),
        platform: Platform.MercadoLivre,
        customer_id: order.buyer.id.toString(),
        total_value: order.total_amount,
        status: order.status === 'paid' ? OrderStatus.Pago : order.status === 'shipped' ? OrderStatus.Enviado : OrderStatus.Pendente,
        payment_method: PaymentMethod.Cartao, 
        created_at: order.date_created,
    }));
    
    const { error: orderError } = await supabase.from('orders').upsert(mappedOrders, { onConflict: 'order_number, platform' });

    if (orderError) {
        console.error("Error upserting orders:", orderError);
        if(orderError.message.includes('constraint')) {
             throw new Error('Falha ao sincronizar pedidos. Verifique se a tabela "orders" possui uma chave única combinando "order_number" e "platform".');
        }
        throw new Error('Falha ao sincronizar pedidos.');
    }

    return { synced: mappedOrders.length };
};