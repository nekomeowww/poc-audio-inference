import { Format, LogLevel, setGlobalFormat, setGlobalLogLevel, useLogg } from '@guiiai/logg'
import { createApp, createRouter } from 'h3'

import { health } from './controllers/http/v1/health'
import { websocket } from './controllers/ws/ws'
import { initRedis } from './datastore/redis'

setGlobalFormat(Format.Pretty)
setGlobalLogLevel(LogLevel.Log)

initRedis()

const appLogger = useLogg('App').useGlobalConfig()
const app = createApp({ onError: error => appLogger.withError(error).error('an error occurred') })
const router = createRouter()
app.use(router)
app.use(websocket)
app.use(health)

export { app }
