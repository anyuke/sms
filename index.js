var smsUtil = require('./smsUtil');

function getVerifyCode(req, res) {
    if (!utils.isValidMobileNum(req.query.mobileNum)) {
        return utils.response(res, message.INVALID_MOBILE);
    }
    if (!utils.isContains([1, 2], req.query.verifyType)) {
        return utils.response(res, {code: -1, message: '校验码类型错误'});
    }
    var mobileNum = req.query.mobileNum;
    var verifyType = parseInt(req.query.verifyType);
    var verifyCode = utils.createRandomCode();
    var verifyCodeKey = config.verifyCodePrefix + ['', 'REGISTER_', 'LOGIN_'][verifyType] + mobileNum;
    var sql = 'SELECT tb_member.id,tb_global_variate.value channel FROM tb_global_variate LEFT JOIN tb_member ON tb_member.mobileNum = ? WHERE tb_global_variate.key = ?';
    var params = [mobileNum, 'SMS_SEND_CHANNEL'];
    redisUtil.client().get('VERIFY_CODE_REQUEST_RESTRICTIONS_' + mobileNum, function(err, ret) {
        if (err) {
            logger.error(err);
            return utils.response(res, message.SYSTEM_ERROR);
        }
        if (ret) {
            return utils.response(res, {code: -1, message: '短信发送频繁，请稍后再试'});
        }
        if (verifyType == 1) {
            mysqlUtil.execute(sql, params, function(err, results) {
                if (err) {
                    logger.error(err);
                    return utils.response(res, message.SYSTEM_ERROR);
                }
                if (results && results[0].id > 0) {
                    return utils.response(res, {code: -1, message: '该手机号已被绑定'});
                }
                var channel = results[0].channel || 1;
                redisUtil.client().setex(verifyCodeKey, config.verifyCodeExpireTime, verifyCode);
                redisUtil.client().setex('VERIFY_CODE_REQUEST_RESTRICTIONS_' + mobileNum, 65, verifyCode);
                if (channel == 1) {
                    smsUtil.sendByAlidayu(verifyCode, mobileNum, function(err) {
                        if (err) {
                            logger.error(JSON.stringify(err));
                            return utils.response(res, {code: -1, message: '短信发送频繁，请稍后再试'});
                        }
                        return utils.response(res, {code: 0, message: '验证码已发送到' + mobileNum + '手机上，' + parseInt(config.verifyCodeExpireTime / 60) + '分钟内输入有效'});
                    });
                }
                else if (channel == 2) {
                    smsUtil.sendByYunTongXun(verifyCode, mobileNum, function(err) {
                        if (err) {
                            logger.error(JSON.stringify(err));
                            return utils.response(res, {code: -1, message: '短信发送频繁，请稍后再试'});
                        }
                        return utils.response(res, {code: 0, message: '验证码已发送到' + mobileNum + '手机上，' + parseInt(config.verifyCodeExpireTime / 60) + '分钟内输入有效'});
                    });
                }
                else if (channel == 3) {
                    smsUtil.sendByMxtong(verifyCode, mobileNum, function(err) {
                        if (err) {
                            logger.error(JSON.stringify(err));
                            return utils.response(res, {code: -1, message: '短信发送频繁，请稍后再试'});
                        }
                        return utils.response(res, {code: 0, message: '验证码已发送到' + mobileNum + '手机上，' + parseInt(config.verifyCodeExpireTime / 60) + '分钟内输入有效'});
                    });
                }
            });
        }
        else if (verifyType == 2) {
            mysqlUtil.execute(sql, params, function(err, results) {
                if (err) {
                    logger.error(err);
                    return utils.response(res, message.SYSTEM_ERROR);
                }
                if (results && !results[0].id) {
                    return utils.response(res, {code: -1, message: '该手机号未注册'});
                }
                var channel = results[0].channel || 1;
                redisUtil.client().setex(verifyCodeKey, config.verifyCodeExpireTime, verifyCode);
                redisUtil.client().setex('VERIFY_CODE_REQUEST_RESTRICTIONS_' + mobileNum, 65, verifyCode);
                if (channel == 1) {
                    smsUtil.sendByAlidayu(verifyCode, mobileNum, function(err) {
                        if (err) {
                            logger.error(JSON.stringify(err));
                            return utils.response(res, {code: -1, message: '短信发送频繁，请稍后再试'});
                        }
                        return utils.response(res, {code: 0, message: '验证码已发送到' + mobileNum + '手机上，' + parseInt(config.verifyCodeExpireTime / 60) + '分钟内输入有效'});
                    });
                }
                else if (channel == 2) {
                    smsUtil.sendByYunTongXun(verifyCode, mobileNum, function(err) {
                        if (err) {
                            logger.error(JSON.stringify(err));
                            return utils.response(res, {code: -1, message: '短信发送频繁，请稍后再试'});
                        }
                        return utils.response(res, {code: 0, message: '验证码已发送到' + mobileNum + '手机上，' + parseInt(config.verifyCodeExpireTime / 60) + '分钟内输入有效'});
                    });
                }
                else if (channel == 3) {
                    smsUtil.sendByMxtong(verifyCode, mobileNum, function(err) {
                        if (err) {
                            logger.error(JSON.stringify(err));
                            return utils.response(res, {code: -1, message: '短信发送频繁，请稍后再试'});
                        }
                        return utils.response(res, {code: 0, message: '验证码已发送到' + mobileNum + '手机上，' + parseInt(config.verifyCodeExpireTime / 60) + '分钟内输入有效'});
                    });
                }
            });
        }
    });
}

function checkVerifyCode(req, res) {
    if (!utils.isStrNotEmpty(req.body.verifyType)) {
        return utils.response(res, message.PARAMS_MISSING);
    }
    if (!utils.isValidMobileNum(req.query.mobileNum)) {
        return utils.response(res, message.INVALID_MOBILE);
    }
    if (!utils.isContains([1, 2], req.body.verifyType)) {
        return utils.response(res, {code: -1, message: '校验码类型错误'});
    }
    var mobileNum = req.body.mobileNum;
    var verifyCode = req.body.verifyCode;
    var verifyCodeKey = config.verifyCodePrefix + ['', 'REGISTER_', 'LOGIN_'][req.body.verifyType] + mobileNum;
    redisUtil.client().get(verifyCodeKey, function(err, ret) {
        if (err) {
            logger.error(err);
            return utils.response(res, message.SYSTEM_ERROR);
        }
        if (!ret) {
            return utils.response(res, {code: -1, message: '验证码失效'});
        }
        if (ret != verifyCode) {
            return utils.response(res, {code: -1, message: '验证码错误'});
        }
        redisUtil.client().del(verifyCodeKey);
        return utils.response(res, message.SUCCESS);
    });
}