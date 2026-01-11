require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 🔹 OAuth2 callback
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Código inválido.");

  try {
    // Troca code por access_token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // Pega o usuário
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Adiciona no servidor
    await axios.put(
      `https://discord.com/api/guilds/${process.env.GUILD_ID}/members/${userRes.data.id}`,
      { access_token: accessToken },
      {
        headers: {
          Authorization: `Bot ${process.env.TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.send("✅ Você entrou no servidor com sucesso!");
  } catch (err) {
    console.error(err.response?.data || err);
    res.send("❌ Erro ao entrar no servidor.");
  }
});

// 🔹 Inicia o bot
client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

client.login(process.env.TOKEN);

// 🔹 Servidor web
app.listen(3000, () => {
  console.log("🌐 OAuth rodando na porta 3000");
});
