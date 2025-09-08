import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { ChevronRight } from '@tamagui/lucide-icons'
import { MotiView } from 'moti'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Stack, Text, XStack } from 'tamagui'

import { SettingGroup, SettingRow } from '@/components/settings'
import { isReasoningModel } from '@/config/models'
import { Assistant, AssistantSettings, Model } from '@/types/assistant'

import ModelSheet from '../sheets/ModelSheet'
import { ReasoningSheet } from '../sheets/ReasoningSheet'
import { CustomSlider } from '../ui/CustomSlider'
import { CustomSwitch } from '../ui/Switch'

interface ModelTabContentProps {
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => Promise<void>
}

export function ModelTabContent({ assistant, updateAssistant }: ModelTabContentProps) {
  const { t } = useTranslation()
  const modelSheetRef = useRef<BottomSheetModal>(null)
  const reasoningSheetRef = useRef<BottomSheetModal>(null)
  const [model, setModel] = useState<Model[]>(assistant?.model ? [assistant.model] : [])
  const [maxTokensInput, setMaxTokensInput] = useState<string>(
    assistant.settings?.maxTokens ? assistant.settings.maxTokens.toString() : ''
  )
  const isReasoning = isReasoningModel(assistant?.model)

  useEffect(() => {
    updateAssistant({
      ...assistant,
      model: model[0]
    })
  }, [model])

  useEffect(() => {
    setMaxTokensInput(assistant.settings?.maxTokens ? assistant.settings.maxTokens.toString() : '')
  }, [assistant.settings?.maxTokens])

  const handleSettingsChange = (key: keyof AssistantSettings, value: any) => {
    updateAssistant({
      ...assistant,
      settings: {
        ...assistant.settings,
        [key]: value
      }
    })
  }

  const handleMaxTokensInputChange = (value: string) => {
    setMaxTokensInput(value)
  }

  const handleMaxTokensBlur = () => {
    if (maxTokensInput.trim() === '') {
      handleSettingsChange('maxTokens', undefined)
      return
    }

    const numValue = parseInt(maxTokensInput, 10)

    if (!isNaN(numValue) && numValue > 0) {
      handleSettingsChange('maxTokens', numValue)
    } else {
      // Reset to previous valid value if invalid
      setMaxTokensInput(settings.maxTokens ? settings.maxTokens.toString() : '')
    }
  }

  const handleModelPress = () => {
    modelSheetRef.current?.present()
  }

  const handleReasoningPress = () => {
    reasoningSheetRef.current?.present()
  }

  const settings = assistant.settings || {}

  return (
    <MotiView
      style={{ flex: 1, gap: 30 }}
      from={{ opacity: 0, translateY: 10 }}
      animate={{
        translateY: 0,
        opacity: 1
      }}
      exit={{ opacity: 1, translateY: -10 }}
      transition={{
        type: 'timing'
      }}>
      <Button
        chromeless
        height={30}
        paddingHorizontal={16}
        paddingVertical={23}
        iconAfter={<ChevronRight size={16} />}
        backgroundColor="$uiCardBackground"
        onPress={handleModelPress}>
        <XStack height={20} flex={1} alignItems="center" overflow="hidden" justifyContent="space-between">
          {model.length > 0 ? (
            <>
              <Text lineHeight={17} flexShrink={1} numberOfLines={1} ellipsizeMode="tail">
                {t(`provider.${model[0].provider}`)}
              </Text>
              <Text lineHeight={20} fontSize={12} flexShrink={0} numberOfLines={1} maxWidth="60%" ellipsizeMode="tail">
                {model[0].name}
              </Text>
            </>
          ) : (
            <Text lineHeight={20} flex={1} numberOfLines={1} ellipsizeMode="tail">
              {t('settings.models.empty')}
            </Text>
          )}
        </XStack>
      </Button>
      <SettingGroup>
        <SettingRow>
          <CustomSlider
            label={t('assistants.settings.temperature')}
            value={settings.temperature ?? 0.7}
            max={10}
            multiplier={10}
            onValueChange={value => handleSettingsChange('temperature', value[0] / 10)}
          />
        </SettingRow>
        <SettingRow>
          <CustomSlider
            label={t('assistants.settings.top_p')}
            value={settings.topP ?? 0.8}
            max={10}
            multiplier={10}
            onValueChange={value => handleSettingsChange('topP', value[0] / 10)}
          />
        </SettingRow>
        <SettingRow>
          <CustomSlider
            label={t('assistants.settings.context')}
            value={settings.contextCount ?? 15}
            max={30}
            onValueChange={value => handleSettingsChange('contextCount', value[0])}
          />
        </SettingRow>
      </SettingGroup>

      <SettingGroup>
        <SettingRow>
          <Text>{t('assistants.settings.stream_output')}</Text>
          <CustomSwitch
            checked={settings.streamOutput ?? true}
            onCheckedChange={checked => handleSettingsChange('streamOutput', checked)}
          />
        </SettingRow>
        <SettingRow>
          <Text>{t('assistants.settings.max_tokens')}</Text>
          <CustomSwitch
            checked={settings.enableMaxTokens ?? false}
            onCheckedChange={checked => handleSettingsChange('enableMaxTokens', checked)}
          />
        </SettingRow>
        {settings.enableMaxTokens && (
          <SettingRow>
            <Text>{t('assistants.settings.max_tokens_value')}</Text>
            <Input
              minWidth={80}
              height={25}
              fontSize={12}
              lineHeight={12 * 1.2}
              value={maxTokensInput}
              onChangeText={handleMaxTokensInputChange}
              onBlur={handleMaxTokensBlur}
              keyboardType="numeric"
            />
          </SettingRow>
        )}
        {isReasoning && (
          // <SettingRow>
          //   <Text>{t('assistants.settings.reasoning')}</Text>
          //   <ReasoningSelect assistant={assistant} updateAssistant={updateAssistant} />
          // </SettingRow>
          <Button
            backgroundColor="$colorTransparent"
            borderWidth={0}
            iconAfter={ChevronRight}
            onPress={handleReasoningPress}
            justifyContent="space-between"
            paddingVertical={12}
            paddingLeft={16}
            paddingRight={20}>
            <Text flex={1}>{t('assistants.settings.reasoning')}</Text>

            <Stack justifyContent="flex-end">
              <Text
                fontSize={12}
                backgroundColor="$green10"
                borderColor="$green20"
                color="$green100"
                borderWidth={0.5}
                paddingVertical={2}
                paddingHorizontal={8}
                borderRadius={8}>
                {t(`assistants.settings.reasoning.${assistant?.settings?.reasoning_effort || 'off'}`)}
              </Text>
            </Stack>
          </Button>
        )}
      </SettingGroup>
      <ModelSheet ref={modelSheetRef} mentions={model} setMentions={setModel} multiple={false} />
      {assistant.model && (
        <ReasoningSheet ref={reasoningSheetRef} assistant={assistant} updateAssistant={updateAssistant} />
      )}
    </MotiView>
  )
}
