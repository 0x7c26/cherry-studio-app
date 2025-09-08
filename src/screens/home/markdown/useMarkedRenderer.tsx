import { Copy } from '@tamagui/lucide-icons'
import * as Clipboard from 'expo-clipboard'
import React, { ReactNode, useMemo } from 'react'
import { StyleSheet, TextStyle, ViewStyle } from 'react-native'
import CodeHighlighter from 'react-native-code-highlighter'
import type { RendererInterface } from 'react-native-marked'
import { MarkedTokenizer, Renderer } from 'react-native-marked'
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Image, Text, View, XStack } from 'tamagui'

import { IconButton } from '@/components/ui/IconButton'
import { getCodeLanguageIcon } from '@/utils/icons/codeLanguage'

import { markdownColors } from './MarkdownStyles'
import { ExtractMathResult, useMathEquation } from './useMathEquation'

// const logger = loggerService.withContext('useMarkedRenderer')

class CustomTokenizer extends MarkedTokenizer {}

class CustomRenderer extends Renderer implements RendererInterface {
  private isDark: boolean
  private equationColor: string
  private extractInlineMathEquation: (text: string) => ExtractMathResult[]
  private extractAllMathEquation: (text: string) => ExtractMathResult[]
  private renderInlineMath: (content: string, key?: string | number) => React.JSX.Element
  private renderBlockMath: (content: string, key?: string | number) => React.JSX.Element

  constructor(
    isDark: boolean,
    extractInlineMathEquation: (text: string) => ExtractMathResult[],
    extractAllMathEquation: (text: string) => ExtractMathResult[],
    renderInlineMath: (content: string, key?: string | number) => React.JSX.Element,
    renderBlockMath: (content: string, key?: string | number) => React.JSX.Element
  ) {
    super()
    this.isDark = isDark
    this.equationColor = isDark ? markdownColors.dark.text : markdownColors.light.text
    this.extractInlineMathEquation = extractInlineMathEquation
    this.extractAllMathEquation = extractAllMathEquation
    this.renderInlineMath = renderInlineMath
    this.renderBlockMath = renderBlockMath
  }

  private async onCopy(content: string) {
    await Clipboard.setStringAsync(content)
  }

  // Override code block rendering
  code(text: string, language?: string, containerStyle?: ViewStyle, textStyle?: TextStyle): ReactNode {
    const lang = language || 'text'
    const currentColors = this.isDark ? markdownColors.dark : markdownColors.light
    return (
      <View
        key={this.getKey()}
        style={{
          gap: 10,
          paddingHorizontal: 14,
          paddingTop: 0,
          paddingBottom: 14,
          borderRadius: 12,
          ...containerStyle
        }}>
        <XStack
          paddingVertical={10}
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderColor={currentColors.codeBorder}>
          <XStack gap={8} flex={1} alignItems="center">
            {getCodeLanguageIcon(lang) && <Image source={getCodeLanguageIcon(lang)} width={18} height={18} />}
            <Text fontSize={13} lineHeight={13} color="$textSecondary">
              {lang.toUpperCase()}
            </Text>
          </XStack>
          <IconButton icon={<Copy size={16} color="$textSecondary" />} onPress={() => this.onCopy(text)} />
        </XStack>
        <CodeHighlighter
          customStyle={{ backgroundColor: 'transparent' }}
          scrollViewProps={{
            contentContainerStyle: {
              backgroundColor: 'transparent'
            },
            showsHorizontalScrollIndicator: false
          }}
          textStyle={{
            ...styles.text,
            ...textStyle
          }}
          hljsStyle={this.isDark ? atomOneDark : atomOneLight}
          language={lang}
          wrapLines={true}
          wrapLongLines={true}
          lineProps={{ style: { flexWrap: 'wrap' } }}>
          {text}
        </CodeHighlighter>
      </View>
    )
  }

  // Override inline code rendering
  codespan(text: string): ReactNode {
    // support katex
    const result = this.extractInlineMathEquation(text)

    return result.map(({ type, content }) => {
      if (type === 'text') {
        return (
          <Text key={this.getKey()} color="$green100" fontFamily="monospace">
            {content}
          </Text>
        )
      } else if (type === 'block-latex') {
        // 上面的 extractInlineMathEquation 不会解析 block latex
        return null
      } else {
        return this.renderInlineMath(content, this.getKey())
      }
    })
  }

  // Override heading rendering
  // heading(text: string | ReactNode[], styles?: TextStyle): ReactNode {
  //   const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

  //   return super.heading(text, { ...styles, color: currentColors.text })
  // }

  // Override paragraph rendering
  paragraph(children: ReactNode[], styles?: ViewStyle): ReactNode {
    const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

    return (
      <View
        key={this.getKey()}
        style={{
          marginTop: 6,
          marginBottom: 6,
          backgroundColor: 'transparent',
          ...styles
        }}>
        <Text style={{ backgroundColor: 'transparent', color: currentColors.text, fontSize: 16 }}>{children}</Text>
      </View>
    )
  }

  text(text: string | ReactNode[], styles?: TextStyle): ReactNode {
    const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

    if (typeof text === 'string') {
      // Check for block equations first
      const result = this.extractAllMathEquation(text)

      return result.map(({ type, content }) => {
        if (type === 'block-latex') {
          return this.renderBlockMath(content, this.getKey())
        } else if (type === 'inline-latex') {
          return this.renderInlineMath(content, this.getKey())
        } else {
          return super.text(content, {
            ...styles,
            color: currentColors.text
          })
        }
      })
    } else {
      return super.text(text, {
        ...styles,
        color: currentColors.text,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
      })
    }
  }

  getTextNode(children: string | ReactNode[], styles?: TextStyle): ReactNode {
    return (
      <Text selectable key={this.getKey()} style={{ ...styles, lineHeight: undefined }}>
        {children}
      </Text>
    )
  }

  // em(children: string | ReactNode[], styles?: TextStyle): ReactNode {
  //   const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

  //   return (
  //     <Text selectable key={this.getKey()} style={[styles, { color: currentColors.text }]}>
  //       {children}
  //     </Text>
  //   )
  // }

  // strong(children: string | ReactNode[], styles?: TextStyle): ReactNode {
  //   const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

  //   return (
  //     <Text selectable key={this.getKey()} style={[styles, { color: currentColors.text }]}>
  //       {children}
  //     </Text>
  //   )
  // }

  // del(children: string | ReactNode[], styles?: TextStyle): ReactNode {
  //   const currentColors = this.isDark ? markdownColors.dark : markdownColors.light

  //   return (
  //     <Text selectable key={this.getKey()} style={[styles, { color: currentColors.text }]}>
  //       {children}
  //     </Text>
  //   )
  // }

  list(
    ordered: boolean,
    li: ReactNode[],
    listStyle?: ViewStyle,
    textStyle?: TextStyle,
    startIndex?: number
  ): ReactNode {
    const currentColors = this.isDark ? markdownColors.dark : markdownColors.light
    return super.list(
      ordered,
      li,
      { ...listStyle, ...currentColors, alignItems: 'flex-start', justifyContent: 'flex-start' },
      { ...textStyle, textAlign: 'center', alignSelf: 'flex-start' },
      startIndex
    )
  }

  listItem(children: ReactNode[], styles?: ViewStyle): ReactNode {
    return super.listItem(children, {
      ...styles,
      width: '100%',
      alignItems: 'flex-start'
    })
  }
}

/**
 * A hook that provides the configuration for react-native-marked,
 * including custom tokenizers and renderers for math equations and enhanced code blocks.
 * @param isDark - Whether the theme is dark, used for styling.
 */
export const useMarkedRenderer = (isDark: boolean) => {
  const equationColor = isDark ? markdownColors.dark.text : markdownColors.light.text
  const { extractInlineMathEquation, extractAllMathEquation, renderInlineMath, renderBlockMath } =
    useMathEquation(equationColor)

  const renderer = useMemo(
    () =>
      new CustomRenderer(isDark, extractInlineMathEquation, extractAllMathEquation, renderInlineMath, renderBlockMath),
    [isDark, extractInlineMathEquation, extractAllMathEquation, renderInlineMath, renderBlockMath]
  )
  const tokenizer = useMemo(() => new CustomTokenizer(), [])

  return { renderer, tokenizer }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontFamily: 'JetbrainMono'
  }
})
