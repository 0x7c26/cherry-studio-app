import { useNavigation } from '@react-navigation/native'
import { ChevronRight } from '@tamagui/lucide-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack } from 'tamagui'

import { WebsearchProviderIcon } from '@/components/ui/WebsearchIcon'
import { WebSearchNavigationProps } from '@/types/naviagate'
import { WebSearchProvider } from '@/types/websearch'

import { PressableSettingRow } from '..'
interface WebsearchProviderRowProps {
  provider: WebSearchProvider
  // google, bing or baidu not need expended
  need_config?: boolean
}

export const WebsearchProviderRow = ({ provider, need_config }: WebsearchProviderRowProps) => {
  const { t } = useTranslation()
  const navigation = useNavigation<WebSearchNavigationProps>()

  const onPress = () => {
    if (!need_config) return
    navigation.navigate('WebSearchProviderSettingsScreen', { providerId: provider.id })
  }

  return (
    <PressableSettingRow onPress={onPress}>
      <XStack gap={5}>
        <WebsearchProviderIcon provider={provider} />
        <Text>{provider.name}</Text>
      </XStack>
      <XStack gap={10} justifyContent="center" alignItems="center">
        {provider.apiKey && (
          <Text
            borderRadius={8}
            borderWidth={0.5}
            backgroundColor="$green10"
            borderColor="$green20"
            color="$green100"
            paddingVertical={2}
            paddingHorizontal={8}
            justifyContent="center"
            alignItems="center"
            fontSize={12}>
            {t('common.added')}
          </Text>
        )}
        {need_config && <ChevronRight />}
      </XStack>
    </PressableSettingRow>
  )
}
