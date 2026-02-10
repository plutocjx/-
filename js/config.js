// 配置文件
const CONFIG = {
    // API配置
    api: {
        // 使用免费的金价API - GoldAPI (需要注册获取API密钥)
        // 注册地址: https://www.goldapi.io/
        goldApiKey: 'goldapi-44pl3smlbqy1j2-io', // 请替换为你的API密钥

        // 备用API - Metals-API (需要注册)
        // 注册地址: https://metals-api.com/
        metalsApiKey: 'YOUR_METALS_API_KEY_HERE', // 请替换为你的API密钥

        // API端点
        endpoints: {
            // GoldAPI端点
            goldApi: 'https://www.goldapi.io/api',
            // Metals-API端点
            metalsApi: 'https://metals-api.com/api'
        },

        // 使用哪个API (goldapi 或 metalsapi)
        activeApi: 'goldapi' // 默认使用演示模式
    },

    // 单位转换
    conversion: {
        ozToGram: 31.1035, // 1盎司 = 31.1035克
        usdToCny: 7.3 // 美元到人民币默认汇率（启动后会自动从API获取实时汇率）
    },

    // 更新频率
    updateInterval: 60000, // 60秒更新一次

    // 缓存配置
    cache: {
        ttl: 30000, // 缓存30秒
        storageKey: 'goldSilverPriceCache'
    },

    // 图表配置
    chart: {
        defaultTimeframe: '1d', // 默认日线
        theme: {
            layout: {
                background: { color: '#2a2e39' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: '#363a45' },
                horzLines: { color: '#363a45' },
            },
            crosshair: {
                mode: 0,
            },
            priceScale: {
                borderColor: '#485c7b',
            },
            timeScale: {
                borderColor: '#485c7b',
                timeVisible: true,
                secondsVisible: false,
            },
        },
        // 金色和银色配置（中国标准：红涨绿跌）
        colors: {
            gold: {
                upColor: '#ef5350',
                downColor: '#26a69a',
                borderUpColor: '#ef5350',
                borderDownColor: '#26a69a',
                wickUpColor: '#ef5350',
                wickDownColor: '#26a69a',
            },
            silver: {
                upColor: '#ef5350',
                downColor: '#26a69a',
                borderUpColor: '#ef5350',
                borderDownColor: '#26a69a',
                wickUpColor: '#ef5350',
                wickDownColor: '#26a69a',
            }
        }
    },

    // 演示模式配置（当没有API密钥时使用）
    demo: {
        enabled: true,
        basePrice: {
            gold: 2650, // 黄金基础价格（美元/盎司）
            silver: 31.5 // 白银基础价格（美元/盎司）
        },
        // 价格波动范围（百分比）
        volatility: 0.002 // 0.2%的随机波动
    }
};

// 检查API密钥是否配置
CONFIG.hasValidApiKey = function() {
    return this.api.goldApiKey !== 'YOUR_GOLDAPI_KEY_HERE' ||
           this.api.metalsApiKey !== 'YOUR_METALS_API_KEY_HERE';
};

// 获取当前使用的API
CONFIG.getCurrentApi = function() {
    if (!this.hasValidApiKey()) {
        return 'demo';
    }
    return this.api.activeApi;
};
