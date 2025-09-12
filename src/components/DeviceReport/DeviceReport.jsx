import React from 'react'
import styles from './DeviceReport.module.css'
import { useSelector } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import { LuDot } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'

const DeviceReport = ({ setShowDeviceReport, quoteSaved }) => {
  console.log(quoteSaved)
  const exactQuoteValue = sessionStorage.getItem('ExactQuote')
  const DeviceType = sessionStorage.getItem('DeviceType')
  const isWatch = DeviceType === 'Watch' ? true : false
  const navigate = useNavigate()
  let data = useSelector((state) => state.qna)
  const watchdata = useSelector((state) => state.watchQNA)
  const quickData = useSelector((state) => state.qnaQuick)
  // Get raw questions data with options
  const rawQuestions = useSelector((state) => state.qna.rawQuestions)
  console.log(quickData)
  if (isWatch) {
    data = watchdata
  }

  const closeHandler = () => {
    setShowDeviceReport(false)
  }

  const clickHandler = () => {
    if (!isWatch) {
      if (exactQuoteValue === 'true') {
        navigate('/device/Qestions')
      } else {
        navigate('/QuickQuote')
      }
    } else {
      navigate('/watchQs')
    }
  }

  return (
    <div className={`${styles.devrep_page} z-50 select-none`}>
      <div className={`${styles.devrep_wrap}`}>
        <div className={`${styles.devrep_nav}`}>
          <div className='flex-1 flex items-center'>
            <p className='px-2 text-xl font-medium border-r-2 cursor-default' style={{color: 'var(--primary-color)', borderColor: 'var(--primary-color)'}}>
              Device Report
            </p>
            {!quoteSaved && (
              <p
                onClick={clickHandler}
                className='cursor-pointer pl-2 text-sm font-medium text-primary underline underline-offset-2 hover:underline-offset-4'
              >
                Modify Answers
              </p>
            )}
          </div>
          <button
            onClick={closeHandler}
            className='ml-4 p-2 rounded-full transition-colors duration-200 flex items-center justify-center'
            style={{'&:hover': {backgroundColor: 'rgba(236, 39, 82, 0.1)'}}}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(236, 39, 82, 0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            aria-label='Close device report'
          >
            <IoClose size={24} className='hover:opacity-80' style={{color: 'var(--primary-color)'}} />
          </button>
        </div>
        <CoreCosDis data={data} quickData={quickData} rawQuestions={rawQuestions} exactQuoteValue={exactQuoteValue} />
        {data?.Accessories.length > 0 && (
          <QuestionSection 
            title="Accessories" 
            data={data?.Accessories} 
            quickData={quickData?.Accessories}
            rawQuestions={rawQuestions?.Accessories}
            exactQuoteValue={exactQuoteValue}
          />
        )}
        {data?.Functional.length > 0 && (
          <QuestionSection 
            title="Functional" 
            data={data?.Functional} 
            quickData={quickData?.Functional}
            rawQuestions={rawQuestions?.Functional}
            exactQuoteValue={exactQuoteValue}
          />
        )}
        {data?.Physical && (
          <QuestionSection 
            title="Physical" 
            data={data?.Physical} 
            quickData={quickData?.Physical}
            rawQuestions={rawQuestions?.Physical}
            exactQuoteValue={exactQuoteValue}
          />
        )}
        <>
          <FunctionalList
            title='Functional Major'
            data={data?.Functional_major}
            quickData={quickData?.Functional_major}
            rawQuestions={rawQuestions?.Functional_major}
            exactQuoteValue={exactQuoteValue}
          />
          <FunctionalList
            title='Functional Minor'
            data={data?.Functional_minor}
            quickData={quickData?.Functional_minor}
            rawQuestions={rawQuestions?.Functional_minor}
            exactQuoteValue={exactQuoteValue}
          />
        </>
        <div className={`${styles.ques_box}`}>
          <p className={`${styles.ques_head} font-medium text-base`}>
            Warranty
          </p>
          <div className='flex div'>
            <LuDot size={25} className='shrink-0' style={{color: 'var(--primary-color)'}} />
            <p className='text-sm font-medium opacity-[0.8]'>
              What is your phone's age?
            </p>
          </div>
          <div className={`${styles.ques_wrap}`}>
            {exactQuoteValue === 'false'
              ? quickData.Warranty.map((item) => (
                  <div
                    key={item.index}
                    className='flex flex-row items-center w-full'
                  >
                    {item.key === 'yes' && (
                      <div className='flex justify-between w-[85%] questionkey'>
                        <p className='text-sm font-medium opacity-60 ml-[30px]'>
                          {item.quetion}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              : data.Warranty.map((item) => (
                  <div
                    key={item.index}
                    className='flex flex-row items-center w-full'
                  >
                    {item.key === 'yes' && (
                      <div className='flex justify-between w-[85%] questionkey'>
                        <p className='text-sm font-medium opacity-60 ml-[30px]'>
                          {item.quetion}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeviceReport

// Helper component for rendering question sections
const QuestionSection = ({ title, data, quickData, rawQuestions, exactQuoteValue }) => {
  // Helper function to render question options with answers
  const renderQuestionOptions = (selectedAnswers, rawQuestionsGroup) => {
    if (!rawQuestionsGroup || rawQuestionsGroup.length === 0) return null
    
    return rawQuestionsGroup.map((questionData, questionIndex) => {
      if (!questionData.options || questionData.options.length === 0) {
        // If no options, show the original question
        const answer = selectedAnswers[questionIndex]
        return (
          <div key={questionIndex} className="flex flex-row items-center w-full p-3 rounded-lg border" style={{backgroundColor: 'rgba(236, 39, 82, 0.05)', borderColor: 'rgba(236, 39, 82, 0.2)'}}>
            <LuDot size={20} className="shrink-0" style={{color: 'var(--primary-color)'}} />
            <div className="flex justify-between w-[85%] questionkey">
              <p className="text-sm font-medium text-gray-800">{questionData.quetion}</p>
              <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full uppercase" style={{backgroundColor: 'rgba(236, 39, 82, 0.1)', color: 'var(--primary-color)'}}>{answer?.key}</span>
            </div>
          </div>
        )
      }
      
      // Show individual options with their selection status
      return questionData.options.map((option, optionIndex) => {
        const answer = selectedAnswers[questionIndex]
        const isSelected = answer?.selected[optionIndex]
        
        // Show all options with YES/NO based on selection status
        return (
          <div key={`${questionIndex}-${optionIndex}`} className="flex flex-row items-center w-full p-3 rounded-lg border" style={{backgroundColor: isSelected ? 'rgba(236, 39, 82, 0.05)' : 'rgba(107, 114, 128, 0.05)', borderColor: isSelected ? 'rgba(236, 39, 82, 0.2)' : 'rgba(107, 114, 128, 0.2)'}}>
            <LuDot size={20} className="shrink-0" style={{color: isSelected ? 'var(--primary-color)' : '#9CA3AF'}} />
            <div className="flex justify-between w-[85%] questionkey">
              <p className={`text-sm font-medium ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>{option.caption}</p>
              <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full" style={{backgroundColor: isSelected ? 'rgba(236, 39, 82, 0.1)' : 'rgba(107, 114, 128, 0.1)', color: isSelected ? 'var(--primary-color)' : '#6B7280'}}>
                {isSelected ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        )
      })
    }).flat().filter(Boolean)
  }
  
  const selectedAnswers = exactQuoteValue === 'false' ? quickData : data
  
  return (
    <div className={`${styles.ques_box}`}>
      <p className={`${styles.ques_head} font-medium text-base`}>{title}</p>
      <div className={`${styles.ques_wrap}`}>
        {renderQuestionOptions(selectedAnswers, rawQuestions)}
      </div>
    </div>
  )
}

const CoreCosDis = ({ data, quickData, rawQuestions, exactQuoteValue }) => {
  
  // Helper function to render question options with answers
  const renderQuestionOptions = (groupName, selectedAnswers, rawQuestionsGroup) => {
    if (!rawQuestionsGroup || rawQuestionsGroup.length === 0) return null
    
    return rawQuestionsGroup.map((questionData, questionIndex) => {
      if (!questionData.options || questionData.options.length === 0) {
        // If no options, show the original question
        const answer = selectedAnswers[questionIndex]
        return (
          <div key={questionIndex} className="flex flex-row items-center w-full p-3 rounded-lg border" style={{backgroundColor: 'rgba(236, 39, 82, 0.05)', borderColor: 'rgba(236, 39, 82, 0.2)'}}>
            <LuDot size={20} className="shrink-0" style={{color: 'var(--primary-color)'}} />
            <div className="flex justify-between w-[85%] questionkey">
              <p className="text-sm font-medium text-gray-800">{questionData.quetion}</p>
              <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full uppercase" style={{backgroundColor: 'rgba(236, 39, 82, 0.1)', color: 'var(--primary-color)'}}>{answer?.key}</span>
            </div>
          </div>
        )
      }
      
      // Show individual options with their selection status
      return questionData.options.map((option, optionIndex) => {
        const answer = selectedAnswers[questionIndex]
        const isSelected = answer?.selected[optionIndex]
        
        // Show all options with YES/NO based on selection status
        return (
          <div key={`${questionIndex}-${optionIndex}`} className="flex flex-row items-center w-full p-3 rounded-lg border" style={{backgroundColor: isSelected ? 'rgba(236, 39, 82, 0.05)' : 'rgba(107, 114, 128, 0.05)', borderColor: isSelected ? 'rgba(236, 39, 82, 0.2)' : 'rgba(107, 114, 128, 0.2)'}}>
            <LuDot size={20} className="shrink-0" style={{color: isSelected ? 'var(--primary-color)' : '#9CA3AF'}} />
            <div className="flex justify-between w-[85%] questionkey">
              <p className={`text-sm font-medium ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>{option.caption}</p>
              <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full" style={{backgroundColor: isSelected ? 'rgba(236, 39, 82, 0.1)' : 'rgba(107, 114, 128, 0.1)', color: isSelected ? 'var(--primary-color)' : '#6B7280'}}>
                {isSelected ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        )
      })
    }).flat().filter(Boolean)
  }
  return (
    <React.Fragment>
      {(quickData?.Core.length > 0 || data?.Core.length > 0) && (
        <div className={`${styles.ques_box}`}>
          <p className={`${styles.ques_head} font-medium text-base`}>Core</p>
          <div className={`${styles.ques_wrap}`}>
            {renderQuestionOptions(
              'Core',
              exactQuoteValue === 'false' ? quickData?.Core.slice(0, 2) : data?.Core,
              rawQuestions?.Core
            )}
          </div>
        </div>
      )}
      {(quickData?.Cosmetics.length > 0 || data?.Cosmetics.length > 0) && (
        <div className={`${styles.ques_box}`}>
          <p className={`${styles.ques_head} font-medium text-base`}>
            Cosmetics
          </p>
          <div className={`${styles.ques_wrap}`}>
            {renderQuestionOptions(
              'Cosmetics',
              exactQuoteValue === 'false' ? quickData?.Cosmetics.slice(0, 2) : data?.Cosmetics,
              rawQuestions?.Cosmetics
            )}
          </div>
        </div>
      )}
      {(quickData?.Display.length > 0 || data?.Display.length > 0) && (
        <div className={`${styles.ques_box}`}>
          <p className={`${styles.ques_head} font-medium text-base`}>Display</p>
          <div className={`${styles.ques_wrap}`}>
            {renderQuestionOptions(
              'Display',
              exactQuoteValue === 'false' ? quickData?.Display.slice(0, 2) : data?.Display,
              rawQuestions?.Display
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

const FunctionalList = ({ title, data, quickData, rawQuestions, exactQuoteValue }) => {
  // Helper function to render question options with answers
  const renderQuestionOptions = (selectedAnswers, rawQuestionsGroup) => {
    if (!rawQuestionsGroup || rawQuestionsGroup.length === 0) return null
    
    return rawQuestionsGroup.map((questionData, questionIndex) => {
      if (!questionData.options || questionData.options.length === 0) {
        // If no options, show the original question
        const answer = selectedAnswers[questionIndex]
        return (
          <div key={questionIndex} className="flex flex-row items-center w-full p-3 rounded-lg border" style={{backgroundColor: 'rgba(236, 39, 82, 0.05)', borderColor: 'rgba(236, 39, 82, 0.2)'}}>
            <LuDot size={20} className="shrink-0" style={{color: 'var(--primary-color)'}} />
            <div className="flex justify-between w-[85%] questionkey">
              <p className="text-sm font-medium text-gray-800">{questionData.quetion}</p>
              <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full uppercase" style={{backgroundColor: 'rgba(236, 39, 82, 0.1)', color: 'var(--primary-color)'}}>{answer?.key}</span>
            </div>
          </div>
        )
      }
      
      // Show individual options with their selection status
      return questionData.options.map((option, optionIndex) => {
        const answer = selectedAnswers[questionIndex]
        const isSelected = answer?.selected[optionIndex]
        
        // Show all options with YES/NO based on selection status
        return (
          <div key={`${questionIndex}-${optionIndex}`} className="flex flex-row items-center w-full p-3 rounded-lg border" style={{backgroundColor: isSelected ? 'rgba(236, 39, 82, 0.05)' : 'rgba(107, 114, 128, 0.05)', borderColor: isSelected ? 'rgba(236, 39, 82, 0.2)' : 'rgba(107, 114, 128, 0.2)'}}>
            <LuDot size={20} className="shrink-0" style={{color: isSelected ? 'var(--primary-color)' : '#9CA3AF'}} />
            <div className="flex justify-between w-[85%] questionkey">
              <p className={`text-sm font-medium ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>{option.caption}</p>
              <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full" style={{backgroundColor: isSelected ? 'rgba(236, 39, 82, 0.1)' : 'rgba(107, 114, 128, 0.1)', color: isSelected ? 'var(--primary-color)' : '#6B7280'}}>
                {isSelected ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        )
      })
    }).flat().filter(Boolean)
  }
  
  const items = exactQuoteValue === 'false' ? quickData?.slice(0, 2) : data

  if (!items || items.length === 0) {
    return null
  }
  
  return (
    <div className={`${styles.ques_box}`}>
      <p className={`${styles.ques_head} font-medium text-base`}>{title}</p>
      <div className={`${styles.ques_wrap}`}>
        {renderQuestionOptions(items, rawQuestions)}
      </div>
    </div>
  )
}
