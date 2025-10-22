# 用户体验拯救 项目宪章

<!--
SYNC IMPACT REPORT
==================
Version Change: INITIAL → 1.0.0
Created: 2025-10-21
Ratified: 2025-10-21

Principles Defined:
- Principle I: 规格优先原则 (Specification-First)
- Principle II: 用户场景驱动 (User Scenario Driven)
- Principle III: 增量交付原则 (Incremental Delivery)
- Principle IV: 测试可验证性 (Test Verifiability)
- Principle V: 文档代码同步 (Documentation-Code Sync)

Sections Added:
- 核心原则 (Core Principles) - 5 principles
- 质量标准 (Quality Standards)
- 开发流程 (Development Workflow)
- 治理规则 (Governance)

Templates Status:
- ✅ .specify/templates/plan-template.md - Constitution Check section aligned
- ✅ .specify/templates/spec-template.md - User scenarios and requirements structure aligned
- ✅ .specify/templates/tasks-template.md - Incremental delivery and independent testing aligned
- ✅ .specify/templates/checklist-template.md - Quality verification aligned

Follow-up Actions:
- None - all placeholders filled
- Constitution ready for use with all /speckit.* commands
-->

## 核心原则

### I. 规格优先原则

所有功能开发必须遵循"规格先行"的流程:
- 任何功能实现之前必须先完成规格说明文档(spec.md)
- 规格说明必须包含用户场景、功能需求和成功标准
- 规格说明必须经过评审和澄清,消除歧义
- 不允许"边写边想"或"先实现后补文档"的开发方式

**理由**: 规格驱动开发确保团队在实现前达成共识,减少返工,提高交付质量。

### II. 用户场景驱动

功能设计必须以实际用户场景为中心:
- 每个功能必须对应至少一个清晰的用户故事
- 用户故事必须使用 Given-When-Then 格式定义验收场景
- 用户故事必须按优先级(P1, P2, P3...)排序
- 每个用户故事必须能够独立测试和交付价值
- 禁止创建没有明确用户价值的"技术性"功能

**理由**: 以用户为中心确保我们构建的是用户真正需要的功能,而不是工程师自嗨的技术。

### III. 增量交付原则 (强制要求)

开发必须支持增量式交付和验证:
- 每个用户故事必须设计为独立可交付的增量
- P1 优先级的用户故事完成后即可构成最小可行产品(MVP)
- 任务必须按用户故事分组,每组完成后可独立验证
- 支持并行开发多个独立的用户故事
- 每个增量交付后必须进行独立测试验证

**理由**: 增量交付降低风险,允许早期用户反馈,支持灵活调整优先级。

### IV. 测试可验证性

所有需求和功能必须可测试和可验证:
- 功能需求必须使用明确的验收标准
- 成功标准必须可测量(如"2分钟内完成"、"支持1000并发用户")
- 每个用户故事必须定义清晰的独立测试方法
- 边界条件和错误场景必须明确定义
- 模糊的需求(如"应该"、"可能")必须标记为"需要澄清"

**理由**: 可测试性确保需求明确性,防止理解偏差,支持质量验证。

### V. 文档代码同步

文档和代码必须保持同步:
- 代码实现必须与规格说明一致
- 规格变更必须同步更新相关文档(spec.md, plan.md, tasks.md)
- 实现过程中发现的设计问题必须反馈到规格文档
- 禁止存在"僵尸文档"(过时但未删除的文档)
- 每次提交必须确保文档和代码的一致性

**理由**: 文档代码不一致会导致混乱、误解和维护困难。

## 质量标准

### 文档质量要求

- **规格说明(spec.md)**: 必须包含用户场景、功能需求、成功标准三个核心部分
- **实施计划(plan.md)**: 必须包含技术上下文、项目结构、复杂度追踪
- **任务列表(tasks.md)**: 必须按用户故事分组,标注并行任务和依赖关系
- **所有文档**: 必须使用清晰的中文或英文,避免模糊表述

### 代码质量要求

- 代码必须遵循项目的技术栈和约定(定义在plan.md的技术上下文中)
- 关键功能必须有适当的错误处理和日志记录
- 文件路径和命名必须与tasks.md中的定义一致
- 提交信息必须清晰说明改动内容和原因

### 流程质量要求

- 必须按照 constitution → specify → plan → tasks → implement 的顺序执行
- 每个阶段完成后必须验证输出质量
- 发现问题时必须回溯到相应阶段修正,而不是绕过
- 使用 `/speckit.clarify` 主动消除歧义
- 使用 `/speckit.analyze` 验证跨文档一致性

## 开发流程

### 必需的工作流程

1. **建立原则** (`/speckit.constitution`): 确立或更新项目指导原则
2. **定义需求** (`/speckit.specify`): 创建功能规格说明
3. **可选澄清** (`/speckit.clarify`): 识别并消除规格中的歧义
4. **制定计划** (`/speckit.plan`): 生成技术实施策略
5. **可选检查** (`/speckit.checklist`): 生成质量检查清单
6. **生成任务** (`/speckit.tasks`): 将计划转化为可执行任务
7. **可选分析** (`/speckit.analyze`): 验证跨文档一致性
8. **执行实施** (`/speckit.implement`): 实施具体任务

### 质量门禁

- **规格评审门禁**: spec.md 必须包含所有强制部分且无"需要澄清"标记
- **计划评审门禁**: plan.md 的宪章检查部分必须通过
- **任务评审门禁**: tasks.md 必须正确反映用户故事的优先级和独立性
- **实施验证门禁**: 每个用户故事完成后必须独立测试验证

### 变更管理

- 功能需求变更必须更新 spec.md 并重新生成受影响的下游文档
- 技术方案变更必须更新 plan.md 并评估对 tasks.md 的影响
- 宪章原则变更必须评估对所有现有规格的影响

## 治理规则

### 宪章权威性

- 本宪章优先于所有其他开发实践和约定
- 所有 `/speckit.*` 命令生成的文档必须符合本宪章原则
- 团队成员有责任指出违反宪章原则的行为
- 宪章违规必须有充分的理由并记录在相关文档中

### 修订流程

- 宪章修订必须遵循语义化版本规则:
  - **主版本(MAJOR)**: 删除或重新定义原则,破坏向后兼容性
  - **次版本(MINOR)**: 新增原则或重大扩展
  - **补丁版本(PATCH)**: 澄清说明、修正错别字、非语义改进
- 宪章修订必须更新所有受影响的模板文件
- 宪章修订必须生成同步影响报告
- 重大修订(MAJOR/MINOR)必须评估对现有规格的影响

### 合规审查

- 所有规格文档(spec.md)必须包含宪章原则检查
- 所有实施计划(plan.md)必须包含宪章合规性验证
- 代码评审必须验证实现与规格的一致性
- 定期进行文档审计,清理过时或不一致的文档

### 例外处理

- 如需违反宪章原则,必须在相关文档中明确记录:
  - 违反的具体原则
  - 违反的理由
  - 为何更简单的替代方案不可行
- 例外情况必须记录在 plan.md 的"复杂度追踪"部分
- 例外情况应定期评审,寻求消除或规范化的机会

**版本**: 1.0.0 | **批准日期**: 2025-10-21 | **最后修订**: 2025-10-21
