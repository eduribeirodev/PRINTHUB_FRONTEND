import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import api from '../services/api';

interface LoginProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
}

interface LoginFormData { email: string; password: string; }

export function Login({ onLogin, onNavigateToRegister }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setLoginError('');
    try {
      const response = await api.post('/login', data);
      if (!response.data.token) throw new Error('Resposta de autenticação inválida.');
      localStorage.setItem('PrintHub_token', response.data.token);
      onLogin();
    } catch (error) {
      console.error('Erro no login:', error);
      setLoginError('E-mail ou senha inválidos.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4C00FF] to-[#7C3AED] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="h-full w-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} /></div>
        <div className="relative z-10 w-full max-w-md">
          <div className="relative mx-auto" style={{ width: '300px', height: '300px' }}>
            {Array.from({ length: 8 }, (_, index) => <div key={index} className="absolute left-1/2 -translate-x-1/2 bg-white/20 rounded-sm" style={{ bottom: `${index * 30}px`, width: `${280 - index * 20}px`, height: '4px', animation: `fadeInUp 0.8s ease-out ${index * 0.1}s backwards` }} />)}
            <div className="absolute top-0 right-0 w-20 h-20 border-2 border-white/30 rotate-45" style={{ animation: 'float 3s ease-in-out infinite' }} />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-2 border-white/30 -rotate-12" style={{ animation: 'float-alt 4s ease-in-out infinite 0.5s' }} />
          </div>
          <div className="text-center mt-12"><h2 className="text-white mb-2 text-5xl leading-none">PrintHub</h2><p className="text-white/80 text-lg">Gerenciamento inteligente de impressão 3D</p></div>
        </div>
        <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } } @keyframes float { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-20px) rotate(45deg); } } @keyframes float-alt { 0%, 100% { transform: translateY(0) rotate(-12deg); } 50% { transform: translateY(-20px) rotate(-12deg); } }`}</style>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8"><div className="flex items-center justify-center gap-3 mb-6"><Box className="w-10 h-10 text-[#4C00FF]" /><h1 className="text-[#4C00FF] m-0 text-2xl font-semibold">PrintHub</h1></div><h2 className="text-center text-2xl font-semibold">Acesse sua Conta</h2></div>
          {loginError && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{loginError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2"><Label htmlFor="email">E-mail</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" /><Input id="email" type="email" placeholder="seu@email.com" className="pl-10" {...register('email', { required: 'Informe seu e-mail.' })} /></div>{errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="password">Senha</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" /><Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10" {...register('password', { required: 'Informe sua senha.' })} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1E1E1E]" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>{errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}</div>
            <Button type="submit" className="w-full" style={{ backgroundColor: '#4C00FF' }} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
            <p className="text-center text-[#6B7280]">Ainda não tem conta?{' '}<button type="button" onClick={onNavigateToRegister} className="text-[#4C00FF] hover:underline">Cadastre-se aqui</button></p>
          </form>
        </div>
      </div>
    </div>
  );
}
