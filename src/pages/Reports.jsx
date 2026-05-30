import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import api from '../api/axios'
import Navbar from '../components/Navbar'

// Cores para o gráfico de pizza
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function Reports() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1) // getMonth() começa em 0
  const [year, setYear] = useState(today.getFullYear())
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  useEffect(() => {
    fetchReport()
  }, [month, year])

  async function fetchReport() {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/api/reports/monthly', {
        params: { month, year }
      })
      setReport(response.data)
    } catch (err) {
      setError('Erro ao carregar relatório.')
    } finally {
      setLoading(false)
    }
  }


  function formatBRL(value) {
    return value?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Relatório Mensal</h1>

            <div className="flex items-center gap-3">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[
                  'Janeiro', 'Fevereiro', 'Março', 'Abril',
                  'Maio', 'Junho', 'Julho', 'Agosto',
                  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ].map((name, index) => (
                  <option key={index} value={index + 1}>{name}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-400">Carregando relatório...</p>
            </div>
          )}

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {report && !loading && (
            <>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-xs text-gray-400 mb-1">Total de Receitas</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {formatBRL(report.totalIncome)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-xs text-gray-400 mb-1">Total de Despesas</p>
                  <p className="text-2xl font-semibold text-red-500">
                    {formatBRL(report.totalExpense)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-xs text-gray-400 mb-1">Saldo do Mês</p>
                  <p className={`text-2xl font-semibold ${
                    report.balance >= 0 ? 'text-blue-600' : 'text-red-500'
                  }`}>
                    {formatBRL(report.balance)}
                  </p>
                </div>
              </div>

              {/* Gráfico de barras — receitas vs despesas */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-sm font-medium text-gray-600 mb-4">
                  Receitas vs Despesas
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={[{
                    name: 'Mês',
                    Receitas: report.totalIncome,
                    Despesas: report.totalExpense,
                  }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatBRL(value)} />
                    <Legend />
                    <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de pizza — gastos por categoria */}
              {report.expensesByCategory?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-sm font-medium text-gray-600 mb-4">
                    Despesas por Categoria
                  </h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={report.expensesByCategory}
                        dataKey="total"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ categoryName, percent }) =>
                          `${categoryName} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {report.expensesByCategory.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatBRL(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default Reports