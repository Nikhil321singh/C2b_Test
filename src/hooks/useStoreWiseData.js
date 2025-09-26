import { useState } from 'react'
import axios from 'axios'

const pageLimit = 10
const isSelled = 'true'

// Accept a single options object to avoid >7 params
export const useStoreWiseData = (options = {}) => {
  const {
    token,
    currentPage,
    storeId,
    searchValue,
    grestRec,
    toDateDup,
    fromDateDup,
    techId,
    deviceCategory,
  } = options

  const [tableData, setTableData] = useState([])
  const [isTableLoaded, setIsTableLoaded] = useState(false)
  const [maxPages, setMaxPages] = useState(0)

  const fetchStoreData = async () => {
    setIsTableLoaded(true)
    try {
      const queryParams = new URLSearchParams({
        page: currentPage ?? 0,
        limit: pageLimit,
        is_selled: isSelled,
        store: storeId ?? '',
        rid: searchValue ?? '',
        grestRec: grestRec ?? '',
        endDate: toDateDup ?? '',
        startDate: fromDateDup ?? '',
        userId: techId ?? '',
        deviceType: deviceCategory ?? '',
      })

      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAll?${queryParams.toString()}`,
        { headers: { Authorization: token } }
      )

      setMaxPages(Math.ceil((res.data.totalCounts || 0) / pageLimit))
      setTableData(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch store data:', err)
    } finally {
      setIsTableLoaded(false)
    }
  }

  return {
    tableData,
    isTableLoaded,
    maxPages,
    fetchStoreData,
    setTableData,
    setIsTableLoaded,
    setMaxPages,
  }
}
