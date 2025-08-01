import React from 'react'
import { updateFunctionalMinorObject } from '../../store/slices/QNAslice'
import { GoDotFill } from 'react-icons/go'
import imageMap from '../../utils/imageMap'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

const FifthPart = ({ NDstate, slice }) => {
  return (
    <div className='containClass'>
      <div className='subheading'>
        <GoDotFill size={20} />
        <h2>Functional Condition of the Device</h2>
      </div>
      <div className='w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row'>
        {NDstate?.Functional_minor &&
          NDstate?.Functional_minor.map((data, index) => (
            <React.Fragment key={data._id}>
              {data?.options.map((option, optionIndex) => (
                <React.Fragment key={optionIndex}>
                  <div
                    className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
                      !slice[index].selected[optionIndex] ? whiteBg : pinkBg
                    }`}
                    onClick={(e) => {
                      console.log(slice)
                      console.log('assssaaaaa', option)
                      console.log('assssaaaaa', data)
                      console.log(optionIndex + 'ok')
                      store.dispatch(
                        updateFunctionalMinorObject({
                          index: index,
                          yesKey: data.yes,
                          noKey: data.no,
                          newKey: 'yes',
                          selectedIndex: optionIndex,
                        })
                      )
                    }}
                  >
                    <div className='mt-3 mb-1 rounded-md overflow-hidden bg-white'>
                      <img
                        className='scale-[1.2]'
                        src={imageMap[option?.img] || option?.img}
                      />
                    </div>
                    <div className='border-t-[1.5px]   py-2 w-full '>
                      <p
                        className={`text-xs    text-center  font-medium${
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
      <div className='flex  mt-4 bg-primary text-white font-medium text-pretty  py-2 px-3  text-sm rounded-md'>
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  )
}

export default FifthPart
