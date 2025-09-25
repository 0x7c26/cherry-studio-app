import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { UnionPlusIcon } from '@/componentsV2/icons'
import {
  DrawerGestureWrapper,
  SafeAreaContainer,
  Container,
  HeaderBar,
  Text,
  YStack,
  SearchInput
} from '@/componentsV2'
import { Menu } from '@/componentsV2/icons/LucideIcon'
import { useExternalAssistants } from '@/hooks/useAssistant'
import { useSearch } from '@/hooks/useSearch'
import { useTopics } from '@/hooks/useTopic'
import { createAssistant } from '@/services/AssistantService'
import { Assistant } from '@/types/assistant'
import { DrawerNavigationProps } from '@/types/naviagate'
import { getAssistantWithTopic } from '@/utils/assistants'
import { haptic } from '@/utils/haptic'
import AssistantItemSkeleton from '@/componentsV2/features/Assistant/AssistantItemSkeleton'
import AssistantItem from '@/componentsV2/features/Assistant/AssistantItem'
import AssistantItemSheet from '@/componentsV2/features/Assistant/AssistantItemSheet'
import { LegendList } from '@legendapp/list'

export default function AssistantScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation<DrawerNavigationProps>()

  const { topics } = useTopics()
  const { assistants, isLoading } = useExternalAssistants()
  const assistantWithTopics = getAssistantWithTopic(assistants, topics)

  const {
    searchText,
    setSearchText,
    filteredItems: filteredAssistants
  } = useSearch(
    assistantWithTopics,
    useCallback((assistant: Assistant) => [assistant.name, assistant.description || ''], []),
    { delay: 300 }
  )

  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)

  const handleAssistantItemPress = (assistant: Assistant) => {
    haptic(ImpactFeedbackStyle.Medium)
    setSelectedAssistant(assistant)
    bottomSheetRef.current?.present()
  }

  const onAddAssistant = async () => {
    haptic(ImpactFeedbackStyle.Medium)
    const newAssistant = await createAssistant()
    navigation.navigate('Assistant', { screen: 'AssistantDetailScreen', params: { assistantId: newAssistant.id } })
  }

  const handleMenuPress = () => {
    haptic(ImpactFeedbackStyle.Medium)
    navigation.dispatch(DrawerActions.openDrawer())
  }

  const handleEditAssistant = (assistantId: string) => {
    navigation.navigate('Assistant', { screen: 'AssistantDetailScreen', params: { assistantId } })
  }

  const onChatNavigation = async (topicId: string) => {
    navigation.navigate('Home', { screen: 'ChatScreen', params: { topicId } })
  }

  return (
    <SafeAreaContainer className="pb-0">
      <DrawerGestureWrapper>
        <View collapsable={false} className="flex-1">
          <HeaderBar
            title={t('assistants.title.mine')}
            leftButton={{
              icon: <Menu size={24} />,
              onPress: handleMenuPress
            }}
            rightButton={{
              icon: <UnionPlusIcon size={20} />,
              onPress: onAddAssistant
            }}
          />
          <Container className="p-0">
            <View className="px-4">
              <SearchInput
                placeholder={t('common.search_placeholder')}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {isLoading ? (
              <LegendList
                data={Array.from({ length: 5 })}
                renderItem={() => <AssistantItemSkeleton />}
                keyExtractor={(_, index) => `skeleton-${index}`}
                estimatedItemSize={80}
                ItemSeparatorComponent={() => <YStack className="h-2.5" />}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 }}
                drawDistance={2000}
                recycleItems
                waitForInitialLayout
              />
            ) : (
              <LegendList
                showsVerticalScrollIndicator={false}
                data={filteredAssistants}
                renderItem={({ item }) => (
                  <AssistantItem assistant={item} onAssistantPress={handleAssistantItemPress} />
                )}
                keyExtractor={item => item.id}
                estimatedItemSize={80}
                ItemSeparatorComponent={() => <YStack className="h-2" />}
                ListEmptyComponent={
                  <YStack className="flex-1 justify-center items-center">
                    <Text>{t('settings.assistant.empty')}</Text>
                  </YStack>
                }
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
                drawDistance={2000}
                recycleItems
                waitForInitialLayout
              />
            )}
          </Container>
          <AssistantItemSheet
            ref={bottomSheetRef}
            assistant={selectedAssistant}
            source="external"
            onEdit={handleEditAssistant}
            onChatNavigation={onChatNavigation}
          />
        </View>
      </DrawerGestureWrapper>
    </SafeAreaContainer>
  )
}
