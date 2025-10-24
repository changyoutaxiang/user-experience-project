/**
 * 环境变量配置和验证
 */

interface EnvironmentConfig {
  apiUrl: string;
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * 验证必需的环境变量
 * 注意：使用相对路径 /api，不再需要 VITE_API_BASE_URL
 */
function validateEnv(): void {
  // 不再需要验证 API URL，因为我们使用相对路径
  // 前后端在同一个域下部署
}

/**
 * 获取环境配置
 */
function getConfig(): EnvironmentConfig {
  // 验证环境变量
  validateEnv();

  // 使用相对路径，前后端在同一个域下
  const apiBaseUrl = '/api';
  const mode = import.meta.env.MODE || 'development';

  return {
    apiUrl: apiBaseUrl,
    environment: mode,
    isDevelopment: mode === 'development',
    isProduction: mode === 'production',
  };
}

// 导出配置
export const config = getConfig();

// 在开发环境打印配置（方便调试）
if (config.isDevelopment) {
  console.log('🔧 Environment Configuration:', config);
}
