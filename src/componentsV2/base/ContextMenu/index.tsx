import { BottomSheetModal } from '@gorhom/bottom-sheet'
import React, { FC, useRef } from 'react'
import { Pressable } from 'react-native'
import { SFSymbol } from 'sf-symbols-typescript'
import { ContextMenu as IOSContextMenu, Host, Button } from '@expo/ui/swift-ui'

import { isAndroid, isIOS } from '@/utils/device'
import SelectionSheet from '../SelectionSheet'

export interface ContextMenuListProps {
  title: string
  iOSIcon?: SFSymbol
  androidIcon?: React.ReactNode
  destructive?: boolean
  color?: string
  backgroundColor?: string
  onSelect: () => void
}

export interface ContextMenuProps {
  children: React.ReactNode
  disableContextMenu?: boolean
  borderRadius?: number
  /** 解决子元素有ScrollView时无法横向滚动问题 */
  withHighLight?: boolean
  onPress?: () => void
  list: ContextMenuListProps[]
}

export const ContextMenu: FC<ContextMenuProps> = ({
  children,
  onPress = () => {},
  list,
  disableContextMenu = false,
  borderRadius = 0,
  withHighLight = true
}) => {
  const selectionSheetRef = useRef<BottomSheetModal>(null)

  if (isIOS) {
    const TriggerContent = withHighLight ? (
      <Pressable
        onPress={onPress}
        onLongPress={() => {}}
        unstable_pressDelay={50}
        delayLongPress={350}
        className="active:opacity-70"
        style={{
          borderRadius
        }}>
        {children}
      </Pressable>
    ) : (
      children
    )

    if (disableContextMenu) {
      return TriggerContent
    }

    return (
      <Host>
        <IOSContextMenu activationMethod="longPress">
          <IOSContextMenu.Items>
            {list.map(item => (
              <Button key={item.title} systemImage={item.iOSIcon} onPress={item.onSelect}>
                {item.title}
              </Button>
            ))}
          </IOSContextMenu.Items>
          <IOSContextMenu.Trigger>{TriggerContent}</IOSContextMenu.Trigger>
        </IOSContextMenu>
      </Host>
    )
  }

  if (isAndroid) {
    const openBottomSheet = () => {
      if (disableContextMenu) return
      selectionSheetRef.current?.present()
    }

    const closeBottomSheet = () => {
      selectionSheetRef.current?.dismiss()
    }

    const onAndroidSelect = (fn: () => void) => {
      closeBottomSheet()
      fn()
    }

    return (
      <>
        <Pressable
          android_disableSound={true}
          android_ripple={{ color: '$backgroundGray' }}
          unstable_pressDelay={50}
          delayLongPress={400}
          onPress={onPress}
          onLongPress={openBottomSheet}
          className="active:opacity-70"
          style={{
            borderRadius
          }}>
          {children}
        </Pressable>

        <SelectionSheet
          ref={selectionSheetRef}
          items={list.map(item => ({
            key: item.title,
            label: item.title,
            icon: item.androidIcon,
            color: item.color,
            backgroundColor: item.backgroundColor,
            onSelect: () => onAndroidSelect(item.onSelect)
          }))}
        />
      </>
    )
  }
}
