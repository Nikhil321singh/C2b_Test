import React from 'react'
import { GoDotFill } from 'react-icons/go'
import { updateAccessoriesObject } from '../../store/slices/QNAslice'
import imageMap from '../../utils/imageMap'

const whiteText = 'text-white'
const blackText = 'text-black'
const pinkBg = 'bg-primary'
const whiteBg = 'bg-white'

// Reusable OptionCard component
const OptionCard = ({ index, option, optionIndex, data, isSelected }) => {
  const handleClick = () => {
    store.dispatch(
      updateAccessoriesObject({
        index,
        yesKey: data.yes,
        noKey: data.no,
        newKey: 'yes',
        selectedIndex: optionIndex,
      })
    )
  }

  return (
    <div
      className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
        !isSelected ? whiteBg : pinkBg
      }`}
      onClick={handleClick}
    >
      <div className='mt-3 mb-1 rounded-md overflow-hidden bg-white'>
        <img
          className='scale-[1.2]'
          src={imageMap[option?.img] || option?.img}
        />
      </div>
      <div className='border-t-[1.5px] w-full py-2'>
        <p
          className={`text-xs font-medium text-center ${
            !isSelected ? blackText : whiteText
          }`}
        >
          {option.caption}
        </p>
      </div>
    </div>
  )
}

const SeventhPart = ({ NDstate, slice }) => {
  return (
    <div className='containClass'>
      <div className='subheading'>
        <GoDotFill size={20} />
        <h2>Select Accessories Not Available with Device</h2>
      </div>
      <div className='w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row'>
        {NDstate?.Accessories?.map((data, index) =>
          data.options.map((option, optionIndex) => (
            <OptionCard
              key={`${data._id}-${optionIndex}`}
              index={index}
              option={option}
              optionIndex={optionIndex}
              data={data}
              isSelected={slice[index].selected[optionIndex]}
            />
          ))
        )}
      </div>
      <div className='flex mt-4 bg-primary text-white font-medium py-2 px-3 text-sm text-pretty rounded-md'>
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  )
}

export default SeventhPart
