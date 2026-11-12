import { useState, useMemo, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
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
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole
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
  id: string;
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

// Formata telefones brasileiros durante a digitação. Aceita entrada com DDI 55,
// mas mantém o número nacional no formulário e no banco de dados.
const formatBrazilPhone = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);
  if (number.length <= 4) return `(${ddd}) ${number}`;
  if (number.length <= 8) return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
};

const phoneDigits = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);
  return digits;
};

// Os dados do CRM são carregados exclusivamente do Supabase.

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

interface LoginScreenProps {
  onAuthenticate: (input: { email: string; password: string; name: string; mode: 'login' | 'register' }) => Promise<{ error?: string; message?: string }>;
  onResetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  configured: boolean;
}

const LoginScreen: FC<LoginScreenProps> = ({ onAuthenticate, onResetPassword, configured }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (mode === 'forgot') {
      setLoading(true);
      const result = await onResetPassword(email.trim());
      setLoading(false);
      if (result.error) setError(result.error);
      if (result.message) setNotice(result.message);
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    const result = await onAuthenticate({ email: email.trim(), password, name: name.trim(), mode });
    setLoading(false);
    if (result.error) setError(result.error);
    if (result.message) setNotice(result.message);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative">
      <div className="absolute top-4 text-center text-indigo-300 text-xs sm:text-sm font-medium bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-full">
        PROJETO CRM — ACESSO SEGURO
      </div>
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-3 border border-indigo-500/30"><BarChart3 className="w-8 h-8" /></div>
          <h2 className="text-2xl font-bold text-white">Projeto CRM</h2>
          <p className="text-sm text-slate-400 mt-1">{mode === 'login' ? 'Entre na sua conta para acessar o CRM' : mode === 'register' ? 'Crie sua conta para começar a utilizar o CRM' : 'Informe seu e-mail para receber o link de redefinição'}</p>
        </div>
        {!configured ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm rounded-xl">
            O Supabase não está configurado. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env e reinicie o servidor.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && <div><label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nome</label><input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500" /></div>}
            <div><label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">E-mail</label><input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
            {mode !== 'forgot' && <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Senha</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 pr-12 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500" />
                <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} title={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>}
            {mode === 'register' && <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Confirmar senha</label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 pr-12 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500" />
                <button type="button" onClick={() => setShowConfirmPassword(value => !value)} aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'} title={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>}
            {error && <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs rounded-xl">{error}</div>}
            {notice && <div role="status" className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl">{notice}</div>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm flex items-center justify-center space-x-2">
              <span>{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar no Sistema' : mode === 'register' ? 'Criar Conta' : 'Enviar link de redefinição'}</span>{!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}
        {configured && mode === 'login' && <div className="mt-4 text-center"><button type="button" onClick={() => { setMode('forgot'); setError(''); setNotice(''); }} className="text-indigo-300 hover:text-white text-sm">Esqueci minha senha</button></div>}
        {configured && <div className="mt-6 pt-5 border-t border-slate-700/60 text-center"><button type="button" onClick={() => { setMode(mode === 'login' || mode === 'forgot' ? 'register' : 'login'); setError(''); setNotice(''); setPassword(''); setConfirmPassword(''); }} className="text-indigo-300 hover:text-white text-sm font-medium">{mode === 'register' ? 'Já possui uma conta? Entrar' : 'Ainda não tem conta? Cadastre-se'}</button></div>}
        {configured && mode === 'forgot' && <div className="mt-3 text-center"><button type="button" onClick={() => { setMode('login'); setError(''); setNotice(''); }} className="text-slate-400 hover:text-white text-xs">Voltar para o login</button></div>}
      </div>
    </div>
  );
};


interface PasswordRecoveryScreenProps {
  onUpdatePassword: (password: string) => Promise<{ error?: string; message?: string }>;
}
const PasswordRecoveryScreen: FC<PasswordRecoveryScreenProps> = ({ onUpdatePassword }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    const result = await onUpdatePassword(password);
    setLoading(false);
    if (result.error) setError(result.error);
    if (result.message) setNotice(result.message);
  };
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-3 border border-indigo-500/30"><LockKeyhole className="w-8 h-8" /></div>
          <h2 className="text-2xl font-bold text-white">Redefinir senha</h2>
          <p className="text-sm text-slate-400 mt-1">Escolha uma nova senha para sua conta.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nova senha</label><div className="relative"><input type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="w-full px-4 py-2.5 pr-12 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label="Alternar visibilidade da nova senha" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
          <div><label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Confirmar nova senha</label><div className="relative"><input type={showConfirm ? 'text' : 'password'} required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="w-full px-4 py-2.5 pr-12 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500" /><button type="button" onClick={() => setShowConfirm(value => !value)} aria-label="Alternar visibilidade da confirmação" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
          {error && <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs rounded-xl">{error}</div>}
          {notice && <div role="status" className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl">{notice}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl text-sm">{loading ? 'Salvando...' : 'Salvar nova senha'}</button>
        </form>
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
                  <td className="p-4 text-slate-600">{client.phone ? formatBrazilPhone(client.phone) : '-'}</td>
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
          <div className="flex items-center space-x-1.5"><Phone className="w-4 h-4 text-indigo-500" /><span>{client.phone ? formatBrazilPhone(client.phone) : 'Sem telefone'}</span></div>
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

const SettingsView: FC<{ user: UserSession }> = ({ user }) => (
  <div className="space-y-6 max-w-4xl">
    <div><h2 className="text-2xl font-bold text-slate-900">Configurações</h2><p className="text-sm text-slate-500">Informações da conta e conexão com o banco de dados</p></div>
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900">Usuário Conectado</h3>
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm flex justify-between items-center gap-3">
        <div><p className="text-xs text-slate-400">Nome</p><p className="font-bold text-slate-800">{user.name}</p><p className="text-xs text-slate-400 mt-2">E-mail</p><p className="font-bold text-slate-800">{user.email}</p></div>
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-semibold">{user.role}</span>
      </div>
    </div>
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
      <h3 className="text-base font-bold text-slate-900">Armazenamento</h3>
      <p className="text-sm text-slate-600">Clientes, interações e oportunidades são armazenados no Supabase. O acesso aos registros é controlado pelas políticas de segurança por usuário (RLS).</p>
      <p className="text-xs text-slate-400">Os dados locais de demonstração não são apagados automaticamente por esta versão.</p>
    </div>
  </div>
);

interface ClientModalProps {
  client: Client | null;
  existingClients: Client[];
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => void;
}

const ClientModal: FC<ClientModalProps> = ({ client, existingClients, onClose, onSave }) => {
  const [name, setName] = useState<string>(client ? client.name : '');
  const [email, setEmail] = useState<string>(client ? client.email : '');
  const [phone, setPhone] = useState<string>(client ? formatBrazilPhone(client.phone || '') : '');
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
    const digits = phoneDigits(phone);
    if (phone.trim() && (digits.length !== 10 && digits.length !== 11)) {
      setError('Informe um telefone válido com DDD e 8 ou 9 dígitos.');
      return;
    }
    if (phone.trim() && (/^(\d)\1+$/.test(digits) || Number(digits.slice(0, 2)) < 11 || Number(digits.slice(0, 2)) > 99)) {
      setError('Informe um número de telefone válido.');
      return;
    }
    const emailClean = email.trim().toLowerCase();
    const duplicate = existingClients.some(c => c.email.toLowerCase() === emailClean && (!client || c.id !== client.id));
    if (duplicate) {
      setError('Já existe um cliente cadastrado com este e-mail.');
      return;
    }

    onSave({ id: client ? client.id : undefined, name, email: emailClean, phone: digits ? formatBrazilPhone(digits) : '', company });
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
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Telefone</label><input type="tel" inputMode="tel" autoComplete="tel-national" maxLength={15} placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(formatBrazilPhone(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
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
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<Client | null>(null);
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  const mapAuthUser = (authUser: { id: string; email?: string; user_metadata?: { name?: string } }): UserSession => ({
    id: authUser.id,
    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
    email: authUser.email || '',
    role: 'Usuário autenticado'
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      setAuthReady(true);
      return;
    }
    let mounted = true;
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      setUser(session?.user ? mapAuthUser(session.user) : null);
      setAuthLoading(false);
      setAuthReady(true);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) showToast(`Não foi possível recuperar a sessão: ${error.message}`, 'error');
      setUser(data.session?.user ? mapAuthUser(data.session.user) : null);
      setAuthLoading(false);
      setAuthReady(true);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const loadData = async () => {
    if (!supabase || !user) return;
    setDataLoading(true);
    setDataError('');
    try {
      const [clientsResult, interactionsResult, opportunitiesResult] = await Promise.all([
        supabase.from('clients').select('id,name,email,phone,company,created_at').order('created_at', { ascending: false }),
        supabase.from('interactions').select('id,client_id,type,date,description').order('date', { ascending: false }),
        supabase.from('opportunities').select('id,client_id,title,value,stage,created_at').order('created_at', { ascending: false })
      ]);
      if (clientsResult.error) throw clientsResult.error;
      if (interactionsResult.error) throw interactionsResult.error;
      if (opportunitiesResult.error) throw opportunitiesResult.error;
      setClients((clientsResult.data || []).map(row => ({ id: row.id, name: row.name, email: row.email || '', phone: row.phone || '', company: row.company || '', createdAt: row.created_at })));
      setInteractions((interactionsResult.data || []).map(row => ({ id: row.id, clientId: row.client_id, type: row.type, date: row.date, description: row.description })));
      setOpportunities((opportunitiesResult.data || []).map(row => ({ id: row.id, clientId: row.client_id, title: row.title, value: Number(row.value || 0), stage: row.stage, createdAt: row.created_at })));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido ao carregar os dados.';
      setDataError(message);
      showToast(`Erro ao carregar dados: ${message}`, 'error');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setClients([]); setInteractions([]); setOpportunities([]);
      void loadData();
    } else {
      setClients([]); setInteractions([]); setOpportunities([]);
      setSelectedClientId(null);
    }
  }, [user?.id]);

  const handleAuthenticate = async (input: { email: string; password: string; name: string; mode: 'login' | 'register' }) => {
    if (!supabase) return { error: 'Supabase não está configurado. Confira as variáveis do .env.' };
    try {
      if (input.mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: { data: { name: input.name }, emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        if (!data.session) return { message: 'Cadastro realizado. Verifique seu e-mail para confirmar a conta e depois faça login.' };
        return {};
      }
      const { error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
      if (error) throw error;
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Não foi possível autenticar.' };
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!supabase) return { error: 'Supabase não está configurado.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) return { error: error.message };
    return { message: 'Se o endereço estiver cadastrado, enviaremos um link para redefinir sua senha. Verifique também o spam.' };
  };

  const handleUpdatePassword = async (password: string) => {
    if (!supabase) return { error: 'Supabase não está configurado.' };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    setPasswordRecovery(false);
    showToast('Senha atualizada com sucesso!', 'success');
    return {};
  };

  const handleLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) showToast(`Erro ao sair: ${error.message}`, 'error');
    else { setUser(null); setClients([]); setInteractions([]); setOpportunities([]); }
  };

  const runMutation = async (operation: () => Promise<{ error: { message: string } | null }>, successMessage: string) => {
    try {
      const result = await operation();
      if (result.error) throw new Error(result.error.message);
      await loadData();
      showToast(successMessage);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Não foi possível salvar os dados.', 'error');
    }
  };

  if (passwordRecovery) return <PasswordRecoveryScreen onUpdatePassword={handleUpdatePassword} />;
  if (authLoading || !authReady) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">Verificando sessão...</div>;
  }
  if (!user) return <LoginScreen onAuthenticate={handleAuthenticate} onResetPassword={handleResetPassword} configured={isSupabaseConfigured} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-between border-b border-emerald-700 shadow-inner">
        <div className="flex items-center space-x-2 truncate"><span className="truncate"><strong>PROJETO ACADÊMICO MVP:</strong> Projeto CRM — Unileste (Engenharia de Software / Métricas)</span></div>
        <div className="flex items-center space-x-3 shrink-0 ml-2"><span className="hidden sm:inline-block bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-mono">Supabase conectado</span><span className="text-xs bg-slate-950 text-emerald-300 px-2 py-0.5 rounded font-bold">v1.1</span></div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between"><div className="flex items-center space-x-3"><div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md font-bold text-lg">PC</div><div><h1 className="font-bold text-white text-lg leading-tight">Projeto CRM</h1><p className="text-xs text-slate-400">Gestão Comercial</p></div></div></div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" active={currentTab === 'dashboard'} onClick={() => { setCurrentTab('dashboard'); setSelectedClientId(null); }} />
            <NavItem icon={<Users className="w-5 h-5" />} label="Clientes" active={currentTab === 'clientes' || currentTab === 'cliente-detalhe'} badge={clients.length} onClick={() => { setCurrentTab('clientes'); setSelectedClientId(null); }} />
            <NavItem icon={<Briefcase className="w-5 h-5" />} label="Oportunidades" active={currentTab === 'oportunidades'} badge={opportunities.length} onClick={() => { setCurrentTab('oportunidades'); setSelectedClientId(null); }} />
            <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Configurações" active={currentTab === 'configuracoes'} onClick={() => { setCurrentTab('configuracoes'); setSelectedClientId(null); }} />
          </nav>
          <div className="p-4 border-t border-slate-800 bg-slate-950/50"><div className="flex items-center justify-between"><div className="flex items-center space-x-3 truncate"><div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">{user.name.charAt(0).toUpperCase()}</div><div className="truncate"><p className="text-xs font-semibold text-white truncate">{user.name}</p><p className="text-[10px] text-slate-400 truncate">{user.email}</p></div></div><button onClick={handleLogout} title="Sair do CRM" className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"><ArrowRight className="w-4 h-4 rotate-180" /></button></div></div>
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {toast && <div className={`fixed top-16 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}><CheckCircle2 className="w-5 h-5" /><span>{toast.message}</span></div>}
          {dataLoading && <div className="mb-4 text-xs text-indigo-600 font-medium">Sincronizando dados com o Supabase...</div>}
          {dataError && <div role="alert" className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">Não foi possível carregar os dados: {dataError}<button onClick={() => void loadData()} className="ml-2 underline font-semibold">Tentar novamente</button></div>}
          {currentTab === 'dashboard' && <DashboardView clients={clients} opportunities={opportunities} onNavigate={tab => setCurrentTab(tab)} onNewClient={() => { setEditingClient(null); setIsClientModalOpen(true); }} onNewOpp={() => setIsOppModalOpen(true)} />}
          {currentTab === 'clientes' && <ClientsView clients={clients} onSelectClient={id => { setSelectedClientId(id); setCurrentTab('cliente-detalhe'); }} onNewClient={() => { setEditingClient(null); setIsClientModalOpen(true); }} onEditClient={client => { setEditingClient(client); setIsClientModalOpen(true); }} onDeleteClient={client => setDeleteConfirmClient(client)} />}
          {currentTab === 'cliente-detalhe' && selectedClientId && <ClientDetailView clientId={selectedClientId} clients={clients} interactions={interactions} opportunities={opportunities} onBack={() => setCurrentTab('clientes')} onAddInteraction={interaction => {
            void runMutation(async () => await supabase!.from('interactions').insert({ client_id: interaction.clientId, type: interaction.type, date: interaction.date, description: interaction.description }), 'Interação registrada com sucesso!');
          }} />}
          {currentTab === 'oportunidades' && <OpportunitiesView opportunities={opportunities} clients={clients} onNewOpp={() => setIsOppModalOpen(true)} onUpdateStage={(id, newStage) => {
            void runMutation(async () => await supabase!.from('opportunities').update({ stage: newStage }).eq('id', id), `Etapa atualizada para "${newStage}"!`);
          }} />}
          {currentTab === 'configuracoes' && <SettingsView user={user} />}
        </main>
      </div>
      {isClientModalOpen && <ClientModal client={editingClient} existingClients={clients} onClose={() => setIsClientModalOpen(false)} onSave={clientData => {
        const payload = { name: clientData.name || '', email: clientData.email || '', phone: clientData.phone || null, company: clientData.company || null };
        void runMutation(async () => clientData.id
          ? await supabase!.from('clients').update(payload).eq('id', clientData.id)
          : await supabase!.from('clients').insert(payload), editingClient ? 'Cliente atualizado!' : 'Cliente cadastrado com sucesso!');
        setIsClientModalOpen(false); setEditingClient(null);
      }} />}
      {isOppModalOpen && <OpportunityModal clients={clients} preselectedClientId={selectedClientId} onClose={() => setIsOppModalOpen(false)} onSave={oppData => {
        void runMutation(async () => await supabase!.from('opportunities').insert({ title: oppData.title, client_id: oppData.clientId, value: oppData.value, stage: oppData.stage }), 'Oportunidade criada com sucesso!');
        setIsOppModalOpen(false);
      }} />}
      {deleteConfirmClient && <DeleteConfirmModal clientName={deleteConfirmClient.name} onClose={() => setDeleteConfirmClient(null)} onConfirm={() => {
        const deletedId = deleteConfirmClient.id;
        void runMutation(async () => await supabase!.from('clients').delete().eq('id', deletedId), 'Cliente e dados vinculados excluídos.');
        setDeleteConfirmClient(null);
        if (selectedClientId === deletedId) { setCurrentTab('clientes'); setSelectedClientId(null); }
      }} />}
    </div>
  );
}
