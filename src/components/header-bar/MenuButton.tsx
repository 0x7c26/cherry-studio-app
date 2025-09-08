// components/left-section.tsx
import { Menu } from '@tamagui/lucide-icons'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Button } from 'tamagui'

interface MenuButtonProps {
  onMenuPress: () => void
}

export const MenuButton = ({ onMenuPress }: MenuButtonProps) => {
  return (
    <TouchableOpacity onPress={onMenuPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Button size={24} circular icon={<Menu size={24} />} unstyled />
    </TouchableOpacity>
  )
}
