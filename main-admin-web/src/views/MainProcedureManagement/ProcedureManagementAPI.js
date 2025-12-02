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
  getSubService,
  BASE_URL_API,
  ClinicBase_urls,
} from '../../baseUrl'


import { showCustomToast } from '../../Utils/Toaster'

export const subServiceData = async (serviceId) => {
  console.log('Serviceid response:', serviceId)
  try {
    // const response = await axios.get(`${BASE_URL}/serviceId/${serviceId}`)
    const response = await axios.get(
      `${BASE_URL}/${getadminSubServicesbyserviceId}/${serviceId}`, //TODO:chnage when apigetway call axios to axios
    )

    console.log('Service response:', response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Service response:', error.response.data) // Log structured response instead of treating it as an error
      return error.response.data // Return response instead of throwing an error
    } else {
      console.error('Unexpected error:', error.message || error)
      throw error
    }
  }
}
export const serviceDataH = async () => {
  console.log('Serviceid response:')
  try {
    const response = await axios.get(`${BASE_URL}/${service}`)

    console.log('Service response:', response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Service response:', error.response.data) // Log structured response instead of treating it as an error
      return error.response.data // Return response instead of throwing an error
    } else {
      console.error('Unexpected error:', error.message || error)
      throw error
    }
  }
}

export const serviceData = async (id) => {
  console.log(id)
  try {
    const response = await axios.get(`${BASE_URL}/${getservice}/${id}`)
    console.log('Service response:', response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No services found for this category.')
      return error.response.data
    } else {
      console.error('Unexpected error fetching services:', error.message || error)
      throw error
    }
  }
}

export const getSubServiceById = async (hospitalId, subServiceId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${getSubService}/${hospitalId}/${subServiceId}`)
    return response.data?.data // return only the useful data part
  } catch (error) {
    console.error('Error fetching sub-service data:', error)
    return null
  }
}


export const CategoryData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${Category}`)

    return response.data
  } catch (error) {
    console.error('Error fetching service data:', error.message)

    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }

    throw error
  }
}

export const postServiceData = async (serviceData) => {
  try {
    console.log('Sending data to API:', serviceData)

    const response = await axios.post(`${ClinicBase_urls}/${AddSubService}`, serviceData, {
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

export const updateServiceData = async (subServiceId, hospitalId, serviceData) => {
  console.log('API Call Params:', subServiceId, hospitalId) //Check values
  console.log('Payload:', serviceData)

  try {
    const response = await axios.put(
      `${ClinicBase_urls}/${updateService}/${subServiceId}/${hospitalId}`, //use 'id' here
      serviceData,
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

export const deleteServiceData = async (serviceId, id) => {
  try {
    console.log('Service name:', serviceId)
    const response = await axios.delete(`${ClinicBase_urls}/${deleteService}/${serviceId}/${id}`)

    console.log('Service deleted successfully:', response.data)
    return response.data
  } catch (error) {
    throw error
  }
}
