/**
 * Sidebar navigation component.
 */
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/user'

const navItems = [
  { path: '/dashboard', label: '仪表盘' },
  { path: '/projects', label: '项目看板' },
  { path: '/my-tasks', label: '我的任务' },
]

const adminNavItems = [
  { path: '/admin/users', label: '用户管理' },
  { path: '/admin/audit-logs', label: '操作日志' },
]

export const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuthStore()
  const isAdmin = user?.role === UserRole.ADMIN

  return (
    <aside className="w-64 border-r bg-background min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  'block px-4 py-2 rounded-md hover:bg-accent',
                  location.pathname === item.path && 'bg-accent'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {isAdmin && (
            <>
              <li className="pt-4 pb-2">
                <div className="px-4 text-xs font-semibold text-gray-500 uppercase">
                  管理功能
                </div>
              </li>
              {adminNavItems.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'block px-4 py-2 rounded-md hover:bg-accent',
                      location.pathname === item.path && 'bg-accent'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>
    </aside>
  )
}
