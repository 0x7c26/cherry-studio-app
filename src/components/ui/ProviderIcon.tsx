import { File, Paths } from 'expo-file-system/next'
import React, { useEffect, useState } from 'react'
import { Image } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { fileStorageDir } from '@/services/FileService'
import { Provider } from '@/types/assistant'
import { getProviderIcon } from '@/utils/icons/'

interface ProviderIconProps {
  provider: Provider
}

export const ProviderIcon: React.FC<ProviderIconProps> = ({ provider }) => {
  const { isDark } = useTheme()
  const [iconUri, setIconUri] = useState<string>('')
  const [version] = useState(0)

  useEffect(() => {
    const loadIcon = async () => {
      if (provider.isSystem) {
        setIconUri(getProviderIcon(provider.id, isDark))
      } else {
        const file = new File(Paths.join(fileStorageDir, `${provider.id}.png`))

        if (file.exists) {
          // Use version number for cache busting instead of timestamp
          setIconUri(`${file.uri}?v=${version}`)
        } else {
          setIconUri('')
        }
      }
    }

    loadIcon()
  }, [provider.id, provider.isSystem, isDark, version])

  if (!iconUri) {
    return null
  }

  return <Image width={20} height={20} source={{ uri: iconUri }} />
}
