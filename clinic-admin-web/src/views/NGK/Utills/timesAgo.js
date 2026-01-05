/* eslint-disable prettier/prettier */
export const timeAgo = (dateString) => {
  if (!dateString) return ''
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffSeconds = Math.floor(diffMs / 1000)
  // 🔮 Future date
  if (diffSeconds < 0) {
    const futureSeconds = Math.abs(diffSeconds)

    const days = Math.floor(futureSeconds / 86400)
    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`

    const hours = Math.floor(futureSeconds / 3600)
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`

    return 'Soon'
  }

  if (diffSeconds < 60) return 'Just now'

  const minutes = Math.floor(diffSeconds / 60)
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`

  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`

  const years = Math.floor(days / 365)
  return `${years} year${years > 1 ? 's' : ''} ago`
}
