CREATE TABLE day_count(
id integer primary key autoincrement,
dt varchar(32) not null,
ad_network_id varchar(255) not null,
pv int not null,
impression int not null,
click int not null,
update_time long not null);
CREATE UNIQUE INDEX day_index on day_count (dt, ad_network_id);


CREATE TABLE hour_count(
id integer primary key autoincrement,
dt varchar(32) not null,
hour varchar(32) not null,
ad_network_id varchar(255) not null,
pv int not null,
impression int not null,
click int not null,
update_time long not null);
CREATE UNIQUE INDEX hour_index on hour_count (dt, hour, ad_network_id);


CREATE TABLE user_list(
id integer primary key autoincrement,
user_account varchar(255) not null,
user_right integer not null,
update_time long not null);
CREATE UNIQUE INDEX user_index on user_list (user_account);
INSERT INTO user_list(user_account, user_right, update_time) VALUES('lyg@meitu.com', 3, STRFTIME('%s', 'now'));


CREATE TABLE network_list(
id integer primary key autoincrement,
network varchar(255) not null,
update_time long not null);
CREATE UNIQUE INDEX network_index on network_list (network);

INSERT INTO network_list(network, update_time) VALUES('admob', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('baidu', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('dfp_tw', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('gdt', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('google', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('google_admob', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('lingtui', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('meitu', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('mt_inmobi', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('mt_innotech', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('mt_ipinyou', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('mt_mex', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('mt_smaato', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('mt_zhixing', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('yeahmobi', STRFTIME('%s', 'now'));
INSERT INTO network_list(network, update_time) VALUES('', STRFTIME('%s', 'now'));