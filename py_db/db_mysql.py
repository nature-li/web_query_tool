#!/usr/bin/env python2.7
# coding: utf-8

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, BigInteger, Float, TIMESTAMP, UniqueConstraint, Date, DateTime
from sqlalchemy.sql import func
from sqlalchemy import create_engine
from sqlalchemy import or_, not_, and_
from sqlalchemy.orm import sessionmaker
from urllib import quote_plus as urlquote
from config import config
import traceback
import json
from py_log.logger import Logger

Base = declarative_base()


# 实验平台
class Layer(Base):
    __tablename__ = 'layer'
    id = Column(String(64), primary_key=True)
    name = Column(String(128))
    business = Column(String(64))
    desc = Column(String(256))
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('name', 'business')


class CfgItem(Base):
    __tablename__ = 'cfg_item'
    id = Column(String(64), primary_key=True)
    name = Column(String(128))
    position = Column(String(4096))
    start_value = Column(Integer)
    stop_value = Column(Integer)
    algo_request = Column(String(256))
    algo_response = Column(String(256))
    status = Column(Integer, default=0)
    desc = Column(String(256))
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('name')


class Defer(object):
    def __init__(self, fn, args=None):
        self.fn = fn
        self.args = args

    def __enter__(self):
        pass

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.args:
            self.fn(self.args)
        else:
            self.fn()


class MysqlOperator(object):
    engine = None

    @classmethod
    def init(cls):
        try:
            server_db_uri = 'mysql+mysqldb://%s:%s@%s:%s/%s?charset=utf8' \
                            % (config.server_mysql_user, urlquote(config.server_mysql_pwd), config.server_mysql_host, config.server_mysql_port,
                               config.server_mysql_db)
            cls.engine = create_engine(server_db_uri, echo=False, pool_recycle=3600, pool_size=10)
            return True
        except:
            Logger.error(traceback.format_exc())

    # add experiment
    @classmethod
    def add_cfg_item(cls, item_id, item_name, position, start_value, stop_value, algo_request, algo_response, status, desc):
        try:
            item = CfgItem()
            item.id = item_id
            item.name = item_name
            item.position = position
            item.start_value = start_value
            item.stop_value = stop_value
            item.algo_request = algo_request
            item.algo_response = algo_response
            item.status = status
            item.desc = desc
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.add(item)
                session.flush()
                session.commit()

                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'INSERT INTO db ERROR'
            return json.dumps(a_dict)

    # query experiment
    @classmethod
    def query_cfg_item(cls, item_name, off_set, limit):
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
            with Defer(session.close):
                # 查询数据
                count_query = session.query(CfgItem.id)
                value_query = session.query(CfgItem.id,
                                            CfgItem.name,
                                            CfgItem.position,
                                            CfgItem.start_value,
                                            CfgItem.stop_value,
                                            CfgItem.algo_request,
                                            CfgItem.algo_response,
                                            CfgItem.status,
                                            CfgItem.desc,
                                            CfgItem.create_time)
                if item_name != '':
                    like_condition = '%' + item_name + '%'
                    count_query = count_query.filter(CfgItem.name.like(like_condition))
                    value_query = value_query.filter(CfgItem.name.like(like_condition))
                count = count_query.count()
                values = value_query[off_set: limit_count]

                # 返回结果
                a_item_list = list()
                for value in values:
                    a_item = dict()
                    a_item_list.append(a_item)
                    a_item['id'] = value.id
                    a_item['name'] = value.name
                    a_item['position'] = value.position
                    a_item['start_value'] = value.start_value
                    a_item['stop_value'] = value.stop_value
                    a_item['algo_request'] = value.algo_request
                    a_item['algo_response'] = value.algo_response
                    a_item['status'] = value.status
                    a_item['desc'] = value.desc
                    a_item['create_time'] = value.create_time.strftime('%Y-%m-%d %H:%M:%S')

                # 返回成功
                a_dict = dict()
                a_dict['success'] = 'true'
                a_dict['content'] = a_item_list
                a_dict['item_count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    # modify experiment
    @classmethod
    def modify_cfg_item(cls, item_id, item_name, position, start_value, stop_value, algo_request, algo_response, status, desc):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                item = session.query(CfgItem).filter(CfgItem.id == item_id).first()
                if not item:
                    Logger.error(traceback.format_exc())
                    a_dict = dict()
                    a_dict['success'] = False
                    a_dict['msg'] = 'db_id does not exist'
                    return json.dumps(a_dict)

                item.name = item_name
                item.position = position
                item.start_value = start_value
                item.stop_value = stop_value
                item.algo_request = algo_request
                item.algo_response = algo_response
                item.status = status
                item.desc = desc
                session.commit()

                db_item_list = session.query(CfgItem.id,
                                             CfgItem.name,
                                             CfgItem.position,
                                             CfgItem.start_value,
                                             CfgItem.stop_value,
                                             CfgItem.algo_request,
                                             CfgItem.algo_response,
                                             CfgItem.status,
                                             CfgItem.desc,
                                             CfgItem.create_time).filter(CfgItem.id == item_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_item_list) > 0:
                    item = db_item_list[0]
                    a_layer = {
                        'id': item.id,
                        'name': item.name,
                        'position': item.position,
                        'start_value': item.start_value,
                        'stop_value': item.stop_value,
                        'algo_request': item.algo_request,
                        'algo_response': item.algo_response,
                        'status': item.status,
                        'desc': item.desc,
                        'create_time': item.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    content.append(a_layer)
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'update db failed'
            return json.dumps(a_dict)

    # delete experiment
    @classmethod
    def delete_cfg_item(cls, item_id):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(CfgItem).filter(CfgItem.id == item_id).delete(synchronize_session=False)
                session.commit()

                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'delete db failed'
            return json.dumps(a_dict)

    # modify experiment
    @classmethod
    def modify_cfg_item_status(cls, item_id, status):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                item = session.query(CfgItem).filter(CfgItem.id == item_id).first()
                if not item:
                    Logger.error(traceback.format_exc())
                    a_dict = dict()
                    a_dict['success'] = False
                    a_dict['msg'] = 'item_id does not exist'
                    return json.dumps(a_dict)

                item.status = status
                session.commit()

                db_item_list = session.query(CfgItem.id,
                                             CfgItem.name,
                                             CfgItem.position,
                                             CfgItem.start_value,
                                             CfgItem.stop_value,
                                             CfgItem.algo_request,
                                             CfgItem.algo_response,
                                             CfgItem.status,
                                             CfgItem.desc,
                                             CfgItem.create_time).filter(CfgItem.id == item_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_item_list) > 0:
                    item = db_item_list[0]
                    a_layer = {
                        'id': item.id,
                        'name': item.name,
                        'position': item.position,
                        'start_value': item.start_value,
                        'stop_value': item.stop_value,
                        'algo_request': item.algo_request,
                        'algo_response': item.algo_response,
                        'status': item.status,
                        'desc': item.desc,
                        'create_time': item.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    content.append(a_layer)
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'update db failed'
            return json.dumps(a_dict)

    @classmethod
    def query_layer(cls):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                count_query = session.query(CfgItem.id)
                value_query = session.query(CfgItem.id,
                                            CfgItem.name,
                                            CfgItem.position,
                                            CfgItem.start_value,
                                            CfgItem.stop_value,
                                            CfgItem.algo_request,
                                            CfgItem.algo_response,
                                            CfgItem.status,
                                            CfgItem.desc,
                                            CfgItem.create_time)
                if item_name != '':
                    like_condition = '%' + item_name + '%'
                    count_query = count_query.filter(CfgItem.name.like(like_condition))
                    value_query = value_query.filter(CfgItem.name.like(like_condition))
                count = count_query.count()
                values = value_query[off_set: limit_count]

                # 返回结果
                a_item_list = list()
                for value in values:
                    a_item = dict()
                    a_item_list.append(a_item)
                    a_item['id'] = value.id
                    a_item['name'] = value.name
                    a_item['position'] = value.position
                    a_item['start_value'] = value.start_value
                    a_item['stop_value'] = value.stop_value
                    a_item['algo_request'] = value.algo_request
                    a_item['algo_response'] = value.algo_response
                    a_item['status'] = value.status
                    a_item['desc'] = value.desc
                    a_item['create_time'] = value.create_time.strftime('%Y-%m-%d %H:%M:%S')

                # 返回成功
                a_dict = dict()
                a_dict['success'] = 'true'
                a_dict['content'] = a_item_list
                a_dict['item_count'] = count
                return json.dumps(a_dict)
        except:
            pass
