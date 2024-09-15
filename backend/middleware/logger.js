import { format } from "date-fns"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"
import { fileURLToPath } from 'url'

const fsPromises = fs.promises

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss")
  const logItem = `${dateTime}\t${randomUUID()}\t${message}\n`

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"))
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    )
  } catch (error) {
    console.error(error)
  }
}

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log")
  console.log(`${req.method} ${req.path}`)
  next()
}

export { logger, logEvents }