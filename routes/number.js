const express = require('express');
const router = express.Router();

// http://localhost:3000/numbers/
router.get("/", (request, response) => {
    response.send("Welcome to Check Before Text, validating digits since today.");
});

// http://localhost:3000/numbers/info
router.get("/info", (request, response) => {
    response.send("This verifier was created with the help of NumVerify, a free online API that verifies phone numbers!");
});

// http://localhost:3000/numbers/notValid
router.use((request, response) => {
    response.status(404).send("Resource Not Found (in numbers router)");
});
 

 
module.exports = router;