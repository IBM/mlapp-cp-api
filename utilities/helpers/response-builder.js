// standard 500 error callback
function errorClbk(res) {
    function _realClbk(error) {
        console.log("Server error", error);
        res.status(500);
        res.json(_buildErrorResponse(error));
    }
    return _realClbk;
};

// standard success callback
function successClbk(res) {
    function _realClbk(result) {
        // console.log("Success", result);
        res.status(200);
        res.json(result);
    }
    return _realClbk;
};

// error response callback
function _buildErrorResponse(error){
    var result = {};
    result.status = "error";
    result.error = error;
    return result;
}

module.exports ={
  errorClbk: errorClbk,
  successClbk: successClbk,
}
