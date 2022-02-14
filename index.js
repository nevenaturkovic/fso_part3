if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}
const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const app = express()
const cors = require("cors")
const Person = require("./models/person")

app.use(express.static("build"))
app.use(bodyParser.json())
app.use(cors())
app.use(express.json())

morgan.token("jsoncontent", (request, response) => JSON.stringify(request.body))
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :jsoncontent"
  )
)

app.get("/info", (request, response) => {
  const numberOfPersons = Person.estimatedDocumentCount().then((count) => {
    response.send(`
    <p>Phonebook has info for ${count} people</p>
    <p>${new Date()}</p>
    `)
  })
})

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.post("/api/persons", (request, response, next) => {
  const body = request.body
  const personName = body.name

  if (body === undefined) {
    return response.status(400).json({ error: "content missing" })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson.toJSON())
    })
    .catch((error) => {
      console.log("post error", error)
      return next({
        message: "Person already exists.",
        name: "DuplicatePerson"
      })
    })
})

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      console.log(result)
      if (result === null) {
        // Person didn't exist.
        next({
          name: "NonExistentError",
          message: "Such person doesn't exist.",
        })
      } else {
        // Person existed but we deleted it.
        response.status(204).end()
      }
    })
    .catch((error) => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
  })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  } else if (error.name === "DuplicatePerson") {
    return response.status(409).json({ error: error.message })

  } else {
    console.log("unhandled error", error)
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
