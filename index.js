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
    const galleryCollection = client.db('resturentDB').collection('gallery');
    const foodsCollection = client.db("resturentDB").collection("foods");
    const foodOrderCollection = client.db('resturentDB').collection('foodOrder');
    app.get('/food', async (req, res) => {
      const cursor = foodsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })
  app.delete('/food/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await foodsCollection.deleteOne(query);
    res.send(result);
})
  app.get('/food/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodsCollection.findOne(query);
      res.send(result);
  })


  

 

  app.delete('/foodPurchas/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await foodOrderCollection.deleteOne(query);
    res.send(result);
})
  app.patch('/foodupdate/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedFood = req.body;
    console.log(updatedFood);
    const updateDoc = {
        $set: {
            quantity: updatedFood.quantity
        },
    };
    const result = await foodsCollection.updateOne(filter, updateDoc);
    res.send(result);
})

    app.get('/foodOrderPurchase', async (req, res) => {
      console.log(req.query.buy_email);
      let query = {};
      if (req.query?.buy_email) {
          query = { buy_email: req.query.buy_email }
      }
      const result = await foodOrderCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/foodOrder/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const options = {
      projection: { price: 1,quantity:1, Food_Name: 1, Food_Image: 1,name:1,email:1 },
      
    };
    const result = await foodsCollection.findOne(query,options);

    res.send(result);


    });

    //foodOrder purpose
    app.post('/foodOrder', async (req, res) => {
      const foodOrder = req.body;
      console.log(foodOrder);
      const result = await foodOrderCollection.insertOne(foodOrder);
      res.send(result);
   });


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


    app.get('/gallery', async (req, res) => {
        const cursor = galleryCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/category', async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })

   

  //selling count purpose


  app.get('/product/:id/selling-count', async (req, res) => {
         const productId = req.params.id;

         console.log("test--",productId);
        // Find the products, limit the results to 6, and sort by sellingCount in descending order
        
        const product = await foodOrderCollection.updateOne(
          { Food_Name_id: productId },
          { $inc: { sellingCount: 1 } }
        );

      //   db.products.updateOne(
      //     { sku: "abc123" },
      //     { $inc: { quantity: -2, "metrics.orders": 1 } }
      //  )

        if (!product || product.length === 0) {
            return res.status(404).json({ message: 'No product found' });
        }

        res.json({ sellingCount: product.sellingCount });
    }) 



   
  //ending selling count 

















    


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
