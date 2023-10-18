require('dotenv').config()

const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)
    .then(result => {
        console.log('connected to database')
    })
    .catch((error) => {
        console.log(error)
    })

const validateNumber = (number) => {

  const numArr = number.split("-")

  if(numArr[0].length === 2 || numArr[0].length === 3)
  {
    return ((numArr[0].length + numArr[1].length) >= 8)
  }

  return false
}    

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    validate: {
      validator: validateNumber,
      message: 'Number is invalid' 
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

module.exports = mongoose.model('Person', personSchema)  