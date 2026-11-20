import CustomerFormDetails from '../CustomerFormDetails'
import { useState } from 'react'
import SecureField from '../SecureField'
import PropTypes from 'prop-types'

const HEADER_CLASS = 'p-2 min-w-[100px] text-sm md:p-3 md:text-base'
const CELL_CLASS = 'p-2 text-sm text-center md:p-3 md:text-base'

const deviceShape = PropTypes.shape({
  _id: PropTypes.string,
  createdAt: PropTypes.string,
  modelName: PropTypes.string,
  ram: PropTypes.string,
  storage: PropTypes.string,
  imei: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  storeDetails: PropTypes.shape({ storeName: PropTypes.string }),
  location: PropTypes.string,
  status: PropTypes.string,
  reason: PropTypes.string,
})

const TableHeader = ({ isTechnician, allSelected, onSelectAll }) => (
  <thead className='bg-primary text-white'>
    <tr>
      <th className='p-2 min-w-[50px] text-sm md:p-3 md:text-base'>
        <input type='checkbox' onChange={onSelectAll} checked={allSelected} />
      </th>
      <th className={HEADER_CLASS}>Date</th>
      <th className={HEADER_CLASS}>Device Name</th>
      <th className={HEADER_CLASS}>RAM</th>
      <th className={HEADER_CLASS}>Storage</th>
      <th className={HEADER_CLASS}>IMEI Number</th>
      <th className={HEADER_CLASS}>Final Price</th>
      <th className={HEADER_CLASS}>Store Name</th>
      <th className={HEADER_CLASS}>Location</th>
      <th className={HEADER_CLASS}>Status</th>
      <th className={HEADER_CLASS}>Reason</th>
      {isTechnician && <th className={HEADER_CLASS}>More Details</th>}
    </tr>
  </thead>
)

TableHeader.propTypes = {
  isTechnician: PropTypes.bool,
  allSelected: PropTypes.bool,
  onSelectAll: PropTypes.func.isRequired,
}

const getPrice = (price) =>
  price?.toString()[0] === '[' ? price.$numberDecimal : price?.toString()

const DeviceRow = ({
  device,
  index,
  isSelected,
  isTechnician,
  onToggle,
  onDetails,
}) => {
  const isCancelled = device?.status === 'Cancelled'
  const showReason =
    device?.status === 'On Hold' ||
    isCancelled ||
    device?.status === 'QC Done' ||
    device?.status === 'Available For Pickup' ||
    device?.status === 'Pending in QC'

  return (
    <tr
      key={device._id ?? index}
      className={index % 2 === 0 ? 'bg-gray-200' : ''}
    >
      <td className={CELL_CLASS}>
        <input
          type='checkbox'
          onChange={() => onToggle(device)}
          checked={isSelected}
          disabled={isCancelled}
          title={isCancelled ? 'Cancelled leads cannot be selected' : undefined}
        />
      </td>
      <td className={CELL_CLASS}>
        {new Date(device.createdAt).toLocaleDateString('en-GB')}
      </td>
      <td className={CELL_CLASS}>{device?.modelName}</td>
      <td className={CELL_CLASS}>{device?.ram ? device.ram : ''}</td>
      <td className={CELL_CLASS}>{device?.storage ? device.storage : '512 GB'}</td>
      <td className={CELL_CLASS}>
        <SecureField value={device?.imei} type="imei" />
      </td>
      <td className={CELL_CLASS}>{getPrice(device?.price)}</td>
      <td className={CELL_CLASS}>{device?.storeDetails?.storeName || 'N/A'}</td>
      <td className={CELL_CLASS}>{device?.location}</td>
      <td className={CELL_CLASS}>{device?.status}</td>
      <td className={CELL_CLASS}>{showReason ? device?.reason : ''}</td>
      {isTechnician && (
        <td className={CELL_CLASS}>
          <p onClick={() => onDetails(device)} className='cursor-pointer'>
            Details
          </p>
        </td>
      )}
    </tr>
  )
}

DeviceRow.propTypes = {
  device: deviceShape.isRequired,
  index: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  isTechnician: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onDetails: PropTypes.func.isRequired,
}

const DetailsModal = ({ QNAData, onClose }) => (
  <div className='z-50 fixed flex items-center inset-0 justify-center bg-black bg-opacity-50'>
    <div className='rounded w-96 p-4 bg-white relative mx-auto shadow-lg modal-container max-h-[90vh] overflow-y-auto'>
      <div className='modal-content'>
        <CustomerFormDetails QNAData={QNAData} closeModal={onClose} />
      </div>
    </div>
  </div>
)

DetailsModal.propTypes = {
  QNAData: PropTypes.array,
  onClose: PropTypes.func.isRequired,
}

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
  const allSelected =
    selectableRows.length > 0 &&
    selectableRows.every((row) => selectedRows.includes(row._id))

  const applySelection = (rows, data) => {
    setSelectedRows(rows)
    setSelectedData(data)
    setSelectedIds(data)
  }

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
    applySelection(newSelectedRows, newSelectedData)
  }

  const handleSelectAll = () => {
    if (allSelected) {
      const idsToRemove = new Set(selectableRows.map((row) => row._id))
      const remainingIds = selectedRows.filter((id) => !idsToRemove.has(id))
      applySelection(remainingIds, remainingIds)
    } else {
      const idsOfSelectedRows = selectableRows.map((row) => row._id)
      const mergedIds = Array.from(
        new Set([...selectedRows, ...idsOfSelectedRows]),
      )
      applySelection(mergedIds, mergedIds)
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

  const isTechnician = userRole === 'Technician'

  return (
    <div className='m-2 overflow-x-auto md:m-5'>
      <table className='w-full border border-primary'>
        <TableHeader
          isTechnician={isTechnician}
          allSelected={allSelected}
          onSelectAll={handleSelectAll}
        />
        <tbody>
          {pendingTableData.map((val, index) => (
            <DeviceRow
              key={val._id ?? index}
              device={val}
              index={index}
              isSelected={selectedRows.includes(val._id)}
              isTechnician={isTechnician}
              onToggle={handleCheckboxChange}
              onDetails={handleDetailsClick}
            />
          ))}
        </tbody>
      </table>
      {showModal && (
        <DetailsModal QNAData={QNAData} onClose={handleCloseModal} />
      )}
    </div>
  )
}

PendingDevicesTable.propTypes = {
  pendingTableData: PropTypes.arrayOf(deviceShape),
  setSelectedIds: PropTypes.func,
  selectedData: PropTypes.array,
  selectedRows: PropTypes.array,
  setSelectedData: PropTypes.func,
  setSelectedRows: PropTypes.func,
  userRole: PropTypes.string,
}

export default PendingDevicesTable
