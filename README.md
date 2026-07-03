# CCF 四川大学学生分会

CCF 四川大学学生分会官方网站，托管于 [GitHub Pages](https://ccf-scu.github.io/)。

## 项目结构

```
├── index.html          # 主页
├── activities.html     # 活动开展时间轴
├── team-history.html   # 历届执委名单
├── css/style.css       # 样式
├── js/main.js          # 交互逻辑
├── fonts/              # HarmonyOS Sans SC 字体
├── favicon/            # 网站图标
├── images/
│   ├── activities/     # 活动照片
│   ├── honors/         # 社团荣誉证书
│   ├── photo/          # 执委照片
│   └── spp/            # SPP 领航计划海报与感谢证书
└── LICENSE
```

## 本地预览

```bash
# 任选一种方式启动本地服务
npx serve .
python -m http.server 8000
```

## 技术栈

- 纯 HTML / CSS / JavaScript，无框架依赖
- HarmonyOS Sans SC 字体
- IntersectionObserver 滚动动画
- 响应式设计（768px / 480px 断点）
