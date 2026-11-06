import React from 'react'
import { User, Database } from 'lucide-react'
import { isSupabaseConfigured } from '../services/supabaseClient'

interface ConfiguracoesProps {
  usuarioAtual: string
  onLogout: () => void
}

export const Configuracoes: React.FC<ConfiguracoesProps> = ({ usuarioAtual, onLogout }) => {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-slate-100">Configurações da Aplicação</h2>

      <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="text-md font-semibold text-slate-200 flex items-center gap-2">
          <User size={18} className="text-blue-400" /> Usuário Atual
        </h3>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-sm flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-xs">E-mail conectado:</p>
            <p className="text-slate-100 font-medium">{usuarioAtual}</p>
          </div>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-1 rounded">
            Perfil Acadêmico
          </span>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="text-md font-semibold text-slate-200 flex items-center gap-2">
          <Database size={18} className="text-blue-400" /> Status do Back-end / Persistência
        </h3>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Modo de Operação:</span>
            <span className={`text-xs px-2.5 py-1 rounded font-medium ${isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {isSupabaseConfigured ? 'Supabase PostgreSQL Ativo' : 'Modo Demo (Local Storage)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 pt-1">
            {isSupabaseConfigured 
              ? 'Conectado diretamente ao banco de dados remoto seguro.'
              : 'Utilizando dados fictícios em memória local. Configure o arquivo .env com as chaves do Supabase para persistir em nuvem.'}
          </p>
        </div>
      </div>

      <div className="pt-2">
        <button 
          onClick={onLogout}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium px-4 py-2 rounded-lg text-sm transition"
        >
          Encerrar Sessão / Sair
        </button>
      </div>
    </div>
  )
}