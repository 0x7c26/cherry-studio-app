import { MotiView } from 'moti'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Assistant } from '@/types/assistant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import YStack from '@/componentsV2/layout/YStack'
import TextField from '@/componentsV2/base/TextField'

interface PromptTabContentProps {
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => void
}

export function PromptTabContent({ assistant, updateAssistant }: PromptTabContentProps) {
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    name: assistant?.name || '',
    prompt: assistant?.prompt || ''
  })

  useEffect(() => {
    setFormData({
      name: assistant?.name || '',
      prompt: assistant?.prompt || ''
    })
  }, [assistant])

  const handleBlur = () => {
    if (formData.name !== assistant.name || formData.prompt !== assistant.prompt) {
      updateAssistant({
        ...assistant,
        name: formData.name,
        prompt: formData.prompt
      })
    }
  }

  return (
    <MotiView
      style={{ flex: 1 }}
      from={{ opacity: 0, translateY: 10 }}
      animate={{
        translateY: 0,
        opacity: 1
      }}
      exit={{ opacity: 1, translateY: -10 }}
      transition={{
        type: 'timing'
      }}>
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <YStack className="flex-1 gap-4">
          <TextField className="gap-2">
            <TextField.Label className="text-sm font-medium text-text-secondary dark:text-text-secondary">
              {t('common.name')}
            </TextField.Label>
            <TextField.Input
              className="h-12 rounded-lg bg-ui-card-background dark:bg-ui-card-background-dark px-3 py-3 text-sm"
              placeholder={t('assistants.name')}
              value={formData.name}
              onChangeText={name => setFormData(prev => ({ ...prev, name }))}
              onBlur={handleBlur}
            />
          </TextField>

          <TextField className="gap-2 flex-1">
            <TextField.Label className="text-sm font-medium text-text-secondary dark:text-text-secondary">
              {t('common.prompt')}
            </TextField.Label>
            <TextField.Input
              className="h-auto min-h-60 rounded-lg bg-ui-card-background dark:bg-ui-card-background-dark px-3  text-sm pb-safe"
              placeholder={t('common.prompt')}
              multiline
              numberOfLines={20}
              textAlignVertical="top"
              value={formData.prompt}
              onChangeText={prompt => setFormData(prev => ({ ...prev, prompt }))}
              onBlur={handleBlur}
            />
          </TextField>
        </YStack>
      </KeyboardAwareScrollView>
    </MotiView>
  )
}
