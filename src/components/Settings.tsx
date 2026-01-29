import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function Settings() {
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
              <Input id="workspace" defaultValue="Meu PrintHub" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select defaultValue="BRL">
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
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p>Alertas de Estoque Baixo</p>
                <p className="text-[#6B7280]">Notificar quando filamento estiver abaixo de 20%</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Configurações de Custos */}
        <Card className="p-6">
          <h3 className="mb-6">Configurações de Custos</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="energyCost">Custo de Energia (R$/kWh)</Label>
              <Input id="energyCost" type="number" defaultValue="0.75" />
              <p className="text-[#6B7280]">Usado para calcular custo de energia nas impressões</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="printerPower">Potência Média da Impressora (W)</Label>
              <Input id="printerPower" type="number" defaultValue="250" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Incluir Custo de Energia nos Relatórios</p>
                <p className="text-[#6B7280]">Adicionar estimativa de energia aos custos</p>
              </div>
              <Switch defaultChecked />
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
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p>Atualizar Inventário Automaticamente</p>
                <p className="text-[#6B7280]">Reduzir estoque ao mover job para "Concluído"</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancelar</Button>
          <Button style={{ backgroundColor: '#4C00FF' }}>Salvar Alterações</Button>
        </div>
      </div>
    </div>
  );
}
