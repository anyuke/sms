/**
 * Created by Administrator on 2017/5/10.
 */
var request = require('request');
var cryptoJs = require('crypto-js');
var topClient = require('ali-sdk').topClient;
var client = new topClient({appkey: '', appsecret: '', REST_URL: 'http://gw.api.taobao.com/router/rest'});
config.third.serverName = '七星淮安棋牌';
module.exports = {
    sendByAlidayu: function(verifyCode, mobileNum, callback) {
        client.execute('alibaba.aliqin.fc.sms.num.send', {sms_type: 'normal', rec_num: mobileNum, sms_template_code: '', sms_free_sign_name: '身份验证', sms_param: {code: verifyCode, product: config.third.serverName}}, function(err) {
            if (err) {
                logger.error(err);
                if (callback) callback(err);
                return;
            }
            if (callback) callback(null);
        });
    },

    sendByYunTongXun: function(verifyCode, mobileNum, callback) {
        var body = {
            to: mobileNum,
            appId: '',
            templateId: '',
            datas: [verifyCode]
        };
        var options = {
            url: 'https://app.cloopen.com:8883/2013-12-26/Accounts/8a216da85e0e48b2015e37a9547d1079/SMS/TemplateSMS?sig=' + cryptoJs.MD5('8a216da85e0e48b2015e37a9547d107918566f8fd4ab46488103fce72bdde0ba' + utils.dateFormat(new Date(), 'yyyyMMddhhmmss')).toString().toUpperCase(),
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
                'Content-Length': JSON.stringify(body).length,
                'Authorization': new Buffer('8a216da85e0e48b2015e37a9547d1079:' + utils.dateFormat(new Date(), 'yyyyMMddhhmmss')).toString('base64')
            },
            body: JSON.stringify(body)
        };
        request(options, function(err, rsp, body) {
            if (err) {
                logger.error(err);
                if (callback) callback(err);
            }
            body = JSON.parse(body);
            if (body.statusCode == 0) {
                if (callback) callback(null);
            }
            else {
                if (callback) callback(body.statusMsg);
            }
        });
    },

    sendByMxtong: function(verifyCode, mobileNum, callback) {
        var url = 'http://www.mxtong.net.cn/GateWay/Services.asmx/DirectSend?UserID=999839&Account=admin&Password=999839&Phones=' + mobileNum + '&Content=验证码：' + verifyCode + '，10分钟内输入有效，验证码等同于密码，请妥善保管！【' + config.third.serverName + '】&SendTime=&SendType=1&PostFixNumber=';
        request.get(encodeURI(url), callback);
    },

    sendByMxtong2: function(content, mobileNum, callback) {
        var url = 'http://www.mxtong.net.cn/GateWay/Services.asmx/DirectSend?UserID=999905&Account=admin&Password=EWSCFX&Phones=' + mobileNum + '&Content=' + content + '【' + config.third.serverName + '】&SendTime=&SendType=1&PostFixNumber=';
        request.get(encodeURI(url), callback);
    },

    sendMult: function(content, mobiles, callback) {
        if (!content || mobiles.list == 0) {
            if (callback) callback('缺少参数', null);
            return;
        }
        for (var i = 0; i < mobiles.length; i++) {
            if (!utils.isValidMobileNum(mobiles[i])) {
                if (callback) callback('手机号' + mobiles[i] + '格式不正确', null);
                return;
            }
        }
        mobiles = utils.arrayDistinct(mobiles);
        var work = function(list, count, s, f, callback) {
            if (count == list.length) {
                if (callback) {
                    callback(null, {success: s, fail: f});
                }
                return;
            }
            var url = 'http://www.mxtong.net.cn/GateWay/Services.asmx/DirectSend?UserID=999905&Account=admin&Password=EWSCFX&Phones=' + list[count] + '&Content=' + content + '【' + config.third.serverName + '】&SendTime=&SendType=1&PostFixNumber=';
            request.get(encodeURI(url), function(err, rsp, body) {
                if (err) {
                    logger.error(err);
                    f++;
                }
                else {
                    logger.info('短信发送成功', list[count]);
                    s++;
                }
                count++;
                work(list, count, s, f, callback);
            });
        };
        work(mobiles, 0, 0, 0, callback);
    }
};