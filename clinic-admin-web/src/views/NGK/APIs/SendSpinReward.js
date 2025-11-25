import { wifiUrl } from "../../../baseUrl"

export async function sendSpinReward(mobile, reward) {
  try {
    const response = await fetch(`${wifiUrl}/api/customer/${mobile}/spin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reward),
    })

    const data = await response.json()
    console.log('Spin reward response:', data)

    return data
  } catch (error) {
    console.error('Error sending spin reward:', error)
    return { success: false, message: 'Spin reward failed' }
  }
}
