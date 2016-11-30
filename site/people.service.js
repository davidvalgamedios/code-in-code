"use strict";
/// <reference path="../node_modules/@types/socket.io-client/index.d.ts" />
var io = require('socket.io-client');
var user_1 = require("./user");
var PeopleService = (function () {
    function PeopleService() {
        this.url = '/';
        this.peopleList = [];
    }
    PeopleService.prototype.setOwnStatus = function (status) {
        this.socket.emit('changeStatus', status);
    };
    PeopleService.prototype.getPeopleList = function () {
        return this.peopleList;
    };
    PeopleService.prototype.sendToAll = function (msg) {
        this.socket.emit('msgToAll', msg);
    };
    PeopleService.prototype.register = function (userName) {
        var _this = this;
        this.userName = userName;
        this.socket = io(this.url);
        this.socket.emit('register', this.userName);
        this.socket.on('statusChanged', function (data) {
            var count = _this.peopleList.length;
            for (var i = 0; i < count; i++) {
                if (_this.peopleList[i].getData('uuid') == data.uuid) {
                    _this.peopleList[i].setStatus(data.inCoffee);
                    if (data.inCoffee) {
                        new Notification('Coffee Time', { icon: '/dist/img/coffee.jpg', body: _this.peopleList[i].getData('name') + ' quiere café' });
                    }
                    return;
                }
            }
        });
        this.socket.on('registerOk', function (data) {
            for (var sUuid in data.connectedUsers) {
                var oUser = data.connectedUsers[sUuid];
                _this.peopleList.push(new user_1.User(sUuid, oUser.name, oUser.inCoffee));
            }
        });
        this.socket.on('newUser', function (data) {
            _this.peopleList.push(new user_1.User(data.uuid, data.name, data.inCoffee));
        });
        this.socket.on('userDisconnected', function (data) {
            var count = _this.peopleList.length;
            for (var i = 0; i < count; i++) {
                if (_this.peopleList[i].getData('uuid') == data.uuid) {
                    _this.peopleList.splice(i, 1);
                    return;
                }
            }
        });
        this.socket.on('msgBroadcast', function (data) {
            new Notification(data.userName + ' dice', { icon: '/dist/img/coffee.jpg', body: data.msg });
        });
    };
    return PeopleService;
}());
exports.PeopleService = PeopleService;
