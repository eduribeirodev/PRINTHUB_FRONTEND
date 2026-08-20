import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pencil, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { HexColorPicker } from 'react-colorful';
import api from '../services/api'; 

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

interface FilamentFormData {
  color: string;
  colorHex: string;
  brand: string;
  type: string;
  pricePerKg: string;
  initialQuantity: string;
}

interface FilamentFormDialogContentProps {
  formData: FilamentFormData;
  setFormData: (data: FilamentFormData) => void;
  onSubmit: () => void;
  title: string;
  submitLabel: string;
}

function FilamentFormDialogContent({ 
  formData, 
  setFormData, 
  onSubmit, 
  title, 
  submitLabel 
}: FilamentFormDialogContentProps) {
  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="color">Cor</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="Ex: Cinza"
          />
        </div>

        <div className="space-y-2">
          <Label>Escolher Cor</Label>
          <div className="flex gap-4">
            <div className="flex-1">
              <HexColorPicker 
                color={formData.colorHex} 
                onChange={(color) => setFormData({ ...formData, colorHex: color })}
                style={{ width: '100%', height: '200px' }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div 
                className="w-20 h-20 rounded-lg border-2 border-gray-300 shadow-sm" 
                style={{ backgroundColor: formData.colorHex }}
              />
              <Input
                value={formData.colorHex}
                onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                placeholder="#9CA3AF"
                className="w-20 text-center"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            placeholder="Ex: Marca X"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PLA">PLA</SelectItem>
              <SelectItem value="ABS">ABS</SelectItem>
              <SelectItem value="PETG">PETG</SelectItem>
              <SelectItem value="TPU">TPU</SelectItem>
              <SelectItem value="Nylon">Nylon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$/kg)</Label>
          <Input
            id="price"
            type="number"
            value={formData.pricePerKg}
            onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
            placeholder="120.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade Inicial (g)</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.initialQuantity}
            onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
            placeholder="1000"
          />
        </div>

        <Button 
          className="w-full" 
          style={{ backgroundColor: '#4C00FF' }}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      </div>
    </DialogContent>
  );
}

export function FilamentInventory() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFilamentId, setEditingFilamentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FilamentFormData>({
    color: '',
    colorHex: '#9CA3AF',
    brand: '',
    type: 'PLA',
    pricePerKg: '',
    initialQuantity: '1000',
  });

  // 1. BUSCAR DADOS DO BACK-END QUANDO A TELA CARREGA
  useEffect(() => {
    async function fetchFilaments() {
      try {
        const response = await api.get('/filaments'); // Rota do Laravel[cite: 2]
        setFilaments(response.data);
      } catch (error) {
        console.error("Erro ao buscar filamentos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFilaments();
  }, []);

  const resetForm = () => {
    setFormData({
      color: '',
      colorHex: '#9CA3AF',
      brand: '',
      type: 'PLA',
      pricePerKg: '',
      initialQuantity: '1000',
    });
  };

  // 2. CADASTRAR NOVO FILAMENTO NO BANCO
  const handleAddFilament = async () => {
    try {
      const response = await api.post('/filaments', {
        color: formData.color,
        colorHex: formData.colorHex,
        brand: formData.brand,
        type: formData.type,
        pricePerKg: parseFloat(formData.pricePerKg),
        initialQuantity: parseInt(formData.initialQuantity),
      });

      // Adiciona o que voltou do banco na lista visual
      setFilaments([...filaments, response.data]);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao cadastrar filamento:", error);
    }
  };

  const handleEditClick = (filament: Filament) => {
    setEditingFilamentId(filament.id);
    setFormData({
      color: filament.color,
      colorHex: filament.colorHex,
      brand: filament.brand,
      type: filament.type,
      pricePerKg: filament.pricePerKg.toString(),
      initialQuantity: filament.initialQuantity.toString(),
    });
    setIsEditDialogOpen(true);
  };

  // 3. EDITAR FILAMENTO NO BANCO
  const handleEditFilament = async () => {
    if (!editingFilamentId) return;
    
    try {
      const response = await api.put(`/filaments/${editingFilamentId}`, {
        color: formData.color,
        colorHex: formData.colorHex,
        brand: formData.brand,
        type: formData.type,
        pricePerKg: parseFloat(formData.pricePerKg),
        initialQuantity: parseInt(formData.initialQuantity),
      });

      setFilaments(filaments.map(f => f.id === editingFilamentId ? response.data : f));
      setIsEditDialogOpen(false);
      setEditingFilamentId(null);
      resetForm();
    } catch (error) {
      console.error("Erro ao atualizar filamento:", error);
    }
  };

  // 4. DELETAR FILAMENTO DO BANCO
  const handleDeleteFilament = async (id: string) => {
    try {
      await api.delete(`/filaments/${id}`);
      setFilaments(filaments.filter(f => f.id !== id));
    } catch (error) {
      console.error("Erro ao deletar filamento:", error);
    }
  };

  const getPercentageRemaining = (filament: Filament) => {
    if (!filament.initialQuantity || filament.initialQuantity === 0) return 100;
    return (filament.remainingQuantity / filament.initialQuantity) * 100;
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando inventário do servidor...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1>Inventário de Filamentos</h1>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#4C00FF' }}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Novo Filamento
            </Button>
          </DialogTrigger>
          <FilamentFormDialogContent
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleAddFilament}
            title="Adicionar Novo Filamento"
            submitLabel="Adicionar"
          />
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingFilamentId(null);
            resetForm();
          }
        }}>
          <FilamentFormDialogContent
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditFilament}
            title="Editar Filamento"
            submitLabel="Salvar Alterações"
          />
        </Dialog>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cor</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Quantidade Inicial</TableHead>
              <TableHead>Quantidade Restante</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filaments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  Nenhum filamento cadastrado no banco de dados.
                </TableCell>
              </TableRow>
            ) : (
              filaments.map((filament) => {
                const percentage = getPercentageRemaining(filament);
                const isLow = percentage < 20;
                
                return (
                  <TableRow key={filament.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border border-gray-300" 
                          style={{ backgroundColor: filament.colorHex }}
                        />
                        <span>{filament.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>{filament.brand}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{filament.type}</Badge>
                    </TableCell>
                    <TableCell>R$ {Number(filament.pricePerKg).toFixed(2)} / kg</TableCell>
                    <TableCell>{filament.initialQuantity}g</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{filament.remainingQuantity}g</span>
                        {isLow && (
                          <Badge variant="outline" className="border-[#F59E0B] text-[#F59E0B]">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Baixo
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditClick(filament)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteFilament(filament.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}