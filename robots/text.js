const algorithmia = require('algorithmia')
const algorithmaApiKey = require('../credentials/algorithmia.json').apiKey
const sbd = require('sbd');

robot = async (content) => {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

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
        const allLines = text.spit('\n')

        const withoutBlankLines = allLines.filter((line) => {
            if (line.trim().length === 0 || line.trim().startsWit('=')) {
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
