var global_config = require('../config');
var bcrypt = require('bcrypt');
var express = require('express');
var passport = require('passport');
var router = express.Router();
var jwt = require('jsonwebtoken');
const user_store = require('../stores/'+global_config["database"].type+'/users.store');

var global_config = require('../config');

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

const { Issuer } = require('openid-client');

if (global_config["openid_config"].issuer_id){
    Issuer.discover(global_config["openid_config"].issuer_id) // => Promise
        .then(function (ibmIssuer) {
                console.log('Discovered issuer %s %O', ibmIssuer.issuer, ibmIssuer.metadata);

                client = new ibmIssuer.Client({
                        client_id: global_config["openid_config"].client_id,
                        client_secret: global_config["openid_config"].client_secret, 
                        redirect_uris: [global_config["openid_config"].callback_url]
                });

                client.CLOCK_TOLERANCE = 30;

                const { Strategy } = require('openid-client');
                const params = {
                        // ... any authorization request parameters go here
                        // client_id defaults to client.client_id
                        // redirect_uri defaults to client.redirect_uris[0]
                        // response type defaults to client.response_types[0], then 'code'
                        // scope defaults to 'openid'
                }

                const passReqToCallback = false; // optional, defaults to false, when true req is passed as a first
                // argument to verify fn

                const usePKCE = false; // optional, defaults to false, when true the code_challenge_method will be
                // resolved from the issuer configuration, instead of true you may provide
                // any of the supported values directly, i.e. "S256" (recommended) or "plain"

                passport.use('oidc', new Strategy({ client, params }, (tokenset, userinfo, done) => {
                    var profile = {};
                    profile.id = userinfo.sub;
                    profile.displayName = userinfo.preferred_username;
                    profile._json = userinfo;
                    profile.access_token = tokenset.access_token;
                    profile.id_token = tokenset.id_token;
                    return done(null, profile);
                }));

        });
}

// JWT generator using secret key
function generateJWT(payload, secret) {

    var signed = jwt.sign(payload, secret, { expiresIn: '7d' });

    return signed;
}

router.get('/logout', function(req, res, next) {
    if (global_config['login_type'] == 'w3'){
        req.session.logged_in = false;
        req.session.destroy();
        res.redirect(global_config["vue_app"]+'?status=4'); 
    }
    else{
        res.redirect(global_config["vue_app"]); 
    }
});

router.post('/login', function(req, res, next) {
    var user = req.body.user;
    var password = req.body.password;
    var _res = res;
    user_store.getUserByUser(user)
      .then(function(res) {
        if (res.length==0) {
            // user not found
            _res.status(410).json({error: "User does not exist"})
            return;
        }
        else {
            foundUser = res[0];
            if (foundUser.status != 1) {
                _res.status(410).json({error: "User account is not active"})
            }
            var passwordCheck = bcrypt.compareSync(password, foundUser.password);
            if (passwordCheck) {
                var payload = {id: foundUser.iui, email: foundUser.email};
                var token = generateJWT(payload, process.env.APP_PKEY)
                req.session.logged_in = true;
                req.session.user = res[0];
                _res.send({token: token});
            }
            else {
                // password invalid
                _res.status(410).json({error: "Incorrect password"})
            }
        }
      }).catch(function(err){
        _res.status(500).json({error: "Server error"})
    })
});

router.get('/sso', passport.authenticate('oidc', { state: Math.random().toString(36).substr(2, 10) }));

// handle callback, if authentication succeeds redirect to
// original requested url, otherwise go to /failure
router.get('/sso/callback', function(req, res, next) {      
      passport.authenticate('oidc', {
          successRedirect: '/backend/auth/ssologin/',
          failureRedirect: '/backend/auth/failure',
      })(req,res,next);
 });
 // failure page
 router.get('/failure', function(req, res) {
  res.send('login failed');
});

function ensureAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
            req.session.originalUrl = req.originalUrl;
            res.redirect('/w3-login');
    } else {
            return next();
    }
}

router.get('/ssologin', ensureAuthenticated, function(req, res) {    
  if (global_config["login_type"] != "w3") return;
  
  var _res = res;
  if (req.user) {
      claims = req.user['_json'];
      
      user_store.getUserById(claims.uniqueSecurityName)
      .then(function(res){
        if (res.length == 0) {
            // User not found in DB. Create user with pending status and send email to admin
            var userObj = {
                'iui': claims.uniqueSecurityName,
                'status': -1
            };
            user_store.createUser(userObj).then(function(user) {
                _res.redirect(global_config["vue_app"]+'?request_status=2'); 
            }).catch(function(err) {
                _res.redirect(global_config["vue_app"]+'?request_status=3');
            });
        }
        else{
            if (res[0].status == -1){
                _res.redirect(global_config["vue_app"]+'?request_status=2'); 
            }
            else if (res[0].status == 1){
                req.session.logged_in = true;
                req.session.user = res[0];
                _res.redirect(global_config["vue_app"]+'?request_status=1'); 
            }
            else{
                _res.redirect(global_config["vue_app"]+'?request_status=3');
            }
        }
      }).catch(function(err){
      })
  } else {
//      var err = messages.getError('authenticated');
        _res.redirect('/sso');
//      logger.error(err);
  }
})

module.exports = router;