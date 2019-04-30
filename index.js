const robots = {
    text: require('./robots/text'),
    input: require('./robots/input')
}

start = async () => {


    robots.input()
    await robots.text()
 
}

start()