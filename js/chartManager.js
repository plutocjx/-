// 图表管理模块 - 使用Lightweight Charts
class ChartManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.candlestickSeries = null;
        this.currentMetal = 'gold';
        this.currentTimeframe = '1d';
        this.isLoading = false;

        this.init();
    }

    // 初始化图表
    init() {
        if (!this.container) {
            console.error('图表容器不存在');
            return;
        }

        // 创建图表
        this.chart = LightweightCharts.createChart(this.container, {
            ...CONFIG.chart.theme,
            width: this.container.clientWidth,
            height: this.container.clientHeight,
            layout: {
                background: { color: CONFIG.chart.theme.layout.background.color },
                textColor: CONFIG.chart.theme.layout.textColor,
            },
            grid: {
                vertLines: { color: CONFIG.chart.theme.grid.vertLines.color },
                horzLines: { color: CONFIG.chart.theme.grid.horzLines.color },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: CONFIG.chart.theme.priceScale.borderColor,
            },
            timeScale: {
                borderColor: CONFIG.chart.theme.timeScale.borderColor,
                timeVisible: true,
                secondsVisible: false,
            },
            localization: {
                locale: 'zh-CN',
                priceFormatter: (price) => {
                    return '$' + price.toFixed(2);
                },
            },
        });

        // 创建K线系列
        this.candlestickSeries = this.chart.addCandlestickSeries({
            upColor: CONFIG.chart.colors.gold.upColor,
            downColor: CONFIG.chart.colors.gold.downColor,
            borderUpColor: CONFIG.chart.colors.gold.borderUpColor,
            borderDownColor: CONFIG.chart.colors.gold.borderDownColor,
            wickUpColor: CONFIG.chart.colors.gold.wickUpColor,
            wickDownColor: CONFIG.chart.colors.gold.wickDownColor,
        });

        // 响应式调整
        this.setupResizeObserver();

        // 加载初始数据
        this.loadData(this.currentMetal, this.currentTimeframe);
    }

    // 加载数据
    async loadData(metal, timeframe) {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.showLoading(true);

        try {
            // 根据时间周期确定数据点数量
            const limits = {
                '1m': 100,
                '5m': 100,
                '1h': 168, // 一周
                '1d': 365, // 一年
                '1w': 104, // 两年
                '1M': 60   // 五年
            };

            const limit = limits[timeframe] || 100;

            // 获取历史数据
            const data = await api.getHistoricalData(metal, timeframe, limit);

            // 更新图表
            if (data && data.length > 0) {
                this.candlestickSeries.setData(data);

                // 自动缩放到合适的视图
                this.chart.timeScale().fitContent();
            } else {
                console.warn('没有可用的历史数据');
            }

        } catch (error) {
            console.error('加载图表数据失败:', error);
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    // 切换金属
    async switchMetal(metal) {
        if (this.currentMetal === metal) {
            return;
        }

        this.currentMetal = metal;

        // 更新K线颜色
        const colors = CONFIG.chart.colors[metal];
        this.candlestickSeries.applyOptions({
            upColor: colors.upColor,
            downColor: colors.downColor,
            borderUpColor: colors.borderUpColor,
            borderDownColor: colors.borderDownColor,
            wickUpColor: colors.wickUpColor,
            wickDownColor: colors.wickDownColor,
        });

        // 重新加载数据
        await this.loadData(metal, this.currentTimeframe);
    }

    // 切换时间周期
    async switchTimeframe(timeframe) {
        if (this.currentTimeframe === timeframe) {
            return;
        }

        this.currentTimeframe = timeframe;

        // 重新加载数据
        await this.loadData(this.currentMetal, timeframe);
    }

    // 更新实时数据点
    updateRealtimeData(priceData) {
        if (!this.candlestickSeries || !priceData) {
            return;
        }

        try {
            // 获取当前时间戳（秒）
            const timestamp = Math.floor(Date.now() / 1000);

            // 创建新的数据点
            const newPoint = {
                time: timestamp,
                open: priceData.priceOz,
                high: priceData.priceOz,
                low: priceData.priceOz,
                close: priceData.priceOz
            };

            // 更新最后一个数据点
            this.candlestickSeries.update(newPoint);

        } catch (error) {
            console.error('更新实时数据失败:', error);
        }
    }

    // 显示/隐藏加载状态
    showLoading(show) {
        const loadingEl = document.getElementById('chartLoading');
        if (loadingEl) {
            if (show) {
                loadingEl.classList.remove('hidden');
            } else {
                loadingEl.classList.add('hidden');
            }
        }
    }

    // 响应式调整
    setupResizeObserver() {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || !this.chart) {
                return;
            }

            const { width, height } = entries[0].contentRect;
            this.chart.applyOptions({
                width: width,
                height: height
            });
        });

        resizeObserver.observe(this.container);

        // 也监听窗口大小变化
        window.addEventListener('resize', () => {
            if (this.chart && this.container) {
                this.chart.applyOptions({
                    width: this.container.clientWidth,
                    height: this.container.clientHeight
                });
            }
        });
    }

    // 获取当前金属
    getCurrentMetal() {
        return this.currentMetal;
    }

    // 获取当前时间周期
    getCurrentTimeframe() {
        return this.currentTimeframe;
    }

    // 销毁图表
    destroy() {
        if (this.chart) {
            this.chart.remove();
            this.chart = null;
        }
        this.candlestickSeries = null;
    }
}

// 全局图表管理器实例（在main.js中初始化）
let chartManager = null;
