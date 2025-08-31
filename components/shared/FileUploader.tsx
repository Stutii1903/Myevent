'use client'

import { useCallback, Dispatch, SetStateAction } from 'react'
import { useDropzone } from '@uploadthing/react'
import { generateClientDropzoneAccept } from 'uploadthing/client'

import { Button } from '@/components/ui/button'
import { convertFileToUrl } from '@/lib/utils'

type FileUploaderProps = {
  onFieldChange: (url: string) => void
  imageUrl: string
  setFiles: Dispatch<SetStateAction<File[]>>
}

export function FileUploader({ imageUrl, onFieldChange, setFiles }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    try {
      console.log('FileUploader: Files dropped:', acceptedFiles);
      
      if (acceptedFiles.length === 0) {
        console.log('No files accepted');
        return;
      }

      const file = acceptedFiles[0];
      
      // Validate file size (8MB limit)
      const maxSize = 8 * 1024 * 1024; // 8MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 8MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      console.log('FileUploader: Setting files and updating field');
      setFiles(acceptedFiles);
      onFieldChange(convertFileToUrl(file));
    } catch (error) {
      console.error('FileUploader: Error in onDrop:', error);
      alert('Error processing file. Please try again.');
    }
  }, [setFiles, onFieldChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(['image/*']),
    maxFiles: 1,
    maxSize: 8 * 1024 * 1024, // 8MB
  })

  return (
    <div
      {...getRootProps()}
      className={`flex-center bg-dark-3 flex h-72 cursor-pointer flex-col overflow-hidden rounded-xl bg-grey-50 ${
        isDragActive ? 'border-2 border-dashed border-primary-500' : ''
      }`}>
      <input {...getInputProps()} className="cursor-pointer" />

      {imageUrl ? (
        <div className="flex h-full w-full flex-1 justify-center ">
          <img
            src={imageUrl}
            alt="image"
            width={250}
            height={250}
            className="w-full object-cover object-center"
          />
        </div>
      ) : (
        <div className="flex-center flex-col py-5 text-grey-500">
          <img src="/upload.svg" width={77} height={77} alt="file upload" />
          <h3 className="mb-2 mt-2">
            {isDragActive ? 'Drop the image here' : 'Drag photo here'}
          </h3>
          <p className="p-medium-12 mb-4">SVG, PNG, JPG (Max 8MB)</p>
          <Button type="button" className="rounded-full">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  )
}