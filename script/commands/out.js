module.exports.config = {
  name: "out",
  version: "1.0.0",
  hasPermssion: 2, // Admins only
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
  description: "Bot leaves the group chat",
  category: "operator",
  usages: "out [threadID]",
  cooldowns: 3,
  prefix: true // Required so command can be called with a prefix like -out
};

module.exports.run = async function ({ api, event, args }) {
  const botID = api.getCurrentUserID();
  const threadID = args[0] || event.threadID;

  try {
    await api.removeUserFromGroup(botID, threadID);
  } catch (err) {
    return api.sendMessage(
      `❌ Failed to leave group: ${err.message}`,
      event.threadID,
      event.messageID
    );
  }
};
