# 个人提问箱

一个可以直接上线使用的匿名提问箱网站，适合放在个人主页、博客、社交资料页里收集匿名问题。

## 预览

| 主页 | 管理后台 | 搜索页面 |
|--------|----------|----------|
| ![主页](screenshots/主页.png) | ![管理后台](screenshots/管理后台.png) | ![搜索页面](screenshots/搜索页面.png) |

**DEMO:** https://askbox.nekro.top/

## 技术栈

- Next.js App Router
- MDUI 2
- Cloudflare D1 / KV / R2 / Turnstile / Workers
- Algolia（可选搜索）

## 快速部署（使用 Agent）

本项目可用 [OpenCode](https://opencode.ai) 等 Agent 工具一键完成部署。在项目根目录向 Agent 发送：

```
复制 .env.example 为 .env.local，将 SESSION_SECRET 设为随机字符串，ADMIN_PASSWORD 设为你的密码。
创建项目所需的 Cloudflare 资源（D1、KV、R2）并更新 wrangler.jsonc 中的资源 ID。
初始化 D1 数据库。
通过 wrangler secret put 设置 SESSION_SECRET、ADMIN_PASSWORD、TURNSTILE_SECRET_KEY 生产密钥。
最后执行 npm run cf:deploy 部署到 Cloudflare Workers。
```

Agent 会自动完成以上步骤。部署完成后访问终端输出的 `workers.dev` 或自定义域名即可使用。

> **搜索功能（可选）** 需要额外的 Algolia 配置，详见下方 [Algolia 搜索配置](#algolia-搜索配置可选)。

## 手动部署

### 前置准备

- Node.js 22+
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) 已登录：`npx wrangler login`
- 一个 [Cloudflare](https://dash.cloudflare.com) 账号

### 1. 本地配置

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
SITE_NAME="个人提问箱"
SESSION_SECRET="换成一段很长的随机字符串"
ADMIN_PASSWORD="你的管理员密码"
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""
```

### 2. 创建 Cloudflare 资源

```bash
npx wrangler d1 create askbox-db              # D1 数据库
npx wrangler kv namespace create ASKBOX_KV     # KV 命名空间
npx wrangler r2 bucket create askbox-uploads   # R2 存储桶
```

将输出中的 `database_id` 和 `id` 填入 `wrangler.jsonc`。

### 3. 初始化数据库

```bash
npm run db:local   # 本地 D1
npm run db:remote  # 远端 D1（必须执行）
```

### 4. 设置生产密钥

```bash
echo '你的SESSION_SECRET' | npx wrangler secret put SESSION_SECRET
echo '你的ADMIN_PASSWORD' | npx wrangler secret put ADMIN_PASSWORD
echo '你的TURNSTILE_SECRET_KEY' | npx wrangler secret put TURNSTILE_SECRET_KEY
```

> 开发模式 Turnstile 可留空；生产环境请务必在 Cloudflare Dashboard 创建 Turnstile widget 并填入密钥。

### 5. 构建并部署

```bash
npm run cf:deploy
```

部署成功后会输出 `https://xxx.workers.dev` 访问地址。

## 在 Cloudflare 控制台配置绑定与变量

`wrangler.jsonc` 已经加了 `"keep_vars": true`，并且不再包含任何 `vars`，所以除了
`NEXT_PUBLIC_*` 这几个"编译期"变量（见下方说明），其余配置都可以只在
Cloudflare 控制台里填写，不用碰 `.env.local` 或改代码。

### D1 / KV / R2 绑定

Cloudflare Workers（不同于 Pages）目前无法做到"资源 ID 完全只存在于控制台、
仓库里一点不出现"——只要还用 `wrangler deploy` / `npm run cf:deploy` 部署，
每次部署都会以 `wrangler.jsonc` 里声明的绑定为准，覆盖你在控制台"设置 ->
绑定"页面里手动改动的内容。所以推荐这样操作：

1. 在控制台 **Storage & Databases** 里创建（或使用已有的）D1 数据库、KV 命名空间、
   R2 存储桶，而不是用 `npx wrangler d1 create` 等命令。
2. 把创建后拿到的 `database_id` / KV `id` / R2 桶名，填进 `wrangler.jsonc` 的
   `d1_databases` / `kv_namespaces` / `r2_buckets` 里（binding 名字必须分别是
   `DB`、`ASKBOX_KV`、`ASKBOX_R2`，代码里是按这几个名字读取的）。
3. 部署一次之后，去 Worker 的 **设置 -> 绑定** 页面就能看到这三个绑定，可以在
   那里直接浏览 D1 表数据、KV 键值、R2 文件，方便调试；但如果要*修改*绑定指向的
   资源，还是要改 `wrangler.jsonc` 再重新部署，控制台里的临时改动会在下次部署时被覆盖。

### 变量与密钥

去 Worker 的 **设置 -> 变量和密钥**（Variables and Secrets），按下表添加：

| 名称 | 类型 | 说明 |
|------|------|------|
| `SESSION_SECRET` | 密钥 (Secret) | 会话签名密钥 |
| `ADMIN_PASSWORD` 或 `ADMIN_PASSWORD_HASH` | 密钥 (Secret) | 管理员密码 / 密码哈希 |
| `TURNSTILE_SECRET_KEY` | 密钥 (Secret) | Turnstile 服务端密钥 |
| `ALGOLIA_ADMIN_API_KEY` | 密钥 (Secret) | 仅使用 Algolia 搜索时需要 |
| `SITE_NAME` | 文本 (Variable) | 站点名称，可选 |

保存后无需改代码，`getCloudflareEnv()` / `getEnv()` 会在运行时自动读到这些值，
且因为 `keep_vars: true`，之后每次 `npm run cf:deploy` 都不会把它们清空。

> **`NEXT_PUBLIC_*` 例外**：`NEXT_PUBLIC_TURNSTILE_SITE_KEY`、
> `NEXT_PUBLIC_ALGOLIA_APP_ID`、`NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY`、
> `NEXT_PUBLIC_ALGOLIA_INDEX` 会被 Next.js 在**构建期**直接打进浏览器端代码，
> 而不是在 Worker 运行时读取。如果你在本机执行 `npm run cf:deploy`，这几个值
> 必须写在本机的 `.env.local` 里才会生效；只填在控制台里对本机构建不起作用。
> 如果改用 Cloudflare 的 Git 集成（Workers Builds）自动构建部署，控制台的
> 变量在构建阶段也会被注入，届时这几个值同样可以只在控制台配置。

## 功能特性

- **匿名提问**：支持公开昵称或匿名留言，可附带图片附件（PNG/JPG/WebP/GIF）
- **全文搜索**：基于 Algolia 的实时搜索，前台搜公开问题，后台搜全部（**可选功能**，见下方配置）
- **人机验证**：集成 Cloudflare Turnstile 验证，防止垃圾提交
- **深色模式**：顶部按钮一键切换浅色/深色/跟随系统，选择自动持久化
- **管理后台**：按状态分类（待回答/已回答/已展示/全部），支持回答、发布、删除问题，关联附件同步清理
- **限速保护**：同一 IP 每小时最多提交 **20** 个问题，超出限制返回提示
- **Markdown 支持**：问题和回答均支持 Markdown 语法，含加粗、斜体、链接、列表等，自动渲染为规范格式
- **快速复制**：点击首页问答卡片一键复制问答内容，Snackbar 提示已复制

## Algolia 搜索配置（可选）

搜索功能依赖 [Algolia](https://www.algolia.com/)，免费额度（10,000 条记录 / 10,000 次搜索/月）对个人使用完全足够。**不配置也不影响其他功能**，搜索栏会自动降级为空。

### 方式一：Agent 快速配置

在项目根目录向 Agent 发送：

```
配置 Algolia 搜索，我的 Application ID 是 XXX，
Search-Only API Key 是 XXX，
Admin API Key 是 XXX，
Index 名称是 askbox。
```

Agent 会自动完成：
1. 在 `.env.local` 中添加四项 Algolia 环境变量（`NEXT_PUBLIC_*` 三项是构建期变量，必须留在这里）
2. 在 Cloudflare 控制台「设置 -> 变量和密钥」中把 `ALGOLIA_ADMIN_API_KEY` 加为 Secret
3. 执行 `npm run cf:deploy` 重新部署

你也可以在同一句话里指定其他的 Index 名称。

### 方式二：手动配置

1. 前往 [algolia.com](https://www.algolia.com/) 注册账号
2. 进入 Dashboard → Settings → API Keys
3. 记录以下三个值：
   - **Application ID**
   - **Search-Only API Key**（公开，前端用）
   - **Admin API Key**（保密，后端用）

#### 2. 创建 Index

进入 Dashboard → Search → Index → Create Index，命名为 `askbox`（或其他你喜欢的名字）。

#### 3. 配置环境变量

`NEXT_PUBLIC_*` 三项会被打进浏览器端代码，必须写进本机的 `.env.local`
（部署时执行构建的机器也需要有这几个值）：

```env
NEXT_PUBLIC_ALGOLIA_APP_ID="你的 Application ID"
NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY="你的 Search-Only API Key"
NEXT_PUBLIC_ALGOLIA_INDEX="askbox"
```

`ALGOLIA_ADMIN_API_KEY` 是服务端密钥，**不要**写进 `.env.local` 或
`wrangler.jsonc`，改为在 Cloudflare 控制台配置。

#### 4. 在控制台设置 Admin API Key

去 Worker 的 **设置 -> 变量和密钥**，添加一个类型为「密钥」的
`ALGOLIA_ADMIN_API_KEY`，值为你的 Admin API Key。也可以用命令行代替：

```bash
echo '你的 Admin API Key' | npx wrangler secret put ALGOLIA_ADMIN_API_KEY
```

#### 6. 配置 Index 搜索属性（推荐）

在 Algolia Dashboard → Search → Index → `askbox` → Configuration → Searchable attributes 中，添加：

```
content, answer, nickname
```

这样搜索只会匹配问题内容、回答和昵称，结果更准确。

#### 7. 重新部署

```bash
npm run cf:deploy
```

部署后，新提交的问题会自动索引到 Algolia。已有数据不会自动同步，需重新提交或通过脚本导入。

## 管理后台

访问 `https://你的域名/admin`，使用 `ADMIN_PASSWORD` 登录。可查看待回答问题、填写回答并选择是否发布到首页。

## 本地运行

```bash
npm run dev
# http://localhost:3000
# http://localhost:3000/admin
```

## 项目命令

```bash
npm run dev        # 本地开发
npm run build      # Next.js 构建
npm run cf:build   # Cloudflare OpenNext 构建
npm run cf:preview # 本地预览 Workers 产物
npm run cf:deploy  # 部署到 Cloudflare Workers
npm run db:local   # 初始化本地 D1
npm run db:remote  # 初始化远端 D1
```

## 法律与隐私

页脚提供 **用户协议** 与 **隐私政策** 入口，以对话框形式展示，也可通过 `/terms` 和 `/privacy` 直接访问。

## 许可协议

本项目遵循 **MIT license** 开源协议，详细查看 [LICENSE](LICENSE) 文件。

> Copyright (c) 2026 Nekro

根据 MIT 开源协议，你可以自由使用、修改、分发代码，但需保留上述版权声明。

## 常见问题

### 提交问题时报错

检查 D1 是否已初始化、Turnstile 密钥是否正确、site key 是否已设置。

### 后台无法登录

- 检查 `ADMIN_PASSWORD` 和 `SESSION_SECRET` 是否已通过 `wrangler secret` 设置。
- 使用 `http://` 而非 `https://` 访问会导致 Cookie 无法写入，请务必通过 `https://` 访问后台。

### 部署后首页没有公开内容

正常。问题提交后进入后台收件箱，需要管理员回答并发布后才会显示。

### 搜索没有结果

- 确认已按上方步骤完成 Algolia 配置
- 确认 `ALGOLIA_ADMIN_API_KEY` 已设置为 secret
- 确认 Index 名称与 `NEXT_PUBLIC_ALGOLIA_INDEX` 一致
- 新提交的问题才会自动同步，旧数据不会自动导入

### Windows 构建失败

项目已内置 `@next/swc-wasm-nodejs` 作为 Windows fallback。如仍有问题，尝试：

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```
