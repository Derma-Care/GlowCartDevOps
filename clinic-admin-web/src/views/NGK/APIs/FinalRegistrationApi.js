import axios from 'axios'
import { Booking_sevice, wifiUrl } from '../../../baseUrl'

export const updateStep2 = async (mobile, payload) => {
  try {
    const response = await axios.post(`${wifiUrl}/api/customer/${mobile}/complete`, payload)
    // console.log(addresresponse)
    return response.data
  } catch (error) {
    console.error('Step2 Update Error:', error)
    console.log(error.response.data.data.address)
    return { success: false, message: error.response.data.data.address }
  }
}
