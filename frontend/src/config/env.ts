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
 */
function validateEnv(): void {
  const requiredEnvVars = ['VITE_API_BASE_URL'];

  const missingVars = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `缺少必需的环境变量: ${missingVars.join(', ')}\n` +
        '请确保在 .env 文件中设置了这些变量。'
    );
  }

  // 生产环境额外验证
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // 确保生产环境不使用 localhost
    if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
      throw new Error(
        '生产环境不能使用 localhost 作为 API URL！\n' +
          `当前 VITE_API_BASE_URL: ${apiUrl}`
      );
    }

    // 确保使用 HTTPS
    if (!apiUrl.startsWith('https://')) {
      console.warn(
        `⚠️  警告：生产环境建议使用 HTTPS！当前 API URL: ${apiUrl}`
      );
    }
  }
}

/**
 * 获取环境配置
 */
function getConfig(): EnvironmentConfig {
  // 验证环境变量
  validateEnv();

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
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
