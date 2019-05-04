const state = require('./state')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const imageDownloader = require('image-downloader')
const googleSearchCredentials = require('../credentials/google-search')


robot = async () => {
    console.log('> [image-robot] Starting...')
    const content = state.load()

    await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)
    state.save(content)


    async function fetchImagesOfAllSentences(content) {
        for (const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)

            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            searchType: 'image',
            num: 2
        })

        const imagesUrl = response.data.items.map((item) => {
            return item.link
        })

        return imagesUrl
    }

    async function downloadAllImages(content) {
        content.downloadedImages = []


        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {

            let images = content.sentences[sentenceIndex].images

            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex]

                try {

                    if (content.downloadedImages.includes(imageUrl)) {
                        throw new Error('Imagem duplicada')
                    }

                    await downloadAndSaveImage(imageUrl, `${sentenceIndex}-original.png`)
                    content.downloadedImages.push(imageUrl)
                    console.log(`> [${sentenceIndex}] [${imageIndex}] Baixou a imagem com sucesso: ${imageUrl} `)
                    break;
                } catch (error) {
                    console.log(`> [${sentenceIndex}] [${imageIndex}] Erro ao baixar: ${imageUrl} `)
                    console.log(`> [${sentenceIndex}] [${imageIndex}] Erro: ${error} `)

                }
            }
        }
    }

    async function downloadAndSaveImage(url, fileName) {
        return imageDownloader.image({
            url: url,
            dest: `./content/${fileName}`
        })
    }




}

module.exports = robot