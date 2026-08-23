import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Upload, Clock, DollarSign, Droplet, Box, AlertCircle, Edit3, Palette, Plus, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';
import api from '../services/api';
import { ApiJob, Job as AppJob, mapJob } from '../App';

interface Job {
  fileName: string;
  estimatedTime: string;
  estimatedCost: string;
  quantity?: number;
  materialWeight?: string;
  layers?: string;
  filamentIds: string[]; // IDs dos filamentos para dedução do estoque
}

interface FilamentOption {
  id: string;
  color: string;
  colorHex: string;
  brand: string;
  type: string;
  pricePerKg: number;
  initialQuantity: number;
  remainingQuantity: number;
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

interface JobDetailsProps {
  onNavigate: (screen: string) => void;
  onAddJob: (job: AppJob) => void;
  availableFilaments: FilamentOption[];
  jobId?: string;
  jobs?: AppJob[];
  historyJobs?: HistoryJob[];
}

interface ColorChange {
  weight: number;
  filamentId: string;
}

export function JobDetails({ onNavigate, onAddJob, availableFilaments: availableFilamentsProp, jobId, jobs = [], historyJobs = [] }: JobDetailsProps) {
  const [isViewMode, setIsViewMode] = useState(false);
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [jobName, setJobName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedFilaments, setSelectedFilaments] = useState<string[]>(['']);
  
  // Estados para entrada manual
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualWeight, setManualWeight] = useState('');
  const [layers, setLayers] = useState('');
  const [baseFilamentWeight, setBaseFilamentWeight] = useState('');
  
  // Estados para múltiplas cores
  const [hasMultipleColors, setHasMultipleColors] = useState(false);
  const [colorChanges, setColorChanges] = useState<ColorChange[]>([]);

  const stlInputRef = useRef<HTMLInputElement>(null);

  // Dados do inventário de filamentos (vindos do App.tsx)
  const availableFilaments = availableFilamentsProp;

  // Helper para gerar o nome do filamento
  const getFilamentName = (filament: FilamentOption) => {
    return `${filament.type} ${filament.color} - ${filament.brand}`;
  };

  // Carregar dados do job se estiver em modo de visualização/edição
  useEffect(() => {
    if (jobId) {
      // Procurar primeiro nos jobs ativos, depois no histórico
      let existingJob = jobs.find(j => j.id === jobId);
      let isHistoryJob = false;
      
      if (!existingJob) {
        existingJob = historyJobs.find(j => j.id === jobId);
        isHistoryJob = true;
      }
      
      if (existingJob) {
        setIsViewMode(true);
        setJobName(existingJob.fileName);
        setQuantity(existingJob.quantity || 1);
        
        // Restaurar dados manuais
        if (existingJob.estimatedTime) {
          const timeMatch = existingJob.estimatedTime.match(/(\d+)h\s*(\d+)m/);
          if (timeMatch) {
            setManualHours(timeMatch[1]);
            setManualMinutes(timeMatch[2]);
          }
        }
        
        if (existingJob.materialWeight) {
          const weightMatch = existingJob.materialWeight.match(/(\d+\.?\d*)/);
          if (weightMatch) {
            setManualWeight(weightMatch[1]);
          }
        }
        
        // Restaurar filamentos selecionados
        if (existingJob.filamentIds && existingJob.filamentIds.length > 0) {
          setSelectedFilaments(existingJob.filamentIds);
        }
      }
    } else {
      // Se não houver jobId, resetar para modo de criação
      setIsViewMode(false);
    }
  }, [jobId, jobs, historyJobs]);

  const handleStlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.stl')) {
        toast.error('Arquivo inválido', {
          description: 'Por favor, selecione um arquivo .STL',
        });
        return;
      }
      setStlFile(file);
      if (!jobName) {
        setJobName(file.name.replace('.stl', ''));
      }
      toast.success('STL carregado', {
        description: `${file.name} foi carregado com sucesso.`,
      });
    }
  };

  const calculateCost = () => {
    if (!manualWeight) return 0;

    let totalCost = 0;

    // Custo simples (uma cor)
    const weightInKg = parseFloat(manualWeight) / 1000;
    if (selectedFilaments[0]) {
      const filament = availableFilaments.find(f => f.id === selectedFilaments[0]);
      if (filament) {
        totalCost = weightInKg * filament.pricePerKg;
      }
    }

    return (totalCost * quantity).toFixed(2);
  };

  const calculateTotalTime = () => {
    if (!manualHours || !manualMinutes) return '';
    
    // Se quantidade é 1, retornar o tempo original
    if (quantity === 1) return `${manualHours}h ${manualMinutes}m`;
    
    const totalMinutes = (parseInt(manualHours) * 60 + parseInt(manualMinutes)) * quantity;
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = Math.round(totalMinutes % 60);
    
    return `${totalHours}h ${remainingMinutes}m`;
  };

  const isFormValid = () => {
    if (!stlFile) return false;
    if (!manualHours || !manualMinutes || !manualWeight || !layers) return false;
    if (!selectedFilaments[0]) return false;
    return true;
  };

  const handleCreateJob = async () => {
    if (!isFormValid() || !stlFile) return;

    if (hasMultipleColors || selectedFilaments.length > 1) {
      toast.error('Múltiplas cores ainda não são suportadas pela API.', {
        description: 'O backend atual aceita somente um filamento por job.',
      });
      return;
    }

    const totalMinutes = (Number(manualHours) * 60 + Number(manualMinutes)) * quantity;
    const totalWeight = Number(manualWeight) * quantity;
    const formData = new FormData();
    formData.append('fileName', jobName || stlFile.name);
    formData.append('status', 'BACKLOG');
    formData.append('filament_id', selectedFilaments[0]);
    formData.append('estimatedTimeMinutes', String(totalMinutes));
    formData.append('estimatedCost', calculateCost());
    formData.append('quantity', String(quantity));
    formData.append('materialWeightGrams', String(totalWeight));
    formData.append('layers', layers);
    formData.append('stl_file', stlFile);

    try {
      const response = await api.post<ApiJob>('/jobs', formData);
      onAddJob(mapJob(response.data));
      toast.success('Job salvo no servidor.');
      onNavigate('kanban');
    } catch (error: any) {
      toast.error('Não foi possível salvar o job.', {
        description: error.response?.data?.message || 'Confira os dados e o estoque de filamento.',
      });
    }
  };

  // Se estiver em modo de visualização, mostrar interface diferente
  if (isViewMode) {
    // Detectar se é um job do histórico
    const isHistoryJob = historyJobs.find(j => j.id === jobId);
    
    return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1>Detalhes do Job</h1>
            <p className="text-[#6B7280] mt-2">Visualize os detalhes da impressão</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => onNavigate(isHistoryJob ? 'history' : 'kanban')}
          >
            Voltar para {isHistoryJob ? 'Histórico' : 'Kanban'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Coluna Esquerda */}
          <div className="space-y-6">
            {/* Informações do Job */}
            <Card className="p-6">
              <h4 className="mb-4">Informações Gerais</h4>
              <div className="space-y-4">
                <div>
                  <Label>Nome do Arquivo</Label>
                  <p className="mt-1 text-lg">{jobName}</p>
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <p className="mt-1 text-lg">{quantity} {quantity > 1 ? 'unidades' : 'unidade'}</p>
                </div>
              </div>
            </Card>

            {/* Filamentos Utilizados */}
            <Card className="p-6">
              <h4 className="mb-4">Filamento{selectedFilaments.length > 1 ? 's' : ''} Utilizado{selectedFilaments.length > 1 ? 's' : ''}</h4>
              <div className="space-y-3">
                {selectedFilaments.length > 0 && selectedFilaments[0] ? (
                  selectedFilaments.map((filamentId, index) => {
                    const filament = availableFilaments.find(f => f.id === filamentId);
                    if (!filament) return null;
                    
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[#F4F7FC] rounded-lg">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: filament.colorHex }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{getFilamentName(filament)}</p>
                          <p className="text-sm text-[#6B7280]">R$ {filament.pricePerKg}/kg</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[#6B7280]">Nenhum filamento especificado</p>
                )}
              </div>
            </Card>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-6">
            {/* Resumo da Impressão */}
            {(manualHours || manualMinutes) && (
              <Card className="p-6">
                <h4 className="mb-4">Resumo da Impressão</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#4C00FF] mt-1" />
                    <div className="flex-1">
                      <p className="text-[#6B7280]">Tempo Total</p>
                      <p className="text-lg"><strong>{calculateTotalTime() || `${manualHours}h ${manualMinutes}m`}</strong></p>
                    </div>
                  </div>
                  
                  {manualWeight && (
                    <div className="flex items-start gap-3">
                      <Droplet className="w-5 h-5 text-[#4C00FF] mt-1" />
                      <div className="flex-1">
                        <p className="text-[#6B7280]">Consumo de Filamento</p>
                        <p className="text-lg">
                          <strong>
                            {quantity > 1 
                              ? `${(parseFloat(manualWeight) * quantity).toFixed(1)}g (${manualWeight}g por unidade)`
                              : `${manualWeight}g`
                            }
                          </strong>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-[#4C00FF] mt-1" />
                    <div className="flex-1">
                      <p className="text-[#6B7280]">Custo Total Estimado</p>
                      <p className="text-lg text-[#4C00FF]">
                        <strong>R$ {calculateCost()}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Status do Job */}
            <Card className="p-6 bg-[#F4F7FC]">
              <h4 className="mb-4">Status</h4>
              <div className="space-y-3">
                {(() => {
                  // Procurar job ativo
                  const activeJob = jobs.find(j => j.id === jobId);
                  
                  // Procurar job no histórico
                  const historyJob = historyJobs.find(j => j.id === jobId);
                  
                  if (activeJob) {
                    const statusMap = {
                      'backlog': { label: 'Backlog', color: '#6B7280' },
                      'todo': { label: 'A Fazer', color: '#3B82F6' },
                      'inProgress': { label: 'Em Andamento', color: '#F59E0B' },
                      'approval': { label: 'Aprovação', color: '#8B5CF6' },
                      'completed': { label: 'Finalizado', color: '#10B981' },
                    };
                    const status = statusMap[activeJob.status as keyof typeof statusMap];
                    
                    return (
                      <Badge 
                        className="text-white px-4 py-2"
                        style={{ backgroundColor: status?.color }}
                      >
                        {status?.label}
                      </Badge>
                    );
                  } else if (historyJob) {
                    return (
                      <div className="space-y-2">
                        <Badge 
                          className="text-white px-4 py-2"
                          style={{ backgroundColor: '#10B981' }}
                        >
                          Arquivado
                        </Badge>
                        <p className="text-sm text-[#6B7280]">
                          Concluído em: {historyJob.completedDate}
                        </p>
                      </div>
                    );
                  }
                  
                  return null;
                })()}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Adicionar Job</h1>
        <p className="text-[#6B7280] mt-2">Configure uma nova impressão 3D</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Coluna Esquerda - Uploads e Dados */}
        <div className="space-y-6">
          {/* Upload STL - Obrigatório */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Box className="w-5 h-5 text-[#4C00FF]" />
              <h4>Arquivo STL (Obrigatório)</h4>
            </div>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#4C00FF] transition-colors cursor-pointer"
              onClick={() => stlInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
              <p className="text-[#1E1E1E] mb-2">Arraste um arquivo .stl aqui</p>
              <p className="text-[#6B7280]">ou clique para selecionar</p>
              <input 
                type="file"
                ref={stlInputRef}
                accept=".stl"
                onChange={handleStlUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  stlInputRef.current?.click();
                }}
              >
                Selecionar Arquivo
              </Button>
            </div>

            {stlFile && (
              <div className="mt-4 p-3 bg-[#F4F7FC] rounded-lg">
                <p className="text-[#6B7280]">Arquivo selecionado:</p>
                <p className="text-[#1E1E1E]">{stlFile.name}</p>
              </div>
            )}
          </Card>

          {/* Entrada Manual de Dados */}
          <Card className="p-6 border-[#4C00FF]">
            <div className="flex items-center gap-2 mb-4">
              <Edit3 className="w-5 h-5 text-[#4C00FF]" />
              <h4>Dados da Impressão</h4>
            </div>
            <Alert className="mb-4 bg-[#EDE9FE] border-[#4C00FF]">
              <AlertCircle className="h-4 w-4 text-[#4C00FF]" />
              <AlertDescription className="text-[#1E1E1E]">
                <strong>Informação:</strong> Preencha os dados estimados da impressão manualmente.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <div>
                <Label htmlFor="manual-time">Tempo Estimado</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <Input
                      id="manual-hours"
                      type="number"
                      min="0"
                      placeholder="Horas"
                      value={manualHours}
                      onChange={(e) => setManualHours(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      id="manual-minutes"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="Minutos"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="manual-weight">Peso do Filamento (gramas)</Label>
                <Input
                  id="manual-weight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Ex: 125.5"
                  value={manualWeight}
                  onChange={(e) => setManualWeight(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="layers">Número de camadas</Label>
                <Input
                  id="layers"
                  type="number"
                  min="1"
                  placeholder="Ex: 250"
                  value={layers}
                  onChange={(e) => setLayers(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Nome do Job */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="job-name">Nome do Job</Label>
                <Input
                  id="job-name"
                  type="text"
                  placeholder="Ex: miniatura_dragao"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna Direita - Filamentos e Resumo */}
        <div className="space-y-6">
          {/* Seleção de Filamento */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-[#4C00FF]" />
              <h4>Filamento</h4>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="filament-select">Filamento Principal (Cor Base)</Label>
                <Select 
                  value={selectedFilaments[0]} 
                  onValueChange={(value) => setSelectedFilaments([value])}
                >
                  <SelectTrigger id="filament-select" className="mt-2">
                    <SelectValue placeholder="Escolha um filamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFilaments.map((filament) => (
                      <SelectItem key={filament.id} value={filament.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: filament.colorHex }}
                          />
                          <span>{getFilamentName(filament)} - R$ {filament.pricePerKg}/kg</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Switch para Múltiplas Cores */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <Label>Múltiplas Cores</Label>
                  <p className="text-sm text-[#6B7280] mt-1">Ativar troca de cor durante a impressão</p>
                </div>
                <Switch
                  checked={hasMultipleColors}
                  onCheckedChange={(checked) => {
                    setHasMultipleColors(checked);
                    if (!checked) {
                      setColorChanges([]);
                      setSelectedFilaments([selectedFilaments[0]]);
                    }
                  }}
                />
              </div>
              
              {/* Trocas de Cor */}
              {hasMultipleColors && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <Label>Trocas de Cor</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setColorChanges([...colorChanges, { weight: 0, filamentId: '' }]);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Troca
                    </Button>
                  </div>
                  
                  {colorChanges.length === 0 && (
                    <Alert className="bg-[#F4F7FC]">
                      <AlertDescription className="text-[#6B7280]">
                        Clique em "Adicionar Troca" para configurar trocas de cor
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {colorChanges.map((change, index) => (
                    <div key={index} className="p-3 bg-[#F4F7FC] rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Troca {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newChanges = colorChanges.filter((_, i) => i !== index);
                            setColorChanges(newChanges);
                            // Atualizar selectedFilaments
                            const newFilaments = [selectedFilaments[0]];
                            newChanges.forEach(c => {
                              if (c.filamentId) newFilaments.push(c.filamentId);
                            });
                            setSelectedFilaments(newFilaments);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Peso da Troca (g)</Label>
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="Ex: 150"
                          value={change.weight || ''}
                          onChange={(e) => {
                            const newChanges = [...colorChanges];
                            newChanges[index].weight = parseFloat(e.target.value) || 0;
                            setColorChanges(newChanges);
                          }}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Filamento</Label>
                        <Select
                          value={change.filamentId}
                          onValueChange={(value) => {
                            const newChanges = [...colorChanges];
                            newChanges[index].filamentId = value;
                            setColorChanges(newChanges);
                            // Atualizar selectedFilaments
                            const newFilaments = [selectedFilaments[0]];
                            newChanges.forEach(c => {
                              if (c.filamentId) newFilaments.push(c.filamentId);
                            });
                            setSelectedFilaments(newFilaments);
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Escolha o filamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFilaments.map((filament) => (
                              <SelectItem key={filament.id} value={filament.id}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: filament.colorHex }}
                                  />
                                  <span>{getFilamentName(filament)}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  
                  {colorChanges.length > 0 && (
                    <Alert className="bg-[#EDE9FE] border-[#4C00FF]">
                      <AlertCircle className="h-4 w-4 text-[#4C00FF]" />
                      <AlertDescription className="text-[#1E1E1E]">
                        <strong>Dica:</strong> A impressora pausará nas camadas especificadas para você trocar o filamento manualmente.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Resumo dos Dados Manuais */}
          {manualHours && manualMinutes && manualWeight && (
            <Card className="p-6 bg-[#EDE9FE] border-[#4C00FF]">
              <h4 className="mb-4">Dados da Impressão</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#4C00FF] mt-1" />
                  <div className="flex-1">
                    <p className="text-[#6B7280]">Tempo Estimado</p>
                    <p className="text-lg">
                      <strong>{manualHours}h {manualMinutes}m</strong>
                      {quantity > 1 && (
                        <span className="text-sm text-[#6B7280] ml-2">
                          (×{quantity} = {(() => {
                            const totalMinutes = (parseInt(manualHours) * 60 + parseInt(manualMinutes)) * quantity;
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = Math.round(totalMinutes % 60);
                            return `${hours}h ${minutes}m`;
                          })()})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Droplet className="w-5 h-5 text-[#4C00FF] mt-1" />
                  <div className="flex-1">
                    <p className="text-[#6B7280]">Total em gramas da cor {filament.name}</p>
                    <p className="text-lg">
                      <strong>{manualWeight}g</strong>
                      {quantity > 1 && (
                        <span className="text-sm text-[#6B7280] ml-2">
                          (×{quantity} = {(parseFloat(manualWeight) * quantity).toFixed(1)}g)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Custo Estimado */}
          {isFormValid() && (
            <Card className="p-6 bg-[#F4F7FC]">
              <h4 className="mb-4">Custo Total Estimado</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-[#4C00FF] mt-1" />
                  <div className="flex-1">
                    <p className="text-[#6B7280]">Custo de Material</p>
                    {quantity > 1 && parseFloat(calculateCost()) > 0 && (
                      <p className="text-[#6B7280]">
                        R$ {(parseFloat(calculateCost()) / quantity).toFixed(2)} × {quantity} unidades
                      </p>
                    )}
                    <p className="text-[#4C00FF] mt-1">
                      R$ {calculateCost()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Ações */}
          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              style={{ backgroundColor: '#4C00FF' }}
              onClick={handleCreateJob}
              disabled={!isFormValid()}
            >
              Adicionar ao Backlog
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onNavigate('kanban')}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
