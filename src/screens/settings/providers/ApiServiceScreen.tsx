import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { RouteProp, useRoute } from '@react-navigation/native'
import { ImpactFeedbackStyle } from 'expo-haptics'
import { sortBy } from 'lodash'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import { Button } from 'heroui-native'

import {
  Container,
  ExternalLink,
  GroupTitle,
  HeaderBar,
  SafeAreaContainer,
  Text,
  TextField,
  XStack,
  YStack
} from '@/componentsV2'
import { Eye, EyeOff, ShieldCheck } from '@/componentsV2/icons/LucideIcon'
import { isEmbeddingModel } from '@/config/models'
import { PROVIDER_URLS } from '@/config/providers'
import { useDialog } from '@/hooks/useDialog'
import { useProvider } from '@/hooks/useProviders'
import { ProvidersStackParamList } from '@/navigators/settings/ProvidersStackNavigator'
import { checkApi } from '@/services/ApiService'
import { loggerService } from '@/services/LoggerService'
import { ApiStatus, Model } from '@/types/assistant'
import { haptic } from '@/utils/haptic'
import { getModelUniqId } from '@/utils/model'
import { ApiCheckSheet } from '@/componentsV2/features/SettingsScreen/ApiCheckSheet'
const logger = loggerService.withContext('ApiServiceScreen')

type ProviderSettingsRouteProp = RouteProp<ProvidersStackParamList, 'ApiServiceScreen'>

export default function ApiServiceScreen() {
  const { t } = useTranslation()
  const dialog = useDialog()
  const route = useRoute<ProviderSettingsRouteProp>()

  const { providerId } = route.params
  const { provider, isLoading, updateProvider } = useProvider(providerId)

  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedModel, setSelectedModel] = useState<Model | undefined>()
  const [checkApiStatus, setCheckApiStatus] = useState<ApiStatus>('idle')
  const [apiKey, setApiKey] = useState(provider?.apiKey || '')
  const [apiHost, setApiHost] = useState(provider?.apiHost || '')

  const bottomSheetRef = useRef<BottomSheetModal>(null)

  // 当 provider 改变时更新本地状态
  React.useEffect(() => {
    if (provider) {
      setApiKey(provider.apiKey || '')
      setApiHost(provider.apiHost || '')
    }
  }, [provider])

  const webSearchProviderConfig = provider?.id ? PROVIDER_URLS[provider.id] : undefined
  const apiKeyWebsite = webSearchProviderConfig?.websites?.apiKey

  if (isLoading) {
    return (
      <SafeAreaContainer className="items-center justify-center">
        <ActivityIndicator />
      </SafeAreaContainer>
    )
  }

  if (!provider) {
    return (
      <SafeAreaContainer>
        <HeaderBar title={t('settings.provider.not_found')} />
        <Container>
          <Text className="text-center text-gray-400 py-6">{t('settings.provider.not_found_message')}</Text>
        </Container>
      </SafeAreaContainer>
    )
  }

  const selectOptions = !provider.models?.length
    ? []
    : [
        {
          label: provider.isSystem ? t(`provider.${provider.id}`) : provider.name,
          title: provider.name,
          options: sortBy(provider.models, 'name')
            .filter(model => !isEmbeddingModel(model))
            .map(model => ({
              label: model.name,
              value: getModelUniqId(model),
              model
            }))
        }
      ]

  const handleOpenBottomSheet = () => {
    haptic(ImpactFeedbackStyle.Medium)
    bottomSheetRef.current?.present()
  }

  const handleBottomSheetClose = () => {
    bottomSheetRef.current?.dismiss()
  }

  const handleModelChange = (value: string) => {
    if (!value) {
      setSelectedModel(undefined)
      return
    }

    const allOptions = selectOptions.flatMap(group => group.options)
    const foundOption = allOptions.find(opt => opt.value === value)
    setSelectedModel(foundOption?.model)
  }

  const toggleApiKeyVisibility = () => {
    setShowApiKey(prevShowApiKey => !prevShowApiKey)
  }

  const handleProviderConfigChange = async (key: 'apiKey' | 'apiHost', value: string) => {
    if (key === 'apiKey') {
      setApiKey(value)
    } else if (key === 'apiHost') {
      setApiHost(value)
    }

    const updatedProvider = { ...provider, [key]: value }
    await updateProvider(updatedProvider)
  }

  // 模型检测处理
  const handleStartModelCheck = async () => {
    if (!selectedModel || !apiKey) {
      let errorKey = ''

      if (!selectedModel && !apiKey) {
        errorKey = 'model_api_key_empty'
      } else if (!selectedModel) {
        errorKey = 'model_empty'
      } else if (!apiKey) {
        errorKey = 'api_key_empty'
      }

      dialog.open({
        type: 'error',
        title: t('settings.provider.check_failed.title'),
        content: t(`settings.provider.check_failed.${errorKey}`),
        onConFirm: () => handleBottomSheetClose()
      })
      return
    }

    try {
      setCheckApiStatus('processing')
      await checkApi(provider, selectedModel)
      setCheckApiStatus('success')
    } catch (error: any) {
      logger.error('Model check failed:', error)
      const errorMessage =
        error && error.message
          ? ' ' + (error.message.length > 100 ? error.message.substring(0, 100) + '...' : error.message)
          : ''

      setCheckApiStatus('error')

      dialog.open({
        type: 'error',
        title: t('settings.provider.check_failed.title'),
        content: errorMessage,
        onConFirm: () => handleBottomSheetClose()
      })
    } finally {
      setTimeout(() => {
        setCheckApiStatus('idle')
        handleBottomSheetClose()
      }, 500)
    }
  }

  return (
    <SafeAreaContainer className="flex-1">
      <HeaderBar title={t('settings.provider.api_service')} />
      <Container>
        {/* API Key 配置 */}
        <YStack className="gap-2">
          <XStack className="justify-between items-center">
            <GroupTitle>{t('settings.provider.api_key')}</GroupTitle>
            <Button size="sm" isIconOnly variant="ghost" onPress={handleOpenBottomSheet}>
              <Button.LabelContent>
                <ShieldCheck size={16} className="text-blue-500" />
              </Button.LabelContent>
            </Button>
          </XStack>

          <XStack className="gap-2 relative">
            <TextField className="flex-1">
              <TextField.Input
                className="h-12 pr-0"
                value={apiKey}
                secureTextEntry={!showApiKey}
                placeholder={t('settings.provider.api_key.placeholder')}
                onChangeText={text => handleProviderConfigChange('apiKey', text)}>
                <TextField.InputEndContent>
                  <Button size="sm" variant="ghost" isIconOnly onPress={toggleApiKeyVisibility}>
                    <Button.LabelContent>
                      {showApiKey ? <EyeOff className="text-white" size={16} /> : <Eye size={16} />}
                    </Button.LabelContent>
                  </Button>
                </TextField.InputEndContent>
              </TextField.Input>
            </TextField>
          </XStack>

          <XStack className="justify-between px-3">
            <Text className="text-xs opacity-40">{t('settings.provider.api_key.tip')}</Text>
            <ExternalLink href={apiKeyWebsite} content={t('settings.provider.api_key.get')} />
          </XStack>
        </YStack>

        {/* API Host 配置 */}
        <YStack className="gap-2">
          <XStack className="pr-3 justify-between items-center">
            <GroupTitle>{t('settings.provider.api_host')}</GroupTitle>
          </XStack>
          <TextField>
            <TextField.Input
              className="h-12"
              placeholder={t('settings.provider.api_host.placeholder')}
              value={apiHost}
              onChangeText={text => handleProviderConfigChange('apiHost', text)}
            />
          </TextField>
        </YStack>
      </Container>

      <ApiCheckSheet
        ref={bottomSheetRef}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        selectOptions={selectOptions}
        onStartModelCheck={handleStartModelCheck}
        checkApiStatus={checkApiStatus}
      />
    </SafeAreaContainer>
  )
}
