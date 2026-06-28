// IMPORTAÇÕES
const axios = require("axios");
const RANKING_API_URL = process.env.RANKING_API_URL;

// EVENTO PRINCIPAL DE COMANDOS
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // ============================
    // COMANDO !rank
    // ============================
    if (message.content === "!rank") {
        try {
            const response = await axios.get(RANKING_API_URL);
            const data = response.data;

            if (!data.players || Object.keys(data.players).length === 0) {
                return message.reply("Ainda não há jogadores no ranking.");
            }

            const players = Object.values(data.players);
            players.sort((a, b) => b.score - a.score);

            const top = players.slice(0, 10);

            let text = "**🏆 RANKING GLOBAL — TOP 10**\n\n";
            top.forEach((p, i) => {
                text += `**${i + 1}.** ${p.player_name} (${p.player_id}) — **${p.score}** pontos\n`;
            });

            message.reply(text);
        } catch (e) {
            console.error("Erro ao buscar ranking:", e.message);
            message.reply("Não foi possível carregar o ranking agora.");
        }
    }

    // ============================
    // COMANDO !me <PUBLIC_ID>
    // ============================
    if (message.content.startsWith("!me")) {
        try {
            const response = await axios.get(RANKING_API_URL);
            const data = response.data;

            if (!data.players || Object.keys(data.players).length === 0) {
                return message.reply("Ainda não há jogadores no ranking.");
            }

            const args = message.content.split(" ");
            if (args.length < 2) {
                return message.reply("Uso correto: !me <PUBLIC_ID>");
            }

            const playerId = args[1];
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
