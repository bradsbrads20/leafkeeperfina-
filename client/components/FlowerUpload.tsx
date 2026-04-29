import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function FlowerUpload() {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)

  // The upload function from your example
  async function uploadFlowerImage(file) {
    const fileName = `${Date.now()}_${file.name}`
    
    const { data, error } = await supabase.storage
      .from('flower-images')
      .upload(fileName, file)
    
    if (error) {
      console.error('Upload failed:', error)
      throw error
    }
    
    const { data: urlData } = supabase.storage
      .from('flower-images')
      .getPublicUrl(fileName)
    
    return urlData.publicUrl
  }

  // Handle file selection
  async function handleFileChange(event) {
    const file = event.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const url = await uploadFlowerImage(file)
      setImageUrl(url)
      console.log('Uploaded to:', url)
    } catch (error) {
      alert('Upload failed!')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {imageUrl && (
        <img src={imageUrl} alt="Uploaded flower" />
      )}
    </div>
  )
}