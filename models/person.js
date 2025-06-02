require('dotenv').config()

const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log("Connecting to", url)
mongoose.connect(url).then(() => {
    console.log("Connected to MongoDB")
}).catch(error => {
    console.log("Error connecting to MongoDB", error)
})

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, "Name must be 3 characters long"]
    },
    number: {
        type: String,
        minLength: [8, "Number must be 8 characters long"],
        validate: {
            validator: (v) => {
                return /^\d{2,3}-\d+$/.test(v)
            },
            message: props => `${props.value} is not a valid phone number`
        }
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)

module.exports = Person