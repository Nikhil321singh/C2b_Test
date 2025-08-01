import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import UploadSummary from './UploadSummary'
import FileUploadForm from './FileUploadForm'
import UploadSpinner from './UploadSpinner'

const buildCSVAndDownload = (headers, rows, filename) => {
  const escapeCsvCell = (cell) => {
    const strCell = String(cell ?? '')
    return /,|"|\n/.test(strCell) ? `"${strCell.replace(/"/g, '""')}"` : strCell
  }

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n')

  const link = document.createElement('a')
  link.href = encodeURI(csvContent)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const BulkUploadModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState('')
  const [previewData, setPreviewData] = useState([])
  const [previewHeaders, setPreviewHeaders] = useState([])

  const resetState = useCallback(() => {
    setFile(null)
    setIsUploading(false)
    setUploadResult(null)
    setError('')
    clearPreview()
  }, [])

  const clearPreview = () => {
    setPreviewData([])
    setPreviewHeaders([])
  }

  useEffect(() => {
    if (isOpen) {
      resetState()
    }
  }, [isOpen, resetState])

  const generatePreview = (inputFile) => {
    const reader = new FileReader()
    const isExcel =
      inputFile.type.includes('sheet') || inputFile.type.includes('excel')

    reader.onload = (e) => {
      try {
        if (isExcel) {
          const workbook = XLSX.read(e.target.result, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          if (json.length > 0) {
            setPreviewHeaders(json[0])
            setPreviewData(json.slice(1, 6))
          }
        } else {
          Papa.parse(e.target.result, {
            header: true,
            preview: 5,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.data.length > 0) {
                setPreviewHeaders(results.meta.fields)
                setPreviewData(results.data.map((row) => Object.values(row)))
              }
            },
          })
        }
      } catch (previewError) {
        setError('Could not generate a preview for this file.')
      }
    }

    if (isExcel) {
      reader.readAsBinaryString(inputFile)
    } else {
      reader.readAsText(inputFile)
    }
  }

  const handleFileChange = (e) => {
    clearPreview()
    const selectedFile = e.target.files[0]

    if (selectedFile) {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
        setError('')
        generatePreview(selectedFile)
      } else {
        setError('Invalid file type. Please upload a .csv or .xlsx file.')
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setIsUploading(true)
    setError('')
    const token = sessionStorage.getItem('authToken')
    const formData = new FormData()
    formData.append('file', file)

    const config = {
      method: 'post',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/userregistry/bulk-upload`,
      headers: {
        Authorization: token,
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
    }

    try {
      const response = await axios.request(config)
      setUploadResult(response.data.result)
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || 'An unexpected error occurred during upload.'
      setError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadSample = () => {
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Password',
      'Mobile Number',
      'Store Name',
      'Role',
      'City',
      'Address',
    ]
    const rows = [
      [
        'John',
        'Doe',
        'john.doe@example.com',
        'pass1234',
        '9876543210',
        'Store A',
        'Admin',
        'Delhi',
        '123 MG Road',
      ],
      [
        'Jane',
        'Doe',
        'jane.doe@example.com',
        'pass5678',
        '8765432109',
        'Store B',
        'Sale User',
        'Delhi',
        '123 MG Road',
      ],
    ]
    buildCSVAndDownload(headers, rows, 'sample_user_upload.csv')
  }

  const handleDownloadFailed = () => {
    if (uploadResult?.failedRecords) {
      const headers = [
        'First Name',
        'Last Name',
        'Email',
        'Password',
        'Mobile Number',
        'Store Name',
        'Role',
        'City',
        'Address',
        'Error Message',
      ]
      buildCSVAndDownload(
        headers,
        uploadResult.failedRecords,
        'failed_user_records.csv'
      )
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
      <div
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
        className='bg-white rounded-lg p-6 md:p-8 w-full max-w-4xl relative transform transition-all'
      >
        <button
          onClick={onClose}
          className='absolute top-3 right-4 text-2xl font-bold text-gray-500 hover:text-gray-900'
        >
          ×
        </button>
        <h2 className='text-2xl md:text-3xl font-bold mb-6 text-gray-800 border-b pb-4'>
          Bulk User Upload
        </h2>

        {isUploading ? (
          <UploadSpinner />
        ) : uploadResult ? (
          <UploadSummary
            uploadResult={uploadResult}
            onReset={resetState}
            onClose={onClose}
            onDownloadFailed={handleDownloadFailed}
          />
        ) : (
          <FileUploadForm
            file={file}
            error={error}
            previewData={previewData}
            previewHeaders={previewHeaders}
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
            handleDownloadSample={handleDownloadSample}
            isUploading={isUploading}
          />
        )}
      </div>
    </div>
  )
}

export default BulkUploadModal
