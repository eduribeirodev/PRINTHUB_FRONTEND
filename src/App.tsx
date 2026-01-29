import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { JobDetails } from './components/JobDetails';
import { FilamentInventory } from './components/FilamentInventory';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { History } from './components/History';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { TermsOfUse } from './components/TermsOfUse';
import { ForgotPassword } from './components/ForgotPassword';
import { VerifyCode } from './components/VerifyCode';
import { ResetPassword } from './components/ResetPassword';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

export interface Job {
  id: string;
  fileName: string;
  estimatedTime: string;
  estimatedCost: string;
  status: 'backlog' | 'todo' | 'inProgress' | 'approval' | 'completed';
  quantity?: number;
  materialWeight?: string;
  layers?: string;
  filamentIds: string[]; // IDs dos filamentos usados
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

// Função utilitária para obter o nome formatado dos filamentos
export function getFilamentNames(filamentIds: string[], filaments: Filament[]): string {
  if (!filamentIds || filamentIds.length === 0) return 'Sem filamento';
  
  const names = filamentIds
    .map(id => {
      const filament = filaments.find(f => f.id === id);
      if (!filament) return null;
      return `${filament.type} ${filament.color} - ${filament.brand}`;
    })
    .filter(name => name !== null);
  
  return names.length > 0 ? names.join(' + ') : 'Filamento não encontrado';
}

export interface Filament {
  id: string;
  color: string;
  colorHex: string;
  brand: string;
  type: string;
  pricePerKg: number;
  initialQuantity: number;
  remainingQuantity: number;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'terms' | 'forgot-password' | 'verify-code' | 'reset-password'>('login');
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [historyJobs, setHistoryJobs] = useState<HistoryJob[]>([
    {
      id: 'hist-1',
      fileName: 'MiniaturaDragao.gcode',
      estimatedTime: '8h 30m',
      estimatedCost: 'R$ 18.50',
      completedDate: '15/11/2024',
      month: 'novembro de 2024',
      quantity: 1,
      materialWeight: '145.2g',
      layers: '380',
      filamentIds: ['3'],
    },
    {
      id: 'hist-2',
      fileName: 'SuporteMonitor.gcode',
      estimatedTime: '6h 15m',
      estimatedCost: 'R$ 12.30',
      completedDate: '12/11/2024',
      month: 'novembro de 2024',
      quantity: 2,
      materialWeight: '102.5g',
      layers: '250',
      filamentIds: ['5'],
    },
    {
      id: 'hist-3',
      fileName: 'VasoDecorado.gcode',
      estimatedTime: '10h 45m',
      estimatedCost: 'R$ 24.80',
      completedDate: '08/11/2024',
      month: 'novembro de 2024',
      quantity: 1,
      materialWeight: '198.7g',
      layers: '420',
      filamentIds: ['6', '4'],
    },
  ]);
  const [filaments, setFilaments] = useState<Filament[]>([
    {
      id: '1',
      color: 'Cinza',
      colorHex: '#9CA3AF',
      brand: 'Marca X',
      type: 'PLA',
      pricePerKg: 120.00,
      initialQuantity: 1000,
      remainingQuantity: 1000,
    },
    {
      id: '2',
      color: 'Roxo',
      colorHex: '#8B5CF6',
      brand: 'Marca Y',
      type: 'PLA',
      pricePerKg: 125.00,
      initialQuantity: 1000,
      remainingQuantity: 1000,
    },
    {
      id: '3',
      color: 'Vermelho',
      colorHex: '#EF4444',
      brand: 'Marca Z',
      type: 'ABS',
      pricePerKg: 140.00,
      initialQuantity: 1000,
      remainingQuantity: 1000,
    },
    {
      id: '4',
      color: 'Branco',
      colorHex: '#F3F4F6',
      brand: 'Marca X',
      type: 'PETG',
      pricePerKg: 135.00,
      initialQuantity: 1000,
      remainingQuantity: 1000,
    },
    {
      id: '5',
      color: 'Preto',
      colorHex: '#1F2937',
      brand: 'Marca Y',
      type: 'PLA',
      pricePerKg: 120.00,
      initialQuantity: 1000,
      remainingQuantity: 1000,
    },
    {
      id: '6',
      color: 'Azul',
      colorHex: '#3B82F6',
      brand: 'Marca Z',
      type: 'PLA',
      pricePerKg: 120.00,
      initialQuantity: 1000,
      remainingQuantity: 1000,
    },
  ]);
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      fileName: 'CalderaoBruxa.gcode',
      estimatedTime: '12h 14m',
      estimatedCost: 'R$ 21,60',
      status: 'backlog',
      filamentIds: ['2'],
    },
    {
      id: '2',
      fileName: 'chaveiro_ENF_T19.gcode',
      estimatedTime: '2h 15m',
      estimatedCost: 'R$ 6,80',
      status: 'todo',
      filamentIds: ['1'],
    },
    {
      id: '3',
      fileName: 'miniatura_dragao.gcode',
      estimatedTime: '8h 45m',
      estimatedCost: 'R$ 18,90',
      status: 'inProgress',
      filamentIds: ['3'],
    },
    {
      id: '4',
      fileName: 'suporte_monitor.gcode',
      estimatedTime: '15h 20m',
      estimatedCost: 'R$ 32,40',
      status: 'backlog',
      filamentIds: ['4'],
    },
    {
      id: '5',
      fileName: 'organizador_mesa.gcode',
      estimatedTime: '6h 10m',
      estimatedCost: 'R$ 14,50',
      status: 'todo',
      filamentIds: ['5'],
    },
    {
      id: '6',
      fileName: 'vaso_geometrico.gcode',
      estimatedTime: '12h 30m',
      estimatedCost: 'R$ 25,20',
      status: 'approval',
      filamentIds: ['1'],
    },
    {
      id: '7',
      fileName: 'porta_canetas.gcode',
      estimatedTime: '5h 45m',
      estimatedCost: 'R$ 11,30',
      status: 'completed',
      filamentIds: ['6'],
    },
    {
      id: '8',
      fileName: 'suporte_fone.gcode',
      estimatedTime: '4h 30m',
      estimatedCost: 'R$ 9,80',
      status: 'completed',
      filamentIds: ['4'],
    },
  ]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleNavigate = (screen: string, jobId?: string) => {
    setCurrentScreen(screen);
    // Só manter o jobId se estiver navegando para job-details
    if (screen === 'job-details') {
      setSelectedJobId(jobId);
    } else {
      setSelectedJobId(undefined);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthScreen('login');
    setCurrentScreen('dashboard');
  };

  const handleAddJob = (newJob: Omit<Job, 'id' | 'status'>) => {
    const job: Job = {
      ...newJob,
      id: String(Date.now()), // ID único baseado em timestamp
      status: 'backlog',
    };
    
    // Deduzir filamento do estoque se houver IDs de filamento e peso
    if (job.filamentIds && job.filamentIds.length > 0 && job.materialWeight) {
      const totalWeight = parseFloat(job.materialWeight);
      
      if (!isNaN(totalWeight) && totalWeight > 0) {
        // Para simplificar, dividir o peso igualmente entre os filamentos
        // (idealmente deveria ter peso por filamento individual)
        const weightPerFilament = totalWeight / job.filamentIds.length;
        
        setFilaments(prevFilaments => 
          prevFilaments.map(filament => {
            if (job.filamentIds?.includes(filament.id)) {
              const newQuantity = (filament.remainingQuantity || 0) - weightPerFilament * (job.quantity || 1);
              return {
                ...filament,
                remainingQuantity: Math.max(0, newQuantity) // Não permitir valores negativos
              };
            }
            return filament;
          })
        );
      }
    }
    
    setJobs([...jobs, job]);
    
    toast.success('Job adicionado!', {
      description: `${job.fileName} foi adicionado ao backlog.`,
      duration: 3000,
    });
  };

  const handleArchiveJob = (job: Job) => {
    const today = new Date();
    const monthYear = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const completedDate = today.toLocaleDateString('pt-BR');

    // Criar job para o histórico com todos os dados
    const archivedJob: HistoryJob = {
      id: job.id,
      fileName: job.fileName,
      estimatedTime: job.estimatedTime,
      estimatedCost: job.estimatedCost,
      completedDate,
      month: monthYear,
      quantity: job.quantity,
      materialWeight: job.materialWeight,
      layers: job.layers,
      filamentIds: job.filamentIds,
    };

    // Adicionar ao histórico
    setHistoryJobs([...historyJobs, archivedJob]);
    
    // Remover da fila de impressões
    setJobs(jobs.filter(j => j.id !== job.id));
    
    // Mostrar toast de sucesso
    toast.success('Job arquivado com sucesso!', {
      description: `${job.fileName} foi movido para o histórico.`,
      duration: 3000,
    });
  };

  const handleRemoveFromHistory = (jobId: string) => {
    const job = historyJobs.find(j => j.id === jobId);
    setHistoryJobs(historyJobs.filter(job => job.id !== jobId));
    
    // Mostrar toast de confirmação
    toast.success('Job removido do histórico', {
      description: job ? `${job.fileName} foi removido permanentemente.` : 'Job removido com sucesso.',
      duration: 3000,
    });
  };

  // Renderizar telas de autenticação
  if (!isAuthenticated) {
    const getDirection = (current: string, previous: string) => {
      const screens = ['login', 'register', 'terms', 'forgot-password', 'verify-code', 'reset-password'];
      const currentIndex = screens.indexOf(current);
      const previousIndex = screens.indexOf(previous);
      return currentIndex > previousIndex ? 1 : -1;
    };

    return (
      <AnimatePresence mode="wait" custom={authScreen}>
        {authScreen === 'login' && (
          <motion.div
            key="login"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          >
            <Login
              onLogin={handleLogin}
              onNavigateToRegister={() => setAuthScreen('register')}
              onNavigateToForgotPassword={() => setAuthScreen('forgot-password')}
            />
          </motion.div>
        )}
        {authScreen === 'register' && (
          <motion.div
            key="register"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          >
            <Register
              onRegister={handleRegister}
              onNavigateToLogin={() => setAuthScreen('login')}
              onNavigateToTerms={() => setAuthScreen('terms')}
            />
          </motion.div>
        )}
        {authScreen === 'terms' && (
          <motion.div
            key="terms"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          >
            <TermsOfUse onNavigateBack={() => setAuthScreen('register')} />
          </motion.div>
        )}
        {authScreen === 'forgot-password' && (
          <motion.div
            key="forgot-password"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          >
            <ForgotPassword
              onNavigateToLogin={() => setAuthScreen('login')}
              onNavigateToVerifyCode={(email) => {
                setRecoveryEmail(email);
                setAuthScreen('verify-code');
              }}
            />
          </motion.div>
        )}
        {authScreen === 'verify-code' && (
          <motion.div
            key="verify-code"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          >
            <VerifyCode
              email={recoveryEmail}
              onNavigateToLogin={() => setAuthScreen('login')}
              onNavigateToResetPassword={() => setAuthScreen('reset-password')}
            />
          </motion.div>
        )}
        {authScreen === 'reset-password' && (
          <motion.div
            key="reset-password"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          >
            <ResetPassword
              onNavigateToLogin={() => setAuthScreen('login')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Renderizar aplicação principal
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Toaster position="top-right" richColors />
      <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout} />
      
      <main className="flex-1 overflow-y-auto">
        {currentScreen === 'dashboard' && (
          <Dashboard 
            onNavigate={handleNavigate}
            jobs={jobs}
            historyJobs={historyJobs}
            filaments={filaments}
          />
        )}
        {currentScreen === 'kanban' && (
          <KanbanBoard 
            onNavigate={handleNavigate} 
            onArchiveJob={handleArchiveJob}
            jobs={jobs}
            setJobs={setJobs}
            filaments={filaments}
          />
        )}
        {currentScreen === 'history' && (
          <History 
            historyJobs={historyJobs} 
            onRemoveFromHistory={handleRemoveFromHistory}
            onNavigate={handleNavigate}
            filaments={filaments}
          />
        )}
        {currentScreen === 'job-details' && (
          <JobDetails 
            onNavigate={handleNavigate}
            onAddJob={handleAddJob}
            availableFilaments={filaments}
            jobId={selectedJobId}
            jobs={jobs}
            historyJobs={historyJobs}
          />
        )}
        {currentScreen === 'inventory' && (
          <FilamentInventory 
            filaments={filaments}
            setFilaments={setFilaments}
          />
        )}
        {currentScreen === 'reports' && (
          <Reports 
            historyJobs={historyJobs}
            filaments={filaments}
          />
        )}
        {currentScreen === 'settings' && (
          <Settings />
        )}
      </main>
    </div>
  );
}
