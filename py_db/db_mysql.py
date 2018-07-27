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
    id = Column(Integer, primary_key=True, autoincrement=True)
    product = Column(String(128))
    layer = Column(String(128))
    position = Column(String(128))
    min_value = Column(Integer)
    max_value = Column(Integer)
    algo_id = Column(String(256))
    enable = Column(Integer, default=1)
    create_time = Column(TIMESTAMP, default=func.now())


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
    def add_experiment(cls, product, layer, position, min_value, max_value, algo_id, enable):
        try:
            item = Layer()
            item.product = product
            item.layer = layer
            item.position = position
            item.min_value = min_value
            item.max_value = max_value
            item.algo_id = algo_id
            item.enable = enable
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
    def query_experiment(cls, product, off_set, limit):
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
                count_query = session.query(Layer.id)
                value_query = session.query(Layer.id,
                                            Layer.product,
                                            Layer.layer,
                                            Layer.position,
                                            Layer.min_value,
                                            Layer.max_value,
                                            Layer.algo_id,
                                            Layer.enable,
                                            Layer.create_time)
                if product != '':
                    like_condition = '%' + product + '%'
                    count_query = count_query.filter(Layer.product.like(like_condition))
                    value_query = value_query.filter(Layer.product.like(like_condition))
                count = count_query.count()
                values = value_query[off_set: limit_count]

                # 返回结果
                a_layer_list = list()
                for value in values:
                    a_layer = dict()
                    a_layer_list.append(a_layer)
                    a_layer['id'] = value.id
                    a_layer['product'] = value.product
                    a_layer['layer'] = value.layer
                    a_layer['position'] = value.position
                    a_layer['min_value'] = value.min_value
                    a_layer['max_value'] = value.max_value
                    a_layer['algo_id'] = value.algo_id
                    a_layer['enable'] = value.enable
                    a_layer['create_time'] = value.create_time.strftime('%Y-%m-%d %H:%M:%S')

                # 返回成功
                a_dict = dict()
                a_dict['success'] = 'true'
                a_dict['content'] = a_layer_list
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
    def modify_experiment(cls, db_id, product, layer, position, min_value, max_value, algo_id, enable):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                item = session.query(Layer).filter(Layer.id == db_id).first()
                if not item:
                    Logger.error(traceback.format_exc())
                    a_dict = dict()
                    a_dict['success'] = False
                    a_dict['msg'] = 'db_id does not exist'
                    return json.dumps(a_dict)

                item.product = product
                item.layer = layer
                item.position = position
                item.min_value = min_value
                item.max_value = max_value
                item.algo_id = algo_id
                item.enable = enable
                session.commit()

                db_layer_list = session.query(Layer.id,
                                              Layer.product,
                                              Layer.layer,
                                              Layer.position,
                                              Layer.min_value,
                                              Layer.max_value,
                                              Layer.algo_id,
                                              Layer.enable,
                                              Layer.create_time).filter(Layer.id == db_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_layer_list) > 0:
                    item = db_layer_list[0]
                    a_layer = {
                        'id': item.id,
                        'product': item.product,
                        'layer': item.layer,
                        'position': item.position,
                        'min_value': item.min_value,
                        'max_value': item.max_value,
                        'algo_id': item.algo_id,
                        'enable': item.enable,
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
    def delete_experiment(cls, db_id):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(Layer).filter(Layer.id == db_id).delete(synchronize_session=False)
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
    def modify_experiment_status(cls, db_id, enable):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                item = session.query(Layer).filter(Layer.id == db_id).first()
                if not item:
                    Logger.error(traceback.format_exc())
                    a_dict = dict()
                    a_dict['success'] = False
                    a_dict['msg'] = 'db_id does not exist'
                    return json.dumps(a_dict)

                item.enable = enable
                session.commit()

                db_layer_list = session.query(Layer.id,
                                              Layer.product,
                                              Layer.layer,
                                              Layer.position,
                                              Layer.min_value,
                                              Layer.max_value,
                                              Layer.algo_id,
                                              Layer.enable,
                                              Layer.create_time).filter(Layer.id == db_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_layer_list) > 0:
                    item = db_layer_list[0]
                    a_layer = {
                        'id': item.id,
                        'product': item.product,
                        'layer': item.layer,
                        'position': item.position,
                        'min_value': item.min_value,
                        'max_value': item.max_value,
                        'algo_id': item.algo_id,
                        'enable': item.enable,
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