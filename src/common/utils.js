import {getNegativePatternsAsPositive} from "_fast-glob@2.2.7@fast-glob/out/managers/tasks";

// 深冻结
export function deepFreeze(obj) {
    obj = isObject(obj) ? obj : {};

    let toFreeze = [obj];
    for (let i = 0; i < toFreeze.length; i++) {
        Object.freeze(toFreeze[i]);
        Object.keys(toFreeze[i]).map(key => {
            if (isObject(toFreeze[i][key])) toFreeze.push(toFreeze[i][key]);
        });
    }
    return obj;
}

// 简单判断是否对象
export function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
}

//前端生成id
export const generateUID = function (prefix, suffix) {
    const sessionid = getCookie("sesionid");
    let uid;
    if (sessionid) {
        uid = sessionid + Date.now().toString(36)+Math.random().toString(36).substr(2);
    } else {
        uid = Date.now().toString(36); //Create the uids in chronological order
        uid +=Math.random().toString(36).substr(2);
    }
    if (prefix) uid = prefix + uid;
    if (suffix) uid = uid + suffix;
    return uid;
};

const getCookie = name => {
let arr,
    reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
else return null;
};


