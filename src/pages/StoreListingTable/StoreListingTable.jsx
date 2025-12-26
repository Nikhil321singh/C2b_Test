import styles from './StoreListingTable.module.css'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BeatLoader } from 'react-spinners'
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoMdAdd,
  IoMdSearch,
} from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { FaDownload, FaUpload } from 'react-icons/fa6'

import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import StoreEdit from '../../components/StoreEdit/StoreEdit'
import StoreBulkUploadModal from '../../components/StoreBulkUploadModal'
import { useNavigate } from 'react-router-dom'
import { USER_ROLES } from '../../constants/roleConstants'

const succTextColor = 'text-green-500'
const failTextColor = 'text-primary'

const downloadExcel = (dataDown, curPage) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const formattedData = dataDown.map((item) => {
    return {
      'Date Created': new Date(item.createdAt).toLocaleDateString('en-GB'),
      'Company Name': item?.companyId?.name || 'N/A',
      'Company Code': item?.companyId?.companyCode || 'N/A',
      'Store Name': item?.storeName,
      'Store Unique Id': item?.uniqueId,
      'Store Email': item.email,
      'Store Phone Number': item.contactNumber,
      Region: item.region,
      Address: item.address,
    }
  })

  const ws = XLSX.utils.json_to_sheet(formattedData)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const dataFile = new Blob([excelBuffer], { type: fileType })
  saveAs(dataFile, `Stores_Data_${curPage}${fileExtension}`)
}

const sampleDownloadHandler = () => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  // Create sample data structure matching the exact format from public folder
  const sampleData = [
    {
      storeName: 'ABC Store',
      companyCode: 'COMPTSPL0',
      region: 'Delhi',
      email: 'abcstore@gmail.com',
      contactNumber: '8917296981',
      address: 'India',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(sampleData)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const dataFile = new Blob([excelBuffer], { type: fileType })
  saveAs(dataFile, `storelisting-sample-file-store${fileExtension}`)
}

const StoreListingTable = () => {
  const token = sessionStorage.getItem('authToken')
  const profile = JSON.parse(sessionStorage.getItem('profile'))
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [companies, setCompanies] = useState([])
  const [isTableLoaded, setIsTableLoaded] = useState(false)
  const [storeEditData, setStoreEditData] = useState()
  const [searchValue, setSearchValue] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [editBoxOpen, setEditBoxOpen] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [curPage, setCurPage] = useState(0)
  const [selectedStr, setSelectedStr] = useState()
  const [errMsg, setErrMsg] = useState('')
  const [sucBox, setSucBox] = useState(false)
  const [failBox, setFailBox] = useState(false)
  const [confBox, setConfBox] = useState(false)
  const [uploadBox, setUploadBox] = useState(false)

  const isCompanyAdmin = profile?.role === USER_ROLES.COMPANY_ADMIN

  const getData = () => {
    setIsTableLoaded(true)
    let url = `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/store/findAll?page=${curPage}&limit=10`
    if (companyFilter) {
      url += `&companyId=${companyFilter}`
    }
    const config = {
      method: 'get',
      url: url,
      headers: { Authorization: token },
    }
    axios
      .request(config)
      .then((response) => {
        setData(response.data.result)
        setIsTableLoaded(false)
      })
      .catch((error) => {
        setErrMsg('Failed to load data')
        setFailBox(true)
        setIsTableLoaded(false)
      })
  }

  const getCompanies = () => {
    const config = {
      method: 'get',
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/findAll`,
      headers: { Authorization: token },
    }
    axios
      .request(config)
      .then((response) => {
        setCompanies(response.data.result || [])
      })
      .catch((error) => {
        console.log('Failed to load companies:', error)
      })
  }

  const getDataBySearch = () => {
    setIsTableLoaded(true)
    if (searchValue === '') {
      setIsTableLoaded(false)
      setErrMsg('Search Box is empty')
      setFailBox(true)
      return
    }
    const config = {
      method: 'get',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/store/findAll?page=${0}&limit=999&search=${searchValue}`,
      headers: { Authorization: token },
    }
    axios
      .request(config)
      .then((response) => {
        setData(response.data.result)
        setIsTableLoaded(false)
      })
      .catch((error) => {
        setErrMsg('Failed to load data')
        setFailBox(true)
        setIsTableLoaded(false)
      })
  }

  useEffect(() => {
    if (editSuccess) {
      if (searchValue === '') {
        getData()
      } else {
        getDataBySearch()
      }
      setErrMsg('Succesfully updated store details')
      setSucBox(true)
      setEditSuccess(false)
      setEditBoxOpen(false)
    }
  }, [editSuccess])

  const editHandler = (storeData) => {
    setStoreEditData(storeData)
    setEditBoxOpen(true)
  }

  const deleteConfHandler = (store) => {
    setSelectedStr(store)
    setConfBox(true)
  }

  useEffect(() => {
    getData()
  }, [curPage, companyFilter])

  useEffect(() => {
    getCompanies()
  }, [])

  const handleSearchClear = () => {
    setSearchValue('')
    setCompanyFilter('')
    getData()
  }

  const handleUploadSuccess = () => {
    getData()
    setUploadBox(false)
  }

  return (
    <div className={`${styles.pickedup_page}`}>
      <StoreBulkUploadModal
        isOpen={uploadBox}
        onClose={() => setUploadBox(false)}
        onUploadSuccess={handleUploadSuccess}
      />
      <ExtComps
        sucBox={sucBox}
        errMsg={errMsg}
        setSucBox={setSucBox}
        isTableLoaded={isTableLoaded}
        setIsTableLoaded={setIsTableLoaded}
        failBox={failBox}
        setFailBox={setFailBox}
        confBox={confBox}
        setConfBox={setConfBox}
        setErrMsg={setErrMsg}
        editBoxOpen={editBoxOpen}
        setEditBoxOpen={setEditBoxOpen}
        searchValue={searchValue}
        storeEditData={storeEditData}
        setEditSuccess={setEditSuccess}
        selectedStr={selectedStr}
        getData={getData}
        getDataBySearch={getDataBySearch}
      />
      <div className='my-4 px-2 w-full flex flex-col gap-4 items-center'>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-2 w-full items-center justify-center'>
          <button
            className={`${styles.bulkdown_button} w-full`}
            onClick={() => navigate('/storelisting')}
          >
            <IoMdAdd /> Add Store
          </button>
          <button
            className={`${styles.bulkdown_button} w-full`}
            onClick={sampleDownloadHandler}
          >
            <FaDownload /> Upload Sample
          </button>
          <button
            className={`${styles.bulkdown_button} w-full`}
            onClick={() => setUploadBox(true)}
          >
            <FaUpload /> Bulk Upload
          </button>
          <div className='flex w-full items-center gap-2'>
            <div
              className={`${styles.search_bar_wrap} flex items-center w-full`}
            >
              <input
                onChange={(e) => setSearchValue(e.target.value)}
                className='text-sm w-full'
                type='text'
                placeholder='Search Store Name/Email/Id/Region'
                value={searchValue}
              />
              <IoMdSearch
                onClick={getDataBySearch}
                size={25}
                className='ml-2 cursor-pointer'
              />
            </div>
            <div className='block md:hidden mr-3'>
              <IoRefresh
                onClick={handleSearchClear}
                size={25}
                className='cursor-pointer'
              />
            </div>
          </div>
          <div
            className={`${styles.icons_box} hidden md:flex items-center justify-center`}
          >
            <IoRefresh
              onClick={handleSearchClear}
              size={25}
              className='cursor-pointer'
            />
          </div>
          <button
            className={`${styles.bulkdown_button} w-full`}
            onClick={() => downloadExcel(data, curPage)}
          >
            <FaDownload /> Bulk Download
          </button>
        </div>

        {/* Company Filter - Hidden for Company Admin */}
        {!isCompanyAdmin && (
          <div className='flex gap-2 items-center max-w-md'>
            <label className='text-sm font-medium whitespace-nowrap'>
              Filter by Company:
            </label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className='text-sm bg-transparent border border-gray-300 rounded px-3 py-2 w-64'
            >
              <option value=''>All Companies</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name} ({company.companyCode})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <StoreTable
        data={data}
        searchValue={searchValue}
        curPage={curPage}
        setCurPage={setCurPage}
        setIsTableLoaded={setIsTableLoaded}
        editHandler={editHandler}
        deleteConfHandler={deleteConfHandler}
      />
    </div>
  )
}
export default StoreListingTable

const useStoreDelete = (params) => {
  const {
    utoken,
    searchValue,
    getData,
    getDataBySearch,
    setIsTableLoaded,
    setConfBox,
    setErrMsg,
    setSucBox,
    setFailBox,
  } = params

  return (storeID) => {
    setIsTableLoaded(true)
    setConfBox(false)
    const config = {
      method: 'delete',
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/store/deleteById?id=${storeID}`,
      headers: {
        Authorization: utoken,
      },
    }
    axios
      .request(config)
      .then((response) => {
        if (searchValue === '') {
          getData()
        } else {
          getDataBySearch()
        }
        setErrMsg(
          `Succesfully deleted store - ${response.data.result.storeName}`
        )
        setSucBox(true)
        setIsTableLoaded(false)
      })
      .catch((error) => {
        setErrMsg('Failed to deleted store')
        setFailBox(true)
        setIsTableLoaded(false)
      })
  }
}

const ModalComponents = ({
  sucBox,
  errMsg,
  setSucBox,
  failBox,
  setFailBox,
  confBox,
  setConfBox,
  setIsTableLoaded,
  selectedStr,
  deleteHandler,
  isTableLoaded,
}) => {
  return (
    <React.Fragment>
      {sucBox && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${succTextColor}`}>
            <IoIosCheckmarkCircle className={succTextColor} size={90} />
            <h6 className={succTextColor}>Success!</h6>
            <p className='text-slate-500'>{errMsg}</p>
            <button
              onClick={() => setSucBox(false)}
              className={'bg-green-500 text-white'}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {failBox && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${failTextColor}`}>
            <IoIosCloseCircle className={failTextColor} size={90} />
            <h6 className={failTextColor}>Error!</h6>
            <p className='text-slate-500'>{errMsg}</p>
            <button
              onClick={() => {
                setFailBox(false)
              }}
              className={'text-white bg-primary'}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confBox && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${failTextColor}`}>
            <h6 className={failTextColor}>Confirmation!</h6>
            <p className='text-slate-500'>{`Do you want to delete store ${selectedStr?.storeName} ?`}</p>
            <div className='flex flex-row gap-2'>
              <button
                onClick={() => deleteHandler(selectedStr?._id)}
                className={'bg-primary text-white'}
              >
                Okay
              </button>
              <button
                onClick={() => {
                  setConfBox(false)
                  setIsTableLoaded(false)
                }}
                className='bg-white text-primary'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isTableLoaded && (
        <div className='fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={isTableLoaded}
            size={15}
          />
        </div>
      )}
    </React.Fragment>
  )
}

const ExtComps = ({
  sucBox,
  errMsg,
  setSucBox,
  isTableLoaded,
  setIsTableLoaded,
  failBox,
  setFailBox,
  confBox,
  setConfBox,
  setErrMsg,
  editBoxOpen,
  setEditBoxOpen,
  searchValue,
  storeEditData,
  setEditSuccess,
  selectedStr,
  getData,
  getDataBySearch,
}) => {
  const utoken = sessionStorage.getItem('authToken')
  const [sideMenu, setsideMenu] = useState(false)

  const deleteHandler = useStoreDelete({
    utoken,
    searchValue,
    getData,
    getDataBySearch,
    setIsTableLoaded,
    setConfBox,
    setErrMsg,
    setSucBox,
    setFailBox,
  })

  return (
    <React.Fragment>
      {editBoxOpen && (
        <div className={`${styles.edit_page}`}>
          <StoreEdit
            setEditSuccess={setEditSuccess}
            setEditBoxOpen={setEditBoxOpen}
            storeData={storeEditData}
          />
        </div>
      )}
      <div className='flex items-center w-screen border-b-2 py-4 h-16 bg-white HEADER '>
        <div className='navbar'>
          <AdminNavbar sideMenu={sideMenu} setsideMenu={setsideMenu} />
          <SideMenu sideMenu={sideMenu} setsideMenu={setsideMenu} />
        </div>
      </div>
      <ModalComponents
        sucBox={sucBox}
        errMsg={errMsg}
        setSucBox={setSucBox}
        failBox={failBox}
        setFailBox={setFailBox}
        confBox={confBox}
        setConfBox={setConfBox}
        setIsTableLoaded={setIsTableLoaded}
        selectedStr={selectedStr}
        deleteHandler={deleteHandler}
        isTableLoaded={isTableLoaded}
      />
    </React.Fragment>
  )
}

const StoreTable = ({
  data,
  searchValue,
  curPage,
  setCurPage,
  setIsTableLoaded,
  editHandler,
  deleteConfHandler,
}) => {
  const nextHandler = () => {
    setIsTableLoaded(true)
    if (data.length >= 10 && searchValue === '') {
      const temp = curPage + 1
      setCurPage(temp)
    } else {
      setIsTableLoaded(false)
    }
  }

  const prevHandler = () => {
    setIsTableLoaded(true)
    if (curPage !== 0 && searchValue === '') {
      const temp = curPage - 1
      setCurPage(temp)
    } else {
      setIsTableLoaded(false)
    }
  }

  return (
    <div className={`${styles.pd_cont}`}>
      <div className='m-2 overflow-x-auto md:m-5'>
        <table className='w-full border border-primary'>
          <thead className='bg-primary text-white'>
            <tr>
              <th className='text-sm p-2 md:p-3 md:text-base'>Action</th>
              <th className='text-sm p-2 md:p-3 md:text-base'>Store Name</th>
              <th className='text-sm p-2 md:p-3 md:text-base'>Unique Id</th>
              <th className='text-sm p-2 md:p-3 md:text-base'>Company Name</th>
              <th className='text-sm p-2 md:p-3 md:text-base'>Company Code</th>
              <th className='text-sm p-2 md:p-3 md:text-base'>Email</th>
              <th className='text-sm p-2 md:p-3 md:text-base'>Phone Number</th>
              <th className='text-sm p-2 md:p-3 md:text-base'>Region</th>
              <th className='text-sm p-2 md:p-3 md:text-base'>Address</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-200' : ''}>
                <td className='text-sm p-2 text-center md:p-3 md:text-base'>
                  <div className='flex flex-col  gap-1'>
                    <button
                      onClick={() => {
                        editHandler(val)
                      }}
                      className={`${styles.view_btn}`}
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles.acpt_btn}`}
                      onClick={() => {
                        deleteConfHandler(val)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.storeName}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.uniqueId}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.companyId?.name || 'N/A'}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.companyId?.companyCode || 'N/A'}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.email}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.contactNumber}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.region}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='flex flex-row justify-center items-center gap-2 pb-8'>
        <button
          className={`${styles.view_btn} text-lg px-6 py-2`}
          onClick={prevHandler}
        >
          Previous
        </button>
        <button
          className={`${styles.acpt_btn} text-lg px-6 py-2`}
          onClick={nextHandler}
        >
          Next
        </button>
      </div>
    </div>
  )
}
