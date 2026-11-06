import React, { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'

interface OportunidadesProps {
  oportunidades: any[]
  clientes: any[]
  onAddOportunidade: (op: any) => void
  onUpdateEtapa: (id: string, novaEtapa: string) => void
}

export const Oportunidades: React.FC<OportunidadesProps> = ({
  oportunidades,
  clientes,
  onAddOportunidade,
  onUpdateEtapa
}) => {
  const [modalAberto, setModalAberto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [valor, setValor] = useState('')
  const [etapa, setEtapa] = useState('Prospecção')
  const [erro, setErro] = useState('')

  const etapas = ['Prospecção', 'Qualificação', 'Proposta', 'Fechado/Ganho', 'Perdido']

  const salvarOportunidade = (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    const valorNumerico = parseFloat(valor)
    if (!titulo.trim() || !clienteId || isNaN(valorNumerico)) {
      setErro('Preencha todos os campos obrigatórios corretamente.')
      return
    }

    if (valorNumerico < 0) {
      setErro('O valor da oportunidade não pode ser negativo.')
      return
    }

    onAddOportunidade({
      id: crypto.randomUUID(),
      titulo,
      cliente_id: clienteId,
      valor: valorNumerico,
      etapa,
      criado_em: new Date().toISOString()
    })

    setTitulo('')
    setClienteId('')
    setValor('')
    setEtapa('Prospecção')
    setModalAberto(false)
  }

  const getNomeCliente = (id: string) => {
    const cli = clientes.find(c => c.id === id)
    return cli ? cli.nome : 'Cliente não encontrado'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100">Oportunidades Comerciais</h2>
        <button 
          onClick={() => { setModalAberto(true); setErro(''); }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md shadow-blue-600/20"
        >
          <Plus size={16} /> Nova Oportunidade
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4">Título do Negócio</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Etapa Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {oportunidades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Nenhuma oportunidade cadastrada.
                  </td>
                </tr>
              ) : (
                oportunidades.map(op => (
                  <tr key={op.id} className="hover:bg-slate-750 transition">
                    <td className="p-4 font-medium text-slate-100">{op.titulo}</td>
                    <td className="p-4 text-slate-300">{getNomeCliente(op.cliente_id)}</td>
                    <td className="p-4 text-emerald-400 font-semibold">
                      R$ {Number(op.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <select 
                        value={op.etapa}
                        onChange={(e) => onUpdateEtapa(op.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                      >
                        {etapas.map(et => (
                          <option key={et} value={et}>{et}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Cadastrar Oportunidade</h3>

            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs mb-4 flex items-center gap-2">
                <AlertCircle size={16} /> {erro}
              </div>
            )}

            <form onSubmit={salvarOportunidade} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Título da Oportunidade *</label>
                <input 
                  type="text" 
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Cliente Vinculado *</label>
                <select 
                  value={clienteId}
                  onChange={e => setClienteId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valor (R$) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Etapa Inicial *</label>
                <select 
                  value={etapa}
                  onChange={e => setEtapa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {etapas.map(et => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalAberto(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition font-medium"
                >
                  Salvar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}