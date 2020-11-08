import { Logger, TLogLevelName } from 'tslog'

// https://tslog.js.org/#/
const logger = new Logger({
  minLevel: (process.env.LOG_LEVEL as TLogLevelName || "info")
})
export default logger