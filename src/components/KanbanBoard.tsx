import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Eye, Pencil, Clock, DollarSign, Droplet, Plus, Archive } from 'lucide-react';
import { Job, Filament, getFilamentNames } from '../App';

interface KanbanBoardProps {
  onNavigate: (screen: string, jobId?: string) => void;
  onArchiveJob?: (job: Job) => void;
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  filaments: Filament[];
}

export function KanbanBoard({ onNavigate, onArchiveJob, jobs, setJobs, filaments }: KanbanBoardProps) {
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);

  const handleDragStart = (job: Job) => {
    setDraggedJob(job);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: Job['status']) => {
    if (draggedJob) {
      setJobs(jobs.map(job => 
        job.id === draggedJob.id ? { ...job, status } : job
      ));
      setDraggedJob(null);
    }
  };

  const getJobsByStatus = (status: Job['status']) => {
    return jobs.filter(job => job.status === status);
  };

  const columns = [
    { 
      id: 'backlog', 
      title: 'Backlog', 
      color: '#6B7280',
      jobs: getJobsByStatus('backlog')
    },
    { 
      id: 'todo', 
      title: 'A Fazer', 
      color: '#3B82F6',
      jobs: getJobsByStatus('todo')
    },
    { 
      id: 'inProgress', 
      title: 'Em Andamento', 
      color: '#F59E0B',
      jobs: getJobsByStatus('inProgress')
    },
    { 
      id: 'approval', 
      title: 'Aprovação', 
      color: '#8B5CF6',
      jobs: getJobsByStatus('approval')
    },
    { 
      id: 'completed', 
      title: 'Finalizado', 
      color: '#10B981',
      jobs: getJobsByStatus('completed')
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Fila de Jobs</h1>
          <p className="text-[#6B7280] mt-2">Arraste os cards entre as colunas para atualizar o status</p>
        </div>
        
        <Button onClick={() => onNavigate('job-details')} style={{ backgroundColor: '#4C00FF' }}>
          Adicionar Impressão
        </Button>
      </div>

      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 min-w-min">
          {columns.map((column) => (
            <div 
              key={column.id}
              className="flex flex-col w-[280px] md:w-[300px] flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id as Job['status'])}
            >
              <div 
                className="p-4 rounded-t-lg mb-4"
                style={{ backgroundColor: column.color }}
              >
                <h3 className="text-white">{column.title}</h3>
                <p className="text-white opacity-90 mt-1">{column.jobs.length} jobs</p>
              </div>

              <div className="space-y-4 flex-1">
                {column.jobs.map((job) => (
                  <Card 
                    key={job.id}
                    className="p-4 cursor-move hover:shadow-lg transition-shadow"
                    draggable
                    onDragStart={() => handleDragStart(job)}
                  >
                    <div className="mb-3">
                      <h4 className="mb-2">{job.fileName}</h4>
                      <div className="flex items-center gap-2 text-[#6B7280]">
                        <Droplet className="w-4 h-4" />
                        <span className="truncate">{getFilamentNames(job.filamentIds, filaments)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-[#6B7280]">
                        <Clock className="w-4 h-4" />
                        <span>{job.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6B7280]">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.estimatedCost}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {job.status === 'completed' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => onNavigate('job-details', job.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detalhes
                          </Button>
                          <Button
                            size="sm"
                            style={{ backgroundColor: '#10B981' }}
                            className="text-white"
                            onClick={() => onArchiveJob && onArchiveJob(job)}
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Arquivar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => onNavigate('job-details', job.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detalhes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('job-details', job.id)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                ))}

                {column.jobs.length === 0 && (
                  <div className="p-8 text-center text-[#6B7280] border-2 border-dashed border-gray-200 rounded-lg">
                    Arraste jobs aqui
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
