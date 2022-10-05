const process = require('process')
const commander = require('commander')
const app = require('../../app')
const packageJson = require('../../../package.json')
const { mainModule, argv } = require('process')
// programName is the name of the executable.
const programName = 'streamrExporter'


async function main(argv){
    const program = new commander.Command()
	program.name(programName)
    program.description('Prometheus Exporter for multichain wallet balances')
	program.version(packageJson.version, '-v', 'print version')
	program.helpOption('-h', 'print help message')
    program.addOption(new commander.Option('-p <number>', 'port number').env('PORT'))
	program.addOption(new commander.Option('-l <log level>', 'log level').default('info', 'options are: trace, debug, info, warn, error, and fatal').env('LOG_LEVEL'))
	program.parse(argv)
    const options = program.opts()
	if (options.h) {
		program.help({
			error: true,
		})
	}
	if (options.v) {
		process.stdout.write(`${packageJson.version}\n`)
		process.exit(0)
	}
	if (options.p) {
		const min = 1
		const max = 65535
		if (options.p < min || options.p > max) {
			process.stderr.write(`${program.name()}: HTTP port range is ${min} - ${max}\n`)
			process.exit(1)
		}
	} else {
		process.stderr.write(`${program.name()}: HTTP port is required.\n`)
		process.exit(1)
	}
    const srv = new app.StreamrExporter({
        logLevel: options.l,
        port: options.p
    })
    srv.listen()
}
main(process.argv).catch((e) => {
	process.stderr.write(`${programName}: unknown error: ${e.message}\n`)
	process.stderr.write(`${programName}: ${e.stack}\n`)
	process.exit(1)
})