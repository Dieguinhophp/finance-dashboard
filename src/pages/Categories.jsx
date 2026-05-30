import { useState, useEffect } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const emptyForm = {
  name: '',
  description: '',
}

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const response = await api.get('/api/categories')
      setCategories(response.data)
    } catch (err) {
      setError('Erro ao carregar categorias.')
    } finally {
      setLoading(false)
    }
  }

  function handleNew() {
    setForm(emptyForm)
    setShowModal(true)
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await api.post('/api/categories', form)
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      alert('Erro ao salvar categoria.')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Carregando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="p-8">
      <div className="max-w-4xl mx-auto"></div>

    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Categorias</h1>
          <button
            onClick={handleNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nova categoria
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Lista */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Nenhuma categoria encontrada.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Nova categoria
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Descrição <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  Criar categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
  )
}

export default Categories