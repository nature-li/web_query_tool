#!/usr/bin/env python2.7
# coding: utf-8

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, BigInteger

Base = declarative_base()


# 日统计
class DayCount(Base):
    __tablename__ = 'day_count'
    id = Column(Integer, primary_key=True, autoincrement=True)
    ad_network_id = Column(String(255))
    dt = Column(String(32))
    pv = Column(Integer)
    impression = Column(Integer)
    click = Column(Integer)
    update_time = Column(BigInteger)


# 时统计
class HourCount(Base):
    __tablename__ = 'hour_count'
    id = Column(Integer, primary_key=True, autoincrement=True)
    ad_network_id = Column(String(255))
    ad_action = Column(String(32))
    dt = Column(String(32))
    hour = Column(String(32))
    pv = Column(Integer)
    impression = Column(Integer)
    click = Column(Integer)
    update_time = Column(BigInteger)


# 用户列表
class UserList(Base):
    __tablename__ = 'user_list'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_account = Column(String(255))
    user_right = Column(Integer)
    update_time = Column(BigInteger)


# 渠道列表
class NetworkList(Base):
    __tablename__ = 'network_list'
    id = Column(Integer, primary_key=True, autoincrement=True)
    network = Column(String(255))
    update_time = Column(BigInteger)