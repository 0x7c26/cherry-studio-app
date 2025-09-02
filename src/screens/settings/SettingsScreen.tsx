import { useNavigation } from '@react-navigation/native'
import { ChevronRight, Cloud, Globe, HardDrive, Info, Package, Settings2 } from '@tamagui/lucide-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import { Avatar, Text, useTheme, XStack, YStack } from 'tamagui'

import { PressableSettingRow, SettingContainer, SettingGroup, SettingGroupTitle } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { useSettings } from '@/hooks/useSettings'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { SettingsNavigationProps } from '@/types/naviagate'

interface SettingItemConfig {
  title: string
  screen: string
  icon: React.ReactElement | string
  specificScreen?: string // For nested navigation to specific screen
}

interface SettingGroupConfig {
  title?: string
  items: SettingItemConfig[]
}

export default function SettingsScreen() {
  const { t } = useTranslation()
  const { avatar, userName } = useSettings()
  const panGesture = useSwipeGesture()

  const settingsItems: SettingGroupConfig[] = [
    {
      items: [
        {
          title: userName,
          screen: 'AboutSettings',
          specificScreen: 'PersonalScreen',
          icon: avatar
        }
      ]
    },
    {
      title: t('settings.modelAndService'),
      items: [
        {
          title: t('settings.provider.title'),
          screen: 'ProvidersSettings',
          specificScreen: 'ProviderListScreen',
          icon: <Cloud size={24} />
        },
        {
          title: t('settings.assistant.title'),
          screen: 'AssistantSettings',
          specificScreen: 'AssistantSettingsScreen',
          icon: <Package size={24} />
        },
        {
          title: t('settings.websearch.title'),
          screen: 'WebSearchSettings',
          specificScreen: 'WebSearchSettingsScreen',
          icon: <Globe size={24} />
        }
      ]
    },
    {
      title: t('settings.title'),
      items: [
        {
          title: t('settings.general.title'),
          screen: 'GeneralSettings',
          specificScreen: 'GeneralSettingsScreen',
          icon: <Settings2 size={24} />
        },
        {
          title: t('settings.data.title'),
          screen: 'DataSourcesSettings',
          specificScreen: 'DataSettingsScreen',
          icon: <HardDrive size={24} />
        }
      ]
    },
    {
      title: t('settings.dataAndSecurity'),
      items: [
        {
          title: t('settings.about.title'),
          screen: 'AboutSettings',
          specificScreen: 'AboutScreen',
          icon: <Info size={24} />
        }
      ]
    }
  ]

  return (
    <SafeAreaContainer style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View collapsable={false} style={{ flex: 1 }}>
          <HeaderBar title={t('settings.title')} />

          <SettingContainer>
            <YStack gap={24} flex={1}>
              {settingsItems.map((group, index) => (
                <Group key={index} title={group.title}>
                  {group.items.map((item, index) => (
                    <SettingItem
                      key={index}
                      title={item.title}
                      screen={item.screen}
                      icon={item.icon}
                      specificScreen={item.specificScreen}
                    />
                  ))}
                </Group>
              ))}
            </YStack>
          </SettingContainer>
        </View>
      </GestureDetector>
    </SafeAreaContainer>
  )
}

interface SettingGroupProps {
  title?: string
  children: React.ReactNode
}

function Group({ title, children }: SettingGroupProps) {
  return (
    <YStack gap={8}>
      {title && <SettingGroupTitle>{title}</SettingGroupTitle>}
      <SettingGroup>{children}</SettingGroup>
    </YStack>
  )
}

interface SettingItemProps {
  title: string
  screen: string
  icon: React.ReactElement | string
  specificScreen?: string
}

function SettingItem({ title, screen, icon, specificScreen }: SettingItemProps) {
  const navigation = useNavigation<SettingsNavigationProps>()
  const theme = useTheme()

  const renderIcon = () => {
    if (typeof icon === 'string') {
      return (
        <Avatar circular size={40}>
          <Avatar.Image accessibilityLabel={title} src={icon || require('@/assets/images/favicon.png')} />
          <Avatar.Fallback delayMs={600} backgroundColor={theme.blue10} />
        </Avatar>
      )
    }

    return icon
  }

  const handlePress = () => {
    if (specificScreen) {
      // Navigate to nested screen with initial route
      navigation.navigate(screen as any, { screen: specificScreen })
    } else {
      // Navigate directly to the stack navigator
      navigation.navigate(screen as any)
    }
  }

  return (
    <PressableSettingRow onPress={handlePress}>
      <XStack alignItems="center" gap={12}>
        {renderIcon()}
        <YStack>
          <Text fontWeight="bold">{title}</Text>
        </YStack>
      </XStack>
      <ChevronRight size={20} color="$textSecondary" />
    </PressableSettingRow>
  )
}
