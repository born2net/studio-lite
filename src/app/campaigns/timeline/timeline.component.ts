import { Component, OnInit, Input, AfterViewChecked, EventEmitter, Output } from '@angular/core';

import { TimelineRulerComponent } from '../timeline-ruler/timeline-ruler.component';

declare let $: any;
declare let Draggable: any;
declare let TweenLite: any;
declare let ruler: any;

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, AfterViewChecked {
  $container;

  ruler = undefined;

  draggingItem;

  defaultState = {
    gridWidth: 1776,
    gridHeight: 50,
    items: [],
    channels: [],
    outputs: [],
    selectedChannel: undefined,
    selectedItem: undefined,
    selectedOutput: undefined,
    frozen: false,
    magnetic: false,
    switch: false,
    zoom: 1
  };

  @Input() resources;
  @Input() state;

  @Output() itemMoved = new EventEmitter<Object>();
  @Output() itemAdded = new EventEmitter<Object>();
  @Output() itemClicked = new EventEmitter<Object>();

  @Output() channelAdded = new EventEmitter<Object>();
  @Output() channelClicked = new EventEmitter<Object>();

  @Output() outputAdded = new EventEmitter<Object>();
  @Output() outputClicked = new EventEmitter<Object>();


  constructor() { }

  ngOnInit() {
    this.state = Object.assign({}, this.defaultState, this.state);

    this.$container = $('#container');

    // initialize item positions
    this.state.items.map((item) => {
      item.left = item.start * (1 / this.state.zoom);
      item.width = item.duration * (1 / this.state.zoom);
      item.top = item.channel * this.state.gridHeight;
    });

    // reset item selection when the container is clicked
    this.$container.click((e) => {
      if (!$(e.target).hasClass('box') && !$(e.target).hasClass('box-image') && !$(e.target).hasClass('item-title')) {
        this.resetSelection();
      }
    });

    // this.ruler = new ruler({
    //   container: document.querySelector('.ruler'),// reference to DOM element to apply rulers on
    //   rulerHeight: 50, // thickness of ruler
    //   fontFamily: 'arial',// font for points
    //   fontSize: '10px',
    //   cornerSides: [],
    //   strokeStyle: 'black',
    //   lineWidth: 1,
    //   enableMouseTracking: false,
    //   enableToolTip: false,
    //   sides: ['top']
    // });
    //
    // this.ruler.api.setScale(this.state.zoom);

    // draw channels
    this.drawChannels();

    // draw outputs
    //this.drawOutputs();
  }

  ngAfterViewChecked() {
    this.state.items.map((item, i) => {
      if (item.$el === undefined) {
        var self = this;

        var startX, startY;
        var companions;
        var lastOverlap = 0;

        item.$el = $("li[data-bid='" + i + "']");

        var container = this.$container;

        item.draggable = Draggable.create(item.$el, {
          bounds: self.$container,
          edgeResistance: 1.0,
          type: "x,y",
          throwProps: false,
          lockAxis: false,
          x: 0,
          y: 0,
          liveSnap: {
            y: function(endValue) { return Math.round(endValue / self.state.gridHeight) * self.state.gridHeight; },
            x: function(endValue) {
              // magnetic snapping
              if (self.state.magnetic) {
                self.state.items.filter(filterItem => filterItem != item && filterItem.channel == item.channel).map((otherItem) => {
                  if (endValue >= otherItem.left + otherItem.width - 5 &&
                    endValue <= otherItem.left + otherItem.width + 5) {
                    endValue = otherItem.left + otherItem.width;
                  }

                  if (endValue + item.width >= otherItem.left - 5 &&
                    endValue + item.width <= otherItem.left + 5) {
                    endValue = otherItem.left - item.width;
                  }
                });
              }

              return endValue;

            }
          },
          onPress: function(e) {
            // select item
            self.selectItem(item);

            // mutli-select functionality
            if (!e.ctrlKey && $(".box.ui-selected").length == 1) {
              self.resetSelection();
            }
            $(this.target).addClass('ui-selected');
            e.stopPropagation();

            // emit click event for item
            self.itemClicked.emit(item);

            //when the user presses, we'll create an array ("companions") and populate it with all the OTHER elements that have the ".ui-selected" class applied (excluding the one that's being dragged). We also record their x and y position so that we can apply the delta to it in the onDrag.
            var boxes = $(".box.ui-selected"),
              i = boxes.length;

            companions = [];
            startX = this.x;
            startY = this.y;

            while (--i > -1) {
              var boxId = $(boxes[i]).data('bid');
              if (boxes[i] !== this.target) {
                companions.push({
                  e: e,
                  selfId: self.state.items.indexOf(item),
                  item: self.state.items[boxId],
                  itemId: boxId,
                  element: boxes[i],
                  x: boxes[i]._gsTransform.x,
                  y: boxes[i]._gsTransform.y,
                  lastX: boxes[i]._gsTransform.x,
                  lastY: boxes[i]._gsTransform.y
                });
              } else {
                self.state.items[boxId].selected = true;
              }
            }
            TweenLite.killTweensOf(".box");
          },
          onDrag: function() {
            // update item bounds based on type of channel for common channels
            self.state.items.filter((item) => item.type == 'channel').map((item, idx) => {
              var channelNum = Math.floor(item.top / self.state.gridHeight);

              item.channel = channelNum;
              
              if (channelNum >= self.state.outputs.length) {
                var channel = self.state.channels[Math.floor(item.top / self.state.gridHeight) - self.state.outputs.length];

                if (channel && channel.type == "common") {
                  item.draggable.applyBounds({
                    top: 0,
                    left: 0,
                    width: 13000,
                    height: self.$container.height()
                  });
                } else {
                  var bounds = {
                    left: 0,
                    top: self.state.outputs.length * self.state.gridHeight,
                    width: self.state.gridWidth * (1 / self.state.zoom),
                    height: self.state.channels.length * self.state.gridHeight
                  };
                  item.draggable.applyBounds(bounds);
                }
              }


            });

            // mutliselect movement
            var i = companions.length,
              deltaX = this.x - startX,
              deltaY = this.y - startY,
              companion;

            while (--i > -1) {
              companion = companions[i];

              self.moveItem(companion.item, companion.x + deltaX, companion.y + deltaY);

              if (!companion.item.draggable.hitTest('#container', "100%")) { // if the item is moved outside of the bounds, move it back
                self.moveItem(companion.item, companion.lastX, companion.lastY);
              } else {
                companion.lastX = companion.x + deltaX;
                companion.lastY = companion.y + deltaY;
              }

              // start the companion dragging with the original event
              self.state.items[companion.selfId].draggable.startDrag(companion.e);
            }

            // switch
            if (self.state.switch) {
              self.state.items.filter(item => item.selected).map((selectedItem) => {
                self.state.items.filter(item => !item.selected).map((otherItem) => {
                  if (selectedItem.channel == otherItem.channel) {
                    var selectedItemId = self.state.items.indexOf(selectedItem);

                    var min = 0,
                      max = (selectedItem.channel.type == "common" ? 1300 : self.state.gridWidth) - otherItem.width;

                    if (selectedItem.left >= otherItem.left + otherItem.width / 2 - 10 &&
                      selectedItem.left <= otherItem.left + otherItem.width / 2 + 10) {
                      self.moveItem(otherItem, Math.min(max, Math.max(min, selectedItem.left + selectedItem.width)), otherItem.top, 100);
                    }

                    if (selectedItem.left + selectedItem.width >= otherItem.left + otherItem.width / 2 - 10 &&
                      selectedItem.left + selectedItem.width <= otherItem.left + otherItem.width / 2 + 10) {
                      self.moveItem(otherItem, Math.min(max, Math.max(min, selectedItem.left - otherItem.width)), otherItem.top, 100);
                    }
                  }
                });
              });
            }
          }
        })[0];

        //connect object to drag event listener to update position
        item.draggable.addEventListener("drag", function() {
          item.left = this._gsTransform.x;
          item.start = item.left * self.state.zoom;
          item.top = this._gsTransform.y;
        });

        item.draggable.addEventListener("dragend", function() {
          self.itemMoved.emit(item);
        });

        // set item initial position
        this.moveItem(item, item.left, item.top);

        // resize functionality
        var startWidth; // define a start width to calculate deltas for multi-resize
        $('.resizable').resizable({
          handles: 'e, w',
          start: function(event, ui) {
            var id = ui.originalElement.data('bid');
            var resizingItem = self.state.items[id];

            startWidth = resizingItem.width;
          },
          create: function(event, ui) { },
          resize: function(event, ui) {
            var id = ui.originalElement.data('bid');
            var resizingItem = self.state.items[id];
            resizingItem.width = ui.size.width;
            resizingItem.duration = ui.size.width * self.state.zoom;

            var widthDelta = resizingItem.width - startWidth;

            // move any companions
            self.state.items.filter((item) => item.selected).map((selectedItem) => {
              if (selectedItem != resizingItem) {
                selectedItem.width += widthDelta;
                selectedItem.duration = selectedItem.width * self.state.zoom;
              }
            });

            startWidth = resizingItem.width;
          },
          stop: function(event, ui) {
            // resizable modifies the left which messes with things, so we undo it and calculate the offsets
            var left = parseInt($(this).css('left'));
            var id = ui.originalElement.data('bid');
            var resizingItem = self.state.items[id];

            $(this).css({ left: 0 });

            self.moveItem(resizingItem, resizingItem.left + left, resizingItem.top);
          }
        });

        // makes GSAP Draggable avoid clicks on the resize handles
        $('.ui-resizable-handle').attr('data-clickable', true);

        this.applyItemBounds();
      }
    });
  }

  resetSelection() {
    $('.resizable').removeClass('ui-selected');
    this.state.items.map((item) => {
      item.selected = false;
    })
  }

  drawChannels() {
    this.$container.find(".timeline-row").remove();

    this.state.outputs.concat(this.state.channels).map((channel, i) => {
      var type = this.state.channels.indexOf(channel) !== -1 ? "channel" : "output";
      var resources;

      if (type == "channel") {
        resources = this.resources.items;
      } else {
        resources = this.resources.outputs;
      }
      // create element for channel and append it to the container
      channel.$el = $("<div/>").css({
        height: this.state.gridHeight - 1,
        top: i * this.state.gridHeight,
        left: 0
      }).addClass('timeline-row').appendTo(this.$container);

      // add ondrop event listener for accepting item drops
      channel.$el[0].ondrop = (e) => {
        e.preventDefault();

        var data = resources[e.dataTransfer.getData("text")];
        var offset = this.$container.offset();
        var left = e.x - offset.left;
        var top = Math.floor((e.y - offset.top) / this.state.gridHeight) * this.state.gridHeight;

        this.addItem({
          resource: data.src,
          title: data.name,
          type: type,
          left: left,
          width: 60 * (1 / this.state.zoom),
          channel: Math.floor(top / this.state.gridHeight),
          top: top,
          draggable: undefined,
          $el: undefined,
          selected: false
        });
      };

      channel.$el[0].ondragover = (e) => {
        if (type == this.draggingItem) {
          e.preventDefault();
        }
      };
    });

    //set the container's size to match the grid, and ensure that the box widths/heights reflect the variables above
    this.updateContainerSize();

    this.applyItemBounds();
  }

  applyItemBounds() {
    this.state.items.map((item) => {
      if (item.draggable !== undefined) {
        if (item.type == 'output') {
          var bounds = {
            left: 0,
            top: 0,
            width: this.state.gridWidth * (1 / this.state.zoom),
            height: this.state.outputs.length * this.state.gridHeight
          };
          item.draggable.applyBounds(bounds);
        } else if (item.type == 'channel') {
          var bounds = {
            left: 0,
            top: this.state.outputs.length * this.state.gridHeight,
            width: this.state.gridWidth * (1 / this.state.zoom),
            height: this.state.channels.length * this.state.gridHeight
          };
          item.draggable.applyBounds(bounds);
        }
      }
    });
  }


  drag(e, type, resourceIndex) {
    e.dataTransfer.setData("text", resourceIndex);
    this.draggingItem = type;
  }

  resizeToLargest() {
    var largest = this.state.items.reduce((accum, item) => {
      return Math.max(accum, item.width);
    }, 0);

    this.state.items.filter(item => item.selected)
      .map((item) => {
        item.width = largest;
        item.duration = largest * this.state.zoom;
        item.$el.css({ width: largest });
      });
  }

  closeGaps() {
    var channel;
    for (var i = 0; i < this.state.items.length; ++i) {
      var item = this.state.items[i];
      item.channel = Math.floor((item.top) / this.state.gridHeight);
      if (item.selected) {
        channel = item.channel;
      }
    }
    if (channel !== undefined) {
      // get the items in this channel and sort them left to right
      var groupedItems = this.state.items.filter((item) => {
        return item.channel == channel;
      }).sort((a, b) => {
        return a.left - b.left;
      });

      // place the channels
      var nextStartPos = 0;
      groupedItems.map((item, i) => {
        this.moveItem(item, nextStartPos, item.top);
        nextStartPos += item.width;
      });
    }
  }

  alignLeft() {
    var leftAlign = this.state.items.filter((item) => item.selected)
      .reduce((accum, item) => Math.min(accum, item.left), Infinity);

    this.state.items.filter(item => item.selected)
      .map((item, i) => {
        this.moveItem(item, leftAlign, item.top)
      });
  }

  alignRight() {
    var rightAlign = this.state.items.filter((item) => item.selected)
      .reduce((accum, item) => Math.max(accum, item.left + item.width), 0);

    this.state.items.filter(item => item.selected)
      .map((item, i) => {
        this.moveItem(item, rightAlign - item.width, item.top)
      });
  }

  changeZoom(e) {
    var zoomFactor = 1 / this.state.zoom;

    this.state.items.map((item) => {
      item.width = item.duration * zoomFactor;
      this.moveItem(item, item.start * zoomFactor, item.top);
    });

    this.updateContainerSize();
    this.applyItemBounds();

    //this.ruler.api.setScale(this.state.zoom);
  }

  toggleFrozen(e) {
    this.state.frozen = !this.state.frozen;

    if (this.state.frozen) {
      this.state.items.map((item) => {
        item.draggable.disable();
      });
    } else {
      this.state.items.map((item) => {
        item.draggable.enable();
      });
    }
  }

  moveItem(item, x, y, dur = 0) {
    if (item) {
      x = (x === undefined) ? item.left : x;
      y = (y === undefined) ? item.top : y;

      TweenLite.to(item.$el[0], dur / 1000, { x: x, y: y });
      item.draggable.update(); // update the draggable position
      item.left = x;
      item.start = item.left * this.state.zoom;
      item.top = y;
    }
  }

  addChannel(channel) {
    var newChannel = Object.assign(
      {},
      {
        id: this.state.channels[this.state.channels.length - 1].id + 1,
        $el: undefined,
        name: "CH" + this.state.channels.length,
        type: "normal",
        color: '#00FFFF'
      },
      channel
    );
    this.state.channels.push(newChannel);
    this.drawChannels();

    this.channelAdded.emit(newChannel);
  }

  addCommonChannel(channel) {
    var newChannel = Object.assign(
      {},
      {
        id: this.state.channels[this.state.channels.length - 1].id + 1,
        $el: undefined,
        name: "CH" + this.state.channels.length,
        type: "common",
        color: '#0000FF'
      },
      channel
    );
    this.state.channels.push(newChannel);
    this.drawChannels();

    this.channelAdded.emit(newChannel);
  }

  addOutput(output) {
    var newOutput = Object.assign(
      {},
      {
        id: this.state.outputs[this.state.outputs.length - 1].id + 1,
        name: "Output",
        color: "#000"
      },
      output
    );

    this.state.outputs.push(newOutput);

    // move all existing items on channels down one row
    this.state.items.filter((item) => item.type == 'channel').map((item) => {
      this.moveItem(item, item.left, item.top + this.state.gridHeight);
    });
    this.drawChannels();

    this.outputAdded.emit(newOutput);
  }

  addItem(item) {
    var newItem = Object.assign(
      {},
      {
        id: this.state.items[this.state.items.length - 1].id + 1,
        duration: item.width,
        start: item.left
      },
      item
    );
    this.state.items.push(newItem);

    this.itemAdded.emit(newItem);
  }

  updateContainerSize() {
    TweenLite.set(
      this.$container, {
        height: (this.state.channels.length + this.state.outputs.length) * this.state.gridHeight + 1,
        width: (this.state.gridWidth + 1) * (1 / this.state.zoom)
      }
    );
    //this.ruler.api.setScale(this.state.zoom);
  }

  selectChannel(i) {
    var channel = this.state.channels[i];
    this.resetObjectSelection();
    channel.selected = true;
    this.channelClicked.emit(channel);
  }

  selectItem(item) {
    //this.resetObjectSelection();
    this.state.channels
      .concat(this.state.outputs).map((o) => {
      o.selected = false;
    });
    item.selected = true;
  }

  selectOutput(i) {
    var output = this.state.outputs[i];
    this.resetObjectSelection();
    output.selected = true;

    this.outputClicked.emit(output);
  }

  resetObjectSelection() {
    this.state.channels
      .concat(this.state.outputs)
      .concat(this.state.items).map((o) => {
      o.selected = false;
    });
  }

  deleteChannel(i) {
    var deleted = this.state.channels.splice(i, 1);
    deleted.$el.remove();

    this.drawChannels();
  }

  deleteOutput(i) {
    var deleted = this.state.outputs.splice(i, 1);
    deleted.$el.remove();

    // move all existing items on channels up one row
    this.state.items.filter((item) => item.type == 'channel').map((item) => {
      this.moveItem(item, item.left, item.top - this.state.gridHeight);
    });

    this.drawChannels();
  }

  deleteItem(i) {
    var deleted = this.state.items.splice(i, 1);
  }

}
