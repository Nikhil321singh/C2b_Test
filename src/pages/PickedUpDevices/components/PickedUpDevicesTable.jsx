import React, { useState } from 'react'
import axios from 'axios'
import ViewPickupTable from '../../../components/ViewPickupTable/ViewPickupTable'
import ReasonModal from './ReasonModal'
import UserAdminContent from './UserAdminContent'
import styles from '../PickedUpDevices.module.css'
import {
  userRoles,
  TABLE_CELL_BASE,
  TABLE_CELL_CENTER,
  FLEX_COL_GAP_1,
  checkOnPkd,
  PendingConf,
  PickConf,
  PickDelivered,
  DeliveredConf,
  ApprovDelivery,
  PickupCompleteConf,
  PickupCancelConf,
  OutForPickup,
} from '../constants'

const PickedUpDevicesTable = ({
  data,
  confHandler,
  setIsTableLoaded,
  setConfMod,
  getData,
  setErrorMsg,
  setErrorMsg1,
  setErrorMsg2,
  setSuccessMod,
  setFailMode,
}) => {
  const LoggedInUser = JSON.parse(sessionStorage.getItem('profile'))
  const userRole = LoggedInUser?.role || ''
  const [showView, setShowView] = useState(false)
  const [viewRef, setViewRef] = useState('')
  const token2 = sessionStorage.getItem('authToken')
  const [showPickupModal, setShowPickupModal] = useState(false)
  const [showPickupCompleteModal, setShowPickupCompleteModal] = useState(false)
  const [showPickupCancelModal, setShowPickupCancelModal] = useState(false)
  const [showPickupDeliveredModal, setShowPickupDeliveredModal] =
    useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showApproveDeliveryModal, setShowApproveDeliveryModal] =
    useState(false)
  const [showOutForPickupModal, setShowOutForPickupModal] = useState(false)
  const [tempRefId, setTempRefId] = useState('')
  const [tempUniqueCode, setTempUniqueCode] = useState('')
  const [tempNewStatus, setTempNewStatus] = useState('')

  const viewHandler = (refID) => {
    setViewRef(refID)
    setShowView(true)
  }

  const statusUpdateHandler = (refID, newStatus, uniqueCode) => {
    setTempRefId(refID)
    setTempUniqueCode(uniqueCode)
    setTempNewStatus(newStatus)

    // Show appropriate modal based on status
    if (newStatus === PickConf) {
      setShowPickupModal(true)
    } else if (newStatus === PickupCompleteConf) {
      setShowPickupCompleteModal(true)
    } else if (newStatus === PickupCancelConf) {
      setShowPickupCancelModal(true)
    } else if (newStatus === PickDelivered) {
      setShowPickupDeliveredModal(true)
    } else if (newStatus === DeliveredConf) {
      setShowAcceptModal(true)
    } else if (newStatus === ApprovDelivery) {
      setShowApproveDeliveryModal(true)
    } else if (newStatus === OutForPickup) {
      setShowOutForPickupModal(true)
    } else {
      // Direct update for other statuses
      performStatusUpdate(refID, newStatus, uniqueCode, '')
    }
  }

  const performStatusUpdate = (refID, newStatus, uniqueCode, reason = '') => {
    setIsTableLoaded(true)
    setConfMod(false)
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pickupDevices/update`,
      headers: { Authorization: token2 },
      data: {
        refIDs: [refID],
        newStatus: newStatus,
        reason: reason,
      },
    }
    axios
      .request(config)
      .then((response) => {
        setErrorMsg(`Successfully Updated Status to ${newStatus}`)
        setErrorMsg1(`Lot No. :- ${uniqueCode}`)
        setErrorMsg2(checkOnPkd)
        if (newStatus === PickConf) {
          setErrorMsg(`Pickup Confirmed Successfully, Lot No. ${uniqueCode}`)
          setErrorMsg1(`Status Pending for Delivery at Warehouse`)
          setErrorMsg2(checkOnPkd)
        }
        if (newStatus === PickDelivered) {
          setErrorMsg(`Successfully Updated Status to ${newStatus}`)
          setErrorMsg1(
            `Pending Admin Approval for Delivery for Lot No. :- ${uniqueCode}`
          )
          setErrorMsg2('Check it On History')
        }
        if (newStatus === ApprovDelivery) {
          setErrorMsg(`Successfully Updated Status to ${newStatus}`)
          setErrorMsg1(`Lot No. :- ${uniqueCode}`)
          setErrorMsg2('Check it On History')
        }
        setSuccessMod(true)
        getData()
        setIsTableLoaded(false)
      })
      .catch((error) => {
        setErrorMsg(
          `Failed to updated the status of lot ${uniqueCode} to ${newStatus}`
        )
        setFailMode(true)
        setIsTableLoaded(false)
      })
  }

  const renderTechnicianActions = (val) => (
    <div className={FLEX_COL_GAP_1}>
      <button
        className={`${styles.view_btn}`}
        onClick={() => viewHandler(val?._id)}
      >
        View
      </button>
      {val?.status === PendingConf && (
        <div className={FLEX_COL_GAP_1}>
          <button
            onClick={() =>
              statusUpdateHandler(val?._id, PickConf, val?.uniqueCode)
            }
            className={`${styles.acpt_btn}`}
          >
            Pickup
          </button>
        </div>
      )}
      {val?.status === PickConf && (
        <div className={FLEX_COL_GAP_1}>
          <button
            onClick={() =>
              statusUpdateHandler(val?._id, PickDelivered, val?.uniqueCode)
            }
            className={`${styles.acpt_btn}`}
          >
            Pickup Delivered
          </button>
        </div>
      )}
    </div>
  )

  const renderStoreActions = (val) => (
    <div className={FLEX_COL_GAP_1}>
      <button
        className={`${styles.view_btn}`}
        onClick={() => viewHandler(val?._id)}
      >
        View
      </button>
    </div>
  )

  const renderActionCell = (val) => (
    <td className={TABLE_CELL_CENTER}>
      {userRoles[userRole] === 'Store' && renderStoreActions(val)}
      {(userRole === 'Super Admin' || userRole === 'Admin Manager') && (
        <UserAdminContent
          confHandler={confHandler}
          val={val}
          statusUpdateHandler={statusUpdateHandler}
          viewHandler={viewHandler}
        />
      )}
      {userRole === 'Technician' && renderTechnicianActions(val)}
    </td>
  )

  return (
    <div className={`${styles.pd_cont}`}>
      <div className='m-2 overflow-x-auto md:m-5'>
        {showView && (
          <div className={styles.view_wrap}>
            <ViewPickupTable refNo={viewRef} setShowView={setShowView} />
          </div>
        )}
        <table className='w-full border border-primary'>
          <thead className='bg-primary text-white'>
            <tr>
              <th className={TABLE_CELL_BASE}>Action</th>
              <th className={TABLE_CELL_BASE}>Status</th>
              <th className={TABLE_CELL_BASE}>Date</th>
              <th className={TABLE_CELL_BASE}>Lot Number</th>
              <th className={TABLE_CELL_BASE}>Number Of Device</th>
              <th className={TABLE_CELL_BASE}>Amount</th>
              <th className={TABLE_CELL_BASE}>Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-200' : ''}>
                {renderActionCell(val)}
                <td className={TABLE_CELL_CENTER}>{val?.status}</td>
                <td className={TABLE_CELL_CENTER}>
                  {new Date(val.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className={TABLE_CELL_CENTER}>
                  {val?.uniqueCode || val?._id}
                </td>
                <td className={TABLE_CELL_CENTER}>{val?.totalDevice}</td>
                <td className={TABLE_CELL_CENTER}>{val?.totalAmount}</td>
                <td className={TABLE_CELL_CENTER}>{val?.remarks || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPickupModal && (
        <ReasonModal
          title='Pickup Reason'
          placeholder='Enter reason for pickup'
          onSubmit={(reason) => {
            performStatusUpdate(
              tempRefId,
              tempNewStatus,
              tempUniqueCode,
              reason
            )
            setShowPickupModal(false)
          }}
          onClose={() => setShowPickupModal(false)}
        />
      )}
      {showPickupCompleteModal && (
        <ReasonModal
          title='Pickup Complete Reason'
          placeholder='Enter reason for pickup complete'
          onSubmit={(reason) => {
            performStatusUpdate(
              tempRefId,
              tempNewStatus,
              tempUniqueCode,
              reason
            )
            setShowPickupCompleteModal(false)
          }}
          onClose={() => setShowPickupCompleteModal(false)}
        />
      )}
      {showPickupCancelModal && (
        <ReasonModal
          title='Pickup Cancel Reason'
          placeholder='Enter reason for pickup cancellation'
          onSubmit={(reason) => {
            performStatusUpdate(
              tempRefId,
              tempNewStatus,
              tempUniqueCode,
              reason
            )
            setShowPickupCancelModal(false)
          }}
          onClose={() => setShowPickupCancelModal(false)}
        />
      )}
      {showPickupDeliveredModal && (
        <ReasonModal
          title='Pickup Delivered Reason'
          placeholder='Enter reason for pickup delivered'
          onSubmit={(reason) => {
            performStatusUpdate(
              tempRefId,
              tempNewStatus,
              tempUniqueCode,
              reason
            )
            setShowPickupDeliveredModal(false)
          }}
          onClose={() => setShowPickupDeliveredModal(false)}
        />
      )}
      {showAcceptModal && (
        <ReasonModal
          title='Accept Delivery Reason'
          placeholder='Enter reason for accepting delivery'
          onSubmit={(reason) => {
            performStatusUpdate(
              tempRefId,
              tempNewStatus,
              tempUniqueCode,
              reason
            )
            setShowAcceptModal(false)
          }}
          onClose={() => setShowAcceptModal(false)}
        />
      )}
      {showApproveDeliveryModal && (
        <ReasonModal
          title='Approve Delivery Reason'
          placeholder='Enter reason for approving delivery'
          onSubmit={(reason) => {
            performStatusUpdate(
              tempRefId,
              tempNewStatus,
              tempUniqueCode,
              reason
            )
            setShowApproveDeliveryModal(false)
          }}
          onClose={() => setShowApproveDeliveryModal(false)}
        />
      )}
      {showOutForPickupModal && (
        <ReasonModal
          title='Out For Pickup Reason'
          placeholder='Enter reason for sending out for pickup'
          onSubmit={(reason) => {
            performStatusUpdate(
              tempRefId,
              tempNewStatus,
              tempUniqueCode,
              reason
            )
            setShowOutForPickupModal(false)
          }}
          onClose={() => setShowOutForPickupModal(false)}
        />
      )}
    </div>
  )
}

export default PickedUpDevicesTable
