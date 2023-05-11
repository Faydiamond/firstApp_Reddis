

/*const express = require("express")
const axios= require('axios')
const responseTime = require('response-time')
const { createClient } = require('redis')
const { promisify } = require ("util")

const app = express()

const client = createClient({
    host : "127.0.0.1",
    port : 6379
});

//promiesa
const GET_REDIS = promisify(client.get).bind(client)
const SET_REDIS = promisify(client.set).bind(client)

app.use(responseTime());

//Get characvters
app.get("/character", async (req,res) => {
    try 
    {
        console.log("XXX");
        
        // Search Data in Redis
        const reply = await GET_REDIS("characters");

        // existe la variable character
        if (reply) 
            return res.json(JSON.parse(reply));
        // peticion ricky morty
        const response = await axios.get(
            "https://rickandmortyapi.com/api/character"
        );

        await SET_REDIS("characters", JSON.stringify(response.data))
        
        
        // respuesta al cli9ente
        res.json(response.data);
    } catch (error) {
        console.log(` error al momento de realixar la peticion ${error} `);
    }
} )




async function main() {
    await client.connect();
    app.listen(3000);
    console.log("server listen on port 3000");
  }
  
main();

*/
const express = require("express");
const axios = require("axios");
const { createClient } = require("redis");
const responseTime = require("response-time");



const app = express();

// Connecting to redis
const client = createClient({
  host: "127.0.0.1",
  port: 6379,
});


app.use(responseTime());

// Get all characters
app.get("/character", async (req, res, next) => {
  try 
  {
    // Search Data in Redis
    const reply = await client.get("character"); //que hay en la variable characters

    // if exists returns from redis and finish with response
    if (reply) return res.send(JSON.parse(reply));

    // Fetching Data from Rick and Morty API
    const response = await axios.get(
      "https://rickandmortyapi.com/api/character"
    );

    // Saving the results in Redis. The "EX" and 10, sets an expiration of 10 Seconds
    const saveResult = await client.set(
      "character",
      JSON.stringify(response.data),
      {
        EX: 10,
      }
    );

    // resond to client
    res.send(response.data);
  } catch (error) {
    console.log(error);
    return {"status":"false"}
  }
});


//traer character por id
app.get("/character/:id", async (req, res) => 
{
    try {
        const id = await client.get(req.params.id);
        if (id) return res.send(JSON.parse(id));
        const response = await axios.get("https://rickandmortyapi.com/api/character/"  +req.params.id );
        
        const saveResult = await client.set(
            req.params.id,
            JSON.stringify(response.data),
            {
              EX: 10,
            }
        );
        
        return res.json(response.data)
    } catch (error) {
        console.log(error);
        return {"status":"false"}
    }
});


async function main() {
  await client.connect();
  app.listen(3000);
  console.log("server listen on port 3000");
}

main();

