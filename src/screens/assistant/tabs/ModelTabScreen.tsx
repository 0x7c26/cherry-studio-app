import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

import { YStack } from '@/componentsV2'
import { useAssistant } from '@/hooks/useAssistant'
import { useTheme } from '@/hooks/useTheme'
import { AssistantDetailTabParamList } from '@/navigators/AssistantDetailTabNavigator'
import { ModelTabContent } from '@/componentsV2/features/Assistant/ModelTabContent'

type ModelTabRouteProp = RouteProp<AssistantDetailTabParamList, 'ModelTab'>

export default function ModelTabScreen() {
  const route = useRoute<ModelTabRouteProp>()
  const { isDark } = useTheme()
  const { assistant: _assistant } = route.params
  const { assistant, updateAssistant } = useAssistant(_assistant.id)

  if (!assistant) return null

  return (
    <KeyboardAwareScrollView
      className={`flex-1 ${isDark ? 'bg-[#121213ff]' : 'bg-[#f7f7f7ff]'}`}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={10}>
      <YStack className="flex-1 pt-2.5 px-2">
        <ModelTabContent assistant={assistant} updateAssistant={updateAssistant} />
      </YStack>
    </KeyboardAwareScrollView>
  )
}
