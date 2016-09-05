const Routes = require("../answer/routes");
const assert = require('assert');


describe('Routes', function() {
  let server = {server: "server"};
  let router = ()=>{
    return new Routes(server, {version: "v1"});
  }

  describe('#setServer() and #setVersion()', function() {
    it('should set server and version', function() {
      const server = {server: "server"};
      Routes.setServer(server);
    
      Routes.setVersion("v1");
      
      assert.equal(Routes.server, server);
      assert.equal(Routes.version, "v1");
    });

    it('should set when passed into constructor', function() {
      let server = {server: "server"};
      let routes = new Routes(server, {version: "v1"});
      
      assert.equal(routes.server, server);
      assert.equal(routes.version, "v1");
    });

    describe('routes', function(){
      it('should trigger action when get is called', function() {  
        let route = router();

        let isOk = false;
        route.action = (verb, action, callback)=>{
          callback(); // Trigger callback;
        }
        route.get("/here", ()=>{
          isOk = true; // Callback is triggered;
        })
        assert.ok(isOk);
      });

      it('should trigger action when get is called', function() {  
        let route = router();
        let callbackIsOk = false;
        let actionIs = '';
        let verbIs = '';
        route.action = (verb, action, callback)=>{
          verbIs = verb;
          actionIs = action;
          callback(); // Trigger callback;
        }
        route.get("/here", ()=>{
          callbackIsOk = true; // Callback is triggered;
        })
        assert.ok(callbackIsOk);
        assert.equal(verbIs, "get");
        assert.equal(actionIs, "/here");
      });

      it('should trigger action when put is called', function() {  
        let route = router();
        let callbackIsOk = false;
        let actionIs = '';
        let verbIs = '';
        route.action = (verb, action, callback)=>{
          verbIs = verb;
          actionIs = action;
          callback(); // Trigger callback;
        }
        route.put("/here", ()=>{
          callbackIsOk = true; // Callback is triggered;
        })
        assert.ok(callbackIsOk);
        assert.equal(verbIs, "put");
        assert.equal(actionIs, "/here");
      });

      it('should trigger action when post is called', function() {  
        let route = router();
        let callbackIsOk = false;
        let actionIs = '';
        let verbIs = '';
        route.action = (verb, action, callback)=>{
          verbIs = verb;
          actionIs = action;
          callback(); // Trigger callback;
        }
        route.post("/here", ()=>{
          callbackIsOk = true; // Callback is triggered;
        })
        assert.ok(callbackIsOk);
        assert.equal(verbIs, "post");
        assert.equal(actionIs, "/here");
      });

      it('should trigger action when delete is called', function() { 
        let route = router(); 
        let callbackIsOk = false;
        let actionIs = '';
        let verbIs = '';
        route.action = (verb, action, callback)=>{
          verbIs = verb;
          actionIs = action;
          callback(); // Trigger callback;
        }
        route.delete("/here", ()=>{
          callbackIsOk = true; // Callback is triggered;
        })
        assert.ok(callbackIsOk);
        assert.equal(verbIs, "delete");
        assert.equal(actionIs, "/here");
      });

      it('should trigger action when resources is called', function() {  
        let route = router();
        let stack = [];

        route.action = (verb, action, callback)=>{
          let option = {
            key: verb + action,
            callback: callback
          };
          stack.push(option);
        }

        let controller = {
          index: function(){},
          create: function(){},
          show: function(){}, 
          update: function(){},
          destroy: function(){}
        }

        route.resources("/here", controller);

        
        assert.equal(stack[0].key, "get/here");
        assert.equal(stack[0].callback, controller.index);

        assert.equal(stack[1].key, "post/here");
        assert.equal(stack[1].callback, controller.create);

        assert.equal(stack[2].key, "get/here/:id");
        assert.equal(stack[2].callback, controller.show);

        assert.equal(stack[3].key, "put/here/:id");
        assert.equal(stack[3].callback, controller.update);

        assert.equal(stack[4].key, "delete/here/:id");
        assert.equal(stack[4].callback, controller.destroy);
      });


      it('should trigger action when resources is called', function() {  
        let route = router();
        let stack = [];

        route.action = (verb, action, callback)=>{
          let option = {
            key: verb + action,
            callback: callback
          };
          stack.push(option);
        }

        let controller = {
          index: function(){},
          create: function(){},
          show: function(){}, 
          update: function(){},
          destroy: function(){}
        }

        route.resources("/here", controller, {except: ["show", "index"]});

        assert.equal(stack[0].key, "post/here");
        assert.equal(stack[0].callback, controller.create);

        assert.equal(stack[1].key, "put/here/:id");
        assert.equal(stack[1].callback, controller.update);

        assert.equal(stack[2].key, "delete/here/:id");
        assert.equal(stack[2].callback, controller.destroy);

        assert.equal(stack.length, 3);
      });

      it('should trigger action when resources is called', function() {  
        let route = router();
        let stack = [];

        route.action = (verb, action, callback)=>{
          let option = {
            key: verb + action,
            callback: callback
          };
          stack.push(option);
        }

        let controller = {
          index: function(){},
          create: function(){},
          show: function(){}, 
          update: function(){},
          destroy: function(){}
        }

        route.resources("/here", controller, {only: ["show", "index"]});

        assert.equal(stack[0].key, "get/here");
        assert.equal(stack[0].callback, controller.index);

        assert.equal(stack[1].key, "get/here/:id");
        assert.equal(stack[1].callback, controller.show);

        assert.equal(stack.length, 2);
      });
    })
  });
});