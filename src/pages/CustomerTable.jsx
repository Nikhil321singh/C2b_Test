import React, { useEffect, useState } from 'react'
import UserTable from '../components/UserTable'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { BeatLoader } from 'react-spinners'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import NavigateListing from '../components/NavigateListing/NavigateListing'
import { FaAngleDown, FaDownload } from 'react-icons/fa'
import styles from './CompanyListingDetails/CompanyListingDetails.module.css'
import * as XLSX from 'xlsx'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import styless from '../pages/QuotesCreatedAdmin/QuotesCreatedAdmin.module.css'
const ALL_STORES = 'All Stores'
const iniDate = '2023-01-01'

const getStore = async () => {
  const token = sessionStorage.getItem('authToken')
  const config = {
    method: 'get',
    url: `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/store/findAll?page=0&limit=9999`,
    headers: { Authorization: token },
  }
  let storeNamesArray = []
  await axios
    .request(config)
    .then((response) => {
      console.log(response.data.result)
      storeNamesArray = response.data.result.map((store1) => ({
        storeName: store1.storeName,
        _id: store1._id,
      }))
      console.log(storeNamesArray)
    })
    .catch((error) => {
      console.log(error)
    })
  return storeNamesArray
}

const fetchDownloadDataCustomerTable = (
  toDateDup,
  fromDateDup,
  search,
  selStoreId,
  totalCount,
  setDownloading
) => {
  const userToken = sessionStorage.getItem('authToken')
  setDownloading(true)
  axios
    .get(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/prospects/findAll/ordercreated?page=0&limit=${totalCount || 9999}&todate=${toDateDup}&fromdate=${fromDateDup}&search=${search}&store=${selStoreId}`,
      { headers: { authorization: userToken } }
    )
    .then((res) => {
      downloadExcelCustomerTable(res.data.data.orderData.data)
      setDownloading(false)
    })
    .catch((err) => {
      console.log(err)
      setDownloading(false)
    })
}

const downloadExcelCustomerTable = (apiData) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileEx = '.xlsx'

  const formatData = apiData.map((element) => {
    let index = 1
    console.log(element?.lead?.QNA[0])
    let questionsKeys = ''
    if (element?.lead?.QNA?.[0] && typeof element.lead.QNA[0] === 'object') {
      for (const group in element.lead.QNA[0]) {
        if (Array.isArray(element.lead.QNA[0][group])) {
          element.lead.QNA[0][group].forEach((qna) => {
            questionsKeys += `${index}. ${qna?.quetion} - ${qna?.key}\n`
            index++
          })
        }
      }
    }
    return {
      'Date Created': new Date(element?.createdAt).toLocaleDateString('en-IN'),
      'User Name': element?.user?.name,
      category: element?.categoryInfo?.categoryName,
      'Product Name': element?.lead?.model?.name,
      Variant: element?.lead?.storage,
      Price: element?.lead?.actualPrice,
      'Final Price Offered to Customer': element?.lead?.price,
      'Unique Id': element?.lead?.uniqueCode,
      'Customer Name': element?.lead?.name,
      'Phone Number': element?.lead?.phoneNumber,
      'Email Id': element?.lead?.emailId,
      'Question/Ans': questionsKeys,
    }
  })

  const wsCustomerTable = XLSX.utils.json_to_sheet(formatData)
  const wbCustomerTable = {
    Sheets: { data: wsCustomerTable },
    SheetNames: ['data'],
  }
  const excelBufferCustomerTable = XLSX.write(wbCustomerTable, {
    bookType: 'xlsx',
    type: 'array',
  })

  const dataFileCustomerTable = new Blob([excelBufferCustomerTable], {
    type: fileType,
  })
  saveAs(dataFileCustomerTable, 'Leads_Created' + fileEx)
}

const salesPageSize = 10
const CustomerTable = () => {
  const [tableDataDup, setTableDataDup] = useState([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [sideMenu, setsideMenu] = useState(false)
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [fromDateDup, setFromDateDup] = useState(iniDate)
  const [toDate, setToDate] = useState('')
  const [toDateDup, setToDateDup] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [storeDrop, setStoreDrop] = useState(false)
  const [storeName, setStoreName] = useState(ALL_STORES)
  const [selStoreId, setSelStoreId] = useState('')
  const [storeData, setStoreData] = useState([])
  const [filFlag, setFilFlag] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStores, setFilteredStores] = useState(storeData)
  const [currentPage, setCurrentPage] = useState(0)
  const [maxPages, setMaxPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    myordercretad()
  }, [toDate, fromDate, selStoreId, filFlag, currentPage])
  function myordercretad() {
    setLoading(true)
    const userToken = sessionStorage.getItem('authToken')
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAll/ordercreated?page=${currentPage}&limit=${salesPageSize}&todate=${toDateDup}&fromdate=${fromDateDup}&search=${search}&store=${selStoreId}`,
        { headers: { authorization: userToken } }
      )
      .then((res) => {
        setTableDataDup(res.data.data.orderData.data)
        const total = res.data.data.orderData.count || 0
        setTotalCount(total)
        setMaxPages(Math.ceil(total / salesPageSize))
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
      })
  }
  const handleSearchClear = () => {
    setSearch('')
    setStoreName(ALL_STORES)
    setSelStoreId('')
    setFromDate('')
    setFromDateDup(iniDate)
    setToDate('')
    setToDateDup(new Date().toISOString().split('T')[0])
    setFilFlag(!filFlag)
  }
  const handleFromDateChange = (date) => {
    if (date !== null) {
      setFromDate(date)
      const formattedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0]
      setFromDateDup(formattedDate)
    } else if (date == null) {
      setFromDate('')
      setFromDateDup('')
    }
  }
  const handleToDateChange = (date) => {
    if (date !== null) {
      setToDate(date)
      const formattedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0]
      setToDateDup(formattedDate)
    } else if (date == null) {
      setToDate('')
      setToDateDup('')
    }
  }
  const handleStoreChange = (value) => {
    setStoreDrop(false)
    setSelStoreId(value._id)
    setStoreName(value.storeName)
  }
  const saveStore = async () => {
    const temparr = await getStore()
    setStoreData(temparr)
  }
  useEffect(() => {
    saveStore()
  }, [])
  useEffect(() => {
    if (
      search === '' &&
      storeName === ALL_STORES &&
      selStoreId === '' &&
      fromDateDup === iniDate
    ) {
      myordercretad()
    }
  }, [search, storeName, selStoreId, fromDateDup])
  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value === '') {
      setFilteredStores(storeData)
    } else {
      const filtered = storeData.filter((store) =>
        store.storeName.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredStores(filtered)
    }
  }
  return (
    <div>
      {loading && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50 text-primary'>
          <BeatLoader
            color='var(--primary-color)'
            loading={loading}
            size={15}
          />
        </div>
      )}
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <NavigateListing />
      <div className='flex gap-2 items-center justify-center outline-none mt-5 w-[100%]'>
        <div className={`${styles.search_bar_wrap}`}>
          <input
            onChange={(e) => setSearch(e.target.value)}
            className='text-sm'
            type='text'
            placeholder='Search...'
            value={search}
          />
          <IoMdSearch size={25} onClick={() => myordercretad()} />
        </div>
        <div className={styles.icons_box}>
          <IoRefresh onClick={handleSearchClear} className='' size={25} />
        </div>
        <button
          className={`${styles.bulkdown_button}`}
          onClick={() =>
            fetchDownloadDataCustomerTable(
              toDateDup,
              fromDateDup,
              search,
              selStoreId,
              totalCount,
              setDownloading
            )
          }
          disabled={downloading}
        >
          {downloading ? (
            <>
              <BeatLoader color="white" size={8} /> Downloading...
            </>
          ) : (
            <>
              <FaDownload /> Bulk Download
            </>
          )}
        </button>
        <div className='[bg-[#F5F4F9]'>
          <DatePicker
            selected={fromDate}
            onChange={handleFromDateChange}
            dateFormat='yyyy-MM-dd'
            className={` mt-1 py-[6px] px-[15px] border rounded-md`}
            placeholderText='Select from date'
          />
        </div>
        <div>
          <DatePicker
            selected={toDate}
            onChange={handleToDateChange}
            dateFormat='yyyy-MM-dd'
            className='mt-1 py-[6px] px-[15px]  border rounded-md'
            placeholderText='Select to date'
          />
        </div>
        {storeData && storeData.length > 1 && (
          <div className='relative w-[250px]'>
            <div
              className={`${styless.filter_button}`}
              onClick={() => {
                setStoreDrop(!storeDrop)
              }}
            >
              <p className='truncate'>
                {storeName === ALL_STORES ? 'Select Store' : storeName}
              </p>
              <FaAngleDown
                size={17}
                className={`${storeDrop && 'rotate-180'}`}
              />
            </div>
            {storeDrop && (
              <div className='absolute w-full bg-white shadow-md'>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={handleSearch}
                  className='w-full p-2 border-b border-gray-300'
                  placeholder='Search store...'
                />
                <div
                  className={`overflow-y-scroll max-h-[200px] ${styless.filter_drop}`}
                >
                  <div
                    className={`${styles.filter_option}`}
                    onClick={() => {
                      handleStoreChange({ _id: '', storeName: ALL_STORES })
                      setSearchTerm(ALL_STORES)
                    }}
                  >
                    <p className='truncate'>{ALL_STORES}</p>
                  </div>
                  {filteredStores.length > 0 ? (
                    filteredStores.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          handleStoreChange(item)
                          setSearchTerm(item.storeName)
                          setStoreDrop(false)
                        }}
                        className={`${styles.filter_option}`}
                      >
                        <p className='truncate'>{item.storeName}</p>
                      </div>
                    ))
                  ) : (
                    <p className='p-2 text-gray-500'>No stores found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <UserTable data={tableDataDup} />
      <div className='flex justify-center mt-0 mb-4'>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === 0
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white cursor-pointer'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= maxPages - 1 || maxPages === 0}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage >= maxPages - 1 || maxPages === 0
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white cursor-pointer'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default CustomerTable
