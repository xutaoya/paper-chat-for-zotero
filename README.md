# PaperMind: 你的 Zotero 阅读器 AI 助手

[![Zotero](https://img.shields.io/badge/Zotero-7+-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg?style=flat-square)](https://www.gnu.org/licenses/agpl-3.0)
[![Latest release](https://img.shields.io/github/v/release/xutaoya/paper-chat-for-zotero?style=flat-square)](https://github.com/xutaoya/paper-chat-for-zotero/releases)
[![Fork](https://img.shields.io/badge/Fork-paper-chat-for-zotero-grey?style=flat-square)](https://github.com/syt2/paper-chat-for-zotero)

<p align="center">
  <img src="addon/content/icons/favicon.svg" alt="PaperMind" width="128" />
</p>

**PaperMind**（论文智读）是基于 [syt2/paper-chat-for-zotero](https://github.com/syt2/paper-chat-for-zotero) 的个人二创 fork。它将大语言模型直接集成进 [Zotero](https://www.zotero.org/) PDF 阅读器——不用把论文上传到网页，在阅读器侧边栏就能提问、总结、框选图表讨论。插件 ID 与上游不同，可与原版并存安装。

<p align="center">
  <img src="doc/screenshots/split-view.png" alt="阅读器分屏：左侧 PDF，右侧 AI 对话" width="1024" />
</p>

<p align="center">
  <img src="doc/screenshots/chat-panel.png" alt="对话面板与快捷操作" width="1024" />
</p>

<p align="center">
  <img src="doc/screenshots/pdf-reader-chat.png" alt="框选图表截图提问" width="1024" />
</p>

---

## 目录

- [安装](#安装)
- [配置](#配置)
- [使用](#使用)
- [功能概览](#功能概览)
- [本地开发](#本地开发)
- [许可证与致谢](#许可证与致谢)

---

## 安装

### 下载 `.xpi`

从 [Releases](https://github.com/xutaoya/paper-chat-for-zotero/releases) 下载最新 `.xpi`。

### 安装插件

Zotero → `工具` → `附加组件` → ⚙️ → **从文件安装附加组件** → 选择 `.xpi` 文件。

### 重启 Zotero

重启后插件会在启动时自动检查更新（生产构建）。

---

## 配置

打开 `设置` → **PaperMind**：

1. 选择 **服务商**（OpenAI、Claude、Gemini、DeepSeek、阿里百炼等）
2. 填写 **API Key** 和 **接口地址**，选择 **模型**
3. 点击 **测试连接** 验证

<p align="center">
  <img src="doc/screenshots/provider-settings.png" alt="服务商与模型配置" width="800" />
</p>

如需解析扫描版或复杂排版 PDF，在 MinerU 页填写 Token，并管理解析缓存：

<p align="center">
  <img src="doc/screenshots/mineru-settings.png" alt="MinerU PDF 解析配置" width="800" />
</p>

---

## 使用

1. 在 Zotero 中打开任意 PDF
2. 点击阅读器右侧工具栏的聊天图标，打开侧边栏
3. 输入问题，例如「这篇论文的核心贡献是什么？」
4. 需要全文上下文时勾选 **附加 PDF**
5. 框选图表区域可 **截图提问**，截图自动带入对话
6. 底部快捷按钮可一键触发常用 prompt（论文讲解、文献标注、标签生成等）

---

## 功能概览

| 功能 | 说明 |
| --- | --- |
| 阅读器内对话 | 打开 PDF 即聊，支持附加全文上下文 |
| 截图提问 | 框选图表区域，截图自动带入对话 |
| 多服务商 | 自备 API Key，支持自定义接口 |
| 快捷操作 | 论文讲解、文献标注、标签生成等一键 prompt |
| MinerU 解析 | 文本提取失败时自动/手动解析 PDF |
| 会话管理 | 多会话历史、轮次导航、删除单轮对话 |
| Markdown / 公式 | 流式输出，笔记导出支持 LaTeX |

**本 fork 额外改动：** 输出截断自动续写、笔记 LaTeX 公式、模型 API 测速；移除了阅读循环等用不上的功能。

**未跟进上游：** 演示文稿生成、内置 PaperChat 服务——需要请用 [上游原版](https://github.com/syt2/paper-chat-for-zotero)。

---

## 本地开发

```bash
npm install
npm run build    # 产物在 build/
npm start        # 开发调试
```

发布新版本：

```bash
npm run release
```

会创建 GitHub Release（标签 `V版本号`），并更新 `release` 标签下的 `update.json`。

---

## 许可证与致谢

[AGPL-3.0](LICENSE)（继承自上游项目）

- 原作者：[syt2/paper-chat-for-zotero](https://github.com/syt2/paper-chat-for-zotero)
- 插件模板：[zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template)
