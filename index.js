const express = require('express')
const morgan = require('morgan');
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('dist'))

// Custom token to get request body
morgan.token('body', (req, res) => {
     return JSON.stringify(req.body)
})

// Custom format which includes the request body
const morganFormat = ':method :url :status :res[content-length] - :response-time ms :body'
app.use(morgan(morganFormat))

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        const body = `
                <p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date().toString()}</p>
            `
        res.send(body)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findById(id).then(person => {
        if(!person) return res.status(404).end()
        res.json(person)
    }).catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const {name, number} = req.body

    if(!name && !number){
        return res.status(400).json({
            error: "name and body missing"
        })
    }

    if(!name){
        return res.status(400).json({
            error: "name missing"
        })
    }

    if(!number){
        return res.status(400).json({
            error: "number missing"
        })
    }

    const person = new Person({
        name: name,
        number: number
    })

    person.save().then(newPerson => {
        res.json(newPerson)
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    const {name, number} = req.body
    const updatedPerson = {
        name: name,
        number: number
    }

    Person.findByIdAndUpdate(id, updatedPerson, {
        new: true,
        runValidators: true,
        context: 'query'
    }).then(returnedPerson => {
        if(!returnedPerson) return res.status(404).end()
        res.json(returnedPerson)
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findByIdAndDelete(id).then(() => {
        res.status(204).end()
    }).catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    return res.status(404).json({error: "unknown endpoint"})
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.log(error.message)

    if(error.name === 'CastError'){
        return res.status(400).json({error: "malformatted id"})
    } else if(error.name === 'ValidationError'){
        const messages = Object.values(error.errors).map(e => e.message)
        return res.status(400).json({error: messages.join(', ')})
    }

    next(error)
}

app.use(errorHandler)

const port = process.env.PORT
app.listen(port)
console.log(`Server running on port ${port}`)