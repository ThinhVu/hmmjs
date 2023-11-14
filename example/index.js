const HmmBuilderFactory = require('../src/builder')

function fetch(url, data) {
    return new Promise((resolve, reject) => {
        // resolve(data)
        reject('Oops, something bad')
    })
}

async function main() {
    const send = data => fetch('/execute', data)
    const Model = HmmBuilderFactory(send)

    try {
        const FileModel = Model('file');
        const files = await FileModel.find({name: 'x'}).sort({date: -1})
        console.log('file', files)
    } catch (e) {
        console.error('failed to get files', e)
    }
}
main()