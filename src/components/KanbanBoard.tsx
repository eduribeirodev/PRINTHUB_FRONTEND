import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Clock, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';
import  api  from '../services/api';

interface PrintJob {
  id: string;
  title: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  filament_id?: string;
  estimated_hours?: number;
}

export function KanbanBoard() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Buscar os jobs (tarefas de impressão) do Laravel ao carregar a tela
  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error("Erro ao carregar as tarefas de impressão:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  // Filtrar por colunas do Kanban baseadas no status retornado pelo back-end
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const printingJobs = jobs.filter(j => j.status === 'printing');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');

  if (loading) {
    return <div className="p-8 text-center">Carregando painel Kanban...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Painel de Impressão (Kanban)</h1>
          <p className="text-sm text-gray-500">Acompanhe o andamento das suas impressões 3D</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Coluna: Pendente */}
        <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center font-semibold text-amber-600 gap-1">
              <Clock className="w-4 h-4" /> Pendente
            </span>
            <Badge variant="secondary">{pendingJobs.length}</Badge>
          </div>
          <div className="space-y-3">
            {pendingJobs.map(job => (
              <Card key={job.id} className="p-4 shadow-sm">
                <h4 className="font-medium">{job.title}</h4>
                <p className="text-xs text-gray-400 mt-1">Tempo est.: {job.estimated_hours || 0}h</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Coluna: Imprimindo */}
        <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center font-semibold text-blue-600 gap-1">
              <PlayCircle className="w-4 h-4" /> Imprimindo
            </span>
            <Badge variant="secondary">{printingJobs.length}</Badge>
          </div>
          <div className="space-y-3">
            {printingJobs.map(job => (
              <Card key={job.id} className="p-4 shadow-sm border-blue-200">
                <h4 className="font-medium">{job.title}</h4>
                <p className="text-xs text-gray-400 mt-1">Tempo est.: {job.estimated_hours || 0}h</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Coluna: Concluído */}
        <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center font-semibold text-green-600 gap-1">
              <CheckCircle2 className="w-4 h-4" /> Concluído
            </span>
            <Badge variant="secondary">{completedJobs.length}</Badge>
          </div>
          <div className="space-y-3">
            {completedJobs.map(job => (
              <Card key={job.id} className="p-4 shadow-sm opacity-75">
                <h4 className="font-medium">{job.title}</h4>
                <p className="text-xs text-gray-400 mt-1">Concluído</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Coluna: Falhou */}
        <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center font-semibold text-red-600 gap-1">
              <AlertCircle className="w-4 h-4" /> Falhou
            </span>
            <Badge variant="secondary">{failedJobs.length}</Badge>
          </div>
          <div className="space-y-3">
            {failedJobs.map(job => (
              <Card key={job.id} className="p-4 shadow-sm border-red-200">
                <h4 className="font-medium">{job.title}</h4>
                <p className="text-xs text-red-400 mt-1">Erro na impressão</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}