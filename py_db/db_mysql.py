#!/usr/bin/env python2.7
# coding: utf-8

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, BigInteger, Float, TIMESTAMP, PrimaryKeyConstraint, UniqueConstraint, Date, DateTime
from sqlalchemy.sql import func
from sqlalchemy import create_engine
from sqlalchemy import or_, not_, and_, exists
from sqlalchemy.orm import sessionmaker
from urllib import quote_plus as urlquote
from config import config
import traceback
import json
import datetime
from py_log.logger import Logger

Base = declarative_base()


# 实验层
class Layer(Base):
    __tablename__ = 'layer'
    id = Column(String(64), primary_key=True)
    business = Column(String(64), primary_key=True)
    name = Column(String(128))
    desc = Column(String(256), nullable=True)
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('business', 'name')


# 配置项
class CfgItem(Base):
    __tablename__ = 'cfg_item'
    id = Column(String(64), primary_key=True)
    business = Column(String(64), primary_key=True)
    layer_id = Column(String(64))
    name = Column(String(128))
    position = Column(String(4096))
    start_value = Column(Integer)
    stop_value = Column(Integer)
    algo_request = Column(String(256))
    algo_response = Column(String(256))
    status = Column(Integer, default=0)
    desc = Column(String(256), nullable=True)
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('business', 'name')


# 实验
class Experiment(Base):
    __tablename__ = 'experiment'
    id = Column(String(64), primary_key=True)
    business = Column(String(64), primary_key=True)
    layer_id = Column(String(64))
    name = Column(String(64))
    status = Column(Integer, default=0)
    desc = Column(String(256), nullable=True)
    create_time = Column(TIMESTAMP, default=func.now())
    online_time = Column(TIMESTAMP)
    UniqueConstraint('business', 'name')


# 实验和配置关联关系
class Exp2Cfg(Base):
    __tablename__ = 'cfg_2_exp'
    id = Column(Integer, primary_key=True, autoincrement=True)
    layer_id = Column(String(64))
    business = Column(String(64))
    cfg_id = Column(String(64))
    exp_id = Column(String(64))
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('business', 'layer_id', 'cfg_id', 'exp_id')


# 实验位置
class ExpPosition(Base):
    __tablename__ = 'position'
    id = Column(Integer, primary_key=True, autoincrement=True)
    position = Column(String(32))
    desc = Column(String(256), nullable=True)
    create_time = Column(TIMESTAMP, default=func.now())


# 业务
class Business(Base):
    __tablename__ = 'business'
    id = Column(String(64), primary_key=True)
    name = Column(String(64))
    desc = Column(String(256), nullable=True)
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
    def add_cfg_item(cls, bns_id, item_id, layer_id, cfg_name, position, start_value, stop_value, algo_request, algo_response, status, desc):
        try:
            item = CfgItem()
            item.id = item_id
            item.business = bns_id
            item.layer_id = layer_id
            item.name = cfg_name
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

                db_item_list = session.query(CfgItem.id,
                                             CfgItem.business,
                                             CfgItem.layer_id,
                                             CfgItem.name,
                                             CfgItem.position,
                                             CfgItem.start_value,
                                             CfgItem.stop_value,
                                             CfgItem.algo_request,
                                             CfgItem.algo_response,
                                             CfgItem.status,
                                             CfgItem.desc,
                                             CfgItem.create_time).filter(
                    CfgItem.business == bns_id, CfgItem.id == item_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_item_list) > 0:
                    item = db_item_list[0]
                    a_layer = {
                        'id': item.id,
                        'bns_id': item.business,
                        'layer_id': item.layer_id,
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
            a_dict['msg'] = 'INSERT INTO db ERROR'
            return json.dumps(a_dict)

    # query cfg
    @classmethod
    def query_cfg_item(cls, bns_id, layer_id, cfg_id, cfg_name, off_set, limit):
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
                                            CfgItem.business,
                                            CfgItem.layer_id,
                                            CfgItem.name,
                                            CfgItem.position,
                                            CfgItem.start_value,
                                            CfgItem.stop_value,
                                            CfgItem.algo_request,
                                            CfgItem.algo_response,
                                            CfgItem.status,
                                            CfgItem.desc,
                                            CfgItem.create_time)

                if bns_id:
                    count_query = count_query.filter(CfgItem.business == bns_id)
                    value_query = value_query.filter(CfgItem.business == bns_id)

                if cfg_id:
                    count_query = count_query.filter(CfgItem.id == cfg_id)
                    value_query = value_query.filter(CfgItem.id == cfg_id)

                if layer_id:
                    count_query = count_query.filter(CfgItem.layer_id == layer_id)
                    value_query = value_query.filter(CfgItem.layer_id == layer_id)

                if cfg_name:
                    like_condition = '%' + cfg_name + '%'
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
                    a_item['bns_id'] = value.business
                    a_item['layer_id'] = value.layer_id
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
    def modify_cfg_item(cls, bns_id, item_id, layer_id, cfg_name, position, start_value, stop_value, algo_request, algo_response, status, desc):
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

                item.name = cfg_name
                item.business = bns_id
                item.layer_id = layer_id
                item.position = position
                item.start_value = start_value
                item.stop_value = stop_value
                item.algo_request = algo_request
                item.algo_response = algo_response
                item.status = status
                item.desc = desc
                session.commit()

                db_item_list = session.query(CfgItem.id,
                                             CfgItem.business,
                                             CfgItem.layer_id,
                                             CfgItem.name,
                                             CfgItem.position,
                                             CfgItem.start_value,
                                             CfgItem.stop_value,
                                             CfgItem.algo_request,
                                             CfgItem.algo_response,
                                             CfgItem.status,
                                             CfgItem.desc,
                                             CfgItem.create_time).filter(
                    CfgItem.id == item_id, CfgItem.business == bns_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_item_list) > 0:
                    item = db_item_list[0]
                    a_layer = {
                        'id': item.id,
                        'bns_id': item.business,
                        'layer_id': item.layer_id,
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
    def delete_cfg_item(cls, bns_id, item_id):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(CfgItem).filter(
                    CfgItem.business == bns_id,
                    CfgItem.id == item_id).filter(
                    ~exists().where(Exp2Cfg.business == bns_id,
                                    Exp2Cfg.cfg_id == item_id)).delete(synchronize_session=False)
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
    def modify_cfg_item_status(cls, bns_id, item_id, status):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                item = session.query(CfgItem).filter(CfgItem.business == bns_id, CfgItem.id == item_id).first()
                if not item:
                    Logger.error(traceback.format_exc())
                    a_dict = dict()
                    a_dict['success'] = False
                    a_dict['msg'] = 'item_id does not exist'
                    return json.dumps(a_dict)

                item.status = status
                session.commit()

                db_item_list = session.query(CfgItem.id,
                                             CfgItem.business,
                                             CfgItem.layer_id,
                                             CfgItem.name,
                                             CfgItem.position,
                                             CfgItem.start_value,
                                             CfgItem.stop_value,
                                             CfgItem.algo_request,
                                             CfgItem.algo_response,
                                             CfgItem.status,
                                             CfgItem.desc,
                                             CfgItem.create_time).filter(
                    CfgItem.business == bns_id,
                    CfgItem.id == item_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_item_list) > 0:
                    item = db_item_list[0]
                    a_layer = {
                        'id': item.id,
                        'bns_id': item.business,
                        'layer_id': item.layer_id,
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
    def query_layer(cls, bns_id, layer_id, off_set, limit):
        try:
            off_set = int(off_set)
            limit = int(limit)
            if limit == -1:
                limit_count = None
            else:
                limit_count = off_set + limit

            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                count_query = session.query(Layer.id)
                value_query = session.query(Layer.id,
                                            Layer.name,
                                            Layer.business,
                                            Layer.desc,
                                            Layer.create_time)

                # 条件查询
                if bns_id:
                    count_query = count_query.filter(Layer.business == bns_id)
                    value_query = value_query.filter(Layer.business == bns_id)
                if layer_id:
                    count_query = count_query.filter(Layer.id == layer_id)
                    value_query = value_query.filter(Layer.id == layer_id)

                count = count_query.count()
                values = value_query[off_set: limit_count]

                # 返回结果
                a_layer_list = list()
                for value in values:
                    a_layer = dict()
                    a_layer_list.append(a_layer)
                    a_layer['id'] = value.id
                    a_layer['name'] = value.name
                    a_layer['bns_id'] = value.business
                    a_layer['desc'] = value.desc
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

    # query experiment
    @classmethod
    def query_experiment(cls, bns_id, layer_id, exp_id, off_set, limit):
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
                count_query = session.query(Experiment.id)
                value_query = session.query(Experiment.id,
                                            Experiment.business,
                                            Experiment.layer_id,
                                            Experiment.name,
                                            Experiment.status,
                                            Experiment.online_time,
                                            Experiment.desc,
                                            Experiment.create_time)
                if bns_id:
                    count_query = count_query.filter(Experiment.business == bns_id)
                    value_query = value_query.filter(Experiment.business == bns_id)

                if layer_id:
                    count_query = count_query.filter(Experiment.layer_id == layer_id)
                    value_query = value_query.filter(Experiment.layer_id == layer_id)

                if exp_id:
                    count_query = count_query.filter(Experiment.id == exp_id)
                    value_query = value_query.filter(Experiment.id == exp_id)

                count = count_query.count()
                values = value_query[off_set: limit_count]

                # 返回结果
                a_exp_list = list()
                for value in values:
                    a_item = dict()
                    a_exp_list.append(a_item)
                    a_item['id'] = value.id
                    a_item['bns_id'] = value.business
                    a_item['layer_id'] = value.layer_id
                    a_item['name'] = value.name
                    a_item['status'] = value.status
                    a_item['online_time'] = value.online_time.strftime('%Y-%m-%d %H:%M:%S')
                    a_item['desc'] = value.desc
                    a_item['create_time'] = value.create_time.strftime('%Y-%m-%d %H:%M:%S')

                # 返回成功
                a_dict = dict()
                a_dict['success'] = 'true'
                a_dict['content'] = a_exp_list
                a_dict['item_count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    @classmethod
    def put_cfg_relation(cls, bns_id, layer_id, item_id, exp_id_list):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # Delete old relation
                session.query(Exp2Cfg).filter(Exp2Cfg.business == bns_id,
                                              Exp2Cfg.layer_id == layer_id,
                                              Exp2Cfg.cfg_id == item_id).delete(synchronize_session=False)
                session.commit()

                # Insert new relation
                relation_list = list()
                for exp_id in exp_id_list:
                    exp_2_item = Exp2Cfg()
                    relation_list.append(exp_2_item)
                    exp_2_item.business = bns_id
                    exp_2_item.layer_id = layer_id
                    exp_2_item.cfg_id = item_id
                    exp_2_item.exp_id = exp_id
                session.bulk_save_objects(relation_list)
                session.commit()

                db_item_list = session.query(Exp2Cfg.id,
                                             Exp2Cfg.business,
                                             Exp2Cfg.layer_id,
                                             Exp2Cfg.cfg_id,
                                             Exp2Cfg.exp_id,
                                             Exp2Cfg.create_time).filter(
                    Exp2Cfg.layer_id == layer_id,
                    Exp2Cfg.cfg_id == item_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_item_list) > 0:
                    item = db_item_list[0]
                    a_layer = {
                        'id': item.id,
                        'bns_id': item.business,
                        'layer_id': item.layer_id,
                        'item_id': item.cfg_id,
                        'exp_id': item.exp_id,
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
    def query_cfg_relation(cls, bns_id, layer_id, cfg_id, exp_id, off_set, limit):
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
                count_query = session.query(Exp2Cfg.id)
                value_query = session.query(Exp2Cfg.id,
                                            Exp2Cfg.business,
                                            Exp2Cfg.layer_id,
                                            Exp2Cfg.cfg_id,
                                            Exp2Cfg.exp_id,
                                            Experiment.name.label('exp_name'),
                                            Experiment.desc,
                                            Exp2Cfg.create_time).join(Experiment,
                                                                      Experiment.id == Exp2Cfg.exp_id)

                if bns_id:
                    count_query = count_query.filter(Exp2Cfg.business == bns_id)
                    value_query = value_query.filter(Exp2Cfg.business == bns_id)

                if layer_id:
                    count_query = count_query.filter(Exp2Cfg.layer_id == layer_id)
                    value_query = value_query.filter(Exp2Cfg.layer_id == layer_id)

                if cfg_id:
                    count_query = count_query.filter(Exp2Cfg.cfg_id == cfg_id)
                    value_query = value_query.filter(Exp2Cfg.cfg_id == cfg_id)

                if exp_id:
                    count_query = count_query.filter(Exp2Cfg.exp_id == exp_id)
                    value_query = value_query.filter(Exp2Cfg.exp_id == exp_id)

                count = count_query.count()
                values = value_query[off_set: limit_count]

                # 返回结果
                a_exp_list = list()
                for value in values:
                    a_item = dict()
                    a_exp_list.append(a_item)
                    a_item['id'] = value.id
                    a_item['bns_id'] = value.business
                    a_item['layer_id'] = value.layer_id
                    a_item['cfg_id'] = value.cfg_id
                    a_item['exp_id'] = value.exp_id
                    a_item['exp_name'] = value.exp_name
                    a_item['desc'] = value.desc
                    a_item['create_time'] = value.create_time.strftime('%Y-%m-%d %H:%M:%S')

                # 返回成功
                a_dict = dict()
                a_dict['success'] = 'true'
                a_dict['content'] = a_exp_list
                a_dict['item_count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    @classmethod
    def delete_relation(cls, bns_id, layer_id, cfg_id, exp_id):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(Exp2Cfg).filter(
                    Exp2Cfg.business == bns_id,
                    Exp2Cfg.layer_id == layer_id,
                    Exp2Cfg.cfg_id == cfg_id,
                    Exp2Cfg.exp_id == exp_id).delete(synchronize_session=False)
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

    @classmethod
    def query_exp_relation(cls, bns_id, layer_id, exp_id, cfg_id, off_set, limit):
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
                count_query = session.query(Exp2Cfg.id)
                value_query = session.query(Exp2Cfg.id,
                                            Exp2Cfg.business,
                                            Exp2Cfg.layer_id,
                                            Exp2Cfg.cfg_id,
                                            Exp2Cfg.exp_id,
                                            CfgItem.name,
                                            CfgItem.position,
                                            CfgItem.start_value,
                                            CfgItem.stop_value,
                                            CfgItem.algo_request,
                                            CfgItem.algo_response,
                                            CfgItem.status,
                                            CfgItem.desc,
                                            Exp2Cfg.create_time).join(CfgItem,
                                                                      CfgItem.id == Exp2Cfg.cfg_id)

                if bns_id:
                    count_query = count_query.filter(Exp2Cfg.business == bns_id)
                    value_query = value_query.filter(Exp2Cfg.business == bns_id)

                if layer_id:
                    count_query = count_query.filter(Exp2Cfg.layer_id == layer_id)
                    value_query = value_query.filter(Exp2Cfg.layer_id == layer_id)

                if cfg_id:
                    count_query = count_query.filter(Exp2Cfg.cfg_id == cfg_id)
                    value_query = value_query.filter(Exp2Cfg.cfg_id == cfg_id)

                if exp_id:
                    count_query = count_query.filter(Exp2Cfg.exp_id == exp_id)
                    value_query = value_query.filter(Exp2Cfg.exp_id == exp_id)

                count = count_query.count()
                values = value_query[off_set: limit_count]

                # 返回结果
                a_cfg_list = list()
                for value in values:
                    a_item = dict()
                    a_cfg_list.append(a_item)
                    a_item['id'] = value.id
                    a_item['bns_id'] = value.business
                    a_item['layer_id'] = value.layer_id
                    a_item['cfg_id'] = value.cfg_id
                    a_item['exp_id'] = value.exp_id
                    a_item['cfg_name'] = value.name
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
                a_dict['content'] = a_cfg_list
                a_dict['item_count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    @classmethod
    def add_one_exp(cls, bns_id, layer_id, exp_id, exp_name, exp_status, online_time, exp_desc):
        try:
            exp = Experiment()
            exp.business = bns_id
            exp.layer_id = layer_id
            exp.id = exp_id
            exp.name = exp_name
            exp.status = exp_status
            exp.online_time = datetime.datetime.strptime(online_time, '%Y-%m-%d %H:%M:%S')
            exp.desc = exp_desc
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.add(exp)
                session.commit()

                db_exp_list = session.query(Experiment.id,
                                            Experiment.business,
                                            Experiment.layer_id,
                                            Experiment.name,
                                            Experiment.status,
                                            Experiment.online_time,
                                            Experiment.desc,
                                            Experiment.create_time).filter(Experiment.id == exp_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_exp_list) > 0:
                    item = db_exp_list[0]
                    a_exp = {
                        'bns_id': item.business,
                        'layer_id': item.layer_id,
                        'id': item.id,
                        'name': item.name,
                        'status': item.status,
                        'online_time': item.online_time.strftime('%Y-%m-%d %H:%M:%S'),
                        'desc': item.desc,
                        'create_time': item.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    content.append(a_exp)
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'INSERT INTO db ERROR'
            return json.dumps(a_dict)

    @classmethod
    def modify_exp_status(cls, bns_id, exp_id, exp_status):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                exp = session.query(Experiment).filter(Experiment.business == bns_id, Experiment.id == exp_id).first()
                if not exp:
                    Logger.error(traceback.format_exc())
                    a_dict = dict()
                    a_dict['success'] = False
                    a_dict['msg'] = 'cfg_id does not exist'
                    return json.dumps(a_dict)

                exp.status = exp_status
                session.commit()

                db_exp_list = session.query(Experiment.id,
                                            Experiment.business,
                                            Experiment.layer_id,
                                            Experiment.name,
                                            Experiment.status,
                                            Experiment.online_time,
                                            Experiment.desc,
                                            Experiment.create_time).filter(Experiment.id == exp_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_exp_list) > 0:
                    item = db_exp_list[0]
                    a_exp = {
                        'bns_id': item.business,
                        'layer_id': item.layer_id,
                        'id': item.id,
                        'name': item.name,
                        'status': item.status,
                        'online_time': item.online_time.strftime('%Y-%m-%d %H:%M:%S'),
                        'desc': item.desc,
                        'create_time': item.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    content.append(a_exp)
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'update db failed'
            return json.dumps(a_dict)

    @classmethod
    def modify_experiment(cls, bns_id, layer_id, exp_id, exp_name, exp_status, online_time, exp_desc):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                exp = session.query(Experiment).filter(Experiment.id == exp_id).first()
                if not exp:
                    Logger.error(traceback.format_exc())
                    a_dict = dict()
                    a_dict['success'] = False
                    a_dict['msg'] = 'db_id does not exist'
                    return json.dumps(a_dict)

                exp.name = exp_name
                exp.business = bns_id
                exp.layer_id = layer_id
                exp.status = exp_status
                exp.online_time = online_time
                exp.desc = exp_desc
                session.commit()

                db_exp_list = session.query(Experiment.id,
                                            Experiment.business,
                                            Experiment.layer_id,
                                            Experiment.name,
                                            Experiment.status,
                                            Experiment.online_time,
                                            Experiment.desc,
                                            Experiment.create_time).filter(Experiment.id == exp_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_exp_list) > 0:
                    item = db_exp_list[0]
                    a_exp = {
                        'bns_id': item.business,
                        'layer_id': item.layer_id,
                        'id': item.id,
                        'name': item.name,
                        'status': item.status,
                        'online_time': item.online_time.strftime('%Y-%m-%d %H:%M:%S'),
                        'desc': item.desc,
                        'create_time': item.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    content.append(a_exp)
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'update db failed'
            return json.dumps(a_dict)

    @classmethod
    def delete_experiment(cls, bns_id, exp_id):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(Experiment).filter(
                    Experiment.business == bns_id,
                    Experiment.id == exp_id).filter(
                    ~exists().where(Exp2Cfg.business == bns_id, Exp2Cfg.exp_id == exp_id)).delete(synchronize_session=False)
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

    @classmethod
    def put_exp_relation(cls, bns_id, layer_id, exp_id, cfg_id_list):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # Delete old relation
                session.query(Exp2Cfg).filter(Exp2Cfg.business == bns_id,
                                              Exp2Cfg.layer_id == layer_id,
                                              Exp2Cfg.exp_id == exp_id).delete(synchronize_session=False)
                session.commit()

                # Insert new relation
                relation_list = list()
                for cfg_id in cfg_id_list:
                    exp_2_item = Exp2Cfg()
                    relation_list.append(exp_2_item)
                    exp_2_item.business = bns_id
                    exp_2_item.layer_id = layer_id
                    exp_2_item.cfg_id = cfg_id
                    exp_2_item.exp_id = exp_id
                session.bulk_save_objects(relation_list)
                session.commit()

                db_item_list = session.query(Exp2Cfg.id,
                                             Exp2Cfg.business,
                                             Exp2Cfg.layer_id,
                                             Exp2Cfg.cfg_id,
                                             Exp2Cfg.exp_id,
                                             Exp2Cfg.create_time).filter(
                    Exp2Cfg.business == bns_id,
                    Exp2Cfg.layer_id == layer_id,
                    Exp2Cfg.exp_id == exp_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_item_list) > 0:
                    item = db_item_list[0]
                    a_layer = {
                        'id': item.id,
                        'bns_id': item.business,
                        'layer_id': item.layer_id,
                        'cfg_id': item.cfg_id,
                        'exp_id': item.exp_id,
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
    def query_exp_position(cls, off_set, limit):
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
                count_query = session.query(ExpPosition.id)
                value_query = session.query(ExpPosition.id,
                                            ExpPosition.position,
                                            ExpPosition.desc,
                                            ExpPosition.create_time)
                count = count_query.count()
                values = value_query[off_set: limit_count]

                # 返回结果
                a_item_list = list()
                for value in values:
                    a_item = dict()
                    a_item_list.append(a_item)
                    a_item['id'] = value.id
                    a_item['position'] = value.position
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

    @classmethod
    def check_cfg_id_exist(cls, bns_id, cfg_id):
        try:
            # 创建session
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                count_query = session.query(CfgItem.id).filter(CfgItem.business == bns_id, CfgItem.id == cfg_id)
                count = count_query.count()

                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['count'] = -1
            return json.dumps(a_dict)

    @classmethod
    def check_cfg_name_exist(cls, bns_id, cfg_id, cfg_name):
        try:
            # 创建session
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                count_query = session.query(CfgItem.name).filter(CfgItem.name == cfg_name)
                if cfg_id:
                    count_query = count_query.filter(CfgItem.business == bns_id, CfgItem.id != cfg_id)
                count = count_query.count()

                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['count'] = -1
            return json.dumps(a_dict)

    @classmethod
    def check_exp_id_exist(cls, bns_id, exp_id):
        try:
            # 创建session
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                count_query = session.query(Experiment.id).filter(Experiment.business == bns_id, Experiment.id == exp_id)
                count = count_query.count()

                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['count'] = -1
            return json.dumps(a_dict)

    @classmethod
    def check_exp_name_exist(cls, bns_id, exp_id, exp_name):
        try:
            # 创建session
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                count_query = session.query(Experiment.name).filter(Experiment.business == bns_id, Experiment.name == exp_name)
                if exp_id:
                    count_query = count_query.filter(Experiment.id != exp_id)
                count = count_query.count()

                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['count'] = -1
            return json.dumps(a_dict)

    @classmethod
    def position_overlap(cls, left, right):
        """
        :type left: set[str]
        :type right: set[str]
        """
        try:
            if '*' in left or '*' in right:
                return True
            result = left & right
            if len(result) > 0:
                return True
            return False
        except:
            Logger.error(traceback.format_exc())
            return None

    @classmethod
    def check_range_conflict(cls, bns_id, layer_id, check_position, start_value, stop_value):
        try:
            if start_value:
                start_value = int(start_value)
            else:
                stop_value = None

            if stop_value:
                stop_value = int(stop_value)
            else:
                stop_value = None
            position_set = set(check_position.split(','))
            Logger.info("position_set: " + str(position_set))

            # 创建session
            exist_range = list()
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                values = session.query(CfgItem.position, CfgItem.start_value, CfgItem.stop_value).filter(
                    CfgItem.business == bns_id, CfgItem.layer_id == layer_id).all()
                for value in values:
                    exist_range.append((value.position, value.start_value, value.stop_value))

            conflict = False
            for item in exist_range:
                # 判断 position 是否有交集
                (position, start, end) = item
                a_set = set(position.split(','))
                Logger.info("a_set: " + str(a_set))
                if not cls.position_overlap(position_set, a_set):
                    continue

                if start_value is not None:
                    if start <= start_value <= end:
                        Logger.info(str(item))
                        conflict = True
                        break
                if stop_value is not None:
                    if start <= stop_value <= end:
                        Logger.info(str(item))
                        conflict = True
                        break
                if start_value is not None and stop_value is not None:
                    if start_value <= start <= stop_value:
                        Logger.info(str(item))
                        conflict = True
                        break
                    if start_value <= end <= stop_value:
                        Logger.info(str(item))
                        conflict = True
                        break
                Logger.info(str(item))

            # 返回成功
            a_dict = dict()
            a_dict['success'] = True
            a_dict['conflict'] = conflict
            return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['conflict'] = False
            return json.dumps(a_dict)

    @classmethod
    def query_business(cls, bns_id, off_set, limit):
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
                count_query = session.query(Business.id)
                value_query = session.query(Business.id,
                                            Business.name,
                                            Business.desc,
                                            Business.create_time)
                # 条件查询
                if bns_id:
                    count_query = count_query.filter(Business.id == bns_id)
                    value_query = value_query.filter(Business.id == bns_id)

                # 获取查询结果
                count = count_query.count()
                values = value_query[off_set: limit_count]

                # 返回结果
                a_item_list = list()
                for value in values:
                    a_item = dict()
                    a_item_list.append(a_item)
                    a_item['id'] = value.id
                    a_item['name'] = value.name
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

    @classmethod
    def add_one_bns(cls, bns_id, bns_name, bns_desc):
        try:
            bns = Business()
            bns.id = bns_id
            bns.name = bns_name
            bns.desc = bns_desc
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.add(bns)
                session.commit()

                db_bns_list = session.query(Business.id,
                                            Business.name,
                                            Business.desc,
                                            Business.create_time).filter(Business.id == bns_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_bns_list) > 0:
                    item = db_bns_list[0]
                    a_exp = {
                        'id': item.id,
                        'name': item.name,
                        'desc': item.desc,
                        'create_time': item.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    content.append(a_exp)
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'INSERT INTO db ERROR'
            return json.dumps(a_dict)

    @classmethod
    def add_one_layer(cls, bns_id, layer_id, layer_name, layer_desc):
        try:
            layer = Layer()
            layer.id = layer_id
            layer.business = bns_id
            layer.name = layer_name
            layer.desc = layer_desc

            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.add(layer)
                session.commit()

                db_layer_list = session.query(Layer.id,
                                              Layer.name,
                                              Layer.business,
                                              Layer.desc,
                                              Layer.create_time).filter(
                    Layer.business == bns_id, Layer.id == layer_id)[:]

                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_layer_list) > 0:
                    item = db_layer_list[0]
                    a_exp = {
                        'id': item.id,
                        'bns_id': item.business,
                        'name': item.name,
                        'desc': item.desc,
                        'create_time': item.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    content.append(a_exp)
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'INSERT INTO db ERROR'
            return json.dumps(a_dict)

    @classmethod
    def delete_one_layer(cls, bns_id, layer_id):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(Layer).filter(
                    Layer.business == bns_id,
                    Layer.id == layer_id).filter(
                    ~exists().where(or_(and_(Experiment.business == bns_id, Experiment.layer_id == layer_id),
                                        and_(CfgItem.business == bns_id, CfgItem.layer_id == layer_id))
                                    )).delete(synchronize_session=False)
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
