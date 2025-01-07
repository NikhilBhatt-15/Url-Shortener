function to_base_62(deci) {
    var hash_str, s;
    s = "012345689abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    hash_str = "";

    while (deci > 0) {
        var b = parseInt(deci % 62);
        var a = s[b] ? s[b]: "";
        hash_str = hash_str+a;
        deci = parseInt(deci/62);
    }

    return hash_str;
}

function check_valid_url(longurl){
//     using regex to check if the url is valid or not
    var regex = new RegExp(/^(http|https):\/\/[^ "]+$/);
    return regex.test(longurl);

}

export {check_valid_url};
export default to_base_62;