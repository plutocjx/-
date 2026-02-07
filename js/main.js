// 主入口文件 - 初始化应用
(function() {
    'use strict';

    // 应用初始化
    function initApp() {
        console.log('初始化金银价格追踪应用...');

        // 检查API配置
        checkApiConfiguration();

        // 初始化图表管理器
        initChartManager();

        // 初始化UI控制器
        initUIController();

        // 启动价格管理器
        initPriceManager();

        console.log('应用初始化完成');
    }

    // 检查API配置
    function checkApiConfiguration() {
        const apiType = CONFIG.getCurrentApi();

        if (apiType === 'demo') {
            console.warn('⚠️ 当前使用演示模式');
            console.warn('要使用真实数据，请在 js/config.js 中配置API密钥');
            console.warn('GoldAPI注册: https://www.goldapi.io/');
            console.warn('Metals-API注册: https://metals-api.com/');

            // 显示提示消息
            showApiWarning();
        } else {
            console.log(`✓ 使用 ${apiType} API`);
        }
    }

    // 显示API警告
    function showApiWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff9800;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            max-width: 90%;
            text-align: center;
            font-size: 14px;
        `;
        warningDiv.innerHTML = `
            <strong>演示模式</strong><br>
            当前显示的是模拟数据。要查看真实价格，请在 config.js 中配置API密钥。
            <button onclick="this.parentElement.remove()" style="
                margin-left: 15px;
                padding: 5px 15px;
                background: white;
                color: #ff9800;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">知道了</button>
        `;

        document.body.appendChild(warningDiv);

        // 10秒后自动移除
        setTimeout(() => {
            if (warningDiv.parentElement) {
                warningDiv.remove();
            }
        }, 10000);
    }

    // 初始化图表管理器
    function initChartManager() {
        try {
            chartManager = new ChartManager('chartContainer');
            console.log('✓ 图表管理器初始化成功');
        } catch (error) {
            console.error('图表管理器初始化失败:', error);
        }
    }

    // 初始化UI控制器
    function initUIController() {
        try {
            uiController = new UIController();
            console.log('✓ UI控制器初始化成功');
        } catch (error) {
            console.error('UI控制器初始化失败:', error);
        }
    }

    // 初始化价格管理器
    function initPriceManager() {
        try {
            // 启动自动更新
            priceManager.startAutoUpdate();
            console.log('✓ 价格管理器启动成功');
        } catch (error) {
            console.error('价格管理器启动失败:', error);
        }
    }

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
        console.log('清理资源...');

        if (priceManager) {
            priceManager.stopAutoUpdate();
        }

        if (chartManager) {
            chartManager.destroy();
        }
    });

    // 错误处理
    window.addEventListener('error', (event) => {
        console.error('全局错误:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('未处理的Promise拒绝:', event.reason);
    });

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    // 导出到全局（用于调试）
    window.GoldSilverTracker = {
        api,
        priceManager,
        chartManager,
        uiController,
        CONFIG
    };

    console.log('金银价格追踪应用已加载');
    console.log('调试: 使用 window.GoldSilverTracker 访问应用实例');
})();
