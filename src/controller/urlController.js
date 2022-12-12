const urlModel = require('../model/urlModel')
const shortid = require("shortid")
const validUrl = require('valid-url')

const createUrl = async function (req, res) {
    try {
        let data = req.body;
        let { longUrl } = data;

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Long url is mandatory" });
        }
        if (!longUrl) {
            return res.status(400).send({ status: false, message: "longUrl must be present" });
        }
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, message: "Please provide valid Url" });
        }

        let checkUrl = await urlModel.findOne({ longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1 });

        if (checkUrl) {
            return res.status(200).send({ status: false, message: "Url already shorted", data: checkUrl });
        }

        let baseUrl = "http://localhost:3000";
        let urlCode = shortid.generate();
        let shortUrl = baseUrl + "/" + urlCode;

        let obj = { shortUrl: shortUrl, longUrl: longUrl, urlCode: urlCode }

        let saveData = await urlModel.create(obj);

        const finalUrl = {
            longUrl: saveData.longUrl,
            shortUrl: saveData.shortUrl,
            urlCode: saveData.urlCode
        }
        return res.status(201).send({ status: true, message: "shortUrl has been created successfully", data: finalUrl });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        let urlExist = await urlModel.findOne({ urlCode: urlCode })
        if (urlExist) {
            // return res.status(302).redirect(urlExist.longUrl)
            return res.status(302).send(`Found. Redirecting ${urlExist.longUrl}`)
        } else {
            return res.status(400).send({ status: false, msg: "shortUrl is not found" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createUrl, getUrl }