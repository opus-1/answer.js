class Controller {
  constructor (context, model) {
    this.model = model;
    this.context = context;

    if (!this.model) {
      let modelName = this.singular(this.constructor.name.replace(/Controller$/, ''));
      this.model = context[modelName];
    }

    let functions = ['create', 'index', 'update', 'delete', 'error', 'get'];
    for (let i = functions.length; i--;) {
      this[functions[i]] = this[functions[i]].bind(this);
    }
  }

  // TODO: Default permissions ... public vs. private access sort of stuff
  create (req, res) {
    let params = _.extend(req.body, req.params);
    return this.model.create(params).then((data) => { return res.json(data); }).catch(this.error);
  }

  get (req, res) {
    let params = _.extend(req.body, req.params);
    return this.model.find(params.id).then((data) => { return res.json(data); }).catch(this.error);
  }

  index (req, res) {
    let params = _.extend(req.body, req.params);
    return this.model.all(params).then((data) => { return res.json(data); }).catch(this.error);
  }

  update (req, res) {
    let params = _.extend(req.body, req.params);
    return this.model.update(params).then((data) => { return res.json(data); }).catch(this.error);
  }

  delete (req, res) {
    return this.model.destroy(req.body.id).then((data) => { return res.json(data); }).catch(this.error);
  }

  error (error, code = 404) {
    console.log(error);
    return res.sendStatus(code);
  }

  singular (string) {
    return string.replace(/s$/, '');
  }
}

module.exports = Controller;
