module.exports.config = {
  name: "calc",
  version: "1.0.0",
  permission: 0,
  credits: "ChatGPT + Joshua",
  description: "Calculate a math expression",
  prefix: true,
  usage: "<expression>",
};

const math = require("mathjs");

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const expression = args.join(" ");

  if (!expression) {
    return api.sendMessage("🧮 Please provide a math expression to calculate.\nExample: `-calc 2 + 2`", threadID);
  }

  try {
    const result = math.evaluate(expression);
    return api.sendMessage(`🧠 Expression: ${expression}\n✅ Result: ${result}`, threadID);
  } catch (error) {
    return api.sendMessage("❌ Invalid math expression. Try something like:\n`-calc (3 + 2) * 5`", threadID);
  }
};
