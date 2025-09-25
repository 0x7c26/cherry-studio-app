import React, { forwardRef } from 'react'
import { Text as RNText, TextProps as RNTextProps } from 'react-native'
import { cn } from 'heroui-native'

type TextSize = 'default' | 'sm' | 'lg'

export interface TextProps extends RNTextProps {
  size?: TextSize
  className?: string
}

const sizeClassMap: Record<TextSize, string> = {
  default: 'text-[14px]',
  sm: 'text-[12px]',
  lg: 'text-[16px]'
}

const Text = forwardRef<RNText, TextProps>(({ size = 'default', className = '', ...rest }, ref) => {
  const sizeClass = sizeClassMap[size]
  const baseColor = 'text-text-primary dark:text-text-primary-dark'
  const composed = cn(baseColor, sizeClass, className)

  return <RNText ref={ref} className={composed} {...rest} />
})

Text.displayName = 'Text'

export default Text
