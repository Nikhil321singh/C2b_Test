import axios from 'axios'

const PickupAvail = 'Available For Pickup'
const updateStatusError = 'Failed to update status'

export const useStatusHandlers = (
  token2,
  setSelectedIds,
  setSelectedData,
  setSelectedRows,
  setIsTableLoaded,
  setErrorMsg,
  setErrorMsg1,
  setErrorMsg2,
  setSuccessMod,
  setFailMode,
  getData
) => {
  const showModalForStatus = (
    status,
    setShowAvailableForPickupModal,
    setShowHoldModal,
    setShowQCDoneModal,
    setShowPendingInQCModal,
    setShowCancelModal
  ) => {
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

  return {
    showModalForStatus,
    createStatusUpdateConfig,
    handleUpdateSuccess,
    handleUpdateError,
  }
}