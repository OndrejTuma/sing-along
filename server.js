const bodyParser = require('body-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const next = require('next');

const secret = require('./consts/secret');

const Chapter = require('./models/Chapter');
const User = require('./models/User');

const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

const APP_PORT = 3000;

mongoose
    .connect(
        'mongodb://mongo:27017/sing-along',
        { useNewUrlParser: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

app.prepare()
    .then(() => {
        const server = express();

        server.use(bodyParser.json());

        server.get('*', async (req, res) => {
            const chapters = await Chapter.find();
            return handle(req, Object.assign(res, {chapters: chapters}));
        });

        server.post('/chapter/add', (req, res) => {
            const newChapter = new Chapter({
                title: req.body.title,
                body: req.body.body,
            });

            newChapter.save().then(() => res.redirect('/'));
        });

        server.post('/user/create', (req, res) => {
            const newUser = new User({
                login: req.body.login,
                password: req.body.password,
            });

            newUser.save().then(() => res.redirect('/'));
        });

        server.post('/user/login', async (req, res) => {
            try {
                const user = await User.findOne({
                    login: req.body.login,
                    password: req.body.password,
                });

                if (!user) {
                    return res.status(200).json({error: 'user not found'});
                }

                const JWT = jwt.sign({
                    login: user.login,
                }, secret, {
                    expiresIn: '1h',
                });

                res.status(200).json({token: JWT});
            } catch (e) {
                res.status(500).json(e);
            }
        });

        server.listen(APP_PORT, (err) => {
            if (err) {
                throw err;
            }
            console.log(`> Ready on http://localhost:${APP_PORT}`);
        });
    })
    .catch((ex) => {
        console.error(ex.stack);
        process.exit(1)
    });