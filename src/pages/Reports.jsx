import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

function Reports() {
  const today = new Date()
  const [activeTab, setActiveTab] = useState('monthly')

  // Estados do relatório mensal
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [report, setReport] = useState(null)
  const [loadingMonthly, setLoadingMonthly] = useState(false)

  // Estados do relatório anual
  const [annualYear, setAnnualYear] = useState(today.getFullYear())
  const [annualData, setAnnualData] = useState([])
  const [loadingAnnual, setLoadingAnnual] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    if (activeTab === 'monthly') fetchReport()
  }, [month, year, activeTab])

  useEffect(() => {
    if (activeTab === 'annual') fetchAnnualReport()
  }, [annualYear, activeTab])

  function formatBRL(value) {
    return value?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  async function fetchReport() {
    setLoadingMonthly(true)
    setError('')
    try {
      const response = await api.get('/api/reports/monthly', {
        params: { month, year }
      })
      setReport(response.data)
    } catch (err) {
      setError('Erro ao carregar relatório.')
    } finally {
      setLoadingMonthly(false)
    }
  }

  async function fetchAnnualReport() {
    setLoadingAnnual(true)
    setError('')
    try {
      // Busca os 12 meses ao mesmo tempo
      const requests = MONTHS.map((_, index) =>
        api.get('/api/reports/monthly', {
          params: { month: index + 1, year: annualYear }
        })
      )
      const responses = await Promise.all(requests)
      const data = responses.map((res, index) => ({
        month: MONTHS[index],
        Receitas: res.data.totalIncome,
        Despesas: res.data.totalExpense,
        Saldo: res.data.balance,
      }))
      setAnnualData(data)
    } catch (err) {
      setError('Erro ao carregar relatório anual.')
    } finally {
      setLoadingAnnual(false)
    }
  }

  // Calcula os destaques do ano
  const bestMonth = annualData.length
    ? annualData.reduce((a, b) => a.Saldo > b.Saldo ? a : b)
    : null
  const worstMonth = annualData.length
    ? annualData.reduce((a, b) => a.Saldo < b.Saldo ? a : b)
    : null
  const totalAnnualIncome = annualData.reduce((sum, m) => sum + m.Receitas, 0)
  const totalAnnualExpense = annualData.reduce((sum, m) => sum + m.Despesas, 0)

  function tabClass(tab) {
    return activeTab === tab
      ? 'px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600'
      : 'px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">

          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Relatórios</h1>

          {/* Abas */}
          <div className="flex border-b border-gray-200 mb-6">
            <button className={tabClass('monthly')} onClick={() => setActiveTab('monthly')}>
              Mensal
            </button>
            <button className={tabClass('annual')} onClick={() => setActiveTab('annual')}>
              Anual
            </button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* ── RELATÓRIO MENSAL ── */}
          {activeTab === 'monthly' && (
            <>
              <div className="flex items-center justify-end gap-3 mb-6">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[
                    'Janeiro','Fevereiro','Março','Abril',
                    'Maio','Junho','Julho','Agosto',
                    'Setembro','Outubro','Novembro','Dezembro'
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

              {loadingMonthly && (
                <div className="flex items-center justify-center py-20">
                  <p className="text-gray-400">Carregando relatório...</p>
                </div>
              )}

              {report && !loadingMonthly && (
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

                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-sm font-medium text-gray-600 mb-4">Receitas vs Despesas</h2>
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

                  {report.expensesByCategory?.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-sm font-medium text-gray-600 mb-4">Despesas por Categoria</h2>
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
            </>
          )}

          {/* ── RELATÓRIO ANUAL ── */}
          {activeTab === 'annual' && (
            <>
              <div className="flex items-center justify-end mb-6">
                <select
                  value={annualYear}
                  onChange={(e) => setAnnualYear(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {loadingAnnual && (
                <div className="flex items-center justify-center py-20">
                  <p className="text-gray-400">Carregando {annualYear}...</p>
                </div>
              )}

              {!loadingAnnual && annualData.length > 0 && (
                <>
                  {/* Cards de destaque do ano */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <p className="text-xs text-gray-400 mb-1">Total de Receitas no Ano</p>
                      <p className="text-2xl font-semibold text-green-600">
                        {formatBRL(totalAnnualIncome)}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <p className="text-xs text-gray-400 mb-1">Total de Despesas no Ano</p>
                      <p className="text-2xl font-semibold text-red-500">
                        {formatBRL(totalAnnualExpense)}
                      </p>
                    </div>
                    {bestMonth && (
                      <div className="bg-green-50 rounded-xl p-6">
                        <p className="text-xs text-green-600 mb-1">Melhor mês</p>
                        <p className="text-xl font-semibold text-green-700">{bestMonth.month}</p>
                        <p className="text-sm text-green-600 mt-1">{formatBRL(bestMonth.Saldo)}</p>
                      </div>
                    )}
                    {worstMonth && (
                      <div className="bg-red-50 rounded-xl p-6">
                        <p className="text-xs text-red-500 mb-1">Mês mais crítico</p>
                        <p className="text-xl font-semibold text-red-600">{worstMonth.month}</p>
                        <p className="text-sm text-red-500 mt-1">{formatBRL(worstMonth.Saldo)}</p>
                      </div>
                    )}
                  </div>

                  {/* Gráfico de barras agrupadas — todos os meses */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-sm font-medium text-gray-600 mb-4">
                      Receitas vs Despesas — {annualYear}
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={annualData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => formatBRL(value)} />
                        <Legend />
                        <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráfico de linha — evolução do saldo */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-600 mb-4">
                      Evolução do Saldo — {annualYear}
                    </h2>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={annualData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => formatBRL(value)} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="Saldo"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#3b82f6' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default Reports