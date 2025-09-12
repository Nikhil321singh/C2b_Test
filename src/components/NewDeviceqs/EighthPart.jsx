import React, { useState, useEffect } from 'react'
import { updateWarrantyObject } from '../../store/slices/QNAslice'
import { GoDotFill } from 'react-icons/go'
import imageMap from '../../utils/imageMap'
import store from '../../store/store'
import {
  calculateWarrantyUplift,
  isBillAvailable,
} from '../../utils/pricingUtils'
import { useSelector } from 'react-redux'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

const EighthPart = ({ NDstate, slice }) => {
  const [selectedWarranty, setSelectedWarranty] = useState(null)
  const [priceImpact, setPriceImpact] = useState(0)
  const accessories = useSelector((state) => state.qna.Accessories)

  // Get device price from session storage
  const getDevicePrice = () => {
    try {
      const dataModel = JSON.parse(sessionStorage.getItem('dataModel'))
      return dataModel?.models?.config.price || 0
    } catch {
      return 0
    }
  }

  const devicePrice = getDevicePrice()
  const billAvailable = isBillAvailable(accessories)

  // Warranty configuration with uplifts
  const warrantyRanges = [
    { key: '0_3_months', label: '0–3 Months', uplift: 0.08 },
    { key: '3_6_months', label: '3–6 Months', uplift: 0.03 },
    { key: '6_11_months', label: '6–11 Months', uplift: 0.01 },
    { key: 'above_11_months', label: 'More than 11 Months', uplift: 0.005 },
    { key: 'out_of_warranty', label: 'Out of Warranty', uplift: 0 },
  ]

  const handleWarrantySelection = (option, data, index) => {
    // Find warranty range by matching option caption
    const warrantyRange = warrantyRanges.find(
      (range) =>
        range.label
          .toLowerCase()
          .includes(option.caption.toLowerCase().split(' ')[0]) ||
        option.caption.toLowerCase().includes('out of warranty')
    )

    if (warrantyRange) {
      setSelectedWarranty(warrantyRange)

      // Calculate price impact only if bill is available or it's out of warranty
      if (billAvailable || warrantyRange.key === 'out_of_warranty') {
        console.log('Device price:', devicePrice)
        const uplift = calculateWarrantyUplift(devicePrice, warrantyRange.key)
        setPriceImpact(uplift)
      } else {
        setPriceImpact(0)
      }
    }

    // Original store dispatch
    store.dispatch(
      updateWarrantyObject({
        index: index,
        newKey: 'yes',
        newAnswer: data.yes,
      })
    )
  }

  return (
    <div className='containClass'>
      <div className='subheading'>
        <GoDotFill size={20} />
        <h2>Please Choose the Appropriate Warranty Period for Your Device</h2>
      </div>
      <div className='w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row'>
        {NDstate?.Warranty &&
          NDstate?.Warranty.map((data, index) => (
            <React.Fragment key={data._id}>
              {data?.options.map((option, optionIndex) => (
                <React.Fragment key={optionIndex}>
                  <div
                    onClick={(e) => {
                      const isDisabled =
                        !billAvailable &&
                        !option.caption
                          .toLowerCase()
                          .includes('out of warranty')
                      if (!isDisabled) {
                        handleWarrantySelection(option, data, index)
                      }
                    }}
                    className={` w-[48%] flex flex-col items-center px-3 min-h-[150px] shadow-lg rounded-lg cursor-pointer transition-all duration-200 ${
                      !billAvailable &&
                      !option.caption.toLowerCase().includes('out of warranty')
                        ? 'bg-gray-100 cursor-not-allowed opacity-50'
                        : !slice[index].selected[optionIndex]
                        ? `${whiteBg} hover:shadow-md`
                        : pinkBg
                    }`}
                  >
                    <div className='mt-3 mb-1 overflow-hidden bg-white  rounded-md '>
                      <img
                        className='scale-[1.2]'
                        src={imageMap[option?.img] || option?.img}
                      />
                    </div>
                    <div className='border-t-[1.5px] w-full py-2'>
                      <p
                        className={`text-xs text-center  font-medium ${
                          !slice[index].selected[optionIndex]
                            ? blackText
                            : whiteText
                        }`}
                      >
                        {option.caption}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
      </div>

      {/* Bill availability warning */}
      {!billAvailable && (
        <div className='mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
          <p className='text-sm text-yellow-800'>
            <strong>Note:</strong> Since bill is not available, warranty ranges
            are disabled except "Out of Warranty".
          </p>
        </div>
      )}
    </div>
  )
}

export default EighthPart
