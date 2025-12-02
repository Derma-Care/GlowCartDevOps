import axios from 'axios'

import { ClinicBase_urls, PROCEDURE_GET_ALL_URL } from '../../baseUrl'

export const getAllProcedures = async () => {
  try {
    const response = await axios.get(`${PROCEDURE_GET_ALL_URL}`)

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
    const res = await axios.get(`${ClinicBase_urls}/procedure-pricing/all/${clinicId}`)
    return res.data
  } catch (err) {
    console.error('API Error:', err)
    throw err
  }
}
