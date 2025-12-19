import axios from 'axios'
import { BASE_URL, getAllProceduresNames, getProcedures, wifiUrl } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

export const getAllProcedures = async () => {
  try {
    const response = await axios.get(`${wifiUrl}/${getAllProceduresNames}`)

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
    const res = await http.get(`/${getProcedures}/${clinicId}`)
    return res.data
  } catch (err) {
    console.error('API Error:', err)
    throw err
  }
}
