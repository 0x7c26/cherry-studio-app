const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

config.resolver.sourceExts.push('sql')

// 添加对 @cherrystudio/ai-core 的支持
config.resolver.resolverMainFields = ['react-native', 'browser', 'main']
config.resolver.platforms = ['ios', 'android', 'native', 'web']

module.exports = config
