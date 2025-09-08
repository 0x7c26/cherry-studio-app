import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { ChevronRight, HeartPulse, Plus, Settings2 } from '@tamagui/lucide-icons'
import { groupBy } from 'lodash'
import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { Accordion, Button, Separator, Stack, Text, XStack, YStack } from 'tamagui'

import {
  PressableSettingRow,
  SettingContainer,
  SettingGroup,
  SettingGroupTitle,
  SettingRow
} from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import { AddModelSheet } from '@/components/settings/providers/AddModelSheet'
import { ModelGroup } from '@/components/settings/providers/ModelGroup'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { SearchInput } from '@/components/ui/SearchInput'
import { CustomSwitch } from '@/components/ui/Switch'
import { useProvider } from '@/hooks/useProviders'
import { useSearch } from '@/hooks/useSearch'
import { ProvidersStackParamList } from '@/navigators/settings/ProvidersStackNavigator'
import { loggerService } from '@/services/LoggerService'
import { Model } from '@/types/assistant'
import { ProvidersNavigationProps } from '@/types/naviagate'
const logger = loggerService.withContext('ProviderSettingsScreen')

type ProviderSettingsRouteProp = RouteProp<ProvidersStackParamList, 'ProviderSettingsScreen'>

export default function ProviderSettingsScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation<ProvidersNavigationProps>()
  const route = useRoute<ProviderSettingsRouteProp>()

  const bottomSheetRef = useRef<BottomSheetModal>(null)

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.present()
  }

  const { providerId } = route.params
  const { provider, isLoading, updateProvider } = useProvider(providerId)

  // Use the search hook for filtering models
  const allModels = provider?.models || []
  const {
    searchText,
    setSearchText,
    filteredItems: searchFilteredModels
  } = useSearch(
    allModels,
    useCallback((model: Model) => [model.name || '', model.id || ''], []),
    { delay: 300 }
  )

  // 使用 groupBy 对过滤后的模型按 group 字段分组
  const modelGroups = groupBy(searchFilteredModels, 'group')

  // Convert to entries and filter empty groups
  const filteredModelGroups = Object.fromEntries(Object.entries(modelGroups).filter(([, models]) => models.length > 0))

  // 对分组进行排序
  const sortedModelGroups = Object.entries(filteredModelGroups).sort(([a], [b]) => a.localeCompare(b))

  // 默认展开前6个分组
  const defaultOpenGroups = sortedModelGroups.slice(0, 6).map((_, index) => `item-${index}`)

  const onAddModel = () => {
    handleOpenBottomSheet()
  }

  const onManageModel = () => {
    navigation.navigate('ManageModelsScreen', { providerId })
  }

  const onApiService = () => {
    navigation.navigate('ApiServiceScreen', { providerId })
  }

  // const onSettingModel = (model: Model) => {
  //   logger.info('[ProviderSettingsPage] onSettingModel', model)
  // }

  const handleEnabledChange = async (checked: boolean) => {
    if (provider) {
      const updatedProvider = { ...provider, enabled: checked }

      try {
        await updateProvider(updatedProvider)
      } catch (error) {
        logger.error('Failed to save provider:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <SafeAreaContainer>
        <Stack />
      </SafeAreaContainer>
    )
  }

  if (!provider) {
    return (
      <SafeAreaContainer>
        <HeaderBar title={t('settings.provider.not_found')} />
        <SettingContainer>
          <Text textAlign="center" color="$gray10" paddingVertical={24}>
            {t('settings.provider.not_found_message')}
          </Text>
        </SettingContainer>
      </SafeAreaContainer>
    )
  }

  return (
    <SafeAreaContainer>
      <HeaderBar
        title={provider.name}
        rightButtons={[
          {
            icon: <Settings2 size={24} />,
            onPress: onManageModel
          },
          {
            icon: <Plus size={24} />,
            onPress: onAddModel
          }
        ]}
      />

      <SettingContainer
        paddingBottom={0}
        onStartShouldSetResponder={() => false}
        onMoveShouldSetResponder={() => false}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}>
          <YStack flex={1} gap={24}>
            {/* Auth Card */}
            {/* <AuthCard provider={provider} /> */}

            {/* Manage Card */}
            <YStack gap={8}>
              <SettingGroupTitle>{t('common.manage')}</SettingGroupTitle>
              <SettingGroup>
                <SettingRow>
                  <Text>{t('common.enabled')}</Text>
                  <CustomSwitch checked={provider.enabled} onCheckedChange={handleEnabledChange} />
                </SettingRow>
                <PressableSettingRow onPress={onApiService}>
                  <Text>{t('settings.provider.api_service')}</Text>
                  <XStack justifyContent="center" alignItems="center">
                    {provider.apiKey && provider.apiHost && (
                      <Text
                        paddingVertical={2}
                        paddingHorizontal={8}
                        borderRadius={8}
                        backgroundColor="$green10"
                        borderColor="$green20"
                        color="$green100"
                        borderWidth={0.5}
                        fontWeight="bold"
                        fontSize={12}>
                        {t('settings.provider.added')}
                      </Text>
                    )}
                    <ChevronRight color="$white9" width={6} height={12} />
                  </XStack>
                </PressableSettingRow>
              </SettingGroup>
            </YStack>

            <Separator />

            {/* Search Card */}
            <SearchInput placeholder={t('settings.models.search')} value={searchText} onChangeText={setSearchText} />

            {/* Model List Card with Accordion */}
            <YStack flex={1}>
              <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
                <SettingGroupTitle>{t('settings.models.title')}</SettingGroupTitle>
                <Button size={14} chromeless icon={<HeartPulse size={14} />} />
              </XStack>
              <SettingGroup>
                {sortedModelGroups.length > 0 ? (
                  <Accordion overflow="hidden" type="multiple" defaultValue={defaultOpenGroups}>
                    {sortedModelGroups.map(([groupName, modelsInGroup], index) => (
                      <ModelGroup
                        key={groupName}
                        groupName={groupName}
                        models={modelsInGroup as Model[]}
                        index={index}
                        // todo
                        // renderModelButton={(model: Model) => (
                        //   <Button
                        //     size={14}
                        //     chromeless
                        //     icon={<Settings size={14} />}
                        //     onPress={() => onSettingModel(model)}
                        //   />
                        // )}
                      />
                    ))}
                  </Accordion>
                ) : (
                  <Text textAlign="center" color="$gray10" paddingVertical={24}>
                    {t('models.no_models')}
                  </Text>
                )}
              </SettingGroup>
            </YStack>
          </YStack>
        </KeyboardAwareScrollView>
      </SettingContainer>

      <AddModelSheet ref={bottomSheetRef} provider={provider} updateProvider={updateProvider} />
    </SafeAreaContainer>
  )
}
