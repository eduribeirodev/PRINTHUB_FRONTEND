import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileDown, FileSpreadsheet, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useMemo } from 'react';

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

interface ReportsProps {
  historyJobs?: HistoryJob[];
  filaments?: Filament[];
}

export function Reports({ historyJobs = [], filaments = [] }: ReportsProps) {
  const COLORS = ['#4C00FF', '#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#14B8A6'];

  // Calcular consumo por marca/tipo
  const consumptionByBrandType = useMemo(() => {
    const consumptionMap = new Map<string, { value: number; color: string }>();
    
    historyJobs.forEach(job => {
      const weight = parseFloat(job.materialWeight || '0');
      if (!isNaN(weight)) {
        job.filamentIds.forEach(filamentId => {
          const filament = filaments.find(f => f.id === filamentId);
          if (filament) {
            const key = `${filament.type} - ${filament.brand}`;
            const current = consumptionMap.get(key) || { value: 0, color: '' };
            consumptionMap.set(key, {
              value: current.value + (weight / job.filamentIds.length),
              color: current.color || COLORS[consumptionMap.size % COLORS.length]
            });
          }
        });
      }
    });
    
    return Array.from(consumptionMap.entries())
      .map(([name, data]) => ({
        name,
        value: Math.round(data.value),
        color: data.color
      }))
      .sort((a, b) => b.value - a.value);
  }, [historyJobs, filaments]);

  // Calcular custos mensais (últimos 4 meses)
  const monthlyCosts = useMemo(() => {
    const monthsMap = new Map<string, { material: number; energia: number }>();
    
    // Criar últimos 4 meses
    const months = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      const monthFull = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      months.push({ key: monthKey.slice(0, 3), full: monthFull });
      monthsMap.set(monthFull, { material: 0, energia: 0 });
    }
    
    // Calcular custos de material por mês
    historyJobs.forEach(job => {
      const cost = parseFloat(job.estimatedCost.replace('R$', '').replace(',', '.').trim());
      if (!isNaN(cost)) {
        const current = monthsMap.get(job.month);
        if (current) {
          monthsMap.set(job.month, {
            material: current.material + cost,
            energia: current.energia
          });
        }
      }
    });
    
    // Adicionar custos de energia estimados (simulados baseados em material)
    monthsMap.forEach((value, key) => {
      // Estimar energia como ~18% do custo de material
      monthsMap.set(key, {
        ...value,
        energia: value.material * 0.18
      });
    });
    
    return months.map(month => ({
      month: month.key,
      material: parseFloat((monthsMap.get(month.full)?.material || 0).toFixed(2)),
      energia: parseFloat((monthsMap.get(month.full)?.energia || 0).toFixed(2))
    }));
  }, [historyJobs]);

  // Preparar histórico com dados formatados
  const completedHistory = useMemo(() => {
    return historyJobs.map(job => {
      const filamentNames = job.filamentIds
        .map(id => {
          const filament = filaments.find(f => f.id === id);
          return filament ? `${filament.type} ${filament.color} - ${filament.brand}` : '';
        })
        .filter(name => name)
        .join(' + ');
      
      return {
        name: job.fileName,
        cost: job.estimatedCost,
        material: filamentNames ? `${filamentNames} (${job.materialWeight || '0g'})` : 'Sem filamento',
        date: job.completedDate
      };
    });
  }, [historyJobs, filaments]);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(76, 0, 255); // #4C00FF
      doc.text('PrintHub - Relatório de Impressões', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // #6B7280
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
      
      // Seção 1: Consumo por Marca/Tipo
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Consumo Total por Marca/Tipo de Filamento', 14, 40);
      
      const consumptionData = consumptionByBrandType.map(item => [
        item.name,
        `${item.value}g`,
        `${((item.value / consumptionByBrandType.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%`
      ]);
      
      autoTable(doc, {
        startY: 45,
        head: [['Marca/Tipo', 'Consumo', 'Percentual']],
        body: consumptionData,
        theme: 'grid',
        headStyles: { fillColor: [76, 0, 255] },
      });
      
      // Seção 2: Custos Mensais
      const finalY1 = (doc as any).lastAutoTable.finalY || 45;
      doc.setFontSize(14);
      doc.text('Custos Mensais (Material vs Energia)', 14, finalY1 + 15);
      
      const costsData = monthlyCosts.map(item => [
        item.month,
        `R$ ${item.material.toFixed(2)}`,
        `R$ ${item.energia.toFixed(2)}`,
        `R$ ${(item.material + item.energia).toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: finalY1 + 20,
        head: [['Mês', 'Material', 'Energia', 'Total']],
        body: costsData,
        theme: 'grid',
        headStyles: { fillColor: [76, 0, 255] },
      });
      
      // Seção 3: Histórico de Impressões
      const finalY2 = (doc as any).lastAutoTable.finalY || finalY1 + 20;
      
      // Verificar se precisa de nova página
      if (finalY2 > 200) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Histórico de Impressões Concluídas', 14, 20);
        
        const historyData = completedHistory.map(item => [
          item.name,
          item.material,
          item.cost,
          item.date
        ]);
        
        autoTable(doc, {
          startY: 25,
          head: [['Nome', 'Material Usado', 'Custo', 'Data']],
          body: historyData,
          theme: 'grid',
          headStyles: { fillColor: [76, 0, 255] },
        });
      } else {
        doc.setFontSize(14);
        doc.text('Histórico de Impressões Concluídas', 14, finalY2 + 15);
        
        const historyData = completedHistory.map(item => [
          item.name,
          item.material,
          item.cost,
          item.date
        ]);
        
        autoTable(doc, {
          startY: finalY2 + 20,
          head: [['Nome', 'Material Usado', 'Custo', 'Data']],
          body: historyData,
          theme: 'grid',
          headStyles: { fillColor: [76, 0, 255] },
        });
      }
      
      // Salvar PDF
      doc.save(`PrintHub_Relatorio_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success('PDF exportado com sucesso!', {
        description: 'O relatório foi baixado para seu computador.',
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
      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Aba 1: Consumo por Marca/Tipo
      const consumptionData = [
        ['Consumo Total por Marca/Tipo de Filamento'],
        [],
        ['Marca/Tipo', 'Consumo (g)', 'Percentual'],
        ...consumptionByBrandType.map(item => [
          item.name,
          item.value,
          `${((item.value / consumptionByBrandType.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%`
        ]),
        [],
        ['Total', consumptionByBrandType.reduce((sum, item) => sum + item.value, 0), '100%']
      ];
      
      const ws1 = XLSX.utils.aoa_to_sheet(consumptionData);
      
      // Estilizar cabeçalho
      ws1['!cols'] = [{ width: 30 }, { width: 15 }, { width: 15 }];
      
      XLSX.utils.book_append_sheet(wb, ws1, 'Consumo por Tipo');
      
      // Aba 2: Custos Mensais
      const costsData = [
        ['Custos Mensais (Material vs Energia)'],
        [],
        ['Mês', 'Material (R$)', 'Energia (R$)', 'Total (R$)'],
        ...monthlyCosts.map(item => [
          item.month,
          item.material,
          item.energia,
          item.material + item.energia
        ]),
        [],
        [
          'Total',
          monthlyCosts.reduce((sum, item) => sum + item.material, 0),
          monthlyCosts.reduce((sum, item) => sum + item.energia, 0),
          monthlyCosts.reduce((sum, item) => sum + item.material + item.energia, 0)
        ]
      ];
      
      const ws2 = XLSX.utils.aoa_to_sheet(costsData);
      ws2['!cols'] = [{ width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }];
      
      XLSX.utils.book_append_sheet(wb, ws2, 'Custos Mensais');
      
      // Aba 3: Histórico de Impressões
      const historyData = [
        ['Histórico de Impressões Concluídas'],
        [],
        ['Nome', 'Material Usado', 'Custo', 'Data'],
        ...completedHistory.map(item => [
          item.name,
          item.material,
          item.cost,
          item.date
        ])
      ];
      
      const ws3 = XLSX.utils.aoa_to_sheet(historyData);
      ws3['!cols'] = [{ width: 30 }, { width: 35 }, { width: 15 }, { width: 15 }];
      
      XLSX.utils.book_append_sheet(wb, ws3, 'Histórico');
      
      // Salvar Excel
      XLSX.writeFile(wb, `PrintHub_Relatorio_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
      
      toast.success('Excel exportado com sucesso!', {
        description: 'O relatório foi baixado para seu computador.',
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1>Relatórios</h1>
        <div className="flex gap-4">
          <Select defaultValue="thisMonth">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">Este Mês</SelectItem>
              <SelectItem value="last3Months">Últimos 3 meses</SelectItem>
              <SelectItem value="last6Months">Últimos 6 meses</SelectItem>
              <SelectItem value="thisYear">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Módulo 1: Consumo Total por Marca/Tipo */}
      <Card className="p-6 mb-8">
        <h3 className="mb-6">Consumo Total por Marca/Tipo de Filamento</h3>
        {consumptionByBrandType.length > 0 ? (
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={consumptionByBrandType}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}g`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {consumptionByBrandType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}g`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-[#6B7280] mx-auto mb-4 opacity-50" />
            <p className="text-[#6B7280]">Nenhum dado de consumo disponível</p>
            <p className="text-[#9CA3AF] mt-2">Complete alguns jobs para visualizar o gráfico</p>
          </div>
        )}
      </Card>

      {/* Módulo 2: Custos Mensais */}
      <Card className="p-6 mb-8">
        <h3 className="mb-6">Custos Mensais (Material vs Energia)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyCosts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F7FC" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" label={{ value: 'Reais (R$)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
              formatter={(value) => [`R$ ${value}`, '']}
            />
            <Legend />
            <Bar dataKey="material" name="Material" fill="#4C00FF" radius={[8, 8, 0, 0]} />
            <Bar dataKey="energia" name="Energia" fill="#10B981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Módulo 3: Histórico de Impressões Concluídas */}
      <Card className="p-6">
        <h3 className="mb-6">Histórico de Impressões Concluídas</h3>
        {completedHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Material Usado</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedHistory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.material}</TableCell>
                  <TableCell>{item.cost}</TableCell>
                  <TableCell>{item.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">Nenhum job completado ainda</p>
            <p className="text-[#9CA3AF] mt-2">Jobs arquivados aparecerão aqui</p>
          </div>
        )}
      </Card>
    </div>
  );
}
