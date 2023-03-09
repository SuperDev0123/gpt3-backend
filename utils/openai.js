const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports.getEmbeddings = (input) => {
    return new Promise((resolve, reject) => {
        const model = "text-embedding-ada-002";
        openai.createEmbedding({
            model,
            input,
        }).then((response) => {
            resolve({ embedding: response.data.data[0].embedding, token: response.data.usage.total_tokens })
        }).catch((err) => {
            console.error(err)
            resolve({ embedding: [], token: 0 })
        })
    })
}

module.exports.getEmbeddingContext = (contentEmbeddings, promptEmbedding) => {
    const SEPARATOR = "\n* "
    const MAX_SECTION_LEN = 2500
    let encoder = new TextEncoder();
    let separator_len = encoder.encode(SEPARATOR).length
    contentEmbeddings = contentEmbeddings.map(e => ({
        content: e.content,
        token: e.token,
        similarity: vectorSimilarity(JSON.parse(e.embedding), promptEmbedding)
    }))
    contentEmbeddings.sort((a, b) => b.similarity - a.similarity)
    let chosen_sections = []
    let chosen_sections_len = 0
    for (let i = 0; i < contentEmbeddings.length; i++) {
        let embedding = contentEmbeddings[i]
        chosen_sections_len += embedding.token + separator_len
        if (chosen_sections_len > MAX_SECTION_LEN) {
            break;
        }
        chosen_sections.push(SEPARATOR + embedding.content.replace("\n", " ").replace("\r", " "))
    }
    return chosen_sections.join('');
}

module.exports.createCompletion = (prompt, content, sessionHistory) => {
    return new Promise((resolve, reject) => {
        const model = "text-davinci-002";
        const temperature = 0.7;
        const maxTokens = 300;
        openai.createCompletion({
            model: model,
            prompt: `Using the provided context, previous questions and answers, answer the question, and if the answer is not contained try and improvise

            ${"Context:"}
            ${content}

            ${sessionHistory.map(session => (`\nQ: ${session.question}\nA: ${session.answer}`))}\nQ: ${prompt}\nA:`,
            // prompt: `Answer the question as truthfully as possible using the provided text and previous questions and answers, and if the answer is not contained within the text below, say "I'm not sure, but let's do some research and see what we can find out!"

            // ${"Context:"}
            // ${content}

            // ${sessionHistory.map(session => (`\nQ: ${session.question}\nA: ${session.answer}`))}\nQ: ${prompt}\nA:`,
            temperature: temperature,
            max_tokens: maxTokens
        }).then((response) => {
            const generatedText = response.data.choices[0].text.trim();
            resolve(generatedText)
        }).catch((err) => {
            resolve('Oops. Sorry I failed to get answer.');
        });
    })
}

const vectorSimilarity = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);