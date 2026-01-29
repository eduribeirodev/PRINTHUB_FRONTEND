import { LayoutDashboard, Package, List, FileText, Settings, LogOut, History } from 'lucide-react';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ currentScreen, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'kanban', icon: List, label: 'Fila de Impressões' },
    { id: 'history', icon: History, label: 'Histórico' },
    { id: 'inventory', icon: Package, label: 'Inventário' },
    { id: 'reports', icon: FileText, label: 'Relatórios' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="w-64 h-screen bg-[#F4F7FC] border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-[#4C00FF]">PrintHub</h1>
      </div>
      
      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#4C00FF] text-white' 
                  : 'text-[#1E1E1E] hover:bg-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#1E1E1E] hover:bg-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
