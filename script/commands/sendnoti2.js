const fs = require('fs');
const request = require('request');

module.exports.config = {
    name: "sendnoti2",
    version: "1.0.0",
    permission: 3,
    credits: "ryuko",
    description: "",
    prefix: true,
    premium: false,
    category: "operator",
    usages: "[msg]",
    cooldowns: 5,
}

let atmDir = [];

const getAtm = (atm, body) => new Promise(async (resolve) => {
    let msg = {}, attachment = [];
    msg.body = body;
    for(let eachAtm of atm) {
        await new Promise(async (resolve) => {
            try {
                let response =  await request.get(eachAtm.url),
                    pathName = response.uri.pathname,
                    ext = pathName.substring(pathName.lastIndexOf(".") + 1),
                    path = __dirname + `/cache/${eachAtm.filename}.${ext}`;
                response
                    .pipe(fs.createWriteStream(path))
                    .on("close", () => {
                        attachment.push(fs.createReadStream(path));
                        atmDir.push(path);
                        resolve();
                    });
            } catch(e) { console.log(e); resolve(); }
        });
    }
    msg.attachment = attachment;
    resolve(msg);
});

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads }) {
    const { threadID, senderID, body, messageID } = event;
    let name = await Users.getNameUser(senderID);

    switch (handleReply.type) {
        case "sendnoti": {
            let text = body;
            if(event.attachments.length > 0) {
                text = await getAtm(event.attachments, body);
            }
            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each));
                atmDir = [];
                const handlee = {
                    name: this.config.name,
                    type: "sendnoti",
                    messageID: info.messageID,
                    messID: messageID,
                    threadID
                };
                global.client.handleReply.get(event.botid).push(handlee);
            });
            break;
        }
        case "reply": {
            let text = body;
            if(event.attachments.length > 0) {
                text = await getAtm(event.attachments, body);
            }
            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each));
                atmDir = [];
                global.client.handleReply.get(event.botid).push({
                    name: this.config.name,
                    type: "sendnoti",
                    messageID: info.messageID,
                    threadID
                });
            }, handleReply.messID);
            break;
        }
    }
}

module.exports.run = async function ({ api, event, botid, args, Users }) {
    const { threadID, messageID, senderID, messageReply, type } = event;
    const botID = await api.getCurrentUserID();
    const botThread = global.data.allThreadID.get(botID);

    if (!args[0]) return api.sendMessage("Please input a message", threadID);

    let allThread = botThread || [];
    let can = 0, canNot = 0;

    let text = args.join(" ");
    if(type === "message_reply" && messageReply.attachments.length > 0) {
        text = await getAtm(messageReply.attachments, args.join(" "));
    }

    await new Promise(resolve => {
        allThread.forEach(each => {
            try {
                api.sendMessage(text, each, (err, info) => {
                    if(err) canNot++;
                    else {
                        can++;
                        atmDir.forEach(each => fs.unlinkSync(each));
                        atmDir = [];
                        const handlee = {
                            name: this.config.name,
                            type: "sendnoti",
                            messageID: info.messageID,
                            messID: messageID,
                            threadID
                        };
                        global.client.handleReply.get(botid).push(handlee);
                        resolve();
                    }
                });
            } catch(e) { console.log(e); }
        });
    });

    api.sendMessage(`Sent to ${can} threads, failed to send to ${canNot} threads.`, threadID);
};
