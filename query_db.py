#!/usr/bin/env python2.7
# coding: utf-8

import sqlite3
import datetime
import json
import traceback
import time

g_data_base = "/Users/liyanguo/work/web/hive/sqlite/count.db"


# 获取日统计
def get_day_count(ad_network_id, ad_action, start_dt, end_dt):
    try:
        conn = sqlite3.connect(g_data_base)
        cursor = conn.cursor()
        start = datetime.datetime.strptime(start_dt, '%Y-%m-%d')
        end = datetime.datetime.strptime(end_dt, '%Y-%m-%d')

        dt_list = list()
        tmp_dt = start
        while tmp_dt <= end:
            dt_list.append("'%s'" % tmp_dt.strftime('%Y-%m-%d'))
            tmp_dt += datetime.timedelta(days=1)
        sql_part = ','.join(dt_list)
        if ad_network_id == 'all' and ad_action == 'all':
            sql = "select dt, ad_network_id, ad_action, count, update_time from day_count where dt in (%s) " \
                  "order by dt, ad_network_id, ad_action" % sql_part
        elif ad_network_id == 'all':
            sql = "select dt, ad_network_id, ad_action, count, update_time from day_count where dt in (%s) " \
                  "and ad_action='%s' order by dt, ad_network_id, ad_action" \
                  % (sql_part, ad_action)
        elif ad_action == "all":
            sql = "select dt, ad_network_id, ad_action, count, update_time from day_count where dt in (%s) " \
                  "and ad_network_id='%s' order by dt, ad_network_id, ad_action" \
                  % (sql_part, ad_network_id)
        else:
            sql = "select dt, ad_network_id, ad_action, count, update_time from day_count where dt in (%s) " \
                  "and ad_network_id='%s' and ad_action='%s' order by dt, ad_network_id, ad_action" \
                  % (sql_part, ad_network_id, ad_action)
        print sql
        cursor.execute(sql)
        values = cursor.fetchall()
        cursor.close()
        conn.close()

        a_list = list()
        for value in values:
            a_dict = dict()
            a_list.append(a_dict)
            a_dict['dt'] = value[0]
            a_dict['ad_network_id'] = value[1]
            a_dict['ad_action'] = value[2]
            a_dict['count'] = value[3]
            a_dict['update_time'] = datetime.datetime.fromtimestamp(int(value[4])).strftime(
                    '%Y-%m-%d %H:%M:%S')
        a_dict = dict()
        a_dict['success'] = 'true'
        a_dict['content'] = a_list
        return json.dumps(a_dict)
    except:
        print traceback.format_exc()
        a_dict = dict()
        a_dict['success'] = 'false'
        a_dict['content'] = list()
        return json.dumps(a_dict)


# 获取时统计
def get_hour_count(dt, ad_network_id, ad_action, start_hour, end_hour, off_set, limit):
    try:
        conn = sqlite3.connect(g_data_base)
        cursor = conn.cursor()
        dt = datetime.datetime.strptime(dt, '%Y-%m-%d').strftime("%Y-%m-%d")

        start = int(start_hour)
        end = int(end_hour)

        hour_list = list()
        tmp_hour = start
        while tmp_hour <= end:
            hour_list.append("'%02d'" % tmp_hour)
            tmp_hour += 1
        sql_part = ','.join(hour_list)
        if ad_network_id == 'all' and ad_action == 'all':
            sql = "select dt, hour, ad_network_id, ad_action, count, update_time from hour_count where hour in (%s) " \
                  "and dt='%s' order by dt, hour, ad_network_id, ad_action limit %s offset %s" \
                  % (sql_part, dt, limit, off_set)
        elif ad_network_id == 'all':
            sql = "select dt, hour, ad_network_id, ad_action, count, update_time from hour_count where hour in (%s) " \
                  "and ad_action='%s' and dt='%s' order by dt, hour, ad_network_id, ad_action limit %s offset %s" \
                  % (sql_part, ad_action, dt, limit, off_set)
        elif ad_action == "all":
            sql = "select dt, hour, ad_network_id, ad_action, count, update_time from hour_count where hour in (%s) " \
                  "and ad_network_id='%s' and dt='%s' order by dt, hour, ad_network_id, ad_action limit %s offset %s" \
                  % (sql_part, ad_network_id, dt, limit, off_set)
        else:
            sql = "select dt, hour, ad_network_id, ad_action, count, update_time from hour_count where hour in (%s) " \
                  "and ad_network_id='%s' and ad_action='%s' and dt='%s' order by dt, hour, ad_network_id, ad_action " \
                  "limit %s offset %s" \
                  % (sql_part, ad_network_id, ad_action, dt, limit, off_set)
        print sql
        cursor.execute(sql)
        values = cursor.fetchall()
        cursor.close()
        conn.close()

        a_list = list()
        for value in values:
            a_dict = dict()
            a_list.append(a_dict)
            a_dict['dt'] = value[0]
            a_dict['hour'] = value[1]
            a_dict['ad_network_id'] = value[2]
            a_dict['ad_action'] = value[3]
            a_dict['count'] = value[4]
            a_dict['update_time'] = datetime.datetime.fromtimestamp(int(value[5])).strftime(
                    '%Y-%m-%d %H:%M:%S')
        a_dict = dict()
        a_dict['success'] = 'true'
        a_dict['content'] = a_list
        return json.dumps(a_dict)
    except:
        print traceback.format_exc()
        a_dict = dict()
        a_dict['success'] = 'false'
        a_dict['content'] = list()
        return json.dumps(a_dict)


# 增加用户
def add_user_account(user_account, user_right):
    try:
        conn = sqlite3.connect(g_data_base)
        cursor = conn.cursor()

        now = int(time.time())
        sql = "insert into user_list(user_account, user_right, update_time) values('%s', %s, %s)"\
              % (user_account, user_right, now)
        print sql
        cursor.execute(sql)

        # 插入失败
        if cursor.rowcount != 1:
            cursor.close()
            conn.close()
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = dict()
            return json.dumps(a_dict)

        # 读取数据
        sql = 'select id, user_account, user_right, update_time from user_list where id=%s' % cursor.lastrowid
        print sql
        cursor.execute(sql)
        values = cursor.fetchall()
        cursor.close()
        conn.commit()
        conn.close()

        # 查询失败
        if len(values) != 1:
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = dict()
            return json.dumps(a_dict)

        # 查询成功
        a_user_list = list()
        for value in values:
            a_user = dict()
            a_user_list.append(a_user)
            a_user['user_id'] = value[0]
            a_user['user_account'] = value[1]
            a_user['user_right'] = value[2]
            a_user['update_time'] = datetime.datetime.fromtimestamp(int(value[3])).strftime(
                        '%Y-%m-%d %H:%M:%S')

        # 返回成功
        a_dict = dict()
        a_dict['success'] = 'true'
        a_dict['content'] = a_user_list

        return json.dumps(a_dict)
    except:
        print traceback.format_exc()
        a_dict = dict()
        a_dict['success'] = 'false'
        a_dict['content'] = list()
        return json.dumps(a_dict)


# 查询用户
def query_user_list():
    try:
        conn = sqlite3.connect(g_data_base)
        cursor = conn.cursor()
        sql = 'select id, user_account, user_right, update_time from user_list'
        print sql
        cursor.execute(sql)
        values = cursor.fetchall()
        cursor.close()
        conn.close()

        # 查询成功
        a_user_list = list()
        for value in values:
            a_user = dict()
            a_user_list.append(a_user)
            a_user['user_id'] = value[0]
            a_user['user_account'] = value[1]
            a_user['user_right'] = value[2]
            a_user['update_time'] = datetime.datetime.fromtimestamp(int(value[3])).strftime(
                        '%Y-%m-%d %H:%M:%S')

        # 返回成功
        a_dict = dict()
        a_dict['success'] = 'true'
        a_dict['content'] = a_user_list

        return json.dumps(a_dict)
    except:
        print traceback.format_exc()
        a_dict = dict()
        a_dict['success'] = 'false'
        a_dict['content'] = list()
        return json.dumps(a_dict)


# 删除用户
def delete_user_list(user_id_list):
    try:
        conn = sqlite3.connect(g_data_base)
        cursor = conn.cursor()

        split_id_list = user_id_list.split(',')
        join_id_list = list()
        for user_id in split_id_list:
            if user_id != '':
                join_id_list.append(user_id)

        if len(split_id_list) == 0:
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            return json.dumps(a_dict)

        sql_part = '(' + ','.join(join_id_list) + ')'
        sql = 'delete from user_list where id in %s' % sql_part
        print sql
        cursor.execute(sql)
        cursor.close()
        conn.commit()
        conn.close()

        # 返回成功
        a_dict = dict()
        a_dict['success'] = 'true'
        a_dict['content'] = join_id_list

        return json.dumps(a_dict)
    except:
        print traceback.format_exc()
        a_dict = dict()
        a_dict['success'] = 'false'
        a_dict['content'] = list()
        return json.dumps(a_dict)


# 更新用户信息
def edit_user(user_id, user_right):
    try:
        conn = sqlite3.connect(g_data_base)
        cursor = conn.cursor()

        sql = 'update user_list set user_right="%s" where id=%s' % (user_right, user_id)
        print sql
        cursor.execute(sql)

        # 更新失败
        if cursor.rowcount != 1:
            cursor.close()
            conn.close()
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = dict()
            return json.dumps(a_dict)

        # 读取数据
        sql = 'select id, user_account, user_right, update_time from user_list where id=%s' % user_id
        print sql
        cursor.execute(sql)
        values = cursor.fetchall()
        cursor.close()
        conn.commit()
        conn.close()

        # 更新成功
        a_user = dict()
        for value in values:
            a_user['user_id'] = value[0]
            a_user['user_account'] = value[1]
            a_user['user_right'] = value[2]
            a_user['update_time'] = datetime.datetime.fromtimestamp(int(value[3])).strftime(
                        '%Y-%m-%d %H:%M:%S')

        # 返回成功
        a_dict = dict()
        a_dict['success'] = 'true'
        a_dict['content'] = a_user

        return json.dumps(a_dict)
    except:
        print traceback.format_exc()
        a_dict = dict()
        a_dict['success'] = 'false'
        a_dict['content'] = dict()
        return json.dumps(a_dict)


# 增加渠道
def add_network(network_name):
    try:
        conn = sqlite3.connect(g_data_base)
        cursor = conn.cursor()

        now = int(time.time())
        sql = "insert into network_list(network, update_time) values('%s', %s)"\
              % (network_name, now)
        print sql
        cursor.execute(sql)

        # 插入失败
        if cursor.rowcount != 1:
            cursor.close()
            conn.close()
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = dict()
            return json.dumps(a_dict)

        # 读取数据
        sql = 'select id, network, update_time from network_list where id=%s' % cursor.lastrowid
        print sql
        cursor.execute(sql)
        values = cursor.fetchall()
        cursor.close()
        conn.commit()
        conn.close()

        # 查询失败
        if len(values) != 1:
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = dict()
            return json.dumps(a_dict)

        # 查询成功
        a_user_list = list()
        for value in values:
            a_user = dict()
            a_user_list.append(a_user)
            a_user['network_id'] = value[0]
            a_user['network_name'] = value[1]
            a_user['update_time'] = datetime.datetime.fromtimestamp(int(value[2])).strftime(
                        '%Y-%m-%d %H:%M:%S')

        # 返回成功
        a_dict = dict()
        a_dict['success'] = 'true'
        a_dict['content'] = a_user_list

        return json.dumps(a_dict)
    except:
        print traceback.format_exc()
        a_dict = dict()
        a_dict['success'] = 'false'
        a_dict['content'] = list()
        return json.dumps(a_dict)


# 查询渠道
def query_network_list():
    try:
        conn = sqlite3.connect(g_data_base)
        cursor = conn.cursor()
        sql = 'select id, network, update_time from network_list'
        print sql
        cursor.execute(sql)
        values = cursor.fetchall()
        cursor.close()
        conn.close()

        # 查询成功
        a_user_list = list()
        for value in values:
            a_user = dict()
            a_user_list.append(a_user)
            a_user['network_id'] = value[0]
            a_user['network_name'] = value[1]
            a_user['update_time'] = datetime.datetime.fromtimestamp(int(value[2])).strftime(
                        '%Y-%m-%d %H:%M:%S')

        # 返回成功
        a_dict = dict()
        a_dict['success'] = 'true'
        a_dict['content'] = a_user_list

        return json.dumps(a_dict)
    except:
        print traceback.format_exc()
        a_dict = dict()
        a_dict['success'] = 'false'
        a_dict['content'] = list()
        return json.dumps(a_dict)


# 删除渠道
def delete_network_list(user_id_list):
    try:
        conn = sqlite3.connect(g_data_base)
        cursor = conn.cursor()

        split_id_list = user_id_list.split(',')
        join_id_list = list()
        for user_id in split_id_list:
            if user_id != '':
                join_id_list.append(user_id)

        if len(split_id_list) == 0:
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            return json.dumps(a_dict)

        sql_part = '(' + ','.join(join_id_list) + ')'
        sql = 'delete from network_list where id in %s' % sql_part
        print sql
        cursor.execute(sql)
        cursor.close()
        conn.commit()
        conn.close()

        # 返回成功
        a_dict = dict()
        a_dict['success'] = 'true'
        a_dict['content'] = join_id_list

        return json.dumps(a_dict)
    except:
        print traceback.format_exc()
        a_dict = dict()
        a_dict['success'] = 'false'
        a_dict['content'] = list()
        return json.dumps(a_dict)