import axios from 'axios'

import {
  BASE_URL,
  service,
  Category,
  AddSubService,
  updateService,
  deleteService,
  MainAdmin_URL,
  // subService_URL,
  subservice,
  getadminSubServicesbyserviceId,
  getService_ByClinicId,
  getservice,
  getPackage,
  addPackage,
  updatePackage,
  deletePackage,
} from '../../../baseUrl'
import { toast } from 'react-toastify'
import { http } from '../../../Utils/Interceptors'
import { showCustomToast } from '../../../Utils/Toaster'

export const getpackagePricingByClinicId = async (clinicId) => {
  try {
    const res = await axios.get(`${BASE_URL}/${getPackage}/clinic/${clinicId}`)
    return res.data
  } catch (err) {
    console.error('API Error:', err)
    throw err
  }
}

export const addPackageData = async (packageData) => {
  try {
    console.log('Sending data to API:', packageData)

    const response = await http.post(`/${addPackage}`, packageData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response
  } catch (error) {
    console.error('Error response:', error.response)
    showCustomToast(`${error.response.data.message || error.response.statusText}`, 'error')
  }
}

export const updatePackageData = async (packageId, hospitalId, packageData) => {
  console.log('API Call Params:', packageId, hospitalId) //Check values
  console.log('Payload:', packageData)

  try {
    const response = await http.put(
      `/${updatePackage}/${packageId}/clinic/${hospitalId}`, //use 'id' here
      packageData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('Service updated successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating service:', error)
    throw error
  }
}

export const deletePackageData = async (packageId, id) => {
  try {
    console.log('Service name:', packageId)
    const response = await http.delete(`/${deletePackage}/${packageId}/clinic/${id}`)

    console.log('Service deleted successfully:', response.data)
    return response.data
  } catch (error) {
    throw error
  }
}
