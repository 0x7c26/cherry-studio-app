import { BlurView } from 'expo-blur'
import React from 'react'
import { Stack, Text, View } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { formateEmoji } from '@/utils/formats'

interface EmojiAvatarProps {
  emoji?: string
  size?: number
  borderWidth?: number
  borderColor?: string
  borderRadius?: number
  blurIntensity?: number
}

const EmojiAvatar = ({
  emoji,
  size = 80,
  borderWidth = 4,
  borderColor = '$backgroundPrimary',
  borderRadius,
  blurIntensity = 80
}: EmojiAvatarProps) => {
  const { isDark } = useTheme()

  return (
    <View
      height={size}
      width={size}
      borderWidth={borderWidth}
      borderColor={borderColor}
      borderRadius={borderRadius || size / 2}
      position="relative"
      overflow="hidden"
      alignItems="center"
      justifyContent="center">
      {/* 背景模糊emoji */}
      <Stack
        height={size - borderWidth * 2}
        width={size - borderWidth * 2}
        inset={0}
        position="absolute"
        alignItems="center"
        justifyContent="center"
        scale={2}
        transformOrigin="center center">
        <Text fontSize={size * 0.7} opacity={0.3}>
          {formateEmoji(emoji)}
        </Text>
      </Stack>
      {/* BlurView模糊层 */}
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: size / 2
        }}
      />
      {/* 前景清晰emoji */}
      <Text fontSize={size * 0.5}>{formateEmoji(emoji)}</Text>
    </View>
  )
}

export default EmojiAvatar
