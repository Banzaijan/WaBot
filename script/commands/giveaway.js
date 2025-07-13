const fs = require("fs");

module.exports.config = {
  name: "giveaway",
  version: "1.0.0",
  permission: 0, // Admin only
  credits: "Jeric - Refactored by ChatGPT",
  description: "Simple giveaway system",
  prefix: true,
  premium: false,
  category: "utility",
  usages: "[create/details/join/roll/end] [ID]",
  cooldowns: 5,
};

module.exports.handleReaction = async ({ api, event, Users, handleReaction }) => {
  const data = global.data.GiveAway.get(handleReaction.ID);
  if (!data || data.status === "close" || data.status === "ended") return;

  const userID = event.userID;
  const hasReacted = typeof event.reaction !== "undefined";

  if (hasReacted) {
    if (!data.joined.includes(userID)) data.joined.push(userID);
    // Commented out join message to prevent autosuspend
    // const threadInfo = await api.getThreadInfo(event.threadID);
    // const userName = threadInfo.nicknames?.[userID] || (await Users.getInfo(userID)).name;
    // api.sendMessage(`${userName} successfully joined the giveaway (ID: #${handleReaction.ID})`, event.threadID);
  } else {
    const index = data.joined.indexOf(userID);
    if (index !== -1) data.joined.splice(index, 1);
    // Commented out leave message to prevent autosuspend
    // const threadInfo = await api.getThreadInfo(event.threadID);
    // const userName = threadInfo.nicknames?.[userID] || (await Users.getInfo(userID)).name;
    // api.sendMessage(`${userName} left the giveaway (ID: #${handleReaction.ID})`, event.threadID);
  }

  global.data.GiveAway.set(handleReaction.ID, data);
};

module.exports.run = async ({ api, event, args, Users, botid }) => {
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!global.config.operator.includes(senderID) &&
     (!global.config.GIVEAWAYVIP || !global.config.GIVEAWAYVIP.includes(senderID))) {
    return api.sendMessage("❌ You don't have permission to use this command.", threadID, messageID);
  }

  if (!global.data.GiveAway) global.data.GiveAway = new Map();
  if (!global.client.handleReaction) global.client.handleReaction = new Map();

  switch (args[0]) {
    case "create": {
      const reward = args.slice(1).join(" ");
      if (!reward) return api.sendMessage("Please enter the prize!", threadID, messageID);

      const ID = Math.floor(100000 + Math.random() * 900000).toString();
      const threadInfo = await api.getThreadInfo(threadID);
      const authorName = threadInfo.nicknames?.[senderID] || (await Users.getInfo(senderID)).name;

      api.sendMessage(
        `======GIVEAWAY======\n👤 Hosted by: ${authorName}\n🎁 Prize: ${reward}\n🆔 GID: #${ID}\n\n✅ React to this message to join!`,
        threadID,
        (err, info) => {
          if (err) return;
          global.data.GiveAway.set(ID, {
            ID,
            author: authorName,
            authorID: senderID,
            messageID: info.messageID,
            reward,
            joined: [],
            status: "open"
          });

          // FIXED: Store handleReaction data properly using Map
          const reactList = global.client.handleReaction.get(botid) || [];
          reactList.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: senderID,
            ID
          });
          global.client.handleReaction.set(botid, reactList);
        }
      );
      break;
    }

    case "details": {
      const ID = args[1]?.replace("#", "");
      if (!ID) return api.sendMessage("Please provide GiveAway ID!", threadID, messageID);

      const data = global.data.GiveAway.get(ID);
      if (!data) return api.sendMessage("GiveAway not found with provided ID!", threadID, messageID);

      api.sendMessage(
        `======GIVEAWAY DETAILS======\n👤 Hosted by: ${data.author} (${data.authorID})\n🎁 Prize: ${data.reward}\n🆔 GID: #${data.ID}\n👥 Participants: ${data.joined.length}\n📌 Status: ${data.status}`,
        threadID
      );
      break;
    }

    case "join": {
      const ID = args[1]?.replace("#", "");
      if (!ID) return api.sendMessage("Please provide GiveAway ID!", threadID, messageID);

      const data = global.data.GiveAway.get(ID);
      if (!data) return api.sendMessage("Giveaway not found with provided ID!", threadID, messageID);
      if (data.joined.includes(senderID)) return api.sendMessage("You have already entered this giveaway!", threadID, messageID);

      data.joined.push(senderID);
      global.data.GiveAway.set(ID, data);

      const threadInfo = await api.getThreadInfo(threadID);
      const name = threadInfo.nicknames?.[senderID] || (await Users.getInfo(senderID)).name;
      api.sendMessage(`${name} successfully joined the giveaway (ID: #${ID})`, threadID);
      break;
    }

    case "roll": {
      const ID = args[1]?.replace("#", "");
      if (!ID) return api.sendMessage("Please provide Giveaway ID!", threadID, messageID);

      const data = global.data.GiveAway.get(ID);
      if (!data) return api.sendMessage("Giveaway not found with provided ID!", threadID, messageID);
      if (data.authorID !== senderID) return api.sendMessage("You are not the organizer of this giveaway!", threadID, messageID);
      if (data.joined.length === 0) return api.sendMessage("No one entered the giveaway!", threadID, messageID);

      const winnerID = data.joined[Math.floor(Math.random() * data.joined.length)];
      const winnerInfo = await Users.getInfo(winnerID);

      api.sendMessage({
        body: `🎉 Congratulations ${winnerInfo.name} you win the giveaway with GID: #${ID}\n🎁 Prize: ${data.reward}\n📨 Contact to claim the prize: ${data.author} (https://facebook.com/profile.php?id=${data.authorID})`,
        mentions: [{
          tag: winnerInfo.name,
          id: winnerID
        }]
      }, threadID);
      break;
    }

    case "end": {
      const ID = args[1]?.replace("#", "");
      if (!ID) return api.sendMessage("Please provide GiveAway ID!", threadID, messageID);

      const data = global.data.GiveAway.get(ID);
      if (!data) return api.sendMessage("Giveaway not found with provided ID!", threadID, messageID);
      if (data.authorID !== senderID) return api.sendMessage("You are not the organizer of this giveaway!", threadID, messageID);

      data.status = "ended";
      global.data.GiveAway.set(ID, data);
      api.unsendMessage(data.messageID);
      api.sendMessage(`🔚 Giveaway ID: #${ID} has been ended.`, threadID);
      break;
    }

    default:
      return api.sendMessage("❓ Invalid subcommand. Use: create | details | join | roll | end", threadID, messageID);
  }
};
