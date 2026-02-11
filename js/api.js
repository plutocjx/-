// API模块 - 处理所有数据请求
class API {
    constructor() {
        this.cache = new Map();
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000;
        this.usdToCny = CONFIG.conversion.usdToCny;
        this.lastKnownPrice = { gold: null, silver: null };
        // CORS代理列表
        this.corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?url='
        ];
    }

    // 通过CORS代理获取数据
    async fetchViaProxy(url) {
        for (const proxy of this.corsProxies) {
            try {
                const response = await fetch(proxy + encodeURIComponent(url));
                if (response.ok) {
                    return await response.json();
                }
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    // 获取实时汇率（多源）
    async fetchExchangeRate() {
        const cacheKey = 'exchange_rate_usd_cny';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const sources = [
            async () => {
                const r = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
                const d = await r.json();
                return d.usd.cny;
            },
            async () => {
                const r = await fetch('https://open.er-api.com/v6/latest/USD');
                const d = await r.json();
                return d.rates.CNY;
            },
            async () => {
                const r = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const d = await r.json();
                return d.rates.CNY;
            }
        ];

        for (const source of sources) {
            try {
                const rate = await source();
                if (rate && rate > 0) {
                    this.usdToCny = rate;
                    CONFIG.conversion.usdToCny = rate;
                    this.setCache(cacheKey, rate, 3600000);
                    console.log(`汇率已更新: 1 USD = ${rate} CNY`);
                    return rate;
                }
            } catch (e) { continue; }
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
            data = await this.tryMetalsLiveApi(metal)
                || await this.tryGoldApi(metal)
                || await this.tryGoldApiViaProxy(metal);
        }

        if (!data) {
            data = this.getDemoPrice(metal);
        }

        this.lastKnownPrice[metal] = data.priceOz;
        this.setCache(cacheKey, data);
        return data;
    }

    // 数据源1: metals.live
    async tryMetalsLiveApi(metal) {
        try {
            const response = await fetch('https://api.metals.live/v1/spot');
            if (!response.ok) return null;
            const list = await response.json();
            const item = list[0] || list;
            const priceOz = metal === 'gold' ? item.gold : item.silver;
            if (!priceOz) return null;
            console.log(`metals.live ${metal}: $${priceOz}`);
            return this.buildPriceResult(metal, priceOz);
        } catch (e) {
            return null;
        }
    }

    // 数据源2: GoldAPI直连
    async tryGoldApi(metal) {
        try {
            const symbol = metal === 'gold' ? 'XAU' : 'XAG';
            const response = await fetch(`${CONFIG.api.endpoints.goldApi}/${symbol}/USD`, {
                headers: { 'x-access-token': CONFIG.api.goldApiKey }
            });
            if (!response.ok) return null;
            const data = await response.json();
            const result = this.buildPriceResult(metal, data.price);
            result.change = data.ch || 0;
            result.changePercent = data.chp || 0;
            return result;
        } catch (e) {
            return null;
        }
    }

    // 数据源3: GoldAPI通过CORS代理
    async tryGoldApiViaProxy(metal) {
        try {
            const symbol = metal === 'gold' ? 'XAU' : 'XAG';
            const url = `${CONFIG.api.endpoints.goldApi}/${symbol}/USD?x-access-token=${CONFIG.api.goldApiKey}`;
            const data = await this.fetchViaProxy(url);
            if (!data || !data.price) return null;
            const result = this.buildPriceResult(metal, data.price);
            result.change = data.ch || 0;
            result.changePercent = data.chp || 0;
            return result;
        } catch (e) {
            return null;
        }
    }

    buildPriceResult(metal, priceOz) {
        const pricePerGramUSD = priceOz / CONFIG.conversion.ozToGram;
        const premium = CONFIG.conversion.domesticPremium || 1;
        const pricePerGramCNY = pricePerGramUSD * CONFIG.conversion.usdToCny * premium;
        return {
            metal, price: priceOz, priceOz, priceGram: pricePerGramCNY,
            change: 0, changePercent: 0, timestamp: Date.now(),
            currency: 'USD', unit: 'oz'
        };
    }

    // ========== 真实历史K线数据（Yahoo Finance） ==========

    async getHistoricalData(metal = 'gold', timeframe = '1d', limit = 100) {
        const cacheKey = `historical_${metal}_${timeframe}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // 优先获取Yahoo Finance真实数据
        let data = await this.fetchYahooFinanceKline(metal, timeframe);

        // 失败则用模拟数据兜底
        if (!data || data.length === 0) {
            console.warn('真实K线获取失败，使用模拟数据');
            const basePrice = this.lastKnownPrice[metal] || CONFIG.demo.basePrice[metal];
            data = this.generateKlineData(metal, timeframe, limit, basePrice);
        }

        this.setCache(cacheKey, data, 60000); // K线缓存1分钟
        return data;
    }

    // 从Yahoo Finance获取真实K线数据
    async fetchYahooFinanceKline(metal, timeframe) {
        // Yahoo Finance期货代码
        const symbol = metal === 'gold' ? 'GC=F' : 'SI=F';

        // 时间周期映射
        const tfMap = {
            '1m':  { interval: '1m',  range: '1d' },
            '5m':  { interval: '5m',  range: '5d' },
            '1h':  { interval: '1h',  range: '1mo' },
            '1d':  { interval: '1d',  range: '1y' },
            '1w':  { interval: '1wk', range: '5y' },
            '1M':  { interval: '1mo', range: 'max' }
        };

        const tf = tfMap[timeframe] || tfMap['1d'];
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${tf.interval}&range=${tf.range}`;

        try {
            // 先直连
            let data = null;
            try {
                const response = await fetch(url);
                if (response.ok) {
                    data = await response.json();
                }
            } catch (e) {
                // 直连失败，用CORS代理
                data = await this.fetchViaProxy(url);
            }

            if (!data) return null;
            return this.parseYahooFinanceData(data);
        } catch (e) {
            console.warn('Yahoo Finance K线获取失败:', e.message);
            return null;
        }
    }

    // 解析Yahoo Finance返回数据为K线格式
    parseYahooFinanceData(data) {
        try {
            const result = data.chart.result[0];
            const timestamps = result.timestamp;
            const quote = result.indicators.quote[0];

            if (!timestamps || !quote) return null;

            const klineData = [];
            for (let i = 0; i < timestamps.length; i++) {
                const open = quote.open[i];
                const high = quote.high[i];
                const low = quote.low[i];
                const close = quote.close[i];

                // 跳过无效数据
                if (open == null || high == null || low == null || close == null) continue;

                klineData.push({
                    time: timestamps[i],
                    open: parseFloat(open.toFixed(2)),
                    high: parseFloat(high.toFixed(2)),
                    low: parseFloat(low.toFixed(2)),
                    close: parseFloat(close.toFixed(2))
                });
            }

            console.log(`Yahoo Finance K线: ${klineData.length}条数据`);
            return klineData;
        } catch (e) {
            console.warn('解析Yahoo Finance数据失败:', e.message);
            return null;
        }
    }

    // ========== 演示/模拟数据 ==========

    getDemoPrice(metal) {
        const basePrice = CONFIG.demo.basePrice[metal];
        const change = basePrice * (Math.random() - 0.5) * 2 * CONFIG.demo.volatility;
        return this.buildPriceResult(metal, basePrice + change);
    }

    generateKlineData(metal, timeframe, limit, customBasePrice) {
        const basePrice = customBasePrice || CONFIG.demo.basePrice[metal];
        const data = [];
        const now = Date.now();
        const intervals = {
            '1m': 60000, '5m': 300000, '1h': 3600000,
            '1d': 86400000, '1w': 604800000, '1M': 2592000000
        };
        const interval = intervals[timeframe] || intervals['1d'];
        const volatility = basePrice * 0.008;

        let price = basePrice * 0.98;
        for (let i = limit - 1; i >= 0; i--) {
            const time = now - (i * interval);
            const open = price;
            const high = open + Math.random() * volatility;
            const low = open - Math.random() * volatility;
            const close = low + Math.random() * (high - low);
            data.push({
                time: Math.floor(time / 1000),
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2))
            });
            price = close;
        }
        if (data.length > 0 && customBasePrice) {
            const last = data[data.length - 1];
            last.close = parseFloat(customBasePrice.toFixed(2));
            last.high = Math.max(last.high, last.close);
            last.low = Math.min(last.low, last.close);
        }
        return data;
    }

    // ========== 缓存 ==========

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

const api = new API();
