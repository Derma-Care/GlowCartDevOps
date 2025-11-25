import axios from 'axios'

import { wifiUrl } from '../../../baseUrl'

export async function getCustomerByCode(code) {
  try {
    const response = await axios.get(`${wifiUrl}/api/customer/code/${code}`)
    return response.data
  } catch (err) {
    console.error('GET Customer Error:', err)
    return { success: false, message: 'Failed to get customer' }
  }
}
