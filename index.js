const express = require('express')
const cors = require('cors')
var morgan = require('morgan')

const app = express()

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173"
}))

// Custom token to get request body
morgan.token('body', (req, res) => {
     return JSON.stringify(req.body)
})

// Custom format which includes the request body
const morganFormat = ':method :url :status :res[content-length] - :response-time ms :body'
app.use(morgan(morganFormat))

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

// 3.1
app.get('/api/persons', (req, res) => {
    res.json(persons)
})

// 3.2
app.get('/info', (req, res) => {
    const body = `
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date().toString()}</p>
    `
    res.send(body)
})

// 3.3
app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = persons.find(p => p.id === id)

    if(!person){
        res.statusMessage = `Not found person with id ${id} `
        return res.status(404).end()
    }

    res.json(person)
})

// 3.4
app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    persons = persons.filter(p => p.id !== id)

    res.status(204).end()
})

// 3.5
const generateId = () => {
    const random = Math.floor(Math.random() * 100000)
    return String(random)
}

app.post('/api/persons', (req, res) => {
    const body = req.body
    const {name, number} = body

    if(!body || Object.keys(body).length === 0){
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

    // 3.6
    const existingPerson = persons.find(p => p.name.toLowerCase().trim() === name.toLowerCase().trim())

    if(existingPerson){
        return res.status(400).json({
            error: "name must be unique"
        })
    }

    const person = {
        ...body,
        id: generateId()
    }

    persons = persons.concat(person)
    res.json(person)
})

const port = 3001
app.listen(port)
console.log(`Server running on port ${port}`)