const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
}));

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

app.get('/api/tratativa_atendimento/numero/:numeroAtendimento', (req, res) => {
    const numeroAtendimento = req.params.numeroAtendimento;
    const atendimentoSql = 'SELECT * FROM tratativa_atendimento WHERE numero_atendimento = ?';
    const comentariosSql = 'SELECT comentario, analista_nome, data_comentario FROM comentarios_tratativa_atendimento WHERE numero_atendimento = ?';
    
    db.query(atendimentoSql, [numeroAtendimento], (err, atendimentoResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao buscar por número de atendimento na tabela de atendimentos.' });
        }

        if (atendimentoResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Nenhum atendimento encontrado para o número fornecido.' });
        }

        db.query(comentariosSql, [numeroAtendimento], (err, comentariosResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao buscar comentários para o número de atendimento fornecido.' });
            }

            const atendimento = atendimentoResult[0];
            atendimento.comentarios = comentariosResult;

            res.status(200).json({ success: true, atendimento: atendimento });
        });
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

app.get('/api/tratativa_atendimento/cnpj/:cnpj', (req, res) => {
    const cnpj = req.params.cnpj;
    const consultaAtendimentos = 'SELECT * FROM tratativa_atendimento WHERE cnpj = ?';
    const consultaComentarios = `
        SELECT c.comentario, c.analista_nome, c.data_comentario 
        FROM comentarios_tratativa_atendimento c
        INNER JOIN tratativa_atendimento t ON c.numero_atendimento = t.numero_atendimento
        WHERE t.cnpj = ?
    `;
    
    db.query(consultaAtendimentos, [cnpj], (err, atendimentoResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao buscar atendimentos por CNPJ na tabela de tratativa_atendimento.' });
        }

        if (atendimentoResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Nenhum atendimento encontrado para o CNPJ fornecido.' });
        }

        const numerosAtendimentos = atendimentoResult.map(atendimento => atendimento.numero_atendimento);

        db.query(consultaComentarios, [cnpj], (err, comentariosResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao buscar comentários para o CNPJ fornecido.' });
            }

            const atendimentosComComentarios = atendimentoResult.map(atendimento => {
                const comentarios = comentariosResult.filter(comentario => comentario.numero_atendimento === atendimento.numero_atendimento);
                return {
                    ...atendimento,
                    comentarios: comentarios
                };
            });

            res.status(200).json({ success: true, atendimentos: atendimentosComComentarios });
        });
    });
});

app.get('/api/dados', (req, res) => {
    const sql = 'SELECT * FROM tratativa_atendimento';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

app.get('/api/dados/:id', (req, res) => {
    const sql = 'SELECT * FROM tratativa_atendimento WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        console.log('Dados retornados:', result);
        res.json(result[0]);
    });
});

app.post('/api/comentario', (req, res) => {
    const { numero_atendimento, comentario, analista_nome } = req.body;

    const insertCommentSql = 'INSERT INTO comentarios_tratativa_atendimento (numero_atendimento, comentario, analista_nome) VALUES (?, ?, ?)';
    const updateTratativaSql = 'UPDATE tratativa_atendimento SET data_ultima_atualizacao = NOW(), ultimo_comentario = ?, analista_nome = ? WHERE numero_atendimento = ?';

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).send(err);
        }

        db.query(insertCommentSql, [numero_atendimento, comentario, analista_nome], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).send(err);
                });
            }

            db.query(updateTratativaSql, [comentario, analista_nome, numero_atendimento], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).send(err);
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).send(err);
                        });
                    }
                    res.send('Comentário inserido com sucesso');
                });
            });
        });
    });
});

function authenticationMiddleware(req, res, next) {
    if (req.session && req.session.username) {
        return next();
    } else {
        return res.status(401).json({ error: 'Acesso não autorizado.' });
    }
}

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro no servidor.' });
        }
        if (result.length > 0) {
            req.session.username = username;
            return res.status(200).json({ success: true, message: 'Login bem-sucedido.' });
        } else {
            return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }
    });
});

app.get('/api/dados-protegidos', authenticationMiddleware, (req, res) => {
    res.json({ message: 'Você está autenticado e pode acessar este recurso.' });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
