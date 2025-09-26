import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const downloadExcelStoreWise = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    console.error('Invalid data provided for Excel download')
    return
  }

  const formattedData = apiData.map((item) => ({
    'Purchase Date': new Date(item.createdAt).toLocaleDateString('en-IN'),
    Technicians: item.userId?.firstName,
    Category: item.categoryInfo?.categoryName,
    'IMEI No.': item.documentId?.IMEI,
    'Product Details': item.modelId?.name,
    Location: item?.store?.storeName,
    Price: item?.actualPrice,
    'Price Offered To Customer': item?.price,
    'Unique ID': item?.uniqueCode,
    [`${import.meta.env.VITE_WEBSITE_TITLE} Received`]:
      item?.grestReceived || 'NA',
    'Receiving Date': item?.grestRecDate || 'NA',
    'New Prices As Per New Range': 'NA',
    'Store Payment Status': 'NA',
    'Payment Date': 'NA',
    'Store Payment UTR Number': 'NA',
  }))

  const ws = XLSX.utils.json_to_sheet(formattedData)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const dataFile = new Blob([excelBuffer], { type: fileType })
  saveAs(dataFile, 'StoreWise_Report' + fileExtension)
}
