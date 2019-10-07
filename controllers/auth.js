const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'User does not exist.');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash(
          'error',
          'E-Mail exists already, please pick a different one.'
        );
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          return transporter.sendMail({
            to: email,
            from: 'shop@node-complete.com',
            subject: 'Signup succeeded!',
            html: '<h1>You successfully signed up!</h1>'
          });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset-password', {
    path: '/forgot-password',
    pageTitle: 'Reset Password',
    errorMessage: false
  });
}

exports.getResetToken = (req, res, next) => {
  User.findOne({resetToken : req.params.resetToken, resetTokenExp: {$gt:Date.now()}}).then(result => {
    if(!result){
      console.log('No User Found')
    }
    console.log(result.email);
    res.render('auth/new-password', {
      path: '/reser-password',
      pageTitle: 'Reset Password',
      user: result.email,
      errorMessage: false
    })
  })
}

exports.postReset = (req, res, next) => {
  
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/forgot-password');
    };

    token = buffer.toString('hex');
    //console.log(token)

    User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        //req.flash('error', 'The email does not exist')
        return res.redirect('/forgot-password')
      }
      user.resetToken = token;
      user.resetTokenExp = Date.now() + 3600000;
      return user.save();
    }).then(result => {
      console.log(result)
       transporter.sendMail({
        to: req.body.email,
        from: 'hello1234kk66yyt@jjhhyy5566tt.com',
        subject: 'Reset Password',
        html: `
          <h1>Click the following link in order to reset password <a href="http://localhost:3000/forgot-password/${token}"> Click Here </a></h1>
        `
      })
    }).then(h => {
      res.redirect('/');
    }).catch(err => {
      console.log(err);
    })

  })
}

exports.postResetPassword = (req, res, next) => {
  console.log(req.body)
  let email = req.body.forgotemail;
  let password = req.body.confirmpassword
  console.log(email, password);

  User.findOne({email: email}).then(user => {
    if(!user){
      console.log("fuck off");
    }

     bcrypt.hash(password, 12).then(hashedPass => {
      user.password = hashedPass
      return user.save();
    }).then(chnged => {
      console.log(chnged);
      res.redirect('/');
    })

    //console.log("Done Mffer")
  })
}
