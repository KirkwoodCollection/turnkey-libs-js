export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig<T> {
  development: T;
  staging: T;
  production: T;
}

// Environment suffix mapping for resource naming consistency
// Following GPT-5 guidance: production uses 'prod' suffix
export const ENV_SUFFIX_MAP = {
  development: '', // No suffix for development
  staging: 'staging',
  production: 'prod' // Changed from 'production' to 'prod' per GPT-5 standard
} as const;

export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV || 'development';
  if (['development', 'staging', 'production'].includes(env)) {
    return env as Environment;
  }
  return 'development';
}

export function getConfig<T>(envConfig: EnvironmentConfig<T>): T {
  const env = getEnvironment();
  return envConfig[env];
}

export function getConfigForEnvironment<T>(envConfig: EnvironmentConfig<T>, environment: Environment): T {
  return envConfig[environment];
}

/**
 * Get the standardized environment suffix for resource naming
 * @param env - Environment to get suffix for
 * @returns Environment suffix or empty string for development
 */
export function getEnvironmentSuffix(env: Environment): string {
  return ENV_SUFFIX_MAP[env];
}

/**
 * Append environment suffix to a resource name using standardized format
 * @param baseName - Base resource name
 * @param env - Environment to append suffix for (defaults to current environment)
 * @returns Resource name with environment suffix if applicable
 *
 * @example
 * appendEnvironmentSuffix('booking-events', 'production') // 'booking-events-prod'
 * appendEnvironmentSuffix('session-topic', 'development') // 'session-topic'
 */
export function appendEnvironmentSuffix(baseName: string, env?: Environment): string {
  const environment = env || getEnvironment();
  const suffix = getEnvironmentSuffix(environment);
  return suffix ? `${baseName}-${suffix}` : baseName;
}

/**
 * Create environment-aware resource name with optional custom separator
 * @param baseName - Base resource name
 * @param env - Environment
 * @param separator - Custom separator (defaults to '-')
 * @returns Formatted resource name
 */
export function createEnvironmentResourceName(
  baseName: string,
  env?: Environment,
  separator: string = '-'
): string {
  const environment = env || getEnvironment();
  const suffix = getEnvironmentSuffix(environment);
  return suffix ? `${baseName}${separator}${suffix}` : baseName;
}