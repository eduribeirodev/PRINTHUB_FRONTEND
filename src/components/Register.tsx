import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Box, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import api from '../services/api';

interface RegisterProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
  onNavigateToTerms: () => void;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export function Register({ onRegister, onNavigateToLogin, onNavigateToTerms }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({ defaultValues: { terms: false } });
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setRequestError('');
    try {
      const response = await api.post('/register', { name: data.name, email: data.email, password: data.password, password_confirmation: data.confirmPassword });
      if (!response.data.token) throw new Error('Resposta de autenticação inválida.');
      localStorage.setItem('PrintHub_token', response.data.token);
      onRegister();
    } catch (error: any) {
      console.error('Erro no registro:', error);
      setRequestError(error.response?.data?.message || 'Erro ao registrar usuário. Verifique os dados.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4C00FF] to-[#7C3AED] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="h-full w-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} /></div>
        <div className="relative z-10 w-full max-w-md">
          <div className="relative mx-auto" style={{ width: '300px', height: '300px' }}>
            {Array.from({ length: 8 }, (_, index) => <div key={index} className="absolute left-1/2 -translate-x-1/2 bg-white/20 rounded-sm" style={{ bottom: `${index * 30}px`, width: `${280 - index * 20}px`, height: '4px', animation: `registerFadeInUp 0.8s ease-out ${index * 0.1}s backwards` }} />)}
            <div className="absolute top-0 right-0 w-20 h-20 border-2 border-white/30 rotate-45" style={{ animation: 'registerFloat 3s ease-in-out infinite' }} />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-2 border-white/30 -rotate-12" style={{ animation: 'registerFloatAlt 4s ease-in-out infinite 0.5s' }} />
          </div>
          <div className="text-center mt-12"><h2 className="text-white mb-2 text-5xl leading-none">PrintHub</h2><p className="text-white/80 text-lg">Gerenciamento inteligente de impressão 3D</p></div>
        </div>
        <style>{`@keyframes registerFadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } } @keyframes registerFloat { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-20px) rotate(45deg); } } @keyframes registerFloatAlt { 0%, 100% { transform: translateY(0) rotate(-12deg); } 50% { transform: translateY(-20px) rotate(-12deg); } }`}</style>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8"><div className="flex items-center justify-center gap-3 mb-6"><Box className="w-10 h-10 text-[#4C00FF]" /><h1 className="text-[#4C00FF] m-0 text-2xl font-semibold">PrintHub</h1></div><h2 className="text-center text-2xl font-semibold">Crie sua Conta</h2></div>
          {requestError && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{requestError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field label="Nome completo" id="name" icon={<User className="field-icon" />} error={errors.name?.message}><Input id="name" placeholder="Seu nome completo" className="pl-10" {...register('name', { required: 'Informe seu nome.' })} /></Field>
            <Field label="E-mail" id="email" icon={<Mail className="field-icon" />} error={errors.email?.message}><Input id="email" type="email" placeholder="seu@email.com" className="pl-10" {...register('email', { required: 'Informe seu e-mail.' })} /></Field>
            <Field label="Senha" id="password" icon={<Lock className="field-icon" />} error={errors.password?.message}><Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10" {...register('password', { required: 'Informe uma senha.', minLength: { value: 8, message: 'A senha deve ter ao menos 8 caracteres.' } })} /><VisibilityButton shown={showPassword} toggle={() => setShowPassword((value) => !value)} /></Field>
            <Field label="Confirmar senha" id="confirmPassword" icon={<Lock className="field-icon" />} error={errors.confirmPassword?.message}><Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10" {...register('confirmPassword', { required: 'Confirme sua senha.', validate: (value) => value === password || 'As senhas não coincidem.' })} /><VisibilityButton shown={showConfirmPassword} toggle={() => setShowConfirmPassword((value) => !value)} /></Field>
            <div><div className="flex items-start gap-3"><Controller name="terms" control={control} rules={{ validate: (value) => value || 'Você precisa aceitar os termos.' }} render={({ field }) => <Checkbox id="terms" className="mt-1" checked={field.value} onCheckedChange={field.onChange} />} /><label htmlFor="terms" className="text-[#6B7280] cursor-pointer">Eu li e aceito os{' '}<button type="button" onClick={onNavigateToTerms} className="text-[#4C00FF] hover:underline underline">Termos de Uso</button></label></div>{errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>}</div>
            <Button type="submit" className="w-full" style={{ backgroundColor: '#4C00FF' }} disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
            <p className="text-center text-[#6B7280]">Já tem uma conta?{' '}<button type="button" onClick={onNavigateToLogin} className="text-[#4C00FF] hover:underline">Faça login</button></p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, icon, error, children }: { label: string; id: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] [&>svg]:h-5 [&>svg]:w-5">{icon}</span>{children}</div>{error && <p className="text-sm text-red-600">{error}</p>}</div>;
}

function VisibilityButton({ shown, toggle }: { shown: boolean; toggle: () => void }) {
  return <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1E1E1E]" aria-label={shown ? 'Ocultar senha' : 'Mostrar senha'}>{shown ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>;
}
