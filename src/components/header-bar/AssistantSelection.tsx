import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Text, XStack, YStack } from 'tamagui'

import { Assistant } from '@/types/assistant'
import { Topic } from '@/types/assistant'
import { DrawerNavigationProps } from '@/types/naviagate'

import AssistantItemSheet from '../assistant/market/AssistantItemSheet'

interface AssistantSelectionProps {
  assistant: Assistant
  topic: Topic
}

export const AssistantSelection: React.FC<AssistantSelectionProps> = ({ assistant, topic }) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const navigation = useNavigation<DrawerNavigationProps>()
  const { t } = useTranslation()

  const handlePress = () => {
    bottomSheetRef.current?.present()
  }

  const handleEditAssistant = (assistantId: string) => {
    navigation.navigate('Assistant', { screen: 'AssistantDetailScreen', params: { assistantId } })
  }

  const handlePressActionButton = () => {
    bottomSheetRef.current?.dismiss()
    navigation.navigate('Assistant', { screen: 'AssistantScreen' })
  }

  const actionButton = {
    text: t('assistants.title.change'),
    onPress: handlePressActionButton
  }

  return (
    <>
      <Button unstyled onPress={handlePress} pressStyle={{ opacity: 0.6 }}>
        <XStack gap={14} alignItems="center" justifyContent="center">
          <YStack gap={2} alignItems="center" justifyContent="flex-start">
            <Text fontSize={16} ellipsizeMode="tail" numberOfLines={1}>
              {assistant.name}
            </Text>
            <Text fontSize={11} ellipsizeMode="tail" numberOfLines={1} color="$gray11">
              {topic.name}
            </Text>
          </YStack>
        </XStack>
      </Button>
      <AssistantItemSheet
        ref={bottomSheetRef}
        assistant={assistant}
        source="external"
        onEdit={handleEditAssistant}
        actionButton={actionButton}
      />
    </>
  )
}
