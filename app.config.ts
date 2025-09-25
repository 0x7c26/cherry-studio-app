import 'tsx/cjs'
export default {
  expo: {
    name: 'Cherry Studio',
    slug: 'cherry-studio',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/images/favicon.png',
    scheme: 'cherry-studio',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    entryPoint: './src/app.js',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anonymous.cherrystudio',
      userInterfaceStyle: 'automatic'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './src/assets/images/adaptive-icon.png',
        backgroundColor: '#F65D5D'
      },
      edgeToEdgeEnabled: true,
      package: 'com.anonymous.cherrystudio',
      userInterfaceStyle: 'automatic',
      predictiveBackGestureEnabled: true
    },
    plugins: [
      ['expo-build-properties', { ios: { deploymentTarget: '15.5' } }],
      [
        'expo-splash-screen',
        {
          image: './src/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            image: './src/assets/images/splash-icon.png',
            backgroundColor: '#000000'
          },
          ios: {
            splash: {
              image: './src/assets/images/splash-icon.png',
              backgroundColor: '#ffffff',
              resizeMode: 'contain',
              dark: {
                image: './src/assets/images/splash-icon.png',
                backgroundColor: '#000000'
              }
            }
          },
          android: {
            splash: {
              image: './src/assets/images/splash-icon.png',
              backgroundColor: '#ffffff',
              resizeMode: 'contain',
              dark: {
                image: './src/assets/images/splash-icon.png',
                backgroundColor: '#000000'
              }
            }
          }
        }
      ],
      'expo-localization',
      'expo-asset',
      [
        'expo-font',
        {
          fonts: ['./src/assets/fonts/JetBrainsMono-Regular.ttf']
        }
      ],
      'expo-web-browser',
      'expo-sqlite',
      [
        'expo-document-picker',
        {
          iCloudContainerEnvironment: 'Production'
        }
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you share them with your friends.'
        }
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Allow Cherry Studio App to access your camera',
          // microphonePermission: 'Allow Cherry Studio App to access your microphone',
          recordAudioAndroid: true
        }
      ],
      [
        'expo-media-library',
        {
          photosPermission: 'Allow Cherry Studio App to save images to your photo library.',
          savePhotosPermission: 'Allow Cherry Studio App to save images to your photo library.',
          isAccessMediaLocationEnabled: true
        }
      ],
      ['react-native-compressor'],
      ["react-native-edge-to-edge",
        {
          "android": {
            "parentTheme": "Material3",
            "enforceNavigationBarContrast": false
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
      tsconfigPaths: true
    },
    extra: {
      eas: {
        projectId: '80096eaf-3ad0-4b87-a466-15f04da1bacc'
      }
    }
  }
}
