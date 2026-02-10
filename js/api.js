// API模块 - 处理所有数据请求
class API {
    constructor() {
        this.cache = new Map();
        this.requestQueue = [];
        this.isRequesting = false;
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 最小请求间隔1秒
        this.usdToCny = CONFIG.conversion.usdToCny; // 初始汇率
    }

    // 获取实时汇率
    async fetchExchangeRate() {
        const cacheKey = 'exchange_rate_usd_cny';
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            // 使用免费汇率API
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (response.ok) {
                const data = await response.json();
                const rate = data.rates.CNY;
                this.usdToCny = rate;
                CONFIG.conversion.usdToCny = rate;
                // 汇率缓存1小时
                this.setCache(cacheKey, rate, 3600000);
                console.log(`汇率已更新: 1 USD = ${rate} CNY`);
                return rate;
            }
        } catch (error) {
            console.warn('获取汇率失败，使用默认汇率:', this.usdToCny);
        }
        return this.usdToCny;
    }

    // 获取实时价格
    async getCurrentPrice(metal = 'gold') {
        const cacheKey = `current_${metal}`;

        // 检查缓存
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        // 确保汇率是最新的
        await this.fetchExchangeRate();

        // 根据配置选择API
        const apiType = CONFIG.getCurrentApi();

        let data;
        if (apiType === 'demo') {
            data = this.getDemoPrice(metal);
        } else {
            data = await this.fetchRealPrice(metal, apiType);
        }

        // 缓存结果
        this.setCache(cacheKey, data);
        return data;
    }

    // 获取历史K线数据
    async getHistoricalData(metal = 'gold', timeframe = '1d', limit = 100) {
        const cacheKey = `historical_${metal}_${timeframe}_${limit}`;

        // 检查缓存
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        // 根据配置选择API
        const apiType = CONFIG.getCurrentApi();

        let data;
        if (apiType === 'demo') {
            data = this.getDemoHistoricalData(metal, timeframe, limit);
        } else {
            data = await this.fetchRealHistoricalData(metal, timeframe, limit, apiType);
        }

        // 缓存结果（历史数据缓存时间更长）
        this.setCache(cacheKey, data, 300000); // 5分钟
        return data;
    }

    // 获取演示价格数据
    getDemoPrice(metal) {
        const basePrice = CONFIG.demo.basePrice[metal];
        const volatility = CONFIG.demo.volatility;

        // 生成随机波动
        const change = basePrice * (Math.random() - 0.5) * 2 * volatility;
        const currentPrice = basePrice + change;

        // 计算涨跌
        const changePercent = (change / basePrice) * 100;

        return {
            metal: metal,
            price: currentPrice,
            priceOz: currentPrice,
            priceGram: currentPrice / CONFIG.conversion.ozToGram * CONFIG.conversion.usdToCny,
            change: change,
            changePercent: changePercent,
            timestamp: Date.now(),
            currency: 'USD',
            unit: 'oz'
        };
    }

    // 生成演示历史数据（可传入自定义基础价格）
    getDemoHistoricalData(metal, timeframe, limit, customBasePrice) {
        const basePrice = customBasePrice || CONFIG.demo.basePrice[metal];
        const data = [];
        const now = Date.now();

        // 根据时间周期计算时间间隔
        const intervals = {
            '1m': 60 * 1000,
            '5m': 5 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000,
            '1w': 7 * 24 * 60 * 60 * 1000,
            '1M': 30 * 24 * 60 * 60 * 1000
        };

        const interval = intervals[timeframe] || intervals['1d'];

        // 生成K线数据
        let currentPrice = basePrice;
        for (let i = limit - 1; i >= 0; i--) {
            const time = now - (i * interval);

            // 随机生成OHLC
            const volatility = basePrice * 0.01; // 1%波动
            const open = currentPrice;
            const high = open + Math.random() * volatility;
            const low = open - Math.random() * volatility;
            const close = low + Math.random() * (high - low);

            data.push({
                time: Math.floor(time / 1000), // Lightweight Charts使用秒级时间戳
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2))
            });

            currentPrice = close;
        }

        return data;
    }

    // 从真实API获取价格（GoldAPI）
    async fetchRealPrice(metal, apiType) {
        try {
            if (apiType === 'goldapi') {
                // GoldAPI使用XAU（黄金）和XAG（白银）作为符号
                const symbol = metal === 'gold' ? 'XAU' : 'XAG';
                const response = await fetch(`${CONFIG.api.endpoints.goldApi}/${symbol}/USD`, {
                    headers: {
                        'x-access-token': CONFIG.api.goldApiKey
                    }
                });

                if (!response.ok) {
                    throw new Error(`API请求失败: ${response.status}`);
                }

                const data = await response.json();
                console.log(`GoldAPI ${metal} 原始数据:`, data);

                const priceOz = data.price;
                const pricePerGramUSD = priceOz / CONFIG.conversion.ozToGram;
                const pricePerGramCNY = pricePerGramUSD * CONFIG.conversion.usdToCny;

                return {
                    metal: metal,
                    price: priceOz,
                    priceOz: priceOz,
                    priceGram: pricePerGramCNY,
                    change: data.ch || 0,
                    changePercent: data.chp || 0,
                    prevClosePrice: data.prev_close_price || 0,
                    openPrice: data.open_price || 0,
                    highPrice: data.high_price || 0,
                    lowPrice: data.low_price || 0,
                    timestamp: Date.now(),
                    currency: 'USD',
                    unit: 'oz'
                };
            } else if (apiType === 'metalsapi') {
                // Metals-API实现
                const symbol = metal === 'gold' ? 'XAU' : 'XAG';
                const response = await fetch(
                    `${CONFIG.api.endpoints.metalsApi}/latest?access_key=${CONFIG.api.metalsApiKey}&base=USD&symbols=${symbol}`
                );

                if (!response.ok) {
                    throw new Error(`API请求失败: ${response.status}`);
                }

                const data = await response.json();
                const price = 1 / data.rates[symbol]; // 转换为USD/oz
                const pricePerGramUSD = price / CONFIG.conversion.ozToGram;
                const pricePerGramCNY = pricePerGramUSD * CONFIG.conversion.usdToCny;

                return {
                    metal: metal,
                    price: price,
                    priceOz: price,
                    priceGram: pricePerGramCNY,
                    change: 0, // Metals-API不提供涨跌数据
                    changePercent: 0,
                    timestamp: Date.now(),
                    currency: 'USD',
                    unit: 'oz'
                };
            }
        } catch (error) {
            console.error('获取真实价格失败，使用演示数据:', error);
            return this.getDemoPrice(metal);
        }
    }

    // 从真实API获取历史数据
    async fetchRealHistoricalData(metal, timeframe, limit, apiType) {
        // 免费API不提供详细的历史K线数据
        // 先获取当前真实价格作为基准，再生成模拟K线
        try {
            const currentData = await this.fetchRealPrice(metal, apiType);
            if (currentData && currentData.priceOz) {
                console.log(`使用真实价格 $${currentData.priceOz} 作为K线基准`);
                return this.getDemoHistoricalData(metal, timeframe, limit, currentData.priceOz);
            }
        } catch (error) {
            console.warn('获取真实价格失败，K线使用默认基准:', error);
        }
        return this.getDemoHistoricalData(metal, timeframe, limit);
    }

    // 缓存管理
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    setCache(key, data, ttl = CONFIG.cache.ttl) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // 请求限流
    async throttledRequest(requestFn) {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve =>
                setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
        }

        this.lastRequestTime = Date.now();
        return await requestFn();
    }
}

// 创建全局API实例
const api = new API();
