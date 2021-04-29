const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const auth = require("../../middleware/auth");
const { randomString } = require('../../utils/utility');
const User = require('../../models/User');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

var OTP_List = [];

// Remove expired OTP from OPT_List
const removeExpiredOTP = () => {
  let temp = OTP_List.filter((item) => {
    const current = new Date();
    // Remove OTP expired 10 minutes ago
    return ((current.getTime() - item.generatedTime)  < 1000*60*10)
  });
  OTP_List = temp;
};

// Remove used OTP from OPT_List
const removeUsedOTP = (OTP) => {
  let temp = OTP_List.filter((item) => item.OTP !== OTP.OTP);
  OTP_List = temp;
};

// find OTP in OTP_List
const findOTP = (givenOTP) => {
  let obj = OTP_List.find((o, i) => {
    if (o.OTP === givenOTP.OTP) {
      return true; // stop searching
    }
  });
  if (obj === null || obj === undefined) {
    return false;
  }
  else {
    return true;
  }
}

// Get OTP via SMS
router.post('/sms', (req, res) => {
  const { phone } = req.body;
  const rstring = randomString(10);
  const d = new Date();
  var otp = {
    OTP: rstring,
    generatedTime: d.getTime()
  };
  OTP_List.push(otp);
  client.messages
  .create({
     body: `Welcome to Annadata. Your OTP is ${otp.OTP}`,
     from: '+14246257905',
     to: phone
   })
  .then(message => {
    console.log(message.sid);
    res.json({msg: 'Successfully sent OTP'});
  })
  .catch(error => {
    console.log('Error occured in Twilio Api ', error);
    removeUsedOTP(otp);
    res.status(400).json({ msg: 'An error occured' });
  });
});

// Get OTP via email
router.post('/email', (req, res) => {
  const email = req.body.email;
  console.log("email ", email)
  const rstring = randomString(10);
  const d = new Date();
  var otp = {
    OTP: rstring,
    generatedTime: d.getTime()
  };
  OTP_List.push(otp);

  const sendor_email = process.env.GMAIL_ID;
  const sendor_password = process.env.GMAIL_PASSWORD;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: sendor_email,
      pass: sendor_password,
    },
  });
  const emailmessage = `Welcome to Annadata.Your OTP is ${otp.OTP}`;
  const mailOptions = {
    from: sendor_email,
    to: email,
    subject: 'Annadata OTP Verification',
    text: emailmessage,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occured in sending email ", error);
      res.status(400).json({ msg: 'An error occured' });
    }
    else {
      console.log('Email sent ', info);
      res.json({msg: 'Successfully sent OTP'});
    }
  });
});

// verify OTP
router.post('/verify', auth, (req, res) => {
  const { OTP } = req.body;
  // Simple validation
  if(!OTP) {
    return res.status(400).json({ msg: 'Please enter valid OTP' });
  }
  if (findOTP(OTP)) {
    User.findById(req.user.id, (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          msg: 'User not found',
        });
      }
      const savedUser = user;
      savedUser.verified = true;
      savedUser.save((error, updatedUser) => {
        if (error) {
          console.log('Error in updating user verify status', error);
          return res.status(400).json({
            msg: 'User update failed',
          });
        }
        removeUsedOTP(OTP);
        return res.json({ msg: 'Successfully verified OTP'});
      });
    });
  }
  else {
    return res.status(400).json({ msg: 'Invalid OTP' });
  }
});

module.exports = router;