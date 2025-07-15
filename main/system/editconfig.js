const { join, resolve } = require('path');
const fs = require('fs-extra');
const chalk = require("chalk");
const path = require('path');
const log = require("../utility/logs.js");

module.exports.deleteUser = async (userid) => {
  delete require.cache[require.resolve('../../bots.json')];
  const configFile = 'bots.json';
  let config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const index = config.findIndex(item => item.uid === userid);
  if (index !== -1) config.splice(index, 1);
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

module.exports.addUser = async (name, userID) => {
  const configPaths = require('../../bots.json');
  delete require.cache[require.resolve('../../bots.json')];
        const dataa = configPaths
  for (let i = 0; i < dataa.length; i++) {
          const ryuko = dataa[i].uid;
          const packs = [];
          packs.push(ryuko);
          if (packs.includes(userID)) {
           return;
          } 
        }
    const configFile = 'bots.json';
    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    const configBots = config;
    configBots.push({    
      "name": name,
      "uid": userID,
      "botname": "WA BOT",
      "prefix": "-",
      "admins": [],
      "time": 0
    });
  log(`loaded ${chalk.blueBright(`${name}'s`)} data in ${chalk.blueBright(`bots.json`)} file`, "load");
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}
module.exports.createUser = async (name, userID, botName, botPrefix, username, password, thumbSrc, profileUrl, token, botAdmin) => {
    delete require.cache[require.resolve('../../bots.json')];
  const configPaths = require('../../bots.json');
        const dataa = configPaths
  for (let i = 0; i < dataa.length; i++) {
          const ryuko = dataa[i].uid;
          const packs = [];
          packs.push(ryuko);
          if (packs.includes(userID)) {
              return;
          } 
        }
    const configFile = 'bots.json';
    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    const configBots = config;
    const adminss = [];
    if (botAdmin) adminss.push(botAdmin);
    configBots.push({    
      "name": name,
      "uid": userID,
      "botname": botName || "ryuko",
      "prefix": botPrefix || "-",
      "admins": adminss,
      "username": username,
      "password": password,
      "time": 0,
      "thumbSrc": thumbSrc,
      "profileUrl": profileUrl,
      "token": token || ""
    });
    log(`loaded ${chalk.blueBright(`${name}'s`)} data in ${chalk.blueBright(`bots.json`)} file`, "load");
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

module.exports.rmStates = async (states) => {
  try {
      const fbstatesFolder = "states";
      const statesFile = join(`${fbstatesFolder}/${states}.json`)
      fs.unlinkSync(statesFile);
  } catch (err) {
      return;
  }
}
