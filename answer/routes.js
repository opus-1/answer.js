_ = require("underscore")
class Routes {
  static setServer (server) {
    Routes.server = server;
    return this;
  }
  static setVersion (version) {
    Routes.version = version;
    return this;
  }

  constructor (server, config = {}) {
    this.server = server || Routes.server;
    this.version = config.version || Routes.version;
    return this;
  }

  get (path, action) {
    this.action("get", path, action);
    return this;
  }

  post (path, action) {
    this.action("post", path, action);
    return this;
  }

  put (path, action) {
    this.action("put", path, action);
    return this;
  }

  delete (path, action) {
    this.action("delete", path, action);
    return this;
  }

  action (method, path, action) {
    let api = this.server[this.version];
    api[method](path, action);
    return this;
  }

  resources (baseRoute, controller, flags = {}) {
    let flagsLocal = ["index", "create", "show", "update", "delete"];

    if(flags.except){
      flagsLocal = _.reject(flagsLocal, (action)=>{
        return _.contains(flags.except, action);
      })
    } else if (flags.only){
      flagsLocal = _.filter(flagsLocal, (action)=>{
        return _.contains(flags.only, action);
      })
    }
    
    if(_.contains(flagsLocal, "index")){
      this.action("get", baseRoute, controller.index);
    }

    if(_.contains(flagsLocal, "create")){
      this.action("post", baseRoute, controller.create);
    }
        
    if(_.contains(flagsLocal, "show")){
      this.action("get", `${baseRoute}/:id`, controller.show)
    }

    if(_.contains(flagsLocal, "update")){
      this.action("put", `${baseRoute}/:id`, controller.update);
    }

    if(_.contains(flagsLocal, "create")){
      this.action("delete", `${baseRoute}/:id`, controller.destroy);
    }

    return this;
  }

}
module.exports = Routes;