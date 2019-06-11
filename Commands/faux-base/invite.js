const { Command } = require('faux-classes')

module.exports = class Invite extends Command {
  get name() { return 'invite' }
  get aliases() { return ['✉', 'botinvite', 'botinv', 'inv'] }
  get cooldown() { return 0 }

  exec(message) {
    message.channel.send(`You can invite the bot using this link: <https://discordapp.com/oauth2/authorize?client_id=${this.client.clientID}&scope=bot>\n` + 
                        `Remember: You can only invite me in servers that you can manage!`)
  }

  get helpMeta() { return {
    category: 'General',
    description: 'Gets the bot invite link.'
  } }
}