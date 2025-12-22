// fileUtils.js

import { PDFDocument } from 'pdf-lib'
import { showCustomToast } from '../../../Utils/Toaster'

// Convert File → Base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Compress Images to <= 500KB
export const compressImage = async (file) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = function () {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const scale = 0.7 // reduce quality
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      let quality = 0.7
      let base64 = canvas.toDataURL('image/jpeg', quality)

      // Reduce until size < 500KB
      while (base64.length / 1.33 > 500 * 1024 && quality > 0.2) {
        quality -= 0.1
        base64 = canvas.toDataURL('image/jpeg', quality)
      }

      resolve(base64)
    }

    const reader = new FileReader()
    reader.onload = () => (img.src = reader.result)
    reader.readAsDataURL(file)
  })
}

// Compress PDF to <= 500KB
export const compressPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

  // Save again → usually compresses
  let compressedBytes = await pdfDoc.save({ useObjectStreams: false })
  let blob = new Blob([compressedBytes], { type: 'application/pdf' })

  // If still larger than 500 KB → second pass
  if (blob.size > 500 * 1024) {
    const pdfDoc2 = await PDFDocument.load(await blob.arrayBuffer())
    compressedBytes = await pdfDoc2.save({ useObjectStreams: true })
    blob = new Blob([compressedBytes], { type: 'application/pdf' })
  }

  const reader = new FileReader()
  return await new Promise((resolve) => {
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

// Main function: Validate + Compress + Return Base64
export const processFile = async (file) => {
  const MAX_UPLOAD_SIZE = 15 * 1024 * 1024 // 5MB
  const MAX_FINAL = 500 * 1024 // 500KB

  if (!file) return null

  // Reject if above 1 MB
  if (file.size > MAX_UPLOAD_SIZE) {
    showCustomToast('File too large! Use an image below 15MB.', 'warning')
    // throw new Error('Too big')
  }

  // If <= 500 KB → return as is
  if (file.size <= MAX_FINAL) {
    return await fileToBase64(file)
  }

  // compress to <= 500KB
  if (file.type.startsWith('image/')) {
    return await compressImage(file)
  } else if (file.type === 'application/pdf') {
    return await compressPDF(file)
  }

  throw new Error('Unsupported file format.')
}
