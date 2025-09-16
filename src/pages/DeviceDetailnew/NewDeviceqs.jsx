import React, { useEffect, useReducer, useState } from 'react'
import './newDeviceqs.scss'
import { useQuestionContext } from '../../components/QuestionContext'
import axios from 'axios'
import store from '../../store/store'
import { useSelector } from 'react-redux'
import banner from '../../assets/banner.jpg'
import MainQContainer from '../../components/NewDeviceqs/MainQContainer'
import FirstPart from '../../components/NewDeviceqs/FirstPart'
import SecondPart from '../../components/NewDeviceqs/SecondPart'
import ThirdPart from '../../components/NewDeviceqs/ThirdPart'
import FourthPart from '../../components/NewDeviceqs/FourthPart'
import FifthPart from '../../components/NewDeviceqs/FifthPart'
import SixthPart from '../../components/NewDeviceqs/SixthPart'
import SeventhPart from '../../components/NewDeviceqs/SeventhPart'
import EighthPart from '../../components/NewDeviceqs/EighthPart'
import { setGroupAnswers, setRawQuestions } from '../../store/slices/QNAslice'
import useUserProfile from '../../utils/useUserProfile'
import styless from '../QuickQuote/QuickQuote.module.css'
import { initialState, qnaReducer } from '../../utils/qnaReducer'

const NewDeviceqs = () => {
  const userToken = sessionStorage.getItem('authToken')
  const DeviceType = sessionStorage.getItem('DeviceType')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { answers, setAnswers } = useQuestionContext()
  const [visible, setVisible] = useState(1)
  const [newGroupanswers, setNewGroupAnswers] = useState()
  const profile = useUserProfile()
  const core = useSelector((state) => state.qna.Core)
  const Cosmetics = useSelector((state) => state.qna.Cosmetics)
  const Display = useSelector((state) => state.qna.Display)
  const Accessories = useSelector((state) => state.qna.Accessories)
  const Functional = useSelector((state) => state.qna.Functional)
  const FunctionalMajor = useSelector((state) => state.qna.Functional_major)
  const FunctionalMinor = useSelector((state) => state.qna.Functional_minor)
  const Warranty = useSelector((state) => state.qna.Warranty)
  const [showPopup, setShowPopup] = useState(true)
  const [NDstate, dispatch] = useReducer(qnaReducer, initialState)
  const qna = useSelector((state) => state.qna)

  const fetchData = async () => {
    try {
      const apiUrl = `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/questionnaires/findAll?page=0&limit=99&type=${DeviceType}`

      const response = await axios.get(apiUrl, {
        headers: {
          authorization: `${userToken}`,
        },
      })

      // Sort by viewOn field (assuming it's a number; modify for strings)
      const sortedData = response.data.data.sort((a, b) => a.viewOn - b.viewOn)

      ;[
        'Core',
        'Cosmetics',
        'Display',
        'Accessories',
        'Functional',
        'Functional_major',
        'Functional_minor',
        'Warranty',
      ].forEach((group) => {
        const answersTemp = sortedData.filter(
          (question) => question.group === group
        )
        dispatch({ type: 'SET_GROUP_ANSWERS', group, answers: answersTemp })
        // Store raw questions data with options for DeviceReport
        store.dispatch(setRawQuestions({ group, questions: answersTemp }))
      })

      const newPopulateAnswers = sortedData.map((ele) => ele.default)

      if (answers.length === 0) {
        const newAnswers = newPopulateAnswers.map((answer, index) => {
          const questionData = sortedData[index]

          if (questionData.yes === answer && questionData.no === answer) {
            return {
              quetion: questionData.quetion,
              answer,
              key: 'no',
              group: questionData.group,
              selected: Array(questionData.options.length).fill(false),
            }
          } else if (questionData.yes === answer) {
            // Special handling for Accessories group - start unselected for iPad
            if (questionData.group === 'Accessories') {
              return {
                quetion: questionData.quetion,
                answer: questionData.no, // Set to 'no' value instead of 'yes'
                key: 'no',
                group: questionData.group,
                selected: Array(questionData.options.length).fill(false),
              }
            }

            // For Warranty group, check if it's "out of warranty" option
            if (questionData.group === 'Warranty') {
              // Find the "out of warranty" option and select only that one
              const outOfWarrantyIndex = questionData.options.findIndex(option =>
                option.caption.toLowerCase().includes('out of warranty')
              )

              const selected = Array(questionData.options.length).fill(false)
              if (outOfWarrantyIndex !== -1) {
                selected[outOfWarrantyIndex] = true
              }

              return {
                quetion: questionData.quetion,
                answer,
                key: 'yes',
                group: questionData.group,
                selected,
              }
            }

            // Default behavior for other groups
            return {
              quetion: questionData.quetion,
              answer,
              key: 'yes',
              group: questionData.group,
              selected: Array(questionData.options.length).fill(true),
            }
          } else {
            return {
              quetion: questionData.quetion,
              answer,
              group: questionData.group,
              key: 'no',
              selected: Array(questionData.options.length).fill(false),
            }
          }
        })

        setAnswers(newAnswers)
        setNewGroupAnswers(newAnswers)
        ;[
          'Core',
          'Cosmetics',
          'Display',
          'Accessories',
          'Functional',
          'Functional_major',
          'Functional_minor',
          'Warranty',
        ].forEach((group) => {
          const answersTemp = newAnswers.filter(
            (question) => question.group === group
          )
          store.dispatch(setGroupAnswers({ group, answers: answersTemp }))
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [visible])

  const updateAns = (group) => {
    const filteredAnswers = newGroupanswers.filter(
      (question) => question.group === group
    )
    store.dispatch(setGroupAnswers({ group, filteredAnswers }))
    if (showPopup === false) {
      setVisible(visible + 1)
    }
  }

  const parts = [
    { component: FirstPart, data: NDstate.Core, slice: core },
    { component: SixthPart, data: NDstate.Functional, slice: Functional },
    { component: SecondPart, data: NDstate.Cosmetics, slice: Cosmetics },
    { component: ThirdPart, data: NDstate.Display, slice: Display },
    {
      component: FourthPart,
      data: NDstate.Functional_major,
      slice: FunctionalMajor,
    },
    {
      component: FifthPart,
      data: NDstate.Functional_minor,
      slice: FunctionalMinor,
    },
    { component: SeventhPart, data: NDstate.Accessories, slice: Accessories },
    { component: EighthPart, data: NDstate.Warranty, slice: Warranty },
  ]

  const availableParts = parts.filter(
    (part) => part.data && part.data.length > 0
  )

  return (
    <>
      <div className={`popup ${showPopup ? 'show' : ''}`}>
        <img className='object-contain' src={banner} alt='banner' />
        <div className='text'>
          Help us calculate your device value correctly by answering to the
          following questions
        </div>
        <button onClick={() => setShowPopup(false)}> Got it</button>
      </div>
      <MainQContainer
        NDstate={NDstate}
        setIsSearchOpen={setIsSearchOpen}
        isSearchOpen={isSearchOpen}
        dispatch={dispatch}
        visible={visible}
        availableParts={availableParts}
        setVisible={setVisible}
        updateAns={updateAns}
        showPopup={showPopup}
        qna={qna}
        profile={profile}
        styless={styless}
      />
    </>
  )
}
export default NewDeviceqs
