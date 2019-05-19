const express = require("express")

/* Express with CORS & automatic trailing '/' solution */
const app = express()
app.get("*", (request, response) => {
  response.send(
    "Hello from Express on Firebase with CORS! No trailing '/' required!"
  )
})

module.exports = app