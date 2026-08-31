import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, DollarSign, Droplet, Search, Calendar, Trash2, Eye, FileDown, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { type Filament, getFilamentNames } from '../utils/printHub';

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

interface HistoryProps {
  historyJobs: HistoryJob[];
  onRemoveFromHistory: (jobId: string) => void;
  onNavigate: (screen: string, jobId?: string) => void;
  filaments: Filament[];
}

export function History({ historyJobs, onRemoveFromHistory, onNavigate, filaments }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Extrair meses únicos dos jobs
  const uniqueMonths = Array.from(new Set(historyJobs.map(job => job.month))).sort().reverse();

  // Filtrar jobs baseado na busca e mês selecionado
  const filteredJobs = historyJobs.filter(job => {
    const filamentName = getFilamentNames(job.filamentIds, filaments);
    const matchesSearch = job.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         filamentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = selectedMonth === 'all' || job.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(76, 0, 255);
      doc.text('PrintHub - Histórico de Impressões', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
      doc.text(`Total de jobs: ${filteredJobs.length}`, 14, 34);
      
      // Preparar dados
      const tableData = filteredJobs.map(job => [
        job.fileName,
        getFilamentNames(job.filamentIds, filaments),
        job.estimatedTime,
        job.estimatedCost,
        job.completedDate,
      ]);
      
      autoTable(doc, {
        startY: 40,
        head: [['Nome do Arquivo', 'Filamento', 'Tempo', 'Custo', 'Data de Conclusão']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [76, 0, 255] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 50 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
        },
      });
      
      doc.save(`PrintHub_Historico_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success('PDF exportado com sucesso!', {
        description: 'O histórico foi baixado para seu computador.',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Erro ao exportar PDF', {
        description: 'Ocorreu um erro ao gerar o arquivo PDF.',
        duration: 3000,
      });
    }
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Preparar dados
      const data = [
        ['PrintHub - Histórico de Impressões'],
        [`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`],
        [`Total de jobs: ${filteredJobs.length}`],
        [],
        ['Nome do Arquivo', 'Filamento', 'Tempo Estimado', 'Custo', 'Data de Conclusão', 'Mês'],
        ...filteredJobs.map(job => [
          job.fileName,
          getFilamentNames(job.filamentIds, filaments),
          job.estimatedTime,
          job.estimatedCost,
          job.completedDate,
          job.month,
        ]),
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(data);
      
      // Configurar largura das colunas
      ws['!cols'] = [
        { width: 35 },
        { width: 30 },
        { width: 15 },
        { width: 12 },
        { width: 18 },
        { width: 20 },
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Histórico');
      
      XLSX.writeFile(wb, `PrintHub_Historico_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
      
      toast.success('Excel exportado com sucesso!', {
        description: 'O histórico foi baixado para seu computador.',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Erro ao exportar Excel', {
        description: 'Ocorreu um erro ao gerar o arquivo Excel.',
        duration: 3000,
      });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex justify-between items-start">
        <div>
          <h1>Histórico de Impressões</h1>
          <p className="text-[#6B7280] mt-2">Visualize todos os jobs finalizados e arquivados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <Input
              placeholder="Buscar por nome ou filamento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por Mês */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#6B7280]" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {uniqueMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-[#6B7280] mb-2">Total de Jobs Arquivados</p>
          <p className="text-[#4C00FF]">{filteredJobs.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[#6B7280] mb-2">Custo Total</p>
          <p className="text-[#10B981]">
            R$ {filteredJobs.reduce((sum, job) => {
              const cost = parseFloat(job.estimatedCost.replace('R$', '').replace(',', '.').trim());
              return sum + cost;
            }, 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[#6B7280] mb-2">Tempo Total de Impressão</p>
          <p className="text-[#F59E0B]">
            {filteredJobs.reduce((sum, job) => {
              const [hours, minutes] = job.estimatedTime.replace('h', '').replace('m', '').split(' ').map(n => parseInt(n) || 0);
              return sum + hours * 60 + minutes;
            }, 0) / 60} horas
          </p>
        </Card>
      </div>

      {/* Lista de Jobs */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-[#6B7280]">Nenhum job encontrado</p>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-3">
                    <h4 className="mb-2">{job.fileName}</h4>
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Concluído em: {job.completedDate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Droplet className="w-4 h-4" />
                      <span className="text-sm">{getFilamentNames(job.filamentIds, filaments)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{job.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">{job.estimatedCost}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('job-details', job.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveFromHistory(job.id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
