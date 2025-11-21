import { wifiUrl } from '../../../baseUrl'

// getWheelSlices.js
export const getWheelSlices = async () => {
  try {
    const response = await fetch(`${wifiUrl}/api/customer/wheel-slices`)

    if (!response.ok) {
      throw new Error('Failed to fetch wheel slices')
    }

    const result = await response.json()
    return result // { success, message, data }
  } catch (error) {
    console.error('Wheel Slice API Error:', error)
    return { success: false, data: [] }
  }
}
