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
