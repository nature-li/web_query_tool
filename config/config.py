#!/usr/bin/env python2.7
# coding: utf-8
from py_log.logger import LogEnv

# 日志配置
server_log_env = LogEnv.develop
server_log_target = "logs"
server_log_name = "platform"
server_log_size = 100 * 1024 * 1024
server_log_count = 100

# 服务配置
server_listen_port = 8888
server_debug_mode = False

# 数据库所在位置
server_db_uri = 'sqlite:////Users/xxxxxx/sqlite/count.db'

# OAUTH登录
server_oauth_app_id = ''
server_oauth_app_secret = ''
server_oauth_redirect_url = ''
server_oauth_token_url = ""
server_oauth_user_url = ""
