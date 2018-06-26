module.exports = {
  prefixRegex(client) {
    return new RegExp(`^(?:<@!?${client.user.id}>|${client.config.prefix}|@?${client.user.username})\\s?(\\n|.)`, 'i')
  },
  stripPrefix(message) {
    return message.content.replace(this.prefixRegex(message.client), '$1').replace(/\s\s+/g, ' ').trim()
  }
}