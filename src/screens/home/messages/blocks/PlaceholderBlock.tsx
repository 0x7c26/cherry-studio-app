import React from 'react'
import { View } from 'react-native'
import { Spinner } from 'heroui-native'

import { MessageBlockStatus, MessageBlockType, PlaceholderMessageBlock } from '@/types/message'

interface PlaceholderBlockProps {
  block: PlaceholderMessageBlock
}

const PlaceholderBlock: React.FC<PlaceholderBlockProps> = ({ block }) => {
  if (block.status === MessageBlockStatus.PROCESSING && block.type === MessageBlockType.UNKNOWN) {
    return (
      <View className="flex-1 items-start my-2.5">
        <Spinner size="sm" color="default" />
      </View>
    )
  }
}

export default React.memo(PlaceholderBlock)
