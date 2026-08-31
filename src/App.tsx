import { Component, type ReactNode, useCallback, useEffect, useState } from 'react';
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
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import api from './services/api';

export interface Job { id: string; fileName: string; estimatedTime: string; estimatedCost: string; status: 'backlog' | 'todo' | 'inProgress' | 'approval' | 'completed'; quantity?: number; materialWeight?: string; layers?: string; filamentIds: string[]; filamentWeights?: number[]; }
export interface HistoryJob extends Omit<Job, 'status'> { completedDate: string; month: string; }
export interface Filament { id: string; color: string; colorHex: string; brand: string; type: string; pricePerKg: number; initialQuantity: number; remainingQuantity: number; }
export type ApiFilament = { id: number; brand: string; type: string; colorName: string; colorHex: string; pricePerKg: string | number; initialQuantity: string | number; currentQuantity: string | number; };
export type ApiJob = { id: number; fileName: string; status: 'BACKLOG' | 'TODO' | 'INPROGRESS' | 'APPROVAL' | 'COMPLETED'; estimatedTimeMinutes: number; estimatedCost: string | number; quantity: number; materialWeightGrams: string | number; layers: number; created_at: string; updated_at: string; completed_at?: string | null; filaments?: Array<ApiFilament & { pivot?: { weight_grams: string | number } }>; };

const statusFromApi: Record<ApiJob['status'], Job['status']> = { BACKLOG: 'backlog', TODO: 'todo', INPROGRESS: 'inProgress', APPROVAL: 'approval', COMPLETED: 'completed' };
export const getFilamentNames = (ids: string[], filaments: Filament[]) => {
  const names = ids.map((id) => filaments.find((filament) => filament.id === id)).filter((filament): filament is Filament => Boolean(filament)).map((filament) => `${filament.type} ${filament.color} - ${filament.brand}`);
  return names.length ? names.join(' + ') : 'Sem filamento';
};
export const mapFilament = (filament: ApiFilament): Filament => ({ id: String(filament.id), color: filament.colorName, colorHex: filament.colorHex, brand: filament.brand, type: filament.type, pricePerKg: Number(filament.pricePerKg), initialQuantity: Number(filament.initialQuantity), remainingQuantity: Number(filament.currentQuantity) });
export const mapJob = (job: ApiJob): Job => ({ id: String(job.id), fileName: job.fileName, estimatedTime: `${Math.floor(job.estimatedTimeMinutes / 60)}h ${job.estimatedTimeMinutes % 60}m`, estimatedCost: `R$ ${Number(job.estimatedCost).toFixed(2)}`, status: statusFromApi[job.status], quantity: job.quantity, materialWeight: `${Number(job.materialWeightGrams)}g`, layers: String(job.layers), filamentIds: (job.filaments ?? []).map((filament) => String(filament.id)), filamentWeights: (job.filaments ?? []).map((filament) => Number(filament.pivot?.weight_grams ?? 0)) });
export const mapHistoryJob = (job: ApiJob): HistoryJob => { const completedAt = new Date(job.completed_at ?? job.updated_at); return { ...mapJob(job), completedDate: completedAt.toLocaleDateString('pt-BR'), month: completedAt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) }; };

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('App crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] p-6">
          <div className="max-w-md w-full rounded-2xl border border-[#E9D5FF] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E8FF] text-[#4C00FF] text-2xl">!</div>
            <h2 className="text-2xl font-semibold text-[#1E1E1E]">Ops, algo quebrou na tela.</h2>
            <p className="mt-3 text-[#6B7280]">
              A aplicação foi recarregada com segurança para evitar uma tela em branco.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-[#4C00FF] px-4 py-2 text-white hover:opacity-90"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'terms'>('login');
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string>();
  const [historyJobs, setHistoryJobs] = useState<HistoryJob[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [energyCost, setEnergyCost] = useState(0.18);
  const [printerPower, setPrinterPower] = useState(250);
  const [includeEnergyCost, setIncludeEnergyCost] = useState(true);

  const loadData = useCallback(async () => {
    const [filamentsResponse, jobsResponse, settingsResponse] = await Promise.all([api.get<ApiFilament[]>('/filaments'), api.get<ApiJob[]>('/jobs'), api.get('/settings')]);
    setFilaments(filamentsResponse.data.map(mapFilament));
    setJobs(jobsResponse.data.map(mapJob));
    setHistoryJobs(jobsResponse.data.filter((job) => job.status === 'COMPLETED').map(mapHistoryJob));
    setEnergyCost(Number(settingsResponse.data.settings?.energyCost ?? 0.18));
    setPrinterPower(Number(settingsResponse.data.settings?.printerPower ?? 250));
    setIncludeEnergyCost(settingsResponse.data.settings?.includeEnergyCost ?? true);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('PrintHub_token')) { setIsLoadingSession(false); return; }
    api.get('/me').then(() => setIsAuthenticated(true)).catch(() => { localStorage.removeItem('PrintHub_token'); localStorage.removeItem('PrintHub_user'); }).finally(() => setIsLoadingSession(false));
  }, []);
  useEffect(() => { if (isAuthenticated) loadData().catch((error) => { console.error('Erro ao carregar dados da API:', error); toast.error('Não foi possível carregar os dados da sua conta.'); }); }, [isAuthenticated, loadData]);

  const handleAuthenticated = () => { setIsAuthenticated(true); setCurrentScreen('dashboard'); };
  const handleNavigate = (screen: string, jobId?: string) => { setCurrentScreen(screen); setSelectedJobId(screen === 'job-details' ? jobId : undefined); };
  const handleLogout = async () => { try { await api.delete('/logout'); } catch { /* remove local credentials even if the server is unavailable */ } localStorage.removeItem('PrintHub_token'); localStorage.removeItem('PrintHub_user'); setJobs([]); setFilaments([]); setHistoryJobs([]); setIsAuthenticated(false); setAuthScreen('login'); };
  const handleJobCreated = (job: Job) => setJobs((current) => [...current, job]);
  const handleJobStatusUpdated = (job: Job) => { setJobs((current) => current.map((item) => item.id === job.id ? job : item)); if (job.status === 'completed') loadData().catch(() => undefined); };
  const handleRemoveFromHistory = async (jobId: string) => { await api.delete(`/jobs/${jobId}`); setJobs((current) => current.filter((job) => job.id !== jobId)); setHistoryJobs((current) => current.filter((job) => job.id !== jobId)); };

  if (isLoadingSession) return <div className="min-h-screen grid place-items-center">Carregando...</div>;
  if (!isAuthenticated) {
    if (authScreen === 'register') return <Register onRegister={handleAuthenticated} onNavigateToLogin={() => setAuthScreen('login')} onNavigateToTerms={() => setAuthScreen('terms')} />;
    if (authScreen === 'terms') return <TermsOfUse onNavigateBack={() => setAuthScreen('register')} />;
    return <Login onLogin={handleAuthenticated} onNavigateToRegister={() => setAuthScreen('register')} />;
  }
  return (
    <AppErrorBoundary>
      <div className="flex h-screen bg-white overflow-hidden">
        <Toaster position="top-right" richColors />
        <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {currentScreen === 'dashboard' && <Dashboard onNavigate={handleNavigate} jobs={jobs} historyJobs={historyJobs} filaments={filaments} />}
          {currentScreen === 'kanban' && <KanbanBoard onNavigate={handleNavigate} jobs={jobs} onJobStatusUpdated={handleJobStatusUpdated} onDeleteJob={handleRemoveFromHistory} filaments={filaments} />}
          {currentScreen === 'history' && <History historyJobs={historyJobs} onRemoveFromHistory={handleRemoveFromHistory} onNavigate={handleNavigate} filaments={filaments} />}
          {currentScreen === 'job-details' && <JobDetails onNavigate={handleNavigate} onAddJob={handleJobCreated} availableFilaments={filaments} jobId={selectedJobId} jobs={jobs} historyJobs={historyJobs} />}
          {currentScreen === 'inventory' && <FilamentInventory filaments={filaments} setFilaments={setFilaments} jobs={jobs} />}
          {currentScreen === 'reports' && <Reports historyJobs={historyJobs} filaments={filaments} energyCost={energyCost} printerPower={printerPower} includeEnergyCost={includeEnergyCost} />}
          {currentScreen === 'settings' && <Settings />}
        </main>
      </div>
    </AppErrorBoundary>
  );
}
