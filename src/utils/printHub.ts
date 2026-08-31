export interface Job {
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

export interface HistoryJob extends Omit<Job, 'status'> {
  completedDate: string;
  month: string;
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

export type ApiFilament = {
  id: number;
  brand: string;
  type: string;
  colorName: string;
  colorHex: string;
  pricePerKg: string | number;
  initialQuantity: string | number;
  currentQuantity: string | number;
};

export type ApiJob = {
  id: number;
  fileName: string;
  status: 'BACKLOG' | 'TODO' | 'INPROGRESS' | 'APPROVAL' | 'COMPLETED';
  estimatedTimeMinutes: number;
  estimatedCost: string | number;
  quantity: number;
  materialWeightGrams: string | number;
  layers: number;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  filaments?: Array<ApiFilament & { pivot?: { weight_grams: string | number } }>;
};

export const getFilamentNames = (ids: string[] | undefined, filaments: Filament[]) => {
  const safeIds = Array.isArray(ids) ? ids : [];
  const names = safeIds
    .map((id) => filaments.find((filament) => filament.id === id))
    .filter((filament): filament is Filament => Boolean(filament))
    .map((filament) => `${filament.type} ${filament.color} - ${filament.brand}`);

  return names.length ? names.join(' + ') : 'Sem filamento';
};

export const mapFilament = (filament: ApiFilament): Filament => ({
  id: String(filament.id),
  color: filament.colorName,
  colorHex: filament.colorHex,
  brand: filament.brand,
  type: filament.type,
  pricePerKg: Number(filament.pricePerKg),
  initialQuantity: Number(filament.initialQuantity),
  remainingQuantity: Number(filament.currentQuantity),
});

export const mapJob = (job: ApiJob): Job => ({
  id: String(job.id),
  fileName: job.fileName ?? 'Job sem nome',
  estimatedTime: `${Math.floor((Number(job.estimatedTimeMinutes) || 0) / 60)}h ${(Number(job.estimatedTimeMinutes) || 0) % 60}m`,
  estimatedCost: `R$ ${Number(job.estimatedCost ?? 0).toFixed(2)}`,
  status: statusFromApi[job.status] ?? 'backlog',
  quantity: Number(job.quantity ?? 1),
  materialWeight: `${Number(job.materialWeightGrams ?? 0)}g`,
  layers: String(job.layers ?? 0),
  filamentIds: Array.isArray(job.filaments)
    ? job.filaments.map((filament) => String(filament?.id ?? '')).filter(Boolean)
    : [],
  filamentWeights: Array.isArray(job.filaments)
    ? job.filaments.map((filament) => Number(filament.pivot?.weight_grams ?? 0))
    : [],
});

export const mapHistoryJob = (job: ApiJob): HistoryJob => {
  const completedAt = new Date(job.completed_at ?? job.updated_at);
  return {
    ...mapJob(job),
    completedDate: completedAt.toLocaleDateString('pt-BR'),
    month: completedAt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  };
};

const statusFromApi: Record<ApiJob['status'], Job['status']> = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  INPROGRESS: 'inProgress',
  APPROVAL: 'approval',
  COMPLETED: 'completed',
};
