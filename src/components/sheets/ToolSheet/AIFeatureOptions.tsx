import { Check, Globe, Palette } from '@tamagui/lucide-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Text, XStack, YStack } from 'tamagui'

import { isGenerateImageModel, isWebSearchModel } from '@/config/models'
import { Assistant } from '@/types/assistant'

interface AIFeatureOption {
  key: string
  label: string
  icon: React.ReactNode
  onPress: () => void
  shouldShow: boolean
  getTextColor: () => string
  getTrailingIcon: () => React.ReactNode | null
}

interface AIFeatureOptionsProps {
  assistant: Assistant
  onWebSearchToggle: () => void
  onGenerateImageToggle: () => void
}

export const AIFeatureOptions: React.FC<AIFeatureOptionsProps> = ({
  assistant,
  onWebSearchToggle,
  onGenerateImageToggle
}) => {
  const { t } = useTranslation()

  const options: AIFeatureOption[] = [
    {
      key: 'webSearch',
      label: t('common.websearch'),
      icon: <Globe size={18} color={assistant.enableWebSearch ? '$green100' : '$textPrimary'} />,
      onPress: onWebSearchToggle,
      shouldShow: assistant.model ? isWebSearchModel(assistant.model) || !!assistant.webSearchProviderId : false,
      getTextColor: () => (assistant.enableWebSearch ? '$green100' : '$textPrimary'),
      getTrailingIcon: () => (assistant.enableWebSearch ? <Check size={18} color="$green100" /> : null)
    },
    {
      key: 'generateImage',
      label: t('common.generateImage'),
      icon: <Palette size={18} color={assistant.enableGenerateImage ? '$green100' : '$textPrimary'} />,
      onPress: onGenerateImageToggle,
      shouldShow: assistant.model ? isGenerateImageModel(assistant.model) : false,
      getTextColor: () => (assistant.enableGenerateImage ? '$green100' : '$textPrimary'),
      getTrailingIcon: () => (assistant.enableGenerateImage ? <Check size={18} color="$green100" /> : null)
    }
  ]

  const filteredOptions = options.filter(option => option.shouldShow)

  if (filteredOptions.length === 0) {
    return null
  }

  return (
    <YStack paddingHorizontal={20}>
      {filteredOptions.map(option => (
        <Button
          padding={0}
          key={option.key}
          chromeless
          onPress={option.onPress}
          justifyContent="flex-start"
          alignItems="center"
          flex={1}>
          <XStack gap={8} alignItems="center" flex={1} justifyContent="space-between">
            <XStack gap={8} alignItems="center">
              {option.icon}
              <Text color={option.getTextColor()} fontSize={18} textAlign="center">
                {option.label}
              </Text>
            </XStack>
            {option.getTrailingIcon()}
          </XStack>
        </Button>
      ))}
    </YStack>
  )
}
