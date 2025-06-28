import { sortBy } from 'lodash'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Text, YStack } from 'tamagui'

import { SettingGroup, SettingRow } from '@/components/settings'
import { ModelSelect } from '@/components/settings/providers/ModelSelect'
import { isEmbeddingModel } from '@/config/models/embedding'
import { useAllProviders } from '@/hooks/useProviders'
import { Assistant, AssistantSettings, Model } from '@/types/assistant'
import { getModelUniqId } from '@/utils/model'

import { CustomSlider } from '../ui/CustomSlider'
import { CustomSwitch } from '../ui/Switch'
import { ReasoningSelect } from './ReasoningSelect'

interface ModelTabContentProps {
  assistant: Assistant | null
  setAssistant: (assistant: Assistant) => void
}

export function ModelTabContent({ assistant, setAssistant }: ModelTabContentProps) {
  const { t } = useTranslation()
  const { providers } = useAllProviders()

  const selectOptions = useMemo(() => {
    return providers
      .filter(p => p.models && p.models.length > 0)
      .map(p => ({
        label: p.isSystem ? t(`provider.${p.id}`) : p.name,
        title: p.name,
        options: sortBy(p.models, 'name')
          .filter(m => !isEmbeddingModel(m))
          .map(m => ({
            label: `${m.name}`,
            value: getModelUniqId(m),
            model: m
          }))
      }))
  }, [providers, t])

  const handleModelChange = useCallback(
    (value: string) => {
      if (!assistant || !value) {
        return
      }

      let modelToSet: Model | undefined

      for (const group of selectOptions) {
        const foundOption = group.options.find(opt => opt.value === value)

        if (foundOption) {
          modelToSet = foundOption.model
          break
        }
      }

      if (modelToSet) {
        setAssistant({
          ...assistant,
          model: modelToSet
        })
      }
    },
    [assistant, setAssistant, selectOptions]
  )

  const handleSettingsChange = useCallback(
    (key: keyof AssistantSettings, value: any) => {
      if (!assistant) return
      setAssistant({
        ...assistant,
        settings: {
          ...assistant.settings,
          [key]: value
        }
      })
    },
    [assistant, setAssistant]
  )

  const handleMaxTokensChange = useCallback(
    (value: string) => {
      if (value.trim() === '') {
        handleSettingsChange('maxTokens', undefined)
        return
      }

      const numValue = parseInt(value, 10)

      if (!isNaN(numValue) && numValue > 0) {
        handleSettingsChange('maxTokens', numValue)
      }
    },
    [handleSettingsChange]
  )

  if (!assistant) {
    return null
  }

  const settings = assistant.settings || {}

  return (
    <YStack flex={1} gap={30}>
      <ModelSelect
        value={assistant.model ? getModelUniqId(assistant.model) : undefined}
        onValueChange={handleModelChange}
        selectOptions={selectOptions}
        placeholder={t('settings.models.empty')}
      />

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
            checked={settings.streamOutput ?? false}
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
              value={settings.maxTokens ? settings.maxTokens.toString() : ''}
              onChangeText={handleMaxTokensChange}
              keyboardType="numeric"
            />
          </SettingRow>
        )}
        <SettingRow>
          <Text>{t('assistants.settings.reasoning')}</Text>
          <ReasoningSelect
            assistant={assistant}
            onValueChange={value => handleSettingsChange('reasoning_effort', value)}
          />
        </SettingRow>
      </SettingGroup>
    </YStack>
  )
}
