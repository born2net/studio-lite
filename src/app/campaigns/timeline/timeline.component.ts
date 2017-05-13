import { Component, OnInit, Input, AfterViewChecked, OnChanges, EventEmitter, Output } from '@angular/core';

declare let $: any;
declare let Draggable: any;
declare let TweenLite: any;

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, AfterViewChecked, OnChanges {
  $container;

  ruler = undefined;
  dev = false;
  draggingItem;
  scrollPosition = 0;

  defaultState = {
    duration: 3600,
    gridWidth: 36000,
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

  @Output() itemsMoved = new EventEmitter<Object>();
  @Output() itemAdded = new EventEmitter<Object>();
  @Output() itemsClicked = new EventEmitter<Object>();
  @Output() itemsResized = new EventEmitter<Object>();

  @Output() channelAdded = new EventEmitter<Object>();
  @Output() channelClicked = new EventEmitter<Object>();

  @Output() outputAdded = new EventEmitter<Object>();
  @Output() outputClicked = new EventEmitter<Object>();

  @Output() closedGaps = new EventEmitter<Object>();
  @Output() resizedToLargest = new EventEmitter<Object>();
  @Output() alignedLeft = new EventEmitter<Object>();
  @Output() alignedRight = new EventEmitter<Object>();


  constructor() { }

  ngOnInit() {
    // reset item selection when the container is clicked
    this.$container.click((e) => {
      if (!$(e.target).hasClass('box') && !$(e.target).hasClass('box-image') && !$(e.target).hasClass('item-title')) {
        this.resetSelection();
      }
    });
  }

  ngOnChanges() {
    // ngOnChanges gets called first, so initialize here
    this.$container = $('#container');

    this.state = Object.assign({}, this.defaultState, this.state.toJS());

    this.initializeStateChanges();
  }

  initializeStateChanges() {
    // draw channels
    this.drawChannels();

    // initialize item positions
    this.state.items.map((item) => {
      item.left = item.start * (10 / this.state.zoom);
      item.width = item.duration * (10 / this.state.zoom);
      item.top = this.getChannelById(item.channel).top;
      item.overlapsLeft = [];
      item.overlapsRight = [];
    });
  }

  ngAfterViewChecked() {
    var self = this;
    this.state.items.map((item, i) => {
      if (item.$el === undefined) {


        var startX, startY;
        var companions;
        var lastOverlap = 0;

        item.$el = $("li[data-bid='" + i + "']");

        if (item.selected) {
          item.$el.addClass('ui-selected');
        }

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

              // only allow objects to stop at positions that represent whole numbers of seconds
              var timeValue = Math.round(endValue * self.state.zoom / 10);
              return timeValue * (10 / self.state.zoom);
            }
          },
          onRelease: function () {
            // emit click event for selected items on release
            var selectedItems = self.state.items.filter(i => i.selected);
            self.itemsClicked.emit(selectedItems);
            // console.log("Item clicked: ", selectedItems);
          },
          onPress: function(e) {
            // mutli-select functionality
            if (!e.ctrlKey && $(".box.ui-selected").length == 1) {
              self.resetSelection();
            }
            self.selectItem(item);
            e.stopPropagation();

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
              // self.state.items.filter(item => item.selected).map((selectedItem) => {
              //   self.state.items.filter(item => !item.selected).map((otherItem) => {
              //     if (selectedItem.channel == otherItem.channel) {
              //       var selectedItemId = self.state.items.indexOf(selectedItem);
              //
              //       var min = 0,
              //         max = (selectedItem.channel.type == "common" ? 13000 : self.state.gridWidth) - otherItem.width;
              //
              //       if (selectedItem.left >= otherItem.left + otherItem.width / 2 - 10 &&
              //         selectedItem.left <= otherItem.left + otherItem.width / 2 + 10) {
              //         self.moveItem(otherItem, Math.min(max, Math.max(min, selectedItem.left + selectedItem.width)), otherItem.top, 100);
              //       }
              //
              //       if (selectedItem.left + selectedItem.width >= otherItem.left + otherItem.width / 2 - 10 &&
              //         selectedItem.left + selectedItem.width <= otherItem.left + otherItem.width / 2 + 10) {
              //         self.moveItem(otherItem, Math.min(max, Math.max(min, selectedItem.left - otherItem.width)), otherItem.top, 100);
              //       }
              //     }
              //   });
              // });

              self.state.items.filter(item => item.selected).map((selectedItem) => {
                self.state.items.filter(item => !item.selected).map((otherItem) => {
                  if (selectedItem.channel == otherItem.channel) {
                    if (selectedItem.overlapsLeft == undefined) {
                      selectedItem.overlapsLeft = [];
                    }

                    if (selectedItem.overlapsRight == undefined) {
                      selectedItem.overlapsRight = [];
                    }

                    if (selectedItem.draggable.hitTest(otherItem.$el)) {
                      if (selectedItem.left <= otherItem.left &&
                        selectedItem.overlapsLeft.indexOf(otherItem) === -1 &&
                        selectedItem.overlapsRight.indexOf(otherItem) === -1
                      ) {
                        selectedItem.overlapsLeft.push(otherItem);
                      }
                      if (selectedItem.left > otherItem.left &&
                        selectedItem.overlapsRight.indexOf(otherItem) === -1 &&
                        selectedItem.overlapsLeft.indexOf(otherItem) === -1) {
                        selectedItem.overlapsRight.push(otherItem);
                      }
                    }
                  }
                });
                selectedItem.overlapsLeft.map((otherItem, idx) => {
                  if (!selectedItem.draggable.hitTest(otherItem.$el, "5%")) {
                    selectedItem.overlapsLeft.splice(idx, 1);
                  }
                });
                selectedItem.overlapsRight.map((otherItem, idx) => {
                  if (!selectedItem.draggable.hitTest(otherItem.$el, "5%")) {
                    selectedItem.overlapsRight.splice(idx, 1);
                  }
                });
              });

              self.state.items.filter(item => item.selected).map((selectedItem) => {
                selectedItem.overlapsLeft.map(otherItem => {
                        var min = 0,
                          max = (self.getChannelById(selectedItem.channel).type == "common" ? 13000 : self.state.gridWidth) - otherItem.width;

                  if (selectedItem.left + selectedItem.width >= otherItem.left + otherItem.width - 10 &&
                    selectedItem.left + selectedItem.width <= otherItem.left + otherItem.width + 10) {
                    self.moveItem(otherItem, Math.min(max, Math.max(min, otherItem.left - selectedItem.width)), otherItem.top, 100);
                    selectedItem.overlapsLeft = [];
                  }
                });

                selectedItem.overlapsRight.map(otherItem => {
                  var min = 0,
                    max = (self.getChannelById(selectedItem.channel).type == "common" ? 13000 : self.state.gridWidth) - otherItem.width;
                  if (selectedItem.left >= otherItem.left - 10 &&
                    selectedItem.left <= otherItem.left + 10) {

                    var newPos = otherItem.left + selectedItem.width;

                    self.moveItem(otherItem, Math.min(max, Math.max(min, newPos)), otherItem.top, 100);
                    selectedItem.overlapsRight = [];
                  }
                });
              });
            }
          }
        })[0];

        //connect object to drag event listener to update position
        item.draggable.addEventListener("drag", function() {
          item.left = this._gsTransform.x;
          item.start = item.left * self.state.zoom / 10;
          item.top = this._gsTransform.y;

          self.updateItemChannel(item);
        });

        item.draggable.addEventListener("dragend", function() {
          var selectedItems = self.state.items.filter(i => i.selected);
          self.itemsMoved.emit(selectedItems);
          // console.log("Item Moved: ", selectedItems);
        });

        // set item initial position
        this.moveItem(item, item.left, item.top);

        // resize functionality
        var startWidth; // define a start width to calculate deltas for multi-resize
        $('.resizable').resizable({
          handles: 'e, w',
          start: function (event, ui) {
            var id = ui.originalElement.data('bid');
            var resizingItem = self.state.items[id];

            startWidth = resizingItem.width;
            // console.log('start: ' + startWidth);
          },
          resize: function (event, ui) {
            // var newWidth = Math.round(ui.size.width / 10) * 10;
            // $(this).width(newWidth);
            var id = ui.originalElement.data('bid');
            var resizingItem = self.state.items[id];

            resizingItem.width = ui.size.width;
            resizingItem.duration = ui.size.width * self.state.zoom / 10;
            var widthDelta = resizingItem.width - startWidth;

            // resizingItem.width = newWidth;
            // resizingItem.duration = newWidth * (self.state.zoom / 10);
            // var widthDelta = newWidth - startWidth;

            // move any companions
            self.state.items.filter((item) => item.selected).map((selectedItem) => {
              if (selectedItem != resizingItem) {
                selectedItem.width += widthDelta;
                selectedItem.duration = selectedItem.width * self.state.zoom / 10;
              }
            });
            // console.log('newWidth: ' + resizingItem.width);

            startWidth = resizingItem.width;
          },
          stop: function (event, ui) {
            // resizable modifies the left which messes with things, so we undo it and calculate the offsets
            var left = parseInt($(this).css('left'));
            var id = ui.originalElement.data('bid');
            var resizingItem = self.state.items[id];

            $(this).css({ left: 0 });

            self.moveItem(resizingItem, resizingItem.left + left, resizingItem.top);

            var selectedItems = self.state.items.filter(i => i.selected);

            self.itemsResized.emit(selectedItems);
            // console.log("Item resized: " + selectedItems);
          }
        });

        // makes GSAP Draggable avoid clicks on the resize handles
        $('.ui-resizable-handle').attr('data-clickable', true);

        this.applyItemBounds();
      }
    });
  }

  timelineDurationChange(dur) {
    this.state.duration = dur;
    // console.log('new timeline duration: ', dur);
    this.updateContainerSize();
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

      channel.top = i * this.state.gridHeight;
      channel.$el = $("<div/>").css({
        height: this.state.gridHeight - 1,
        top: channel.top,
        left: 0
      }).addClass('timeline-row').appendTo(this.$container);

      //add ondrop event listener for accepting item drops
      channel.$el[0].ondrop = (e) => {
        e.preventDefault();

        var data = resources[e.dataTransfer.getData("text")];
        var offset = this.$container.offset();
        var left = e.x - offset.left;
        var top = i * this.state.gridHeight;

        this.addItem({
          resource: {
            src: data.src,
            type: data.type
          },
          title: data.name,
          type: type,
          left: left,
          width: 60 * (10 / this.state.zoom),
          channel: channel.id,
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
            width: this.state.gridWidth,
            height: this.state.outputs.length * this.state.gridHeight
          };
          item.draggable.applyBounds(bounds);
        } else if (item.type == 'channel') {
          if (this.getChannelById(item.channel).type == "common") {
            item.draggable.applyBounds({
              top: 0,
              left: 0,
              width: 13000,
              height: this.$container.height()
            });
          } else {
            var bounds = {
              left: 0,
              top: this.state.outputs.length * this.state.gridHeight,
              width: this.state.gridWidth,
              height: this.state.channels.length * this.state.gridHeight
            };
            item.draggable.applyBounds(bounds);
          }
        }
      }
    });
  }

  onScroll(e) {
    this.scrollPosition = e.target.scrollLeft;
  }

  drag(e, type, resourceIndex) {
    e.dataTransfer.setData("text", resourceIndex);
    this.draggingItem = type;
  }

  resizeToLargest() {
    var largest = this.state.items.reduce((accum, item) => {
      return Math.max(accum, item.width);
    }, 0);

    var resizedItems = this.state.items.filter(item => item.selected)
      .map((item) => {
        item.width = largest;
        item.duration = largest * this.state.zoom / 10;
        item.$el.css({ width: largest });
        return item;
      });

    this.resizedToLargest.emit(resizedItems);
    // console.log("Resized to largest", resizedItems);
  }

  closeGaps() {
    var channel;
    this.state.channels.concat(this.state.outputs).map((c) => {
      if (c.selected) {
        channel = c.id;
      }
    });
    for (var i = 0; i < this.state.items.length; ++i) {
      var item = this.state.items[i];
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
      this.closedGaps.emit(groupedItems);
      // console.log("Closed gaps", groupedItems);
    }
  }

  alignLeft() {
    var leftAlign = this.state.items.filter((item) => item.selected)
      .reduce((accum, item) => Math.min(accum, item.left), Infinity);

    var alignedItems = this.state.items.filter(item => item.selected)
      .map((item, i) => {
        this.moveItem(item, leftAlign, item.top);
        return item;
      });

    this.alignedLeft.emit(alignedItems);
    // console.log("Aligned Left", alignedItems);
  }

  alignRight() {
    var rightAlign = this.state.items.filter((item) => item.selected)
      .reduce((accum, item) => Math.max(accum, item.left + item.width), 0);

    var alignedItems = this.state.items.filter(item => item.selected)
      .map((item, i) => {
        this.moveItem(item, rightAlign - item.width, item.top);
        return item;
      });

    this.alignedRight.emit(alignedItems);
    // console.log("Aligned Right", alignedItems);
  }

  changeZoom(e) {
    if (!this.state) return;
    var zoomFactor = 10 / this.state.zoom;

    this.state.items.map((item) => {
      item.width = item.duration * zoomFactor;
      this.moveItem(item, item.start * zoomFactor, item.top);
    });

    this.updateContainerSize();
    this.applyItemBounds();
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

  updateItemChannel(item) {
    var newChannel = this.state.channels.filter((c) => c.top == item.top)[0];
    if (newChannel) {
      item.channel = newChannel.id;
      this.applyItemBounds();
    }
  }

  moveItem(item, x, y, dur = 0) {
    if (item) {
      x = (x === undefined) ? item.left : x;
      y = (y === undefined) ? item.top : y;

      TweenLite.to(item.$el[0], dur / 1000, { x: x, y: y });
      item.draggable.update(); // update the draggable position
      item.left = x;
      item.start = item.left * this.state.zoom / 10;
      item.top = y;

      this.updateItemChannel(item);
    }
  }

  addChannel(channel) {
    var newChannel = Object.assign(
      {},
      {
        id: -1,
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
    // console.log("Channel Added: " + newChannel);
  }

  addCommonChannel(channel) {
    var newChannel = Object.assign(
      {},
      {
        id: -1,
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
    // console.log("Channel added: " + newChannel);
  }

  addOutput(output) {
    var newOutput = Object.assign(
      {},
      {
        id: -1,
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
    // console.log("Output added: " + newOutput);
  }

  addItem(item) {
    var newItem = Object.assign(
      {},
      {
        id: -1,
        duration: item.width,
        start: item.left,
        overlapsLeft: [],
        overlapsRight: []
      },
      item
    );
    this.state.items.push(newItem);

    this.itemAdded.emit(newItem);
    // console.log("Item added: " + newItem);
  }

  getChannelById(id) {
    for (var i = 0; i < this.state.channels.length; ++i) {
      if (this.state.channels[i].id == id)
        return this.state.channels[i];
    }
    return false;
  }

  updateContainerSize() {
    this.state.gridWidth = this.state.duration * (10 / this.state.zoom);
    TweenLite.set(
      this.$container, {
        height: (this.state.channels.length + this.state.outputs.length) * this.state.gridHeight + 1,
        width: this.state.gridWidth
      }
    );
  }

  selectChannel(i) {
    var channel = this.state.channels[i];
    this.resetObjectSelection();
    channel.selected = true;
    this.channelClicked.emit(channel);
    // console.log("Channel clicked: " + channel);
  }

  selectItem(item) {
    //this.resetObjectSelection();
    this.state.channels
      .concat(this.state.outputs).map((o) => {
        o.selected = false;
      });
    item.selected = true;
    item.$el.addClass('ui-selected');
  }

  selectOutput(i) {
    var output = this.state.outputs[i];
    this.resetObjectSelection();
    output.selected = true;

    this.outputClicked.emit(output);
    // console.log("Output clicked: " + output);
  }

  resetObjectSelection() {
    this.state.channels
      .concat(this.state.outputs)
      .map((o) => {
        o.selected = false;
      });

    this.resetSelection();
  }

  deleteChannel(i) {
    var deleted = this.state.channels.splice(i, 1)[0];
    deleted.$el.remove();

    this.drawChannels();
  }

  deleteOutput(i) {
    var deleted = this.state.outputs.splice(i, 1)[0];
    deleted.$el.remove();

    // move all existing items on channels up one row
    this.state.items.filter((item) => item.type == 'channel').map((item) => {
      this.moveItem(item, item.left, item.top - this.state.gridHeight);
    });

    this.drawChannels();
  }

  deleteItem(i) {
    var deleted = this.state.items.splice(i, 1)[0];
  }

}
