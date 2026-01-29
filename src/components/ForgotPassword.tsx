import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Mail, ArrowLeft, Box } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
  onNavigateToVerifyCode: (email: string) => void;
}

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPassword({ onNavigateToLogin, onNavigateToVerifyCode }: ForgotPasswordProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = (data: ForgotPasswordFormData) => {
    console.log('Forgot password data:', data);
    
    // Simular envio de código
    toast.success('Código enviado!', {
      description: `Um código de verificação foi enviado para ${data.email}`,
      duration: 4000,
    });
    
    onNavigateToVerifyCode(data.email);
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
                className="absolute left-1/2 -translate-x-1/2 border-2 border-white/40 rounded-lg"
                style={{
                  width: `${280 - i * 30}px`,
                  height: `${280 - i * 30}px`,
                  bottom: `${i * 25}px`,
                  animation: `float ${3 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.3 + (i * 0.08),
                }}
              ></div>
            ))}
            
            {/* Central Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <Box className="w-20 h-20 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-white">
            <h1 className="text-4xl mb-4">PrintHub</h1>
            <p className="text-white/80 text-lg">
              Recupere o acesso à sua conta
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F4F7FC]">
        <div className="w-full max-w-md">
          {/* Header Mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <Box className="w-10 h-10 text-[#4C00FF]" />
              <h1 className="text-3xl">PrintHub</h1>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Botão Voltar */}
            <button
              onClick={onNavigateToLogin}
              className="flex items-center gap-2 text-gray-600 hover:text-[#4C00FF] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao login
            </button>

            <div className="mb-8">
              <h2 className="text-3xl mb-2">Esqueceu sua senha?</h2>
              <p className="text-gray-600">
                Digite seu email e enviaremos um código de verificação para redefinir sua senha.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    {...register('email', {
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: '#4C00FF' }}
              >
                Enviar código de verificação
              </Button>
            </form>
          </div>

          <p className="text-center mt-6 text-gray-600">
            Lembrou sua senha?{' '}
            <button
              onClick={onNavigateToLogin}
              className="text-[#4C00FF] hover:underline"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          50% {
            transform: translateY(-10px) translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
