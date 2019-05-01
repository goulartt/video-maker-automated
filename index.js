const robots = {
    text: require('./robots/text'),
    input: require('./robots/input'),
    image: require('./robots/image')
}

start = async () => {


    //robots.input()
    //await robots.text()
    await robots.image()
 
}

start()