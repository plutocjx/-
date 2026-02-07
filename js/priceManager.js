// 价格管理模块 - 处理价格更新和通知
class PriceManager {
    constructor() {
        this.prices = {
            gold: null,
            silver: null
        };
        this.subscribers = [];
        this.updateTimer = null;
        this.isUpdating = false;
        this.updateInterval = CONFIG.updateInterval;
        this.isPageVisible = true;

        // 监听页面可见性
        this.setupVisibilityListener();
    }

    // 订阅价格更新
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    // 通知所有订阅者
    notify(metal, priceData) {
        this.subscribers.forEach(callback => {
            try {
                callback(metal, priceData);
            } catch (error) {
                console.error('通知订阅者失败:', error);
            }
        });
    }

    // 开始自动更新
    startAutoUpdate() {
        if (this.updateTimer) {
            return;
        }

        // 立即更新一次
        this.updateAllPrices();

        // 设置定时更新
        this.updateTimer = setInterval(() => {
            if (this.isPageVisible && !this.isUpdating) {
                this.updateAllPrices();
            }
        }, this.updateInterval);

        console.log('价格自动更新已启动');
    }

    // 停止自动更新
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
            console.log('价格自动更新已停止');
        }
    }

    // 更新所有价格
    async updateAllPrices() {
        if (this.isUpdating) {
            return;
        }

        this.isUpdating = true;

        try {
            // 并行获取金价和银价
            const [goldData, silverData] = await Promise.all([
                api.getCurrentPrice('gold'),
                api.getCurrentPrice('silver')
            ]);

            // 更新金价
            if (goldData) {
                this.updatePrice('gold', goldData);
            }

            // 更新银价
            if (silverData) {
                this.updatePrice('silver', silverData);
            }

        } catch (error) {
            console.error('更新价格失败:', error);
            this.notify('error', { message: '价格更新失败，请稍后重试' });
        } finally {
            this.isUpdating = false;
        }
    }

    // 更新单个金属价格
    async updatePrice(metal, priceData = null) {
        try {
            // 如果没有提供数据，则从API获取
            if (!priceData) {
                priceData = await api.getCurrentPrice(metal);
            }

            // 保存旧价格用于比较
            const oldPrice = this.prices[metal];

            // 更新价格
            this.prices[metal] = {
                ...priceData,
                updateTime: new Date().toLocaleString('zh-CN')
            };

            // 如果有旧价格，计算涨跌
            if (oldPrice) {
                const priceDiff = priceData.priceOz - oldPrice.priceOz;
                const percentDiff = (priceDiff / oldPrice.priceOz) * 100;

                this.prices[metal].change = priceDiff;
                this.prices[metal].changePercent = percentDiff;
            }

            // 通知订阅者
            this.notify(metal, this.prices[metal]);

            return this.prices[metal];

        } catch (error) {
            console.error(`更新${metal}价格失败:`, error);
            throw error;
        }
    }

    // 手动刷新价格
    async refreshPrice(metal) {
        // 清除该金属的缓存
        api.clearCache();

        // 更新价格
        return await this.updatePrice(metal);
    }

    // 获取当前价格
    getPrice(metal) {
        return this.prices[metal];
    }

    // 格式化价格显示
    formatPrice(price, decimals = 2) {
        if (price === null || price === undefined) {
            return '--';
        }
        return price.toFixed(decimals);
    }

    // 格式化涨跌显示
    formatChange(change, decimals = 2) {
        if (change === null || change === undefined || change === 0) {
            return { value: '--', percent: '--', direction: 'neutral' };
        }

        const direction = change > 0 ? 'up' : 'down';
        const sign = change > 0 ? '+' : '';

        return {
            value: `${sign}${change.toFixed(decimals)}`,
            percent: `${sign}${(change).toFixed(decimals)}%`,
            direction: direction
        };
    }

    // 单位转换
    convertOzToGram(priceOz) {
        return priceOz / CONFIG.conversion.ozToGram;
    }

    convertToRMB(priceUSD) {
        return priceUSD * CONFIG.conversion.usdToCny;
    }

    // 页面可见性监听
    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = !document.hidden;

            if (this.isPageVisible) {
                console.log('页面可见，恢复更新');
                // 页面重新可见时立即更新
                this.updateAllPrices();
            } else {
                console.log('页面隐藏，暂停更新');
            }
        });
    }

    // 销毁
    destroy() {
        this.stopAutoUpdate();
        this.subscribers = [];
        this.prices = { gold: null, silver: null };
    }
}

// 创建全局价格管理器实例
const priceManager = new PriceManager();
