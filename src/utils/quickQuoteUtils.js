export const reducer = (state, action) => {
  if (action.type === 'SET_GROUP_ANSWERS') {
    return { ...state, [action.group]: action.answers }
  }
  throw new Error()
}

export const logQuickQuoteAttempt = async (quoteResult, deviceModel, token) => {
  if (!token || !quoteResult?.id || !deviceModel?.models?._id) {
    console.error('❌ Cannot log quote: Missing critical data.')
    return
  }

  const logPayload = {
    quoteType: 'QuickQuote',
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
      {
        headers: {
          Authorization: token,
        },
      }
    )
  } catch (error) {
    console.error('Error logging quick quote attempt:', error)
  }
}
