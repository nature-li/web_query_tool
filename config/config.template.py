#!/usr/bin/env python2.7
# coding: utf-8
import time
from py_log.logger import LogEnv

# 日志配置
server_log_env = LogEnv.develop
server_log_target = "logs"
server_log_name = "result"
server_log_size = 100 * 1024 * 1024
server_log_count = 100

# 服务配置
server_listen_port = 33333
server_debug_mode = False
server_cookie_secret = "write_your_own_password"
server_expire_time = 15 * 60

# 数据库所在位置
server_db_uri = 'sqlite:////Users/xxx/count.db'

# redis 配置
redis_host = 'xxxxx.com'
redis_port = 1234
redis_password = 'password'

# req_res_win redis配置
win_redis_host = 'xxxxx.com'
win_redis_port = 1234
win_redis_password = 'password'

# OAUTH登录
server_oauth_app_id = ''
server_oauth_app_secret = ''
server_oauth_redirect_url = ''
server_oauth_token_url = ""
server_oauth_user_url = ""
server_oauth_auth_url = ''

# MYSQL
server_mysql_host = '192.168.xx.xx'
server_mysql_port = '3306'
server_mysql_user = 'user_name'
server_mysql_pwd = 'user_pwd'
server_mysql_db = 'db_name'

# 升级
server_static_version = int(time.time())

# API_SERVER
api_server = 'http://xxx:8888/position_count'

# FAKE_LOGIN
server_local_fake = False
