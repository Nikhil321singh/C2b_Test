// Warranty uplift configuration
export const WARRANTY_UPLIFTS = {
  '0_3_months': 0.08,    // 8%
  '3_6_months': 0.03,    // 3%
  '6_11_months': 0.01,   // 1% (configurable)
  'above_11_months': 0.005, // 0.5% (configurable)
  'out_of_warranty': 0
}

// Accessories deduction configuration
export const ACCESSORIES_DEDUCTIONS = {
  mobile: {
    thresholds: {
      tierA: 30000, // Below 30k
      tierB: 30000  // 30k and above
    },
    deductions: {
      // [box_missing, cable_missing] -> deduction amount
      tierA: {
        'present_present': 0,
        'missing_present': 350,
        'present_missing': 350, 
        'missing_missing': 700
      },
      tierB: {
        'present_present': 0,
        'missing_present': 500,
        'present_missing': 500,
        'missing_missing': 1000
      }
    }
  },
  ipad: {
    threshold: 10000, // Rs. 10,000
    deductions: {
      'present_present': 0,
      'missing_present': 500,
      'present_missing': 500,
      'missing_missing': 1000
    }
  },
  watch: {
    threshold: 5000, // Rs. 5,000
    deductions: {
      // One missing (any of Box/Cable/Strap)
      'one_missing': 500,
      // Two missing (any pair)
      'two_missing': 1000, 
      // All three missing
      'all_missing': 1500,
      // All present
      'all_present': 0
    }
  }
}

/**
 * Calculate warranty uplift amount
 * @param {number} basePrice - Base price of the device
 * @param {string} warrantyRange - Warranty range key (0_3_months, 3_6_months, etc.)
 * @returns {number} Uplift amount
 */
export const calculateWarrantyUplift = (basePrice, warrantyRange) => {
  const upliftPercentage = WARRANTY_UPLIFTS[warrantyRange] || 0
  return basePrice * upliftPercentage
}

/**
 * Calculate accessories deduction for mobile devices
 * @param {number} basePrice - Base price of the device
 * @param {boolean} boxMissing - Is box missing
 * @param {boolean} cableMissing - Is cable missing
 * @returns {number} Deduction amount
 */
export const calculateMobileAccessoriesDeduction = (basePrice, boxMissing, cableMissing) => {
  const config = ACCESSORIES_DEDUCTIONS.mobile
  const tier = basePrice >= config.thresholds.tierB ? 'tierB' : 'tierA'
  
  let deductionKey
  if (!boxMissing && !cableMissing) {
    deductionKey = 'present_present'
  } else if (boxMissing && !cableMissing) {
    deductionKey = 'missing_present'
  } else if (!boxMissing && cableMissing) {
    deductionKey = 'present_missing'
  } else {
    deductionKey = 'missing_missing'
  }
  
  return config.deductions[tier][deductionKey]
}

/**
 * Calculate accessories deduction for iPad devices
 * @param {number} basePrice - Base price of the device
 * @param {boolean} boxMissing - Is box missing
 * @param {boolean} cableMissing - Is cable missing
 * @returns {number} Deduction amount
 */
export const calculateIPadAccessoriesDeduction = (basePrice, boxMissing, cableMissing) => {
  const config = ACCESSORIES_DEDUCTIONS.ipad
  
  // If price is below threshold, no deduction
  if (basePrice < config.threshold) {
    return 0
  }
  
  let deductionKey
  if (!boxMissing && !cableMissing) {
    deductionKey = 'present_present'
  } else if (boxMissing && !cableMissing) {
    deductionKey = 'missing_present'
  } else if (!boxMissing && cableMissing) {
    deductionKey = 'present_missing'
  } else {
    deductionKey = 'missing_missing'
  }
  
  return config.deductions[deductionKey]
}

/**
 * Calculate accessories deduction for Watch devices
 * @param {number} basePrice - Base price of the device
 * @param {boolean} boxMissing - Is box missing
 * @param {boolean} cableMissing - Is cable/charger missing
 * @param {boolean} strapMissing - Is strap missing
 * @returns {number} Deduction amount
 */
export const calculateWatchAccessoriesDeduction = (basePrice, boxMissing, cableMissing, strapMissing) => {
  const config = ACCESSORIES_DEDUCTIONS.watch
  
  // If price is below threshold, no deduction
  if (basePrice <= config.threshold) {
    return 0
  }
  
  const missingCount = [boxMissing, cableMissing, strapMissing].filter(Boolean).length
  
  if (missingCount === 0) {
    return config.deductions.all_present
  } else if (missingCount === 1) {
    return config.deductions.one_missing
  } else if (missingCount === 2) {
    return config.deductions.two_missing
  } else {
    return config.deductions.all_missing
  }
}

/**
 * Calculate total final price with all adjustments
 * @param {number} basePrice - Base price of the device
 * @param {string} deviceType - Device type (mobile, ipad, watch)
 * @param {string} warrantyRange - Warranty range
 * @param {Object} accessories - Accessories availability
 * @returns {Object} Price breakdown
 */
export const calculateFinalPrice = (basePrice, deviceType, warrantyRange, accessories) => {
  console.log('calculateFinalPrice inputs:', { basePrice, deviceType, warrantyRange, accessories })
  
  const warrantyUplift = calculateWarrantyUplift(basePrice, warrantyRange)
  console.log('Warranty uplift calculated:', warrantyUplift)
  
  let accessoriesDeduction = 0
  
  switch (deviceType.toLowerCase()) {
    case 'mobile':
    case 'phone':
      accessoriesDeduction = calculateMobileAccessoriesDeduction(
        basePrice,
        accessories.boxMissing,
        accessories.cableMissing
      )
      break
    case 'ipad':
    case 'tablet':
      accessoriesDeduction = calculateIPadAccessoriesDeduction(
        basePrice,
        accessories.boxMissing,
        accessories.cableMissing
      )
      break
    case 'watch':
      accessoriesDeduction = calculateWatchAccessoriesDeduction(
        basePrice,
        accessories.boxMissing,
        accessories.cableMissing,
        accessories.strapMissing
      )
      break
  }
  
  console.log('Accessories deduction calculated:', accessoriesDeduction)
  
  const priceAfterWarranty = basePrice + warrantyUplift
  const finalPrice = priceAfterWarranty - accessoriesDeduction
  
  const result = {
    basePrice,
    warrantyUplift,
    accessoriesDeduction,
    priceAfterWarranty,
    finalPrice: Math.max(finalPrice, 0) // Ensure price doesn't go negative
  }
  
  console.log('Final price calculation result:', result)
  return result
}

/**
 * Get device type from category or session storage
 * @returns {string} Device type
 */
export const getDeviceType = () => {
  const deviceType = sessionStorage.getItem('DeviceType')
  if (deviceType === 'CTG1') return 'mobile'
  if (deviceType === 'CTG2') return 'ipad'  
  if (deviceType === 'CTG3') return 'watch'
  return 'mobile' // default
}

/**
 * Check if bill is available from accessories data
 * @param {Array} accessoriesData - Accessories data from QNA
 * @returns {boolean} Is bill available
 */
export const isBillAvailable = (accessoriesData) => {
  const billItem = accessoriesData?.find(item => 
    item.quetion && item.quetion.toLowerCase().includes('bill')
  )
  return billItem ? billItem.key === 'no' : false
}