import React from 'react'
import { updateWarrantyObject } from '../../store/slices/QNAslice'
import { GoDotFill } from 'react-icons/go'
import imageMap from '../../utils/imageMap'
import store from '../../store/store'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

const EighthPart = ({ NDstate, slice }) => {
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
                      console.log(slice)
                      console.log('assssaaaaa', option)
                      console.log('assssaaaaa', data)
                      console.log(optionIndex + 'ok')
                      store.dispatch(
                        updateWarrantyObject({
                          index: index,
                          newKey: 'yes',
                          newAnswer: data.yes,
                        })
                      )
                    }}
                    className={` w-[48%]  flex flex-col items-center px-3 min-h-[150px] shadow-lg rounded-lg ${
                      !slice[index].selected[optionIndex] ? whiteBg : pinkBg
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
    </div>
  )
}

export default EighthPart
