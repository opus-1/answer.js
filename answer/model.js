var changeCase = require('change-case');
var uuid = require('node-uuid');
var escape = require("pg-escape");

class Model {
  constructor(tableName, tableKeys){
    this.tableName = tableName;
    this.tableFields = {};
    this.tableFieldNames = [];

    if (tableKeys) {
      for (let i = 0, il = tableKeys.length; i < il; i++) {
        let key = tableKeys[i];
        let field = key;
        if (typeof field === 'string') {
          field = { field: key, required: false };
        }

        this.tableFields[field] = field;
        this.tableFieldNames.push(field.field);
      }
    }
  }

  extraQueryParams (originalQuery, params) {
    let query = [];
    if (params.limit) {
      query.push(`LIMIT ${params.limit}`);
    }

    if (params.start) {
      query.push(`OFFSET ${params.start}`);
    }

    if (params.sortBy) {
      let dir = 'ASC';
      if (params.dir) {
        dir = params.dir;
      }
      query.push(`ORDER BY ${params.sortBy} ${dir}`);
    }

    return `${originalQuery} ${query}`;
  }

  index (params) {
    return this.all(params);
  }

  all(params) {
    return this.db.any(this.extraQueryParams(`select * from ${this.tableName}`, params));
  }

  find(id){
    return this.db.oneOrNone(`select * from ${this.tableName} where id=$1`, id);
  }

  findBy(params){
    let keys = Object.keys(params);
    keys.filter((key) => { return this.tableFieldNames.indexOf(key) !== -1; });
    let queryParams = keys.map((key) => { return `${changeCase.snakeCase(key)}=\${${key}}`; }).join(" AND ");

    return this.db.oneOrNone(`SELECT * FROM ${this.tableName} WHERE ${queryParams} LIMIT 1`, params);
  }

  whereLtreeWithDescendents (lookup, params) {
    return this.db.any(this.extraQueryParams(`SELECT * FROM ${this.tableName} WHERE path <@ '${lookup}'`, params));
  }

  where(params){
    let keys = Object.keys(params);
    keys.filter((key) => { return tableFieldNames.indexOf(key) !== -1; });
    let queryParams = keys.map((key) => { return `${changeCase.snakeCase(key)}=\${${key}}`; }).join(" AND ");

    return this.db.any(this.extraQueryParams(`SELECT * FROM ${this.tableName} WHERE ${queryParams}`, params), params);
  }

  create(params){
    if (params.id == null) { params.id = uuid.v4(); }
    if (params.created_at == null) { params.created_at = new Date(); }
    if (params.updated_at == null) { params.updated_at = new Date(); }

    let dbParams = {};

    // make sure field requirements are met.
    for (let i = 0, il = this.tableFieldNames.length; i < il; i++) {
      let fieldName = this.tableFieldNames[i];
      let field = this.tableFields[fieldName];
      if (field.immutable) {
        continue;
      }

      if (!params[fieldName] && field.default !== null && field.default !== undefined) {
        dbParams[fieldName] = field.default;
        continue;
      }

      if (field.required && (! params.hasOwnProperty(fieldName) || String(params[fieldName] === ''))) {
        throw new Error(`Required field ${fieldName} is missing!`);
      }

      if (field.regex && (field.required || String(params[fieldName]) !== '') && ! RegExp(field.regex).test(params[fieldName])) {
        throw new Error(`Field ${fieldName} does not match ${field.regex}`);
      }

      dbParams[fieldName] = params[fieldName];
    }

    let keys = Object.keys(dbParams);
    let queryKeys = keys.map((key) => { return changeCase.snakeCase(key); }).join(', ');
    let queryValues = keys.map((key) => { return `\${${key}}`; }).join(", ");

    return this.db.oneOrNone(`INSERT INTO ${this.tableName} (${queryKeys}) VALUES (${queryValues}) RETURNING *`, dbParams);
  }


  update(params){
    let dbParams = {};
    let id = params.id;

    // make sure field requirements are met.
    for (let i = 0, il = this.tableFieldNames.length; i < il; i++) {
      let fieldName = this.tableFieldNames[i];
      let field = this.tableFields[fieldName];
      if (field.immutable) {
        continue;
      }

      if (field.regex && (field.required || String(params[fieldName]) !== '') && ! RegExp(field.regex).test(params[fieldName])) {
        throw new Error(`Field ${fieldName} does not match ${field.regex}`);
      }

      dbParams[fieldName] = params[fieldName];
    }

    let keys = Object.keys(dbParams);
    let queryParams = keys.map((key) => { return `${changeCase.snakeCase(key)}=\${${key}}`; }).join(', ');

    params.updated_at = new Date();

    params.id = id;
    return this.db.oneOrNone(`UPDATE ${this.tableName} SET ${queryParams} WHERE id=\${id} RETURNING *`, dbParams);
  }

  destroy(id){
    if (typeof id === "string") {
      return this.db.oneOrNone(`DELETE FROM ${this.tableName} WHERE id=$1`, id);
    } else {
      let ids = id.map((a) => { return `'${escape(a)}'`; }).join(',');

      return this.db.oneOrNone(`DELETE FROM ${this.tableName} WHERE id IN(${ids})`);
    }
  }
}

module.exports = Model;
