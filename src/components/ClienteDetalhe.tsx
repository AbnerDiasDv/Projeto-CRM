import React, { useState } from 'react'
import { ArrowLeft, MessageSquare, Plus, Calendar, Building, Mail, Phone } from 'lucide-react'

interface ClienteDetalheProps {
  cliente: any
  interacoes: any[]
  onBack: () => void
  onAddInteracao: (interacao: any) => void
}

export const ClienteDetalhe: React.FC<ClienteDetalheProps> = ({
  cliente,
  interacoes,
  onBack,
  onAddInteracao
}) => {
  const [tipo, setTipo] = useState('Reunião')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [erro, setErro] = useState('')

  const interacoesCliente = interacoes.filter(i => i.cliente_id === cliente.id)

  const handleSubmitInteracao = (e: React.FormEvent) => {
    e.preventDefault()
    if (!descricao.trim()) {
      setErro('A descrição da interação é obrigatória.')
      return
    }

    onAddInteracao({
      id: crypto.randomUUID(),
      cliente_id: cliente.id,
      tipo,
      descricao,
      data,
      criado_em: new Date().toISOString()
    })

    setDescricao('')
    setErro('')
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="text-slate-400 hover:text-slate-100 text-sm flex items-center gap-2 transition"
      >
        <ArrowLeft size={16} /> Voltar para Clientes
      </button>

      <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-slate-100 mb-4">{cliente.nome}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail size={16} className="text-blue-400" /> {cliente.email}
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Phone size={16} className="text-blue-400" /> {cliente.telefone || 'Sem telefone'}
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Building size={16} className="text-blue-400" /> {cliente.empresa || 'Sem empresa'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-sm lg:col-span-1 h-fit">
          <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-400" /> Registrar Interação
          </h3>

          {erro && <p className="text-red-400 text-xs mb-3">{erro}</p>}

          <form onSubmit={handleSubmitInteracao} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Interação</label>
              <select 
                value={tipo} 
                onChange={e => setTipo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Reunião">Reunião</option>
                <option value="Ligação">Ligação</option>
                <option value="E-mail">E-mail</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Data *</label>
              <input 
                type="date" 
                value={data} 
                onChange={e => setData(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Descrição *</label>
              <textarea 
                value={descricao} 
                onChange={e => setDescricao(e.target.value)}
                rows={3}
                placeholder="Detalhes da conversa ou atendimento..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                required
              ></textarea>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
            >
              <Plus size={16} /> Adicionar ao Histórico
            </button>
          </form>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" /> Linha do Tempo de Interações
          </h3>

          {interacoesCliente.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhuma interação registrada para este cliente.</p>
          ) : (
            <div className="space-y-4">
              {interacoesCliente.map((item) => (
                <div key={item.id} className="bg-slate-900/60 border border-slate-700/60 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded">
                      {item.tipo}
                    </span>
                    <span className="text-xs text-slate-400">{item.data}</span>
                  </div>
                  <p className="text-sm text-slate-200 mt-2">{item.descricao}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}