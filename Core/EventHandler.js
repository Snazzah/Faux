const Util = require('./Util')

module.exports = class EventHandler {
  constructor(client){
    this.client = client
    client.on('message', this.onMessage.bind(this))
    client.on('guildMemberAdd', this.onMemberJoin.bind(this))
  }

  async onMessage(Message){
    this.client.stats.bumpStat('messages')
    if(Message.author.bot) return;
    if(Message.channel.type !== "dm" && !Message.channel.permissionsFor(this.client.user).has("SEND_MESSAGES")) return

		if (this.client.awaitedMessages.hasOwnProperty(Message.channel.id)
			&& this.client.awaitedMessages[Message.channel.id].hasOwnProperty(Message.author.id)) {
				if (this.client.awaitedMessages[Message.channel.id][Message.author.id].callback(Message)) {
					this.client.awaitedMessages[Message.channel.id][Message.author.id].resolve(Message);
					return;
				}
		}

    if(!Message.content.match(Util.prefixRegex(this.client))) return
    try {
      let args = Util.stripPrefix(Message).split(' ')
      let cname = args.splice(0, 1)[0]
      let command = this.client.cmds.get(cname)
      if(!command) return
      if(await this.client.cmds.processCooldown(Message, cname)) {
        if(command.permissions.includes('attach') && !this.client.attach(Message)) return Message.reply("I need the permission `Attach Files` to use this command!")
        if(command.permissions.includes('embed') && !this.client.embed(Message)) return Message.reply("I need the permission `Embed Links` to use this command!")
        if(command.permissions.includes('elevated') && !this.client.elevated(Message)) return Message.reply("Only the elevated users of the bot can use this command!")
        this.client.stats.bumpStat('commands')
        this.client.stats.bumpCommandStat(command.name)
        command.exec(Message, args)
      } else {
        let cd = await this.client.db.hget(`cooldowns:${Message.author.id}`, command.name)
        Message.reply(`This command needs to cool down! *(${Math.ceil(command.cooldownAbs - (Date.now() - cd))})*`)
      }
    } catch(e) {
      this.client.error('MESSAGE HANDLING ERROR', e);
    }
  }

  async onMemberJoin(){
    this.client.stats.bumpStat('users')
  }
}
