import '@/i18n'
import 'react-native-reanimated'
import '../global.css'

import { HeroUINativeProvider } from 'heroui-native'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { NavigationContainer } from '@react-navigation/native'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { useFonts } from 'expo-font'
import * as Localization from 'expo-localization'
import * as SplashScreen from 'expo-splash-screen'
import { SQLiteProvider } from 'expo-sqlite'
import React, { Suspense, useEffect } from 'react'
import { ActivityIndicator } from 'react-native'
import { SystemBars } from 'react-native-edge-to-edge'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { Provider, useSelector } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { getDataBackupProviders } from '@/config/backup'
import { getWebSearchProviders } from '@/config/websearchProviders'
import { useTheme } from '@/hooks/useTheme'
import { loggerService } from '@/services/LoggerService'
import store, { persistor, RootState, useAppDispatch } from '@/store'
import { setInitialized } from '@/store/app'

import { DATABASE_NAME, db, expoDb } from '../db'
import { upsertAssistants } from '../db/queries/assistants.queries'
import { upsertDataBackupProviders } from '../db/queries/backup.queries'
import { upsertProviders } from '../db/queries/providers.queries'
import { upsertWebSearchProviders } from '../db/queries/websearchProviders.queries'
import migrations from '../drizzle/migrations'
import { getSystemAssistants } from './config/assistants'
import { SYSTEM_PROVIDERS } from './config/providers'
import { DialogProvider } from './hooks/useDialog'
import { ToastProvider } from './hooks/useToast'
import MainStackNavigator from './navigators/MainStackNavigator'
import { storage } from './utils'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()
const logger = loggerService.withContext('DataBase Assistants')

// 数据库初始化组件
function DatabaseInitializer() {
  const { success, error } = useMigrations(db, migrations)
  const initialized = useSelector((state: RootState) => state.app.initialized)
  const dispatch = useAppDispatch()
  const [loaded] = useFonts({
    JetbrainMono: require('./assets/fonts/JetBrainsMono-Regular.ttf')
  })

  useDrizzleStudio(expoDb)

  useEffect(() => {
    const initializeApp = async () => {
      if (initialized) return

      try {
        logger.info('First launch, initializing app data...')
        const systemAssistants = getSystemAssistants()
        // const builtInAssistants = getBuiltInAssistants()
        await upsertAssistants([...systemAssistants])
        await upsertProviders(SYSTEM_PROVIDERS)
        const websearchProviders = getWebSearchProviders()
        await upsertWebSearchProviders(websearchProviders)
        const dataBackupProviders = getDataBackupProviders()
        await upsertDataBackupProviders(dataBackupProviders)
        storage.set('language', Localization.getLocales()[0]?.languageTag)
        dispatch(setInitialized(true))
        logger.info('App data initialized successfully.')
      } catch (e) {
        logger.error('Failed to initialize app data', e)
      }
    }

    const handleMigrations = async () => {
      if (success && loaded) {
        logger.info('Migrations completed successfully', expoDb.databasePath)
        await initializeApp()
      } else if (error) {
        logger.error('Migrations failed', error)
      }
    }

    handleMigrations()
  }, [success, error, initialized, dispatch, loaded])

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return null
}

// 主题和导航组件
function ThemedApp() {
  const { themeSetting, reactNavigationTheme, isDark } = useTheme()

  return (
    <HeroUINativeProvider config={{ colorScheme: themeSetting }}>
      <KeyboardProvider>
        <NavigationContainer theme={reactNavigationTheme}>
          <SystemBars style={isDark ? 'light' : 'dark'} />
          <DatabaseInitializer />
          <DialogProvider>
            <ToastProvider>
              <BottomSheetModalProvider>
                <MainStackNavigator />
              </BottomSheetModalProvider>
            </ToastProvider>
          </DialogProvider>
        </NavigationContainer>
      </KeyboardProvider>
    </HeroUINativeProvider>
  )
}

// Redux 状态管理组件
function AppWithRedux() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size="large" />} persistor={persistor}>
        <ThemedApp />
      </PersistGate>
    </Provider>
  )
}

// 根组件 - 只负责最基础的 Provider 设置
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <SQLiteProvider databaseName={DATABASE_NAME} options={{ enableChangeListener: true }} useSuspense>
          <AppWithRedux />
        </SQLiteProvider>
      </Suspense>
    </GestureHandlerRootView>
  )
}
