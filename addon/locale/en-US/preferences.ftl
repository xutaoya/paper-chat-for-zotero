pref-title = PaperMind Settings

pref-model = Model

pref-advanced-options = Advanced Options

pref-max-tokens = Max Tokens

pref-temperature = Temperature

pref-system-prompt = System Prompt

pref-extra-request-body = Extra Body

pref-model-extra-request-body = Model Extra Body

pref-extra-request-body-invalid = Extra request body must be a JSON object

pref-model-extra-request-body-invalid = Per-model extra request body must be an object whose values are JSON objects

pref-invalid-json = Invalid JSON

pref-providers = Providers

pref-add-provider = + Add Custom

pref-api-key = API Key

pref-base-url = Base URL

pref-show-key = Show

pref-hide-key = Hide

pref-refresh-models = Refresh

pref-test-connection = Test Connection

pref-delete-provider = Delete Provider

pref-active-provider = Active Provider

pref-current-provider = Current:

pref-testing = Testing...

pref-test-success = Connection successful!

pref-test-failed = Connection failed

pref-provider-not-ready = Provider not configured

pref-provider-configured = Configured

pref-provider-active = Active provider

pref-fetching-models = Fetching models...

pref-models-loaded = Loaded { $count } models

pref-fetch-models-failed = Failed to fetch models

pref-enter-provider-name = Enter provider name:

pref-model-list = Model List

pref-add-model = + Add Model

pref-enter-model-id = Enter model ID:

pref-model-custom = Custom

pref-model-speed-test = Speed

pref-model-speed-testing = Testing...

pref-model-speed-failed = Failed

pref-model-speed-result = { $latency }ms

pref-model-speed-unsupported = Speed test is not supported for this provider

pref-model-exists = Model already exists

pref-pdf-settings = PDF Settings

pref-upload-raw-pdf = Upload raw PDF on text extraction failure

pref-upload-raw-pdf-desc = When enabled, uploads original PDF to AI if text extraction fails. This may consume significantly more tokens.

pref-use-mineru-on-failure = Use MinerU when text extraction fails

pref-mineru-api-token = MinerU Token

pref-mineru-test = Test Connection

pref-mineru-test-running = Testing MinerU token…

pref-mineru-pane-title = MinerU Parsing

pref-mineru-pane-desc = Configure the MinerU online API and manage the local parse cache.

pref-mineru-cache-title = Manage Files

pref-mineru-cache-library-root = My Library

pref-mineru-cache-tags-title = Tags

pref-mineru-cache-tags-summary = Tagged { $tagged }  Untagged { $untagged }

pref-mineru-cache-tags-empty = No tags in the current scope

pref-mineru-cache-tag-filter = Filter tags
    .placeholder = Filter tags

pref-mineru-cache-search = Search items
    .placeholder = Search items

pref-mineru-cache-summary = { $ready } / { $total }

pref-mineru-cache-start-all = Start All

pref-mineru-cache-start-selected = Parse Selected

pref-mineru-cache-start-selected-none = Select items to parse first

pref-mineru-cache-repair = Repair Cache

pref-mineru-cache-delete-all = Delete All Cache

pref-mineru-cache-refresh = Refresh

pref-mineru-cache-empty = No PDFs in the current scope

pref-mineru-cache-col-status = Status

pref-mineru-cache-col-title = Title

pref-mineru-cache-col-author = Author

pref-mineru-cache-col-year = Year

pref-mineru-cache-col-date-added = Date Added

pref-mineru-cache-delete-one = Delete

pref-mineru-cache-status-ready = Cached

pref-mineru-cache-status-failed = Failed

pref-mineru-cache-status-stale = Stale

pref-mineru-cache-status-missing = Missing

pref-mineru-cache-status-uncached = Not Parsed

pref-mineru-cache-repair-done = Removed { $count } invalid cache entries

pref-mineru-cache-delete-all-done = Deleted all MinerU cache entries

pref-mineru-cache-start-none = No PDFs need pre-parsing

pref-mineru-cache-start-progress = Parsing { $current } / { $total }: { $title }

pref-mineru-cache-start-done = Pre-parse finished: { $success } succeeded, { $failed } failed

pref-mineru-open-settings-hint = MinerU token, connection test, and cache management are now in the separate MinerU settings page.

pref-ai-tools-settings = AI Tools Settings

pref-agent-max-planning-iterations = Max planning iterations

pref-agent-max-planning-iterations-desc = Maximum planning iterations allowed inside a single agent response. On the final iteration, tool use is disabled and the model must synthesize a final answer.

pref-context-auto-compact-threshold = Context compression

pref-context-auto-compact-threshold-desc = Compresses conversation context when estimated input reaches the selected context-window budget. The trigger still reserves output tokens and the safety buffer.

pref-tool-permission-defaults = Default Approval Policy

pref-tool-permission-defaults-desc = Controls the default behavior for risky tool classes. Read-only tools remain auto-allowed.

pref-tool-permission-network = Network tools

pref-tool-permission-write = Write tools

pref-tool-permission-memory = Memory tools

pref-tool-permission-high-cost = High-cost tools

pref-paper-skills-settings = Paper Skills

pref-paper-skills-desc = Add or override local skills under paper-chat/skills/<slug>/SKILL.md in the data directory. Click Reload Skills after editing to refresh them.

pref-paper-skills-open-folder = Open Skills Folder

pref-paper-skills-reload = Reload Skills

pref-paper-skills-reloaded = Reloaded { $count } skills

pref-paper-skills-open-failed = Failed to open skills folder

pref-paper-skills-reload-failed = Failed to reload skills

pref-aisummary-settings = AI Summary

pref-aisummary-auto-generate-on-item-add =
    .label = Automatically generate AI summaries for newly added papers

pref-aisummary-template = Template

pref-aisummary-include-annotations =
    .label = Include user highlights and notes

pref-aisummary-run-now = Generate Summaries

pref-aisummary-desc = Generate AI summaries for unprocessed papers in your library (up to 10 per run).

pref-embedding-status-gemini = Using Gemini Embedding (Free)

pref-embedding-status-ollama = Using Ollama Local Embedding

pref-embedding-status-openai = Using OpenAI Embedding

pref-embedding-unavailable-ollama = Ollama is running but no embedding model installed. Run: ollama pull nomic-embed-text

pref-embedding-unavailable-none = No embedding service available. Configure Gemini or OpenAI API Key in Settings.
