/**
 * Compresses an image file before upload
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    maxSizeMB = 1
  } = options

  // If file is not an image, return as is
  if (!file.type.startsWith('image/')) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'))
              return
            }

            // Check if compressed size is acceptable
            const compressedSizeMB = blob.size / (1024 * 1024)

            // If still too large, reduce quality further
            if (compressedSizeMB > maxSizeMB && quality > 0.5) {
              const newQuality = quality - 0.1
              compressImage(file, { ...options, quality: newQuality })
                .then(resolve)
                .catch(reject)
              return
            }

            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })

            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('Image loading failed'))
      }

      img.src = e.target.result
    }

    reader.onerror = () => {
      reject(new Error('File reading failed'))
    }

    reader.readAsDataURL(file)
  })
}
