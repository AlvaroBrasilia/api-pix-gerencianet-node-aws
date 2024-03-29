if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const GNRequest = require("./apis/gerencianet");

const app = express();

app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", "src/views");

const reqGNAlready = GNRequest({
  clientID: process.env.GN_CLIENT_ID,
  clientSecret: process.env.GN_CLIENT_SECRET,
});

app.get("/", async (req, res) => {
  const reqGN = await reqGNAlready;
  const dataCob = {
    calendario: {
      expiracao: 3600,
    },
    devedor: {
      cpf: "98034391115",
      nome: "Alvaro Luiz Andrade",
    },
    valor: {
      original: "0.10",
    },
    chave: "pixgn@alvaroandrade.dev",
    solicitacaoPagador: "Insira codigo do sorteio e numero(s) selecionado(s).",
    infoAdicionais: [
      {
        nome: "Sorteio",
        valor: "18° RIFINHA VALENDO NUMEROS DA FEDERAL",
      },
      {
        nome: "Numero(s)",
        valor: "10 - 11 - 12",
      },
    ],
  };

  const cobResponse = await reqGN.post("/v2/cob", dataCob);

  const qrcodeResponse = await reqGN.get(
    `/v2/loc/${cobResponse.data.loc.id}/qrcode`
  );

  res.render("qrcode", { qrcodeImage: qrcodeResponse.data.imagemQrcode });
});

app.get("/cobrancas", async (req, res) => {
  const reqGN = await reqGNAlready;

  const cobResponse = await reqGN.get(
    "/v2/cob?inicio=2022-01-01T16:01:35Z&fim=2022-01-15T23:59:00Z"
  );

  res.send(cobResponse.data);
});

app.post("/webhook(/pix)?", (req, res) => {
  console.log(req.body);
  res.send("200");
});

app.listen(8000, () => console.log("Running"));
