# 生长研究院

## 功能

成长记录、问卷、文章、社区及聊天界面与本地 API 原型。

## 技术栈

Vue 3、uni-app、TypeScript、Pinia、Node.js、Express、sql.js。依赖版本以现有清单和上游兼容要求为准，早期代码可能需要历史版本。

## 目录

src/ 页面、组件和状态；server/ 本地 API 与建表代码；uniCloud-tcb/ 云函数与 schema。

## 启动

在本仓库目录执行；Python 示例需先激活自行创建的虚拟环境。

```sh
npm ci
npm run dev:h5
# 另开终端
cd server
npm ci
node index.js
```

## 公开范围与许可

仅包含脱敏文本源码，不含原 Git 历史、私人绝对路径、凭据、用户数据库/聊天日志、未经逐张审阅的原始图片或二进制媒体。未发布资源不在许可证授权范围内。详见 [LICENSE](LICENSE) 与 [ATTRIBUTION.md](ATTRIBUTION.md)。

维护者有权授权的自有实现代码采用 MIT。第三方依赖、参考实现、团队内容、角色设定与未发布素材不由此重新许可；请同时遵守 ATTRIBUTION.md 所列来源边界。

## 验证与限制

删除全部原始媒体与用户记录，仅保留建表/schema。医学内容及虚构专家署名不代表真实资质；原型鉴权、短信与 AI 配置不适合直接生产部署。

本次执行静态语法/JSON 检查和独立密钥扫描；结果记录在 `VALIDATION.md`。静态通过不代表界面、依赖安装、硬件或端到端运行成功。缺失资源须使用自行创建或获得授权的替代品，不能从原个人素材库自动恢复。
