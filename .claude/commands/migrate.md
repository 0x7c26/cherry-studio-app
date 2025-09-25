<migrationGuide>
  <title>迁移到HeroUI</title>
  <section id="task-requirements">
    <heading>任务需求</heading>
    <requirement target="HeroUI-native" url="https://github.com/heroui-inc/heroui-native">
      需要将Tamagui迁移到HeroUI-native
    </requirement>
  </section>
  <section id="task-notes">
    <heading>任务须知</heading>
    <note index="1">内置组件存在 ./src/componentsV2 中 (Text, Image, HeaderBar 等)</note>
    <note index="2">icon 需要在 ./src/componentsV2/icons/LucideIcon/index.tsx 中注册</note>
    <note index="3">原 SettingsContainer、SettingsRow 等组件更改为 Container、Row</note>
    <note index="4">组件包括图标都使用 Tailwind 样式替代 style</note>
    <note index="5">不确定的组件保持现状不变</note>
    <note index="6">不确定的需要和我进行商量</note>
    <note index="7">迁移完后需要更新 migrateComponents.md 并且询问是否添加到 git，git commit 信息格式为 migrate(xxx): xxx</note>
    <note index="8">**重要**：所有颜色样式必须同时指定亮色和暗色模式</note>
    <note index="9">**重要**：图标大小使用 size prop，颜色使用 className with dark 模式</note>
    <note index="10">**重要**：HeroUI Button 使用新的组合式语法 Button.LabelContent</note>
  </section>
  <section id="component-catalog">
    <heading>组件列表（src/componentsV2）</heading>
    <category name="base">
      <component name="Text" path="src/componentsV2/base/Text" exports="default, TextProps" />
      <component name="Image" path="src/componentsV2/base/Image" exports="default, AnimatedImage, ImageProps" />
      <component name="TextField" path="src/componentsV2/base/TextField" exports="default, useTextFieldContext, TextFieldRootProps, TextFieldLabelProps, TextFieldInputProps, TextFieldInputStartContentProps, TextFieldInputEndContentProps, TextFieldDescriptionProps, TextFieldErrorMessageProps" />
      <component name="IconButton" path="src/componentsV2/base/IconButton" exports="IconButton" />
      <component name="ExternalLink" path="src/componentsV2/base/ExternalLink" exports="ExternalLink" />
    </category>
    <category name="layout">
      <component name="XStack" path="src/componentsV2/layout/XStack" exports="default, AnimatedXStack, XStackProps" />
      <component name="YStack" path="src/componentsV2/layout/YStack" exports="default, AnimatedYStack, YStackProps" />
      <component name="PressableRow" path="src/componentsV2/layout/PressableRow" exports="default, PressableRowProps" />
      <component name="Row" path="src/componentsV2/layout/Row" exports="default, RowProps" />
      <component name="RowRightArrow" path="src/componentsV2/layout/Row/RowRightArrow" exports="default" />
      <component name="Group" path="src/componentsV2/layout/Group" exports="default, GroupProps" />
      <component name="GroupTitle" path="src/componentsV2/layout/Group/GroupTitle" exports="default, GroupTitleProps" />
      <component name="Container" path="src/componentsV2/layout/Container" exports="default, ContainerProps" />
      <component name="SafeAreaContainer" path="src/componentsV2/layout/SafeAreaContainer" exports="default, SafeAreaContainerProps" />
    </category>
    <category name="interactive">
      <component name="HeaderBar" path="src/componentsV2/interactive/HeaderBar" exports="default, HeaderBarProps" />
      <component name="ModelGroup" path="src/componentsV2/interactive/ModelGroup" exports="default, ModelGroupProps" />
    </category>
    <category name="icons">
      <component name="LucideIcon" path="src/componentsV2/icons/LucideIcon" exports="default" />
    </category>
  </section>
  <section id="tailwind-theme">
    <heading>Tailwind 配色（tailwind.config.js）</heading>
    <file path="tailwind.config.js">
      <colors>
        <color name="brand" value="#00b96b" />
        <palette name="purple">
          <shade tone="100" value="#9c96f9" />
          <shade tone="20" value="#9c96f933" />
        </palette>
        <palette name="orange">
          <shade tone="100" value="#ffb26e" />
          <shade tone="20" value="#ffb26e33" />
          <shade tone="10" value="#ffb26e1a" />
        </palette>
        <palette name="blue">
          <shade tone="100" value="#6fb1fa" />
          <shade tone="20" value="#6fb1fa33" />
          <shade tone="10" value="#6fb1fa1a" />
        </palette>
        <palette name="pink">
          <shade tone="100" value="#e398c9" />
          <shade tone="20" value="#e398c933" />
        </palette>
        <palette name="red">
          <shade tone="100" value="#ff0000" />
          <shade tone="20" value="#ff000033" />
          <shade tone="10" value="#ff00001a" />
        </palette>
        <palette name="gray">
          <shade tone="80" value="#a0a1b0cc" />
          <shade tone="60" value="#a0a1b099" />
          <shade tone="40" value="#a0a1b066" />
          <shade tone="20" value="#a0a1b033" />
          <shade tone="10" value="#a0a1b01a" />
        </palette>
        <palette name="yellow">
          <shade tone="100" mode="light" value="#f2e218" />
          <shade tone="20" mode="light" value="#f2e21833" />
          <shade tone="dark-100" mode="dark" value="#f9ea42" />
          <shade tone="dark-20" mode="dark" value="#f9ea4233" />
        </palette>
        <palette name="green">
          <shade tone="100" mode="light" value="#81df94" />
          <shade tone="20" mode="light" value="#8de59e4d" />
          <shade tone="10" mode="light" value="#8de59e26" />
          <shade tone="dark-100" mode="dark" value="#acf3a6" />
          <shade tone="dark-20" mode="dark" value="#acf3a633" />
          <shade tone="dark-10" mode="dark" value="#acf3a61a" />
        </palette>
        <color name="text-delete" value="#dc3e42" />
        <color name="text-link" value="#0090ff" />
        <color name="border-color" value="rgba(0, 0, 0, 0.1)" />
        <semanticColor name="ui-card-background">
          <variant mode="light" value="#ffffff" />
          <variant mode="dark" value="#19191c" />
        </semanticColor>
        <semanticColor name="color-border-linear">
          <variant mode="light" value="#000000" />
          <variant mode="dark" value="#ffffff" />
        </semanticColor>
        <semanticColor name="background-primary">
          <variant mode="light" value="#f7f7f7" />
          <variant mode="dark" value="#121213" />
        </semanticColor>
        <semanticColor name="background-secondary">
          <variant mode="light" value="#ffffff99" />
          <variant mode="dark" value="#20202099" />
        </semanticColor>
        <semanticColor name="ui-card">
          <variant mode="light" value="#ffffff" />
          <variant mode="dark" value="#19191c" />
        </semanticColor>
        <semanticColor name="text-primary">
          <variant mode="light" value="#202020" />
          <variant mode="dark" value="#f9f9f9" />
        </semanticColor>
        <semanticColor name="text-secondary">
          <variant mode="light" value="#646464" />
          <variant mode="dark" value="#cecece" />
        </semanticColor>
        <semanticColor name="background-opacity">
          <variant mode="light" value="#ffffff" />
          <variant mode="dark" value="rgba(34,34,34,0.7)" />
        </semanticColor>
      </colors>
      <darkMode strategy="class" />
      <plugins>
        <plugin name="heroUINativePlugin" source="heroui-native/tailwind-plugin" />
      </plugins>
    </file>
  </section>
  <section id="import-guidelines">
    <heading>组件导入规范</heading>
    <rule index="1">从 index.ts 中导入，例如 import { YStack } from '@/componentsV2'</rule>
  </section>
  <section id="styling-guidelines">
    <heading>样式迁移规范</heading>
    <subsection id="color-rules">
      <heading>颜色样式规范</heading>
      <rule index="1">**必须同时指定亮色和暗色模式**</rule>
      <example>
        <good>text-text-primary dark:text-text-primary-dark</good>
        <good>bg-ui-card-background dark:bg-ui-card-background-dark</good>
        <good>text-white dark:text-black</good>
      </example>
      <example>
        <bad>text-white (只指定了亮色模式)</bad>
        <bad>bg-gray-100 (缺少暗色模式)</bad>
      </example>
      <rule index="2">使用 tailwind.config.js 中预定义的语义化颜色</rule>
      <example>
        <preferred>text-text-primary dark:text-text-primary-dark</preferred>
        <preferred>bg-ui-card-background dark:bg-ui-card-background-dark</preferred>
      </example>
    </subsection>
    <subsection id="icon-migration">
      <heading>图标迁移规范</heading>
      <rule index="1">从 @tamagui/lucide-icons 迁移到 @/componentsV2/icons/LucideIcon</rule>
      <rule index="2">新图标必须在 LucideIcon/index.tsx 中完整注册（4个步骤）</rule>
      <steps>
        <step index="1">在 import 中添加图标：import { X, Settings2 } from 'lucide-react-native'</step>
        <step index="2">调用 interopIcon：interopIcon(X)</step>
        <step index="3">创建包装组件：const XIcon = withDefaultIconClass(X)</step>
        <step index="4">导出：export { XIcon as X }</step>
      </steps>
      <example>
        <before>import { Trash2 } from '@tamagui/lucide-icons'
&lt;Trash2 size={16} color="red" /&gt;</before>
        <after>import { Trash2 } from '@/componentsV2/icons/LucideIcon'
&lt;Trash2 size={16} className="text-red-100 dark:text-red-100" /&gt;</after>
      </example>
      <rule index="3">图标样式规范</rule>
      <guideline>保持使用 size prop 设置图标大小</guideline>
      <guideline>使用 className 设置图标颜色，必须包含 dark 模式</guideline>
      <conversion>
        <from>color="red"</from>
        <to>className="text-red-100 dark:text-red-100"</to>
      </conversion>
      <conversion>
        <from>color="$textPrimary"</from>
        <to>className="text-text-primary dark:text-text-primary-dark"</to>
      </conversion>
    </subsection>
    <subsection id="heroui-button-syntax">
      <heading>HeroUI Button 新语法</heading>
      <rule index="1">使用新的组合式 Button 语法</rule>
      <example>
        <heading>Icon-only 按钮</heading>
        <before>&lt;Button chromeless circular size="$5" icon={&lt;Settings2 size={30} /&gt;} onPress={handleEdit} /&gt;</before>
        <after>&lt;Button isIconOnly onPress={handleEdit}&gt;
  &lt;Button.LabelContent&gt;
    &lt;Settings2 size={30} /&gt;
  &lt;/Button.LabelContent&gt;
&lt;/Button&gt;</after>
      </example>
      <example>
        <heading>带文字按钮</heading>
        <before>&lt;Button backgroundColor="$green10" onPress={handlePress}&gt;
  &lt;Text color="$green100"&gt;聊天&lt;/Text&gt;
&lt;/Button&gt;</before>
        <after>&lt;Button className="bg-green-10 dark:bg-green-dark-10" onPress={handlePress}&gt;
  &lt;Button.LabelContent&gt;
    &lt;Text className="text-green-100 dark:text-green-dark-100"&gt;聊天&lt;/Text&gt;
  &lt;/Button.LabelContent&gt;
&lt;/Button&gt;</after>
      </example>
      <rule index="2">Button 支持的变体</rule>
      <variants>
        <variant name="default">默认样式</variant>
        <variant name="ghost">透明背景</variant>
        <variant name="outline">边框样式</variant>
      </variants>
      <example>
        <usage>&lt;Button variant="ghost" isIconOnly&gt;...&lt;/Button&gt;</usage>
      </example>
    </subsection>
  </section>
  <section id="file-structure-guidelines">
    <heading>文件结构迁移规范</heading>
    <rule index="1">Assistant 相关组件迁移路径</rule>
    <migration>
      <from>src/components/assistant/</from>
      <to>src/componentsV2/features/Assistant/</to>
    </migration>
    <migration>
      <from>src/components/assistant/market/</from>
      <to>src/componentsV2/features/Assistant/</to>
    </migration>
    <examples>
      <example>
        <before>src/components/assistant/AssistantItem.tsx</before>
        <after>src/componentsV2/features/Assistant/AssistantItem.tsx</after>
      </example>
      <example>
        <before>src/components/assistant/market/AssistantItemSheet.tsx</before>
        <after>src/componentsV2/features/Assistant/AssistantItemSheet.tsx</after>
      </example>
    </examples>
    <rule index="2">组件导入路径规范</rule>
    <guideline>componentsV2 组件使用统一导入：import { Text, XStack, YStack } from '@/componentsV2'</guideline>
    <guideline>同目录组件使用相对路径：import EmojiAvatar from './EmojiAvatar'</guideline>
    <guideline>子组件导入父级组件：import AssistantItemCard from '../AssistantItemCard'</guideline>
  </section>
  <section id="tailwind-conversion-reference">
    <heading>Tailwind 类名转换对照表</heading>
    <subsection id="layout-props">
      <heading>布局属性转换</heading>
      <conversion>
        <from>flex={1}</from>
        <to>flex-1</to>
      </conversion>
      <conversion>
        <from>justifyContent="center"</from>
        <to>justify-center</to>
      </conversion>
      <conversion>
        <from>alignItems="center"</from>
        <to>items-center</to>
      </conversion>
      <conversion>
        <from>flexDirection="row"</from>
        <to>flex-row</to>
      </conversion>
      <conversion>
        <from>flexWrap="wrap"</from>
        <to>flex-wrap</to>
      </conversion>
      <conversion>
        <from>position="absolute"</from>
        <to>absolute</to>
      </conversion>
      <conversion>
        <from>position="relative"</from>
        <to>relative</to>
      </conversion>
    </subsection>
    <subsection id="spacing-props">
      <heading>间距属性转换</heading>
      <conversion>
        <from>padding={10}</from>
        <to>p-2.5</to>
      </conversion>
      <conversion>
        <from>paddingVertical={10}</from>
        <to>py-2.5</to>
      </conversion>
      <conversion>
        <from>paddingHorizontal={25}</from>
        <to>px-6</to>
      </conversion>
      <conversion>
        <from>margin={16}</from>
        <to>m-4</to>
      </conversion>
      <conversion>
        <from>marginTop={20}</from>
        <to>mt-5</to>
      </conversion>
      <conversion>
        <from>gap={8}</from>
        <to>gap-2</to>
      </conversion>
      <conversion>
        <from>gap={16}</from>
        <to>gap-4</to>
      </conversion>
    </subsection>
    <subsection id="typography-props">
      <heading>文字属性转换</heading>
      <conversion>
        <from>fontSize={14}</from>
        <to>text-sm</to>
      </conversion>
      <conversion>
        <from>fontSize={16}</from>
        <to>text-base</to>
      </conversion>
      <conversion>
        <from>fontSize={18}</from>
        <to>text-lg</to>
      </conversion>
      <conversion>
        <from>fontSize={22}</from>
        <to>text-[22px]</to>
      </conversion>
      <conversion>
        <from>fontWeight="bold"</from>
        <to>font-bold</to>
      </conversion>
      <conversion>
        <from>textAlign="center"</from>
        <to>text-center</to>
      </conversion>
      <conversion>
        <from>lineHeight={20}</from>
        <to>leading-5</to>
      </conversion>
    </subsection>
    <subsection id="sizing-props">
      <heading>尺寸属性转换</heading>
      <conversion>
        <from>width="100%"</from>
        <to>w-full</to>
      </conversion>
      <conversion>
        <from>height={200}</from>
        <to>h-[200px]</to>
      </conversion>
      <conversion>
        <from>borderRadius={16}</from>
        <to>rounded-2xl</to>
      </conversion>
      <conversion>
        <from>borderRadius={30}</from>
        <to>rounded-[30px]</to>
      </conversion>
    </subsection>
  </section>
</migrationGuide>
