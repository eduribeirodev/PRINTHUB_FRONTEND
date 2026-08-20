import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import  api  from '../services/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Opcional: chamada do csrf do sanctum se estiver usando autenticação via session/cookie
      await api.get('/sanctum/csrf-cookie');

      // 2. Envia a requisição de login para o back-end Laravel
      const response = await api.post('/login', { email, password });

      // 3. Se o back-end retornar um token, você pode salvá-lo
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      // 4. Recarrega ou redireciona para a dashboard
      window.location.href = '/dashboard'; 
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md p-8 shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">PrintHub - Entrar</h1>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            style={{ backgroundColor: '#4C00FF' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  );
}