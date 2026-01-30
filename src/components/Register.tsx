import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { User, Mail, Lock, Eye, EyeOff, Box } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
  password_confirmation: string;
}

export function Register({ onRegister, onNavigateToLogin}: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showpassword_confirmation, setShowpassword_confirmation] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    console.log(data);
    setApiError(null);
    setLoading(true);

    try{
      const response = await api.post('register', data);

      const { token, user } = response.data;
      localStorage.setItem('PrintHub_token', token);
      localStorage.setItem('PrintHub_user', JSON.stringify(user));

      onRegister();
    }catch (error: any) {
      if (error.response){
        if (error.response.status === 401 || error.response.status === 422) {
          setApiError('Dados inválidos');
        }else {
          setApiError('erro ao realizar registro. Tente novament');
        }
      } else {
        setApiError('Erro de conexão com o servidor');
      }
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - 3D Printing Theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4C00FF] to-[#7C3AED] items-center justify-center p-12 relative overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* 3D Printing Layers Animation */}
        <div className="relative z-10 w-full max-w-md">
          {/* Central Cube Structure */}
          <div className="relative mx-auto" style={{ width: '300px', height: '300px' }}>
            {/* Animated Layers */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 transform -translate-x-1/2 bg-white/20 rounded-sm"
                style={{
                  bottom: `${i * 30}px`,
                  width: `${280 - i * 20}px`,
                  height: '4px',
                  animation: `fadeInUp 0.8s ease-out ${i * 0.1}s backwards`,
                }}
              ></div>
            ))}
            
            {/* Wireframe Cubes */}
            <div className="absolute top-0 right-0 w-20 h-20 border-2 border-white/30 transform rotate-45" style={{ animation: 'float 3s ease-in-out infinite' }}></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-2 border-white/30 transform -rotate-12" style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}></div>
          </div>

          {/* Text */}
          <div className="text-center mt-12">
            <h2 className="text-white mb-2" style={{ fontSize: '3rem', lineHeight: '1' }}>PrintHub</h2>
            <p className="text-white/80 text-lg">Gerenciamento inteligente de impressão 3D</p>
          </div>
        </div>

        {/* Animation Keyframes */}
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0) rotate(45deg);
            }
            50% {
              transform: translateY(-20px) rotate(45deg);
            }
          }
        `}</style>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Box className="w-10 h-10 text-[#4C00FF]" />
              <h1 className="text-[#4C00FF] m-0 text-2xl text-semibold">PrintHub</h1>
            </div>
            <div className="text-center mb-2">
            </div>
            <h2 className="text-center">Crie sua Conta</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  className="pl-10"
                  {...register('name')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] hover:text-[#1E1E1E]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <Input
                  id="password_confirmation"
                  type={showpassword_confirmation ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password_confirmation')}
                />
                <button
                  type="button"
                  onClick={() => setShowpassword_confirmation(!showpassword_confirmation)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] hover:text-[#1E1E1E]"
                >
                  {showpassword_confirmation ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="terms" 
                  className="mt-1"
                  {...register('terms')}
                />
                <label htmlFor="terms" className="text-[#6B7280] cursor-pointer">
                  Eu li e aceito os{' '}
                  <button
                    type="button"
                    onClick={onNavigateToTerms}
                    className="text-[#4C00FF] hover:underline underline"
                  >
                    Termos de Uso
                  </button>
                </label>
              </div>
            </div> */}

            {apiError && (
              <div className="px-4 py-3 text-sm font-medium text-center text-red-500 rounded-lg bg-red-500/10">
                {apiError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              style={{ backgroundColor: '#4C00FF' }}
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Cadastrar'}
            </Button>

            <p className="text-center text-[#6B7280]">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-[#4C00FF] hover:underline"
              >
                Faça login
              </button>
            </p>
          </form>

          {/* Credenciais de Teste */}
          <div className="mt-8 p-4 bg-[#F4F7FC] border-2 border-[#4C00FF]/20 rounded-lg">
            <p className="text-center text-sm mb-2" style={{ fontWeight: '600', color: '#4C00FF' }}>
              Credenciais de Teste
            </p>
            <div className="space-y-1 text-sm text-[#6B7280]">
              <p><strong>Para testar, use qualquer email/nome válido</strong></p>
              <p><strong>Senha mínima:</strong> 8 caracteres</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
