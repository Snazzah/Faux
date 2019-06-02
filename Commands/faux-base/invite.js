const { Command } = require('faux-classes')

module.exports = class Invite extends Command {
  get name() { return 'invite' }
  get aliases() { return ['✉', 'botinvite', 'botinv', 'inv'] }
  get cooldown() { return 0 }

  exec(message, args) {
    message.channel.send(`https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=32768`)
  }

  get helpMeta() { return {
    category: 'General',
    description: 'Gets the bot invite link.'
  } }
}