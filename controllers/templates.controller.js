var global_config = require('../config');
const store = require('./../stores/'+global_config["database"].type+'/templates.store');
const response = require('../utilities/helpers/response-builder');
const uuid_generator = require('./../utilities/helpers/uuid-generator')

let controller = {

    getAllTemplates: function(req, res){
        
        store.getAllTemplates({})
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    getTemplateByName: function(req, res){
        
        let name = req.params.name;

        store.getTemplateByName(name)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    createTemplate: function(req, res){
        
        let template = req.body;
        template.id = uuid_generator();
        store.createTemplate(template)
        .then(function(){
            res.send(template);
        })
        .catch(response.errorClbk(res));
        // .then(response.successClbk(res))
        // .catch(response.errorClbk(res));
    },

    updateTemplate: function(req, res){
        
        let template = req.body;
        let name = req.params.name;

        store.updateTemplate(name, template)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    deleteTemplate: function(req, res){
        
        let name = req.params.name;

        store.deleteTemplate(name)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    }
    
};

module.exports = controller;
