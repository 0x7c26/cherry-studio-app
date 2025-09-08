import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import { Menu } from '@tamagui/lucide-icons'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Text, YStack } from 'tamagui'

import AssistantItem from '@/components/assistant/AssistantItem'
import AssistantItemSkeleton from '@/components/assistant/AssistantItemSkeleton'
import AssistantItemSheet from '@/components/assistant/market/AssistantItemSheet'
import { UnionPlusIcon } from '@/components/icons/UnionPlusIcon'
import { SettingContainer } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import { DrawerGestureWrapper } from '@/components/ui/DrawerGestureWrapper'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { SearchInput } from '@/components/ui/SearchInput'
import { useExternalAssistants } from '@/hooks/useAssistant'
import { useSearch } from '@/hooks/useSearch'
import { useTopics } from '@/hooks/useTopic'
import { createAssistant } from '@/services/AssistantService'
import { Assistant } from '@/types/assistant'
import { DrawerNavigationProps } from '@/types/naviagate'
import { getAssistantWithTopic } from '@/utils/assistants'
import { haptic } from '@/utils/haptic'

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
    <SafeAreaContainer>
      <DrawerGestureWrapper>
        <View collapsable={false} style={{ flex: 1 }}>
          <HeaderBar
            title={t('assistants.title.mine')}
            leftButton={{
              icon: <Menu size={24} />,
              onPress: handleMenuPress
            }}
            rightButton={{
              icon: <UnionPlusIcon size={24} />,
              onPress: onAddAssistant
            }}
          />
          <SettingContainer padding={0} gap={10}>
            <View style={{ paddingHorizontal: 16 }}>
              <SearchInput
                placeholder={t('common.search_placeholder')}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {isLoading ? (
              <FlashList
                data={Array.from({ length: 5 })}
                renderItem={() => <AssistantItemSkeleton />}
                keyExtractor={(_, index) => `skeleton-${index}`}
                estimatedItemSize={80}
                ItemSeparatorComponent={() => <YStack height={10} />}
              />
            ) : (
              <FlashList
                showsVerticalScrollIndicator={false}
                data={filteredAssistants}
                renderItem={({ item }) => (
                  <AssistantItem assistant={item} onAssistantPress={handleAssistantItemPress} />
                )}
                keyExtractor={item => item.id}
                estimatedItemSize={80}
                ItemSeparatorComponent={() => <YStack height={10} />}
                ListEmptyComponent={
                  <YStack flex={1} justifyContent="center" alignItems="center" paddingTop="$8">
                    <Text>{t('settings.assistant.empty')}</Text>
                  </YStack>
                }
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10 }}
              />
            )}
          </SettingContainer>
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
