import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export const generatePreview = (
  inputFile,
  setPreviewHeaders,
  setPreviewData,
  setError,
  maxRows = null
) => {
  const reader = new FileReader()
  const isExcel =
    inputFile.type.includes('sheet') || inputFile.type.includes('excel')

  reader.onload = (e) => {
    try {
      if (isExcel) {
        const workbook = XLSX.read(e.target.result, { type: 'binary' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        if (json.length > 0) {
          setPreviewHeaders(json[0])
          const dataRows = maxRows ? json.slice(1, maxRows + 1) : json.slice(1)
          setPreviewData(dataRows)
        }
      } else {
        Papa.parse(e.target.result, {
          header: true,
          preview: maxRows || 0,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length > 0) {
              setPreviewHeaders(results.meta.fields)
              setPreviewData(results.data.map((row) => Object.values(row)))
            }
          },
        })
      }
    } catch (err) {
      setError('Could not generate a preview for this file.')
    }
  }

  isExcel ? reader.readAsBinaryString(inputFile) : reader.readAsText(inputFile)
}

export const buildCSVAndDownload = (headers, rows, filename) => {
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
