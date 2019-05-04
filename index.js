const robots = {
    text: require('./robots/text'),
    input: require('./robots/input'),
    image: require('./robots/image'),
    video: require('./robots/video')
}

start = async () => {


    robots.input()
    await robots.text()
    await robots.image()
    await robots.video()
 
}

start()