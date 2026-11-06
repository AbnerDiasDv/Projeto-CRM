import React, { useState } from 'react'
import { GraduationCap, ArrowRight } from 'lucide-react'

interface LoginProps {
  onLogin: (user: string) => void
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('estudante.admin@unileste.edu.br')
  const [senha, setSenha] = useState('123456')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (usuario.trim()) {
      onLogin(usuario)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl p-8 text-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600/20 p-4 rounded-full border border-blue-500/30 text-blue-400">
            <GraduationCap size={40} />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">CRM Fácil</h1>
          <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 py-1 px-3 rounded-full inline-block mt-2">
            Ambiente Acadêmico de Demonstração (MVP)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">E-mail de Acesso</label>
            <input 
              type="email" 
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Senha Acadêmica</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              required 
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-600/20"
          >
            Entrar no Sistema <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Trabalho acadêmico • Processo de Produção e Qualidade de Software
        </div>
      </div>
    </div>
  )
}