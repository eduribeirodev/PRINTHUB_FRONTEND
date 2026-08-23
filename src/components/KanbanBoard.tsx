import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Clock, DollarSign, Droplet, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { ApiJob, Filament, getFilamentNames, Job, mapJob } from '../App';

interface KanbanBoardProps {
  onNavigate: (screen: string, jobId?: string) => void;
  jobs: Job[];
  onJobStatusUpdated: (job: Job) => void;
  filaments: Filament[];
}

const apiStatus: Record<Job['status'], string> = {
  backlog: 'BACKLOG', todo: 'TODO', inProgress: 'INPROGRESS', approval: 'APPROVAL', completed: 'COMPLETED',
};

export function KanbanBoard({ onNavigate, jobs, onJobStatusUpdated, filaments }: KanbanBoardProps) {
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  const updateStatus = async (status: Job['status']) => {
    if (!draggedJob || draggedJob.status === status) return;
    setUpdatingJobId(draggedJob.id);
    try {
      const response = await api.put<ApiJob>(`/jobs/${draggedJob.id}`, { status: apiStatus[status] });
      onJobStatusUpdated(mapJob(response.data));
      toast.success('Status atualizado.');
    } catch (error: any) {
      toast.error('Não foi possível atualizar o status.', { description: error.response?.data?.message || 'Tente novamente.' });
    } finally {
      setDraggedJob(null);
      setUpdatingJobId(null);
    }
  };

  const columns: Array<{ id: Job['status']; title: string; color: string }> = [
    { id: 'backlog', title: 'Backlog', color: '#6B7280' },
    { id: 'todo', title: 'A Fazer', color: '#3B82F6' },
    { id: 'inProgress', title: 'Em Andamento', color: '#F59E0B' },
    { id: 'approval', title: 'Aprovação', color: '#8B5CF6' },
    { id: 'completed', title: 'Finalizado', color: '#10B981' },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Fila de Impressões</h1>
          <p className="text-[#6B7280] mt-2">Arraste os cards entre as colunas para atualizar o status.</p>
        </div>
        <Button onClick={() => onNavigate('job-details')} style={{ backgroundColor: '#4C00FF' }}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar impressão
        </Button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-min">
          {columns.map((column) => {
            const columnJobs = jobs.filter((job) => job.status === column.id);
            return (
              <section key={column.id} className="flex flex-col w-[280px] md:w-[300px] flex-shrink-0" onDragOver={(event) => event.preventDefault()} onDrop={() => updateStatus(column.id)}>
                <header className="p-4 rounded-t-lg mb-4" style={{ backgroundColor: column.color }}>
                  <h3 className="text-white">{column.title}</h3>
                  <p className="text-white/90 mt-1">{columnJobs.length} jobs</p>
                </header>
                <div className="space-y-4 flex-1 min-h-28">
                  {columnJobs.map((job) => (
                    <Card key={job.id} className="p-4 cursor-move hover:shadow-lg transition-shadow" draggable={updatingJobId !== job.id} onDragStart={() => setDraggedJob(job)}>
                      <div className="mb-3">
                        <h4 className="mb-2">{job.fileName}</h4>
                        <div className="flex items-center gap-2 text-[#6B7280]"><Droplet className="w-4 h-4 flex-none" /><span className="truncate">{getFilamentNames(job.filamentIds, filaments)}</span></div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-[#6B7280]"><Clock className="w-4 h-4" />{job.estimatedTime}</div>
                        <div className="flex items-center gap-2 text-[#6B7280]"><DollarSign className="w-4 h-4" />{job.estimatedCost}</div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => onNavigate('job-details', job.id)}><Eye className="w-4 h-4 mr-2" /> Detalhes</Button>
                    </Card>
                  ))}
                  {columnJobs.length === 0 && <div className="p-8 text-center text-[#6B7280] border-2 border-dashed border-gray-200 rounded-lg">Arraste jobs aqui</div>}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
