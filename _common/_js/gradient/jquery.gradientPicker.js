/**
 @author Matt Crinklaw-Vogt (tantaman)
 */

(function ($) {
    if (!$.event.special.destroyed) {
        $.event.special.destroyed = {
            remove: function (o) {
                if (o.handler) {
                    o.handler();
                }
            }
        }
    }

    function ctrlPtComparator(l, r) {
        return l.position - r.position;
    }

    function bind(fn, ctx) {
        if (typeof fn.bind === "function") {
            return fn.bind(ctx);
        } else {
            return function () {
                fn.apply(ctx, arguments);
            }
        }
    }

    var browserPrefix = "";
    var agent = window.navigator.userAgent;
    if (agent.indexOf('WebKit') >= 0)
        browserPrefix = "-webkit-"
    else if (agent.indexOf('Mozilla') >= 0)
        browserPrefix = "-moz-"
    else if (agent.indexOf('Microsoft') >= 0)
        browserPrefix = "-ms-"
    else
        browserPrefix = ""

    function GradientSelection($el, opts) {
        this.$el = $el;
        this.$el.css("position", "relative");
        this.opts = opts;

        var $preview = $("<canvas class='gradientPicker-preview'></canvas>");
        this.$el.append($preview);
        var canvas = $preview[0];
        $preview.css({
            width: $preview.parent().width(),
            height: $preview.parent().height()
        });
        // canvas.width = canvas.clientWidth;
        // canvas.height = canvas.clientHeight;
        this.g2d = canvas.getContext("2d");

        var $ctrlPtContainer = $("<div class='gradientPicker-ctrlPts'></div>");
        this.$el.append($ctrlPtContainer)
        this.$ctrlPtContainer = $ctrlPtContainer;

        this.updatePreview = bind(this.updatePreview, this);
        this.controlPoints = [];
        this.ctrlPtConfig = new ControlPtConfig(this.$el, opts);
        for (var i = 0; i < opts.controlPoints.length; ++i) {
            var ctrlPt = this.createCtrlPt(opts.controlPoints[i]);
            this.controlPoints.push(ctrlPt);
        }

        this.docClicked = bind(this.docClicked, this);
        this.destroyed = bind(this.destroyed, this);
        $(document).bind("click", this.docClicked);
        this.$el.bind("destroyed", this.destroyed);
        this.previewClicked = bind(this.previewClicked, this);
        $preview.click(this.previewClicked);

        this.updatePreview();
    }

    GradientSelection.prototype = {
        docClicked: function () {
            this.ctrlPtConfig.hide();
        },

        createCtrlPt: function (ctrlPtSetup) {
            return new ControlPoint(this.$ctrlPtContainer, ctrlPtSetup, this.opts.orientation, this, this.ctrlPtConfig)
        },

        destroyed: function () {
            $(document).unbind("click", this.docClicked);
        },

        updateOptions: function (opts) {
            $.extend(this.opts, opts);
            this.updatePreview();
        },

        colorToHex: function (color) {
            if (color.match('#')) {
                return color;
            }
            if (color.match('rgb')) {
                return '#' + this.rgbToHex(color);
            }
            return '#' + color;
        },

        rgbToHex: function (rgb) {
            function componentFromStr(numStr, percent) {
                var num = Math.max(0, parseInt(numStr, 10));
                return percent ?
                    Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
            }

            var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
            var result, r, g, b, hex = "";
            if ((result = rgbRegex.exec(rgb))) {
                r = componentFromStr(result[1], result[2]);
                g = componentFromStr(result[3], result[4]);
                b = componentFromStr(result[5], result[6]);
                hex = (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
            }
            return hex;
        },

        updatePreview: function (quiet) {
            var result = [];
            this.controlPoints.sort(ctrlPtComparator);
            if (this.opts.orientation == "horizontal") {
                var grad = this.g2d.createLinearGradient(0, 0, this.g2d.canvas.width, 0);
                for (var i = 0; i < this.controlPoints.length; ++i) {
                    var pt = this.controlPoints[i];
                    pt.color = this.colorToHex(pt.color);
                    grad.addColorStop(pt.position, pt.color);
                    result.push({
                        position: pt.position,
                        color: pt.color
                    });
                }
            }

            this.g2d.fillStyle = grad;
            this.g2d.fillRect(0, 0, this.g2d.canvas.width, this.g2d.canvas.height);

            if (this.opts.generateStyles)
                var styles = this._generatePreviewStyles();

            if (quiet)
                return;
            this.opts.change(result, styles);
            // this.opts.closed(result, styles);
            return {
                result: result,
                styles: styles
            }
        },

        removeControlPoint: function (ctrlPt) {
            var cpidx = this.controlPoints.indexOf(ctrlPt);

            if (cpidx != -1) {
                this.controlPoints.splice(cpidx, 1);
                ctrlPt.$el.remove();
            }
        },

        /** webNeat modifications starts here */
        addPoint: function (percent, colorStr, quiet) {
            colorStr = this.colorToHex(colorStr);
            var cp = this.createCtrlPt({
                position: percent,
                color: colorStr
            });

            this.controlPoints.push(cp);
            this.controlPoints.sort(ctrlPtComparator);
            this.updatePreview(quiet);
        },

        removeAllPoints: function () {
            this.controlPoints.forEach(function (point) {
                point.$el.remove();
                ;
            });
            this.controlPoints = [];
            // this.addPoint(0,'#fff');
            // this.addPoint(1,'#fff');

            this.updatePreview();
        },

        changeFillDirection: function (fd) {
            this.opts.fillDirection = fd;
            this.updatePreview();
        },
        /** webNeat modifications ends here */

        previewClicked: function (e) {
            var offset = $(e.target).offset();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;

            var imgData = this.g2d.getImageData(x, y, 1, 1);
            var colorStr = "rgb(" + imgData.data[0] + "," + imgData.data[1] + "," + imgData.data[2] + ")";

            var cp = this.createCtrlPt({
                position: x / this.g2d.canvas.width,
                color: colorStr
            });

            this.controlPoints.push(cp);
            this.controlPoints.sort(ctrlPtComparator);
        },

        getChanges: function () {
            this.updatePreview();
        },

        _generatePreviewStyles: function () {
            //linear-gradient(top, rgb(217,230,163) 86%, rgb(227,249,159) 9%)
            var str = this.opts.type + "-gradient(" + ((this.opts.type == "linear") ? (this.opts.fillDirection + ", ") : "");
            var first = true;
            for (var i = 0; i < this.controlPoints.length; ++i) {
                var pt = this.controlPoints[i];
                if (!first) {
                    str += ", ";
                } else {
                    first = false;
                }
                str += pt.color + " " + ((pt.position * 100) | 0) + "%";
            }

            str = str + ")"
            var styles = [str, browserPrefix + str];
            return styles;
        }
    };

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function ControlPoint($parentEl, initialState, orientation, listener, ctrlPtConfig) {
        this.$el = $("<div class='gradientPicker-ctrlPt'></div>");
        $parentEl.append(this.$el);
        this.$parentEl = $parentEl;
        this.configView = ctrlPtConfig;

        if (typeof initialState === "string") {
            initialState = initialState.split(" ");
            this.position = parseFloat(initialState[1]) / 100;
            this.color = initialState[0];
        } else {
            this.position = initialState.position;
            this.color = initialState.color;
        }

        this.listener = listener;
        this.outerWidth = this.$el.outerWidth();

        this.$el.css("background-color", '#' + this.color);

        /* if (this.color.match('rgb')){
         console.log('rgb color ' + this.color);
         this.$el.css("background-color", this.color);
         } else {
         var rgbc = hexToRgb(this.color);
         var rgbv = 'rgb(' + rgbc.r + ',' + rgbc.g + ',' + rgbc.b + ')';
         this.$el.css("background-color", rgbv);
         }  */


        if (orientation == "horizontal") {
            var pxLeft = ($parentEl.width() - this.$el.outerWidth()) * (this.position);
            this.$el.css("left", pxLeft);
        } else {
            var pxTop = ($parentEl.height() - this.$el.outerHeight()) * (this.position);
            this.$el.css("top", pxTop);
        }

        this.drag = bind(this.drag, this);
        this.stop = bind(this.stop, this);
        this.clicked = bind(this.clicked, this);
        this.colorChanged = bind(this.colorChanged, this);
        this.colorClosed = bind(this.colorClosed, this);
        this.$el.draggable({
            axis: (orientation == "horizontal") ? "x" : "y",
            drag: this.drag,
            stop: this.stop,
            containment: $parentEl
        });
        this.$el.css("position", 'absolute');
        this.$el.click(this.clicked);
    }

    ControlPoint.prototype = {
        drag: function (e, ui) {
            // convert position to a %
            var left = ui.position.left;
            this.position = (left / (this.$parentEl.width() - this.outerWidth));
            this.listener.updatePreview();
        },

        stop: function (e, ui) {
            this.listener.updatePreview();
            this.configView.show(this.$el.position(), this.color, this);
            this.colorClosed();
        },

        clicked: function (e) {
            this.configView.show(this.$el.position(), this.color, this);
            log(this.color);
            e.stopPropagation();
            return false;
        },

        colorClosed: function () {
            this.listener.ctrlPtConfig.opts.closed();
        },

        colorChanged: function (c) {
            this.color = c;
            // log(c);
            this.$el.css("background-color", this.color);
            this.listener.updatePreview();
        },

        removeClicked: function () {
            this.listener.removeControlPoint(this);
            this.listener.updatePreview();
        }
    };

    function ControlPtConfig($parent, opts) {
        //color-chooser
        this.$el = $('<div class="gradientPicker-ptConfig" style="visibility: hidden"></div>');
        $parent.append(this.$el);
        var $cpicker = $('<div class="color-chooser"></div>');
        this.$el.append($cpicker);
        var $rmEl = $("<div class='gradientPicker-close'></div>");
        this.$el.append($rmEl);

        this.colorChanged = bind(this.colorChanged, this);
        this.colorClosed = bind(this.colorClosed, this);
        this.removeClicked = bind(this.removeClicked, this);
        $cpicker.ColorPicker({
            onChange: this.colorChanged,
            onHide: this.colorClosed
        });
        this.$cpicker = $cpicker;
        this.opts = opts;
        this.visible = false;

        $rmEl.click(this.removeClicked);
    }

    ControlPtConfig.prototype = {
        show: function (position, color, listener) {
            this.visible = true;
            this.listener = listener;
            this.$el.css("visibility", "visible");
            this.$cpicker.ColorPickerSetColor(color);
            this.$cpicker.css("background-color", '#' + color);
            if (this.opts.orientation === "horizontal") {
                this.$el.css("left", position.left);
            } else {
                this.$el.css("top", position.top);
            }
            //else {
            //	this.visible = false;
            //this.$el.css("visibility", "hidden");
            //}
        },

        hide: function () {
            if (this.visible) {
                this.$el.css("visibility", "hidden");
                this.visible = false;
            }
        },

        /*colorClosed: function(hsb, hex, rgb) {
         if (this.opts.closed){
         var changes = this.listener.listener.updatePreview(false);
         this.opts.closed(changes.result, changes.styles)
         }
         },*/

        colorClosed: function (hsb, hex, rgb) {
            if (this.opts.closed) {
                this.opts.closed();
            }
        },
        colorChanged: function (hsb, hex, rgb) {
            hex = "#" + hex;
            this.listener.colorChanged(hex);
            this.$cpicker.css("background-color", hex)
        },

        removeClicked: function () {
            this.listener.removeClicked();
            this.hide();
        }
    };

    var methods = {
        init: function (opts) {
            opts = $.extend({
                //controlPoints: ["#FFF 0%", "#000 100%"],
                controlPoints: [],
                orientation: "horizontal",
                type: "linear",
                fillDirection: "left",
                generateStyles: true,
                change: function () {
                }
            }, opts);

            this.each(function () {
                var $this = $(this);
                var gradSel = new GradientSelection($this, opts);
                $this.data("gradientPicker-sel", gradSel);
            });
        },

        update: function (opts) {
            this.each(function () {
                var $this = $(this);
                var gradSel = $this.data("gradientPicker-sel");
                if (gradSel != null) {
                    gradSel.updateOptions(opts);
                }
            });
        }
    };

    $.fn.gradientPicker = function (method, opts) {
        if (typeof method === "string" && method !== "init") {
            methods[method].call(this, opts);
        } else {
            opts = method;
            methods.init.call(this, opts);
        }
    };
})(jQuery);