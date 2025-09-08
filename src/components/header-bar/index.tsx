import { DrawerNavigationProp } from '@react-navigation/drawer'
import { DrawerActions, ParamListBase, useNavigation } from '@react-navigation/native'
import { Menu } from '@tamagui/lucide-icons'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React from 'react'
import { XStack } from 'tamagui'

import { useAssistant } from '@/hooks/useAssistant'
import { Topic } from '@/types/assistant'
import { haptic } from '@/utils/haptic'

import { IconButton } from '../ui/IconButton'
import { AssistantSelection } from './AssistantSelection'
import { NewTopicButton } from './NewTopicButton'

interface HeaderBarProps {
  topic: Topic
}

export const HeaderBar = ({ topic }: HeaderBarProps) => {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>()
  const { assistant, isLoading } = useAssistant(topic.assistantId)

  const handleMenuPress = () => {
    haptic(ImpactFeedbackStyle.Medium)
    navigation.dispatch(DrawerActions.openDrawer())
  }

  if (isLoading || !assistant) {
    return null
  }

  return (
    <XStack alignItems="center" height={44} justifyContent="space-between" paddingHorizontal={14}>
      <XStack alignItems="center" minWidth={40}>
        <IconButton onPress={handleMenuPress} icon={<Menu size={24} />} />
      </XStack>
      <XStack flex={1} justifyContent="center" alignItems="center">
        <AssistantSelection assistant={assistant} topic={topic} />
      </XStack>
      <XStack alignItems="center" minWidth={40} justifyContent="flex-end">
        {topic.messages.length > 0 && <NewTopicButton assistant={assistant} />}
      </XStack>
    </XStack>
  )
}
