#!/usr/bin/env python2.7
# coding: utf-8

import datetime
import json
import traceback
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from py_log.logger import Logger
from config import config
from db_orm import *


class DbOperator(object):
    engine = create_engine(config.server_db_uri, echo=False)

    # 获取日统计
    @classmethod
    def get_day_count(cls, ad_network_id, start_dt, end_dt, off_set, limit):
        try:
            # 扩展日期
            start = datetime.datetime.strptime(start_dt, '%Y-%m-%d')
            end = datetime.datetime.strptime(end_dt, '%Y-%m-%d')
            if end < start:
                a_dict = dict()
                a_dict['success'] = 'true'
                a_dict['content'] = list()
                a_dict['item_count'] = 0
                return json.dumps(a_dict)

            # 日期列表
            dt_list = list()
            tmp_dt = start
            while tmp_dt <= end:
                dt_list.append("%s" % tmp_dt.strftime('%Y-%m-%d'))
                tmp_dt += datetime.timedelta(days=1)

            # 类型转换
            off_set = int(off_set)
            limit = int(limit)
            if limit == -1:
                limit_count = None
            else:
                limit_count = off_set + limit

            # 创建session
            session = sessionmaker(bind=cls.engine)()

            # 查询
            if ad_network_id != "all":
                count = session.query(DayCount.dt,
                                      DayCount.ad_network_id,
                                      DayCount.pv,
                                      DayCount.impression,
                                      DayCount.click,
                                      DayCount.update_time
                                      ).filter(
                    DayCount.dt.in_(dt_list)).filter(
                    DayCount.ad_network_id == ad_network_id).count()
                values = session.query(DayCount.dt,
                                       DayCount.ad_network_id,
                                       DayCount.pv,
                                       DayCount.impression,
                                       DayCount.click,
                                       DayCount.update_time
                                       ).filter(
                    DayCount.dt.in_(dt_list)).filter(
                    DayCount.ad_network_id == ad_network_id).order_by(
                    DayCount.dt).order_by(
                    DayCount.ad_network_id)[off_set: limit_count]
            else:
                count = session.query(DayCount.dt,
                                      DayCount.ad_network_id,
                                      DayCount.pv,
                                      DayCount.impression,
                                      DayCount.click,
                                      DayCount.update_time
                                      ).filter(
                    DayCount.dt.in_(dt_list)).count()
                values = session.query(DayCount.dt,
                                       DayCount.ad_network_id,
                                       DayCount.pv,
                                       DayCount.impression,
                                       DayCount.click,
                                       DayCount.update_time
                                       ).filter(
                    DayCount.dt.in_(dt_list)).order_by(
                    DayCount.dt).order_by(
                    DayCount.ad_network_id)[off_set: limit_count]

            # 关闭session
            session.close()

            # 合并数据
            a_list = list()
            for value in values:
                a_dict = dict()
                a_dict['dt'] = value.dt
                a_dict['ad_network_id'] = value.ad_network_id
                a_dict['pv'] = value.pv
                a_dict['impression'] = value.impression
                a_dict['click'] = value.click
                if value.impression != 0:
                    a_dict['ctr'] = '%.2f%%' % (100.0 * value.click / value.impression)
                else:
                    a_dict['ctr'] = "0.00%"
                a_dict['update_time'] = datetime.datetime.fromtimestamp(value.update_time).strftime('%Y-%m-%d %H:%M:%S')
                a_list.append(a_dict)

            # 返回结果
            a_dict = dict()
            a_dict['success'] = 'true'
            a_dict['item_count'] = count
            a_dict['content'] = a_list
            return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    # 获取时统计
    @classmethod
    def get_hour_count(cls, dt, ad_network_id, start_hour, end_hour, off_set, limit):
        try:
            # 转换日期
            dt = datetime.datetime.strptime(dt, '%Y-%m-%d').strftime("%Y-%m-%d")

            # 扩展小时
            start_hour = int(start_hour)
            end_hour = int(end_hour)
            if end_hour < start_hour:
                a_dict = dict()
                a_dict['success'] = 'true'
                a_dict['content'] = list()
                a_dict['item_count'] = 0
                return json.dumps(a_dict)

            # 小时列表
            hour_list = list()
            tmp_hour = start_hour
            while tmp_hour <= end_hour:
                hour_list.append("%02d" % tmp_hour)
                tmp_hour += 1

            # 类型转换
            off_set = int(off_set)
            limit = int(limit)
            if limit == -1:
                limit_count = None
            else:
                limit_count = off_set + limit

            # 创建session
            session = sessionmaker(bind=cls.engine)()

            # 查询
            if ad_network_id != "all":
                count = session.query(HourCount.dt,
                                      HourCount.hour,
                                      HourCount.ad_network_id,
                                      HourCount.pv,
                                      HourCount.impression,
                                      HourCount.click,
                                      HourCount.update_time
                                      ).filter(HourCount.dt == dt).filter(
                    HourCount.hour.in_(hour_list)).filter(
                    HourCount.ad_network_id == ad_network_id).count()
                values = session.query(HourCount.dt,
                                       HourCount.hour,
                                       HourCount.ad_network_id,
                                       HourCount.pv,
                                       HourCount.impression,
                                       HourCount.click,
                                       HourCount.update_time
                                       ).filter(HourCount.dt == dt).filter(
                    HourCount.hour.in_(hour_list)).filter(
                    HourCount.ad_network_id == ad_network_id).order_by(
                    HourCount.hour)[off_set: limit_count]
            else:
                count = session.query(HourCount.dt,
                                      HourCount.hour,
                                      HourCount.ad_network_id,
                                      HourCount.pv,
                                      HourCount.impression,
                                      HourCount.click,
                                      HourCount.update_time
                                      ).filter(HourCount.dt == dt).filter(
                    HourCount.hour.in_(hour_list)).count()
                values = session.query(HourCount.dt,
                                       HourCount.hour,
                                       HourCount.ad_network_id,
                                       HourCount.pv,
                                       HourCount.impression,
                                       HourCount.click,
                                       HourCount.update_time
                                       ).filter(HourCount.dt == dt).filter(
                    HourCount.hour.in_(hour_list)).order_by(
                    HourCount.hour)[off_set: limit_count]

            # 关闭session
            session.close()

            # 合并数据
            a_list = list()
            for value in values:
                a_dict = dict()
                a_dict['dt'] = value.dt
                a_dict['hour'] = value.hour
                a_dict['ad_network_id'] = value.ad_network_id
                a_dict['pv'] = value.pv
                a_dict['impression'] = value.impression
                a_dict['click'] = value.click
                if value.impression != 0:
                    a_dict['ctr'] = '%.2f%%' % (100.0 * value.click / value.impression)
                else:
                    a_dict['ctr'] = "0.00%"
                a_dict['update_time'] = datetime.datetime.fromtimestamp(value.update_time).strftime('%Y-%m-%d %H:%M:%S')
                a_list.append(a_dict)

            # 返回结果
            a_dict = dict()
            a_dict['success'] = 'true'
            a_dict['content'] = a_list
            a_dict['item_count'] = count
            return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    # 增加用户
    @classmethod
    def add_user_account(cls, user_account, user_right):
        try:
            # 创建用户
            now = int(time.time())
            user = UserList(user_account=user_account, user_right=user_right, update_time=now)
            # 创建session
            session = sessionmaker(bind=cls.engine)()
            # 添加用户
            session.add(user)
            # 获取新id
            session.flush()
            new_user_id = user.id
            # 关闭session
            session.commit()
            session.close()

            # 插入成功,返回结果
            a_user_list = list()
            a_user = dict()
            a_user_list.append(a_user)
            a_user['user_id'] = new_user_id
            a_user['user_account'] = user_account
            a_user['user_right'] = user_right
            a_user['update_time'] = datetime.datetime.fromtimestamp(now).strftime(
                '%Y-%m-%d %H:%M:%S')

            # 返回成功
            a_dict = dict()
            a_dict['success'] = 'true'
            a_dict['content'] = a_user_list
            a_dict['item_count'] = 1
            return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    # 查询用户
    @classmethod
    def query_user_list(cls, user_account, off_set, limit):
        try:
            # 转换类型
            off_set = int(off_set)
            limit = int(limit)
            if limit == -1:
                limit_count = None
            else:
                limit_count = off_set + limit

            # 创建session
            session = sessionmaker(bind=cls.engine)()
            # 查询数据
            if user_account != '':
                like_condition = '%' + user_account + '%'
                count = session.query(UserList.id,
                                      UserList.user_account,
                                      UserList.user_right,
                                      UserList.update_time).filter(
                    UserList.user_account.like(like_condition)).count()
                values = session.query(UserList.id,
                                       UserList.user_account,
                                       UserList.user_right,
                                       UserList.update_time).filter(
                    UserList.user_account.like(like_condition))[
                         off_set: limit_count]
            else:
                count = session.query(UserList.id,
                                      UserList.user_account,
                                      UserList.user_right,
                                      UserList.update_time).count()
                values = session.query(UserList.id,
                                       UserList.user_account,
                                       UserList.user_right,
                                       UserList.update_time)[off_set: limit_count]
            # 关闭session
            session.close()
            # 返回结果
            a_user_list = list()
            for value in values:
                a_user = dict()
                a_user_list.append(a_user)
                a_user['user_id'] = value.id
                a_user['user_account'] = value.user_account
                a_user['user_right'] = value.user_right
                a_user['update_time'] = datetime.datetime.fromtimestamp(value.update_time).strftime(
                    '%Y-%m-%d %H:%M:%S')

            # 返回成功
            a_dict = dict()
            a_dict['success'] = 'true'
            a_dict['content'] = a_user_list
            a_dict['item_count'] = count
            return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    # 删除用户
    @classmethod
    def delete_user_list(cls, user_id_list):
        try:
            # 过滤参数
            split_id_list = user_id_list.split(',')
            join_id_list = list()
            for user_id in split_id_list:
                if user_id != '':
                    join_id_list.append(user_id)
            if len(join_id_list) == 0:
                a_dict = dict()
                a_dict['success'] = 'false'
                a_dict['content'] = list()
                return json.dumps(a_dict)

            # 创建session
            session = sessionmaker(bind=cls.engine)()
            # 添加用户
            count = session.query(UserList).filter(UserList.id.in_(join_id_list)).delete(synchronize_session=False)
            # 关闭session
            session.commit()
            session.close()

            if count <= 0:
                a_dict = dict()
                a_dict['success'] = 'false'
                a_dict['content'] = list()
                return json.dumps(a_dict)

            # 返回成功
            a_dict = dict()
            a_dict['success'] = 'true'
            a_dict['content'] = join_id_list
            return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            return json.dumps(a_dict)

    # 更新用户信息
    @classmethod
    def edit_user(cls, user_id, user_right):
        try:
            # 创建session
            session = sessionmaker(bind=cls.engine)()

            # 更新并获取用户信息
            count = session.query(UserList).filter(UserList.id == user_id).update({UserList.user_right: user_right})
            if count != 1:
                session.commit()
                session.close()
                a_dict = dict()
                a_dict['success'] = 'false'
                a_dict['content'] = dict()
                return json.dumps(a_dict)

            values = session.query(UserList).filter(UserList.id == user_id)
            # 关闭session
            session.commit()
            session.close()

            # 返回成功
            a_user = dict()
            for value in values:
                a_user['user_id'] = value.id
                a_user['user_account'] = value.user_account
                a_user['user_right'] = value.user_right
                a_user['update_time'] = datetime.datetime.fromtimestamp(value.update_time).strftime(
                    '%Y-%m-%d %H:%M:%S')

            a_dict = dict()
            a_dict['success'] = 'true'
            a_dict['content'] = a_user
            return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = dict()
            return json.dumps(a_dict)

    # 增加渠道
    @classmethod
    def add_network(cls, network_name):
        try:
            # 创建渠道
            now = int(time.time())
            network = NetworkList(network=network_name, update_time=now)
            # 创建session
            session = sessionmaker(bind=cls.engine)()
            # 添加渠道
            session.add(network)
            # 获取新id
            session.flush()
            new_network_id = network.id
            # 关闭session
            session.commit()
            session.close()

            # 插入成功,返回结果
            a_network_list = list()
            a_network = dict()
            a_network_list.append(a_network)
            a_network['network_id'] = new_network_id
            a_network['network_name'] = network_name
            a_network['update_time'] = datetime.datetime.fromtimestamp(now).strftime(
                '%Y-%m-%d %H:%M:%S')

            # 返回成功
            a_dict = dict()
            a_dict['success'] = 'true'
            a_dict['content'] = a_network_list
            a_dict['item_count'] = 1
            return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    # 查询渠道
    @classmethod
    def query_network_list(cls, network_name, off_set, limit):
        try:
            # 转换类型
            off_set = int(off_set)
            limit = int(limit)
            if limit == -1:
                limit_count = None
            else:
                limit_count = off_set + limit

            # 创建session
            session = sessionmaker(bind=cls.engine)()
            # 查询数据
            if network_name != '':
                like_condition = '%' + network_name + '%'
                count = session.query(NetworkList.id,
                                      NetworkList.network,
                                      NetworkList.update_time).filter(NetworkList.network.like(like_condition)).count()
                values = session.query(NetworkList.id,
                                       NetworkList.network,
                                       NetworkList.update_time).filter(NetworkList.network.like(like_condition))[
                         off_set: limit_count]
            else:
                count = session.query(NetworkList.id,
                                      NetworkList.network,
                                      NetworkList.update_time).count()
                values = session.query(NetworkList.id,
                                       NetworkList.network,
                                       NetworkList.update_time)[off_set: limit_count]
            # 关闭session
            session.close()
            # 返回结果
            a_network_list = list()
            for value in values:
                a_network = dict()
                a_network_list.append(a_network)
                a_network['network_id'] = value.id
                a_network['network_name'] = value.network
                a_network['update_time'] = datetime.datetime.fromtimestamp(value.update_time).strftime(
                    '%Y-%m-%d %H:%M:%S')

            # 返回成功
            a_dict = dict()
            a_dict['success'] = 'true'
            a_dict['content'] = a_network_list
            a_dict['item_count'] = count
            return a_dict
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return a_dict

    # 删除渠道
    @classmethod
    def delete_network_list(cls, network_id_list):
        try:
            # 过滤参数
            split_id_list = network_id_list.split(',')
            join_id_list = list()
            for user_id in split_id_list:
                if user_id != '':
                    join_id_list.append(user_id)
            if len(join_id_list) == 0:
                a_dict = dict()
                a_dict['success'] = 'false'
                a_dict['content'] = list()
                return json.dumps(a_dict)

            # 创建session
            session = sessionmaker(bind=cls.engine)()
            # 添加用户
            count = session.query(NetworkList).filter(NetworkList.id.in_(join_id_list)).delete(synchronize_session=False)
            # 关闭session
            session.commit()
            session.close()

            if count <= 0:
                a_dict = dict()
                a_dict['success'] = 'false'
                a_dict['content'] = list()
                return json.dumps(a_dict)

            # 返回成功
            a_dict = dict()
            a_dict['success'] = 'true'
            a_dict['content'] = join_id_list
            return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            return json.dumps(a_dict)

    # 获取用户信息
    @classmethod
    def get_user_info(cls, user_account):
        """
        :type user_account: str
        :rtype: UserList
        """
        try:
            # 创建session
            session = sessionmaker(bind=cls.engine)()
            # 查询用户
            values = session.query(UserList).filter(UserList.user_account == user_account)
            # 关闭session
            session.close()

            # 获取用户信息
            user = None
            for value in values:
                user = value
                break

            # 未查到用户
            if not user:
                Logger.error("user_account[%s] number[%s] != 0" % (user_account, len(values)))
                return None
            return user
        except:
            Logger.error(traceback.format_exc())
            return None
