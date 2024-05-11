const express = require('express');
const cors = require('cors');


const { MongoClient, ServerApiVersion,ObjectId} = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());

app.use(express.json());

// middlewares 




// console.log(process.env.BD_USER);
// console.log(process.env.BD_PASS);


// const uri = "mongodb://localhost:27017";

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.ckoz8fu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
   

    const categoryCollection = client.db('resturentDB').collection('category');
    const foodsCollection = client.db("resturentDB").collection("foods");

    app.get('/food', async (req, res) => {
      const cursor = foodsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })

  app.get('/food/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodsCollection.findOne(query);
      res.send(result);
  })


   app.put('/food/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedFood = req.body;

      const product = {
          $set: {
              Food_Name: updatedFood.Food_Name,
              Food_Image: updatedFood.Food_Image,
              Food_Category: updatedFood.Food_Category,
              quantity: updatedFood.quantity,
              price: updatedFood.price,
              Food_Origin: updatedFood.Food_Origin,
              description: updatedFood.description,
             
              email: updatedFood.email,
              name: updatedFood.name,
   
           
          }
      }

      const result = await foodsCollection.updateOne(filter, product, options);
      res.send(result);
  })


    app.get('/foodEmail', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await foodsCollection.find(query).toArray();
      res.send(result);
  })



    

    app.post("/addFood", async (req, res) => {
      console.log(req.body);
      const result = await foodsCollection.insertOne(req.body);
      console.log(result);
       res.send(result)
    })


    app.get('/category', async (req, res) => {
        const cursor = categoryCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })


    


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`resturentDB Doctor Server is running on port ${port}`)
})
