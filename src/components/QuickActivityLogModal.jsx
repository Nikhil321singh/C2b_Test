import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BeatLoader } from 'react-spinners'

const Loader = () => (
  <div className='flex justify-center items-center h-full'>
    <BeatLoader color='var(--primary-color)' />
  </div>
)

const ErrorMessage = ({ message }) => (
  <div className='flex flex-col items-center justify-center h-full text-red-600 bg-red-50 p-6 rounded-lg'>
    <svg className='w-8 h-8 mb-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
    </svg>
    <p className='text-sm font-medium'>Error: {message}</p>
  </div>
)

const EmptyState = () => (
  <div className='flex flex-col items-center justify-center h-full text-gray-400'>
    <svg className='w-10 h-10 mb-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
    </svg>
    <p className='text-sm'>No activity logs found</p>
  </div>
)

const QuickActivityLogModal = ({ userId, userName, onClose }) => {
  const [logData, setLogData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 8

  useEffect(() => {
    if (!userId) return
    const fetchLog = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = sessionStorage.getItem('authToken')
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/quoteTracking/activity-log/${userId}`,
          { headers: { Authorization: token } }
        )
        setLogData(response.data.logs)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load activity logs')
      } finally {
        setLoading(false)
      }
    }
    fetchLog()
  }, [userId])

  if (!userId) return null

  const totalPages = Math.ceil(logData.length / rowsPerPage)
  const indexOfLastRow = currentPage * rowsPerPage
  const currentRows = logData.slice(indexOfLastRow - rowsPerPage, indexOfLastRow)

  const renderContent = () => {
    if (loading) return <Loader />
    if (error) return <ErrorMessage message={error} />
    if (currentRows.length === 0) return <EmptyState />

    return (
      <div className='h-full overflow-y-auto border border-gray-200 rounded-lg'>
        <table className='w-full text-sm text-left'>
          <thead className='bg-primary text-white sticky top-0 z-10'>
            <tr>
              {['S.No.', 'Timestamp', 'Device Name', 'Series', 'Category', 'Device Details', 'Quote', 'Quote Amount'].map((h) => (
                <th key={h} className={`p-3 font-medium ${h === 'S.No.' ? 'text-center w-16' : ''} ${h === 'Quote Amount' ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white'>
            {currentRows.map((log, index) => {
              const ram = log.deviceDetails?.ram || 'N/A'
              const rom = log.deviceDetails?.rom || 'N/A'
              return (
                <tr key={`${log.timestamp}-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className='p-3 text-center'>{indexOfLastRow - rowsPerPage + index + 1}</td>
                  <td className='p-3 whitespace-nowrap'>{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                  <td className='p-3 max-w-xs truncate'>{log.deviceDetails?.name || '-'}</td>
                  <td className='p-3 max-w-xs truncate'>{log.deviceDetails?.series || '-'}</td>
                  <td className='p-3'>{log.deviceDetails?.categoryName || '-'}</td>
                  <td className='p-3 whitespace-nowrap'>RAM: {ram}, ROM: {rom}</td>
                  <td className='p-3'>{log.quoteType}</td>
                  <td className='p-3 text-right font-semibold'>₹{log.quoteAmount.toLocaleString('en-IN')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const btnClass = (disabled) =>
    disabled
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
      : 'bg-primary text-white hover:opacity-90'

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col'>
        <div className='flex justify-between items-center border-b border-gray-200 p-5'>
          <h2 className='text-xl font-bold text-gray-900'>Activity Log</h2>
          <button
            onClick={onClose}
            className='text-3xl font-light text-gray-400 hover:text-gray-700'
            aria-label='Close modal'
          >
            &times;
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-5 text-sm bg-gray-50 border-b border-gray-100'>
          <div>
            <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>User</span>
            <p className='font-medium text-gray-800 truncate'>{userName}</p>
          </div>
          <div>
            <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>Total Records</span>
            <p className='font-semibold text-gray-800'>{logData.length}</p>
          </div>
        </div>

        <div className='flex-1 overflow-hidden p-5'>{renderContent()}</div>

        {totalPages > 1 && !error && (
          <div className='flex justify-center items-center border-t border-gray-200 p-4'>
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className={`mx-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${btnClass(currentPage === 1)}`}
            >
              Previous
            </button>
            <span className='mx-4 text-sm text-gray-600'>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className={`mx-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${btnClass(currentPage === totalPages)}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuickActivityLogModal
