# 实时金银价格追踪网站

一个美观的实时金银价格追踪网站，支持盎司到克的单位转换，提供多时间周期K线图。

## 功能特性

- ✨ **实时价格显示**：自动每60秒更新金价和银价
- 💱 **单位转换**：自动将美元/盎司转换为人民币/克
- 📊 **K线图表**：支持多个时间周期（1分钟、5分钟、1小时、日线、周线、月线）
- 🎨 **美观界面**：深色主题，专业金融风格
- 📱 **响应式设计**：完美支持桌面、平板和手机
- 🔄 **智能更新**：页面不可见时自动暂停更新，节省资源
- 💾 **数据缓存**：减少API调用，提升响应速度

## 快速开始

### 1. 下载项目

将整个 `gold-silver-tracker` 文件夹下载到本地。

### 2. 配置API密钥（可选）

如果要使用真实数据，需要配置API密钥：

1. 注册免费API账号：
   - [GoldAPI](https://www.goldapi.io/) - 推荐，每月1000次免费请求
   - [Metals-API](https://metals-api.com/) - 备用，每月500次免费请求

2. 打开 `js/config.js` 文件

3. 将API密钥填入配置：
```javascript
api: {
    goldApiKey: 'your_goldapi_key_here',  // 替换为你的GoldAPI密钥
    metalsApiKey: 'your_metals_api_key',  // 或Metals-API密钥
    activeApi: 'goldapi'  // 选择使用哪个API
}
```

4. 如果不配置API密钥，网站将使用**演示模式**，显示模拟数据（带随机波动）

### 3. 运行网站

#### 方法一：直接打开（推荐）
直接双击 `index.html` 文件在浏览器中打开。

#### 方法二：使用本地服务器
```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx http-server

# 使用PHP
php -S localhost:8000
```

然后在浏览器访问 `http://localhost:8000`

### 4. 部署到线上（可选）

可以免费部署到以下平台：

- **GitHub Pages**：
  1. 创建GitHub仓库
  2. 上传所有文件
  3. 在仓库设置中启用GitHub Pages
  4. 访问 `https://你的用户名.github.io/仓库名`

- **Netlify**：拖拽文件夹即可部署
- **Vercel**：连接GitHub仓库自动部署
- **Cloudflare Pages**：快速部署，全球CDN

## 使用说明

### 界面操作

1. **切换金属**：点击顶部的"黄金"或"白银"按钮
2. **手动刷新**：点击价格卡片右上角的刷新按钮
3. **切换时间周期**：点击图表下方的时间周期按钮（1分钟、5分钟、1小时、日线、周线、月线）
4. **查看详情**：鼠标悬停在K线图上查看具体价格

### 价格说明

- **美元/盎司**：国际标准计价单位
- **人民币/克**：国内常用单位，自动换算（1盎司 = 31.1035克）
- **涨跌显示**：
  - 🔺 红色向上箭头：价格上涨
  - 🔻 绿色向下箭头：价格下跌

### 更新频率

- **实时价格**：每60秒自动更新
- **K线图**：切换时间周期时自动加载
- **智能暂停**：页面切换到后台时自动暂停更新

## 技术架构

### 技术栈
- **前端**：纯HTML/CSS/JavaScript（无需构建工具）
- **图表库**：Lightweight Charts v4.1.0（TradingView开源）
- **API**：GoldAPI / Metals-API

### 文件结构
```
gold-silver-tracker/
├── index.html              # 主页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── config.js          # 配置文件
│   ├── api.js             # API调用模块
│   ├── priceManager.js    # 价格管理模块
│   ├── chartManager.js    # 图表管理模块
│   ├── uiController.js    # UI控制器
│   └── main.js            # 主入口
└── README.md              # 使用说明
```

### 模块说明

- **config.js**：配置API密钥、更新频率、单位转换等
- **api.js**：封装API调用、缓存管理、演示数据生成
- **priceManager.js**：管理价格更新、订阅通知、自动轮询
- **chartManager.js**：管理K线图、时间周期切换、实时更新
- **uiController.js**：处理用户交互、界面更新、事件绑定
- **main.js**：应用初始化、模块协调、错误处理

## 自定义配置

### 修改更新频率

编辑 `js/config.js`：
```javascript
updateInterval: 60000,  // 60秒，可改为30000（30秒）或120000（2分钟）
```

### 修改汇率

编辑 `js/config.js`：
```javascript
conversion: {
    ozToGram: 31.1035,  // 盎司到克的转换率（固定）
    usdToCny: 7.2       // 美元到人民币汇率（可根据实际调整）
}
```

### 修改主题颜色

编辑 `css/style.css` 中的 `:root` 变量：
```css
:root {
    --gold-color: #ffd700;      /* 金色 */
    --silver-color: #c0c0c0;    /* 银色 */
    --color-up: #26a69a;        /* 涨色 */
    --color-down: #ef5350;      /* 跌色 */
}
```

## 常见问题

### Q: 为什么显示"演示模式"？
A: 因为没有配置API密钥。在 `js/config.js` 中填入你的API密钥即可使用真实数据。

### Q: API密钥如何获取？
A: 访问 [GoldAPI](https://www.goldapi.io/) 或 [Metals-API](https://metals-api.com/) 注册免费账号，即可获得API密钥。

### Q: 免费API有什么限制？
A:
- GoldAPI：每月1000次请求
- Metals-API：每月500次请求
- 按60秒更新频率，每月约43200次请求，建议配置多个API源切换使用

### Q: 价格数据准确吗？
A: 免费API数据可能有1-5分钟延迟，仅供参考。实际交易请以交易所实时价格为准。

### Q: 可以添加其他贵金属吗？
A: 可以。修改代码添加铂金、钯金等，但需要API支持。

### Q: 手机上显示正常吗？
A: 完全支持。网站采用响应式设计，在手机、平板、电脑上都能完美显示。

### Q: 如何修改为其他货币？
A: 修改 `js/config.js` 中的 `usdToCny` 汇率，并在代码中将 `¥` 符号改为对应货币符号。

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 不支持（已停止维护）

## 免责声明

本网站提供的价格数据仅供参考，不构成任何投资建议。

- 数据可能存在延迟或误差
- 实际交易价格以交易所报价为准
- 投资有风险，决策需谨慎
- 作者不对使用本网站造成的任何损失负责

## 开源协议

MIT License - 可自由使用、修改和分发

## 技术支持

如有问题或建议，欢迎反馈：

- 查看代码注释了解实现细节
- 使用浏览器开发者工具调试
- 控制台输入 `window.GoldSilverTracker` 查看应用实例

## 更新日志

### v1.0.0 (2026-02-07)
- ✨ 初始版本发布
- 📊 支持金银价格实时显示
- 💱 支持盎司到克的单位转换
- 📈 支持多时间周期K线图
- 🎨 深色主题专业界面
- 📱 完整响应式设计

---

**享受追踪金银价格的乐趣！** ✨
