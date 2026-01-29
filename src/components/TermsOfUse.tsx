import { Button } from './ui/button';
import { ArrowLeft, Box } from 'lucide-react';

interface TermsOfUseProps {
  onNavigateBack: () => void;
}

export function TermsOfUse({ onNavigateBack }: TermsOfUseProps) {
  return (
    <div className="min-h-screen bg-[#F4F7FC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Box className="w-8 h-8 text-[#4C00FF]" />
            <h1 className="text-[#4C00FF] m-0">PrintHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={onNavigateBack}
              variant="ghost"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <h2 className="m-0">Termos de Uso</h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <p className="text-gray-600 mb-6">
            Última atualização: 14 de novembro de 2025
          </p>

          <div className="space-y-6">
            <section>
              <h3 className="mb-3">1. Aceitação dos Termos</h3>
              <p className="text-gray-700">
                Ao acessar e usar o PrintHub, você concorda em estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deve usar o aplicativo.
              </p>
            </section>

            <section>
              <h3 className="mb-3">2. Descrição do Serviço</h3>
              <p className="text-gray-700">
                O PrintHub é um software de gerenciamento de custos, inventário e fila de impressões 3D. 
                O sistema permite catalogar trabalhos, gerenciar estoque de filamentos e gerar relatórios, 
                mas não controla impressoras diretamente.
              </p>
            </section>

            <section>
              <h3 className="mb-3">3. Cadastro e Conta</h3>
              <p className="text-gray-700 mb-2">
                Para usar o PrintHub, você deve:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Fornecer informações precisas e completas durante o cadastro</li>
                <li>Manter a segurança de sua senha e conta</li>
                <li>Notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
                <li>Ser responsável por todas as atividades que ocorram em sua conta</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-3">4. Uso Aceitável</h3>
              <p className="text-gray-700 mb-2">
                Você concorda em não:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Usar o serviço para qualquer finalidade ilegal ou não autorizada</li>
                <li>Tentar obter acesso não autorizado ao sistema ou redes conectadas</li>
                <li>Interferir ou interromper o serviço ou servidores</li>
                <li>Reproduzir, duplicar, copiar ou revender qualquer parte do serviço</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-3">5. Propriedade Intelectual</h3>
              <p className="text-gray-700">
                Todo o conteúdo, recursos e funcionalidades do PrintHub são de propriedade exclusiva 
                e são protegidos por leis de direitos autorais, marcas registradas e outras leis de 
                propriedade intelectual.
              </p>
            </section>

            <section>
              <h3 className="mb-3">6. Privacidade</h3>
              <p className="text-gray-700">
                Seu uso do PrintHub também é regido por nossa Política de Privacidade. 
                Coletamos e usamos informações conforme descrito em nossa política.
              </p>
            </section>

            <section>
              <h3 className="mb-3">7. Limitação de Responsabilidade</h3>
              <p className="text-gray-700">
                O PrintHub é fornecido "como está" e "conforme disponível". Não garantimos que o 
                serviço será ininterrupto, seguro ou livre de erros. Em nenhuma circunstância seremos 
                responsáveis por quaisquer danos indiretos, incidentais ou consequenciais.
              </p>
            </section>

            <section>
              <h3 className="mb-3">8. Modificações dos Termos</h3>
              <p className="text-gray-700">
                Reservamos o direito de modificar estes termos a qualquer momento. As alterações 
                entrarão em vigor imediatamente após a publicação. Seu uso continuado do serviço 
                após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h3 className="mb-3">9. Rescisão</h3>
              <p className="text-gray-700">
                Podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso 
                prévio ou responsabilidade, por qualquer motivo, incluindo violação destes Termos de Uso.
              </p>
            </section>

            <section>
              <h3 className="mb-3">10. Contato</h3>
              <p className="text-gray-700">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco em: 
                <a href="mailto:suporte@printhub.com" className="text-[#4C00FF] hover:underline ml-1">
                  suporte@printhub.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={onNavigateBack}
              style={{ backgroundColor: '#4C00FF' }}
              className="w-full sm:w-auto"
            >
              Aceitar e Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
