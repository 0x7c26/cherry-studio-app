import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import React from 'react'

import BasicDataSettingsScreen from '@/screens/settings/data/BasicDataSettingsScreen'
import DataSettingsScreen from '@/screens/settings/data/DataSettingsScreen'
import JoplinSettingsScreen from '@/screens/settings/data/JoplinSettingsScreen'
import LandropSettingsScreen from '@/screens/settings/data/Landrop/LandropSettingsScreen'
import NotionSettingsScreen from '@/screens/settings/data/NotionSettingsScreen'
import NutstoreLoginScreen from '@/screens/settings/data/NutstoreLoginScreen'
import ObsidianSettingsScreen from '@/screens/settings/data/ObsidianSettingsScreen'
import SiyuanSettingsScreen from '@/screens/settings/data/SiyuanSettingsScreen'
import WebDavConfigScreen from '@/screens/settings/data/WebDavConfigScreen'
import WebDavScreen from '@/screens/settings/data/WebDavScreen'
import YuqueSettingsScreen from '@/screens/settings/data/YuqueSettingsScreen'

export type DataSourcesStackParamList = {
  DataSettingsScreen: undefined
  BasicDataSettingsScreen: undefined
  LandropSettingsScreen: undefined
  NutstoreLoginScreen: undefined
  NotionSettingsScreen: undefined
  YuqueSettingsScreen: undefined
  JoplinSettingsScreen: undefined
  ObsidianSettingsScreen: undefined
  SiyuanSettingsScreen: undefined
  WebDavScreen: undefined
  WebDavConfigScreen: undefined
}

const Stack = createStackNavigator<DataSourcesStackParamList>()

export default function DataSourcesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureResponseDistance: 9999,
        ...TransitionPresets.SlideFromRightIOS
      }}>
      <Stack.Screen name="DataSettingsScreen" component={DataSettingsScreen} />
      <Stack.Screen name="BasicDataSettingsScreen" component={BasicDataSettingsScreen} />
      <Stack.Screen name="LandropSettingsScreen" component={LandropSettingsScreen} />
      <Stack.Screen name="NutstoreLoginScreen" component={NutstoreLoginScreen} />
      <Stack.Screen name="NotionSettingsScreen" component={NotionSettingsScreen} />
      <Stack.Screen name="YuqueSettingsScreen" component={YuqueSettingsScreen} />
      <Stack.Screen name="JoplinSettingsScreen" component={JoplinSettingsScreen} />
      <Stack.Screen name="ObsidianSettingsScreen" component={ObsidianSettingsScreen} />
      <Stack.Screen name="SiyuanSettingsScreen" component={SiyuanSettingsScreen} />
      <Stack.Screen name="WebDavScreen" component={WebDavScreen} />
      <Stack.Screen name="WebDavConfigScreen" component={WebDavConfigScreen} />
    </Stack.Navigator>
  )
}
