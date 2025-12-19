import { wifiUrl } from '../../../baseUrl'

export const verifyRegistrationCode = async (code) => {
  try {
    const response = await fetch(`${wifiUrl}/api/customer/registration/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    return { success: false, message: 'Server error. Try again later.' }
  }
}
