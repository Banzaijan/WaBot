const https = require("https");

module.exports.config = {
  name: "stock",
  version: "4.3.3",
  permission: 2,
  credits: "Jeric + ChatGPT",
  description: "Display current GrowAGarden stock from all categories.",
  prefix: true,
  premium: false,
  category: "general",
  usages: "-stock",
  cooldowns: 5,
};

const API_URL = "https://api.joshlei.com/v2/growagarden/stock";

function fetchStockData() {
  return new Promise((resolve, reject) => {
    const req = https.get(API_URL, { timeout: 5000 }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(`❌ Failed to parse data: ${err.message}`);
        }
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject("❌ API timeout after 5 seconds");
    });

    req.on("error", (err) => reject(`❌ API error: ${err.message}`));
  });
}

function formatItems(title, items) {
  if (!items || items.length === 0) return `${title}:\nNone`;
  const grouped = {};

  for (const item of items) {
    if (!grouped[item.display_name]) {
      grouped[item.display_name] = item.quantity;
    } else {
      grouped[item.display_name] += item.quantity;
    }
  }

  const formatted = Object.entries(grouped)
    .map(([name, qty]) => `${name} - ${qty}`)
    .join("\n");

  return `${title}:\n${formatted}`;
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    const stock = await fetchStockData();

    const phTime = new Date().toLocaleTimeString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const output = [
      formatItems("🌱 Seeds", stock?.seed_stock),
      formatItems("🛠️ Gears", stock?.gear_stock),
      formatItems("🥚 Eggs", stock?.egg_stock),
      formatItems("🎨 Cosmetics", stock?.cosmetic_stock)
    ].join("\n\n");

    api.sendMessage(`📦 GrowAGarden Stocks (${phTime})\n\n${output}`, threadID, (err, info) => {
      if (!err) {
        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 40000); // Auto-delete after 40 seconds
      }
    });

  } catch (err) {
    api.sendMessage(err.toString(), threadID, messageID);
  }
};
