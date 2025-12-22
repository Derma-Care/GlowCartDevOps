import { wifiUrl } from '../../../baseUrl'

export const registerCustomer = async (formData) => {
  try {
    const response = await fetch(`${wifiUrl}/api/customer/step1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    return await response.json()
  } catch (err) {
    console.error('Register API Error:', err)
    return { success: false, message: 'Server error' }
  }
}
