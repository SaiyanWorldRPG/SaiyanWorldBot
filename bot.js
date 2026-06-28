require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const fs = require("fs");

// ===============================
// VARIÁVEIS DE AMBIENTE
// ===============================
const TOKEN = process.env.TOKEN;

// 🔥 URL CORRETA DA SUA API RAILWAY
const RANKING_API_URL = "https://saiyanworld-rankingapi-production.up.railway.app/api/ranking";

// ===============================
// CONFIGURAÇÃO DO CLIENT
// ===============================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ===============================
// EVENTO DE INICIALIZAÇÃO
// ===============================
client.on("ready", () => {
    console.log(`Bot online como ${client.user.tag}`);
});

// ===============================
// EVENTO PRINCIPAL DE COMANDOS
// ===============================
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // ===============================
    // COMANDO !ping
    // ===============================
    if (message.content === "!ping") {
        return message.reply("Pong!");
    }

    // ===============================
    // COMANDO !give (recompensas)
    // ===============================
    if (message.content.startsWith("!give")) {
        const args = message.content.split(" ");

        if (args.length < 5) {
            return message.reply("Uso correto: !give <PUBLIC_ID> <tipo> <valor1> <valor2>");
        }

        const playerId = args[1];
        const type = args[2].toLowerCase();

        let reward = {};

        if (type === "item") {
            reward = {
                type: "item",
                item: args[3].toUpperCase(),
                qty: parseInt(args[4])
            };
        } else if (type === "pokemon") {
            reward = {
                type: "pokemon",
                species: args[3].toUpperCase(),
                level: parseInt(args[4])
            };
        } else {
            return message.reply("Tipo inválido. Use: item ou pokemon.");
        }

        const filePath = "./rewards.json";
        let data = {};

        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath));
        }

        if (!data[playerId]) {
            data[playerId] = [];
        }

        data[playerId].push(reward);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        return message.reply(`Recompensa enviada para ${playerId}!`);
    }

    // ===============================
    // COMANDO !rank (ranking global)
    // ===============================
    if (message.content === "!rank") {
        try {
            console.log("Chamando API:", RANKING_API_URL);

            const response = await axios.get(RANKING_API_URL);
            const data = response.data;

            console.log("Resposta da API:", data);

            if (!data.players || Object.keys(data.players).length === 0) {
                return message.reply("Ainda não há jogadores no ranking.");
            }

            const players = Object.values(data.players)
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

            let text = "**🏆 RANKING GLOBAL — TOP 10**\n\n";

            players.forEach((p, i) => {
                text += `**${i + 1}.** ${p.player_name} (${p.player_id}) — **${p.score}** pontos\n`;
            });

            message.reply(text);

        } catch (e) {
            console.error("Erro ao buscar ranking:", e.message);
            message.reply("Não foi possível carregar o ranking agora.");
        }
    }

    // ===============================
    // COMANDO !me <PUBLIC_ID>
    // ===============================
    if (message.content.startsWith("!me")) {
        try {
            const args = message.content.split(" ");

            if (args.length < 2) {
                return message.reply("Uso correto: !me <PUBLIC_ID>");
            }

            const playerId = args[1];

            const response = await axios.get(RANKING_API_URL);
            const data = response.data;

            if (!data.players || Object.keys(data.players).length === 0) {
                return message.reply("Ainda não há jogadores no ranking.");
            }

            const player = data.players[playerId];

            if (!player) {
                return message.reply("Você ainda não está no ranking.");
            }

            message.reply(
                `Seu ranking:\nJogador: **${player.player_name}**\nID: **${player.player_id}**\nScore: **${player.score}**`
            );

        } catch (e) {
            console.error("Erro ao buscar ranking:", e.message);
            message.reply("Não foi possível carregar seu ranking agora.");
        }
    }
});

// ===============================
// LOGIN DO BOT
// ===============================
client.login(TOKEN);
