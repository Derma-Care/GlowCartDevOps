import axios from 'axios'
import { Booking_sevice, Customer_URL, wifiUrl } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

export const updateStep2 = async (mobile, payload) => {
  try {
    const response = await axios.post(`${Customer_URL}/${mobile}/complete`, payload)
    // console.log(addresresponse)
    return response.data
  } catch (error) {
    console.error('Step2 Update Error:', error)
    console.log(error.response.data.data.address)
    return { success: false, message: error.response.data.data.address }
  }
}
