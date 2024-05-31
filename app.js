const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin', 
    database: 'gerenciamento_tickets'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL!');
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/abertura_atendimento', upload.single('anexo'), (req, res) => {
    const { nome_empresa, cnpj, problema } = req.body;
    const anexo = req.file ? req.file.filename : null;

    console.log(req.body); 

    if (!nome_empresa || !cnpj || !problema) {
        console.log('Campos obrigatórios não preenchidos:', { nome_empresa, cnpj, problema });
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const insertAberturaSql = 'INSERT INTO abertura_atendimento (nome_empresa, cnpj, problema, anexo, data_abertura) VALUES (?, ?, ?, ?, NOW())';
    db.query(insertAberturaSql, [nome_empresa, cnpj, problema, anexo], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao salvar os dados no banco de dados.' });
        } else {
            const numero_atendimento = result.insertId;

            const getDataAberturaSql = 'SELECT data_abertura FROM abertura_atendimento WHERE id = ?';
            db.query(getDataAberturaSql, [numero_atendimento], (err, rows) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Erro ao recuperar a data de abertura.' });
                } else {
                    const data_abertura = rows[0].data_abertura;

                    const insertTratativaSql = 'INSERT INTO tratativa_atendimento (numero_atendimento, cnpj, data_abertura) VALUES (?, ?, ?)';
                    db.query(insertTratativaSql, [numero_atendimento, cnpj, data_abertura], (err, result) => {
                        if (err) {
                            console.error(err);
                            res.status(500).json({ error: 'Erro ao salvar os dados do atendimento no banco de dados.' });
                        } else {
                            res.status(200).json({ message: 'Contato e atendimento salvos com sucesso!' });
                        }
                    });
                }
            });
        }
    });
});

app.get('/api/tratativa_atendimento/:numeroAtendimento', (req, res) => {
    const numeroAtendimento = req.params.numeroAtendimento;
    const sql = 'SELECT * FROM tratativa_atendimento WHERE numero_atendimento = ?';
    db.query(sql, [numeroAtendimento], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao buscar por número de atendimento na tabela de atendimentos.' });
        } else {
            if (result.length > 0) {
                res.status(200).json({ success: true, atendimentos: result });
            } else {
                res.status(404).json({ success: false, message: 'Nenhum atendimento encontrado para o número fornecido.' });
            }
        }
    });
});

app.get('/api/tratativa_atendimento/cnpj/:cnpj', (req, res) => {
    const cnpj = req.params.cnpj;
    const sql = 'SELECT * FROM tratativa_atendimento WHERE cnpj = ?';
    db.query(sql, [cnpj], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao buscar por CNPJ na tabela de abertura_atendimento.' });
        } else {
            if (result.length > 0) {
                res.status(200).json({ success: true, atendimentos: result });
            } else {
                res.status(404).json({ success: false, message: 'Nenhum atendimento encontrado para o CNPJ fornecido.' });
            }
        }
    });
});

app.get('/api/tratativa_atendimento/analista_nome', (req, res) => {
    const sql = 'SELECT * FROM tratativa_atendimento WHERE analista_nome IS NULL';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao buscar por atendimento sem analista' });
        } else {
            if (result.length > 0) {
                res.status(200).json({ success: true, atendimentos: result });
            } else {
                res.status(404).json({ success: false, message: 'Nenhum atendimento sem analista encontrado' });
            }
        }
    });
});
  
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro no servidor.' });
        }
        if (result.length > 0) {
            return res.status(200).json({ message: 'Login bem-sucedido.' });
        } else {
            return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
