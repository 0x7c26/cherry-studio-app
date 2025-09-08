import { CircleX } from '@tamagui/lucide-icons'
import { FC } from 'react'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import FileViewer from 'react-native-file-viewer'
import { Stack, Text, View, XStack, YStack } from 'tamagui'

import { FileIcon } from '@/components/icons/FileIcon'
import { loggerService } from '@/services/LoggerService'
import { FileMetadata } from '@/types/file'
import { formatFileSize } from '@/utils/file'
const logger = loggerService.withContext('File Item')

interface FileItemProps {
  file: FileMetadata
  onRemove?: (file: FileMetadata) => void
  width?: number
  height?: number
}

const FileItem: FC<FileItemProps> = ({ file, onRemove }) => {
  const handlePreview = () => {
    FileViewer.open(file.path, { displayName: file.name }).catch(error => {
      logger.error('Handle Preview Error', error)
    })
  }

  const handleRemove = e => {
    e.stopPropagation()
    onRemove?.(file)
  }

  return (
    <View>
      <TouchableOpacity onPress={handlePreview}>
        <View>
          <XStack
            gap={12}
            width="auto"
            // height={height}
            borderRadius={8}
            backgroundColor="$green20"
            justifyContent="center"
            alignItems="flex-start"
            paddingVertical={8}
            paddingHorizontal={12}>
            <Stack
              width={40}
              height={40}
              gap={10}
              borderRadius={99}
              backgroundColor="$green100"
              alignItems="center"
              justifyContent="center">
              <FileIcon size={24} />
            </Stack>
            <YStack justifyContent="center" gap={2}>
              <Text fontSize={16} lineHeight={20} numberOfLines={1} ellipsizeMode="middle">
                {file.name}
              </Text>
              <Text fontSize={12} lineHeight={16}>
                {formatFileSize(file.size)}
              </Text>
            </YStack>
          </XStack>
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
      </TouchableOpacity>
    </View>
  )
}

export default FileItem
