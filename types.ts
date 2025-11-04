import type { ComponentType } from 'react';

export enum UserRole {
    Admin = 'admin',
    Operator = 'operador',
}

export interface UserProfile {
    id: string;
    name: string;
    role: UserRole;
}

export enum Platform {
    Shopee = 'Shopee',
    MercadoLivre = 'Mercado Livre',
}

export enum OrderStatus {
    Pendente = 'Pendente',
    Pago = 'Pago',
    Enviado = 'Enviado',
    Concluido = 'Concluído',
    Cancelado = 'Cancelado'
}

export enum PaymentMethod {
    Boleto = 'Boleto',
    Pix = 'Pix',
    Cartao = 'Cartão de Crédito',
}

export interface Order {
    id: string;
    platform: Platform;
    order_number: string;
    customer_id: string;
    customers: { name: string }; // For joined data
    total_value: number;
    status: OrderStatus;
    payment_method: PaymentMethod;
    created_at: string;
    order_items: OrderItem[];
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    image_url: string;
    created_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    products: Product;
    quantity: number;
    unit_price: number;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    created_at: string;
    orders: Order[];
}

export interface Settings {
    id: number;
    shopee_token: string;
    meli_access_token: string;
    meli_seller_id: string;
    updated_at: string;
}

export type Page = 'dashboard' | 'orders' | 'products' | 'customers' | 'settings';

export interface NavItem {
    id: Page;
    label: string;
    icon: ComponentType<{ className?: string }>;
}