import React from 'react'
import { TouchableOpacity } from 'react-native'

interface IconButtonProps {
  onPress: () => void
  icon: React.ReactNode
}

export const IconButton = ({ onPress, icon }: IconButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      {icon}
    </TouchableOpacity>
  )
}
