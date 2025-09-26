import axios from 'axios'
import { downloadExcelStoreWise } from './storeWiseExcelUtils'

const isSelled = 'true'

export const fetchDownloadDataStoreWise = async (
  deviceCategory,
  fromDate,
  toDate,
  storeId,
  token
) => {
  if (!fromDate || !toDate) {
    alert('Set dates before Downloading')
    return
  }
  try {
    const res = await axios.get(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/prospects/findAll?page=0&limit=9999&is_selled=${isSelled}&deviceType=${deviceCategory}&startDate=${fromDate}&endDate=${toDate}&store=${storeId}`,
      { headers: { Authorization: token } }
    )
    downloadExcelStoreWise(res.data.data)
  } catch (err) {
    console.error('Download failed:', err)
  }
}
