
import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/mockApi';
import { Product } from '../types';
import { Card } from '../components/ui/Card';

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getProducts();
                setProducts(result);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getStockClass = (stock: number) => {
        if (stock < 10) return 'text-red-500 font-bold';
        if (stock < 50) return 'text-yellow-500 font-bold';
        return 'text-green-500 font-bold';
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Produtos e Estoque</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3">Produto</th>
                                <th scope="col" className="px-6 py-3">SKU</th>
                                <th scope="col" className="px-6 py-3">Preço</th>
                                <th scope="col" className="px-6 py-3">Estoque</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-8">Carregando produtos...</td></tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id} className="bg-card border-b border-border hover:bg-accent">
                                        <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <img src={product.image_url || 'https://placehold.co/40x40'} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                                <span>{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{product.sku}</td>
                                        <td className="px-6 py-4 font-semibold">{formatCurrency(product.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={getStockClass(product.stock)}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="font-medium text-primary hover:underline">Editar</button>
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

export default Products;