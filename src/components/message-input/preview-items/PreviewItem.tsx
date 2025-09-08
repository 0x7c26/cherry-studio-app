import { FC } from 'react'
import React from 'react'
import { View } from 'tamagui'

import { FileMetadata, FileTypes } from '@/types/file'

import FileItem from './FileItem'
import ImageItem from './ImageItem'

interface PreviewItemProps {
  file: FileMetadata
  files: FileMetadata[]
  setFiles: (files: FileMetadata[]) => void
}

const PreviewItem: FC<PreviewItemProps> = ({ file, files, setFiles }) => {
  const handleRemove = () => {
    setFiles(files.filter(f => f.path !== file.path))
  }

  const isImage = file.type === FileTypes.IMAGE

  return (
    <View style={{ marginRight: 8, marginTop: 8 }}>
      {isImage ? (
        <ImageItem
          file={file}
          allImages={files.filter(f => f.type === FileTypes.IMAGE)}
          onRemove={handleRemove}
          size={56}
        />
      ) : (
        <FileItem file={file} onRemove={handleRemove} />
      )}
    </View>
  )
}

export default PreviewItem
