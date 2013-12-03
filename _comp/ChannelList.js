/**
 the component is responsible for managing the UI list of blocks (i.e. resources and components such as QR etc)
 that a user is presented with, once a viewer inside a template is selected.
 @class ChannelList
 @constructor
 @return none
 **/

function ChannelList() {

    this.m_property = commBroker.getService('CompProperty');
    this.m_msdb = undefined;
    this.selected_block_id = undefined;
    this.selected_campaign_timeline_chanel_id = undefined;
    this.selected_campaign_timeline_id = undefined;
    this.selected_campaign_timeline_board_viewer_id = undefined;
    this._init();
};

ChannelList.prototype = {
    constructor: ChannelList,

    _init: function () {
        var self = this;

        $("#sortable").sortable();
        $("#sortable").disableSelection();
        $("#sortable").bind("sortstop", function (event, ui) {
            $("#sortable").listview('refresh');
            self._reOrderChannelBlocks();
        });

        self._wireUI();
        self._listenTimelineSelected();
    },

    /////////////////////////////////////////////////////////
    //
    // _reOrderChannelBlocks
    //
    //      update block / player offset times according
    //      to current state of LI
    //
    /////////////////////////////////////////////////////////

    _reOrderChannelBlocks: function () {
        var self = this
        var blocks = $("#sortable").children();
        var playerOffsetTime = 0;

        $(blocks).each(function (i) {
            var block_id = $(this).data('block_id');
            $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
                if (block_id == campaign_timeline_chanel_player_id) {
                    var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                    var playerDuration = recCampaignTimelineChannelPlayer['player_duration']

                    self.m_msdb.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                    var recEditCampaignTimelineSequence = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                    recEditCampaignTimelineSequence.player_offset_time = playerOffsetTime;
                    // log('player ' + block_id + ' offset ' + playerOffsetTime + ' playerDuration ' + playerDuration);
                    playerOffsetTime = parseFloat(playerOffsetTime) + parseFloat(playerDuration);
                }
            });
        });
    },

    _getTotalDurationChannel: function () {
        var self = this
        var blocks = $("#sortable").children();
        var totalChannelLength = 0;

        $(blocks).each(function (i) {
            var block_id = $(this).data('block_id');
            $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
                if (block_id == campaign_timeline_chanel_player_id) {
                    var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                    var playerDuration = recCampaignTimelineChannelPlayer['player_duration']
                    self.m_msdb.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                    // log('player ' + block_id + ' offset ' + totalChannelLength + ' playerDuration ' + playerDuration);
                    totalChannelLength = totalChannelLength + parseFloat(playerDuration);
                }
            });
        });
        return totalChannelLength;
    },

    _wireUI: function () {
        var self = this;
        $('#channelRemoveResource').tap(function (e) {
            if (self.selected_block_id == undefined) {
                $("#noResourceSelectedAlert").popup("open", {transition: 'pop', 'position-to': 'window', width: '400', height: '400'});
                return;
            }
            self._deleteChannelBlock();
        });

        $('#channelAddResource').tap(function (e) {
            if (self.selected_campaign_timeline_id == undefined) {
                alert('Please first select a channel to associate asset with');
                return;
            }
            self._openAddBlockWizard(e);
        });
    },

    _openAddBlockWizard: function (e) {
        var self = this;
        var addBlockWizard = new AddBlockWizard();
        addBlockWizard.newChannelBlockPage();
        commBroker.listenOnce(AddBlockWizard.ADD_NEW_BLOCK, function (e) {
            var player_code = e.edata;
            self._createNewChannelBlock(player_code);
            addBlockWizard.destroy();
            addBlockWizard.close();
            e.stopImmediatePropagation();
            e.preventDefault();
        });
    },

    _createNewChannelBlock: function (i_block_code) {
        var self = this;

        var totalChannelLength = self._getTotalDurationChannel();
        var helperSDK = commBroker.getService('HelperSDK');
        var jData = helperSDK.createNewPlayer(self.selected_campaign_timeline_chanel_id, i_block_code, totalChannelLength);
        var campaign_timeline_chanel_player_id = jData['campaign_timeline_chanel_player_id'];
        var campaign_timeline_chanel_player_data = jData['campaign_timeline_chanel_player_data'];

        var timeline = commBroker.getService('Campaign').getTimelineInstance(self.selected_campaign_timeline_id);
        var channel = timeline.getChannelInstance(self.selected_campaign_timeline_chanel_id);
        channel.createBlock(campaign_timeline_chanel_player_id, campaign_timeline_chanel_player_data)

        var campaign_timeline_board_viewer_id = self.selected_campaign_timeline_board_viewer_id;
        var campaign_timeline_id = self.selected_campaign_timeline_id;
        var campaign_timeline_chanel_id = self.selected_campaign_timeline_chanel_id;

        // self._resetChannel();
        $('#sortable').empty();
        self._loadChannelBlocks(campaign_timeline_id, campaign_timeline_chanel_id);
        self._listenOpenProps();
        // self._deselectBlocksFromChannel();
        self._selectLastBlockOnChannel();
        return false;
    },

    _listenTimelineSelected: function () {
        var self = this;

        commBroker.listen(ScreenTemplateFactory.ON_VIEWER_SELECTED, function (e) {

            self._resetChannel();

            self.m_msdb = commBroker.getValue(CompMSDB.msdb)
            self.selected_campaign_timeline_board_viewer_id = e.caller.campaign_timeline_board_viewer_id;
            self.selected_campaign_timeline_id = e.caller.campaign_timeline_id;

            if (e.context.m_owner instanceof Timeline) {

                var helperSDK = commBroker.getService('HelperSDK');
                var recCampaignTimelineViewerChanels = helperSDK.getChannelIdFromCampaignTimelineBoardViewer(self.selected_campaign_timeline_board_viewer_id, self.selected_campaign_timeline_id);
                self._loadChannelBlocks(self.selected_campaign_timeline_id, recCampaignTimelineViewerChanels['campaign_timeline_chanel_id']);
            }

            if (e.context.m_owner instanceof Sequencer) {
                self._resetChannel();
            }
        });
    },

    _loadChannelBlocks: function (i_campaign_timeline_id, i_campaign_timeline_chanel_id) {
        var self = this;

        self.selected_campaign_timeline_chanel_id = i_campaign_timeline_chanel_id;

        var timeline = commBroker.getService('Campaign').getTimelineInstance(i_campaign_timeline_id);
        var channel = timeline.getChannelInstance(i_campaign_timeline_chanel_id);
        var blocks = channel.getBlocks();

        for (var block_id in blocks) {
            var blockData = blocks[block_id].getBlockData();
            $('#sortable').append($('<li class="selectedResource" data-theme="b" data-block_id="' + blockData.blockID + '"><a href="#">' +
                '<img style="width: 50px ; height: 50px; margin-left: 20px; padding-top: 14px" src="' + blockData.blockIcon + '">' +
                '<h2>' + blockData.blockName + '</h2>' +
                '<p>' + blockData.blockDescription + '</p>' +
                '</a>' +
                '<a data-icon="gear" class="fixPropOpenLiButtonPosition selectedResource resourceOpenProperties"> </a>' +
                '</li>'));
        }

        $('#sortable').listview('refresh');
        self._listenOpenProps();
    },


    _listenOpenProps: function () {
        var self = this;


        $('.selectedResource').tap(function (e) {
            var openProps = $(e.target).closest('a').hasClass('resourceOpenProperties') ? true : false;
            var resourceElem = $(e.target).closest('li');
            // var resourceProp = $(resourceElem).find('.resourceOpenProperties');
            self.selected_block_id = $(resourceElem).data('block_id');

            $('.selectedResource').removeClass('liSelectedItem');
            $(resourceElem).addClass('liSelectedItem');

            /*
            $('.selectedResource').css({
                'background-image': 'none',
                'border-top': 'none',
                'border-bottom': '1px solid #e2e2e2'
            });

            $(resourceElem).css({
                'background-image': 'linear-gradient(#ededed , #ededed)',
                'border-bottom': '1px solid #d5d5d5'
                // 'border-top': '1px solid #d5d5d5',
            });

            $(resourceProp).css({
                'background-image': 'linear-gradient(#ededed , #ededed)',
                'border-bottom': '1px solid #d5d5d5'
            });*/


            // $('.selectedResource').css('background-image', 'linear-gradient(#fff , #f1f1f1)');
            // $(resourceElem).css('background-image', 'linear-gradient(#e0e0e0 , #e0e0e0)');
            // $(resourceProp).css('background-image', 'linear-gradient(#bebebe , #bebebe)');

            self._blockChannelSelected();

            if (openProps)
                commBroker.getService('CompProperty').openPanel(e);

            e.stopImmediatePropagation();
            $('#sortable').listview('refresh');
            return false;
        });
    },

    _blockChannelSelected: function () {
        var self = this;
        commBroker.fire(Block.BLOCK_ON_CHANNEL_SELECTED, this, null, self.selected_block_id);
    },

    _resetChannel: function () {
        var self = this;
        $('#sortable').empty();
        self.selected_block_id = undefined;
        self.selected_campaign_timeline_board_viewer_id = undefined;
        self.selected_campaign_timeline_id = undefined;
        self.selected_campaign_timeline_chanel_id = undefined;
    },

    _deselectBlocksFromChannel: function () {
        var self = this;
        self.selected_block_id = undefined;
        $('.selectedResource').css('background-image', 'linear-gradient(#fff , #f1f1f1)');
        self.m_property.noPanel();
        $('#sortable').listview('refresh');
    },

    _selectLastBlockOnChannel: function () {
        var self = this
        var blocks = $("#sortable").children();
        var block = undefined;
        $(blocks).each(function (i) {
            block = this;
        });
        if (block)
            $(block).tap();
    },

    _deleteChannelBlock: function () {
        var self = this;
        var selectedLI = $('#sortable').find('[data-block_id="' + self.selected_block_id + '"]');
        selectedLI.remove();
        // self.m_property.noPanel();
        // self.m_dbidSelected = undefined;
        // $('#sortable').listview('refresh');
        self._deselectBlocksFromChannel();

    }
}