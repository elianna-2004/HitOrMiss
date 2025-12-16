const http = require('http');
const fs = require('fs');
const path = require("path");
const bodyParser = require("body-parser"); /* To handle post parameters */
const express = require("express"); /* Accessing express module */
const app = express();
const API_KEY = `deae34afb5012aed073b729674d01afc`;


/* Important */
process.stdin.setEncoding("utf8");

/* MongoDB 
require("dotenv").config({
   path: path.resolve(__dirname, "credentials/.env"),
});
*/

const mongoose = require("mongoose");

/* Including Song and Movie */
const Number = require("./model/Number.js");

/////////////////////////////////////////////////////////////////////////////

if (process.argv.length != 3) {
  process.stdout.write(process.stdout.write("Usage numVerify.js PORT_NUMBER_HERE\n"));
  exit(1);

}

let portNumber = process.argv[2];
console.log(`Image Web server is running at http://localhost:${portNumber}`);


/* Input Prompts */
const prompt = `Stop to shutdown the server: `;
process.stdout.write(prompt)

process.stdin.on("readable", function () {
    const dataInput = process.stdin.read();

    if (dataInput !== null) {
        const command = dataInput.trim();

        if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        }
    }

});


///////////////////////////////////////////////////
/* Defining the view/templating engine to use */
app.set("view engine", "ejs");

/* Directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));

/* Initializes request.body with post information */ 
app.use(bodyParser.urlencoded({extended:false}));
////////////////////////////////////////////////////////////

/* To link style sheet */
const publicPath = path.resolve(__dirname, "serverStaticFiles");
app.use(express.static(publicPath));

/* Router Usage */
const router = express.Router();
const numbers = require("./routes/number");

app.use("/numbers", numbers);

//////////////////////////////////////////////

/* Displays Index Page */
app.get("/", (request, response) => {
    response.render("index");
});


/* Displays Result Page */
app.get("/search", (request, response) => {
    response.render("search");
}); 


/* Processes Search */
app.post("/search", (request, response) => {
    const {phone} = request.body;

    let number = phone;
    let valid = ``;
    let message = ``;


    ////NumVerify API Fetch Code////////////
    fetch(`http://apilayer.net/api/validate?access_key=${API_KEY}&number=${phone}&country_code=US&format=1`)
        .then(res => res.json())
        .then(data => {
            if (data.valid) {
                // Pass as Valid
                valid += `<p style='color: green;'>Valid</p>`;
                message += `<h3><em>Number acquired. Initializing conversation protocol....don't screw this up.</em></h3>`

            } else {
                valid += `<p style='color: red;'>Not Valid</p>`;
                message += `<h3><em>Ouch...The phone number equivalent of NaN.</em></h3>`
                
            }

             const variables = {
                valid: valid,
                message: message,
            };

            response.render("result", variables);

            ////////////////Add to Database///////////////////
            (async () => {
               try {
                  await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
            
                  await Number.create({
                    Number: number,
                    Valid: data.valid,
                 });
                 
                  
                  mongoose.disconnect();
               } catch (err) {
                  console.error(err);
               }
            })();
        })
        .catch(err => console.error(err));
}); 

app.get("/history", (request, response) => {
    (async () => {
       try {
          await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    
          /* Retrieving all songs */
          let num = await Number.find({});

          let answer = "<table style='border-style: solid; text-align: left; border-width: 1px;'><thead><tr><th style='border-style: solid; border-width: 1px;'>Number</th><th style='border-style: solid; border-width: 1px;'>Valid</th></tr></thead>";
          answer += "<tbody style='border-style: solid;'>";

          num.forEach((elem)=>{

            
            answer += `<tr><td style='border-style: solid; border-width: 1px;'>${elem.Number}</td><td style='border-style: solid; border-width: 1px;'>${elem.Valid}</td></tr>`;
          })

          answer += `</tbody></table>`;

          const variables = {
            itemsTable: answer,
          }

          response.render("displayHistory", variables);

          console.log("Numbers\n", num);
          mongoose.disconnect();
       } catch (err) {
          console.error(err);
       }
    })();
});

app.post("/remove", (request, response) => {
    (async () => {
       try {
          await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    
          /* Retrieving all songs */
          await Number.deleteMany({});
        
          response.render("remove");

          mongoose.disconnect();
       } catch (err) {
          console.error(err);
       }
    })(); 
}); 

app.listen(portNumber); 