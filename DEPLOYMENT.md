# 完整部署教程

本文档提供详细的部署步骤，帮助你快速上线金银价格追踪网站。

## 目录

- [本地运行](#本地运行)
- [配置API密钥](#配置api密钥)
- [部署到GitHub Pages](#部署到github-pages)
- [部署到Netlify](#部署到netlify)
- [部署到Vercel](#部署到vercel)
- [部署到Cloudflare Pages](#部署到cloudflare-pages)
- [自定义域名](#自定义域名)
- [常见问题](#常见问题)

---

## 本地运行

### 方法一：直接打开（最简单）

1. **找到项目文件夹**
   ```
   gold-silver-tracker/
   ```

2. **双击打开 `index.html`**
   - Windows：直接双击 `index.html`
   - Mac：右键 → 打开方式 → 浏览器
   - Linux：右键 → 用浏览器打开

3. **查看效果**
   - 网站会自动以演示模式运行
   - 显示模拟的金银价格数据
   - 所有功能都可以正常使用

### 方法二：使用本地服务器（推荐）

使用本地服务器可以避免某些浏览器的跨域限制。

#### 使用Python（推荐）

```bash
# 进入项目目录
cd gold-silver-tracker

# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000
```

然后在浏览器访问：`http://localhost:8000`

#### 使用Node.js

```bash
# 安装http-server（只需一次）
npm install -g http-server

# 进入项目目录
cd gold-silver-tracker

# 启动服务器
http-server -p 8000
```

然后在浏览器访问：`http://localhost:8000`

#### 使用PHP

```bash
# 进入项目目录
cd gold-silver-tracker

# 启动服务器
php -S localhost:8000
```

然后在浏览器访问：`http://localhost:8000`

#### 使用VS Code Live Server

1. 安装 VS Code 扩展：Live Server
2. 右键 `index.html`
3. 选择 "Open with Live Server"
4. 自动在浏览器打开

---

## 配置API密钥

要显示真实的金银价格数据，需要配置API密钥。

### 步骤1：注册API账号

#### 选项A：GoldAPI（推荐）

1. **访问注册页面**
   - 网址：https://www.goldapi.io/
   - 点击 "Sign Up" 或 "Get Started"

2. **填写注册信息**
   - 邮箱地址
   - 密码
   - 确认邮箱

3. **获取API密钥**
   - 登录后进入 Dashboard
   - 复制 "API Key"
   - 免费计划：每月1000次请求

#### 选项B：Metals-API（备用）

1. **访问注册页面**
   - 网址：https://metals-api.com/
   - 点击 "Get Free API Key"

2. **填写注册信息**
   - 邮箱地址
   - 密码
   - 确认邮箱

3. **获取API密钥**
   - 登录后进入 Dashboard
   - 复制 "Your API Key"
   - 免费计划：每月500次请求

### 步骤2：配置密钥

1. **打开配置文件**
   ```
   gold-silver-tracker/js/config.js
   ```

2. **找到API配置部分**
   ```javascript
   api: {
       goldApiKey: 'YOUR_GOLDAPI_KEY_HERE',
       metalsApiKey: 'YOUR_METALS_API_KEY_HERE',
       activeApi: 'demo'
   }
   ```

3. **填入你的API密钥**

   **如果使用GoldAPI：**
   ```javascript
   api: {
       goldApiKey: 'goldapi-abcd1234efgh5678',  // 替换为你的密钥
       metalsApiKey: 'YOUR_METALS_API_KEY_HERE',
       activeApi: 'goldapi'  // 改为 'goldapi'
   }
   ```

   **如果使用Metals-API：**
   ```javascript
   api: {
       goldApiKey: 'YOUR_GOLDAPI_KEY_HERE',
       metalsApiKey: 'your_metals_api_key_here',  // 替换为你的密钥
       activeApi: 'metalsapi'  // 改为 'metalsapi'
   }
   ```

4. **保存文件**

5. **刷新浏览器**
   - 按 F5 或 Ctrl+R（Windows/Linux）
   - 按 Cmd+R（Mac）
   - 现在应该显示真实数据了

### 步骤3：验证配置

1. **打开浏览器开发者工具**
   - 按 F12 或右键 → 检查

2. **查看控制台（Console）**
   - 如果看到 "✓ 使用 goldapi API" 或 "✓ 使用 metalsapi API"
   - 说明配置成功

3. **检查价格数据**
   - 价格应该是真实的市场价格
   - 不再显示"演示模式"警告

---

## 部署到GitHub Pages

GitHub Pages 是免费的静态网站托管服务，非常适合部署本项目。

### 前提条件

- 拥有 GitHub 账号（没有的话去 https://github.com 注册）
- 安装了 Git（下载：https://git-scm.com/）

### 步骤1：创建GitHub仓库

1. **登录GitHub**
   - 访问 https://github.com

2. **创建新仓库**
   - 点击右上角 "+" → "New repository"
   - 仓库名称：`gold-silver-tracker`（可自定义）
   - 描述：`实时金银价格追踪网站`
   - 选择 "Public"（公开）
   - 不要勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

### 步骤2：上传代码

#### 方法A：使用Git命令行

```bash
# 进入项目目录
cd gold-silver-tracker

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 金银价格追踪网站"

# 添加远程仓库（替换为你的用户名和仓库名）
git remote add origin https://github.com/你的用户名/gold-silver-tracker.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

#### 方法B：使用GitHub Desktop（图形界面）

1. **下载GitHub Desktop**
   - 访问 https://desktop.github.com/
   - 下载并安装

2. **添加仓库**
   - 打开 GitHub Desktop
   - File → Add Local Repository
   - 选择 `gold-silver-tracker` 文件夹

3. **提交并推送**
   - 填写 Commit 信息
   - 点击 "Commit to main"
   - 点击 "Publish repository"

#### 方法C：直接上传文件

1. **进入你的GitHub仓库页面**

2. **点击 "uploading an existing file"**

3. **拖拽所有文件到页面**
   - 选择 `gold-silver-tracker` 文件夹中的所有文件
   - 拖到浏览器窗口

4. **提交**
   - 填写 Commit 信息
   - 点击 "Commit changes"

### 步骤3：启用GitHub Pages

1. **进入仓库设置**
   - 点击仓库页面的 "Settings"

2. **找到Pages设置**
   - 左侧菜单找到 "Pages"

3. **配置部署**
   - Source：选择 "Deploy from a branch"
   - Branch：选择 "main"
   - Folder：选择 "/ (root)"
   - 点击 "Save"

4. **等待部署**
   - 通常需要1-3分钟
   - 页面会显示网站地址

5. **访问网站**
   - 地址格式：`https://你的用户名.github.io/gold-silver-tracker/`
   - 例如：`https://zhangsan.github.io/gold-silver-tracker/`

### 步骤4：更新网站

当你修改代码后，重新推送即可：

```bash
git add .
git commit -m "更新说明"
git push
```

GitHub Pages 会自动重新部署（1-3分钟）。

---

## 部署到Netlify

Netlify 提供免费的静态网站托管，支持拖拽部署，非常简单。

### 方法一：拖拽部署（最简单）

1. **访问Netlify**
   - 网址：https://www.netlify.com/
   - 点击 "Sign up" 注册（可用GitHub账号登录）

2. **进入部署页面**
   - 登录后，点击 "Add new site" → "Deploy manually"

3. **拖拽文件夹**
   - 将整个 `gold-silver-tracker` 文件夹拖到页面
   - 或点击选择文件夹

4. **等待部署**
   - 自动上传和部署（通常10-30秒）
   - 完成后显示网站地址

5. **访问网站**
   - 地址格式：`https://random-name-12345.netlify.app`
   - 可以在设置中自定义域名

### 方法二：连接GitHub（推荐）

1. **准备工作**
   - 先按照上面的步骤将代码上传到GitHub

2. **连接仓库**
   - 在Netlify点击 "Add new site" → "Import an existing project"
   - 选择 "GitHub"
   - 授权Netlify访问GitHub
   - 选择 `gold-silver-tracker` 仓库

3. **配置部署**
   - Branch to deploy：`main`
   - Build command：留空
   - Publish directory：留空（或填 `.`）
   - 点击 "Deploy site"

4. **自动部署**
   - 每次推送到GitHub，Netlify自动重新部署
   - 无需手动操作

### 自定义域名（可选）

1. **进入站点设置**
   - 点击 "Site settings"

2. **修改域名**
   - Domain management → Options → Edit site name
   - 改为：`gold-silver-tracker`
   - 新地址：`https://gold-silver-tracker.netlify.app`

---

## 部署到Vercel

Vercel 是另一个优秀的免费托管平台，速度快，全球CDN。

### 方法一：使用Vercel CLI

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   cd gold-silver-tracker
   vercel
   ```

4. **按提示操作**
   - 选择项目名称
   - 确认设置
   - 自动部署

5. **访问网站**
   - 显示的URL即为网站地址

### 方法二：连接GitHub

1. **访问Vercel**
   - 网址：https://vercel.com/
   - 用GitHub账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 `gold-silver-tracker` 仓库
   - 点击 "Import"

3. **配置项目**
   - Framework Preset：选择 "Other"
   - Root Directory：`.`
   - Build Command：留空
   - Output Directory：留空
   - 点击 "Deploy"

4. **等待部署**
   - 通常20-60秒
   - 完成后显示网站地址

5. **自动部署**
   - 每次推送到GitHub自动重新部署

---

## 部署到Cloudflare Pages

Cloudflare Pages 提供免费托管，全球CDN，速度极快。

### 步骤1：准备

1. **注册Cloudflare账号**
   - 访问：https://dash.cloudflare.com/sign-up
   - 填写邮箱和密码

2. **进入Pages**
   - 登录后，左侧菜单选择 "Pages"

### 步骤2：部署

#### 方法A：连接GitHub

1. **创建项目**
   - 点击 "Create a project"
   - 选择 "Connect to Git"

2. **连接GitHub**
   - 授权Cloudflare访问GitHub
   - 选择 `gold-silver-tracker` 仓库

3. **配置构建**
   - Project name：`gold-silver-tracker`
   - Production branch：`main`
   - Build command：留空
   - Build output directory：留空
   - 点击 "Save and Deploy"

4. **等待部署**
   - 通常1-2分钟
   - 完成后显示网站地址

#### 方法B：直接上传

1. **创建项目**
   - 点击 "Create a project"
   - 选择 "Direct Upload"

2. **上传文件**
   - 将 `gold-silver-tracker` 文件夹打包为 ZIP
   - 上传 ZIP 文件
   - 或拖拽文件夹

3. **部署**
   - 自动部署
   - 完成后显示网站地址

---

## 自定义域名

如果你有自己的域名，可以绑定到网站。

### GitHub Pages

1. **购买域名**
   - 推荐：阿里云、腾讯云、GoDaddy

2. **添加CNAME记录**
   - 在域名DNS设置中
   - 类型：CNAME
   - 主机记录：`www` 或 `@`
   - 记录值：`你的用户名.github.io`

3. **在GitHub仓库设置**
   - Settings → Pages → Custom domain
   - 填入你的域名
   - 保存

### Netlify

1. **进入域名设置**
   - Site settings → Domain management

2. **添加自定义域名**
   - Add custom domain
   - 输入你的域名

3. **配置DNS**
   - 按照Netlify提供的说明配置DNS
   - 或使用Netlify DNS

### Vercel

1. **进入项目设置**
   - Settings → Domains

2. **添加域名**
   - 输入你的域名
   - 按照提示配置DNS

### Cloudflare Pages

1. **进入项目设置**
   - Custom domains

2. **添加域名**
   - 输入你的域名
   - 自动配置（如果域名在Cloudflare）

---

## 常见问题

### Q1: 部署后显示404错误

**原因**：文件路径不正确

**解决方案**：
- 确保 `index.html` 在根目录
- 检查文件名大小写（Linux区分大小写）
- 清除浏览器缓存

### Q2: CSS/JS文件加载失败

**原因**：路径问题或CORS限制

**解决方案**：
- 检查 `index.html` 中的路径是否正确
- 使用相对路径（`css/style.css` 而不是 `/css/style.css`）
- 使用本地服务器而不是直接打开文件

### Q3: API密钥配置后仍显示演示模式

**原因**：配置未生效或API密钥无效

**解决方案**：
1. 检查 `config.js` 中的 `activeApi` 是否改为 `'goldapi'` 或 `'metalsapi'`
2. 确认API密钥正确（没有多余空格）
3. 清除浏览器缓存并刷新
4. 检查浏览器控制台是否有错误信息

### Q4: GitHub Pages部署后无法访问

**原因**：部署未完成或设置错误

**解决方案**：
1. 等待3-5分钟（首次部署较慢）
2. 检查 Settings → Pages 中的状态
3. 确认分支选择正确（main）
4. 检查仓库是否为Public

### Q5: 价格不更新

**原因**：API限制或网络问题

**解决方案**：
1. 检查API配额是否用完
2. 查看浏览器控制台错误信息
3. 手动点击刷新按钮测试
4. 检查网络连接

### Q6: 手机上显示异常

**原因**：浏览器兼容性或缓存问题

**解决方案**：
1. 清除手机浏览器缓存
2. 使用Chrome或Safari浏览器
3. 检查是否启用了JavaScript

### Q7: 图表不显示

**原因**：Lightweight Charts库加载失败

**解决方案**：
1. 检查网络连接
2. 确认CDN可访问
3. 查看浏览器控制台错误
4. 尝试更换CDN源

### Q8: 部署到国内服务器

**问题**：需要备案

**解决方案**：
- 使用GitHub Pages、Netlify等国外服务（无需备案）
- 或使用国内的Gitee Pages（需要实名认证）
- 或购买国内服务器并完成备案

---

## 性能优化建议

### 1. 启用HTTPS

所有推荐的托管平台都自动提供免费HTTPS证书。

### 2. 配置CDN

- GitHub Pages：自动使用Fastly CDN
- Netlify：自动使用全球CDN
- Vercel：自动使用全球边缘网络
- Cloudflare Pages：自动使用Cloudflare CDN

### 3. 压缩资源

如果需要进一步优化，可以：
- 压缩CSS和JS文件
- 优化图片（如果添加了图片）
- 启用Gzip压缩

### 4. 缓存策略

在 `index.html` 的 `<head>` 中添加：
```html
<meta http-equiv="Cache-Control" content="max-age=3600">
```

---

## 安全建议

### 1. API密钥保护

**重要**：如果部署到公开网站，API密钥会暴露在前端代码中。

**解决方案**：
- 使用免费API（限制较多，即使泄露影响有限）
- 或搭建简单的后端代理（隐藏API密钥）
- 或使用Netlify Functions / Vercel Serverless Functions

### 2. 限制API调用

在 `config.js` 中：
```javascript
updateInterval: 60000,  // 不要设置太短，避免超出API限额
```

---

## 下一步

部署完成后，你可以：

1. **分享网站**
   - 将网址分享给朋友
   - 在社交媒体上分享

2. **自定义功能**
   - 添加更多贵金属（铂金、钯金）
   - 添加价格提醒功能
   - 添加历史价格对比

3. **监控网站**
   - 使用Google Analytics追踪访问量
   - 使用UptimeRobot监控网站可用性

4. **持续改进**
   - 收集用户反馈
   - 优化界面和功能
   - 定期更新汇率

---

## 技术支持

如果遇到问题：

1. **查看浏览器控制台**
   - 按F12打开开发者工具
   - 查看Console标签的错误信息

2. **检查配置**
   - 确认 `config.js` 配置正确
   - 确认所有文件都已上传

3. **测试本地**
   - 先在本地测试是否正常
   - 再部署到线上

4. **查看文档**
   - README.md：功能说明
   - 代码注释：实现细节

---

**祝你部署顺利！** 🚀

如有问题，欢迎查看代码注释或在浏览器控制台调试。
