import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'child_process'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import yargs from 'yargs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { say } = cfonts

const rl = createInterface(process.stdin, process.stdout)

say('Lute Bot MD', {
  font: 'block',
  align: 'center',
  gradient: ['blue', 'green']
})

say('WhatsApp Bot - By Zero1074', {
  font: 'console',
  align: 'center',
  gradient: ['blue', 'green']
})

let isRunning = false
/**
 * Start a child process for the bot
 */
function start(file) {
  if (isRunning) return
  isRunning = true
  
  const args = [path.join(__dirname, file), ...process.argv.slice(2)]
  setupMaster({
    exec: args[0],
    args: args.slice(1),
  })
  
  const p = fork()
  p.on('message', (data) => {
    console.log('[RECEIVED]', data)
    switch (data) {
      case 'reset':
        p.kill()
        isRunning = false
        start(file)
        break
      case 'uptime':
        p.send(process.uptime())
        break
    }
  })
  
  p.on('exit', (code) => {
    isRunning = false
    console.error('Ocurrió un error inesperado:', code)
    
    p.kill()
    isRunning = false
    start(file)
    
    if (code === 0) return
    
    watchFile(args[0], () => {
      unwatchFile(args[0])
      start(file)
    })
  })
}

const opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
if (!opts['test']) {
  if (!rl.listenerCount()) rl.on('line', (line) => {
    switch (line.toLowerCase()) {
      case 'exit':
        rl.close()
        process.exit(0)
        break
      case 'restart':
        process.send('restart')
        break
      default:
        console.log('Comando no reconocido')
    }
  })
}

start('main.js')
