const bodyParser = require('body-parser');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const next = require('next');

const secret = require('./consts/secret');
const cookieName = require('./api/cookie-name');
const cookieMaxage = require('./api/cookie-maxage');
const userHelper = require('./helpers/server/user');

const Repertoire = require('./mongo/models/Repertoire');
const Section = require('./mongo/models/Section');
const Song = require('./mongo/models/Song');
const User = require('./mongo/models/User');

const dev = process.env.NODE_ENV !== 'production';

const app = next({dev});
const handle = app.getRequestHandler();

const APP_PORT = 3000;

if (dev) {
    mongoose.set('debug', true);
}

mongoose
    .connect(
        'mongodb://mongo:27017/sing-along',
        {useNewUrlParser: true}
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

app.prepare()
    .then(() => {
        const server = express();

        server.use(bodyParser.json());
        server.use(cookieParser());

        // update token
        server.all('*', (req, res, next) => {
            // but only for page and api's requests
            if (req.url.match(/\/(static|_next)\//) || !req.headers.cookie) {
                return next();
            }

            const token = cookie.parse(req.headers.cookie)[cookieName];

            try {
                const data = jwt.verify(token, secret);

                const newToken = userHelper.login(data);

                res.cookie(cookieName, newToken, {maxAge: cookieMaxage});

                req.login = data.login;
            } catch (e) {
            }

            next();
        });
        server.all(/admin\/[a-zA-Z0-9]{3,}/, (req, res, next) => {
            try {
                const token = cookie.parse(req.headers.cookie)[cookieName];
                jwt.verify(token, secret);

                next();
            } catch (e) {
                return res.status(200).json({
                    error: 'Nemáte platný přihlašovací token',
                });
            }
        });

        server.get(/\/|admin/, async (req, res) => {
            let activeRepertoire;

            if (req.url === '/') {
                try {
                    const repertoire = await Repertoire.findOne({active: true});
                    const sections = await Section.find({belongsTo: repertoire._id});
                    const songs = await Song.find({
                        _id: {
                            $in: sections.reduce((res, section) => {
                                section.songs && section.songs.map(({_id: id}) => res.push(id));
                                return res;
                            }, [])
                        }
                    });

                    activeRepertoire = {
                        repertoire: repertoire,
                        sections: sections,
                        songs: songs,
                    };
                } catch (e) {
                    console.error(e);
                }
            } else {
                activeRepertoire = await Repertoire.findOne({active: true});
            }

            const songs = await Song.find();

            return handle(req, Object.assign(res, {
                activeRepertoire: activeRepertoire,
                songs: songs,
            }));
        });

        server.post('/admin/repertoire/create', async (req, res) => {
            try {
                const newRepertoire = new Repertoire({
                    title: req.body.title,
                });

                await newRepertoire.save();

                res.status(200).json({
                    repertoire: newRepertoire,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/repertoire/delete', async (req, res) => {
            try {
                await Repertoire.deleteOne({_id: req.body.id});
                await Section.deleteMany({belongsTo: req.body.id});

                res.status(200).json({
                    success: true,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/repertoire/fetch/:id', async (req, res) => {
            try {
                const repertoire = await Repertoire.find({_id: req.params.id});

                res.status(200).json({
                    repertoire: repertoire,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/repertoire/fetch-all', async (req, res) => {
            try {
                const repertoires = await Repertoire.find();

                res.status(200).json({
                    repertoires: repertoires,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/repertoire/set/active', async (req, res) => {
            try {
                await Repertoire.updateMany({active: true}, {$set: {active: false}});
                await Repertoire.updateOne({_id: req.body.id}, {$set: {active: true}});

                res.status(200).json({
                    success: true,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/section/create', async (req, res) => {
            try {
                const newSection = new Section({
                    belongsTo: req.body.repertoireId,
                    title: req.body.title,
                    songs: req.body.songs,
                    position: req.body.position,
                });

                await newSection.save();

                res.status(200).json({
                    section: newSection,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/section/delete', async (req, res) => {
            try {
                await Section.deleteOne({
                    _id: req.body.id,
                });

                res.status(200).json({
                    success: true,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/section/fetch/:repertoireId', async (req, res) => {
            try {
                const sections = await Section.find({belongsTo: req.params.repertoireId});

                res.status(200).json({
                    sections: sections,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/section/update', async (req, res) => {
            try {
                await Section.updateOne({_id: req.body.id}, {$set: req.body.data});

                res.status(200).json({
                    success: true,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/song/create', async (req, res) => {
            try {
                const adminUser = await User.findOne({login: req.login});

                const newSong = new Song({
                    author: adminUser._id,
                    title: req.body.title,
                    text: req.body.text,
                });

                await newSong.save();

                res.status(200).json({
                    song: newSong,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/song/delete', async (req, res) => {
            try {
                await Song.deleteOne({
                    title: req.body.title,
                });

                res.status(200).json({
                    success: true,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/song/fetch-all', async (req, res) => {
            try {
                const songs = await Song.find();

                res.status(200).json({
                    songs: songs,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/song/update', async (req, res) => {
            try {
                await Song.updateOne({_id: req.body.id}, {$set: req.body.data});

                res.status(200).json({
                    success: true,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/admin/user/create', async (req, res) => {
            try {
                const newUser = new User({
                    login: req.body.login,
                    password: req.body.password,
                });

                await newUser.save();

                res.status(200).json({
                    success: true,
                });
            } catch (e) {
                res.status(500).json(e);
            }
        });
        server.post('/user/login', async (req, res) => {
            try {
                const user = await User.findOne({
                    login: req.body.login,
                    password: req.body.password,
                });

                if (!user) {
                    return res.status(200).json({error: 'invalid credentials'});
                }

                const token = userHelper.login(user);

                res.cookie(cookieName, token, {maxAge: cookieMaxage});

                res.status(200).json({
                    success: true,
                });
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