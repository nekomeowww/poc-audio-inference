import type { InputLayer } from 'h3'
import { appendResponseHeader, defineEventHandler } from 'h3'

export const health: InputLayer = {
  route: '/health',
  handler: defineEventHandler(async (event) => {
    appendResponseHeader(event, 'Connection', 'close')
    return { status: 'healthy' }
  }),
} satisfies InputLayer
