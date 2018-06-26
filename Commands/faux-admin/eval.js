const { CodeBlock, Command } = require('faux-classes')

module.exports = class Eval extends Command {
  get name() { return 'eval' }

  async exec(Message, args) {
    try{
      let start = new Date().getTime()
      let msg = CodeBlock.apply(eval(args.join(' ')), 'js')
      let time = new Date().getTime() - start
      Message.channel.send(`Time taken: ${(time/1000)} seconds\n${msg}`)
    }catch(e){
      Message.channel.send(CodeBlock.apply(e.stack, 'js'))
    }
  }

  get permissions() { return ['elevated'] }
  get listed() { return false }

  get helpMeta() { return {
    category: 'Admin',
    description: 'eval hell yeah',
  } }
}