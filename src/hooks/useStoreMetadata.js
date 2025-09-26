import { useState } from 'react'
import axios from 'axios'

export const useStoreMetadata = (token) => {
  const [storeData, setStoreData] = useState([])
  const [regionalData, setRegionalData] = useState([])
  const [entireStore, setEntireStore] = useState([])
  const [allUser, setAllUser] = useState([])
  const [categories, setCategories] = useState([])

  const getStore = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/store/findAll?page=0&limit=9999`,
        { headers: { Authorization: token } }
      )
      const allData = res.data.result || []
      setEntireStore(allData)
      setStoreData(allData.map((s) => s.storeName))
      setRegionalData([...new Set(allData.map((s) => s.region))])
    } catch (err) {
      console.error('Failed to fetch store data:', err)
    }
  }

  const getAllUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/user/find`,
        { headers: { Authorization: token } }
      )
      setAllUser(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const getCategories = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/category/findAll`,
        { headers: { Authorization: token } }
      )
      setCategories(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  return {
    storeData,
    regionalData,
    entireStore,
    allUser,
    categories,
    getStore,
    getAllUser,
    getCategories,
    setStoreData,
  }
}
