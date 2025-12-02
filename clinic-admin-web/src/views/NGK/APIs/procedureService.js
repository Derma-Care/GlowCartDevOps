import axios from 'axios'
import { BASE_URL, wifiUrl } from '../../../baseUrl'

export const getAllProcedures = async () => {
  try {
    const response = await axios.get(`${wifiUrl}/procedures/all`)

    if (response.data?.success) {
      return response.data.data // returns array of procedures
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching procedures:', error)
    return []
  }
}

export const getProcedurePricingByClinicId = async (clinicId) => {
  try {
    const res = await axios.get(`${BASE_URL}/procedure-pricing/all/${clinicId}`)
    return res.data
  } catch (err) {
    console.error('API Error:', err)
    throw err
  }
}
