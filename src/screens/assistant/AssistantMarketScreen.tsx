import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { Menu } from '@tamagui/lucide-icons'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Tabs, Text, View } from 'tamagui'

import AssistantItemSheet from '@/components/assistant/market/AssistantItemSheet'
import AssistantMarketLoading from '@/components/assistant/market/AssistantMarketLoading'
import AssistantsTabContent from '@/components/assistant/market/AssistantsTabContent'
import { SettingContainer } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import { DrawerGestureWrapper } from '@/components/ui/DrawerGestureWrapper'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { SearchInput } from '@/components/ui/SearchInput'
import { useBuiltInAssistants } from '@/hooks/useAssistant'
import { useAssistantFilter } from '@/hooks/useAssistantFilter'
import { useSearch } from '@/hooks/useSearch'
import { Assistant } from '@/types/assistant'
import { DrawerNavigationProps } from '@/types/naviagate'
import { haptic } from '@/utils/haptic'

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
  const {
    filterType,
    setFilterType,
    filteredAssistants: categoryFilteredAssistants,
    tabConfigs
  } = useAssistantFilter(filteredAssistants)

  const handleAssistantItemPress = useCallback((assistant: Assistant) => {
    haptic(ImpactFeedbackStyle.Medium)
    setSelectedAssistant(assistant)
    bottomSheetRef.current?.present()
  }, [])

  const handleMenuPress = () => {
    haptic(ImpactFeedbackStyle.Medium)
    navigation.dispatch(DrawerActions.openDrawer())
  }

  const onChatNavigation = async (topicId: string) => {
    navigation.navigate('Home', { screen: 'ChatScreen', params: { topicId } })
  }

  const getTabStyle = (tabValue: string) => ({
    height: '100%',
    backgroundColor: filterType === tabValue ? '$background' : 'transparent',
    borderRadius: 15
  })

  useEffect(() => {
    if (builtInAssistants.length > 0 && isInitializing) {
      setTimeout(() => {
        setIsInitializing(false)
      }, 100)
    }
  }, [builtInAssistants, isInitializing])

  if (isInitializing) {
    return <AssistantMarketLoading />
  }

  return (
    <SafeAreaContainer>
      <DrawerGestureWrapper>
        <View collapsable={false} style={{ flex: 1 }}>
          <HeaderBar
            title={t('assistants.market.title')}
            leftButton={{
              icon: <Menu size={24} />,
              onPress: handleMenuPress
            }}
          />
          <SettingContainer paddingVertical={0}>
            <SearchInput
              placeholder={t('assistants.market.search_placeholder')}
              value={searchText}
              onChangeText={setSearchText}
            />

            <Tabs
              gap={10}
              defaultValue="all"
              value={filterType}
              onValueChange={setFilterType}
              orientation="horizontal"
              flexDirection="column"
              flex={1}>
              <Tabs.List gap={10} flexDirection="row" height={34}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {tabConfigs.map(({ value, label }) => (
                    <Tabs.Tab key={value} value={value} {...getTabStyle(value)}>
                      <Text>{label}</Text>
                    </Tabs.Tab>
                  ))}
                </ScrollView>
              </Tabs.List>

              <Tabs.Content value="all" flex={1}>
                <AssistantsTabContent assistants={filteredAssistants} onAssistantPress={handleAssistantItemPress} />
              </Tabs.Content>
              {tabConfigs
                .filter(({ value }) => value !== 'all')
                .map(({ value }) => (
                  <Tabs.Content key={value} value={value} flex={1}>
                    <AssistantsTabContent
                      assistants={categoryFilteredAssistants}
                      onAssistantPress={handleAssistantItemPress}
                    />
                  </Tabs.Content>
                ))}
            </Tabs>
          </SettingContainer>
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
