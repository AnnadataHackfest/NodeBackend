const express = require('express');
const router = express.Router();
const axios = require("axios");

require('dotenv').config();

// API keys
const openWeatherApiKey = process.env.OPEN_WEATHER_API_KEY;
const openWeatherApiUrl = process.env.OPEN_WEATHER_API_URL;

// Sample Request Url: localhost:5000/api/weatherForecast/coordinates?lat=28.68&lon=77.22
router.get('/coordinates', (req, res) => {
  const { lat, lon } = req.query;
  console.log("latitude ", lat);
  console.log("longitude ", lon);
  axios({
    method: 'GET',
    url: `${openWeatherApiUrl}?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`,
  })
    .then(response => {
      console.log(response.data); 
      res.json(response.data);
    })
    .catch(error => {
      console.log('Error occured in Open Weather Api ', error);
    });  
});

// Sample Request Url: localhost:5000/api/weatherForecast/pincode?pinCode=122001
router.get('/pincode', (req, res) => {
  const { pinCode } = req.query;
  const countryCode = req.query.countryCode || "in";
  axios({
    method: 'GET',
    url: `${openWeatherApiUrl}?zip=${pinCode},${countryCode}&appid=${openWeatherApiKey}`,
  })
    .then(response => {
      console.log(response.data);
      res.json(response.data);
    })
    .catch(error => {
      console.log('Error occured in Open Weather Api ', error);
    });  
});

module.exports = router;