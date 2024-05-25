const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const verifyJWT = require("../Middlewares/verifyJWT");
const Motos = require("../Models/Motos");
const User = require("../Models/User");
const {v4: uuidv4} = require('uuid')
const moment = require("moment")

router.get("/motos", async (req, res) => {
  try {
    const motos = await Motos.find();
    console.log("todas as motos:");
    res
      .status(201)
      .json({ motos: motos, msg: "Todas as Motos disponiveis no momento" });
  } catch (erro) {
    console.error("Erro ao obter as motos:", erro);
    res.status(500).json({ msg: "Erro ao obter as motos" });
  }
});
router.post("/alugar", async (req, res) => {
  console.log(req.body);
  const { id, diasAlugado, name, userID, image, precoTotal } = req.body;

  try {
    const moto = await Motos.findById(id);

    if (!moto) {
      return res.status(404).json({ erro: "Moto não encontrada" });
    }

    /*if (!moto.disponivel) {
            return res.status(400).json({ erro: 'Moto não está disponível para aluguel' });
        }*/

    const precoTotal = moto.precoDiario * diasAlugado;

    moto.disponivel = false;
    moto.AlugadaPor = name;

    await moto.save();

    const usuario = await User.findById(userID);

    if (!usuario) {
      console.log("Usuário não encontrado");
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const dataAluguel = moment(Date()); // Data de aluguel
    const diasAluguel = diasAlugado; // Número de dias selecionados para o aluguel
    // Calculando a data de expiração adicionando os dias de aluguel à data de aluguel
    const dataExpiracaoAluguel = dataAluguel.clone().add(diasAluguel, "days");
    console.log(dataExpiracaoAluguel)
  
    const motoAlugada = {
      marca: moto.marca,
      modelo: moto.modelo,
      id: uuidv4(), //irá gerar um código
      custoDiario: moto.precoDiario,
      preçoTotal: precoTotal,
      diasAlugado: diasAlugado,
      image: moto.image,
      Data: Date(),
      DataExpirar: dataExpiracaoAluguel.format()
    };
    
    // Inicializar usuario.Motos como um array se não estiver definido
    if (!usuario.Motos) {
      usuario.Motos = [];
    }

    usuario.Motos.push(motoAlugada);
    await usuario.save();

    console.log("Moto adicionada com sucesso ao usuário:", usuario);
    console.log(dataExpiracaoAluguel)

    res.status(200).json({ msg: "Moto alugada com sucesso" });
  } catch (error) {
    console.error("Erro ao alugar a moto:", error);
    res.status(500).json({ erro: "Erro ao alugar a moto" });
  }
});

router.post("/cancelaraluguel", async (req, res) => {
    const { userID, idMoto } = req.body;
    console.log("ID DA MOTO:", idMoto);
  
    try {
      const user = await User.findByIdAndUpdate(
        userID,
        { $pull: { Motos: {id: idMoto } } },
        {new: true}
      );
      if (user) {
        console.log("Moto removida com sucesso do usuário:");
        res.status(200).json({ message: "Aluguel da Moto cancelada com sucesso" });
      } else {
        console.log("Usuário não encontrado");
      }
    } catch (err) {
      console.error("Erro ao cancelar o aluguel da moto:", err);
      res.status(500).json({ error: "Erro ao cancelar o aluguel da moto" });
    }
  });

  router.post("/aluguelexpirou", async (req, res) => {
    const { userID, idMoto, data} = req.body;
    console.log("ID DA MOTO:", idMoto);
  
    try {
      const user = await User.findByIdAndUpdate(
        userID,
        { $pull: { Motos: {DataExpirar: data } } },
        {new: true}
      );
      if (user) {
        console.log("Moto removida com sucesso do usuário:");
        res.status(200).json({ message: "Aluguel da Moto cancelada com sucesso" });
      } else {
        console.log("Usuário não encontrado");
      }
    } catch (err) {
      console.error("Erro ao cancelar o aluguel da moto:", err);
      res.status(500).json({ error: "Erro ao cancelar o aluguel da moto" });
    }
  });
    
router.get("/minhasmotos/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      res.status(404).json({ erro: "Erro ao buscar moto deste usuário" });
      console.log("Erro ao buscar moto");
    } else {
      if (!usuario.Motos || usuario.Motos.length === 0) {
        res.status(200).json({ msg: "Você não possui nenhuma moto alugada !" });
        console.log("nenhuma moto encontrada deste usuario");
      } else {
        console.log(usuario);
        res.status(200).json({ motos: usuario.Motos });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/moto/:id", async (req, res) => {
  try {
    const moto = await Motos.findOne({ _id: req.params.id, disponivel: true });
    if (moto) {
      console.log(moto);
      res.status(200).json({ info: moto });
    } else {
      console.log("Moto não encontrada ou Indisponivel");
      res.status(404).json({ erro: "Moto não encontrada ou Indisponivel" });
    }
  } catch (err) {
    console.log("Erro ao buscar info da moto", err);
    res.status(500).json({ erro: "Erro ao buscar informações da moto" });
  }
});

module.exports = router;
