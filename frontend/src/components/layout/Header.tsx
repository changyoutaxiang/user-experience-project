/**
 * Header component.
 */
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'

export const Header = () => {
  const { user, logout } = useAuth()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">用户体验拯救项目群管理系统</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.name}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            登出
          </Button>
        </div>
      </div>
    </header>
  )
}
