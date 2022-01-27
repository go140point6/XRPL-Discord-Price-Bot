const Discord = require('discord.js');
const xrpl = require('xrpl');

require('dotenv').config();

const client = new Discord.Client({ intents: ["GUILDS"] });

const c = require('./constants');

var token = {
  Bid: 0,
  Ask: 0,
  UpdatePrice: async function () {
      try{
            const client = new xrpl.Client('wss://xrplcluster.com');  
            await client.connect();
            const reqAsk = {
                "command": "book_offers",
                "taker_gets": {
                "currency": c.TOKEN_CURRENCY,
                "issuer": c.TOKEN_ISSUER
                },
                "taker_pays": {
                "currency": "XRP"
                },
                "limit": 1
            }

            const reqBid = {
                "command": "book_offers",
                "taker_gets": {
                    "currency": "XRP"
                },
                "taker_pays": {
                "currency": c.TOKEN_CURRENCY,
                "issuer": c.TOKEN_ISSUER
                },
                "limit": 1
            }

            const responseAsk = await client.request(reqAsk);
            const responseBid = await client.request(reqBid);
            var ask = responseAsk.result.offers;
            var bid = responseBid.result.offers;
            token.Ask = parseFloat(ask[0].quality / 1000000).toFixed(2);
            token.Bid = parseFloat((1 / (bid[0].quality * 1000000))).toFixed(2);
        
            client.disconnect();
    } catch
    {
        token.Ask = 0;
        token.Bid = 0;
    }
  }
}

const priceUpdate = async () => {
  token.UpdatePrice()
  const server = await client.guilds.fetch(process.env.DISCORD_SERVER_ID)
  const bot = await server.members.fetch(client.user.id)
  bot.setNickname(c.TOKEN_CURRENCY_NAME + ` PRICE TRACKER`)
  client.user.setActivity(`Bid: ${token.Bid}  Ask: ${token.Ask}`);
}

client.on('ready', () => {
  console.log(`${client.user.tag} has logged in!`)
  //client.user.setAvatar(c.AVATAR_URL)
  myinterval = setInterval(function(){
    priceUpdate()
  }, c.UPDATE_FREQUENCY * 1000)
})

client.login(process.env.DISCORD_BOT_TOKEN)
