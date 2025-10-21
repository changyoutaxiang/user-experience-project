# 用户体验拯救项目

这是一个使用 [GitHub Spec Kit](https://github.com/github/spec-kit) 进行规格驱动开发的项目。

## 项目概述

本项目采用规格驱动开发（Spec-Driven Development）方法，通过可执行的规格说明来指导开发流程。

## 快速开始

### 工作流程

使用以下命令来创建和管理项目规格：

1. **建立项目原则** - `/speckit.constitution`
   - 确立项目的指导原则和约束条件

2. **定义需求和用户故事** - `/speckit.specify`
   - 创建基准规格说明

3. **创建技术实施策略** - `/speckit.plan`
   - 制定实施计划

4. **生成可执行任务列表** - `/speckit.tasks`
   - 将计划转化为具体任务

5. **执行任务构建功能** - `/speckit.implement`
   - 实施具体任务

### 可选增强命令

这些命令可以提高规格质量和可信度：

- **`/speckit.clarify`**（可选）
  - 在规划前提出结构化问题以降低歧义风险
  - 建议在 `/speckit.plan` 之前使用

- **`/speckit.analyze`**（可选）
  - 跨制品一致性和对齐报告
  - 建议在 `/speckit.tasks` 之后、`/speckit.implement` 之前使用

- **`/speckit.checklist`**（可选）
  - 生成质量检查清单以验证需求的完整性、清晰度和一致性
  - 建议在 `/speckit.plan` 之后使用

## 项目结构

```
.
├── .claude/              # Claude Code 配置和命令（包含敏感信息，已忽略）
│   ├── commands/         # Spec Kit 命令文件
│   └── settings.local.json
├── .specify/             # Spec Kit 配置和模板
│   ├── memory/          # 项目宪章等持久化内容
│   ├── scripts/         # 辅助脚本
│   └── templates/       # 文档模板
└── .gitignore           # Git 忽略配置
```

## 安全注意事项

⚠️ **重要**: `.claude/` 目录可能包含凭证、认证令牌等敏感信息，已通过 `.gitignore` 排除在版本控制之外。请勿将该目录添加到版本控制系统。

## 要求

- Python 3.11+
- Git
- Claude Code（或其他支持的 AI 编码助手）
- UV 包管理器

## 安装

本项目已使用 UV 包管理器安装 Spec Kit：

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

## 使用方法

1. 在 Claude Code 中打开本项目
2. 使用上述 `/speckit.*` 命令开始规格驱动开发
3. 遵循命令的输出指导完成每个开发阶段

## 开发理念

本项目遵循"意图驱动开发"理念，即在确定"如何做"之前先定义"做什么"。这需要多步骤的精炼过程，而不是单一提示的代码生成。

## 相关资源

- [GitHub Spec Kit 仓库](https://github.com/github/spec-kit)
- [Spec Kit 文档](https://github.com/github/spec-kit/blob/main/README.md)

## 许可证

请参考项目根目录下的 LICENSE 文件（如果有）。

---

**最后更新**: 2025-10-21
