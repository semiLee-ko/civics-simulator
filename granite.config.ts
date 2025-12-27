import { defineConfig } from '@apps-in-toss/framework';

export default defineConfig({
    appId: 'civics-simulator',
    appName: '우당탕탕 시장님',
    appDescription: '내가 시장이 되어 마을의 규칙을 만들어보는 시민 시뮬레이터',
    appVersion: '1.0.0',
    entryPoint: './index.html',
    vite: {
        configFile: './vite.config.js'
    }
});
