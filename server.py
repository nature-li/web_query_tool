#!/usr/bin/env python2.7
# coding: utf-8
import os.path
import sys
import json
import logging

import tornado.escape
import tornado.ioloop
import tornado.web
import tornado.log
from tornado.options import define, options, parse_command_line

from config import config
from py_log.logger import Logger, LogEnv
from py_db.db_operate import DbOperator


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        self.render('index.html', maps='/day_count')


class DayCountHandler(tornado.web.RequestHandler):
    def get(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        self.render('hive/day_count.html')


class HourCountHandler(tornado.web.RequestHandler):
    def get(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        self.render('hive/hour_count.html')


class NetworkListHandler(tornado.web.RequestHandler):
    def get(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        self.render('hive/network_list.html')


class UserListHandler(tornado.web.RequestHandler):
    def get(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        self.render('system/user_list.html')


class DayQueryHandler(tornado.web.RequestHandler):
    def post(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        ad_network_id = self.get_argument("ad_network_id")
        ad_action = self.get_argument("ad_action")
        start_dt = self.get_argument('start_dt')
        end_dt = self.get_argument("end_dt")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = DbOperator.get_day_count(ad_network_id, ad_action, start_dt, end_dt, off_set, limit)
        self.write(text)


class HourQueryHandler(tornado.web.RequestHandler):
    def post(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        dt = self.get_argument("dt")
        ad_network_id = self.get_argument("ad_network_id")
        ad_action = self.get_argument("ad_action")
        start_hour = self.get_argument('start_hour')
        end_hour = self.get_argument("end_hour")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = DbOperator.get_hour_count(dt, ad_network_id, ad_action, start_hour, end_hour, off_set, limit)
        self.write(text)


class AddUserHandler(tornado.web.RequestHandler):
    def post(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        user_account = self.get_argument("user_account")
        user_right = self.get_argument("user_right")
        text = DbOperator.add_user_account(user_account, user_right)
        self.write(text)


class QueryUserListHandler(tornado.web.RequestHandler):
    def post(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        user_account = self.get_argument("user_account")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = DbOperator.query_user_list(user_account, off_set, limit)
        self.write(text)


class DeleteUserListHandler(tornado.web.RequestHandler):
    def post(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        user_id_list = self.get_argument("user_id_list")
        text = DbOperator.delete_user_list(user_id_list)
        self.write(text)


class EditUserListHandler(tornado.web.RequestHandler):
    def post(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        user_id = self.get_argument("user_id")
        user_right = self.get_argument("user_right")
        text = DbOperator.edit_user(user_id, user_right)
        self.write(text)


class AddNetworkHandler(tornado.web.RequestHandler):
    def post(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        network_name = self.get_argument("network_name")
        text = DbOperator.add_network(network_name)
        self.write(text)


class QueryNetworkListHandler(tornado.web.RequestHandler):
    def post(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        network_name = self.get_argument("network_name")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = DbOperator.query_network_list(network_name, off_set, limit)
        self.write(text)


class DeleteNetworkListHandler(tornado.web.RequestHandler):
    def post(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        user_id_list = self.get_argument("network_id_list")
        text = DbOperator.delete_network_list(user_id_list)
        self.write(text)


class LogFormatter(tornado.log.LogFormatter):
    def __init__(self):
        super(LogFormatter, self).__init__(
            fmt='%(color)s[%(asctime)s %(filename)s:%(funcName)s:%(lineno)d %(levelname)s]%(end_color)s %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )


def __main__():
    # 设置编码
    reload(sys)
    sys.setdefaultencoding('utf-8')

    # 解析参数
    options.parse_command_line()

    # 不要输出日志到屏幕
    logging.getLogger("tornado.access").propagate = False
    logging.getLogger("tornado.application").propagate = False
    logging.getLogger("tornado.general").propagate = False
    logging.getLogger("process").propagate = False
    logging.getLogger("report").propagate = False
    logging.getLogger("third").propagate = False

    # 初始化日志
    Logger.init(config.server_log_env, config.server_log_target, config.server_log_name, config.server_log_size,
                config.server_log_count)

    # 重定向tornado自带日志
    logging.getLogger("tornado.access").addHandler(Logger.get_third_handler())
    logging.getLogger("tornado.application").addHandler(Logger.get_third_handler())
    logging.getLogger("tornado.general").addHandler(Logger.get_third_handler())

    Logger.info("server is starting...")
    Logger.info("config.server_listen_port: %s" % config.server_listen_port)

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
        debug=config.server_debug_mode
    )
    app.listen(config.server_listen_port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == '__main__':
    __main__()
