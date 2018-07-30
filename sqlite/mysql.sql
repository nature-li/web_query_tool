CREATE DATABASE experiment;

# 业务名称
DROP TABLE IF EXISTS `business`;
CREATE TABLE IF NOT EXISTS `business` (
  `id`          INT AUTO_INCREMENT NOT NULL,
  `name`        VARCHAR(128)       NOT NULL,
  `desc`        VARCHAR(256)       NULL,
  `create_time` TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX name (`name`)
)
  DEFAULT CHARSET = utf8;
INSERT INTO business (name) VALUES ('dsp');
INSERT INTO business (name) VALUES ('brand');

# 位置信息
DROP TABLE IF EXISTS `position`;
CREATE TABLE IF NOT EXISTS `position` (
  `id`          INT AUTO_INCREMENT NOT NULL,
  `position`    VARCHAR(32)        NOT NULL,
  `desc`        VARCHAR(256)       NULL,
  `create_time` TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX name (`position`)
)
  DEFAULT CHARSET = utf8;
INSERT INTO position (position) VALUES ('1');
INSERT INTO position (position) VALUES ('2');
INSERT INTO position (position) VALUES ('3');
INSERT INTO position (position) VALUES ('4');
INSERT INTO position (position) VALUES ('5');
INSERT INTO position (position) VALUES ('6');
INSERT INTO position (position) VALUES ('7');
INSERT INTO position (position) VALUES ('8');
INSERT INTO position (position) VALUES ('9');
INSERT INTO position (position) VALUES ('10');
INSERT INTO position (position) VALUES ('11');
INSERT INTO position (position) VALUES ('12');
INSERT INTO position (position) VALUES ('13');
INSERT INTO position (position) VALUES ('14');
INSERT INTO position (position) VALUES ('15');
INSERT INTO position (position) VALUES ('16');
INSERT INTO position (position) VALUES ('17');
INSERT INTO position (position) VALUES ('18');
INSERT INTO position (position) VALUES ('19');
INSERT INTO position (position) VALUES ('20');
INSERT INTO position (position) VALUES ('21');
INSERT INTO position (position) VALUES ('22');
INSERT INTO position (position) VALUES ('23');
INSERT INTO position (position) VALUES ('24');
INSERT INTO position (position) VALUES ('25');
INSERT INTO position (position) VALUES ('26');
INSERT INTO position (position) VALUES ('27');
INSERT INTO position (position) VALUES ('28');
INSERT INTO position (position) VALUES ('29');
INSERT INTO position (position) VALUES ('30');
INSERT INTO position (position) VALUES ('31');
INSERT INTO position (position) VALUES ('32');
INSERT INTO position (position) VALUES ('33');
INSERT INTO position (position) VALUES ('34');
INSERT INTO position (position) VALUES ('35');
INSERT INTO position (position) VALUES ('36');
INSERT INTO position (position) VALUES ('37');
INSERT INTO position (position) VALUES ('38');
INSERT INTO position (position) VALUES ('39');
INSERT INTO position (position) VALUES ('40');
INSERT INTO position (position) VALUES ('41');
INSERT INTO position (position) VALUES ('42');
INSERT INTO position (position) VALUES ('43');
INSERT INTO position (position) VALUES ('44');
INSERT INTO position (position) VALUES ('45');
INSERT INTO position (position) VALUES ('46');
INSERT INTO position (position) VALUES ('47');
INSERT INTO position (position) VALUES ('48');
INSERT INTO position (position) VALUES ('49');
INSERT INTO position (position) VALUES ('50');

# 实验层
DROP TABLE IF EXISTS `layer`;
CREATE TABLE IF NOT EXISTS `layer` (
  `id`          VARCHAR(64)  NOT NULL,
  `name`        VARCHAR(128) NOT NULL,
  `business`    VARCHAR(128) NOT NULL,
  `desc`        VARCHAR(256) NULL,
  `create_time` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX name (`name`)
)
  DEFAULT CHARSET = utf8;
INSERT INTO layer (id, name, business) VALUES ('freq', '频次策略层', 'dsp');
INSERT INTO layer (id, name, business) VALUES ('bls', '扣费策略层', 'dsp');
INSERT INTO layer (id, name, business) VALUES ('ctre', 'ctr预估层', 'dsp');


DROP TABLE IF EXISTS `experiment`;
CREATE TABLE IF NOT EXISTS `experiment` (
  `id`          VARCHAR(64)  NOT NULL,
  `name`        VARCHAR(128) NOT NULL,
  `layer_id`    VARCHAR(128) NOT NULL,
  `status`      INT          NOT NULL DEFAULT 0,
  `online_time` INT          NOT NULL DEFAULT 0,
  `desc`        VARCHAR(256) NULL,
  `create_time` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX name (`name`)
)
  DEFAULT CHARSET = utf8;


DROP TABLE IF EXISTS `cfg_item`;
CREATE TABLE IF NOT EXISTS `cfg_item` (
  `id`            VARCHAR(64)   NOT NULL,
  `name`          VARCHAR(128)  NOT NULL,
  `position`      VARCHAR(4096) NOT NULL,
  `start_value`   INT           NOT NULL,
  `stop_value`    INT           NOT NULL,
  `algo_request`  VARCHAR(256)  NOT NULL,
  `algo_response` VARCHAR(256)  NOT NULL,
  `status`        INT           NOT NULL DEFAULT 0,
  `desc`          VARCHAR(256)  NULL,
  `create_time`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX name (`name`)
)
  DEFAULT CHARSET = utf8;


DROP TABLE IF EXISTS `item_2_exp`;
CREATE TABLE IF NOT EXISTS `item_2_exp` (
  `id`            INT AUTO_INCREMENT NOT NULL,
  `item_id`       VARCHAR(64)        NOT NULL,
  `experiment_id` VARCHAR(64)        NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX group_exp (`item_id`, `experiment_id`)
);