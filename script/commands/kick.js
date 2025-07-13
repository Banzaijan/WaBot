const fs = require("fs");

module.exports.config = {
  name: "kick",
  version: "1.0.3",
  permission: 0,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 (fixed by ChatGPT)",
  description: "Kick a user by mention or UID with reason; logs sent to GOD admins",
  prefix: true,
  premium: false,
  category: "system",
  usages: "<mention or uid> <reason>",
  cooldowns: 0,
};

module.exports.run = async function ({ api, event, args, Users, Threads }) {
  const { threadID, messageID, senderID, mentions } = event;

  try {
    if (!global.config.admins.includes(senderID)) {
      return api.sendMessage("❌ Only Bot Admins can use this command.", threadID, messageID);
    }

    const threadData = await Threads.getData(threadID);
    const botID = api.getCurrentUserID();
    const adminIDs = threadData?.threadInfo?.adminIDs || [];

    if (!adminIDs.some(item => item.id == botID)) {
      return api.sendMessage("⚠️ Bot lacks group admin permissions. Please promote the bot and try again.", threadID, messageID);
    }

    let targetID;
    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length > 0) {
      targetID = mentionIDs[0];
      const nameWords = mentions[targetID].trim().split(/\s+/);
      args.splice(0, nameWords.length);
    } else if (args[0]) {
      targetID = args[0];
      args.shift();
    } else {
      return api.sendMessage("❌ You must mention or provide a UID to kick.", threadID, messageID);
    }

    if (targetID === threadData?.threadInfo?.ownerID) {
      return api.sendMessage("🚫 Cannot kick the group owner.", threadID, messageID);
    }

    if (global.config.operators.includes(targetID)) {
      return api.sendMessage("🚫 Cannot kick a God Admin.", threadID, messageID);
    }

    const reason = args.join(" ").trim();
    if (!reason) return api.sendMessage("📝 Please provide a reason for the kick.", threadID, messageID);

    const targetInfo = await Users.getInfo(targetID);
    const targetName = targetInfo?.name || "Unknown";

    await api.removeUserFromGroup(targetID, threadID);

    const senderInfo = await Users.getInfo(senderID);
    const senderName = senderInfo?.name || "Unknown";
    const groupName = threadData?.threadInfo?.threadName || "Unknown";

    const confirmMsg = `✅ Kicked ${targetName} from the group.\n📄 Reason: ${reason}`;
    api.sendMessage(confirmMsg, threadID, messageID);

    const logMsg = `🚨 Kick Log\n👤 User: ${targetName} (${targetID})\n👮 By: ${senderName} (${senderID})\n🧾 Reason: ${reason}\n💬 Group: ${groupName} (${threadID})`;
    for (const godID of global.config.operators || []) {
      api.sendMessage(logMsg, godID);
    }

  } catch (err) {
    console.error("Kick command error:", err);
    return api.sendMessage("⚠️ An error occurred while executing the command.", threadID, messageID);
  }
};
