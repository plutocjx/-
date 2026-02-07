// UI控制器 - 处理用户交互和界面更新
class UIController {
    constructor() {
        this.currentMetal = 'gold';
        this.elements = {};
        this.init();
    }

    // 初始化
    init() {
        this.cacheElements();
        this.bindEvents();
        this.subscribeToPriceUpdates();
    }

    // 缓存DOM元素
    cacheElements() {
        // 金属切换按钮
        this.elements.switchBtns = document.querySelectorAll('.switch-btn');

        // 价格卡片
        this.elements.goldCard = document.getElementById('goldCard');
        this.elements.silverCard = document.getElementById('silverCard');

        // 黄金价格元素
        this.elements.goldPriceOz = document.getElementById('goldPriceOz');
        this.elements.goldPriceGram = document.getElementById('goldPriceGram');
        this.elements.goldChangeOz = document.getElementById('goldChangeOz');
        this.elements.goldChangeGram = document.getElementById('goldChangeGram');
        this.elements.goldUpdateTime = document.getElementById('goldUpdateTime');

        // 白银价格元素
        this.elements.silverPriceOz = document.getElementById('silverPriceOz');
        this.elements.silverPriceGram = document.getElementById('silverPriceGram');
        this.elements.silverChangeOz = document.getElementById('silverChangeOz');
        this.elements.silverChangeGram = document.getElementById('silverChangeGram');
        this.elements.silverUpdateTime = document.getElementById('silverUpdateTime');

        // 刷新按钮
        this.elements.refreshBtn = document.getElementById('refreshBtn');
        this.elements.refreshBtnSilver = document.getElementById('refreshBtnSilver');

        // 图表相关
        this.elements.chartTitle = document.getElementById('chartTitle');
        this.elements.timeframeBtns = document.querySelectorAll('.timeframe-btn');

        // 状态消息
        this.elements.statusMessage = document.getElementById('statusMessage');
    }

    // 绑定事件
    bindEvents() {
        // 金属切换
        this.elements.switchBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const metal = e.target.dataset.metal;
                this.switchMetal(metal);
            });
        });

        // 刷新按钮
        this.elements.refreshBtn.addEventListener('click', () => {
            this.refreshPrice('gold');
        });

        this.elements.refreshBtnSilver.addEventListener('click', () => {
            this.refreshPrice('silver');
        });

        // 时间周期切换
        this.elements.timeframeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const timeframe = e.target.dataset.timeframe;
                this.switchTimeframe(timeframe);
            });
        });
    }

    // 订阅价格更新
    subscribeToPriceUpdates() {
        priceManager.subscribe((metal, priceData) => {
            if (metal === 'error') {
                this.showMessage(priceData.message, 'error');
            } else {
                this.updatePriceDisplay(metal, priceData);
            }
        });
    }

    // 切换金属
    switchMetal(metal) {
        if (this.currentMetal === metal) {
            return;
        }

        this.currentMetal = metal;

        // 更新按钮状态
        this.elements.switchBtns.forEach(btn => {
            if (btn.dataset.metal === metal) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 更新卡片激活状态
        if (metal === 'gold') {
            this.elements.goldCard.classList.add('active');
            this.elements.silverCard.classList.remove('active');
            this.elements.chartTitle.textContent = '黄金价格走势';
        } else {
            this.elements.silverCard.classList.add('active');
            this.elements.goldCard.classList.remove('active');
            this.elements.chartTitle.textContent = '白银价格走势';
        }

        // 切换图表
        if (chartManager) {
            chartManager.switchMetal(metal);
        }
    }

    // 切换时间周期
    switchTimeframe(timeframe) {
        // 更新按钮状态
        this.elements.timeframeBtns.forEach(btn => {
            if (btn.dataset.timeframe === timeframe) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 切换图表时间周期
        if (chartManager) {
            chartManager.switchTimeframe(timeframe);
        }
    }

    // 更新价格显示
    updatePriceDisplay(metal, priceData) {
        const elements = metal === 'gold' ? {
            priceOz: this.elements.goldPriceOz,
            priceGram: this.elements.goldPriceGram,
            changeOz: this.elements.goldChangeOz,
            changeGram: this.elements.goldChangeGram,
            updateTime: this.elements.goldUpdateTime
        } : {
            priceOz: this.elements.silverPriceOz,
            priceGram: this.elements.silverPriceGram,
            changeOz: this.elements.silverChangeOz,
            changeGram: this.elements.silverChangeGram,
            updateTime: this.elements.silverUpdateTime
        };

        // 更新盎司价格
        if (elements.priceOz) {
            elements.priceOz.textContent = `$${priceData.priceOz.toFixed(2)}`;
            elements.priceOz.classList.add('flash');
            setTimeout(() => elements.priceOz.classList.remove('flash'), 500);
        }

        // 更新克价格
        if (elements.priceGram) {
            elements.priceGram.textContent = `¥${priceData.priceGram.toFixed(2)}`;
            elements.priceGram.classList.add('flash');
            setTimeout(() => elements.priceGram.classList.remove('flash'), 500);
        }

        // 更新涨跌（盎司）
        if (elements.changeOz && priceData.change !== undefined) {
            const changeInfo = priceManager.formatChange(priceData.changePercent);
            elements.changeOz.className = `price-change ${changeInfo.direction}`;

            const changeValue = elements.changeOz.querySelector('.change-value');
            const changePercent = elements.changeOz.querySelector('.change-percent');

            if (changeValue) {
                changeValue.textContent = `$${Math.abs(priceData.change).toFixed(2)}`;
            }
            if (changePercent) {
                changePercent.textContent = `(${changeInfo.percent})`;
            }
        }

        // 更新涨跌（克）
        if (elements.changeGram && priceData.change !== undefined) {
            const changeGram = priceData.change / CONFIG.conversion.ozToGram * CONFIG.conversion.usdToCny;
            const changeInfo = priceManager.formatChange(priceData.changePercent);
            elements.changeGram.className = `price-change ${changeInfo.direction}`;

            const changeValue = elements.changeGram.querySelector('.change-value');
            const changePercent = elements.changeGram.querySelector('.change-percent');

            if (changeValue) {
                changeValue.textContent = `¥${Math.abs(changeGram).toFixed(2)}`;
            }
            if (changePercent) {
                changePercent.textContent = `(${changeInfo.percent})`;
            }
        }

        // 更新时间
        if (elements.updateTime && priceData.updateTime) {
            elements.updateTime.textContent = `更新时间: ${priceData.updateTime}`;
        }

        // 更新图表实时数据
        if (chartManager && metal === this.currentMetal) {
            chartManager.updateRealtimeData(priceData);
        }
    }

    // 手动刷新价格
    async refreshPrice(metal) {
        try {
            this.showMessage('正在刷新价格...', 'info');
            await priceManager.refreshPrice(metal);
            this.showMessage('价格已更新', 'success');
        } catch (error) {
            this.showMessage('刷新失败，请稍后重试', 'error');
        }
    }

    // 显示消息
    showMessage(message, type = 'info') {
        const messageEl = this.elements.statusMessage;
        if (!messageEl) return;

        messageEl.textContent = message;
        messageEl.className = `status-message ${type}`;
        messageEl.classList.add('show');

        // 3秒后自动隐藏
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    }

    // 获取当前金属
    getCurrentMetal() {
        return this.currentMetal;
    }
}

// 全局UI控制器实例（在main.js中初始化）
let uiController = null;
