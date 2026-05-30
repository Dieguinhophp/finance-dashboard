import { useState, useEffect } from 'react'
import api from '../api/axios'

// Estado inicial do formulário — facilita resetar depois de salvar
const emptyForm = {
  description: '',
  amount: '',
  date: '',
  categoryId: '',
  type: 0, 
}

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null) // null = criando, id = editando

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    try {
      const [transRes, catRes] = await Promise.all([
        api.get('/api/transactions'),
        api.get('/api/categories'),
      ])
      setTransactions(transRes.data)
      setCategories(catRes.data)
    } catch (err) {
      setError('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  // Abre o modal para criar
  function handleNew() {
    setForm(emptyForm)
    setEditingId(null)
    setShowModal(true)
  }

  // Abre o modal preenchido para editar
  function handleEdit(transaction) {
    setForm({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date.split('T')[0], // formata para o input date
      categoryId: transaction.categoryId ?? '',
      type: transaction.type ?? 'expense',
    })
    setEditingId(transaction.id)
    setShowModal(true)
  }

  // Cria ou atualiza conforme editingId
  async function handleSubmit(e) {
  e.preventDefault()
  try {
    const payload = {
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
      categoryId: parseInt(form.categoryId), // ← sempre número inteiro
      type: parseInt(form.type),             // ← enum como número
    }

    if (editingId) {
      await api.put(`/api/transactions/${editingId}`, payload)
    } else {
      await api.post('/api/transactions', payload)
    }
    setShowModal(false)
    fetchAll()
  } catch (err) {
    alert('Erro ao salvar transação.')
  }
}

  async function handleDelete(id) {
    if (!confirm('Excluir esta transação?')) return
    try {
      await api.delete(`/api/transactions/${id}`)
      fetchAll()
    } catch (err) {
      alert('Erro ao excluir transação.')
    }
  }

  // Atualiza qualquer campo do formulário de forma genérica
  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Carregando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Transações</h1>
          <button
            onClick={handleNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nova transação
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Nenhuma transação encontrada.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Descrição</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Categoria</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Data</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-6 py-3">Valor</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800">{transaction.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{transaction.category?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium text-right ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {transaction.amount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-xs text-blue-600 hover:underline mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? 'Editar transação' : 'Nova transação'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descrição</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Valor</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Receita</option>
                  <option value={1}>Despesa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Data</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Salvar alterações' : 'Criar transação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions