import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';

const defaultSettings = { workspace: 'Meu PrintHub', currency: 'BRL', emailNotifications: true, lowStockAlerts: true, energyCost: '0.75', printerPower: '250', includeEnergyCost: true, autoArchive: false, autoUpdateInventory: true };

const normalizeSettings = (payload: any) => ({
  ...defaultSettings,
  ...(payload?.settings ?? payload ?? {}),
});

export function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [savedSettings, setSavedSettings] = useState(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then((response) => {
        const loadedSettings = normalizeSettings(response.data);
        setSettings(loadedSettings);
        setSavedSettings(loadedSettings);
      })
      .catch(() => undefined);
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const payload = { settings };
      const response = await api.put('/settings', payload);
      const nextSettings = normalizeSettings(response.data ?? settings);
      setSettings(nextSettings);
      setSavedSettings(nextSettings);
      toast.success('Configurações salvas.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Verifique os dados e tente novamente.';
      toast.error('Não foi possível salvar as configurações.', { description: message });
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="p-8 ">
      <div className="mb-8">
        <h1>Configurações</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Configurações Gerais */}
        <Card className="p-6">
          <h3 className="mb-6">Configurações Gerais</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workspace">Nome do Workspace</Label>
              <Input id="workspace" value={settings.workspace} onChange={(event) => setSettings({ ...settings, workspace: event.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select value={settings.currency} onValueChange={(currency) => setSettings({ ...settings, currency })}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Notificações de E-mail</p>
                <p className="text-[#6B7280]">Receber relatórios mensais</p>
              </div>
              <Switch checked={settings.emailNotifications} onCheckedChange={(emailNotifications) => setSettings({ ...settings, emailNotifications })} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p>Alertas de Estoque Baixo</p>
                <p className="text-[#6B7280]">Notificar quando filamento estiver abaixo de 20%</p>
              </div>
              <Switch checked={settings.lowStockAlerts} onCheckedChange={(lowStockAlerts) => setSettings({ ...settings, lowStockAlerts })} />
            </div>
          </div>
        </Card>

        {/* Configurações de Custos */}
        <Card className="p-6">
          <h3 className="mb-6">Configurações de Custos</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="energyCost">Custo de Energia (R$/kWh)</Label>
              <Input id="energyCost" type="number" value={settings.energyCost} onChange={(event) => setSettings({ ...settings, energyCost: event.target.value })} />
              <p className="text-[#6B7280]">Usado para calcular custo de energia nas impressões</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="printerPower">Potência Média da Impressora (W)</Label>
              <Input id="printerPower" type="number" value={settings.printerPower} onChange={(event) => setSettings({ ...settings, printerPower: event.target.value })} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Incluir Custo de Energia nos Relatórios</p>
                <p className="text-[#6B7280]">Adicionar estimativa de energia aos custos</p>
              </div>
              <Switch checked={settings.includeEnergyCost} onCheckedChange={(includeEnergyCost) => setSettings({ ...settings, includeEnergyCost })} />
            </div>
          </div>
        </Card>

        {/* Configurações do Kanban */}
        <Card className="p-6">
          <h3 className="mb-6">Configurações do Kanban</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p>Auto-arquivar Jobs Concluídos</p>
                <p className="text-[#6B7280]">Mover automaticamente para arquivo após 30 dias</p>
              </div>
              <Switch checked={settings.autoArchive} onCheckedChange={(autoArchive) => setSettings({ ...settings, autoArchive })} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p>Atualizar Inventário Automaticamente</p>
                <p className="text-[#6B7280]">Reduzir estoque ao mover job para "Concluído"</p>
              </div>
              <Switch checked={settings.autoUpdateInventory} onCheckedChange={(autoUpdateInventory) => setSettings({ ...settings, autoUpdateInventory })} />
            </div>
          </div>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setSettings(savedSettings)} disabled={isSaving}>Cancelar</Button>
          <Button style={{ backgroundColor: '#4C00FF' }} onClick={saveSettings} disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</Button>
        </div>
      </div>
    </div>
  );
}
