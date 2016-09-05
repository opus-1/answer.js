const Model = require("../answer/model");
const assert = require('assert');


describe('Model', function() {
  let fieldNames = [
    "id", 
    "app_id", 
    "name", 
    "description", 
    "hours", 
    "templates", 
    "created_at", 
    "updated_at"
  ]
  it("should have valid field names when they are given", function(){
    let model = new Model("users", fieldNames);
    assert.equal(model.tableFieldNames.toString(), fieldNames.toString());
    assert.equal(model.tableFieldNames.toString(), fieldNames.toString());
  })

  it("should have the correct table name when given", function(){
    let model = new Model("users", fieldNames);

    assert.equal(model.tableName, "users");
  })

  it("should have the correct table name when given", function(){
    let model = new Model("users", fieldNames);

    assert.equal(model.tableName, "users");
  })
});



// this.tableName = tableName;
// this.tableFields = {};
// this.tableFieldNames = [];

// if (tableKeys) {
//   for (let i = 0, il = tableKeys.length; i < il; i++) {
//     let key = tableKeys[i];
//     let field = key;
//     if (typeof field === 'string') {
//       field = { field: key, required: false };
//     }

//     this.tableFields[field] = field;
//     this.tableFieldNames.push(field.field);
//   }
// }