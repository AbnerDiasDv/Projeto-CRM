import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'

interface ClientesProps {
  clientes: any[]
  onAddCliente: (cliente: any) => void
  onUpdateCliente: (cliente: any) => void
  onDeleteCliente: (id: string) => void
  onSelectCliente: (cliente: any) => void
}

export const Clientes: React.FC<ClientesProps> = ({
  clientes,
  onAddCliente,
  onUpdateCliente,
  onDeleteCliente,
  onSelectCliente
}) => {
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEmEdicao, setClienteEmEdicao] = useState<any>(null)
  
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [erro, setErro] = useState('')

  const abrirModalNovo = () => {
    setClienteEmEdicao(null)
    setNome('')
    setEmail('')
    setTelefone('')
    setEmpresa('')
    setErro('')
    setModalAberto(true)
  }

  const abrirModalEdicao = (c: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setClienteEmEdicao(c)
    setNome(c.nome)
    setEmail(c.email)
    setTelefone(c.telefone || '')
    setEmpresa(c.empresa || '')
    setErro('')
    setModalAberto(true)
  }

  const salvarCliente = (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!nome.trim() || !email.trim()) {
      setErro('Nome e e-mail são obrigatórios.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErro('Formato de e-mail inválido.')
      return
    }

    const emailLimpo = email.trim().toLowerCase()
    const duplicado = clientes.some(
      c => c.email.toLowerCase() === emailLimpo && (!clienteEmEdicao || c.id !== clienteEmEdicao.id)
    )

    if (duplicado) {
      setErro('Já existe um cliente cadastrado com este e-mail.')
      return
    }

    if (clienteEmEdicao) {
      onUpdateCliente({
        ...clienteEmEdicao,
        nome,
        email: emailLimpo,
        telefone,
        empresa
      })
    } else {
      onAddCliente({
        id: crypto.randomUUID(),
        nome,
        email: emailLimpo,
        telefone,
        empresa,
        criado_em: new Date().toISOString()
      })
    }

    setModalAberto(false)
  }

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.email.toLowerCase().includes(busca.toLowerCase()) ||
    (c.empresa && c.empresa.toLowerCase().includes(busca.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100">Gestão de Clientes</h2>
        <button 
          onClick={abrirModalNovo}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md shadow-blue-600/20"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar por nome, e-mail ou empresa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4">Nome / Empresa</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Telefone</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map(c => (
                  <tr 
                    key={c.id} 
                    onClick={() => onSelectCliente(c)}
                    className="hover:bg-slate-750 cursor-pointer transition"
                  >
                    <td className="p-4">
                      <div className="font-medium text-slate-100">{c.nome}</div>
                      <div className="text-xs text-slate-400">{c.empresa || 'Sem empresa'}</div>
                    </td>
                    <td className="p-4 text-slate-300">{c.email}</td>
                    <td className="p-4 text-slate-300">{c.telefone || '-'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={(e) => abrirModalEdicao(c, e)}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir o cliente ${c.nome}?`)) {
                              onDeleteCliente(c.id)
                            }
                          }}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
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

      {modalAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">
              {clienteEmEdicao ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
            </h3>

            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs mb-4 flex items-center gap-2">
                <AlertCircle size={16} /> {erro}
              </div>
            )}

            <form onSubmit={salvarCliente} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">E-mail *</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Telefone</label>
                <input 
                  type="text" 
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Empresa</label>
                <input 
                  type="text" 
                  value={empresa}
                  onChange={e => setEmpresa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}