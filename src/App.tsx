import { useState, useMemo } from 'react';
import type { FC, ReactNode, FormEvent } from 'react';
import { 
  Users, 
  Briefcase, 
  BarChart3, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  DollarSign, 
  CheckCircle2, 
  UserCheck, 
  ArrowRight
} from 'lucide-react';

// ==========================================
// 1. INTERFACES E TIPAGENS TYPESCRIPT
// ==========================================
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt: string;
}

interface Interaction {
  id: string;
  clientId: string;
  type: string;
  date: string;
  description: string;
}

interface Opportunity {
  id: string;
  clientId: string;
  title: string;
  value: number;
  stage: string;
  createdAt: string;
}

interface UserSession {
  name: string;
  email: string;
  role: string;
}

// ==========================================
// 2. CONSTANTES E DADOS INICIAIS
// ==========================================
const OPPORTUNITY_STAGES = [
  { id: 'Prospecção', label: 'Prospecção', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'Proposta', label: 'Proposta', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'Negociação', label: 'Negociação', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'Fechado/Ganho', label: 'Fechado / Ganho', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'Perdido', label: 'Perdido', color: 'bg-rose-100 text-rose-800 border-rose-300' }
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'cli-1', name: 'Ana Silva', email: 'ana.silva@techsolutions.com.br', phone: '(31) 98877-6655', company: 'TechSolutions Ltda', createdAt: '2026-10-15T10:00:00.000Z' },
  { id: 'cli-2', name: 'Carlos Eduardo', email: 'carlos@inovart.com', phone: '(31) 97766-5544', company: 'Inovart Design', createdAt: '2026-10-18T14:30:00.000Z' },
  { id: 'cli-3', name: 'Mariana Costa', email: 'm.costa@logisul.com.br', phone: '(31) 99123-4567', company: 'LogiSul Logística', createdAt: '2026-10-20T09:15:00.000Z' }
];

const INITIAL_INTERACTIONS: Interaction[] = [
  { id: 'int-1', clientId: 'cli-1', type: 'Reunião', date: '2026-10-21', description: 'Reunião presencial para levantamento de requisitos de software de gestão.' },
  { id: 'int-2', clientId: 'cli-1', type: 'E-mail', date: '2026-10-22', description: 'Proposta comercial enviada em PDF com tabela de preços.' },
  { id: 'int-3', clientId: 'cli-2', type: 'Ligação', date: '2026-10-23', description: 'Ligação de alinhamento sobre orçamento de reformulação de marca.' },
  { id: 'int-4', clientId: 'cli-3', type: 'Mensagem', date: '2026-10-24', description: 'Contato via WhatsApp confirmando interesse no módulo de logística.' }
];

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  { id: 'opp-1', clientId: 'cli-1', title: 'Implantação ERP Empresarial', value: 25000, stage: 'Proposta', createdAt: '2026-10-22T11:00:00.000Z' },
  { id: 'opp-2', clientId: 'cli-2', title: 'Redesign de Identidade Visual', value: 8500, stage: 'Negociação', createdAt: '2026-10-23T15:00:00.000Z' },
  { id: 'opp-3', clientId: 'cli-3', title: 'Módulo de Rastreamento de Frota', value: 14000, stage: 'Prospecção', createdAt: '2026-10-24T10:00:00.000Z' }
];

// ==========================================
// 3. REPOSITÓRIO DE DADOS (LOCALSTORAGE)
// ==========================================
class DataRepository {
  constructor() {
    this.initStorage();
  }

  initStorage(): void {
    if (!localStorage.getItem('crm_clients')) {
      localStorage.setItem('crm_clients', JSON.stringify(INITIAL_CLIENTS));
    }
    if (!localStorage.getItem('crm_interactions')) {
      localStorage.setItem('crm_interactions', JSON.stringify(INITIAL_INTERACTIONS));
    }
    if (!localStorage.getItem('crm_opportunities')) {
      localStorage.setItem('crm_opportunities', JSON.stringify(INITIAL_OPPORTUNITIES));
    }
  }

  resetToDemo(): void {
    localStorage.setItem('crm_clients', JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem('crm_interactions', JSON.stringify(INITIAL_INTERACTIONS));
    localStorage.setItem('crm_opportunities', JSON.stringify(INITIAL_OPPORTUNITIES));
  }

  getClients(): Client[] {
    return JSON.parse(localStorage.getItem('crm_clients') || '[]');
  }

  saveClient(client: Partial<Client>): Client[] {
    const clients = this.getClients();
    let updated: Client[];
    if (client.id) {
      updated = clients.map(c => c.id === client.id ? { ...c, ...client } as Client : c);
    } else {
      const newClient: Client = {
        id: 'cli-' + Date.now(),
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        createdAt: new Date().toISOString()
      };
      updated = [newClient, ...clients];
    }
    localStorage.setItem('crm_clients', JSON.stringify(updated));
    return updated;
  }

  deleteClient(id: string): void {
    const clients = this.getClients().filter(c => c.id !== id);
    const interactions = this.getInteractions().filter(i => i.clientId !== id);
    const opportunities = this.getOpportunities().filter(o => o.clientId !== id);
    
    localStorage.setItem('crm_clients', JSON.stringify(clients));
    localStorage.setItem('crm_interactions', JSON.stringify(interactions));
    localStorage.setItem('crm_opportunities', JSON.stringify(opportunities));
  }

  getInteractions(): Interaction[] {
    return JSON.parse(localStorage.getItem('crm_interactions') || '[]');
  }

  saveInteraction(interaction: Omit<Interaction, 'id'>): Interaction[] {
    const interactions = this.getInteractions();
    const newInt: Interaction = { ...interaction, id: 'int-' + Date.now() };
    const updated = [newInt, ...interactions];
    localStorage.setItem('crm_interactions', JSON.stringify(updated));
    return updated;
  }

  getOpportunities(): Opportunity[] {
    return JSON.parse(localStorage.getItem('crm_opportunities') || '[]');
  }

  saveOpportunity(opp: Omit<Opportunity, 'id' | 'createdAt'>): Opportunity[] {
    const opportunities = this.getOpportunities();
    let updated: Opportunity[];
    const newOpp: Opportunity = { ...opp, id: 'opp-' + Date.now(), createdAt: new Date().toISOString() };
    updated = [newOpp, ...opportunities];
    localStorage.setItem('crm_opportunities', JSON.stringify(updated));
    return updated;
  }

  updateOpportunityStage(id: string, newStage: string): Opportunity[] {
    const opportunities = this.getOpportunities();
    const updated = opportunities.map(o => o.id === id ? { ...o, stage: newStage } : o);
    localStorage.setItem('crm_opportunities', JSON.stringify(updated));
    return updated;
  }
}

const db = new DataRepository();

// ==========================================
// 4. COMPONENTES AUXILIARES E TELA DE LOGIN
// ==========================================
interface NavItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}

const NavItem: FC<NavItemProps> = ({ icon, label, active, badge, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
};

const LoginScreen: FC<{ onLogin: (email: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@projetocrm.edu.br');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative">
      <div className="absolute top-4 text-center text-amber-400 text-xs sm:text-sm font-medium bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full">
        ⚠️ AMBIENTE DE DEMONSTRAÇÃO ACADÊMICA - PROJETO CRM
      </div>

      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-3 border border-indigo-500/30">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Projeto CRM</h2>
          <p className="text-sm text-slate-400 mt-1">
            Acesso ao Protótipo Funcional MVP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              E-mail de Acesso
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Senha (Demonstração)
            </label>
            <input 
              type="password" 
              defaultValue="123456"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm flex items-center justify-center space-x-2"
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
          <button 
            type="button"
            onClick={() => onLogin('demo@projetocrm.edu.br')}
            className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 transition-colors flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Entrar Instantaneamente como Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  bgIcon: string;
  onClick: () => void;
}

const KpiCard: FC<KpiCardProps> = ({ title, value, subtitle, icon, bgIcon, onClick }) => {
  return (
    <div onClick={onClick} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-extrabold text-slate-900 mt-1">{value}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-2xl ${bgIcon}`}>{icon}</div>
    </div>
  );
};

// ==========================================
// 5. TELAS DO SISTEMA (VIEWS)
// ==========================================
interface DashboardProps {
  clients: Client[];
  opportunities: Opportunity[];
  onNavigate: (tab: string) => void;
  onNewClient: () => void;
  onNewOpp: () => void;
}

const DashboardView: FC<DashboardProps> = ({ clients, opportunities, onNavigate, onNewClient, onNewOpp }) => {
  const totalClients = clients.length;
  const totalOpportunities = opportunities.length;

  const openValue = useMemo(() => {
    return opportunities
      .filter(o => o.stage !== 'Fechado/Ganho' && o.stage !== 'Perdido')
      .reduce((sum: number, o: Opportunity) => sum + Number(o.value || 0), 0);
  }, [opportunities]);

  const totalWonValue = useMemo(() => {
    return opportunities
      .filter(o => o.stage === 'Fechado/Ganho')
      .reduce((sum: number, o: Opportunity) => sum + Number(o.value || 0), 0);
  }, [opportunities]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    OPPORTUNITY_STAGES.forEach(st => { counts[st.id] = 0; });
    opportunities.forEach((o: Opportunity) => {
      if (counts[o.stage] !== undefined) {
        counts[o.stage] += 1;
      }
    });
    return counts;
  }, [opportunities]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visão Geral & Indicadores</h2>
          <p className="text-sm text-slate-500">Métricas em tempo real do pipeline comercial</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onNewClient} className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm">
            <Plus className="w-4 h-4" /><span>Novo Cliente</span>
          </button>
          <button onClick={onNewOpp} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-md">
            <Plus className="w-4 h-4" /><span>Nova Oportunidade</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total de Clientes" value={totalClients} subtitle="Base de contatos" icon={<Users className="w-6 h-6 text-indigo-600" />} bgIcon="bg-indigo-50" onClick={() => onNavigate('clientes')} />
        <KpiCard title="Total de Oportunidades" value={totalOpportunities} subtitle="Em todos os estágios" icon={<Briefcase className="w-6 h-6 text-blue-600" />} bgIcon="bg-blue-50" onClick={() => onNavigate('oportunidades')} />
        <KpiCard title="Valor em Aberto" value={`R$ ${openValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} subtitle="Em negociação ativa" icon={<DollarSign className="w-6 h-6 text-amber-600" />} bgIcon="bg-amber-50" onClick={() => onNavigate('oportunidades')} />
        <KpiCard title="Vendas Realizadas" value={`R$ ${totalWonValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} subtitle="Etapa Fechado/Ganho" icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} bgIcon="bg-emerald-50" onClick={() => onNavigate('oportunidades')} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">Oportunidades por Etapa Comercial</h3>
        <p className="text-xs text-slate-500 mb-6">Distribuição atual do funil de vendas</p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {OPPORTUNITY_STAGES.map((stage) => {
            const count = stageCounts[stage.id] || 0;
            const percentage = totalOpportunities > 0 ? Math.round((count / totalOpportunities) * 100) : 0;
            return (
              <div key={stage.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${stage.color}`}>{stage.label}</span>
                  <div className="mt-3 text-2xl font-extrabold text-slate-800">{count}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{percentage}% do total</p>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface ClientsViewProps {
  clients: Client[];
  onSelectClient: (id: string) => void;
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

const ClientsView: FC<ClientsViewProps> = ({ clients, onSelectClient, onNewClient, onEditClient, onDeleteClient }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clients, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Clientes</h2>
          <p className="text-sm text-slate-500">Cadastre, pesquise e mantenha os dados da sua carteira</p>
        </div>
        <button onClick={onNewClient} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Novo Cliente</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, e-mail ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <th className="p-4">Cliente / Empresa</th>
              <th className="p-4">E-mail</th>
              <th className="p-4">Telefone</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum cliente encontrado.</td></tr>
            ) : (
              filteredClients.map(client => (
                <tr key={client.id} onClick={() => onSelectClient(client.id)} className="hover:bg-slate-50/80 cursor-pointer transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{client.name}</p>
                    <p className="text-xs text-slate-500">{client.company || 'Sem empresa'}</p>
                  </td>
                  <td className="p-4 text-slate-600">{client.email}</td>
                  <td className="p-4 text-slate-600">{client.phone || '-'}</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => onEditClient(client)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteClient(client)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface ClientDetailProps {
  clientId: string;
  clients: Client[];
  interactions: Interaction[];
  opportunities: Opportunity[];
  onBack: () => void;
  onAddInteraction: (interaction: Omit<Interaction, 'id'>) => void;
}

const ClientDetailView: FC<ClientDetailProps> = ({ clientId, clients, interactions, opportunities, onBack, onAddInteraction }) => {
  const [type, setType] = useState<string>('Reunião');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');

  const client = clients.find(c => c.id === clientId);
  const clientInteractions = interactions.filter(i => i.clientId === clientId);
  const clientOpportunities = opportunities.filter(o => o.clientId === clientId);

  if (!client) return <div>Cliente não encontrado.</div>;

  const handleSubmitInteraction = (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onAddInteraction({ clientId, type, date, description });
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center space-x-1">
        <span>← Voltar para listagem</span>
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{client.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{client.company || 'Empresa não informada'}</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-slate-600">
          <div className="flex items-center space-x-1.5"><Mail className="w-4 h-4 text-indigo-500" /><span>{client.email}</span></div>
          <div className="flex items-center space-x-1.5"><Phone className="w-4 h-4 text-indigo-500" /><span>{client.phone || 'Sem telefone'}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-base font-bold text-slate-900">Registrar Interação</h3>
          <form onSubmit={handleSubmitInteraction} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Interação</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {['Ligação', 'Reunião', 'E-mail', 'Mensagem'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes da conversa..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md">Adicionar Interação</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Histórico de Contatos ({clientInteractions.length})</h3>
            {clientInteractions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma interação registrada.</p>
            ) : (
              <div className="space-y-3">
                {clientInteractions.map(int => (
                  <div key={int.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{int.type}</span>
                      <span className="text-xs text-slate-400">{int.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">{int.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Oportunidades do Cliente ({clientOpportunities.length})</h3>
            {clientOpportunities.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma oportunidade vinculada.</p>
            ) : (
              <div className="space-y-3">
                {clientOpportunities.map(opp => (
                  <div key={opp.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{opp.title}</p>
                      <p className="text-slate-400">R$ {Number(opp.value).toLocaleString('pt-BR')}</p>
                    </div>
                    <span className="font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">{opp.stage}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface OpportunitiesProps {
  opportunities: Opportunity[];
  clients: Client[];
  onNewOpp: () => void;
  onUpdateStage: (id: string, newStage: string) => void;
}

const OpportunitiesView: FC<OpportunitiesProps> = ({ opportunities, clients, onNewOpp, onUpdateStage }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Oportunidades Comerciais</h2>
          <p className="text-sm text-slate-500">Acompanhe e altere as etapas do seu funil</p>
        </div>
        <button onClick={onNewOpp} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Nova Oportunidade</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <th className="p-4">Título</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Etapa Comercial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {opportunities.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma oportunidade cadastrada.</td></tr>
            ) : (
              opportunities.map(opp => {
                const client = clients.find(c => c.id === opp.clientId);
                return (
                  <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{opp.title}</td>
                    <td className="p-4 text-slate-600">{client ? client.name : 'Cliente Removido'}</td>
                    <td className="p-4 font-extrabold text-emerald-600">R$ {Number(opp.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4">
                      <select 
                        value={opp.stage} 
                        onChange={(e) => onUpdateStage(opp.id, e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                      >
                        {OPPORTUNITY_STAGES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettingsView: FC<{ user: UserSession; onResetData: () => void }> = ({ user, onResetData }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const sqlCode = `-- TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  empresa TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- TABELA DE INTERAÇÕES
CREATE TABLE IF NOT EXISTS public.interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- TABELA DE OPORTUNIDADES
CREATE TABLE IF NOT EXISTS public.oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  valor NUMERIC(12, 2) NOT NULL CHECK (valor >= 0),
  etapa TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações & Documentação SQL</h2>
        <p className="text-sm text-slate-500">Informações da sessão e script de banco de dados</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Usuário Conectado</h3>
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm flex justify-between items-center">
          <div><p className="text-xs text-slate-400">E-mail:</p><p className="font-bold text-slate-800">{user.email}</p></div>
          <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs px-3 py-1 rounded-full font-semibold">{user.role}</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Script SQL do Banco de Dados (PostgreSQL / Supabase)</h3>
          <button onClick={copySql} className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors">
            {copied ? 'Copiado!' : 'Copiar SQL'}
          </button>
        </div>
        <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs overflow-x-auto font-mono">{sqlCode}</pre>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Restaurar Dados Padrão (Demo)</h3>
        <button onClick={onResetData} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm">
          Restaurar Dados Iniciais de Demonstração
        </button>
      </div>
    </div>
  );
};

interface ClientModalProps {
  client: Client | null;
  existingClients: Client[];
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => void;
}

const ClientModal: FC<ClientModalProps> = ({ client, existingClients, onClose, onSave }) => {
  const [name, setName] = useState<string>(client ? client.name : '');
  const [email, setEmail] = useState<string>(client ? client.email : '');
  const [phone, setPhone] = useState<string>(client ? client.phone || '' : '');
  const [company, setCompany] = useState<string>(client ? client.company || '' : '');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Nome e e-mail são obrigatórios.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Formato de e-mail inválido.');
      return;
    }
    const emailClean = email.trim().toLowerCase();
    const duplicate = existingClients.some(c => c.email.toLowerCase() === emailClean && (!client || c.id !== client.id));
    if (duplicate) {
      setError('Já existe um cliente cadastrado com este e-mail.');
      return;
    }

    onSave({ id: client ? client.id : undefined, name, email: emailClean, phone, company });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">{client ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><CheckCircle2 className="w-5 h-5" /></button>
        </div>
        {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Nome *</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">E-mail *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Telefone</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Empresa</label><input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface OpportunityModalProps {
  clients: Client[];
  preselectedClientId: string | null;
  onClose: () => void;
  onSave: (oppData: Omit<Opportunity, 'id' | 'createdAt'>) => void;
}

const OpportunityModal: FC<OpportunityModalProps> = ({ clients, preselectedClientId, onClose, onSave }) => {
  const [title, setTitle] = useState<string>('');
  const [clientId, setClientId] = useState<string>(preselectedClientId || (clients[0] ? clients[0].id : ''));
  const [value, setValue] = useState<string>('');
  const [stage, setStage] = useState<string>('Prospecção');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numVal = parseFloat(value);
    if (!title.trim() || !clientId || isNaN(numVal)) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (numVal < 0) {
      setError('O valor não pode ser negativo.');
      return;
    }
    onSave({ title, clientId, value: numVal, stage });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Nova Oportunidade</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><CheckCircle2 className="w-5 h-5" /></button>
        </div>
        {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Título *</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required /></div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Cliente *</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required>
              <option value="">Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Valor (R$) *</label><input type="number" step="0.01" min="0" value={value} onChange={e => setValue(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required /></div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Etapa Inicial *</label>
            <select value={stage} onChange={e => setStage(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              {OPPORTUNITY_STAGES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal: FC<{ clientName: string; onClose: () => void; onConfirm: () => void }> = ({ clientName, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center">
        <h3 className="text-lg font-bold text-slate-900">Confirmar Exclusão</h3>
        <p className="text-xs text-slate-600">Deseja realmente excluir o cliente <strong>{clientName}</strong>? Todas as interações e oportunidades vinculadas serão removidas.</p>
        <div className="flex justify-center space-x-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl text-sm">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm shadow-md">Sim, Excluir</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. COMPONENTE PRINCIPAL (APP)
// ==========================================
export default function App() {
  const [user, setUser] = useState<UserSession | null>(() => JSON.parse(localStorage.getItem('crm_user') || 'null'));
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [clients, setClients] = useState<Client[]>(() => db.getClients());
  const [interactions, setInteractions] = useState<Interaction[]>(() => db.getInteractions());
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => db.getOpportunities());
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<Client | null>(null);
  const [isOppModalOpen, setIsOppModalOpen] = useState<boolean>(false);

  const loadData = () => {
    setClients(db.getClients());
    setInteractions(db.getInteractions());
    setOpportunities(db.getOpportunities());
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (email: string) => {
    const authUser: UserSession = {
      name: 'Prof. Avaliador (Demo)',
      email: email || 'demo@projetocrm.edu.br',
      role: 'Apresentação Acadêmica'
    };
    localStorage.setItem('crm_user', JSON.stringify(authUser));
    setUser(authUser);
    showToast('Login realizado com sucesso em ambiente acadêmico!');
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_user');
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-between border-b border-amber-600 shadow-inner">
        <div className="flex items-center space-x-2 truncate">
          <span className="truncate">
            <strong>PROJETO ACADÊMICO MVP:</strong> Projeto CRM — Unileste (Engenharia de Software / Métricas)
          </span>
        </div>
        <div className="flex items-center space-x-3 shrink-0 ml-2">
          <span className="hidden sm:inline-block bg-slate-900/10 px-2.5 py-0.5 rounded-full text-xs font-mono">
            Modo: Demo Local
          </span>
          <span className="text-xs bg-slate-950 text-amber-400 px-2 py-0.5 rounded font-bold">
            v1.0 MVP
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md font-bold text-lg">
                PC
              </div>
              <div>
                <h1 className="font-bold text-white text-lg leading-tight">Projeto CRM</h1>
                <p className="text-xs text-slate-400">Gestão Comercial</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem 
              icon={<BarChart3 className="w-5 h-5" />} 
              label="Dashboard" 
              active={currentTab === 'dashboard'} 
              onClick={() => { setCurrentTab('dashboard'); setSelectedClientId(null); }} 
            />
            <NavItem 
              icon={<Users className="w-5 h-5" />} 
              label="Clientes" 
              active={currentTab === 'clientes' || currentTab === 'cliente-detalhe'} 
              badge={clients.length}
              onClick={() => { setCurrentTab('clientes'); setSelectedClientId(null); }} 
            />
            <NavItem 
              icon={<Briefcase className="w-5 h-5" />} 
              label="Oportunidades" 
              active={currentTab === 'oportunidades'} 
              badge={opportunities.length}
              onClick={() => { setCurrentTab('oportunidades'); setSelectedClientId(null); }} 
            />
            <NavItem 
              icon={<BarChart3 className="w-5 h-5" />} 
              label="Configurações & SQL" 
              active={currentTab === 'configuracoes'} 
              onClick={() => { setCurrentTab('configuracoes'); setSelectedClientId(null); }} 
            />
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                  {user.name.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                title="Sair do CRM"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {toast && (
            <div className={`fixed top-16 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${
              toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
              <span>{toast.message}</span>
            </div>
          )}

          {currentTab === 'dashboard' && (
            <DashboardView 
              clients={clients} 
              opportunities={opportunities} 
              onNavigate={(tab) => setCurrentTab(tab)}
              onNewClient={() => { setEditingClient(null); setIsClientModalOpen(true); }}
              onNewOpp={() => setIsOppModalOpen(true)}
            />
          )}

          {currentTab === 'clientes' && (
            <ClientsView 
              clients={clients} 
              onSelectClient={(id) => { setSelectedClientId(id); setCurrentTab('cliente-detalhe'); }}
              onNewClient={() => { setEditingClient(null); setIsClientModalOpen(true); }}
              onEditClient={(client) => { setEditingClient(client); setIsClientModalOpen(true); }}
              onDeleteClient={(client) => setDeleteConfirmClient(client)}
            />
          )}

          {currentTab === 'cliente-detalhe' && selectedClientId && (
            <ClientDetailView 
              clientId={selectedClientId} 
              clients={clients} 
              interactions={interactions} 
              opportunities={opportunities}
              onBack={() => setCurrentTab('clientes')}
              onAddInteraction={(interaction) => {
                const updated = db.saveInteraction(interaction);
                setInteractions(updated);
                showToast('Interação registrada com sucesso!');
              }}
            />
          )}

          {currentTab === 'oportunidades' && (
            <OpportunitiesView 
              opportunities={opportunities} 
              clients={clients} 
              onNewOpp={() => setIsOppModalOpen(true)}
              onUpdateStage={(id, newStage) => {
                const updated = db.updateOpportunityStage(id, newStage);
                setOpportunities(updated);
                showToast(`Etapa atualizada para "${newStage}"!`);
              }}
            />
          )}

          {currentTab === 'configuracoes' && (
            <SettingsView 
              user={user} 
              onResetData={() => {
                db.resetToDemo();
                loadData();
                showToast('Dados restaurados para os padrões acadêmicos!');
              }} 
            />
          )}
        </main>
      </div>

      {isClientModalOpen && (
        <ClientModal 
          client={editingClient}
          existingClients={clients}
          onClose={() => setIsClientModalOpen(false)}
          onSave={(clientData) => {
            const updated = db.saveClient(clientData);
            setClients(updated);
            setIsClientModalOpen(false);
            showToast(editingClient ? 'Cliente atualizado!' : 'Cliente cadastrado com sucesso!');
          }}
        />
      )}

      {isOppModalOpen && (
        <OpportunityModal 
          clients={clients}
          preselectedClientId={selectedClientId}
          onClose={() => setIsOppModalOpen(false)}
          onSave={(oppData) => {
            const updated = db.saveOpportunity(oppData);
            setOpportunities(updated);
            setIsOppModalOpen(false);
            showToast('Oportunidade criada com sucesso!');
          }}
        />
      )}

      {deleteConfirmClient && (
        <DeleteConfirmModal 
          clientName={deleteConfirmClient.name}
          onClose={() => setDeleteConfirmClient(null)}
          onConfirm={() => {
            db.deleteClient(deleteConfirmClient.id);
            loadData();
            setDeleteConfirmClient(null);
            if (selectedClientId === deleteConfirmClient.id) {
              setCurrentTab('clientes');
              setSelectedClientId(null);
            }
            showToast('Cliente e dados vinculados excluídos.', 'error');
          }}
        />
      )}
    </div>
  );
}