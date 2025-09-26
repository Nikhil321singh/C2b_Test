import React, { useEffect, useState } from 'react'
import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import StoreWiseTable from '../../components/StoreWiseTable/StoreWiseTable'
import styles from './StoreWiseReport.module.css'
import { FaAngleDown, FaDownload } from 'react-icons/fa6'
import { BeatLoader } from 'react-spinners'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import { fetchDownloadDataStoreWise } from '../../utils/fetchUtils'
import { useStoreMetadata } from '../../hooks/useStoreMetadata'
import { useStoreWiseData } from '../../hooks/useStoreWiseData'

const ALLstore = 'All Stores'
const startDateFilter = '2023-01-01'
const rotateCss = 'rotate-180'
const WEBSITE_SHORT_NAME =
  window.location.origin === import.meta.env.VITE_BUYBACK_URL
    ? import.meta.env.VITE_BUYBACK_SHORT_NAME
    : import.meta.env.VITE_WEBSITE_SHORT_NAME

const StoreWiseReport = () => {
  const token = sessionStorage.getItem('authToken')
  const LoggedInUser = JSON.parse(sessionStorage.getItem('profile'))
  const isSuperAdmin = LoggedInUser?.role === 'Super Admin'

  const [currentPage, setCurrentPage] = useState(0)
  const [storeName, setStoreName] = useState(ALLstore)
  const [storeId, setStoreId] = useState('')
  const [region, setRegion] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [fromDateDup, setFromDateDup] = useState(startDateFilter)
  const [toDate, setToDate] = useState('')
  const [toDateDup, setToDateDup] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [grestRec, setGrestRec] = useState('')
  const [techId, setTechId] = useState('')
  const [techName, setTechName] = useState('')
  const [deviceCategory, setDeviceCategory] = useState('CTG1')

  const { tableData, isTableLoaded, maxPages, fetchStoreData } =
    useStoreWiseData({
      token,
      currentPage,
      storeId,
      searchValue,
      grestRec,
      toDateDup,
      fromDateDup,
      techId,
      deviceCategory,
    })

  const {
    storeData,
    regionalData,
    entireStore,
    allUser,
    categories,
    getStore,
    getAllUser,
    getCategories,
    setStoreData,
  } = useStoreMetadata(token)

  useEffect(() => {
    getCategories()
    if (isSuperAdmin) {
      getStore()
      getAllUser()
    }
  }, [isSuperAdmin])

  useEffect(() => {
    fetchStoreData()
  }, [currentPage, grestRec, fromDateDup, toDateDup, techId, deviceCategory])

  const handleSearchClear = () => {
    setStoreName(ALLstore)
    setStoreId('')
    setRegion('')
    setSearchValue('')
    setFromDate('')
    setFromDateDup(startDateFilter)
    setToDate('')
    setToDateDup(new Date().toISOString().split('T')[0])
    setGrestRec('')
    setTechId('')
    setTechName('')
  }

  return (
    <div>
      {/* Upper Filter */}
      <div className='navbar'>
        <AdminNavbar />
        <SideMenu />
      </div>
      {isTableLoaded && (
        <div className='fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader color='var(--primary-color)' loading size={15} />
        </div>
      )}
      <div className='flex flex-row gap-2 items-center justify-center'>
        <select
          className='bg-primary text-white rounded-lg outline-none px-2 py-1'
          onChange={(e) => setDeviceCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat?._id} value={cat?.categoryCode}>
              {cat?.categoryName}
            </option>
          ))}
        </select>
        <div className={styles.search_bar_wrap}>
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            className='text-sm'
            type='text'
            placeholder='Search Store Name/Email/Id/Region'
            value={searchValue}
          />
          <IoMdSearch onClick={fetchStoreData} size={25} />
        </div>
        <IoRefresh onClick={handleSearchClear} size={25} />
        <button
          className={styles.bulkdown_button}
          onClick={() =>
            fetchDownloadDataStoreWise(
              deviceCategory,
              fromDate,
              toDate,
              storeId,
              token
            )
          }
        >
          <FaDownload /> Bulk Download
        </button>
      </div>

      {/* Table */}
      <div className='max-w-full min-h-screen'>
        <StoreWiseTable currentPage={currentPage} tableData={tableData} />
      </div>
      <div className='flex justify-center mt-0 mb-4'>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === 0
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === maxPages - 1}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === maxPages - 1
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default StoreWiseReport
