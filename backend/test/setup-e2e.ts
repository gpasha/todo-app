import { execSync } from 'node:child_process'

const TEST_DB_SUFFIX = '_test'

function resolveDatabaseName(databaseUrl: string): string {
  const parsed = new URL(databaseUrl)
  return parsed.pathname.replace(/^\//, '')
}

function assertTestDatabase(databaseUrl: string): void {
  const databaseName = resolveDatabaseName(databaseUrl)
  if (!databaseName.endsWith(TEST_DB_SUFFIX)) {
    throw new Error(
      `Отказ: e2e-тесты подключены к базе "${databaseName}", ` +
        `а имя тестовой БД должно заканчиваться на "${TEST_DB_SUFFIX}". ` +
        'Проверьте DATABASE_URL, чтобы не затереть dev-данные.',
    )
  }
}

export default async function globalSetup(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL не задан. Запустите e2e через ./dev.sh test-e2e')
  }
  assertTestDatabase(databaseUrl)
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  })
}
