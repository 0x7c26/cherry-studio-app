import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list'
import { Plus } from '@tamagui/lucide-icons'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import { YStack } from 'tamagui'

import { SettingContainer, SettingGroup } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import { ProviderSheet } from '@/components/settings/providers/AddProviderSheet'
import { ProviderItem } from '@/components/settings/providers/ProviderItem'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { SearchInput } from '@/components/ui/SearchInput'
import { useAllProviders } from '@/hooks/useProviders'
import { useSearch } from '@/hooks/useSearch'
import { Provider } from '@/types/assistant'

export default function ProviderListScreen() {
  const { t } = useTranslation()

  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const { providers, isLoading } = useAllProviders()

  const [sheetMode, setSheetMode] = useState<'add' | 'edit'>('add')
  const [editingProvider, setEditingProvider] = useState<Provider | undefined>(undefined)

  const {
    searchText,
    setSearchText,
    filteredItems: filteredProviders
  } = useSearch(
    providers,
    useCallback((provider: Provider) => [provider.name || ''], []),
    { delay: 300 }
  )

  const onAddProvider = () => {
    setSheetMode('add')
    setEditingProvider(undefined)
    bottomSheetRef.current?.present()
  }

  const onEditProvider = (provider: Provider) => {
    setSheetMode('edit')
    setEditingProvider(provider)
    bottomSheetRef.current?.present()
  }

  const handleProviderSave = () => {
    // Force refresh by clearing and resetting the editing provider
    setEditingProvider(undefined)
  }

  const renderProviderItem = ({ item }: ListRenderItemInfo<Provider>) => (
    <ProviderItem key={item.id} provider={item} mode={item.enabled ? 'enabled' : 'checked'} onEdit={onEditProvider} />
  )

  return (
    <SafeAreaContainer>
      <HeaderBar
        title={t('settings.provider.list.title')}
        rightButton={{
          icon: <Plus size={24} />,
          onPress: onAddProvider
        }}
      />
      {isLoading ? (
        <SafeAreaContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </SafeAreaContainer>
      ) : (
        <SettingContainer paddingBottom={0}>
          <SearchInput placeholder={t('settings.provider.search')} value={searchText} onChangeText={setSearchText} />

          <YStack flex={1} height="100%">
            <SettingGroup flex={1}>
              <FlashList
                data={filteredProviders}
                renderItem={renderProviderItem}
                keyExtractor={item => item.id}
                estimatedItemSize={60}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                extraData={providers}
              />
            </SettingGroup>
          </YStack>
        </SettingContainer>
      )}

      <ProviderSheet ref={bottomSheetRef} mode={sheetMode} editProvider={editingProvider} onSave={handleProviderSave} />
    </SafeAreaContainer>
  )
}
