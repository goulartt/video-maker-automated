const algorithmia = require('algorithmia')
const algorithmaApiKey = require('../credentials/algorithmia.json').apiKey
const sbd = require('sbd');
const watsonApiKey = require('../credentials/ibm-credentials.json').apiKey;
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

var nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
})


limitiMaximumSentences = (content) => {
    content.sentences = content.sentences.slice(0, content.maximumSentences)
}

fetchWatsonAndReturnKeywords = async (sentence) => {
    return new Promise((resolve, reject) => {
        nlu.analyze({
            text: sentence,
            features: {
                keywords: {}
            }
        }, (error, response) => {
            if (error) {
                console.log('error:', err);
            }
            const keywords = response.keywords.map((keyword) => {
                return keyword.text
            })

            resolve(keywords)
        })
    }
    )
}

fetchKeywordsOfAllSentences = async(content) => {
    for (const sentence of content.sentences) {
        sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
    }
}



robot = async (content) => {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitiMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuth = algorithmia(algorithmaApiKey);
        const wikipediaAlgorithm = algorithmiaAuth.algo("web/WikipediaParser/0.1.2?timeout=300");
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLines = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDates = removeDatesInParentheses(withoutBlankLines);

        content.sourceContentSanitized = withoutDates;

    }
    function removeBlankLinesAndMarkdown(text) {
        const allLines = text.split('\n')

        const withoutBlankLines = allLines.filter((line) => {
            if (line.trim().length === 0 || line.trim().startsWith('=')) {
                return false
            }

            return true
        })

        return withoutBlankLines.join(' ');
    }

    function removeDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
    }

    function breakContentIntoSentences(content) {
        content.sentences = []

        const sentences = sbd.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

}

module.exports = robot;
