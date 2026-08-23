import { useCallback, useEffect, useState } from 'react';
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
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import api from './services/api';

export interface Job { id: string; fileName: string; estimatedTime: string; estimatedCost: string; status: 'backlog' | 'todo' | 'inProgress' | 'approval' | 'completed'; quantity?: number; materialWeight?: string; layers?: string; filamentIds: string[]; }
export interface HistoryJob extends Omit<Job, 'status'> { completedDate: string; month: string; }
export interface Filament { id: string; color: string; colorHex: string; brand: string; type: string; pricePerKg: number; initialQuantity: number; remainingQuantity: number; }
export type ApiFilament = { id: number; brand: string; type: string; colorName: string; colorHex: string; pricePerKg: string | number; initialQuantity: string | number; currentQuantity: string | number; };
export type ApiJob = { id: number; fileName: string; status: 'BACKLOG' | 'TODO' | 'INPROGRESS' | 'APPROVAL' | 'COMPLETED'; estimatedTimeMinutes: number; estimatedCost: string | number; quantity: number; materialWeightGrams: string | number; layers: number; created_at: string; updated_at: string; completed_at?: string | null; filaments?: ApiFilament[]; };

const statusFromApi: Record<ApiJob['status'], Job['status']> = { BACKLOG: 'backlog', TODO: 'todo', INPROGRESS: 'inProgress', APPROVAL: 'approval', COMPLETED: 'completed' };
export const getFilamentNames = (ids: string[], filaments: Filament[]) => {
  const names = ids.map((id) => filaments.find((filament) => filament.id === id)).filter((filament): filament is Filament => Boolean(filament)).map((filament) => `${filament.type} ${filament.color} - ${filament.brand}`);
  return names.length ? names.join(' + ') : 'Sem filamento';
};
export const mapFilament = (filament: ApiFilament): Filament => ({ id: String(filament.id), color: filament.colorName, colorHex: filament.colorHex, brand: filament.brand, type: filament.type, pricePerKg: Number(filament.pricePerKg), initialQuantity: Number(filament.initialQuantity), remainingQuantity: Number(filament.currentQuantity) });
export const mapJob = (job: ApiJob): Job => ({ id: String(job.id), fileName: job.fileName, estimatedTime: `${Math.floor(job.estimatedTimeMinutes / 60)}h ${job.estimatedTimeMinutes % 60}m`, estimatedCost: `R$ ${Number(job.estimatedCost).toFixed(2)}`, status: statusFromApi[job.status], quantity: job.quantity, materialWeight: `${Number(job.materialWeightGrams)}g`, layers: String(job.layers), filamentIds: (job.filaments ?? []).map((filament) => String(filament.id)) });
export const mapHistoryJob = (job: ApiJob): HistoryJob => { const completedAt = new Date(job.completed_at ?? job.updated_at); return { ...mapJob(job), completedDate: completedAt.toLocaleDateString('pt-BR'), month: completedAt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) }; };

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'terms' | 'forgot-password' | 'verify-code' | 'reset-password'>('login');
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string>();
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [historyJobs, setHistoryJobs] = useState<HistoryJob[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const loadData = useCallback(async () => {
    const [filamentsResponse, jobsResponse] = await Promise.all([api.get<ApiFilament[]>('/filaments'), api.get<ApiJob[]>('/jobs')]);
    setFilaments(filamentsResponse.data.map(mapFilament));
    setJobs(jobsResponse.data.map(mapJob));
    setHistoryJobs(jobsResponse.data.filter((job) => job.status === 'COMPLETED').map(mapHistoryJob));
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
    if (authScreen === 'forgot-password') return <ForgotPassword onNavigateToLogin={() => setAuthScreen('login')} onNavigateToVerifyCode={(email) => { setRecoveryEmail(email); setAuthScreen('verify-code'); }} />;
    if (authScreen === 'verify-code') return <VerifyCode email={recoveryEmail} onNavigateToLogin={() => setAuthScreen('login')} onNavigateToResetPassword={(token) => { setRecoveryToken(token); setAuthScreen('reset-password'); }} />;
    if (authScreen === 'reset-password') return <ResetPassword email={recoveryEmail} resetToken={recoveryToken} onNavigateToLogin={() => setAuthScreen('login')} />;
    return <Login onLogin={handleAuthenticated} onNavigateToRegister={() => setAuthScreen('register')} onNavigateToForgotPassword={() => setAuthScreen('forgot-password')} />;
  }
  return <div className="flex h-screen bg-white overflow-hidden"><Toaster position="top-right" richColors /><Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout} /><main className="flex-1 overflow-y-auto">
    {currentScreen === 'dashboard' && <Dashboard onNavigate={handleNavigate} jobs={jobs} historyJobs={historyJobs} filaments={filaments} />}
    {currentScreen === 'kanban' && <KanbanBoard onNavigate={handleNavigate} jobs={jobs} onJobStatusUpdated={handleJobStatusUpdated} filaments={filaments} />}
    {currentScreen === 'history' && <History historyJobs={historyJobs} onRemoveFromHistory={handleRemoveFromHistory} onNavigate={handleNavigate} filaments={filaments} />}
    {currentScreen === 'job-details' && <JobDetails onNavigate={handleNavigate} onAddJob={handleJobCreated} availableFilaments={filaments} jobId={selectedJobId} jobs={jobs} historyJobs={historyJobs} />}
    {currentScreen === 'inventory' && <FilamentInventory filaments={filaments} setFilaments={setFilaments} />}
    {currentScreen === 'reports' && <Reports historyJobs={historyJobs} filaments={filaments} />}
    {currentScreen === 'settings' && <Settings />}
  </main></div>;
}
