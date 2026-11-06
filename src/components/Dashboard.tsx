import React from 'react'
import { Users, TrendingUp, DollarSign, PieChart } from 'lucide-react'

interface DashboardProps {
  clientes: any[]
  oportunidades: any[]
}

export const Dashboard: React.FC<DashboardProps> = ({ clientes, oportunidades }) => {
  const totalClientes = clientes.length
  const totalOportunidades = oportunidades.length
  
  const valorTotalAberto = oportunidades
    .filter(op => op.etapa !== 'Fechado/Ganho' && op.etapa !== 'Perdido')
    .reduce((acc, curr) => acc + Number(curr.valor || 0), 0)

  const etapas = ['Prospecção', 'Qualificação', 'Proposta', 'Fechado/Ganho', 'Perdido']
  const contagemEtapas = etapas.reduce((acc: any, etapa) => {
    acc[etapa] = oportunidades.filter(op => op.etapa === etapa).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-100">Painel de Indicadores</h2>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
          Dados em Tempo Real
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total de Clientes</p>
            <h3 className="text-2xl font-bold text-slate-100">{totalClientes}</h3>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-purple-500/10 p-3 rounded-lg text-purple-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total de Oportunidades</p>
            <h3 className="text-2xl font-bold text-slate-100">{totalOportunidades}</h3>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Valor em Aberto</p>
            <h3 className="text-2xl font-bold text-slate-100">
              R$ {valorTotalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-sm">
        <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-blue-400" /> Oportunidades por Etapa
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {etapas.map(etapa => (
            <div key={etapa} className="bg-slate-900/60 border border-slate-700/60 p-4 rounded-lg text-center">
              <span className="text-xs text-slate-400 block mb-1 truncate">{etapa}</span>
              <span className="text-xl font-bold text-blue-400">{contagemEtapas[etapa]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}