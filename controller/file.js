const { File, Information } = require('../model')
const textract = require('textract');
const { getEmbeddings, getEmbeddingContext, createCompletion } = require('../utils/openai');
const { getBasenameFormUrl } = require('../utils');
const { default: axios } = require('axios');

module.exports.getFileList = (req, res) => {
    File.findAll().then(files => {
        return res.status(200).json({ files, });
    })
}

module.exports.deleteFile = (req, res) => {
    const { file_id } = req.body;
    File.destroy({
        where: {
            id: file_id
        }
    }).then(result => {
        File.findAll().then(files => {
            return res.status(200).json({ message: "File is deleted successfully!", files, });
        })
    })
}

module.exports.uploadFile = (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(401).json({ error: "Url is invalid" });
    }

    getTextRact(url, (error, text) => {
        console.log(error, text)
        if (error) {
            console.log(error)
            return res.status(401).json({ error: "Url is invalid!", });
        }
        File.create({
            url,
            filename: getBasenameFormUrl(url)
        }).then(async newFile => {
            let list = text.split('. ')
            for (let i = 0; i < list.length; i++) {
                const content = list[i]
                if (content.trim().length > 0) {
                    const response = await getEmbeddings(content)
                    if (response.token) {
                        await Information.create({
                            content,
                            file_id: newFile.id,
                            embedding: JSON.stringify(response.embedding),
                            token: response.token
                        })
                    }
                }
            }
            File.findAll().then((files) => {
                return res.status(200).json({ message: "File is uploaded successfully!", files, });
            })
        })
    })
    // Check if the user exists in the database
};

const getTextRact = async (url, callback) => {
    const response = await axios.post('http://132.148.74.110:443/text-ract', {
        url
    })
    return callback(response.error, response.text)
}

module.exports.textRact = (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(401).json({ error: "Url is invalid" });
    }

    textract.fromUrl(url, (error, text) => {
        if (error) {
            console.log(error)
            return res.status(401).json({ error: "Url is invalid!", });
        }
        return res.status(200).json({ text, });
    })
    // Check if the user exists in the database
};


module.exports.getAnswer = (req, res) => {
    const { question, sessionHistory } = req.body;
    getEmbeddings(question).then(questionEmbedding => {
        Information.findAll().then(contentEmbeddings => {
            const context = getEmbeddingContext(contentEmbeddings, questionEmbedding)
            createCompletion(question, context, sessionHistory).then(answer => {
                return res.status(200).json({ answer, });
            })
        })
    })
}
