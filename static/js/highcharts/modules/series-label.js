/*
 Highcharts JS v6.0.7 (2018-02-16)

 (c) 2009-2017 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(t) {
    "object" === typeof module && module.exports ? module.exports = t : t(Highcharts)
})(function(t) {
    (function(n) {
        function t(d, b, a, m, c, e) {
            d = (e - b) * (a - d) - (m - b) * (c - d);
            return 0 < d ? !0 : 0 > d ? !1 : !0
        }
        function v(d, b, a, m, c, e, f, h) {
            return t(d, b, c, e, f, h) !== t(a, m, c, e, f, h) && t(d, b, a, m, c, e) !== t(d, b, a, m, f, h)
        }
        function B(d, b, a, m, c, e, f, h) {
            return v(d, b, d + a, b, c, e, f, h) || v(d + a, b, d + a, b + m, c, e, f, h) || v(d, b + m, d + a, b + m, c, e, f, h) || v(d, b, d, b + m, c, e, f, h)
        }
        function C(d) {
            var b = this,
                a = Math.max(n.animObject(b.renderer.globalAnimation).duration,
                250),
                m = !b.hasRendered;
            d.apply(b, [].slice.call(arguments, 1));
            b.labelSeries = [];
            b.labelSeriesMaxSum = 0;
            clearTimeout(b.seriesLabelTimer);
            w(b.series, function(c) {
                var e = c.options.label,
                    d = c.labelBySeries,
                    h = d && d.closest;
                e.enabled && c.visible && (c.graph || c.area) && !c.isSeriesBoosting && (b.labelSeries.push(c), e.minFontSize && e.maxFontSize && (c.sum = n.reduce(c.yData, function(a, b) {
                    return (a || 0) + (b || 0)
                }, 0), b.labelSeriesMaxSum = Math.max(b.labelSeriesMaxSum, c.sum)), m && (a = Math.max(a, n.animObject(c.options.animation).duration)),
                h && (void 0 !== h[0].plotX ? d.animate({
                    x: h[0].plotX + h[1],
                    y: h[0].plotY + h[2]
                }) : d.attr({
                    opacity: 0
                })))
            });
            b.seriesLabelTimer = n.syncTimeout(function() {
                b.drawSeriesLabels()
            }, b.renderer.forExport ? 0 : a)
        }
        var D = n.wrap,
            w = n.each,
            E = n.extend,
            y = n.isNumber,
            x = n.pick,
            z = n.Series,
            F = n.SVGRenderer,
            A = n.Chart;
        n.setOptions({
            plotOptions: {
                series: {
                    label: {
                        enabled: !0,
                        connectorAllowed: !0,
                        connectorNeighbourDistance: 24,
                        minFontSize: null,
                        maxFontSize: null,
                        onArea: null,
                        style: {
                            fontWeight: "bold"
                        },
                        boxesToAvoid: []
                    }
                }
            }
        });
        F.prototype.symbols.connector =
        function(d, b, a, m, c) {
            var e = c && c.anchorX;
            c = c && c.anchorY;
            var f,
                h,
                g = a / 2;
            y(e) && y(c) && (f = ["M", e, c], h = b - c, 0 > h && (h = -m - h), h < a && (g = e < d + a / 2 ? h : a - h), c > b + m ? f.push("L", d + g, b + m) : c < b ? f.push("L", d + g, b) : e < d ? f.push("L", d, b + m / 2) : e > d + a && f.push("L", d + a, b + m / 2));
            return f || []
        };
        z.prototype.getPointsOnGraph = function() {
            if (this.xAxis || this.yAxis) {
                var d = this.points,
                    b,
                    a,
                    m = [],
                    c,
                    e,
                    f,
                    h;
                e = this.graph || this.area;
                f = e.element;
                var g = this.chart.inverted,
                    q = this.xAxis;
                b = this.yAxis;
                var r = g ? b.pos : q.pos,
                    g = g ? q.pos : b.pos,
                    q = x(this.options.label.onArea,
                    !!this.area),
                    u = b.getThreshold(this.options.threshold);
                if (this.getPointSpline && f.getPointAtLength && !q) {
                    e.toD && (a = e.attr("d"), e.attr({
                        d: e.toD
                    }));
                    h = f.getTotalLength();
                    for (c = 0; c < h; c += 16)
                        b = f.getPointAtLength(c), m.push({
                            chartX: r + b.x,
                            chartY: g + b.y,
                            plotX: b.x,
                            plotY: b.y
                        });
                    a && e.attr({
                        d: a
                    });
                    b = d[d.length - 1];
                    b.chartX = r + b.plotX;
                    b.chartY = g + b.plotY;
                    m.push(b)
                } else
                    for (h = d.length, c = 0; c < h; c += 1) {
                        b = d[c];
                        a = d[c - 1];
                        b.chartX = r + b.plotX;
                        b.chartY = g + b.plotY;
                        q && (b.chartCenterY = g + (b.plotY + x(b.yBottom, u)) / 2);
                        if (0 < c && (e = Math.abs(b.chartX -
                        a.chartX), f = Math.abs(b.chartY - a.chartY), e = Math.max(e, f), 16 < e))
                            for (e = Math.ceil(e / 16), f = 1; f < e; f += 1)
                                m.push({
                                    chartX: a.chartX + f / e * (b.chartX - a.chartX),
                                    chartY: a.chartY + f / e * (b.chartY - a.chartY),
                                    chartCenterY: a.chartCenterY + f / e * (b.chartCenterY - a.chartCenterY),
                                    plotX: a.plotX + f / e * (b.plotX - a.plotX),
                                    plotY: a.plotY + f / e * (b.plotY - a.plotY)
                                });
                        y(b.plotY) && m.push(b)
                    }
                return m
            }
        };
        z.prototype.labelFontSize = function(d, b) {
            return d + this.sum / this.chart.labelSeriesMaxSum * (b - d) + "px"
        };
        z.prototype.checkClearPoint = function(d, b, a, m) {
            var c =
                Number.MAX_VALUE,
                e = Number.MAX_VALUE,
                f,
                h,
                g = this.options.label.connectorAllowed,
                q = x(this.options.label.onArea, !!this.area),
                r = this.chart,
                u,
                k,
                n,
                t,
                p,
                l;
            for (p = 0; p < r.boxesToAvoid.length; p += 1)
                if (k = r.boxesToAvoid[p], l = d + a.width, u = b, n = b + a.height, !(d > k.right || l < k.left || u > k.bottom || n < k.top))
                    return !1;
            for (p = 0; p < r.series.length; p += 1)
                if (u = r.series[p], k = u.interpolatedPoints, u.visible && k) {
                    for (l = 1; l < k.length; l += 1) {
                        if (k[l].chartX >= d - 16 && k[l - 1].chartX <= d + a.width + 16) {
                            if (B(d, b, a.width, a.height, k[l - 1].chartX, k[l - 1].chartY,
                            k[l].chartX, k[l].chartY))
                                return !1;
                            this === u && !f && m && (f = B(d - 16, b - 16, a.width + 32, a.height + 32, k[l - 1].chartX, k[l - 1].chartY, k[l].chartX, k[l].chartY))
                        }
                        !g && !f || this === u && !q || (n = d + a.width / 2 - k[l].chartX, t = b + a.height / 2 - k[l].chartY, c = Math.min(c, n * n + t * t))
                    }
                    if (!q && g && this === u && (m && !f || c < Math.pow(this.options.label.connectorNeighbourDistance, 2))) {
                        for (l = 1; l < k.length; l += 1)
                            f = Math.min(Math.pow(d + a.width / 2 - k[l].chartX, 2) + Math.pow(b + a.height / 2 - k[l].chartY, 2), Math.pow(d - k[l].chartX, 2) + Math.pow(b - k[l].chartY, 2), Math.pow(d +
                            a.width - k[l].chartX, 2) + Math.pow(b - k[l].chartY, 2), Math.pow(d + a.width - k[l].chartX, 2) + Math.pow(b + a.height - k[l].chartY, 2), Math.pow(d - k[l].chartX, 2) + Math.pow(b + a.height - k[l].chartY, 2)), f < e && (e = f, h = k[l]);
                        f = !0
                    }
                }
            return !m || f ? {
                x: d,
                y: b,
                weight: c - (h ? e : 0),
                connectorPoint: h
            } : !1
        };
        A.prototype.drawSeriesLabels = function() {
            var d = this,
                b = this.labelSeries;
            d.boxesToAvoid = [];
            w(b, function(a) {
                a.interpolatedPoints = a.getPointsOnGraph();
                w(a.options.label.boxesToAvoid || [], function(a) {
                    d.boxesToAvoid.push(a)
                })
            });
            w(d.series, function(a) {
                function b(a,
                b, c) {
                    return a > n && a <= n + t - c.width && b >= k && b <= k + v - c.height
                }
                if (a.xAxis || a.yAxis) {
                    var c,
                        e,
                        f,
                        h = [],
                        g,
                        q;
                    c = a.options.label;
                    var r = d.inverted,
                        n = r ? a.yAxis.pos : a.xAxis.pos,
                        k = r ? a.xAxis.pos : a.yAxis.pos,
                        t = d.inverted ? a.yAxis.len : a.xAxis.len,
                        v = d.inverted ? a.xAxis.len : a.yAxis.len,
                        p = a.interpolatedPoints,
                        l = x(c.onArea, !!a.area),
                        r = a.labelBySeries;
                    e = c.minFontSize;
                    c = c.maxFontSize;
                    if (a.visible && !a.isSeriesBoosting && p) {
                        r || (a.labelBySeries = r = d.renderer.label(a.name, 0, -9999, "connector").css(E({
                            color: l ? d.renderer.getContrast(a.color) :
                            a.color
                        }, a.options.label.style)), e && c && r.css({
                            fontSize: a.labelFontSize(e, c)
                        }), r.attr({
                            padding: 0,
                            opacity: d.renderer.forExport ? 1 : 0,
                            stroke: a.color,
                            "stroke-width": 1,
                            zIndex: 3
                        }).add(a.group).animate({
                            opacity: 1
                        }, {
                            duration: 200
                        }));
                        c = r.getBBox();
                        c.width = Math.round(c.width);
                        for (q = p.length - 1; 0 < q; --q)
                            l ? (e = p[q].chartX - c.width / 2, f = p[q].chartCenterY - c.height / 2) : (e = p[q].chartX + 3, f = p[q].chartY - c.height - 3, b(e, f, c) && (g = a.checkClearPoint(e, f, c)), g && h.push(g), e = p[q].chartX + 3, f = p[q].chartY + 3, b(e, f, c) && (g = a.checkClearPoint(e,
                            f, c)), g && h.push(g), e = p[q].chartX - c.width - 3, f = p[q].chartY + 3, b(e, f, c) && (g = a.checkClearPoint(e, f, c)), g && h.push(g), e = p[q].chartX - c.width - 3, f = p[q].chartY - c.height - 3), b(e, f, c) && (g = a.checkClearPoint(e, f, c)), g && h.push(g);
                        if (!h.length && !l)
                            for (e = n + t - c.width; e >= n; e -= 16)
                                for (f = k; f < k + v - c.height; f += 16)
                                    (g = a.checkClearPoint(e, f, c, !0)) && h.push(g);
                        if (h.length) {
                            if (h.sort(function(a, b) {
                                return b.weight - a.weight
                            }), g = h[0], d.boxesToAvoid.push({
                                left: g.x,
                                right: g.x + c.width,
                                top: g.y,
                                bottom: g.y + c.height
                            }), h = Math.sqrt(Math.pow(Math.abs(g.x -
                            r.x), 2), Math.pow(Math.abs(g.y - r.y), 2)))
                                p = {
                                    opacity: d.renderer.forExport ? 1 : 0,
                                    x: g.x - n,
                                    y: g.y - k
                                }, l = {
                                    opacity: 1
                                }, 10 >= h && (l = {
                                    x: p.x,
                                    y: p.y
                                }, p = {}), a.labelBySeries.attr(E(p, {
                                    anchorX: g.connectorPoint && g.connectorPoint.plotX,
                                    anchorY: g.connectorPoint && g.connectorPoint.plotY
                                })).animate(l), a.options.kdNow = !0, a.buildKDTree(), a = a.searchPoint({
                                    chartX: g.x,
                                    chartY: g.y
                                }, !0), r.closest = [a, g.x - n - a.plotX, g.y - k - a.plotY]
                        } else
                            r && (a.labelBySeries = r.destroy())
                    }
                }
            })
        };
        D(A.prototype, "render", C);
        D(A.prototype, "redraw", C)
    })(t)
});

