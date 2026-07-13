# WebLLM WebUI

> **Private, offline-capable AI chat that runs 100% in your browser.** No backend, no API keys, no data collection. Powered by [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) and WebGPU.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)
![WebLLM](https://img.shields.io/badge/WebLLM-0.2-6c5ce7.svg)

## ✨ Features

- **100% Local Inference** - Runs entirely in browser via WebGPU, no server
- **ChatGPT-style UI** - Dark theme, responsive, smooth animations
- **Multiple Conversations** - Create, rename, delete, search chats
- **Persistent History** - LocalStorage sync, import/export JSON
- **Streaming Responses** - Real-time token streaming, stop/regenerate
- **Rich Markdown** - Tables, code blocks, lists, blockquotes, links, images
- **Syntax Highlighting** - highlight.js + copy code button
- **Model Selector** - Llama 3, Qwen 2.5, Gemma 2, Phi-3.5, Mistral, DeepSeek
- **Advanced Settings** - Temperature, Top-P, Max Tokens, System Prompt
- **Productivity** - Copy message, edit prompt, retry generation, keyboard shortcuts
- **Mobile Ready** - Fully responsive with collapsible sidebar
- **PWA Ready** - Manifest + offline caching

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/yourname/webllm-webui.git
cd webllm-webui

# 2. Install
npm install

# 3. Run dev server
npm run dev

# 4. Open http://localhost:5173
