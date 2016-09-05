const server = require("./answer/api_server");
const controller = require("./answer/controller");
const job = require("./answer/jobs");
const model = require("./answer/model");
const routes = require("./answer/routes");


class Answer {
  Server (){
    return server;
  }

  Model (){
    return model;
  }

  Job (){
    return job;
  }

  Controller (){
    return controller;
  }
}

module.exports = Answer;