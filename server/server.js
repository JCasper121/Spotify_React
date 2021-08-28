require('dotenv').config();
const express = require("express");
const SpotifyWebApi = require('spotify-web-api-node');
const lyricsFinder = require("lyrics-finder");
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/lyrics", async (req, res) => {
    const lyrics = (await lyricsFinder(req.query.artist, req.query.track)) || "No lyrics found"
    res.json({lyrics});
})

app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken;
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken
    })

    spotifyApi.refreshAccessToken().then(data => {
        res.json({
            accessToken: data.body.accessToken,
            expiresIn: data.body.expiresIn
        })
    }).catch((err) => {
        console.log("Refresh err:", err)
        res.sendStatus(400);
    })
})




app.post("/login", (req, res) => {
    const code = req.body.code;

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    })

    console.log("Spotify API values: \nredirectUri" + process.env.REDIRECT_URI + "\nclientId: " + process.env.CLIENT_ID + "\nclientSecret: " + process.env.CLIENT_SECRET);

    spotifyApi.authorizationCodeGrant(code).then(data => {
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in,
        })
    }).catch(() => {
        res.sendStatus(400);
    })
})

app.listen(3001);