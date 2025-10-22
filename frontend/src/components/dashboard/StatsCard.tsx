/**
 * StatsCard component for displaying dashboard metrics.
 */
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export const StatsCard = ({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: StatsCardProps) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }

  return (
    <div className={cn('bg-card p-6 rounded-lg border shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {description && (
            <p className={cn('text-sm mt-1', trend && trendColors[trend])}>{description}</p>
          )}
        </div>
        {icon && <div className="ml-4 text-muted-foreground">{icon}</div>}
      </div>
    </div>
  )
}
