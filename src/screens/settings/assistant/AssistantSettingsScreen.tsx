import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { ChevronDown, Languages, MessageSquareMore, Rocket, Settings2 } from '@tamagui/lucide-icons'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import { Button, Text, XStack, YStack } from 'tamagui'
import { Image } from 'tamagui'

import { SettingContainer, SettingHelpText } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import ModelSheet from '@/components/sheets/ModelSheet'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { useAssistant } from '@/hooks/useAssistant'
import { useTheme } from '@/hooks/useTheme'
import { AssistantSettingsStackParamList } from '@/navigators/settings/AssistantSettingsStackNavigator'
import { Assistant, Model } from '@/types/assistant'
import { getModelOrProviderIcon } from '@/utils/icons'

function ModelPicker({ assistant, onPress }: { assistant: Assistant; onPress: () => void }) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const model = assistant?.model

  return (
    <Button
      chromeless
      width="100%"
      height="100%"
      paddingHorizontal={16}
      paddingVertical={15}
      onPress={onPress}
      iconAfter={<ChevronDown size={16} />}
      backgroundColor="$uiCardBackground">
      <XStack flex={1} alignItems="center" overflow="hidden" justifyContent="space-between">
        {model ? (
          <XStack flex={1} alignItems="center" gap={8}>
            <Image
              borderRadius={99}
              width={18}
              height={18}
              source={getModelOrProviderIcon(model.id, model.provider, isDark)}
            />
            <Text flexShrink={0} numberOfLines={1} maxWidth="60%" ellipsizeMode="tail" fontSize={14}>
              {model.name}
            </Text>
            <Text opacity={0.45} fontWeight="bold" fontSize={14}>
              |
            </Text>
            <Text opacity={0.45} flexShrink={1} numberOfLines={1} ellipsizeMode="tail" fontWeight="bold" fontSize={14}>
              {t(`provider.${model.provider}`)}
            </Text>
          </XStack>
        ) : (
          <Text flex={1} numberOfLines={1} ellipsizeMode="tail">
            {t('settings.models.empty')}
          </Text>
        )}
      </XStack>
    </Button>
  )
}

interface AssistantSettingItemProps {
  assistantId: string
  titleKey: string
  descriptionKey: string
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => Promise<void>
  icon?: React.ReactElement
}

function AssistantSettingItem({
  assistantId,
  titleKey,
  descriptionKey,
  assistant,
  updateAssistant,
  icon
}: AssistantSettingItemProps) {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AssistantSettingsStackParamList>>()
  const sheetRef = useRef<BottomSheetModal>(null)

  const handleModelChange = async (models: Model[]) => {
    const newModel = models[0]
    await updateAssistant({ ...assistant, model: newModel })
  }

  return (
    <>
      <YStack gap={8}>
        <XStack justifyContent="space-between" height={20}>
          <XStack alignItems="center" gap={8}>
            {icon}
            <Text>{t(titleKey)}</Text>
          </XStack>
          <Button
            size={14}
            icon={<Settings2 size={14} color="$textLink" />}
            backgroundColor="$colorTransparent"
            onPress={() => navigation.navigate('AssistantDetailScreen', { assistantId })}
          />
        </XStack>
        <XStack>
          <ModelPicker assistant={assistant} onPress={() => sheetRef.current?.present()} />
        </XStack>
        <SettingHelpText>{t(descriptionKey)}</SettingHelpText>
      </YStack>

      <ModelSheet
        ref={sheetRef}
        mentions={assistant.model ? [assistant.model] : []}
        setMentions={handleModelChange}
        multiple={false}
      />
    </>
  )
}

export default function AssistantSettingsScreen() {
  const { t } = useTranslation()

  const { assistant: defaultAssistant, updateAssistant: updateDefaultAssistant } = useAssistant('default')
  const { assistant: quickAssistant, updateAssistant: updateQuickAssistant } = useAssistant('quick')
  const { assistant: translateAssistant, updateAssistant: updateTranslateAssistant } = useAssistant('translate')

  const isLoading = !defaultAssistant || !quickAssistant || !translateAssistant

  if (isLoading) {
    return (
      <SafeAreaContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaContainer>
    )
  }

  const assistantItems = [
    {
      id: 'default',
      titleKey: 'settings.assistant.default_assistant.name',
      descriptionKey: 'settings.assistant.default_assistant.description',
      assistant: defaultAssistant,
      updateAssistant: updateDefaultAssistant,
      icon: <MessageSquareMore size={16} color="$textSecondary" />
    },
    {
      id: 'quick',
      titleKey: 'settings.assistant.quick_assistant.name',
      descriptionKey: 'settings.assistant.quick_assistant.description',
      assistant: quickAssistant,
      updateAssistant: updateQuickAssistant,
      icon: <Rocket size={16} color="$textSecondary" />
    },
    {
      id: 'translate',
      titleKey: 'settings.assistant.translate_assistant.name',
      descriptionKey: 'settings.assistant.translate_assistant.description',
      assistant: translateAssistant,
      updateAssistant: updateTranslateAssistant,
      icon: <Languages size={16} color="$textSecondary" />
    }
  ]

  return (
    <SafeAreaContainer>
      <HeaderBar title={t('settings.assistant.title')} />
      <SettingContainer>
        {assistantItems.map(item => (
          <AssistantSettingItem
            key={item.id}
            assistantId={item.id}
            titleKey={item.titleKey}
            descriptionKey={item.descriptionKey}
            assistant={item.assistant}
            updateAssistant={item.updateAssistant}
            icon={item.icon}
          />
        ))}
      </SettingContainer>
    </SafeAreaContainer>
  )
}
