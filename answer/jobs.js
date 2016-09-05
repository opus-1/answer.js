const timr = require('timr');
const scheduler = timr()

class Job {
  static setServer (server) {
    Job.server = server;
  }
  constructor (server) {
    this.server = server || Job.server;

    this.server.on("start", this.start)
    this.server.on("stop", this.stop)
  }
  schedule (callback){
    this.job = callback
  }
  stop () {
    console.log(`Clearing timr jobs for ${this.constructor.name}`);
    this.job.clear();
  }

  start () {
    this.job(scheduler())
  }
}

module.exports = Job;
