const express = require('express');
const { registerPartials } = require('hbs');
const hbs = require('hbs')



const app = express();
app.set('view engine','hbs');
hbs.registerPartials(__dirname + '/views/partials');
app.use(express.static(__dirname + '/public'));

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://huyhoa30122000:huyhoang123@cluster0.czbpx.mongodb.net/test';

app.get('/', (req,res)=>{
    res.render('Home');
})
app.get('/show', async (req,res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let results = await dbo.collection("Product").find({}).toArray();
    res.render('ShowProduct',{model:results});
})

var bodyParSer = require("body-parser");
app.use(bodyParSer.urlencoded({extended: false}));

app.get('/insert', (req,res)=>{
    res.render('NewProduct');
})

app.post('/doInsert', async (req,res)=>{
    let nameInput = req.body.txtName;
    let priceInput = req.body.txtPrice;
    let colorInput = req.body.txtColor;
    let categoryInput = req.body.txtCategory;
    let errorMsg =  {
        name : '',
        price: ''
    }
    if(!nameInput  && nameInput.length <5){
        errorMsg.name = "Length of name >= 5";
    }
    if(!priceInput  || priceInput < 10000){
        errorMsg.price = "The price must be >= 10000";
    }
    if(errorMsg.name.length !=0 || errorMsg.price.length !=0){
        res.render('NewProduct',{error:errorMsg})
    }else{
        let newProduct = {productName : nameInput, price : priceInput, color : colorInput, category : categoryInput};
        let client = await MongoClient.connect(url);
        let dbo = client.db("ProductDB");
    
        await dbo.collection("Product").insertOne(newProduct);

        res.redirect('/show');
    }

    
})

app.get('/insearch', (req,res)=>{
    res.render('SearchProduct');
})
app.post('/doSearch', async (req,res)=>{
    let nameSearch = req.body.txtSearch; //use regex to find approximatelly search
    let client = await MongoClient.connect(url,{useUnifiedTopology: true});
    let dbo = client.db("ProductDB");

    let searchProduct = {productName : new RegExp(nameSearch, 'i')};
    let results = await dbo.collection('Product').find(searchProduct).toArray();
    console.log(results);
    res.render('ShowProduct', {model: results});
})
app.get('/delete', async (req,res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client = await MongoClient.connect(url,{useUnifiedTopology: true});
    let dbo = client.db("ProductDB");

    await dbo.collection("Product").deleteOne(condition);
    res.redirect('/show');

})

app.get('/edit', async (req,res)=>{
    let id = req.query.id;

    let ObjectID = require('mongodb').ObjectID;
    let condition = {'_id' : ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let results = await dbo.collection('Product').findOne(condition);
    res.render('Edit', {model: results});

})
app.post('/doUpdate', async (req,res)=>{
    let id = req.body.id;
    let nameEdit= req.body.txtName;
    let priceEdit = req.body.txtPrice;
    let colorEdit = req.body.txtColor;
    let categoryEdit = req.body.txtCategory;
    let newValues= {$set: {productName: nameEdit, price : priceEdit, color : colorEdit, category : categoryEdit}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    await dbo.collection("Product").updateOne(condition,newValues);

    res.redirect('/show');
})

var PORT = process.env.PORT || 3000
app.listen(PORT)
console.log("Server is running !");