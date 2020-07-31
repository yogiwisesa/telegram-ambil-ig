const got = require('got');
const cheerio = require('cheerio');
const { Telegraf } = require('telegraf');

require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply('Halo kirim aja url IGnya kesini.'))
bot.help((ctx) => ctx.reply('Tinggal kirim aja url IGnya gan.'))

bot.hears('/ping', (ctx) => ctx.reply('pong'))
bot.hears('/env', (ctx) => ctx.reply(process.env.NODE_ENV))

bot.on('text', ctx => {

  const { text, from } = ctx.update.message;

  console.log('=============================')
  console.log(`URL: `, text)
  console.log(`From: ${JSON.stringify(from)}`)

  got(text)
    .then(response => {
      const $ = cheerio.load(response.body);

      const isUrlValid = $('link[rel="canonical"]').attr('href');
      if (!isUrlValid) {
        return ctx.reply('Error mas brow. coba cek lagi urlnya.')
      }

      const isVideo = $('meta[name="medium"]').attr('content') === 'video';
      const downloadUrl = isVideo ? $('meta[property="og:video"]').attr('content') : $('meta[property="og:image"]').attr('content');
      
      console.log(`${isVideo ? 'Video' : 'Image'}: ${downloadUrl}`)
      
      if (isVideo) {
        ctx.replyWithVideo(downloadUrl);
      } else {
        ctx.replyWithPhoto(downloadUrl);
      }
      console.log('=============================')
    })
    .catch(error => {
      ctx.reply('Error mas brow. coba cek lagi urlnya.')
      console.log(`Error: `, error.message)
      console.log('=============================')
    })

})

bot.launch()