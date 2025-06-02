const mongoose = require('mongoose')

if(process.argv.length < 3){
    console.log('Usage')
    console.log('node mongo.js <password>                  #List entries')
    console.log('node mongo.js <password> <name> <number>  #Add a new entry')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://fullstack:${password}@cluster0.0kf6qni.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if(!name || !number){
    Person.find({}).then(persons => {
        console.log("phonebook:")
        persons.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
    }).catch(error => {
        console.error('Error retrieving phonebook:', error)
    }).finally(() => mongoose.connection.close())

    return
}

const person = new Person({
    name: name,
    number: number
})

person.save().then(person => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
}).catch(error => {
    console.error('Error saving person:', error)
}).finally(() => mongoose.connection.close())
