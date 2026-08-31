pref-title = PaperMind 设置

pref-model = 模型

pref-advanced-options = 高级选项

pref-max-tokens = 最大Token数

pref-temperature = 温度

pref-system-prompt = 系统提示词

pref-extra-request-body = 额外请求体

pref-model-extra-request-body = 模型额外请求体

pref-extra-request-body-invalid = 额外请求体必须是 JSON 对象

pref-model-extra-request-body-invalid = 模型额外请求体必须是对象，且每个模型的值都必须是 JSON 对象

pref-invalid-json = JSON 格式无效

pref-providers = 服务提供商

pref-add-provider = + 添加自定义

pref-api-key = API 密钥

pref-base-url = 接口地址

pref-show-key = 显示

pref-hide-key = 隐藏

pref-refresh-models = 刷新

pref-test-connection = 测试连接

pref-delete-provider = 删除提供商

pref-active-provider = 当前使用的提供商

pref-current-provider = 当前:

pref-testing = 测试中...

pref-test-success = 连接成功！

pref-test-failed = 连接失败

pref-provider-not-ready = 提供商未配置

pref-provider-configured = 已配置

pref-provider-active = 当前服务商

pref-fetching-models = 正在获取模型列表...

pref-models-loaded = 已加载 { $count } 个模型

pref-fetch-models-failed = 获取模型列表失败

pref-enter-provider-name = 请输入提供商名称:

pref-model-list = 模型列表

pref-add-model = + 添加模型

pref-enter-model-id = 请输入模型ID:

pref-model-custom = 自定义

pref-model-speed-test = 测速

pref-model-speed-testing = 测试中...

pref-model-speed-failed = 失败

pref-model-speed-result = { $latency }ms

pref-model-speed-unsupported = 此服务商不支持测速

pref-model-exists = 该模型已存在

pref-pdf-settings = PDF 设置

pref-pdf-parsing-settings = PDF 与解析

pref-web-search-settings = 网络搜索

pref-use-exa-web-search = 启用 Exa 网络搜索

pref-exa-api-key = Exa API Key

pref-exa-test = 测试连接

pref-exa-test-running = 正在测试 Exa API Key…

pref-exa-pane-title = Exa 搜索

pref-exa-pane-desc = 配置 Exa API 后，本地 web_search 会优先使用 Exa 进行高质量网页检索。

pref-api-apply-link = 点击去申请

pref-ui-settings = 界面

pref-chat-ui-font-scale = 聊天面板缩放

pref-chat-ui-font-scale-desc = 调整阅读器侧边栏与浮动聊天窗口中的文字、表格和控件大小。默认 100%，范围 80%–180%。

pref-upload-raw-pdf = 文本提取失败时上传原始 PDF

pref-upload-raw-pdf-desc = 启用后，若文本提取失败将上传原始 PDF 给 AI，这可能会消耗大量 token。

pref-use-mineru-on-failure = 文本提取失败时使用 MinerU 解析

pref-mineru-auto-cache-on-import = 导入文献时自动开始 MinerU 预解析

pref-mineru-auto-cache-on-import-desc = 新导入或新增的 PDF 附件会在后台自动排队解析并写入 MinerU 缓存；需已填写 MinerU Token。

pref-mineru-api-token = MinerU Token

pref-mineru-test = 测试连接

pref-mineru-test-running = 正在测试 MinerU Token…

pref-mineru-pane-title = MinerU 解析

pref-mineru-pane-desc = 在本地 PDF 文本提取失败时，可改用 MinerU 在线 API 解析；下方可展开管理解析缓存。

pref-mineru-cache-title = 管理 MinerU 缓存

pref-mineru-cache-library-root = 我的文献库

pref-mineru-cache-tags-title = 标签

pref-mineru-cache-tags-summary = 有标签 { $tagged }  无标签 { $untagged }

pref-mineru-cache-tags-empty = 当前范围内没有标签

pref-mineru-cache-tag-filter = 筛选标签
    .placeholder = 筛选标签

pref-mineru-cache-search = 搜索条目
    .placeholder = 搜索条目

pref-mineru-cache-summary = { $ready } / { $total }

pref-mineru-cache-start-all = 全部开始

pref-mineru-cache-start-selected = 解析所选

pref-mineru-cache-start-selected-none = 请先勾选要解析的文献

pref-mineru-cache-repair = 修复缓存

pref-mineru-cache-delete-all = 删除所有缓存

pref-mineru-cache-refresh = 刷新列表

pref-mineru-cache-empty = 当前范围内没有 PDF

pref-mineru-cache-col-status = 状态

pref-mineru-cache-col-title = 标题

pref-mineru-cache-col-author = 作者

pref-mineru-cache-col-year = 年份

pref-mineru-cache-col-date-added = 添加日期

pref-mineru-cache-delete-one = 删除

pref-mineru-cache-status-ready = 已缓存

pref-mineru-cache-status-failed = 失败

pref-mineru-cache-status-stale = 已过期

pref-mineru-cache-status-missing = 已丢失

pref-mineru-cache-status-uncached = 未解析

pref-mineru-cache-repair-done = 已清理 { $count } 条无效缓存

pref-mineru-cache-delete-all-done = 已删除全部 MinerU 缓存

pref-mineru-cache-start-none = 没有需要预解析的 PDF

pref-mineru-cache-start-progress = 正在解析 { $current } / { $total }：{ $title }

pref-mineru-cache-start-done = 预解析完成：成功 { $success }，失败 { $failed }

pref-ai-tools-settings = AI 工具设置

pref-agent-max-planning-iterations = 最大规划轮次

pref-agent-max-planning-iterations-desc = 单个 agent 回复内允许的最大 planning iterations。到最后 1 轮时将强制停止继续调工具并直接总结输出。

pref-context-auto-compact-threshold = 上下文压缩

pref-context-auto-compact-threshold-desc = 当估算输入达到选定的上下文窗口预算时压缩上下文；实际触发点仍会扣除输出预留和安全缓冲。

pref-tool-permission-defaults = 默认审批策略

pref-tool-permission-defaults-desc = 控制高风险工具类别的默认行为；纯读取工具仍保持自动允许。

pref-tool-permission-network = 网络工具

pref-tool-permission-write = 写入工具

pref-tool-permission-memory = 记忆工具

pref-tool-permission-high-cost = 高成本工具

pref-paper-skills-settings = Paper Skills

pref-paper-skills-desc = 在数据目录下的 paper-chat/skills/<slug>/SKILL.md 新增或覆盖本地 skill。修改后可点击“刷新 Skills”重新加载。

pref-paper-skills-open-folder = 打开 Skills 文件夹

pref-paper-skills-reload = 刷新 Skills

pref-paper-skills-reloaded = 已重新加载 { $count } 个 skills

pref-paper-skills-open-failed = 打开 Skills 文件夹失败

pref-paper-skills-reload-failed = 刷新 Skills 失败

pref-aisummary-settings = AI摘要

pref-aisummary-auto-generate-on-item-add =
    .label = 新增文献时自动生成 AI 摘要

pref-aisummary-template = 模板

pref-aisummary-include-annotations =
    .label = 包含用户高亮和笔记

pref-aisummary-run-now = 生成摘要

pref-aisummary-desc = 为文献库中未处理的论文生成AI摘要笔记（每次最多10篇）。

pref-embedding-status-gemini = 使用 Gemini Embedding (免费)

pref-embedding-status-ollama = 使用 Ollama 本地 Embedding

pref-embedding-status-openai = 使用 OpenAI Embedding

pref-embedding-unavailable-ollama = Ollama 已运行但未安装 Embedding 模型，请运行: ollama pull nomic-embed-text

pref-embedding-unavailable-none = 无可用 Embedding 服务，请在设置中配置 Gemini 或 OpenAI API Key
