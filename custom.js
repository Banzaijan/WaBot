module.exports = async ({ api, event }) => {
  const logger = require('./main/utility/logs.js');
  
  const configCustom = {
    autosetbio: {
      status: false,
      bio: `prefix : ${global.config.PREFIX}`,
      note: 'automatically change the bot bio.'
    },
    greetings: {
      status: true,
      morning: `Magandang umaga! Gising na ulit para maramdaman mo kung gaano ka kawalang-silbi sa bahay. 😃💸`,
      afternoon: `Hapon na, gago! Malapit nang matapos ang araw... pero ikaw, malapit nang sumuko. Charot. 😭`,
      evening: `Magandang gabi! Reminder: kahit gabi na, hindi pa rin siya babalik. Kaya wag ka nang umasa. 💀`,
      sleep: `Tulog na, mahal… joke lang, hindi ka niya mahal. Kaya magpahinga ka nalang para sa sarili mo. 😢`,
      note: 'greetings every morning, afternoon and evening. the timezone is located in Asia/Manila'
    },
    accpetPending: {
      status: false,
      time: 10, // 10 minutes
      note: 'approve waiting messages after a certain time, set the status to false if you want to disable auto accept message request.'
    }
  }

  function autosetbio(config) {
    if (config.status) {
      try {
        api.changeBio(config.bio, (err) => {
          if (err) {
            logger(`having some unexpected error : ${err}`, 'setbio')
          }; return logger(`changed the bot bio into : ${config.bio}`, 'setbio')
        })
      } catch (error) {
        logger(`having some unexpected error in auto set bio : ${error}`, 'error')
      }
    }
  }
  async function greetings(config) {
    if (config.status) {
      try {
      const nam = [
        {
          timer: '5:00:00 AM',
          message: [`${config.morning}`]
        },
        {
          timer: '11:00:00 AM',
          message: [`${config.afternoon}`]
        },
        {
          timer: '6:00:00 PM',
          message: [`${config.evening}`]
        },
        {
          timer: '10:00:00 PM',
          message: [`${config.sleep}`]
        }
      ];
      const userID = await api.getCurrentUserID();
        setInterval(() => {
const r = a => a[Math.floor(Math.random()*a.length)];
if (á = nam.find(i => i.timer == new Date(Date.now()+25200000).toLocaleString().split(/,/).pop().trim())) {
    const allThread = global.data.allThreadID.get(userID);
    allThread.forEach(i => {
        api.sendMessage(r(á.message), i);
       });
      }
}, 1000);
      } catch (error) {
        logger(`having some unexpected error in greetings : ${error}`, 'error')
      }
    }
  }
  
  
  function accpetPending(config) {
    if(config.status) {
      setInterval(async () => {
          const list = [
              ...(await api.getThreadList(1, null, ['PENDING'])),
              ...(await api.getThreadList(1, null, ['OTHER']))
          ];
          if (list[0]) {
              api.sendMessage('this thread is automatically approved by our system.', list[0].threadID);
          }
      }, config.time * 60 * 1000)
    }
  }

autosetbio(configCustom.autosetbio)
greetings(configCustom.greetings)
accpetPending(configCustom.accpetPending)
};
