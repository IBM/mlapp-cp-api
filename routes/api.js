var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var usersRouter = require('./users.route');
var jobsRouter = require('./jobs.route');
var modelsRouter = require('./models.route');
var queueRouter = require('./queue.route');
var templatesRouter = require('./templates.route');
var filesRouter = require('./files.route');
var targetRouter = require('./target.route');
var accuracyMonitoringRouter = require('./accuracyMonitoring.route');
var sessionRouter = require('./session.route');
var schedulerRouter = require('./scheduler.route');
var environmentsRouter = require('./environments.route');
var permissionsRouter = require('./permissions.route');

var global_config = require('./../config');

// authenticate all api requests using JWT token
router.use(function(req, res, next) {
    var minute = 60000;
    req.session.cookie.expires = new Date(Date.now() + 5*minute);
    
    res.setHeader("Cache-Control", "no-cache"); // HTTP 1.1.
    res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
    res.setHeader("Expires", "0"); // Proxies.

    res.set({
        "Content-Security-Policy": "default-src *",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        //"X-Frame-Options": "", // OBSOLETE !
        "X-XSS-Protection": "1; mode=block"
    })

    if (global_config['login_required']){
        // w3 active directory login
        if (global_config['login_type'] == 'w3'){
            if(req.session.logged_in){
                next();
            }
            else{
                res.sendStatus(401); return;
            }
        }
        // basic login
        else{
            if (req.headers.authorization) {
                jwt.verify(req.headers.authorization, process.env.APP_PKEY, function(err, decoded) {
                    if (err) { res.sendStatus(401); return; }
                    else { next() }
                });
            }
            else {
                res.sendStatus(401); return;
            }
        }
    }
    // no login required
    else {
        next()
    }
})

router.use('/users', usersRouter);
router.use('/jobs', jobsRouter);
router.use('/models', modelsRouter);
router.use('/queue', queueRouter);
router.use('/templates', templatesRouter);
router.use('/files', filesRouter);
router.use('/target', targetRouter);
router.use('/accuracyMonitoring', accuracyMonitoringRouter);
router.use('/session', sessionRouter);
router.use('/scheduler', schedulerRouter);
router.use('/environments', environmentsRouter);
router.use('/permissions', permissionsRouter);

module.exports = router;
