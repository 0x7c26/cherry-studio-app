import { CircleX } from '@tamagui/lucide-icons'
import { FC, useState } from 'react'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import ImageView from 'react-native-image-viewing'
import { Image, useWindowDimensions, View } from 'tamagui'

import { FileMetadata } from '@/types/file'

interface ImageItemProps {
  file: FileMetadata
  allImages?: FileMetadata[]
  onRemove?: (file: FileMetadata) => void
  size?: number
}

const ImageItem: FC<ImageItemProps> = ({ file, allImages = [], onRemove, size }) => {
  const [visible, setIsVisible] = useState(false)
  const imagesForViewer = allImages.length > 0 ? allImages : [file]
  const imageIndex = imagesForViewer.findIndex(img => img.path === file.path)
  const { width: screenWidth } = useWindowDimensions()
  // Default size is 30% of the screen width, (32 is the padding on both sides)
  const imageWidth = size ? size : (screenWidth - 32) * 0.3

  const handleRemove = e => {
    e.stopPropagation()
    onRemove?.(file)
  }

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <Image source={{ uri: file.path, width: imageWidth, height: imageWidth }} style={{ borderRadius: 8 }} />
      </TouchableOpacity>
      <ImageView
        images={imagesForViewer.map(f => ({ uri: f.path }))}
        imageIndex={imageIndex >= 0 ? imageIndex : 0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        presentationStyle="fullScreen"
        animationType="slide"
      />
      {onRemove && (
        <TouchableOpacity
          onPress={handleRemove}
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            borderRadius: 99
          }}>
          <CircleX size={20} color="$backgroundPrimary" borderRadius={99} backgroundColor="$gray60" />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default ImageItem
