# 🍒 Welcome to Cherry Studio App

English | [中文](./README-zh.md)

🍒 Cherry Studio App —— The official mobile version of Cherry Studio, bringing powerful LLMs (Large Language Models) interaction to your iOS and Android devices.

🌟 **Support the Project:** [Sponsor](https://github.com/CherryHQ/cherry-studio/blob/main/docs/sponsor.md) | Give the repo a Star!

## ✨ Key Features

- **Multi-LLM Provider Support**: (Gradually integrating) OpenAI, Gemini, Anthropic, and more.
- **AI Assistants & Conversations**: Access preset assistants and engage in smooth multi-model conversations.
- **Mobile Optimized**: Designed specifically for iOS/Android with light/dark theme support.
- **Core Tools**: Conversation management, history search, data migration.

## 🛠️ Tech Stack

- **Framework**: Expo React Native
- **Package Manager**: Yarn
- **UI**: Tamagui
- **Routing**: React Navigation
- **State Management**: Redux Toolkit

## 🚀 Development

> Related development documentation is in the docs folder

1. **Clone the repository**

   ```bash
    git clone https://github.com/CherryHQ/cherry-studio-app.git
   ```

2. **Enter the directory**

   ```bash
    cd cherry-studio-app
   ```

3. **Install dependencies**

   ```bash
     yarn install
   ```

4. **Generate database**

```bash
npx drizzle-kit generate
```

5. **Start the application**

iOS:

```bash
npx expo prebuild -p ios

cd ios # Add self-signed certificate

npx expo run:ios -d
```

Android:

```bash
npx expo prebuild -p android
npx expo run:android -d
```

> Please use physical devices or simulators for development, do not use Expo Go
