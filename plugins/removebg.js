const { cmd, commands } = require('../command');
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  removebg,
  h2k,
  isUrl,
  Json,
  sleep,
  fetchJson
} = require("../functions");


const command = {
  pattern: "removebg",
  alias: ["rbg", "bgremove"],
  react: "🖇",
  desc: "Remove the background from an image.",
  category: "image",
  use: ".removebg",
  filename: __filename
};

cmd(command, async (client, message, args, { from, quoted, reply }) => {
  try {
    let quotedMessage = quoted ? quoted : message;
    let mimetype = quotedMessage.msg?.mimetype || '';

    if (!mimetype || !mimetype.startsWith("image/")) {
      throw "🌻 Please reply to an image.";
    }

    let downloadedImage = await quotedMessage.download();
    if (!downloadedImage) {
      throw "Failed to download the image. Please try again.";
    }

    const path = require("path");
    const FormData = require("form-data");
    const axios = require("axios");
    const os = require("os");
    const fs = require("fs");

    let tempFilePath = path.join(os.tmpdir(), "tempImage.png");
    fs.writeFileSync(tempFilePath, downloadedImage);

    let formData = new FormData();
    formData.append("image", fs.createReadStream(tempFilePath));

    let uploadResponse = await axios.post("https://api.imgbb.com/1/upload?key=06d00f0e4520243a32b58138765a2ecc", formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (!uploadResponse.data || !uploadResponse.data.data.url) {
      fs.unlinkSync(tempFilePath);
      throw "❌ Error uploading the file. Please try again.";
    }

    let imageUrl = uploadResponse.data.data.url;
    let removeBgApiUrl = `https://api.nexoracle.com/image-processing/remove-bg?apikey=RDB9bTxrjAf71NFHd&img=${imageUrl}`;

    const imagePayload = {
      url: removeBgApiUrl
    };
    const messagePayload = {
      image: imagePayload,
      caption: "> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ꜱᴀᴅᴇᴇꜱʜᴀ ᴄᴏᴅᴇʀ · · ·*"
    };
    const sendMessageOptions = {
      quoted: message
    };

    await client.sendMessage(from, messagePayload, sendMessageOptions);
    fs.unlinkSync(tempFilePath);
  } catch (error) {
    console.error(error);
    reply("❌ An error occurred: " + (error.message || error));
  }
});
