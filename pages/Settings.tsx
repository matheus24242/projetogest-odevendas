import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { UserProfile, UserRole } from '../types';
import { getUsers, getCurrentUserProfile } from '../services/mockApi';

const Settings: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [usersData, profileData] = await Promise.all([
                    getUsers(),
                    getCurrentUserProfile()
                ]);
                setUsers(usersData as UserProfile[]);
                if (profileData) {
                    setUserRole(profileData.role as UserRole);
                }
            } catch (error) {
                console.error("Failed to fetch user data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    
    if (loading) {
        return <div className="text-center p-8">Carregando configurações...</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Integrações de API</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 text-sm rounded-md bg-blue-500/10 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        <h3 className="font-bold">Atenção: Modo de Configuração Alterado</h3>
                        <p className="mt-2">
                            As credenciais de API para Shopee e Mercado Livre agora são configuradas diretamente no código-fonte para simplificar o processo.
                        </p>
                        <p className="mt-2">
                            Para alterar as chaves de API, por favor edite o arquivo: <code className="font-mono text-xs bg-muted p-1 rounded">services/mockApi.ts</code>.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Gestão de Usuários e Permissões</CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                        Abaixo estão os usuários do sistema e suas respectivas permissões. Apenas usuários com a função 'admin' podem alterar configurações críticas.
                     </p>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Usuário (Email)</th>
                                    <th scope="col" className="px-6 py-3">Função</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="bg-card border-b border-border">
                                        <td className="px-6 py-4 font-medium">{(user as any).email || user.id}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${user.role === UserRole.Admin ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;