# 旧站迁移

## 已完成结果

迁移脚本只读解析旧 HTML，生成并校验：

- 26 条活动 Markdown；
- 203 条历届成员记录；
- 12 条荣誉记录；
- 46 张经 Sharp 转换的 WebP 图片；
- `migrations/legacy-content-manifest.json` 来源、目标、哈希和异常清单；
- `activities.html`、`team-history.html`、`team-building.html` 兼容入口。

旧源文件和原图未删除。缺失的个人简介没有猜测，成员资料以 `profileConfirmed: false` 标记待确认。迁移图片写入 `public/uploads/legacy/`，精选公共素材写入 `public/uploads/featured/`。

## 可复现命令

```text
npm run migrate:legacy
npm run optimize:legacy
npm run validate:content
```

脚本应保持幂等；再次运行前先查看 Git diff，防止覆盖人工校正后的内容。人工校正后如需重跑，先复制到任务分支并比较 manifest。

## 上线前抽查

内容负责人必须抽查全部活动标题与日期、每届成员姓名和职务、荣誉原文、封面对应关系、照片授权与对外联系方式。旧 URL 逐个访问，确认兼容页到正确新入口。任何不确定个人信息继续隐藏或标记未确认。
