import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
    appName: 'civics-simulator',
    brand: {
        displayName: '우당탕냥 마을',
        primaryColor: '#D4A574ff',
        icon: 'https://static.toss.im/appsintoss/10277/32ed1fca-0c40-44a9-a951-2f7a6a48c604.png',
        bridgeColorMode: 'basic',
    },
    web: {
        host: '0.0.0.0',
        port: 5173,
        commands: {
            dev: 'vite',
            build: 'vite build',
        },
    },
    permissions: [],
    webViewProps: {
        type: 'partner',
    },
    outdir: 'dist',
});
