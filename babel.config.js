module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          'react-compiler': true
        }
      ]
    ],
    plugins: [
      ['inline-import', { extensions: ['.sql'] }],
      '@babel/plugin-transform-class-static-block',
      [
        'module-resolver',
        {
          alias: {
            '@mcp-trace/trace-core': '../packages/mcp-trace/trace-core',
            '@mcp-trace/trace-node': '../packages/mcp-trace/trace-node'
          }
        }
      ]
    ]
  }
}
