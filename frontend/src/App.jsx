import React from 'react'
import { Toaster } from 'react-hot-toast';
import ImageUploader from './pages/ImageUploader'


function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <ImageUploader />
    </>
  )
}

export default App
