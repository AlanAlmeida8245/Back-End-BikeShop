
const Express = require("express")
const app = Express()
const Cors = require("cors")
require('dotenv').config();
const mongoose = require('mongoose')
const User = require("./Models/User")
const Moto = require("./Models/Motos")
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken")
const verifyJWT = require("./Middlewares/verifyJWT")
const userRoutes = require("./Rotas/userRoutes")
const moment = require("moment")

app.use(Cors());
    // Middleware para analisar o corpo da solicitação JSON
app.use(Express.json());
// Middleware para analisar o corpo da solicitação com dados codificados na URL
app.use(Express.urlencoded({ extended: true }));
app.use("/user", userRoutes);

async function RemoverMotoExpiradaDeUsuarios() {
    
    const dataFormatada = moment().format('DD/MM/YYYY');
    console.log(dataFormatada); // Saída: "01/05/2024"

    const motosExpiradas = await Moto.find({ DataExpirar: { $lte: dataFormatada } });

    for (const moto of motosExpiradas) {
        await Usuario.updateMany({ 'motos.id': moto.id }, { $pull: { motos: { id: moto.id } } });
    }
}


app.post("/cadastrar", async (req, res) => {
    try {
        console.log(req.body)
        const { email, nome, senha, confirmarsenha } = req.body;

        // Verificar se todos os campos obrigatórios estão presentes e válidos
        if (!email || !nome || !senha || !confirmarsenha) {
            return res.status(400).json({ erro: "Todos os campos devem ser preenchidos" });
        }

        if (confirmarsenha !== senha) {
            return res.status(400).json({ erro: "As senhas não coincidem" });
        }

        // Verificar se o usuário já existe no banco de dados
        const existingUser = await User.findOne({email: email });
        if (existingUser) {
            return res.status(400).json({ erro: "Já existe uma conta com o endereço de email informado" });
        }

        // Criptografar a senha antes de salvar no banco de dados
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Criar um novo usuário
        const newUser = new User({
            email: email,
            name: nome,
            password: hashedPassword
        });
        // Salvar o novo usuário no banco de dados
        await newUser.save();

        console.log("Conta Criada com Sucesso !");
        res.status(200).json({ msg: "Conta criada com sucesso!" });
    } catch (error) {
        console.error("Erro ao tentar realizar o cadastro:", error);
        res.status(500).json({ erro: "Erro ao tentar realizar o cadastro" });
    }
});
app.post("/login", async (req, res) => {

    if(!req.body.email){
        return res.status(401).json({erro: "Digite um Email válido"})
    }
    if(!req.body.password){
        return res.status(401).json({erro: "Digite a senha da conta corretamente"})
    }
    
    const existingUser = await User.findOne({email: req.body.email})

    if(!existingUser){ //caso não ache a conta fornecida pelo email
        return res.status(401).json({erro: "Não existe nenhuma conta cadastrada com esse endereço de e-mail"});
    }else{
            bcrypt.compare(req.body.password, existingUser.password).then((success) => {
                if(success){
                    console.log("login com sucesso")
                    const token = JWT.sign({id: existingUser._id}, process.env.SECRET, {
                        expiresIn: 600
                    })
                    res.status(200).json({msg: "Login Efetuado com sucesso", token: token, auth: true, user: existingUser})
                }
                else{
                    console.log("senha invalida")
                    res.status(401).json({erro: "Senha inválida" });
                }     
            }).catch((err) => {
                    console.error("Erro ao comparar as senhas:", err);
                // Em caso de erro, você pode retornar um código de status adequado
                res.status(500).json({ erro: "Erro ao comparar as senhas" });
            })
    }
})
app.post("/logout", verifyJWT, (req, res) => {
    res.json({auth: false, token: false})
    console.log("Deslogado com Sucesso");
})
app.post("/inserirmotos", (req, res) => {

    const newMotos = [
        {
            marca: "Honda",
            modelo: "CG 160 Start",
            ano: 2024,
            precoDiario: 37,
            disponivel: true,
            AlugadaPor: null,
            tempoAluguel: null,
            image: "https://www.honda.com.br/motos/sites/hda/files/styles/product_200x128/public/2023-08/moto-honda-cg-160-start--prata-met%C3%A1lico_8.webp?itok=FWjocuzD"
        },
        {
            marca: "Honda",
            modelo: "CG 160 Fan",
            ano: 2024,
            precoDiario: 45,
            disponivel: true,
            AlugadaPor: null,
            tempoAluguel: null,
            image: "https://www.honda.com.br/motos/sites/hda/files/styles/product_200x128/public/2023-08/FAN-LATERAL_4.webp?itok=zmHDGh1B"
        },
        {
            marca: "Honda",
            modelo: "CG 160 Titan",
            ano: 2024,
            precoDiario: 45,
            disponivel: true,
            AlugadaPor: null,
            tempoAluguel: null,
            image: "https://www.honda.com.br/motos/sites/hda/files/styles/product_200x128/public/2023-08/moto-honda-cg-160-titan-azul-perolizado_3.webp?itok=pcpNxGlb   "
        },
        {
            marca: "Honda",
            modelo: "Pop 110i",
            ano: 2023,
            precoDiario: 28,
            disponivel: true,
            AlugadaPor: null,
            tempoAluguel: null,
            image: "https://www.honda.com.br/motos/sites/hda/files/styles/product_200x128/public/2022-03/POP-110i-branca.webp?itok=OyRVtApK"
        },
        {
            marca: "Honda",
            modelo: "Biz 110i",
            ano: 2023,
            precoDiario: 29,
            disponivel: true,
            AlugadaPor: null,
            tempoAluguel: null,
            image: "https://www.honda.com.br/motos/sites/hda/files/styles/product_200x128/public/2022-03/Biz-110i-prata.webp?itok=FEiG5oS8"
        },
        {
            marca: "Kawasaki",
            modelo: "Ninja 300",
            ano: 2024,
            precoDiario: 72,
            disponivel: true,
            AlugadaPor: null,
            tempoAluguel: null,
            image: "https://content2.kawasaki.com/ContentStorage/KMB/ProductTrimGroup/1022/a73c8a50-adcc-4d01-9d7c-e3128e9b6592.png"
        },
        {
            marca: "Kawasaki",
            modelo: "Z400 SE",
            ano: 2024,
            precoDiario: 71,
            disponivel: true,
            AlugadaPor: null,
            tempoAluguel: null,
            image: "https://content2.kawasaki.com/ContentStorage/KMB/ProductTrimGroup/72/93f4a6da-ffa3-477a-a5b5-b64ec53386b2.png"
        }, 
        {
            marca: "Kawasaki",
            modelo: "Ninja 400 KRT",
            ano: 2023,
            precoDiario: 83,
            disponivel: true,
            AlugadaPor: null,
            tempoAluguel: null,
            image: "https://content2.kawasaki.com/ContentStorage/KMB/ProductTrimGroup/63/29d15d3b-9718-4f5f-bd28-375bf653d218.png"
        },
        {
            marca: "Yamaha",
            modelo: "Lander 250 ABS",
            ano: 2023,
            precoDiario: 52,
            disponivel: true,
            AlugadaPor: null,
            tempoAluguel: null,
            image: "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v2714479589011595500/products/30105.B3G900010B-24.condicao.desktop.png&height=300&width=300"
        } 
    ]
            Moto.insertMany(newMotos).then((result) => {
                console.log(`${result.length} inseridos com sucesso`)
            }).catch((err) => {
                console.error('Erro ao inserir documentos:', err)
            })
    })


app.get("/buscar/:search", async (req, res) => {
    console.log(req.params.search)

    try{
        const motosEncontradas = await Moto.find({
            $or: [
                {marca: {$regex: req.params.search, $options: "i"} },
                {modelo: {$regex: req.params.search, $options: "i"} }
            ]
        })
        res.status(200).json(motosEncontradas)
        console.log(motosEncontradas)
    }catch(err){
        console.log("erro:", err)
    }
})  

const NAME = process.env.DB_NAME
const PASSWORD = process.env.DB_PASSWORD

mongoose.connect(`mongodb+srv://${NAME}:${PASSWORD}@motoshop.2jgzcpv.mongodb.net/?retryWrites=true&w=majority&appName=Motoshop`, { useNewUrlParser: true});

mongoose.connection.on('connected', () => {
    console.log('Conexão bem sucedida com o MongoDB');
    RemoverMotoExpiradaDeUsuarios();
    
    app.listen(process.env.PORT || 3000, () => {
        console.log('Servidor iniciado na porta 3000');
    });
});

mongoose.connection.on('error', (err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
}); 