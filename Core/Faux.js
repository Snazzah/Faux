const Discord = require('discord.js')
const dbots = require('dbots')
const Database = require('./Database')
const EventHandler = require('./EventHandler')
const CommandLoader = require('./CommandLoader')
const StatTracker = require('./StatTracker')
const path = require('path')
const chalk = require('chalk')

module.exports = class Faux extends Discord.Client {
  get FAUX_VER() {
    return '1.0.1';
  }

  constructor({configPath, packagePath, mainDir} = {}) {
    let config = require(configPath || `${mainDir}/config.json`)
    let pkg = require(packagePath || `${mainDir}/package.json`)
    Object.assign(config.discord, {
      userAgent: { version: pkg.version }
    })
    if(process.env.SHARDING_MANAGER) Object.assign(config.discord, {
      shardCount: parseInt(process.env.TOTAL_SHARD_COUNT),
      shardId: parseInt(process.env.SHARDS)
    })
    super(config.discord)
    this.dir = mainDir
    this.config = config
    this.pkg = pkg
    this.on('ready', () => this.log(chalk.green('Logged in')))
    this.on('warn', s => this.warn('WARN', s))
    this.on('error', s => this.error('ERROR', s))
    this.on('disconnected', () => this.log('Disconnected'))
    this.on('reconnecting', () => this.warn('Reconnecting'))
    this.on('resume', r => this.warn(`Resumed. ${r} events were replayed.`))
    if(this.config.debug) this.on('debug', s => this.debug(s))

    process.once('uncaughtException', err => {
      this.error('Uncaught Exception:', err.stack)
      setTimeout(() => process.exit(0), 2500)
    })

    this.log(chalk.green('Client initialized.'))
  }

  async serverCount() {
    let servers = process.env.SHARDING_MANAGER ? await this.client.shard.fetchClientValues('guilds.size') : [this.client.guilds.size];
    return servers.reduce((prev, val) => prev + val, 0);
  }

  async start() {
    this.db = new Database(this)
    this.db.connect(this.config.redis)
    await this.login()
    this.stats = new StatTracker(this)
    this.cmds = new CommandLoader(this, path.join(this.dir, this.config.commands), this.config.debug)
    this.cmds.reload()
    this.cmds.preloadAll()
    this.eventHandler = new EventHandler(this)
    this.initPoster()
  }

  initPoster(){
    if(!this.config.botlist || JSON.stringify(this.config.botlist) === '{}') return;
    this.poster = new dbots.Poster({
      client: this,
      apiKeys: this.config.botlist,
      clientLibrary: 'discord.js'
    });

    this.poster.post()
    this.poster.startInterval()
  }

  login() {
    return super.login(this.config.discordToken)
  }

  apiKey(name) {
    if(!this.config.api || !this.config.api[name]) return
    return this.config.api[name]
  }

// LOGGING

  get logPrefix() {
    return `${chalk.gray('[')}${process.env.SHARDING_MANAGER ? `SHARD ${chalk.magenta(process.env.SHARDS)}` : 'BOT'}${chalk.gray(']')}`
  }

  log(...a) {
    return console.log(this.logPrefix, ...a)
  }

  warn(...a) {
    return console.warn(this.logPrefix, chalk.yellow(...a))
  }

  error(...a) {
    return console.error(this.logPrefix, chalk.red(...a))
  }

  debug(...a) {
    return console.debug(this.logPrefix, chalk.magenta(...a))
  }

// CHECK PERMS

  embed(message){
    return message.channel.type !== "text" || message.channel.permissionsFor(this.user).has("EMBED_LINKS")
  }

  attach(message){
    return message.channel.type !== "text" || message.channel.permissionsFor(this.user).has("ATTACH_FILES")
  }

  emoji(message){
    return message.channel.type !== "text" || message.channel.permissionsFor(this.user).has("USE_EXTERNAL_EMOJIS")
  }

  elevated(message){
    return this.config.elevated.includes(message.author.id)
  }
}