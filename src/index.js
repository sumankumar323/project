const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


<<<<<<< HEAD
mongoose.connect("mongodb+srv://sangamsuman323:XVZrnDNPfS8c21p8@cluster0.bolaw.mongodb.net/project2", {
=======
mongoose.connect("mongodb+srv://Functionup-cohort:VuU3BF85dJfPhnHa@cluster0.vgm0kds.mongodb.net/group54Database", {
>>>>>>> f082b5c95e636e0293636fbe439136d6af52836a
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});