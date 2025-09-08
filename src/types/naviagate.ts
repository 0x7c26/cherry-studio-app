import { DrawerNavigationProp } from '@react-navigation/drawer'
import { StackNavigationProp } from '@react-navigation/stack'

import { AssistantStackParamList } from '@/navigators/AssistantStackNavigator'
import { HomeStackParamList } from '@/navigators/HomeStackNavigator'
import { AboutStackParamList } from '@/navigators/settings/AboutStackNavigator'
import { DataSourcesStackParamList } from '@/navigators/settings/DataSourcesStackNavigator'
import { GeneralSettingsStackParamList } from '@/navigators/settings/GeneralSettingsStackNavigator'
import { ProvidersStackParamList } from '@/navigators/settings/ProvidersStackNavigator'
import { WebSearchStackParamList } from '@/navigators/settings/WebSearchStackNavigator'
import { SettingsStackParamList } from '@/navigators/SettingsStackNavigator'

// Root Stack Navigator (MainStackNavigator)
export type RootStackParamList = {
  WelcomeScreen: undefined
  HomeScreen: { screen: string; params: { topicId: string } } | undefined // This is actually the AppDrawerNavigator
  // ChatScreen: { topicId: string }
  // TopicScreen: undefined
  // AssistantScreen: undefined
  // AssistantMarketScreen: undefined
  // AssistantDetailScreen: { assistantId: string; tab?: string }
  // Settings: { screen: string; params?: any } | undefined
}

// App Drawer Navigator
export type AppDrawerParamList = {
  Home:
    | { screen: 'ChatScreen'; params: { topicId: string } }
    | { screen: 'TopicScreen' }
    | { screen: 'SettingsScreen' }
    | { screen: 'GeneralSettings'; params?: any }
    | { screen: 'AssistantSettings'; params?: any }
    | { screen: 'ProvidersSettings'; params?: any }
    | { screen: 'DataSourcesSettings'; params?: any }
    | { screen: 'WebSearchSettings'; params?: any }
    | { screen: 'AboutSettings'; params?: any }
    | undefined
  Assistant:
    | { screen: 'AssistantScreen' }
    | { screen: 'AssistantMarketScreen' }
    | { screen: 'AssistantDetailScreen'; params: { assistantId: string; tab?: string } }
    | undefined
}

// Navigation Props
export type RootNavigationProps = StackNavigationProp<RootStackParamList>
export type DrawerNavigationProps = DrawerNavigationProp<AppDrawerParamList>

// Nested Navigator Props
export type HomeNavigationProps = StackNavigationProp<HomeStackParamList>
export type AssistantNavigationProps = StackNavigationProp<AssistantStackParamList>
export type SettingsNavigationProps = StackNavigationProp<SettingsStackParamList>

// Settings Sub-Navigator Props
export type GeneralSettingsNavigationProps = StackNavigationProp<GeneralSettingsStackParamList>
export type ProvidersNavigationProps = StackNavigationProp<ProvidersStackParamList>
export type DataSourcesNavigationProps = StackNavigationProp<DataSourcesStackParamList>
export type WebSearchNavigationProps = StackNavigationProp<WebSearchStackParamList>
export type AboutNavigationProps = StackNavigationProp<AboutStackParamList>

// Legacy compatibility
export type NavigationProps = RootNavigationProps
