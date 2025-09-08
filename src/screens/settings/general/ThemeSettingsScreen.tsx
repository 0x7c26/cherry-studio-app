import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { SettingContainer } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { themeOptions } from '@/config/theme'
import { useSettings } from '@/hooks/useSettings'

export default function ThemeSettingsScreen() {
  const { t } = useTranslation()
  const { theme: currentTheme, setTheme: setCurrentTheme } = useSettings()

  return (
    <SafeAreaContainer style={{ flex: 1 }}>
      <HeaderBar title={t('settings.general.theme.title')} />
      <SettingContainer>
        <YStack flex={1} gap={12} paddingHorizontal={16}>
          {themeOptions.map(opt => (
            <XStack
              key={opt.value}
              onPress={() => setCurrentTheme(opt.value)}
              alignItems="center"
              justifyContent="space-between"
              padding={16}
              borderRadius={8}
              backgroundColor="$uiCardBackground"
              pressStyle={{ opacity: 0.7 }}>
              <XStack alignItems="center">
                <Text fontSize={16}>{t(opt.label)}</Text>
              </XStack>

              <XStack
                width={20}
                height={20}
                borderRadius={10}
                borderWidth={2}
                borderColor={currentTheme === opt.value ? '$textPrimary' : '$textSecondary'}
                alignItems="center"
                justifyContent="center">
                {currentTheme === opt.value && (
                  <XStack width={10} height={10} borderRadius={5} backgroundColor="$textPrimary" />
                )}
              </XStack>
            </XStack>
          ))}
        </YStack>
      </SettingContainer>
    </SafeAreaContainer>
  )
}
