/**
 * ProjectMemberPicker component for managing project members.
 */
import { useState, useEffect } from 'react'
import { ProjectMember } from '@/types/project'
import { User } from '@/types/user'
import { userService } from '@/services/userService'
import { projectService } from '@/services/projectService'

interface ProjectMemberPickerProps {
  projectId: string
  members: ProjectMember[]
  onMembersChange: () => void
}

export const ProjectMemberPicker = ({ projectId, members, onMembersChange }: ProjectMemberPickerProps) => {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const users = await userService.listUsers({ is_active: true })
      setAllUsers(users)
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
      setError('获取用户列表失败')
    }
  }

  const handleAddMember = async () => {
    if (!selectedUserId) return

    setLoading(true)
    setError(null)

    try {
      await projectService.addMember(projectId, { user_id: selectedUserId })
      setSelectedUserId('')
      onMembersChange()
    } catch (err: any) {
      setError(err.response?.data?.detail || '添加成员失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('确定要移除该成员吗？')) return

    setLoading(true)
    setError(null)

    try {
      await projectService.removeMember(projectId, userId)
      onMembersChange()
    } catch (err: any) {
      setError(err.response?.data?.detail || '移除成员失败')
    } finally {
      setLoading(false)
    }
  }

  // Filter out users who are already members
  const availableUsers = allUsers.filter(
    user => !members.some(member => member.user_id === user.id)
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">项目成员</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Current Members List */}
      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-gray-500 text-sm">暂无项目成员</p>
        ) : (
          members.map(member => (
            <div
              key={member.user_id}
              className="flex items-center justify-between p-3 border rounded-md bg-white"
            >
              <div>
                <p className="font-medium">{member.user.name}</p>
                <p className="text-sm text-gray-500">
                  加入时间: {new Date(member.assigned_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <button
                onClick={() => handleRemoveMember(member.user_id)}
                disabled={loading}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
              >
                移除
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Member Form */}
      {availableUsers.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">添加成员</h4>
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">选择用户</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddMember}
              disabled={!selectedUserId || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '添加中...' : '添加'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
