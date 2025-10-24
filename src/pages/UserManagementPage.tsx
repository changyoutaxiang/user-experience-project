/**
 * UserManagement page for admin user management.
 */
import { useState, useEffect } from 'react'
import { User, UserCreateRequest, UserUpdateRequest, UserRole } from '@/types/user'
import { userService } from '@/services/userService'

export const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userService.listUsers({ skip: 0, limit: 1000 })
      setUsers(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || '获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (data: UserCreateRequest | UserUpdateRequest) => {
    try {
      // 类型断言为 UserCreateRequest，因为这个函数只用于创建
      await userService.createUser(data as UserCreateRequest)
      setShowCreateModal(false)
      await fetchUsers()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || '创建用户失败' }
    }
  }

  const handleUpdateUser = async (userId: string, data: UserUpdateRequest) => {
    try {
      await userService.updateUser(userId, data)
      setEditingUser(null)
      await fetchUsers()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || '更新用户失败' }
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`确定要停用用户 ${user.name} 吗？`)) {
      return
    }

    try {
      await userService.deleteUser(user.id)
      await fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.detail || '停用用户失败')
    }
  }

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === UserRole.ADMIN ? UserRole.MEMBER : UserRole.ADMIN
    const roleText = newRole === UserRole.ADMIN ? '管理员' : '普通成员'

    if (!window.confirm(`确定要将 ${user.name} 的角色更改为${roleText}吗？`)) {
      return
    }

    try {
      await userService.updateUserRole(user.id, newRole)
      await fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.detail || '更新角色失败')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">用户管理</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            创建新用户
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                姓名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                邮箱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={!user.is_active ? 'bg-gray-50 opacity-60' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === UserRole.ADMIN
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === UserRole.ADMIN ? '管理员' : '普通成员'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.is_active ? '启用' : '停用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                      disabled={!user.is_active}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleToggleRole(user)}
                      className="text-purple-600 hover:text-purple-900"
                      disabled={!user.is_active}
                    >
                      {user.role === UserRole.ADMIN ? '降级' : '升级'}
                    </button>
                    {user.is_active && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        停用
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无用户
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <UserFormModal
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
          title="创建新用户"
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserFormModal
          user={editingUser}
          onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
          onCancel={() => setEditingUser(null)}
          title="编辑用户"
          isEdit
        />
      )}
    </div>
  )
}

interface UserFormModalProps {
  user?: User
  onSubmit: (data: UserCreateRequest | UserUpdateRequest) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  title: string
  isEdit?: boolean
}

const UserFormModal = ({ user, onSubmit, onCancel, title, isEdit }: UserFormModalProps) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || UserRole.MEMBER,
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const submitData: any = isEdit
        ? { name: formData.name, role: formData.role }
        : { ...formData }

      const result = await onSubmit(submitData)

      if (!result.success) {
        setError(result.error || '提交失败')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || '提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {!isEdit && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  邮箱 <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  密码 <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">最少 8 个字符</p>
              </div>
            </>
          )}

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">
              角色 <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={UserRole.MEMBER}>普通成员</option>
              <option value={UserRole.ADMIN}>管理员</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
              disabled={submitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? '提交中...' : isEdit ? '更新' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
