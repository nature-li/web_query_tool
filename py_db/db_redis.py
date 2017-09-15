#!/usr/bin/env python2.7
# coding: utf-8

import redis
import traceback
import json
from datetime import datetime
from py_log.logger import Logger


class RedisFetcher(object):
    def __init__(self, redis_host, redis_port, redis_password):
        self.redis = redis.Redis(host=redis_host, port=redis_port, password=redis_password)

    def get_day_impression_click(self, ad_network_id, position_id, day):
        """
        :type ad_network_id: str
        :type position_id: str
        :type day: datetime
        :rtype: (int, int)
        """
        impression = None
        click = None
        try:
            dt = day.strftime("%Y%m%d")
            impression = self.redis.get('%s|%s|%s|2' % (ad_network_id, position_id, dt))
            click = self.redis.get('%s|%s|%s|3' % (ad_network_id, position_id, dt))
        except:
            Logger.error(traceback.format_exc())
        finally:
            if not impression:
                impression = 0
            impression = int(impression)

            if not click:
                click = 0
            click = int(click)
            return impression, click

    def get_hour_impression_click(self, ad_network_id, position_id, day, hour):
        """
        :type ad_network_id: str
        :type position_id: str
        :type day: datetime
        :type hour: str
        :rtype: (int, int)
        """
        impression = None
        click = None
        try:
            dt = day.strftime("%Y%m%d")
            impression = self.redis.get('%s|%s|%s%s|2' % (ad_network_id, position_id, dt, hour))
            click = self.redis.get('%s|%s|%s%s|3' % (ad_network_id, position_id, dt, hour))
        except:
            Logger.error(traceback.format_exc())
        finally:
            if not impression:
                impression = 0
            impression = int(impression)

            if not click:
                click = 0
            click = int(click)
            return impression, click

    def fetch(self, dt, ad_network_id, position_id):
        try:
            a_list = list()

            # 获取日期
            now = datetime.now()
            day = datetime.strptime(dt, '%Y-%m-%d')
            dt = day.strftime("%Y-%m-%d")

            # 获取小时数据
            for idx in xrange(0, 24):
                str_hour = '%02d' % idx
                impression, click = self.get_hour_impression_click(ad_network_id, position_id, day, str_hour)
                a_dict = dict()
                a_dict['dt'] = dt
                a_dict['hour'] = str_hour
                a_dict['ad_network_id'] = ad_network_id
                a_dict['position_id'] = position_id
                a_dict['pv'] = 0
                a_dict['impression'] = impression
                a_dict['click'] = click
                if impression != 0:
                    a_dict['ctr'] = '%.2f%%' % (100.0 * click / impression)
                else:
                    a_dict['ctr'] = "0.00%"
                a_dict['update_time'] = now.strftime('%Y-%m-%d %H:%M:%S')
                a_list.append(a_dict)

            # 获取天数据
            impression, click = self.get_day_impression_click(ad_network_id, position_id, day)
            a_dict = dict()
            a_dict['dt'] = dt
            a_dict['hour'] = '--'
            a_dict['ad_network_id'] = ad_network_id
            a_dict['position_id'] = position_id
            a_dict['pv'] = 0
            a_dict['impression'] = impression
            a_dict['click'] = click
            if impression != 0:
                a_dict['ctr'] = '%.2f%%' % (100.0 * click / impression)
            else:
                a_dict['ctr'] = "0.00%"
            a_dict['update_time'] = now.strftime('%Y-%m-%d %H:%M:%S')
            a_list.append(a_dict)

            # 返回结果
            a_dict = dict()
            a_dict['success'] = 'true'
            a_dict['content'] = a_list
            a_dict['item_count'] = len(a_list)
            return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = 'false'
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)


