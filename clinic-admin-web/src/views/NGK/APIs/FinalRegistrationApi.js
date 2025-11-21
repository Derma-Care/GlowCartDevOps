import axios from 'axios'
import { Booking_sevice, wifiUrl } from '../../../baseUrl'

export const updateStep2 = async (mobile, payload) => {
  try {
    const response = await axios.put(`${Booking_sevice}/customer/${mobile}/step2`, payload)
    return response.data
  } catch (error) {
    console.error('Step2 Update Error:', error)
    return { success: false, message: error.message }
  }
}
