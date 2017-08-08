#!/usr/bin/env python2.7
# coding: utf-8
import logging
import tornado.escape
import tornado.ioloop
import tornado.web
import os.path
import uuid
import json

from tornado.concurrent import Future
from tornado import gen
from tornado.options import define, options, parse_command_line

import query_db

define("port", default=8888, help="run on the given port", type=int)
define("debug", default=True, help="run in debug mode")


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html', maps='/day_count')


class DayCountHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('day_count.html')


class HourCountHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('hour_count.html')


class UserListHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('user_list.html')


class NetworkListHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('network_list.html')


class DayQueryHandler(tornado.web.RequestHandler):
    def post(self):
        ad_network_id = self.get_argument("ad_network_id")
        ad_action = self.get_argument("ad_action")
        start_dt = self.get_argument('start_dt')
        end_dt = self.get_argument("end_dt")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = query_db.get_day_count(ad_network_id, ad_action, start_dt, end_dt, off_set, limit)
        self.write(text)


class HourQueryHandler(tornado.web.RequestHandler):
    def post(self):
        dt = self.get_argument("dt")
        ad_network_id = self.get_argument("ad_network_id")
        ad_action = self.get_argument("ad_action")
        start_hour = self.get_argument('start_hour')
        end_hour = self.get_argument("end_hour")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = query_db.get_hour_count(dt, ad_network_id, ad_action, start_hour, end_hour, off_set, limit)
        self.write(text)


class AddUserHandler(tornado.web.RequestHandler):
    def post(self):
        user_account = self.get_argument("user_account")
        user_right = self.get_argument("user_right")
        text = query_db.add_user_account(user_account, user_right)
        self.write(text)


class QueryUserListHandler(tornado.web.RequestHandler):
    def post(self):
        user_account = self.get_argument("user_account")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = query_db.query_user_list(user_account, off_set, limit)
        self.write(text)


class DeleteUserListHandler(tornado.web.RequestHandler):
    def post(self):
        user_id_list = self.get_argument("user_id_list")
        text = query_db.delete_user_list(user_id_list)
        self.write(text)


class EditUserListHandler(tornado.web.RequestHandler):
    def post(self):
        user_id = self.get_argument("user_id")
        user_right = self.get_argument("user_right")
        text = query_db.edit_user(user_id, user_right)
        self.write(text)


class AddNetworkHandler(tornado.web.RequestHandler):
    def post(self):
        network_name = self.get_argument("network_name")
        text = query_db.add_network(network_name)
        self.write(text)


class QueryNetworkListHandler(tornado.web.RequestHandler):
    def post(self):
        network_name = self.get_argument("network_name")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = query_db.query_network_list(network_name, off_set, limit)
        self.write(text)


class DeleteNetworkListHandler(tornado.web.RequestHandler):
    def post(self):
        user_id_list = self.get_argument("network_id_list")
        text = query_db.delete_network_list(user_id_list)
        self.write(text)


def __main__():
    parse_command_line()
    app = tornado.web.Application(
        [
            (r'/', MainHandler),
            (r'/day_count', DayCountHandler),
            (r'/hour_count', HourCountHandler),
            (r'/user_list', UserListHandler),
            (r'/network_list', NetworkListHandler),
            (r'/query_day_page', DayQueryHandler),
            (r'/query_hour_page', HourQueryHandler),
            (r'/add_user', AddUserHandler),
            (r'/query_user_list', QueryUserListHandler),
            (r'/delete_user_list', DeleteUserListHandler),
            (r'/edit_user', EditUserListHandler),
            (r'/add_network', AddNetworkHandler),
            (r'/query_network_list', QueryNetworkListHandler),
            (r'/delete_network_list', DeleteNetworkListHandler),
        ],
        cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
        template_path=os.path.join(os.path.dirname(__file__), "templates"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        xsrf_cookies=False,
        debug=options.debug
    )
    app.listen(options.port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == '__main__':
    __main__()


