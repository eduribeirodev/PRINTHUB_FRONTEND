import { Button } from './ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { ArrowLeft, Box, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface VerifyCodeProps {
  email: string;
  onNavigateToLogin: () => void;
  onNavigateToResetPassword: () => void;
}

export function VerifyCode({ email, onNavigateToLogin, onNavigateToResetPassword }: VerifyCodeProps) {
  const [code, setCode] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleVerify = () => {
    if (code.length !== 6) {
      toast.error('Código inválido', {
        description: 'Por favor, digite o código de 6 dígitos.',
      });
      return;
    }

    // Simular verificação
    console.log('Verifying code:', code);
    toast.success('Código verificado!', {
      description: 'Redirecionando para redefinição de senha...',
    });
    
    setTimeout(() => {
      onNavigateToResetPassword();
    }, 1000);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    // Simular reenvio
    setTimeout(() => {
      toast.success('Código reenviado!', {
        description: `Um novo código foi enviado para ${email}`,
      });
      setIsResending(false);
    }, 1500);
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

        {/* Shield Animation */}
        <div className="relative z-10 w-full max-w-md">
          <div className="relative mx-auto" style={{ width: '300px', height: '300px' }}>
            {/* Pulse Rings */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white/30 rounded-full"
                style={{
                  width: `${150 + i * 60}px`,
                  height: `${150 + i * 60}px`,
                  animation: `pulse ${2 + i * 0.5}s ease-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              ></div>
            ))}
            
            {/* Central Shield Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <ShieldCheck className="w-20 h-20 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-white">
            <h1 className="text-4xl mb-4">PrintHub</h1>
            <p className="text-white/80 text-lg">
              Verificação de segurança
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

            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4C00FF]/10 rounded-full mb-4">
                <ShieldCheck className="w-8 h-8 text-[#4C00FF]" />
              </div>
              <h2 className="text-3xl mb-2">Verificação de código</h2>
              <p className="text-gray-600">
                Digite o código de 6 dígitos enviado para
              </p>
              <p className="text-[#4C00FF] mt-1">{email}</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => setCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerify}
                className="w-full"
                style={{ backgroundColor: '#4C00FF' }}
                disabled={code.length !== 6}
              >
                Verificar código
              </Button>

              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">
                  Não recebeu o código?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-[#4C00FF] hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Reenviando...' : 'Reenviar código'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
