# Railway DATABASE_URL 修复指南

## ❌ 当前问题

```
asyncpg.exceptions.InvalidPasswordError: password authentication failed for user "postgres"
```

**原因**: 手动复制的 DATABASE_URL 密码不正确或格式有误

---

## ✅ 解决方案：使用 Railway 的 Service Reference

### 步骤 1：删除现有的 DATABASE_URL

1. **进入 backend 服务** → **Variables** 标签
2. **找到 `DATABASE_URL` 变量**
3. **点击右侧的删除图标** (垃圾桶或 X)
4. **确认删除**

### 步骤 2：添加 Service Reference

1. **还在 Variables 标签**
2. **点击 "+ New Variable"**
3. **Variable Name**: `PGDATABASE_URL`  (先用临时名称)
4. **点击 "Add a Reference"** 或在值输入框中选择 **"Reference"**
5. **从下拉菜单选择**:
   - Service: `Postgres`
   - Variable: `DATABASE_URL`
6. **保存**

这会创建一个引用: `${{Postgres.DATABASE_URL}}`

### 步骤 3：创建正确格式的 DATABASE_URL

Railway 的引用会给我们 `postgresql://...` 格式，但我们需要 `postgresql+asyncpg://...`

**有两个方法**:

#### 方法 A：在代码中处理（推荐）

修改 backend 代码，自动将 `postgresql://` 转换为 `postgresql+asyncpg://`

#### 方法 B：使用两个变量组合

1. 创建两个 Reference 变量:
   - `PGUSER` → Reference: `Postgres.PGUSER`
   - `PGPASSWORD` → Reference: `Postgres.PGPASSWORD`
   - `PGHOST` → Reference: `Postgres.PGHOST`
   - `PGPORT` → Reference: `Postgres.PGPORT`
   - `PGDATABASE` → Reference: `Postgres.PGDATABASE`

2. 创建一个新的 `DATABASE_URL` 变量:
   ```
   postgresql+asyncpg://${{Postgres.PGUSER}}:${{Postgres.PGPASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
   ```

---

## 🎯 最简单的方法（强烈推荐）

### 修改后端代码自动处理 DATABASE_URL

这样就不需要在 Railway 界面手动拼接了。

**文件**: `backend/src/core/config.py`

在 Settings 类中添加：

```python
@property
def database_url_async(self) -> str:
    """Convert DATABASE_URL to async format for asyncpg"""
    if self.DATABASE_URL.startswith("postgresql://"):
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    return self.DATABASE_URL
```

然后在创建 engine 时使用 `config.database_url_async` 而不是 `config.DATABASE_URL`

---

## 📝 验证步骤

配置完成后：

1. **部署会自动触发**
2. **查看 Deploy Logs**
3. **应该能看到**:
   ```
   INFO  [alembic.runtime.migration] Running upgrade
   Application startup complete
   Uvicorn running on...
   ```
4. **健康检查应该成功** ✅

---

## 🔧 如果还是失败

**检查点**:

1. **Postgres 服务状态**: 必须是 "Active"
2. **Variable Reference 格式**: 应该显示为 `${{Postgres.DATABASE_URL}}`
3. **backend 和 Postgres 在同一个项目中**
4. **网络连接**: backend 应该能访问 `postgres.railway.internal`

---

**选择哪个方法？**

- **时间紧**: 方法 B（手动拼接变量）
- **更稳定**: 修改代码自动处理（我可以帮您实现）

告诉我您选择哪个方法！
