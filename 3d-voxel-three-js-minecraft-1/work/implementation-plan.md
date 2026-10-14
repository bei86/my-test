# 体素古建场景实施计划

目标：交付离线可打开的单 HTML，保留可重建源码。
设计：outputs/场景设计.md。
技术：Three.js、原生 JavaScript、esbuild 内联打包。

1. 在 outputs/voxel-palace 创建 package.json、src/main.js、src/style.css、src/shell.html 与 build.mjs。npm 安装固定版本依赖。
2. 用按材质分组的实例化方块实现建筑与环境。屋面按逐层收分曲线构造，以小体素表达瓦片和上翘檐角；六座建筑中轴对称，铺装道路连接入口与主殿。
3. 实现相机轨道控制、自动环绕、晨昏、复位、响应式界面、WebGL 异常提示。渲染使用方向光阴影与环境光。
4. 构建输出 outputs/青阙·体素古建.html，内嵌全部 JavaScript/CSS，保留 Three.js 许可证。
5. 浏览器验收：离线 file URL 首屏；全貌截图；环绕/晨昏/复位交互；窄屏；无控制台错误；测量稳态帧率和绘制调用数量。未达到目标则按实测调整阴影或像素比。
6. 交付 README，包含双击打开及 npm install / npm run build / npm run dev 命令与实际测试结果。

检查重点：离线无网络请求；低高度窗口全貌不裁切；触摸与鼠标相机边界；WebGL 错误可见；高像素比设备开销受控。
