import { Card } from './ui/card';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, DollarSign, Droplet, Clock, AlertCircle, Play, FileCheck, Archive, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

interface Job {
  id: string;
  fileName: string;
  estimatedTime: string;
  estimatedCost: string;
  status: 'backlog' | 'todo' | 'inProgress' | 'approval' | 'completed';
  quantity?: number;
  materialWeight?: string;
  layers?: string;
  filamentIds: string[];
}

interface HistoryJob {
  id: string;
  fileName: string;
  estimatedTime: string;
  estimatedCost: string;
  completedDate: string;
  month: string;
  quantity?: number;
  materialWeight?: string;
  layers?: string;
  filamentIds: string[];
}

interface Filament {
  id: string;
  color: string;
  colorHex: string;
  brand: string;
  type: string;
  pricePerKg: number;
  initialQuantity: number;
  remainingQuantity: number;
}

interface DashboardProps {
  onNavigate: (screen: string, jobId?: string) => void;
  jobs?: Job[];
  historyJobs?: HistoryJob[];
  filaments?: Filament[];
}

export function Dashboard({ onNavigate, jobs = [], historyJobs = [], filaments = [] }: DashboardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Calcular resumo do mês atual
  const monthSummary = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    // Jobs completados neste mês
    const completedThisMonth = historyJobs.filter(job => job.month === currentMonth);
    const completedJobs = completedThisMonth.length;
    
    // Custo total de material do mês
    const totalMaterialCost = completedThisMonth.reduce((sum, job) => {
      const cost = parseFloat(job.estimatedCost.replace('R$', '').replace(',', '.').trim());
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
    
    // Filamento mais usado (por frequência de uso)
    const filamentUsage = new Map<string, number>();
    completedThisMonth.forEach(job => {
      job.filamentIds.forEach(filamentId => {
        const count = filamentUsage.get(filamentId) || 0;
        filamentUsage.set(filamentId, count + 1);
      });
    });
    
    let mostUsedFilament = 'Nenhum';
    let maxUsage = 0;
    filamentUsage.forEach((count, filamentId) => {
      if (count > maxUsage) {
        maxUsage = count;
        const filament = filaments.find(f => f.id === filamentId);
        if (filament) {
          mostUsedFilament = `${filament.type} ${filament.color} - ${filament.brand}`;
        }
      }
    });
    
    return {
      completedJobs,
      totalMaterialCost,
      mostUsedFilament,
    };
  }, [historyJobs, filaments]);

  // Calcular consumo por tipo de filamento dos últimos 30 dias
  const consumptionData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const consumptionByType = new Map<string, number>();
    
    historyJobs.forEach(job => {
      // Verificar se o job foi completado nos últimos 30 dias
      const [day, month, year] = job.completedDate.split('/');
      const jobDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (jobDate >= thirtyDaysAgo) {
        const weight = parseFloat(job.materialWeight || '0');
        if (!isNaN(weight)) {
          job.filamentIds.forEach(filamentId => {
            const filament = filaments.find(f => f.id === filamentId);
            if (filament) {
              const currentConsumption = consumptionByType.get(filament.type) || 0;
              // Dividir o peso pelos filamentos usados
              consumptionByType.set(filament.type, currentConsumption + (weight / job.filamentIds.length));
            }
          });
        }
      }
    });
    
    return Array.from(consumptionByType.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [historyJobs, filaments]);

  // Jobs em andamento
  const jobsInProgress = useMemo(() => {
    return jobs
      .filter(job => job.status === 'inProgress')
      .map(job => {
        const filamentNames = job.filamentIds
          .map(id => {
            const filament = filaments.find(f => f.id === id);
            return filament ? `${filament.type} ${filament.color} - ${filament.brand}` : '';
          })
          .filter(name => name)
          .join(' + ');
        
        return {
          name: job.fileName,
          filament: filamentNames || 'Sem filamento',
          time: job.estimatedTime,
        };
      });
  }, [jobs, filaments]);

  // Contadores por status
  const statusCounts = useMemo(() => {
    return {
      backlog: jobs.filter(job => job.status === 'backlog').length,
      todo: jobs.filter(job => job.status === 'todo').length,
      inProgress: jobs.filter(job => job.status === 'inProgress').length,
      approval: jobs.filter(job => job.status === 'approval').length,
      completed: jobs.filter(job => job.status === 'completed').length,
    };
  }, [jobs]);

  // Cards de status para o carrossel
  const statusCards = [
    {
      label: 'Backlog',
      count: statusCounts.backlog,
      image: 'https://images.unsplash.com/photo-1762627105132-f6ed848a23bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXZlJTIwc3RvcmFnZSUyMGJveGVzfGVufDF8fHx8MTc2OTIwNDYzOXww&ixlib=rb-4.1.0&q=80&w=1080',
      color: '#6B7280',
    },
    {
      label: 'A Fazer',
      count: statusCounts.todo,
      image: 'https://images.unsplash.com/photo-1598791318878-10e76d178023?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2RvJTIwbGlzdCUyMGNoZWNrbGlzdHxlbnwxfHx8fDE3NjkyMDQ2Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: '#3B82F6',
    },
    {
      label: 'Em Andamento',
      count: statusCounts.inProgress,
      image: 'https://images.unsplash.com/photo-1603974739172-4ad6a3117e40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMHByaW50ZXIlMjB3b3JraW5nfGVufDF8fHx8MTc2OTIwNDYzOXww&ixlib=rb-4.1.0&q=80&w=1080',
      color: '#F59E0B',
    },
    {
      label: 'Aprovação',
      count: statusCounts.approval,
      image: 'https://images.unsplash.com/photo-1604235250721-0e4bc4a78213?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcHByb3ZhbCUyMHN0YW1wJTIwZG9jdW1lbnR8ZW58MXx8fHwxNzY5MjA0NjQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      color: '#8B5CF6',
    },
    {
      label: 'Concluído',
      count: statusCounts.completed,
      image: 'https://images.unsplash.com/photo-1759936802396-0177ea95a088?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWxlYnJhdGlvbiUyMGFjaGlldmVtZW50JTIwdHJvcGh5fGVufDF8fHx8MTc2OTIwNDY0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      color: '#10B981',
    },
  ];

  // Autoplay do carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlide = statusCards.length - 3;
        return prev >= maxSlide ? 0 : prev + 1;
      });
    }, 3000); // Muda a cada 3 segundos

    return () => clearInterval(interval);
  }, [statusCards.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => Math.min(statusCards.length - 3, prev + 1));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Dashboard</h1>
          <p className="text-[#6B7280] mt-2">Visão geral do seu sistema de impressão 3D</p>
        </div>
        <Button onClick={() => onNavigate('job-details')}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Job
        </Button>
      </div>
      {/* Módulo 1: Resumo do Mês */}
      <div className="mb-8">
        <h3 className="mb-4">Resumo do Mês</h3>
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#10B981]/10 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <p className="text-[#6B7280]">Impressões Concluídas</p>
                <p className="mt-2">{monthSummary.completedJobs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#4C00FF]/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-[#4C00FF]" />
              </div>
              <div>
                <p className="text-[#6B7280]">Custo Total de Material</p>
                <p className="mt-2">R$ {monthSummary.totalMaterialCost.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#F59E0B]/10 rounded-lg">
                <Droplet className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-[#6B7280]">Filamento Mais Usado</p>
                <p className="mt-2">{monthSummary.mostUsedFilament}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Módulo 1.5: Visão Geral da Fila de Impressões */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3>Fila de Impressões</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('kanban')}
          >
            Ver Kanban
          </Button>
        </div>
        <div className="relative">
          {/* Botão anterior */}
          {currentSlide > 0 && (
            <button
              onClick={handlePrevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6 text-[#6B7280]" />
            </button>
          )}
          
          {/* Container do carrossel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out gap-4"
              style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
            >
              {statusCards.map((card, index) => {
                return (
                  <div key={index} className="min-w-[calc(33.333%-0.667rem)] flex-shrink-0">
                    <Card className="p-0 hover:shadow-md transition-shadow cursor-pointer h-full overflow-hidden" onClick={() => onNavigate('kanban')}>
                      <div className="relative h-32 overflow-hidden">
                        <img 
                          src={card.image} 
                          alt={card.label}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-4 text-white">
                          <p className="text-sm font-medium">{card.label}</p>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-4xl font-bold" style={{ color: card.color }}>{card.count}</p>
                        <p className="text-[#6B7280] text-sm mt-2">jobs na fila</p>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botão próximo */}
          {currentSlide < statusCards.length - 3 && (
            <button
              onClick={handleNextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="w-6 h-6 text-[#6B7280]" />
            </button>
          )}

          {/* Indicadores */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: statusCards.length - 2 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-[#4C00FF]' : 'bg-[#E5E7EB]'
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Módulo 2: Uso de Filamentos */}
      <div className="mb-8">
        <h3 className="mb-4">Consumo de Material (Últimos 30 dias)</h3>
        <Card className="p-6">
          {consumptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F7FC" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" label={{ value: 'Gramas (g)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                  formatter={(value) => [`${value}g`, 'Consumo']}
                />
                <Bar dataKey="value" fill="#4C00FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-20">
              <Droplet className="w-12 h-12 text-[#6B7280] mx-auto mb-4 opacity-50" />
              <p className="text-[#6B7280]">Nenhum consumo de material nos últimos 30 dias</p>
              <p className="text-[#9CA3AF] mt-2">Complete alguns jobs para visualizar o gráfico de consumo</p>
            </div>
          )}
        </Card>
      </div>

      {/* Módulo 3: Jobs em Andamento */}
      <div>
        <h3 className="mb-4">Atualmente em Impressão</h3>
        <Card className="p-6">
          {jobsInProgress.length > 0 ? (
            <div className="space-y-4">
              {jobsInProgress.map((job, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#F4F7FC] rounded-lg">
                  <div className="flex-1">
                    <p className="text-[#1E1E1E]">{job.name}</p>
                    <p className="text-[#6B7280] mt-1">{job.filament}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6B7280]">Tempo Estimado</p>
                    <p className="text-[#1E1E1E] mt-1">{job.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#6B7280]">Nenhum job em andamento no momento</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}