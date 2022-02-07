const express = require("express")
const morgan = require("morgan")
const app = express()
const cors = require("cors")
require("dotenv").config()
const Person = require("./models/person")

app.use(express.static("build"))
app.use(cors())
app.use(express.json())

morgan.token("jsoncontent", (request, response) => JSON.stringify(request.body))
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :jsoncontent"
  )
)

// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ]

// app.get("/", (request, response) => {
//   response.send("<h1>Hello World!</h1>")
// })

// app.get("/info", (request, response) => {
//   const numberOfPersons = persons.length
//   response.send(`
//   <p>Phonebook has info for ${numberOfPersons} people</p>
//   <p>${new Date()}</p>
//   `)
// })

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.post("/api/persons", (request, response) => {
  const body = request.body

  if (body === undefined) {
    return response.status(400).json({ error: "content missing" })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
})

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person)
  })
})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((person) => person.id !== id)

  response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
