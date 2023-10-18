require('dotenv').config()
const http = require('http')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('postData', (req) => {
  return JSON.stringify(req.body); 
});

app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :response-time ms - :postData'));


  app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
      res.json(persons)
    }) 
  })

  app.get('/info', (req, res) => {
    Person.countDocuments({})
      .then(count => {
        const time = new Date().toString();
        res.send(`Phonebook has info for ${count} people\n${time}`);
      })
      .catch(err => {
        console.log(err);
        return res.status(500).end();
      });
  });

  app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
  })

  app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id).then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
  })

  app.use(express.json())

  app.post('/api/persons', (req,res, next) => {

    const body = req.body

    if(!body.name || !body.number)
    {
      return res.status(400).json({error: 'content missing'})
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    })

    person.save().then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
  })

  app.put('/api/persons/:id', (req, res, next) => {
    
    const body = req.body

    const person = {
      name: body.name,
      number: body.number
    }

    if(!body.name || !body.number)
    {
      return res.status(400).json({error: 'content missing'})
    }

    Person.findByIdAndUpdate(req.params.id, person, {new: true})
      .then(updatedPerson => {
        res.json(updatedPerson)
      })
      .catch(error => next(error))
  })

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
      return response.status(400).json({error: error.message})
    }
    next(error)
  }
  
  app.use(errorHandler)

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


