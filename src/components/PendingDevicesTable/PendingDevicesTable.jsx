import CustomerFormDetails from '../CustomerFormDetails'
import { useState } from 'react'
import SecureField from '../SecureField'

const PendingDevicesTable = ({
  pendingTableData,
  setSelectedIds,
  selectedData,
  selectedRows,
  setSelectedData,
  setSelectedRows,
  userRole,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [QNAData, setQNAData] = useState([])

  const selectableRows = pendingTableData.filter(
    (row) => row.status !== 'Cancelled',
  )

  const handleCheckboxChange = (val) => {
    if (val.status === 'Cancelled') {
      return
    }
    const newSelectedRows = [...selectedRows]
    const newSelectedData = [...selectedData]
    if (newSelectedRows.includes(val._id)) {
      newSelectedRows.splice(newSelectedRows.indexOf(val._id), 1)
      const dataIndex = newSelectedData.findIndex((item) => item === val._id)
      if (dataIndex !== -1) {
        newSelectedData.splice(dataIndex, 1)
      }
    } else {
      newSelectedRows.push(val._id)
      newSelectedData.push(val._id)
    }
    setSelectedRows(newSelectedRows)
    setSelectedData(newSelectedData)
    setSelectedIds(newSelectedData)
  }

  const handleSelectAll = () => {
    const allSelectableSelected =
      selectableRows.length > 0 &&
      selectableRows.every((row) => selectedRows.includes(row._id))

    if (allSelectableSelected) {
      const idsToRemove = new Set(selectableRows.map((row) => row._id))
      const remainingIds = selectedRows.filter((id) => !idsToRemove.has(id))
      setSelectedRows(remainingIds)
      setSelectedData(remainingIds)
      setSelectedIds(remainingIds)
    } else {
      const idsOfSelectedRows = selectableRows.map((row) => row._id)
      const mergedIds = Array.from(
        new Set([...selectedRows, ...idsOfSelectedRows]),
      )
      setSelectedRows(mergedIds)
      setSelectedData(mergedIds)
      setSelectedIds(mergedIds)
    }
  }

  const handleDetailsClick = (leadData) => {
    if (leadData?.QNA) {
      setQNAData(leadData.QNA)
      setShowModal(true)
    } else {
      alert('Details not available for this device.')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setQNAData([])
  }

  return (
    <div className='m-2 overflow-x-auto md:m-5'>
      <table className='w-full border border-primary'>
        <thead className='bg-primary text-white'>
          <tr>
            <th className='p-2 min-w-[50px] text-sm md:p-3 md:text-base'>
              <input
                type='checkbox'
                onChange={handleSelectAll}
                checked={
                  selectableRows.length > 0 &&
                  selectableRows.every((row) => selectedRows.includes(row._id))
                }
              />
            </th>
            <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
              Date
            </th>
            <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
              Device Name
            </th>
            <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
              RAM
            </th>
            <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
              Storage
            </th>
            <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
              IMEI Number
            </th>
            <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
              Final Price
            </th>
            <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
              Store Name
            </th>
            <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
              Location
            </th>
            <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
              Status
            </th>
            <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
              Reason
            </th>
            {userRole === 'Technician' && (
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
                More Details
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {pendingTableData.map((val, index) => (
            <tr
              key={val._id ?? index}
              className={index % 2 === 0 ? 'bg-gray-200' : ''}
            >
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                <input
                  type='checkbox'
                  onChange={() => handleCheckboxChange(val)}
                  checked={selectedRows.includes(val._id)}
                  disabled={val?.status === 'Cancelled'}
                  title={
                    val?.status === 'Cancelled'
                      ? 'Cancelled leads cannot be selected'
                      : undefined
                  }
                />
              </td>
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                {new Date(val.createdAt).toLocaleDateString('en-GB')}
              </td>
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                {val?.modelName}
              </td>
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                {val?.ram ? val.ram : ''}
              </td>
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                {val?.storage ? val.storage : '512 GB'}
              </td>
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                <SecureField value={val?.imei} type="imei" />
              </td>
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                {val?.price?.toString()[0] === '['
                  ? val?.price.$numberDecimal
                  : val?.price?.toString()}
              </td>
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                {val?.storeDetails?.storeName || 'N/A'}
              </td>
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                {val?.location}
              </td>
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                {val?.status}
              </td>
              <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                {val?.status === 'On Hold' ||
                val?.status === 'Cancelled' ||
                val?.status === 'QC Done' ||
                val?.status === 'Available For Pickup' ||
                val?.status === 'Pending in QC'
                  ? val?.reason
                  : ''}
              </td>
              {/* Technician Column */}
              {userRole === 'Technician' && (
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  <p
                    onClick={() => handleDetailsClick(val)}
                    className='cursor-pointer'
                  >
                    Details
                  </p>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <div className='z-50 fixed flex items-center inset-0 justify-center bg-black bg-opacity-50'>
          <div className='rounded w-96 p-4 bg-white relative mx-auto shadow-lg modal-container max-h-[90vh] overflow-y-auto'>
            <div className='modal-content'>
              <CustomerFormDetails
                QNAData={QNAData}
                closeModal={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingDevicesTable
