const urlModel = require('../model/urlModel')
// const shortid = require("shortid")
const validUrl = require('valid-url');
const { default: axios } = require('axios');
const redis = require('redis')
const { promisify } = require('util')



const redisClient = redis.createClient(
    13586,
    "redis-13586.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("EAoXqRaqOeKv9nTPCcY17AklKiOSOGTe", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const createUrl = async function (req, res) {
    try {
        let data = req.body
        let longUrl = req.body.longUrl;

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Long url is mandatory" });
        }
        if (!longUrl) {
            return res.status(400).send({ status: false, message: "longUrl must be present" });
        }
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, message: "Please provide valid Url" });
        }

        let cacheData = await GET_ASYNC(`${longUrl}`)
        let parsedData = JSON.parse(cacheData)
        if (cacheData) {
            return res.status(200).send({ status: false, message: "url already shortened", data: parsedData })
        }

        let correctUrl = false
        let options = {
            method: "get",
            url: longUrl
        }
        await axios(options)
            .then(() => { correctUrl = true })
            .catch(() => { correctUrl = false })
        if (correctUrl == false) {
            return res.status(404).send({ status: false, message: "url not found" })
        }

        let baseUrl = "http://localhost:3000";
        let urlCode = (Math.random() + 1).toString(36).substring(7) + longUrl.slice(-1)
        let shortUrl = baseUrl + "/" + urlCode;

        let obj = { shortUrl: shortUrl, longUrl: longUrl, urlCode: urlCode }

        let saveData = await urlModel.create(obj);

        const finalUrl = {
            longUrl: saveData.longUrl,
            shortUrl: saveData.shortUrl,
            urlCode: saveData.urlCode
        }

        await SET_ASYNC(`${longUrl}`, JSON.stringify(finalUrl))

        return res.status(201).send({ status: true, message: "shortUrl has been created successfully", data: finalUrl });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        let cacheUrl = await GET_ASYNC(`${urlCode}`)
        if (cacheUrl) {
            let parsedUrl = JSON.parse(cacheUrl)
            return res.status(302).redirect(parsedUrl.longUrl)
        } else {
            let urlExist = await urlModel.findOne({ urlCode: urlCode })
            await SET_ASYNC(`${urlCode}`, JSON.stringify(urlExist))
            if (!urlExist) { return res.status(404).send({ status: false, message: "No url found" }) }
            return res.status(302).redirect(urlExist.longUrl)
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
module.exports = { createUrl, getUrl }