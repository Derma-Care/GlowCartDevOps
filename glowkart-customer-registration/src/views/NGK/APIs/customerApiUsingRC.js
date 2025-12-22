import axios from 'axios'

import { rgCodes, wifiUrl } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

export async function getCustomerByCode(code) {
  try {
    const response = await axios.get(`${rgCodes}/${code}`)
    return response.data
  } catch (err) {
    console.error('GET Customer Error:', err)
    return { success: false, message: 'Failed to get customer' }
  }
}
