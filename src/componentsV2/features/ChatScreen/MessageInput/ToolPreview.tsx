import { ImpactFeedbackStyle } from 'expo-haptics'
import React from 'react'
import { View, Pressable } from 'react-native'

import { Globe, Palette, X } from '@/componentsV2/icons/LucideIcon'
import { loggerService } from '@/services/LoggerService'
import { Assistant } from '@/types/assistant'
import { haptic } from '@/utils/haptic'
import XStack from '@/componentsV2/layout/XStack'

const logger = loggerService.withContext('ToolPreview')

interface ToolPreviewProps {
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => Promise<void>
}

export const ToolPreview: React.FC<ToolPreviewProps> = ({ assistant, updateAssistant }) => {
  const handleDisableWebSearch = async () => {
    try {
      haptic(ImpactFeedbackStyle.Medium)
      updateAssistant({ ...assistant, enableWebSearch: !assistant.enableWebSearch })
    } catch (error) {
      logger.error('handleDisableWebSearch', error as Error)
    }
  }

  const handleDisableGenerateImage = async () => {
    try {
      haptic(ImpactFeedbackStyle.Medium)
      updateAssistant({ ...assistant, enableGenerateImage: !assistant.enableGenerateImage })
    } catch (error) {
      logger.error('handleDisableGenerateImage', error as Error)
    }
  }

  return (
    <View>
      <XStack className="gap-2">
        {assistant.model && assistant.enableGenerateImage && (
          <XStack className="gap-[5px] rounded-[48px] py-1 px-1 bg-green-10 dark:bg-green-dark-10 border-[0.5px] border-green-20 dark:border-green-dark-20 justify-between items-center">
            <Palette size={20} className="text-green-100 dark:text-green-dark-100" />
            <Pressable onPress={handleDisableGenerateImage}>
              <X size={20} className="text-green-100 dark:text-green-dark-100" />
            </Pressable>
          </XStack>
        )}
        {assistant.model && assistant.enableWebSearch && (
          <XStack className="gap-[5px] rounded-[48px] py-1 px-1 border-[0.5px] border-green-20 dark:border-green-dark-20 bg-green-10 dark:bg-green-dark-10 justify-between items-center">
            <Globe size={20} className="text-green-100 dark:text-green-dark-100" />
            <Pressable onPress={handleDisableWebSearch}>
              <X size={20} className="text-green-100 dark:text-green-dark-100" />
            </Pressable>
          </XStack>
        )}
      </XStack>
    </View>
  )
}
