var global_config = require('../config');
const store = require('./../stores/'+global_config["database"].type+'/target.store');
const response = require('../utilities/helpers/response-builder');

download_path = '/public/download/';

let controller = {
    getByAssetNameAndType: function(req, res){
        let asset_name = req.params.assetName;
        let sub_asset_name = req.params.assetLabel;
        let type_id = req.params.typeId;

        store.getByAssetNameAndType(asset_name, sub_asset_name, type_id)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    }
}

module.exports = controller;