// API模块 - 处理所有数据请求
class API {
    constructor() {
        this.cache = new Map();
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000;
        this.usdToCny = CONFIG.conversion.usdToCny;
        // 保存最后获取到的真实价格，供K线图使用
        this.lastKnownPrice = { gold: null, silver: null };
    }

    // 获取实时汇率
    async fetchExchangeRate() {
        const cacheKey = 'exchange_rate_usd_cny';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (response.ok) {
                const data = await response.json();
                const rate = data.rates.CNY;
                this.usdToCny = rate;
                CONFIG.conversion.usdToCny = rate;
                this.setCache(cacheKey, rate, 3600000);
                console.log(`汇率已更新: 1 USD = ${rate} CNY`);
                return rate;
            }
        } catch (e) {
            console.warn('获取汇率失败，使用默认汇率:', this.usdToCny);
        }
        return this.usdToCny;
    }

    // 获取实时价格（多数据源自动切换）
    async getCurrentPrice(metal = 'gold') {
        const cacheKey = `current_${metal}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        await this.fetchExchangeRate();

        const apiType = CONFIG.getCurrentApi();
        let data = null;

        if (apiType !== 'demo') {
            // 依次尝试多个数据源
            data = await this.tryMetalsLiveApi(metal)
                || await this.tryGoldApi(metal)
                || await this.tryGoldApiViaProxy(metal);
        }

        // 所有API都失败，使用演示数据
        if (!data) {
            console.warn(`所有API均失败，${metal}使用演示数据`);
            data = this.getDemoPrice(metal);
        }

        // 保存最后已知价格
        this.lastKnownPrice[metal] = data.priceOz;
        this.setCache(cacheKey, data);
        return data;
    }

    // 数据源1: metals.live（免费，无需密钥）
    async tryMetalsLiveApi(metal) {
        try {
            const response = await fetch('https://api.metals.live/v1/spot');
            if (!response.ok) return null;

            const list = await response.json();
            // 返回格式: [{gold: 5028.5, silver: 32.1, ...}]
            const item = list[0] || list;
            const priceOz = metal === 'gold' ? item.gold : item.silver;

            if (!priceOz) return null;
            console.log(`metals.live ${metal}: $${priceOz}`);
            return this.buildPriceResult(metal, priceOz);
        } catch (e) {
            console.warn('metals.live API失败:', e.message);
            return null;
        }
    }

    // 数据源2: GoldAPI（直连）
    async tryGoldApi(metal) {
        try {
            const symbol = metal === 'gold' ? 'XAU' : 'XAG';
            const response = await fetch(`${CONFIG.api.endpoints.goldApi}/${symbol}/USD`, {
                headers: { 'x-access-token': CONFIG.api.goldApiKey }
            });
            if (!response.ok) return null;

            const data = await response.json();
            console.log(`GoldAPI ${metal}: $${data.price}`);
            const result = this.buildPriceResult(metal, data.price);
            result.change = data.ch || 0;
            result.changePercent = data.chp || 0;
            return result;
        } catch (e) {
            console.warn('GoldAPI直连失败:', e.message);
            return null;
        }
    }

    // 数据源3: GoldAPI（通过CORS代理）
    async tryGoldApiViaProxy(metal) {
        try {
            const symbol = metal === 'gold' ? 'XAU' : 'XAG';
            const targetUrl = `${CONFIG.api.endpoints.goldApi}/${symbol}/USD`;
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl + '?x-access-token=' + CONFIG.api.goldApiKey)}`;

            const response = await fetch(proxyUrl);
            if (!response.ok) return null;

            const data = await response.json();
            if (!data.price) return null;
            console.log(`GoldAPI(代理) ${metal}: $${data.price}`);
            const result = this.buildPriceResult(metal, data.price);
            result.change = data.ch || 0;
            result.changePercent = data.chp || 0;
            return result;
        } catch (e) {
            console.warn('GoldAPI代理失败:', e.message);
            return null;
        }
    }

    // 构建标准价格结果
    buildPriceResult(metal, priceOz) {
        const pricePerGramCNY = (priceOz / CONFIG.conversion.ozToGram) * CONFIG.conversion.usdToCny;
        return {
            metal,
            price: priceOz,
            priceOz,
            priceGram: pricePerGramCNY,
            change: 0,
            changePercent: 0,
            timestamp: Date.now(),
            currency: 'USD',
            unit: 'oz'
        };
    }

    // 获取历史K线数据
    async getHistoricalData(metal = 'gold', timeframe = '1d', limit = 100) {
        const cacheKey = `historical_${metal}_${timeframe}_${limit}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // 使用最后已知的真实价格作为K线基准
        let basePrice = this.lastKnownPrice[metal];

        // 如果还没有真实价格，尝试获取一次
        if (!basePrice) {
            try {
                const priceData = await this.getCurrentPrice(metal);
                basePrice = priceData.priceOz;
            } catch (e) {
                basePrice = null;
            }
        }

        const data = this.generateKlineData(metal, timeframe, limit, basePrice);
        this.setCache(cacheKey, data, 300000);
        return data;
    }

    // 获取演示价格数据
    getDemoPrice(metal) {
        const basePrice = CONFIG.demo.basePrice[metal];
        const change = basePrice * (Math.random() - 0.5) * 2 * CONFIG.demo.volatility;
        const currentPrice = basePrice + change;
        return this.buildPriceResult(metal, currentPrice);
    }

    // 生成K线数据
    generateKlineData(metal, timeframe, limit, customBasePrice) {
        const basePrice = customBasePrice || CONFIG.demo.basePrice[metal];
        const data = [];
        const now = Date.now();

        const intervals = {
            '1m': 60 * 1000,
            '5m': 5 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000,
            '1w': 7 * 24 * 60 * 60 * 1000,
            '1M': 30 * 24 * 60 * 60 * 1000
        };

        const interval = intervals[timeframe] || intervals['1d'];
        const volatility = basePrice * 0.008; // 0.8%波动

        let currentPrice = basePrice * (1 - 0.02); // 从略低于当前价开始
        for (let i = limit - 1; i >= 0; i--) {
            const time = now - (i * interval);
            const trend = (limit - i) / limit * 0.02; // 轻微上升趋势
            const open = currentPrice;
            const high = open + Math.random() * volatility;
            const low = open - Math.random() * volatility;
            const close = low + Math.random() * (high - low) + basePrice * trend * 0.001;

            data.push({
                time: Math.floor(time / 1000),
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2))
            });
            currentPrice = close;
        }

        // 确保最后一根K线的收盘价接近真实价格
        if (data.length > 0 && customBasePrice) {
            const last = data[data.length - 1];
            last.close = parseFloat(customBasePrice.toFixed(2));
            last.high = Math.max(last.high, last.close);
            last.low = Math.min(last.low, last.close);
        }

        return data;
    }

    // 缓存管理
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }

    setCache(key, data, ttl = CONFIG.cache.ttl) {
        this.cache.set(key, { data, timestamp: Date.now(), ttl });
    }

    clearCache() {
        this.cache.clear();
    }
}

// 创建全局API实例
const api = new API();
