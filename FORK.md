# Tymee 的 Cloud Mail 定制

上游项目：[maillab/cloud-mail](https://github.com/maillab/cloud-mail)。定制直接保存在本 fork 的默认分支 `main`，上游更新可从 `upstream/main` 合并。

## 已保存的改动

- 新生成的 Telegram「View」链接从签发时刻起有效 24 小时，在到期时刻立即拒绝访问。已有不带 `exp` 的链接继续可用。
- 邮件查看接口返回 `Cache-Control: private, no-store, max-age=0` 和 `CDN-Cache-Control: no-store`，有效和失效页面均禁止缓存。
- 链接在有效期内仍允许持有链接的人查看对应邮件正文；它不校验访问者的 Telegram 身份。
- 设置 `personal_catch_all: true` 时，允许域名内未单独创建的收件地址归入管理员邮箱，保留原收件地址。
- 使用 D1 保存邮件数据，KV 保存配置、登录状态和附件；部署模板不启用 R2 或其他付费资源。
- 更新 Wrangler，并提供 Telegram 链接的过期、旧链接兼容、签名校验及 HTTP 缓存测试。

## 本地验证与部署

使用 Node.js 24 和 pnpm。在 `mail-worker` 运行：

```sh
pnpm install --frozen-lockfile
pnpm run test:telegram
```

首次配置时复制 `mail-worker/wrangler.personal.example.jsonc` 为 `mail-worker/wrangler.personal.jsonc`，填入自己的账号、D1/KV ID、管理员及域名。该本地文件不提交 Git。

在 `mail-vue` 运行 `pnpm install --frozen-lockfile` 和 `pnpm build`，生成 `mail-worker/dist`。然后在 `mail-worker` 运行：

```sh
pnpm wrangler deploy --dry-run --config wrangler.personal.jsonc
pnpm wrangler deploy --config wrangler.personal.jsonc
```

首次部署还需通过 `pnpm wrangler secret put jwt_secret --config wrangler.personal.jsonc` 设置签名密钥，并按上游文档初始化数据库、配置 Email Routing 和 Resend。更新现有部署时保留已有密钥与数据库，不重新初始化。

机器人 Token、Resend Token 在邮箱管理后台配置，不写进源码。`.personal-secrets.json`、本地 Wrangler 配置及构建产物已加入忽略列表。

当前线上更新通过本地 Wrangler 发布，尚未配置本 fork 的 GitHub 自动部署凭据。仓库保留上游的 Actions 部署工作流，今后需要自动部署时再配置并启用。
