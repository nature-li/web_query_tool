#!/usr/bin/env python2.7
# coding: utf-8

import redis
import traceback
import json
from datetime import datetime
from datetime import timedelta
import random
from py_log.logger import Logger
from config import config


class RedisFetcher(object):
    def __init__(self, redis_host, redis_port, redis_password):
        self.redis = redis.Redis(host=redis_host, port=redis_port, password=redis_password)

    def get_day_position_impression_click(self, ad_network_id, position_id, day):
        """
        :type ad_network_id: str
        :type position_id: str
        :type day: datetime
        :rtype: (int, int)
        """
        if config.server_local_fake:
            return self.__get_random_data()

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

    def get_day_impression_click(self, ad_network_id, day):
        """
        :type ad_network_id: str
        :type day: datetime
        :rtype: (int, int)
        """
        if config.server_local_fake:
            return self.__get_random_data()

        impression = None
        click = None
        try:
            dt = day.strftime("%Y%m%d")
            impression = self.redis.get('%s|%s|2' % (ad_network_id, dt))
            click = self.redis.get('%s|%s|3' % (ad_network_id, dt))
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

    def get_hour_position_impression_click(self, ad_network_id, position_id, day, hour):
        """
        :type ad_network_id: str
        :type position_id: str
        :type day: datetime
        :type hour: str
        :rtype: (int, int)
        """
        if config.server_local_fake:
            return self.__get_random_data()

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

    def get_hour_impression_click(self, ad_network_id, day, hour):
        """
        :type ad_network_id: str
        :type day: datetime
        :type hour: str
        :rtype: (int, int)
        """
        if config.server_local_fake:
            return self.__get_random_data()

        impression = None
        click = None
        try:
            dt = day.strftime("%Y%m%d")
            impression = self.redis.get('%s|%s%s|2' % (ad_network_id, dt, hour))
            click = self.redis.get('%s|%s%s|3' % (ad_network_id, dt, hour))
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

    def fetch_position(self, dt, ad_network_id, position_id):
        try:
            a_list = list()

            # 获取日期
            now = datetime.now()
            day = datetime.strptime(dt, '%Y-%m-%d')
            dt = day.strftime("%Y-%m-%d")

            # 获取天数据
            impression, click = self.get_day_position_impression_click(ad_network_id, position_id, day)
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

            # 计算小时范围
            today_dt = now.strftime("%Y-%m-%d")
            if today_dt == dt:
                end_hour = now.hour + 1
            else:
                end_hour = 24

            # 获取小时数据
            for idx in reversed(xrange(0, end_hour)):
                str_hour = '%02d' % idx
                impression, click = self.get_hour_position_impression_click(ad_network_id, position_id, day, str_hour)
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

    def fetch_network(self, dt, ad_network_id):
        try:
            a_list = list()

            # 获取日期
            now = datetime.now()
            day = datetime.strptime(dt, '%Y-%m-%d')
            dt = day.strftime("%Y-%m-%d")

            # 获取天数据
            impression, click = self.get_day_impression_click(ad_network_id, day)
            a_dict = dict()
            a_dict['dt'] = dt
            a_dict['hour'] = '--'
            a_dict['ad_network_id'] = ad_network_id
            a_dict['position_id'] = '--'
            a_dict['pv'] = 0
            a_dict['impression'] = impression
            a_dict['click'] = click
            if impression != 0:
                a_dict['ctr'] = '%.2f%%' % (100.0 * click / impression)
            else:
                a_dict['ctr'] = "0.00%"
            a_dict['update_time'] = now.strftime('%Y-%m-%d %H:%M:%S')
            a_list.append(a_dict)

            # 计算小时范围
            today_dt = now.strftime("%Y-%m-%d")
            if today_dt == dt:
                end_hour = now.hour + 1
            else:
                end_hour = 24

            # 获取小时数据
            for idx in reversed(xrange(0, end_hour)):
                str_hour = '%02d' % idx
                impression, click = self.get_hour_impression_click(ad_network_id, day, str_hour)
                a_dict = dict()
                a_dict['dt'] = dt
                a_dict['hour'] = str_hour
                a_dict['ad_network_id'] = ad_network_id
                a_dict['position_id'] = '--'
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

    @classmethod
    def __get_random_data(cls):
        impression = random.randint(100, 10000)
        click = random.randint(0, 300)
        return impression, click

    @classmethod
    def __get_x_axis(cls, start_date, end_date, chart_type):
        point_list = list()
        if str(chart_type) == '对比图':
            for point in xrange(24):
                point_list.append(point)
        elif str(chart_type) == '趋势图':
            when = start_date
            while when <= end_date:
                point_list.append(when.strftime("%Y-%m-%d"))
                when += timedelta(days=1)
        return point_list

    @classmethod
    def __expand_blank(cls, name, length):
        for idx in xrange(0, length - len(name)):
            name += ' '
        return name

    @classmethod
    def __adjust_series_by_name(cls, series):
        max_len = 0
        for item in series:
            name = item['name']
            length = len(name)
            if length > max_len:
                max_len = length
        for item in series:
            name = item['name']
            item['name'] = cls.__expand_blank(name, max_len)
        return series

    def __get_trend_series(self, start_date, end_date, ad_network_id_1, ad_network_id_2, position_id):
        impression_list_1 = list()
        click_list_1 = list()
        impression_list_2 = list()
        click_list_2 = list()
        day = start_date
        while day <= end_date:
            if position_id:
                impression_1, click_1 = self.get_day_position_impression_click(ad_network_id_1, position_id, day)
                impression_2, click_2 = self.get_day_position_impression_click(ad_network_id_2, position_id, day)
            else:
                impression_1, click_1 = self.get_day_impression_click(ad_network_id_1, day)
                impression_2, click_2 = self.get_day_impression_click(ad_network_id_2, day)
            impression_list_1.append(impression_1)
            click_list_1.append(click_1)
            impression_list_2.append(impression_2)
            click_list_2.append(click_2)
            day += timedelta(days=1)

        series_list = list()
        series_list.append({
            'name': ad_network_id_1 + '-imp',
            'data': impression_list_1
        })
        series_list.append({
            'name': ad_network_id_1 + '-clk',
            'data': click_list_1
        })

        if ad_network_id_1 != ad_network_id_2:
            series_list.append({
                'name': ad_network_id_2 + '-imp',
                'data': impression_list_2
            })
            series_list.append({
                'name': ad_network_id_2 + '-clk',
                'data': click_list_2
            })
        return series_list

    def __get_compare_series(self, start_date, end_date, ad_network_id_1, ad_network_id_2, position_id):
        """:type start_date: datetime"""
        start_imp_list_1 = list()
        start_click_list_1 = list()
        end_imp_list_1 = list()
        end_click_list_1 = list()
        start_imp_list_2 = list()
        start_click_list_2 = list()
        end_imp_list_2 = list()
        end_click_list_2 = list()

        for idx in reversed(xrange(0, 24)):
            str_hour = '%02d' % idx
            if position_id:
                impression_1, click_1 = self.get_hour_position_impression_click(ad_network_id_1, position_id, start_date, str_hour)
                impression_2, click_2 = self.get_hour_position_impression_click(ad_network_id_2, position_id, start_date, str_hour)
            else:
                impression_1, click_1 = self.get_hour_impression_click(ad_network_id_1, start_date, str_hour)
                impression_2, click_2 = self.get_hour_impression_click(ad_network_id_2, start_date, str_hour)
            start_imp_list_1.append(impression_1)
            start_click_list_1.append(click_1)
            start_imp_list_2.append(impression_2)
            start_click_list_2.append(click_2)

        for idx in reversed(xrange(0, 24)):
            str_hour = '%02d' % idx
            if position_id:
                impression_1, click_1 = self.get_hour_position_impression_click(ad_network_id_1, position_id, end_date, str_hour)
                impression_2, click_2 = self.get_hour_position_impression_click(ad_network_id_2, position_id, end_date, str_hour)
            else:
                impression_1, click_1 = self.get_hour_impression_click(ad_network_id_1, end_date, str_hour)
                impression_2, click_2 = self.get_hour_impression_click(ad_network_id_2, end_date, str_hour)
            end_imp_list_1.append(impression_1)
            end_click_list_1.append(click_1)
            end_imp_list_2.append(impression_2)
            end_click_list_2.append(click_2)

        series_list = list()
        series_list.append({
            'name': start_date.strftime('%Y%m%d') + '-' + ad_network_id_1 + '-imp',
            'data': start_imp_list_1
        })
        series_list.append({
            'name': start_date.strftime('%Y%m%d') + '-' + ad_network_id_1 + '-clk',
            'data': start_click_list_1
        })

        if start_date != end_date:
            series_list.append({
                'name': end_date.strftime('%Y%m%d') + '-' + ad_network_id_1 + '-imp',
                'data': end_imp_list_1
            })
            series_list.append({
                'name': end_date.strftime('%Y%m%d') + '-' + ad_network_id_1 + '-clk',
                'data': end_click_list_1
            })

        if ad_network_id_1 != ad_network_id_2:
            series_list.append({
                'name': start_date.strftime('%Y%m%d') + '-' + ad_network_id_2 + '-imp',
                'data': start_imp_list_2
            })
            series_list.append({
                'name': start_date.strftime('%Y%m%d') + '-' + ad_network_id_2 + '-clk',
                'data': start_click_list_2
            })

            if start_date != end_date:
                series_list.append({
                    'name': end_date.strftime('%Y%m%d') + '-' + ad_network_id_2 + '-imp',
                    'data': end_imp_list_2
                })
                series_list.append({
                    'name': end_date.strftime('%Y%m%d') + '-' + ad_network_id_2 + '-clk',
                    'data': end_click_list_2
                })

        return series_list

    def fetch_chart_data(self, start_dt, end_dt, ad_network_id_1, ad_network_id_2, position_id, chart_type):
        start_date = datetime.strptime(start_dt, '%Y-%m-%d')
        end_date = datetime.strptime(end_dt, '%Y-%m-%d')
        x_axis = self.__get_x_axis(start_date, end_date, chart_type)
        if str(chart_type) == '趋势图':
            series = self.__get_trend_series(start_date, end_date, ad_network_id_1, ad_network_id_2, position_id)
        else:
            series = self.__get_compare_series(start_date, end_date, ad_network_id_1, ad_network_id_2, position_id)
        json_dict = dict()
        json_dict['chart'] = {'type': 'line'}
        json_dict['title'] = {'text': chart_type}
        json_dict['xAxis'] = {'categories': x_axis}
        json_dict['yAxis'] = {'title': {'text': '计数'}}
        json_dict['series'] = series
        return json_dict
