import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { useColorScheme } from 'react-native'
import { useSelector } from 'react-redux'

import { RootState } from '@/store'
import { ThemeMode } from '@/types'

export function useTheme() {
  const systemColorScheme = useColorScheme()
  const themeSetting = useSelector((state: RootState) => state.settings.theme)

  const settedTheme = themeSetting === ThemeMode.system ? systemColorScheme : themeSetting
  const activeTheme = settedTheme === ThemeMode.dark ? 'dark' : 'light'
  const reactNavigationTheme = activeTheme === 'dark' ? DarkTheme : DefaultTheme
  const isDark = activeTheme === 'dark'

  return { themeSetting, settedTheme, activeTheme, reactNavigationTheme, isDark }
}
