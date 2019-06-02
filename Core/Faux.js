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
    return '1.1.0';
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
    this.awaitedMessages = {};
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
    let servers = this.isSharded() ? await this.shard.fetchClientValues('guilds.size') : [this.guilds.size];
    return servers.reduce((prev, val) => prev + val, 0);
  }

  get clientID() {
    return typeof this.config.client_id === "string" ? this.config.client_id : this.user.id;
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

  isSharded(){
    return !!this.shard;
  }

  apiKey(name) {
    if(!this.config.api || !this.config.api[name]) return
    return this.config.api[name]
  }

// LOGGING

  get logPrefix() {
    return `${chalk.gray('[')}${this.isSharded() ? `SHARD ${chalk.blue(this.shard.id)}` : 'BOT'}${chalk.gray(']')}`
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

// AWAITING MESSAGES
  
  awaitMessage(msg, callback = () => true, timeout = 30000) {
    let _this = this
    return new Promise((resolve, reject) => {
      if (!this.awaitedMessages[msg.channel.id]) this.awaitedMessages[msg.channel.id] = {};
      let timer;
      if (timeout >= 0) {
        timer = setTimeout(() => {
          delete _this.awaitedMessages[msg.channel.id][msg.author.id];
          reject(new Error(`Request timed out (${timeout}ms)`));
        }, timeout);
      }
      if (this.awaitedMessages[msg.channel.id][msg.author.id]) {
        this.awaitedMessages[msg.channel.id][msg.author.id].reject();   
      }
      this.awaitedMessages[msg.channel.id][msg.author.id] = {
        resolve: function(msg2) {
          clearTimeout(timer);
          delete _this.awaitedMessages[msg.channel.id][msg.author.id];
          resolve(msg2);
        },
        reject: function() { clearTimeout(timer); reject(new Error('Request was overwritten')); },
        callback
      };
    });
  }

  stopAwait(chnId, msgId) {
    if (!this.awaitedMessages[chnId]) return;
    if (!this.awaitedMessages[chnId][msgId]) return;
    if (this.awaitedMessages[chnId][msgId]) {
      this.awaitedMessages[chnId][msgId].reject();   
      delete this.awaitedMessages[chnId][msgId];
    }
  }

  stopAwaitChannel(chnId) {
    if (!this.awaitedMessages[chnId]) return;
    this.util.keyValueForEach(this.awaitedMessages, (k,v) => {
      v.reject();
    });
    delete this.awaitedMessages[chnId];
  }
}