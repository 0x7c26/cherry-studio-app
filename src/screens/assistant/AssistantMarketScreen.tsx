import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { DrawerGestureWrapper, SafeAreaContainer, Container, HeaderBar, SearchInput } from '@/componentsV2'
import { Menu } from '@/componentsV2/icons/LucideIcon'
import { useBuiltInAssistants } from '@/hooks/useAssistant'
import { useSearch } from '@/hooks/useSearch'
import { Assistant } from '@/types/assistant'
import { DrawerNavigationProps } from '@/types/naviagate'
import { haptic } from '@/utils/haptic'
import AssistantMarketLoading from '@/componentsV2/features/Assistant/AssistantMarketLoading'
import AssistantsTabContent from '@/componentsV2/features/Assistant/AssistantsTabContent'
import AssistantItemSheet from '@/componentsV2/features/Assistant/AssistantItemSheet'

export default function AssistantMarketScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation<DrawerNavigationProps>()

  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const { builtInAssistants } = useBuiltInAssistants()
  const {
    searchText,
    setSearchText,
    filteredItems: filteredAssistants
  } = useSearch(
    builtInAssistants,
    useCallback((assistant: Assistant) => [assistant.name || '', assistant.id || ''], [])
  )

  const handleAssistantItemPress = (assistant: Assistant) => {
    haptic(ImpactFeedbackStyle.Medium)
    setSelectedAssistant(assistant)
    bottomSheetRef.current?.present()
  }

  const handleMenuPress = () => {
    haptic(ImpactFeedbackStyle.Medium)
    navigation.dispatch(DrawerActions.openDrawer())
  }

  const onChatNavigation = async (topicId: string) => {
    navigation.navigate('Home', { screen: 'ChatScreen', params: { topicId } })
  }

  useEffect(() => {
    if (builtInAssistants.length > 0 && isInitializing) {
      const id = setTimeout(() => {
        setIsInitializing(false)
      }, 100)
      return () => clearTimeout(id)
    }
  }, [builtInAssistants, isInitializing])

  if (isInitializing) {
    return <AssistantMarketLoading />
  }

  return (
    <SafeAreaContainer className="pb-0">
      <DrawerGestureWrapper>
        <View collapsable={false} className="flex-1">
          <HeaderBar
            title={t('assistants.market.title')}
            leftButton={{
              icon: <Menu size={24} />,
              onPress: handleMenuPress
            }}
          />
          <Container className="py-0 gap-2.5">
            <SearchInput
              placeholder={t('assistants.market.search_placeholder')}
              value={searchText}
              onChangeText={setSearchText}
            />

            <AssistantsTabContent assistants={filteredAssistants} onAssistantPress={handleAssistantItemPress} />
          </Container>
          <AssistantItemSheet
            ref={bottomSheetRef}
            assistant={selectedAssistant}
            source="builtIn"
            onChatNavigation={onChatNavigation}
          />
        </View>
      </DrawerGestureWrapper>
    </SafeAreaContainer>
  )
}
