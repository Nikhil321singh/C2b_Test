import axios from 'axios'
import React, { useState } from 'react'
import { CgSpinner } from 'react-icons/cg'
import { ImArrowLeft } from 'react-icons/im'
import { useNavigate } from 'react-router-dom'
import store from '../../store/store'
import { setResponseData } from '../../store/slices/responseSlice'

const AboveSix = ({
  visible,
  setVisible,
  updateAns,
  showPopup,
  qna,
  profile,
  availableParts,
}) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  function handleADD() {
    if (showPopup === false && visible < availableParts.length) {
      setVisible(visible + 1)
    }
  }

  function handleSubtract() {
    if (visible > 1) {
      setVisible(visible - 1)
    }
  }
  const handlesubmit = async () => {
    const id = JSON.parse(sessionStorage.getItem('dataModel'))
    const userToken2 = sessionStorage.getItem('authToken')
    setIsLoading(true)
    console.log(id, profile)
    const finalPayload = {
      QNA: qna,
      phoneNumber: id?.phoneNumber ? id?.phoneNumber : '123456789',
      aadharNumber: id?.aadharNumber ? id?.aadharNumber : '123456789012',
      modelId: id?.models?._id,
      storage: id?.models?.config?.storage,
      ram: id?.models?.config?.RAM,
      name: id?.customerName ? id?.customerName : profile?.name,
    }
    const billData = finalPayload.QNA.Accessories.find(
      (item) => item.quetion && item.quetion.toLowerCase().includes('bill')
    )
    if (billData) {
      sessionStorage.setItem('billData', JSON.stringify(billData))
    } else {
      sessionStorage.setItem(
        'billData',
        JSON.stringify(finalPayload.QNA.Cosmetics[6])
      )
      console.log("No Accessories item with 'bill' found.")
    }
    const response = await axios.post(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/questionnaires/calculatePrice`,
      finalPayload,
      { headers: { Authorization: userToken2 } }
    )
    await logQuickQuoteAttempt(response.data.data, id)
    sessionStorage.setItem('LeadId', response.data.data.id)
    sessionStorage.setItem(
      'responsedatadata',
      JSON.stringify({ ...response.data.data, bonus: 0 })
    )
    sessionStorage.setItem('ExactQuote', true)
    store.dispatch(setResponseData({ ...response.data.data, bonus: 0 }))
    setIsLoading(false)
    navigate('/devicequote')
  }

  const logQuickQuoteAttempt = async (quoteResult, deviceModel) => {
    const token = sessionStorage.getItem('authToken')

    if (!token || !quoteResult?.id || !deviceModel?.models?._id) {
      console.error('Cannot log quote: Missing critical data.')
      return
    }
    const logPayload = {
      quoteType: 'Get Exact Value',
      quoteAmount: quoteResult.price,
      grade: quoteResult.grade,
      deviceDetails: {
        modelId: deviceModel?.models?._id,
        name: deviceModel?.models?.name,
        brandId: deviceModel?.models?.brandId,
        categoryName: deviceModel?.models?.categoryInfo?.categoryName,
        ram: deviceModel?.models?.config?.RAM,
        rom: deviceModel?.models?.config?.storage,
        series: deviceModel?.models?.series,
      },
    }
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/quoteTracking/log-quote-attempt`,
        logPayload,
        { headers: { Authorization: token } }
      )
    } catch (error) {
      console.error('Error logging Quick Quote attempt:', error)
    }
  }
  return (
    <React.Fragment>
      {visible >= availableParts.length ? (
        <div className='fixed bottom-0 flex justify-center w-full gap-2 p-3 bg-white border-t-2'>
          <div
            onClick={handleSubtract}
            className={`bg-primary w-[30%] px-6 py-2 rounded-lg flex items-center justify-center`}
          >
            <ImArrowLeft color='white' size={20} />
          </div>
          <div
            onClick={handlesubmit}
            className='bg-primary w-[70%] relative text-center py-1 px-2 rounded-lg cursor-pointer flex justify-between text-white items-center'
          >
            {isLoading && (
              <CgSpinner
                size={20}
                className='absolute left-[18%] top-[8px] mt-1 animate-spin'
              />
            )}
            <p className='w-full p-1 text-xl font-medium'>
              {isLoading ? 'Submitting' : 'Submit'}
            </p>
          </div>
        </div>
      ) : (
        <div className='fixed bottom-0 justify-center flex w-full gap-2 p-3 bg-white border-t-2'>
          {visible > 0 && visible <= availableParts.length && (
            <button
              onClick={handleSubtract}
              className={`  ${
                visible < 2
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-primary cursor-pointer'
              }  w-[30%] px-6 py-2 rounded-lg flex items-center justify-center`}
            >
              <ImArrowLeft color='white' size={20} />
            </button>
          )}
          <div
            onClick={handleADD}
            className='bg-primary w-[70%] py-1 px-2 text-center rounded-lg cursor-pointer flex justify-between text-white items-center'
          >
            <p className='w-full p-1 text-xl font-medium'>Continue</p>
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

export default AboveSix
