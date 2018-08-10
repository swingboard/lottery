
let trim = (text)=>{
    // http://www.w3.org/TR/css3-selectors/#whitespace
    let whitespace = "[\\x20\\t\\r\\n\\f]",
    rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" );
    return text == null ? "" :
			( text + "" ).replace( rtrim, "" );
}

let getJSON = (str) => {
    let ret = {};
    if(!str) return ret;

    let arr = str.split(';');
    
    arr.forEach((item)=>{
        item = trim(item);
        if(!item) return;
        if(item.indexOf('=') == -1){
            ret[item] = "";
        }
        else{
            let p_v = item.split('=');
            ret[p_v[0]] = p_v[1];
        }
    })

    return ret;
}

let getJSONs = (str) => {
    let ret = [];
    if(!str) return ret;

    let arr = str.split('|');
    arr.forEach((item)=>{
        item = trim(item);
        if(!item) return;
        ret.push(getJSON(item));
    })
    return ret;
}

let getProperties = (arr) => {
    let ret = [], k;
    arr.forEach((item)=>{
        
        for(k in item){
            if(ret.indexOf(k) == -1){
                ret.push(k)
            }
        }
    })

    return ret;
}

module.exports = {
    getJSONs: getJSONs,
    getProperties: getProperties
}