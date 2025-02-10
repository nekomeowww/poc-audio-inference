export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer)
        resolve(reader.result)
    }
    reader.onerror = () => reject(reader.error)
    reader.onabort = () => reject(new Error('Read aborted'))

    reader.readAsArrayBuffer(blob)
  })
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.onabort = () => reject(new Error('Read aborted'))

    reader.readAsDataURL(blob)
  })
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
}
