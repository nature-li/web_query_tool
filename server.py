#!/usr/bin/env python2.7
# coding: utf-8
import os.path
import sys
import json
import logging
import time
from urllib import quote
import requests

import tornado.escape
import tornado.ioloop
import tornado.web
import tornado.log
from tornado import gen
from tornado.httpclient import AsyncHTTPClient
from tornado.httputil import url_concat
from tornado.options import define, options, parse_command_line

from config import config
from py_log.logger import Logger, LogEnv
from py_db.db_operate import DbOperator
from py_db.db_redis import RedisFetcher
from login.login import Login
from py_db.db_mysql import MysqlOperator


class UserRight(object):
    DEVELOP = 0B1  # 渠道: 渠道管理
    SYSTEM = 0B10  # 系统: 添加账号
    STATISTIC = 0B100  # 数据统计
    EXPERIMENT = 0B1000  # 实验平台


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("user_id")

    def get_login_user(self):
        try:
            # 是否登录
            login_user = self.current_user
            if not login_user:
                self.redirect("/logout")
                return None, None
            login_user = tornado.escape.xhtml_escape(self.current_user)

            # 获取用户名
            show_name = self.get_secure_cookie('show_name')
            if not show_name:
                self.redirect("/logout")
                return None, None
            show_name = tornado.escape.xhtml_escape(show_name)

            # 登录时间
            str_login_time = self.get_secure_cookie('last_time')
            if not str_login_time:
                self.redirect("/logout")
                return None, None
            str_login_time = tornado.escape.xhtml_escape(str_login_time)

            # 是否过期
            now = time.time()
            last_time = float(str_login_time)
            time_span = now - last_time
            if time_span > config.server_expire_time:
                self.redirect("/logout")
                return None, None

            # 重新设置过期时间,每1分钟设置一次
            if time_span > 60:
                self.set_secure_cookie("last_time", str(time.time()), expires_days=None)

            # 返回用户信息
            return login_user, show_name
        except:
            self.redirect("/logout")
            return None, None


class MainHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        self.render('index.html', iframe_src='/day_count', user_name=show_name, login_user_right=user.user_right,
                    static_version=config.server_static_version, user_right=UserRight)


class DayCountHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.STATISTIC:
            self.render('error.html', static_version=config.server_static_version)
            return

        self.render('statistic/day_count.html', static_version=config.server_static_version)


class HourCountHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.STATISTIC:
            self.render('error.html', static_version=config.server_static_version)
            return

        self.render('statistic/hour_count.html', static_version=config.server_static_version)


class PositionHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.STATISTIC:
            self.render('error.html', static_version=config.server_static_version)
            return

        self.render('statistic/position.html', static_version=config.server_static_version)


class ChartHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.STATISTIC:
            self.render('error.html', static_version=config.server_static_version)
            return

        self.render('statistic/chart.html', static_version=config.server_static_version)


class ChartDataQueryHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.STATISTIC:
            self.render('error.html', static_version=config.server_static_version)
            return

        start_dt = self.get_argument("start_dt")
        end_dt = self.get_argument("end_dt")
        ad_network_id_1 = self.get_argument("ad_network_id_1")
        ad_network_id_2 = self.get_argument("ad_network_id_2")
        position_id = self.get_argument('position_id')
        chart_type = self.get_argument('chart_type')
        fetcher = RedisFetcher()
        json_dict = fetcher.fetch_chart_data(start_dt, end_dt, ad_network_id_1, ad_network_id_2, position_id, chart_type)
        self.write(json.dumps(json_dict, ensure_ascii=False))


class LayerHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == "QUERY_LAYER":
            layer_id = self.get_argument('layer_id', None)
            off_set = self.get_argument('off_set', None)
            limit = self.get_argument('limit', None)
            json_text = MysqlOperator.query_layer(layer_id, off_set, limit)
            self.write(json_text)
            return


class CfgItemHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if not req_type:
            self.render('experiment/cfg_item.html', static_version=config.server_static_version)
            return
        if req_type == "QUERY_ITEM":
            layer_id = self.get_argument('layer_id', None)
            item_id = self.get_argument('item_id', None)
            item_name = self.get_argument('item_name', None)
            off_set = self.get_argument('off_set', None)
            limit = self.get_argument('limit', None)
            json_text = MysqlOperator.query_cfg_item(layer_id, item_id, item_name, off_set, limit)
            self.write(json_text)
            return

    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'ADD_ITEM':
            item_id = self.get_argument('item_id', None)
            layer_id = self.get_argument('layer_id', None)
            item_name = self.get_argument('item_name', None)
            position = self.get_argument('position', None)
            start_value = self.get_argument('start_value', None)
            stop_value = self.get_argument('stop_value', None)
            algo_request = self.get_argument('algo_request')
            algo_response = self.get_argument('algo_response')
            status = self.get_argument('status', None)
            desc = self.get_argument('desc', None)
            json_text = MysqlOperator.add_cfg_item(item_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, status, desc)
            self.write(json_text)
            return

        result_dict = dict()
        result_dict['success'] = False
        result_dict['msg'] = 'Invalid req_type: ' + req_type
        self.write(json.dumps(result_dict, ensure_ascii=False))

    def put(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'MODIFY_ITEM':
            item_id = self.get_argument('item_id', None)
            layer_id = self.get_argument('layer_id', None)
            item_name = self.get_argument('item_name', None)
            position = self.get_argument('position', None)
            start_value = self.get_argument('start_value', None)
            stop_value = self.get_argument('stop_value', None)
            algo_request = self.get_argument('algo_request')
            algo_response = self.get_argument('algo_response')
            status = self.get_argument('status', None)
            desc = self.get_argument('desc', None)
            json_text = MysqlOperator.modify_cfg_item(item_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, status, desc)
            self.write(json_text)
            return

        if req_type == 'MODIFY_STATUS':
            item_id = self.get_argument('item_id', None)
            status = self.get_argument('status', None)
            json_text = MysqlOperator.modify_cfg_item_status(item_id, status)
            self.write(json_text)
            return

        result_dict = dict()
        result_dict['success'] = False
        result_dict['msg'] = 'Invalid req_type: ' + req_type
        self.write(json.dumps(result_dict, ensure_ascii=False))

    def delete(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'DEL_ITEM':
            item_id = self.get_argument('item_id', None)
            json_text = MysqlOperator.delete_cfg_item(item_id)
            self.write(json_text)
            return

        result_dict = dict()
        result_dict['success'] = False
        result_dict['msg'] = 'Invalid req_type: ' + req_type
        self.write(json.dumps(result_dict, ensure_ascii=False))


class NetworkListHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.DEVELOP:
            self.render('error.html', static_version=config.server_static_version)
            return

        self.render('develop/network_list.html', static_version=config.server_static_version)


class UserListHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.SYSTEM:
            self.render('error.html', static_version=config.server_static_version)
            return

        self.render('system/user_list.html', static_version=config.server_static_version)


class DayQueryHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.STATISTIC:
            self.render('error.html', static_version=config.server_static_version)
            return

        ad_network_id = self.get_argument("ad_network_id")
        start_dt = self.get_argument('start_dt')
        end_dt = self.get_argument("end_dt")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = DbOperator.get_day_count(ad_network_id, start_dt, end_dt, off_set, limit)
        self.write(text)


class HourQueryHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.STATISTIC:
            self.render('error.html', static_version=config.server_static_version)
            return

        dt = self.get_argument("dt")
        ad_network_id = self.get_argument("ad_network_id")
        start_hour = self.get_argument('start_hour')
        end_hour = self.get_argument("end_hour")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = DbOperator.get_hour_count(dt, ad_network_id, start_hour, end_hour, off_set, limit)
        self.write(text)


class PositionQueryHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.STATISTIC:
            self.render('error.html', static_version=config.server_static_version)
            return

        dt = self.get_argument("dt")
        ad_network_id = self.get_argument("ad_network_id")
        position_id = self.get_argument('position_id')
        fetcher = RedisFetcher()
        if position_id:
            text = fetcher.fetch_position(dt, ad_network_id, position_id)
        else:
            text = fetcher.fetch_network(dt, ad_network_id)
        self.write(text)


class AddUserHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.SYSTEM:
            self.render('error.html', static_version=config.server_static_version)
            return

        user_account = self.get_argument("user_account")
        user_right = self.get_argument("user_right")
        text = DbOperator.add_user_account(user_account, user_right)
        self.write(text)


class QueryUserListHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.SYSTEM:
            self.render('error.html', static_version=config.server_static_version)
            return

        user_account = self.get_argument("user_account")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        text = DbOperator.query_user_list(user_account, off_set, limit)
        self.write(text)


class DeleteUserListHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.SYSTEM:
            self.render('error.html', static_version=config.server_static_version)
            return

        user_id_list = self.get_argument("user_id_list")
        text = DbOperator.delete_user_list(user_id_list)
        self.write(text)


class EditUserListHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.SYSTEM:
            self.render('error.html', static_version=config.server_static_version)
            return

        user_id = self.get_argument("user_id")
        user_right = self.get_argument("user_right")
        text = DbOperator.edit_user(user_id, user_right)
        self.write(text)


class AddNetworkHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.DEVELOP:
            self.render('error.html', static_version=config.server_static_version)
            return

        network_name = self.get_argument("network_name")
        text = DbOperator.add_network(network_name)
        self.write(text)


class QueryNetworkListHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.STATISTIC and not user.user_right & UserRight.DEVELOP:
            self.render('error.html', static_version=config.server_static_version)
            return

        network_name = self.get_argument("network_name")
        off_set = self.get_argument("off_set")
        limit = self.get_argument("limit")
        a_dict = DbOperator.query_network_list(network_name, off_set, limit)
        text = json.dumps(a_dict)
        self.write(text)


class DeleteNetworkListHandler(BaseHandler):
    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.DEVELOP:
            self.render('error.html', static_version=config.server_static_version)
            return

        user_id_list = self.get_argument("network_id_list")
        text = DbOperator.delete_network_list(user_id_list)
        self.write(text)


class LoginHandler(BaseHandler):
    # 本机登录用
    def post(self):
        if config.server_local_fake:
            name = self.get_argument("name")
            self.set_secure_cookie("user_id", name, expires_days=None)
            self.set_secure_cookie("show_name", name, expires_days=None)
            self.set_secure_cookie("last_time", str(time.time()), expires_days=None)
            self.redirect("/")
        self.redirect("/")

    def get(self):
        if config.server_local_fake:
            # 本机fake登录
            self.render("login.html", static_version=config.server_static_version)
        else:
            # 线上真实登录
            Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
            if self.get_current_user():
                self.redirect("/")
                return

            code_from_auth = self.get_argument('code', None)
            if not code_from_auth:
                redirect_url = config.server_oauth_auth_url
                redirect_url += '?appid=%s' % config.server_oauth_app_id
                redirect_url += '&response_type=code'
                redirect_url += '&redirect_uri=%s' % quote(config.server_oauth_redirect_url)
                redirect_url += '&scope=user_info'
                redirect_url += '&state=test'
                self.redirect(redirect_url)
                return

            status, content = Login.get_access_token(code_from_auth)
            if status != 200:
                self.write(content)
                return
            Logger.info("get_access_token: [%s]" % content)

            try:
                a_dict = json.loads(content)
            except:
                Logger.error("parse token error: content[%s]" % content)
                self.write(content)
                return

            access_token = a_dict.get("access_token", None)
            openid = a_dict.get("openid", None)
            status, content = Login.get_user_info(access_token, openid)
            if status != 200:
                self.write(content)
                return
            Logger.info("get_user_info: [%s]" % content)

            try:
                a_dict = json.loads(content)
            except:
                Logger.error("parse user_info error: contnet[%s]" % content)
                self.write(content)
                return

            name = a_dict.get("name")
            email = a_dict.get("email")
            db_user = DbOperator.get_user_info(email)
            if not db_user or db_user.user_right == 0:
                self.render('error.html', static_version=config.server_static_version)
                return

            # 保存session
            self.set_secure_cookie("user_id", email, expires_days=None)
            self.set_secure_cookie("show_name", name, expires_days=None)
            self.set_secure_cookie("last_time", str(time.time()), expires_days=None)

            # 重向定
            self.redirect("/")


class LogoutHandler(BaseHandler):
    def get(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        self.clear_cookie("user_id")
        self.clear_cookie("show_name")
        self.set_status(302)
        self.render('logout.html', static_version=config.server_static_version)


class ReloadHandler(BaseHandler):
    def get(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        self.render('reload.html', static_version=config.server_static_version)


class LogFormatter(tornado.log.LogFormatter):
    def __init__(self):
        super(LogFormatter, self).__init__(
            fmt='%(color)s[%(asctime)s %(filename)s:%(funcName)s:%(lineno)d %(levelname)s]%(end_color)s %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )


class HourAdIdeaPositionCount(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def handle(self):
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)
        start_dt = self.get_argument('sdate', None)
        end_dt = self.get_argument("edate", None)
        start_hour = self.get_argument('shour', None)
        end_hour = self.get_argument("ehour", None)
        ad_network_id = self.get_argument("ad_network_id", None)
        ad_id = self.get_argument("ad_id", None)
        ad_idea_id = self.get_argument("creative_id", None)
        ad_position_id = self.get_argument("position_id", None)
        offset = self.get_argument("offset", None)
        limit = self.get_argument("limit", None)

        if ad_network_id is None:
            ad_network_id = "meitu"

        r_dict = dict()
        if start_dt:
            r_dict['sdate'] = start_dt
        if end_dt:
            r_dict['edate'] = end_dt
        if start_hour:
            r_dict['shour'] = start_hour
        if end_hour:
            r_dict['ehour'] = end_hour
        if ad_network_id:
            r_dict['ad_network_id'] = ad_network_id
        if ad_id:
            r_dict['ad_id'] = ad_id
        if ad_idea_id:
            r_dict['creative_id'] = ad_idea_id
        if ad_position_id:
            r_dict['position_id'] = ad_position_id
        if offset:
            r_dict['offset'] = offset
        if limit:
            r_dict['limit'] = limit
        url = url_concat(config.api_server, r_dict)
        Logger.info(url)

        http_client = AsyncHTTPClient()
        http_client.fetch(url, self.on_fetch)

    def on_fetch(self, response):
        self.write(response.body)
        self.finish()

    def get(self):
        self.handle()

    def post(self):
        self.handle()


class TreeItemHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if not req_type:
            self.render('experiment/tree_item.html', static_version=config.server_static_version)
            return
        if req_type == "QUERY_ITEM":
            layer_id = self.get_argument('layer_id', None)
            cfg_id = self.get_argument('item_id', None)
            item_name = self.get_argument('item_name', None)
            off_set = self.get_argument('off_set', None)
            limit = self.get_argument('limit', None)
            json_text = MysqlOperator.query_cfg_item(layer_id, cfg_id, item_name, off_set, limit)
            self.write(json_text)
            return

    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'ADD_ITEM':
            item_id = self.get_argument('item_id', None)
            layer_id = self.get_argument('layer_id', None)
            item_name = self.get_argument('item_name', None)
            position = self.get_argument('position', None)
            start_value = self.get_argument('start_value', None)
            stop_value = self.get_argument('stop_value', None)
            algo_request = self.get_argument('algo_request')
            algo_response = self.get_argument('algo_response')
            status = self.get_argument('status', None)
            desc = self.get_argument('desc', None)
            json_text = MysqlOperator.add_cfg_item(item_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, status, desc)
            self.write(json_text)
            return

        result_dict = dict()
        result_dict['success'] = False
        result_dict['msg'] = 'Invalid req_type: ' + req_type
        self.write(json.dumps(result_dict, ensure_ascii=False))

    def put(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'MODIFY_ITEM':
            item_id = self.get_argument('item_id', None)
            layer_id = self.get_argument('layer_id', None)
            item_name = self.get_argument('item_name', None)
            position = self.get_argument('position', None)
            start_value = self.get_argument('start_value', None)
            stop_value = self.get_argument('stop_value', None)
            algo_request = self.get_argument('algo_request')
            algo_response = self.get_argument('algo_response')
            status = self.get_argument('status', None)
            desc = self.get_argument('desc', None)
            json_text = MysqlOperator.modify_cfg_item(item_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, status, desc)
            self.write(json_text)
            return

        if req_type == 'MODIFY_STATUS':
            item_id = self.get_argument('item_id', None)
            status = self.get_argument('status', None)
            json_text = MysqlOperator.modify_cfg_item_status(item_id, status)
            self.write(json_text)
            return

        result_dict = dict()
        result_dict['success'] = False
        result_dict['msg'] = 'Invalid req_type: ' + req_type
        self.write(json.dumps(result_dict, ensure_ascii=False))

    def delete(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'DEL_ITEM':
            item_id = self.get_argument('item_id', None)
            json_text = MysqlOperator.delete_cfg_item(item_id)
            self.write(json_text)
            return

        result_dict = dict()
        result_dict['success'] = False
        result_dict['msg'] = 'Invalid req_type: ' + req_type
        self.write(json.dumps(result_dict, ensure_ascii=False))


class ExperimentHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == "QUERY_EXP":
            layer_id = self.get_argument('layer_id', None)
            exp_id = self.get_argument('exp_id', None)
            off_set = self.get_argument('off_set', None)
            limit = self.get_argument('limit', None)
            json_text = MysqlOperator.query_experiment(layer_id, exp_id, off_set, limit)
            self.write(json_text)
            return


class CfgRelationHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'GET_RELATION':
            layer_id = self.get_argument('layer_id', None)
            cfg_id = self.get_argument('item_id', None)
            exp_id = self.get_argument('exp_id', None)
            off_set = self.get_argument('off_set', None)
            limit = self.get_argument('limit', None)
            json_text = MysqlOperator.query_cfg_relation(layer_id, cfg_id, exp_id, off_set, limit)
            self.write(json_text)
            return

    def put(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'PUT_RELATION':
            layer_id = self.get_argument('layer_id', None)
            item_id = self.get_argument('item_id', None)
            exp_id_list = self.request.arguments.get('exp_id[]', [])
            json_text = MysqlOperator.put_cfg_relation(layer_id, item_id, exp_id_list)
            self.write(json_text)
            return

    def delete(self, *args, **kwargs):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'DEL_RELATION':
            layer_id = self.get_argument('layer_id', None)
            item_id = self.get_argument('item_id', None)
            exp_id = self.get_argument('exp_id', None)
            json_text = MysqlOperator.delete_relation(layer_id, item_id, exp_id)
            self.write(json_text)
            return


class ExpRelationHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'GET_RELATION':
            layer_id = self.get_argument('layer_id', None)
            exp_id = self.get_argument('exp_id', None)
            cfg_id = self.get_argument('item_id', None)
            off_set = self.get_argument('off_set', None)
            limit = self.get_argument('limit', None)
            json_text = MysqlOperator.query_exp_relation(layer_id, exp_id, cfg_id, off_set, limit)
            self.write(json_text)
            return

    def put(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'PUT_RELATION':
            layer_id = self.get_argument('layer_id', None)
            item_id = self.get_argument('item_id', None)
            exp_id_list = self.request.arguments.get('exp_id[]', [])
            json_text = MysqlOperator.put_cfg_relation(layer_id, item_id, exp_id_list)
            self.write(json_text)
            return

    def delete(self, *args, **kwargs):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'DEL_RELATION':
            layer_id = self.get_argument('layer_id', None)
            item_id = self.get_argument('item_id', None)
            exp_id = self.get_argument('exp_id', None)
            json_text = MysqlOperator.delete_relation(layer_id, item_id, exp_id)
            self.write(json_text)
            return


class TreeExpHandler(BaseHandler):
    def get(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if not req_type:
            self.render('experiment/tree_exp.html', static_version=config.server_static_version)
            return
        if req_type == "QUERY_ITEM":
            layer_id = self.get_argument('layer_id', None)
            item_id = self.get_argument('item_id', None)
            item_name = self.get_argument('item_name', None)
            off_set = self.get_argument('off_set', None)
            limit = self.get_argument('limit', None)
            json_text = MysqlOperator.query_cfg_item(layer_id, item_id, item_name, off_set, limit)
            self.write(json_text)
            return

    def post(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'ADD_ITEM':
            item_id = self.get_argument('item_id', None)
            layer_id = self.get_argument('layer_id', None)
            item_name = self.get_argument('item_name', None)
            position = self.get_argument('position', None)
            start_value = self.get_argument('start_value', None)
            stop_value = self.get_argument('stop_value', None)
            algo_request = self.get_argument('algo_request')
            algo_response = self.get_argument('algo_response')
            status = self.get_argument('status', None)
            desc = self.get_argument('desc', None)
            json_text = MysqlOperator.add_cfg_item(item_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, status, desc)
            self.write(json_text)
            return

        result_dict = dict()
        result_dict['success'] = False
        result_dict['msg'] = 'Invalid req_type: ' + req_type
        self.write(json.dumps(result_dict, ensure_ascii=False))

    def put(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'MODIFY_ITEM':
            item_id = self.get_argument('item_id', None)
            layer_id = self.get_argument('layer_id', None)
            item_name = self.get_argument('item_name', None)
            position = self.get_argument('position', None)
            start_value = self.get_argument('start_value', None)
            stop_value = self.get_argument('stop_value', None)
            algo_request = self.get_argument('algo_request')
            algo_response = self.get_argument('algo_response')
            status = self.get_argument('status', None)
            desc = self.get_argument('desc', None)
            json_text = MysqlOperator.modify_cfg_item(item_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, status, desc)
            self.write(json_text)
            return

        if req_type == 'MODIFY_STATUS':
            item_id = self.get_argument('item_id', None)
            status = self.get_argument('status', None)
            json_text = MysqlOperator.modify_cfg_item_status(item_id, status)
            self.write(json_text)
            return

        result_dict = dict()
        result_dict['success'] = False
        result_dict['msg'] = 'Invalid req_type: ' + req_type
        self.write(json.dumps(result_dict, ensure_ascii=False))

    def delete(self):
        user_name, show_name = self.get_login_user()
        if not user_name:
            return
        Logger.info(json.dumps(self.request.arguments, ensure_ascii=False), self.request.uri)

        user = DbOperator.get_user_info(user_name)
        if not user:
            self.redirect('/logout')
        if not user.user_right & UserRight.EXPERIMENT:
            self.render('error.html', static_version=config.server_static_version)
            return

        req_type = self.get_argument('type', None)
        if req_type == 'DEL_ITEM':
            item_id = self.get_argument('item_id', None)
            json_text = MysqlOperator.delete_cfg_item(item_id)
            self.write(json_text)
            return

        result_dict = dict()
        result_dict['success'] = False
        result_dict['msg'] = 'Invalid req_type: ' + req_type
        self.write(json.dumps(result_dict, ensure_ascii=False))


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

    # 初始化 redis
    RedisFetcher.init_redis(config.redis_host, config.redis_port, config.redis_password)
    RedisFetcher.init_win_redis(config.win_redis_host, config.win_redis_port, config.win_redis_password)

    # 初始化 mysql
    MysqlOperator.init()

    # 重定向tornado自带日志
    logging.getLogger("tornado.access").addHandler(Logger.get_third_handler())
    logging.getLogger("tornado.application").addHandler(Logger.get_third_handler())
    logging.getLogger("tornado.general").addHandler(Logger.get_third_handler())

    print "server is starting..."
    Logger.info("server is starting...")
    Logger.info("config.server_listen_port: %s" % config.server_listen_port)

    app = tornado.web.Application(
        [
            (r'/', MainHandler),
            (r'/reload', ReloadHandler),
            (r'/login', LoginHandler),
            (r'/logout', LogoutHandler),
            (r'/day_count', DayCountHandler),
            (r'/hour_count', HourCountHandler),
            (r'/position', PositionHandler),
            (r'/user_list', UserListHandler),
            (r'/network_list', NetworkListHandler),
            (r'/query_day_page', DayQueryHandler),
            (r'/query_hour_page', HourQueryHandler),
            (r'/query_position_page', PositionQueryHandler),
            (r'/add_user', AddUserHandler),
            (r'/query_user_list', QueryUserListHandler),
            (r'/delete_user_list', DeleteUserListHandler),
            (r'/edit_user', EditUserListHandler),
            (r'/add_network', AddNetworkHandler),
            (r'/query_network_list', QueryNetworkListHandler),
            (r'/delete_network_list', DeleteNetworkListHandler),
            (r'/position_count', HourAdIdeaPositionCount),
            (r'/chart', ChartHandler),
            (r'/query_chart_data', ChartDataQueryHandler),
            # (r'/cfg_item', CfgItemHandler),
            (r'/layer', LayerHandler),
            (r'/tree_item', TreeItemHandler),
            (r'/tree_exp', TreeExpHandler),
            (r'/experiment', ExperimentHandler),
            (r'/cfg_relation', CfgRelationHandler),
            (r'/exp_relation', ExpRelationHandler),
        ],
        cookie_secret=config.server_cookie_secret,
        template_path=os.path.join(os.path.dirname(__file__), "templates"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        xsrf_cookies=False,
        debug=config.server_debug_mode
    )
    app.listen(config.server_listen_port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == '__main__':
    __main__()
