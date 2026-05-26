import { app } from './app.js'
import { config } from './config.js'

async function bootstrap() {
  const { seedDatabase } = await import(new URL('../../prisma/seed.ts', import.meta.url).href)
  await seedDatabase()

  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`)
  })
}

void bootstrap().catch((error) => {
  console.error('Failed to bootstrap backend:', error)
  process.exit(1)
})
