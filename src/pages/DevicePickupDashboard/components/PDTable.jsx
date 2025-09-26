import React, { useState } from 'react'
import PendingDevicesTable from '../../../components/PendingDevicesTable/PendingDevicesTable'
import {
  CancelModal,
  HoldModal,
  QCDoneModal,
  AvailableForPickupModal,
  PendingInQCModal,
} from './StatusModals'
import axios from 'axios'

const PickupAvail = 'Available For Pickup'
const updateStatusError = 'Failed to update status'

const PDTable = ({
  pendingTableData,
  setSelectedData,
  setSelectedIds,
  setSelectedRows,
  selectedData,
  selectedRows,
  selectedStatus,
  selectedIds,
  setConfMod,
  setErrorMsg,
  setErrorMsg1,
  setErrorMsg2,
  setFailMode,
  setSelectedStatus,
  setIsTableLoaded,
  setSuccessMod,
  getData,
}) => {
  const token2 = sessionStorage.getItem('authToken')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showHoldModal, setShowHoldModal] = useState(false)
  const [showQCDoneModal, setShowQCDoneModal] = useState(false)
  const [showAvailableForPickupModal, setShowAvailableForPickupModal] =
    useState(false)
  const [showPendingInQCModal, setShowPendingInQCModal] = useState(false)

  const showModalForStatus = (status) => {
    const modalMap = {
      [PickupAvail]: setShowAvailableForPickupModal,
      'On Hold': setShowHoldModal,
      'QC Done': setShowQCDoneModal,
      'Pending in QC': setShowPendingInQCModal,
      'Cancelled': setShowCancelModal,
    }
    return modalMap[status]?.(true)
  }

  const createStatusUpdateConfig = (LDIds, newStatus) => ({
    method: 'post',
    url: `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/pendingDevices/updatereq`,
    headers: {
      Authorization: token2,
    },
    data: {
      deviceIDs: LDIds,
      newStatus: newStatus,
    },
  })

  const handleUpdateSuccess = (response, newStatus) => {
    getData()
    setSelectedIds([])
    setSelectedData([])
    setSelectedRows([])
    if (newStatus === PickupAvail) {
      setErrorMsg('Successfully updated status to ' + newStatus)
    } else {
      setErrorMsg(`Successfully created ${newStatus} Lot`)
      setErrorMsg1(`Lot Id: ${response.data.data._id}`)
      setErrorMsg2(`Check it on Outstanding`)
    }
    setSuccessMod(true)
  }

  const handleUpdateError = () => {
    setIsTableLoaded(false)
    setErrorMsg(updateStatusError)
    setFailMode(true)
  }

  const handleStatusUpdate = (event) => {
    if (selectedIds.length === 0) {
      setErrorMsg('No device selected')
      setFailMode(true)
      return
    }
    const newStatus = event.target.value
    setSelectedStatus(newStatus)
    setIsTableLoaded(true)

    const LDIds = pendingTableData
      .filter((obj) => selectedIds.includes(obj._id))
      .map((obj) => obj._id.toString())

    if (showModalForStatus(newStatus)) {
      return
    }

    const config = createStatusUpdateConfig(LDIds, newStatus)
    axios
      .request(config)
      .then((response) => handleUpdateSuccess(response, newStatus))
      .catch(handleUpdateError)
    setSelectedStatus('')
  }

  const confHandler = () => {
    setIsTableLoaded(true)
    if (selectedIds.length === 0) {
      setIsTableLoaded(false)
      setErrorMsg('No device selected')
      setFailMode(true)
    } else {
      setConfMod(true)
    }
  }

  return (
    <React.Fragment>
      <PendingDevicesTable
        pendingTableData={pendingTableData}
        setSelectedIds={setSelectedIds}
        setSelectedData={setSelectedData}
        setSelectedRows={setSelectedRows}
        selectedData={selectedData}
        selectedRows={selectedRows}
      />
      <div className='mx-2 flex gap-2'>
        <select
          className='border-2 w-1/2 outline-none border-primary bg-primary text-white text-[12px] px-4 py-2 rounded'
          value={selectedStatus}
          onChange={handleStatusUpdate}
        >
          <option value=''>Status</option>
          <option value={PickupAvail}>Available For Pickup</option>
          <option value='QC Done'>QC Done</option>
          <option value='Pending in QC'>Pending in QC</option>
          <option value='On Hold'>On Hold</option>
          <option value='Cancelled'>Cancelled</option>
        </select>
        <button
          onClick={confHandler}
          className='border-2 w-1/2 border-primary bg-primary text-white text-[12px] px-4 py-2 rounded'
        >
          Request For Payment
        </button>
      </div>
      {showCancelModal && (
        <CancelModal
          setShowCancelModal={setShowCancelModal}
          setIsTableLoaded={setIsTableLoaded}
          token2={token2}
          selectedIds={selectedIds}
          getData={getData}
          setSelectedIds={setSelectedIds}
          setSelectedData={setSelectedData}
          setSelectedRows={setSelectedRows}
          setErrorMsg={setErrorMsg}
          setErrorMsg1={setErrorMsg1}
          setErrorMsg2={setErrorMsg2}
          setSuccessMod={setSuccessMod}
          setFailMode={setFailMode}
        />
      )}
      {showHoldModal && (
        <HoldModal
          setShowHoldModal={setShowHoldModal}
          setIsTableLoaded={setIsTableLoaded}
          token2={token2}
          selectedIds={selectedIds}
          getData={getData}
          setSelectedIds={setSelectedIds}
          setSelectedData={setSelectedData}
          setSelectedRows={setSelectedRows}
          setErrorMsg={setErrorMsg}
          setSuccessMod={setSuccessMod}
          setFailMode={setFailMode}
        />
      )}
      {showQCDoneModal && (
        <QCDoneModal
          setShowQCDoneModal={setShowQCDoneModal}
          setIsTableLoaded={setIsTableLoaded}
          token2={token2}
          selectedIds={selectedIds}
          getData={getData}
          setSelectedIds={setSelectedIds}
          setSelectedData={setSelectedData}
          setSelectedRows={setSelectedRows}
          setErrorMsg={setErrorMsg}
          setSuccessMod={setSuccessMod}
          setFailMode={setFailMode}
        />
      )}
      {showAvailableForPickupModal && (
        <AvailableForPickupModal
          setShowAvailableForPickupModal={setShowAvailableForPickupModal}
          setIsTableLoaded={setIsTableLoaded}
          token2={token2}
          selectedIds={selectedIds}
          getData={getData}
          setSelectedIds={setSelectedIds}
          setSelectedData={setSelectedData}
          setSelectedRows={setSelectedRows}
          setErrorMsg={setErrorMsg}
          setSuccessMod={setSuccessMod}
          setFailMode={setFailMode}
        />
      )}
      {showPendingInQCModal && (
        <PendingInQCModal
          setShowPendingInQCModal={setShowPendingInQCModal}
          setIsTableLoaded={setIsTableLoaded}
          token2={token2}
          selectedIds={selectedIds}
          getData={getData}
          setSelectedIds={setSelectedIds}
          setSelectedData={setSelectedData}
          setSelectedRows={setSelectedRows}
          setErrorMsg={setErrorMsg}
          setSuccessMod={setSuccessMod}
          setFailMode={setFailMode}
        />
      )}
    </React.Fragment>
  )
}

export default PDTable