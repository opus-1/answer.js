global._ = require('underscore');
var fs = require("fs");
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var DBMigrate = require('db-migrate');
var path = require("path");

const EventEmitter = require('events');

class ApiServer {
  static requireLocal (file) {
    console.log(process.cwd())
    return require(process.cwd() + file);
  }
  constructor(customSettings = {}) {
    this.requireLocal = (path) => {
      ApiServer.requireLocal.bind(this)(path)
    }
    this.CONFIG = customSettings;

    this.express = require('express');
    this.app = this.express(function(req){});
    this.emitter = new EventEmitter();
    let cors = require('cors');
    this.app.use(cors());

    this.client = this.app.get('connection');
    this.database();
    this.controllers();
 
    this.routes = {};

    // current version of the api
    this.api_current = this.express(function(req){});
    this.api_current.use(cors());

    let server = this;

    this.app.use(bodyParser.json({ type: 'application/json' }));

    this.app.use(function(req, res, next){
      res.setHeader('Content-Type', 'application/json');
      req.accepts('application/json');

      if (CONFIG.BYPASS_SECRET) {
        return next();
      } else {
        let unauthorized = (res) => { return res.sendStatus(401); };
        let gotOrg = (org, isPrivate, isVendor)=> {
          if (org) {
            server.currentIdentity = org;
            server.currentIdentity.private = isPrivate;
            server.currentIdentity.vendor = isVendor;

            return next();
          } else {
            return unauthorized(res);
          }
        };

        let id = req.get('authorization-id');
        let key = req.get('authorization-key');

        if(id & key) {
          return server.authenticateKeys({ id, key }).then(gotOrg).catch((err) => { return unauthorized(res); });
        } else {
          res.set('WWW-Authenticate', 'Basic realm=Authorization Required');

          let user = basicAuth(req);

          if (user && user.name && user.pass) {
            if (user.name === CONFIG.SUPER_ADMIN_ID && user.pass === CONFIG.SUPER_ADMIN_PRIVATE) {
              gotOrg({ superAdmin: true }, true, false);
            } else {
              return server.authenticateKeys({ id: user.name, key: user.pass }).then(gotOrg).catch((err) => { return unauthorized(res); });
            }
          } else {
            return unauthorized(res);
          }
        }
      }
    });
  }

  database() {
    let className;
    let server = this;
    this.db = this.requireLocal('/config/db/connection')(this.CONFIG);

    let files = fs.readdirSync('./models');
    files.forEach((file) =>
      (className = file.replace(".js", ""),
      server[className] = this.requireLocal(`/models/${file}`),
      server[className].db = this.db,
      server[className].server = server)
    );

    this.emitter.emit("database.connected")
  }

  controllers() {
    let server = this;
    let files = fs.readdirSync('./api');
    files.forEach((file) => {
      let className = file.replace(".js", "");
      if (className === 'controller') {
        return;
      }
      let thisClass = this.requireLocal(`/api/${file}`);
      return server[className] = new thisClass(this);
    });

    this.emitter.emit("controllers.loaded")
  }

  stop () {
    this.listener.close();
    this.emitter.emit("stop")
    let keys = Object.keys(this.backgroundJobs);
    for (let i = keys.length; i--;) {
      let className = keys[i];
      this.backgroundJobs[className].stop();
      this.emitter.emit(`backgroundJobs.${className}.stopped`)
    }

    this.emitter.emit("stopped")
  }

  start() {
    this.started = new Promise((resolve, reject) => {
      let server = this;
      let files = fs.readdirSync('./jobs');
      let routes = Object.keys(this.routes);

      server.backgroundJobs = {};
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let className = file.replace(".js", "");
        var jobClass = this.requireLocal(`/jobs/${file}`);
        server.backgroundJobs[className] = new jobClass(server);
        server.backgroundJobs[className].start();
      }

      for (let i = routes.length; i--;) {
        let key = routes[i];
        let route = key;
        let apiName = `api_${route}`;
        let route_prefix = `/${route}/`;
        if (route === 'current') {
          route_prefix = '/';
        }
        this.routes[key].init.call(this, apiName);
        this.app.use(route_prefix, this[apiName]);
      }

      this.listener = this.app.listen(CONFIG.PORT || CONFIG.API_SERVER_PORT || 3000, function(req, res){
        let host = this.address().address;
        let { port } = this.address();

        console.log('API listening at http://%s:%s', host, port);
        server.emitter.emit('started')
        resolve();
      });
    });

    return this.started;
  }

  authenticateKeys (loginInfo) {
    let authTable = this.Organization;
    let isVendor = false;
    if (loginInfo.id.indexOf('vendor-') !== -1) {
      authTable = this.Vendor;
      isVendor = true;
    }

    return authTable.authenticate(loginInfo);
  }
}

module.exports = ApiServer;
