import { useEffect } from 'react'

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000) // fecha após 3 segundos
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-600 border-red-200',
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border text-sm shadow-sm ${colors[type]}`}>
      {message}
    </div>
  )
}

export default Toast