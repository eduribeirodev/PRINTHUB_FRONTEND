import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Lock, Eye, EyeOff, Box, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ResetPasswordProps {
  onNavigateToLogin: () => void;
}

interface ResetPasswordFormData {
  password: string;
  password_confirmation: string;
}

export function ResetPassword({ onNavigateToLogin }: ResetPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showpassword_confirmation, setShowpassword_confirmation] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  const onSubmit = (data: ResetPasswordFormData) => {
    console.log('Reset password data:', data);
    
    toast.success('Senha redefinida!', {
      description: 'Sua senha foi alterada com sucesso. Você já pode fazer login.',
      duration: 4000,
    });
    
    setTimeout(() => {
      onNavigateToLogin();
    }, 2000);
  };

  // Validações de senha
  const hasMinLength = password?.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password || '');
  const hasLowerCase = /[a-z]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password || '');

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

        {/* Lock Animation */}
        <div className="relative z-10 w-full max-w-md">
          <div className="relative mx-auto" style={{ width: '300px', height: '300px' }}>
            {/* Rotating Circles */}
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white/30 rounded-full"
                style={{
                  width: `${200 + i * 60}px`,
                  height: `${200 + i * 60}px`,
                  animation: `rotate ${10 + i * 5}s linear infinite ${i % 2 === 0 ? 'normal' : 'reverse'}`,
                }}
              >
                <div
                  className="absolute w-3 h-3 bg-white rounded-full"
                  style={{
                    top: '50%',
                    left: i % 2 === 0 ? '-6px' : 'calc(100% - 6px)',
                    transform: 'translateY(-50%)',
                  }}
                ></div>
              </div>
            ))}
            
            {/* Central Lock Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <Lock className="w-20 h-20 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-white">
            <h1 className="text-4xl mb-4">PrintHub</h1>
            <p className="text-white/80 text-lg">
              Crie uma senha forte e segura
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
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#10B981]/10 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
              </div>
              <h2 className="text-3xl mb-2">Redefinir senha</h2>
              <p className="text-gray-600">
                Digite sua nova senha abaixo
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    className="pl-10 pr-10"
                    {...register('password', {
                      required: 'Senha é obrigatória',
                      minLength: {
                        value: 8,
                        message: 'Senha deve ter no mínimo 8 caracteres',
                      },
                      validate: {
                        hasUpperCase: (value) =>
                          /[A-Z]/.test(value) || 'Deve conter letra maiúscula',
                        hasLowerCase: (value) =>
                          /[a-z]/.test(value) || 'Deve conter letra minúscula',
                        hasNumber: (value) =>
                          /[0-9]/.test(value) || 'Deve conter número',
                        hasSpecialChar: (value) =>
                          /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
                          'Deve conter caractere especial',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}

                {/* Indicadores de força da senha */}
                <div className="mt-3 space-y-2 text-sm">
                  <div className={`flex items-center gap-2 ${hasMinLength ? 'text-[#10B981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasUpperCase ? 'text-[#10B981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Uma letra maiúscula</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasLowerCase ? 'text-[#10B981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Uma letra minúscula</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasNumber ? 'text-[#10B981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Um número</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasSpecialChar ? 'text-[#10B981]' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Um caractere especial (!@#$%...)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password_confirmation"
                    type={showpassword_confirmation ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    className="pl-10 pr-10"
                    {...register('password_confirmation', {
                      required: 'Confirme sua senha',
                      validate: (value) =>
                        value === password || 'As senhas não coincidem',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowpassword_confirmation(!showpassword_confirmation)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showpassword_confirmation ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: '#4C00FF' }}
              >
                Redefinir senha
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
        @keyframes rotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
