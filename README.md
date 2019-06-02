<div align=center>
  <img src="https://i-need.discord.cards/7734f1.png" alt="logo" align="left" width=300>
  <div>
    <h1>Faux</h1>
    <p>Simple and powerful Discord bot engine</p>
  </div>
  <hr>
  <div>
    <p>Commands loaded from sortable files</p>
    <p>Ready-to-use <code>help</code>, <code>info</code> and <code>eval</code> commands</p>
    <p>Cooldown on commands</p>
    <p>Records command stats</p>
    <p>Small system to store API keys</p>
    <p>Discord Bot List poster built-in</p>
  </div>
</div>
<br>

<div align=center>

  [![Dependencies](https://david-dm.org/Snazzah/Faux.svg)](https://david-dm.org/Snazzah/Faux)

<div>

### Installation
You need to install [**Node.js** (packaged with npm)](https://nodejs.org/en/download/) and [**Redis**](https://redis.io/) for Faux to work.
You can learn how to start your own Redis server [here](https://redis.io/topics/quickstart). It's highly recommended to secure your Redis server with a password.  
Duplicate `_config.json` as `config.json`  
After that, you can run `npm i` in a terminal.

### Usage
This bot is designed to be built out of. You can add/change/remove any files towards your like.

Both `sharding.js` and `main.js` can be used to start the bot.  Alternatively, you can run `npm run start` to start the bot sharded and run `npm run start-noshard` to run without sharding.

### config.json
| Property | Type | Description |
| -------- | ---- | ----------- |
| discordToken | string | The token to the bot, duh. |
| prefix | string | The prefix that the bot will use. |
| elevated | string array | The Discord ID of the person hosting the bot, AKA you. |
| redis.host | object | The host (IP or domain) that Redis is being hosted in. (use `localhost` if your Redis server and you Faux instance is on the same computer) |
| redis.port | object | The port that Redis is occupying. (normally is always 6379) |
| discord | object | The [options](https://discord.js.org/#/docs/main/master/typedef/ClientOptions) for the Discord Client. |
| debug | bool | Whether or not to use verbose logs. |
| botlist | object | Bot list tokens supported by [dbots.js](https://github.com/Snazzah/dbots.js). |
| api | object | API keys that can help with any commands you make that utilize API in any way. |
| sharding.count | number OR `"auto"` | The number of shards to spawn when spawning shards, setting this to `"auto"` will use the recommended amount of shards by Discord. |
| sharding.delay | number | The time in milliseconds to wait before spawning another shard |
| commands | string | The path to the folder where all the commands will be. |
| client_id | string OR `true` | The client ID of the bot. If you are using an older bot application, you can enter the ID here, otherwise setting this to `true` or any other value will use the user ID instead. |
| color_scheme | string | The color integer of the main color that is to be used in commands using embed. |