import type { RedisClientType } from 'redis'
import { env } from 'node:process'
import { useLogg } from '@guiiai/logg'
import { createClient } from 'redis'

export type Redis = Awaited<ReturnType<RedisClientType['connect']>>

let client: Redis

export async function initRedis() {
  client = await createClient({
    url: env.REDIS_URL ?? `redis://${env.REDIS_USER ?? 'default'}:${env.REDIS_PASSWORD}@${env.REDIS_HOST ?? 'localhost'}:${env.REDIS_PORT ?? '6379'}`,
  })
    .on('error', err => useLogg('redis').useGlobalConfig().withError(err).error('an error occurred'))
    .connect() as Redis

  await client.ping()
}

export function useRedis() {
  return client
}
