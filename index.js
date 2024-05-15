const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const { MongoClient, ServerApiVersion,ObjectId} = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware

const logger = (req, res, next) =>{
  console.log('log: info', req.method, req.url);
  next();
}
const verifyToken = (req, res, next) =>{
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  // no token available 
  if(!token){
      return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
      if(err){
          return res.status(401).send({message: 'unauthorized access'})
      }
      req.user = decoded;
      next();
  })
}


app.use(express.json());
app.use(cookieParser());

// middlewares 
// middleware
app.use(cors({
  origin: [
            
            'http://localhost:5173', 
            'https://rmcd-49ebe.web.app',
            'https://rmcd-49ebe.firebaseapp.com'
            
  
  
],
  credentials: true
}));



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
    // await client.connect();
    // Send a ping to confirm a successful connection
   

    // auth related api
    app.post('/jwt', logger, async (req, res) => {
      const user = req.body;
      console.log('user for token', user);
      const token =jwt.sign(user, process.env.ACCESS_TOKEN_SECRET ,{expiresIn:'1h'})
      // const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

      res
      .cookie('token',token,{
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
      .send({success:true})
      
      })

      app.post('/logout', async (req, res) => {
        const user = req.body;
        console.log('logging out', user);
        res.clearCookie('token', { maxAge: 0 })
        // res.clearCookie("token", { ...cookieOptions, maxAge: 0 })
        .send({ success: true })
    })




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

    app.get('/foodOrderPurchase',logger,verifyToken, async (req, res) => {
      console.log(req.query.buy_email);
    // console.log('ttttt token', req.cookies.token)
    console.log("user is valid",req.user)
    if(req.user.email !== req.query.email){
      return res.status(403).send({message: 'forbidden access'})
    }
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
    app.post('/foodOrder', logger, async (req, res) => {
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
    app.post("/galleryADD", async (req, res) => {
      console.log(req.body);
      const result = await galleryCollection.insertOne(req.body);
      console.log(result);
       res.send(result)
    })

    app.get('/category', async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })

   

  //selling count purpose


  // app.get('/product/:id/selling-count', async (req, res) => {
  //        const productId = req.params.id;

  //        console.log("test--",productId);
  //       // Find the products, limit the results to 6, and sort by sellingCount in descending order
        
  //       const product = await foodOrderCollection.updateOne(
  //         { Food_Name_id: productId },
  //         { $inc: { sellingCount: 1 } }
  //       );

  //     //   db.products.updateOne(
  //     //     { sku: "abc123" },
  //     //     { $inc: { quantity: -2, "metrics.orders": 1 } }
  //     //  )

  //       if (!product || product.length === 0) {
  //           return res.status(404).json({ message: 'No product found' });
  //       }

  //       res.json({ sellingCount: product.sellingCount });
  //   }) 


  //   app.get('/top-selling', async (req, res) => {
  //     try {
  //         const topSelling = await foodsCollection.find().sort({ product: -1 }).limit(6);
  //         res.json(topSelling);
  //     } catch (err) {
  //         res.status(500).json({ message: err.message });
  //     }
  // });
   




  app.get('/top-selling-food-items', async (req, res) => {
    try {
       
        const topSex = [
            { $group: { _id: "$Food_Name_id", sellingCount: { $sum: 1 } } },
            { $sort: { sellingCount: -1 } },
            { $limit: 6 }
        ];

        const topSellingFoodItems = await foodOrderCollection.aggregate(topSex).toArray();
        res.json(topSellingFoodItems);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});






  //ending selling count 



  













    


    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('RMC is running')
})

app.listen(port, () => {
    console.log(`resturentDB RMC Server is running on port ${port}`)
})
