/**
 * Created by maor.frankel on 5/23/15.
 */
ruler.prototype.guideLine = function (line, _dragContainer, lineDimension, options, curDelta, moveCB, event) {

  var self,
    guideLine = line,
    _curScale = 1,
    _assigned = false,
    _curPosDelta = curDelta || 0,
    dragContainer = _dragContainer,
    dimension = lineDimension || 2,
    moveCB = moveCB || function () {
      };


  var curPosDelta = function (val) {
    if (typeof val === 'undefined') {
      return _curPosDelta;
    }
    return (_curPosDelta = val);
  };

  var assigned = function (val) {
    if (typeof val === 'undefined') {
      return _assigned;
    }
    return (_assigned = val);
  };

  var curScale = function (val) {
    if (typeof val === 'undefined') {
      return _curScale;
    }
    return (_curScale = val);
  };


  var draggable = (function () {
    return {
      move: function (xpos, ypos) {
        guideLine.style.left = ruler.prototype.utils.pixelize(xpos);
        guideLine.style.top = ruler.prototype.utils.pixelize(ypos);
        updateToolTip(xpos, ypos);
        moveCB(self, xpos, ypos);
      },
      startMoving: function (evt) {
        ruler.prototype.utils.addClasss(guideLine, ['rul_line_dragged']);
        evt = evt || window.event;
        var posX = evt ? evt.clientX : 0,
          posY = evt ? evt.clientY : 0,
          divTop = parseInt(guideLine.style.top || 0),
          divLeft = parseInt(guideLine.style.left || 0),
          eWi = parseInt(guideLine.offsetWidth),
          eHe = parseInt(guideLine.offsetHeight),
          cWi = parseInt(dragContainer.offsetWidth),
          cHe = parseInt(dragContainer.offsetHeight),
          cursor = dimension === 2 ? 'ns-resize' : 'ew-resize';

        options.container.style.cursor = cursor;
        guideLine.style.cursor = cursor;
        var diffX = posX - divLeft,
          diffY = posY - divTop;
        document.onmousemove = function moving(evt) {
          evt = evt || window.event;
          var posX = evt.clientX,
            posY = evt.clientY,
            aX = posX - diffX,
            aY = posY - diffY;

          if (aX < 0) {
            aX = 0;
          }
          if (aY < 0) {
            aY = 0;
          }

          if (aX + eWi > cWi) {
            aX = cWi - eWi;
          }
          if (aY + eHe > cHe) {
            aY = cHe - eHe;
          }

          draggable.move(aX, aY);
        };
        showToolTip();
      },
      stopMoving: function () {
        options.container.style.cursor = null;
        guideLine.style.cursor = null;
        document.onmousemove = function () {
        };
        hideToolTip();
        ruler.prototype.utils.removeClasss(guideLine, ['rul_line_dragged']);
      }
    }
  })();

  var showToolTip = function (e) {
    if (!options.enableToolTip) {
      return;
    }
    ruler.prototype.utils.addClasss(guideLine, 'rul_tooltip');
  };

  var updateToolTip = function (x, y) {
    if (y) {
      guideLine.dataset.tip = 'Y: ' + Math.round((y - options.rulerHeight - 1 - _curPosDelta) * _curScale) + ' px';
    }
    else {
      guideLine.dataset.tip = 'X: ' + Math.round((x - options.rulerHeight - 1 - _curPosDelta) * _curScale) + ' px';
    }
  };

  var hideToolTip = function (e) {
    ruler.prototype.utils.removeClasss(guideLine, 'rul_tooltip');
  };

  var destroy = function () {
    draggable.stopMoving();
    moveCB = null;
    guideLine.removeEventListener('mousedown', mousedown);
    guideLine.removeEventListener('mouseup', mouseup);
    guideLine.removeEventListener('dblclick', dblclick);
    guideLine.parentNode && guideLine.parentNode.removeChild(guideLine);
  };

  var hide = function () {
    guideLine.style.display = 'none';
  };

  var show = function () {
    guideLine.style.display = 'block';
  };

  var mousedown = function (e) {
    e.stopPropagation();
    draggable.startMoving();
  };

  var mouseup = function (e) {
    draggable.stopMoving();
  };

  var dblclick = function (e) {
    e.stopPropagation();
    destroy();
  };

  guideLine.addEventListener('mousedown', mousedown);

  guideLine.addEventListener('mouseup', mouseup);

  guideLine.addEventListener('dblclick', dblclick);
  if(event) draggable.startMoving(event);

  self = {
    setAsDraggable: draggable,
    startDrag: draggable.startMoving,
    stopDrag: draggable.stopMoving,
    destroy: destroy,
    curScale: curScale,
    assigned: assigned,
    curPosDelta: curPosDelta,
    guideLine: guideLine,
    dimension: dimension,
    hide: hide,
    show: show
  };
  return self;

};