/**
 The Helper SDK is a wrapper for the Soap API used to communicate with MediaSignage servers
 The SDK makes programming easier by abstracting some of the tasks such as for loops
 and internal comparisons for you don't have to enumerate repetitively.

 The internal Database is the magic sauce as it maps against the actual mediaSERVER database via
 local generated handles (aka IDs). Once a user saves the his local configuration, the local Database is serialized
 and pushed onto the remote mediaSERVER. This allows for the user to work offline without the need for constant network
 communication until a save process is executed.

 The internal database is referenced as msdb in both code and documentation.

 @class HelperSDK
 @constructor
 @return {Object} HelperSDK instance
 **/

function HelperSDK() {

    this.self = this;

    /**
     m_msdb is the reference to the internal Database we use to save/load/modify all application data through
     @property m_msdb
     @type Object
     */

    this.m_msdb = undefined;
};

HelperSDK.prototype = {
    constructor: HelperSDK,

    init: function (i_loaderManager, i_msdb) {
        var self = this;
        self.m_loaderManager = i_loaderManager;
        self.m_msdb = i_msdb;
    },

    /**
     Create a new campaign in the local database
     @method createCampaign
     @param i_campgianName {string} name of campaign to create
     @return {Number} campaign id
     **/

    createCampaign: function (i_campgianName) {
        var self = this;
        var campaigns = self.m_msdb.table_campaigns();
        var campaign = campaigns.createRecord();
        campaign.campaign_name = i_campgianName;
        campaigns.addRecord(campaign);
        return campaign['campaign_id'];
    },

    /**
     Create a new board, also known as Screen (screen divisions reside inside the board as viewers)
     @method createBoard
     @param i_boardName {string} the board's name
     @param i_width {string} board width
     @param i_height {string} board's height
     @return {Number} the board's id
     **/

    createBoard: function (i_boardName, i_width, i_height) {
        var self = this;
        var boards = self.m_msdb.table_boards();
        var board = boards.createRecord();
        board.board_name = i_boardName;
        board.board_pixel_width = i_width;
        board.board_pixel_height = i_height;
        boards.addRecord(board);
        return board['board_id'];
    },

    /////////////////////////////////////////////////////////
    //
    // assignCampaignToBoard
    //
    /////////////////////////////////////////////////////////

    assignCampaignToBoard: function (i_campaign_id, i_board_id) {
        var self = this;
        var campaign_boards = self.m_msdb.table_campaign_boards();
        var board = campaign_boards.createRecord();
        board.campaign_id = i_campaign_id;
        board.board_id = i_board_id;
        campaign_boards.addRecord(board);
    },

    /////////////////////////////////////////////////////////
    //
    // getFirstBoardIDofCampaign
    //
    //      get the first board_id (output) that is assigned
    //      to the specified campaign_id
    //
    // return:
    //      campaign_board_id
    //
    /////////////////////////////////////////////////////////

    getFirstBoardIDofCampaign: function (i_campaign_id) {
        var self = this;
        var totalBoardsFound = 0;
        var foundBoardID = -1;

        $(self.m_msdb.table_campaign_boards().getAllPrimaryKeys()).each(function (k, board_id) {
            var recCampaignBoard = self.m_msdb.table_campaign_boards().getRec(board_id);
            if (i_campaign_id == recCampaignBoard.campaign_id && totalBoardsFound == 0) {
                foundBoardID = recCampaignBoard['board_id']
                totalBoardsFound++;
            }
        });

        return foundBoardID;
    },

    /////////////////////////////////////////////////////////
    //
    // createTimelineChannels
    //
    //      create channels and assign these channels
    //      to the timeline
    //
    // return array:
    //      createdChanels
    //
    /////////////////////////////////////////////////////////

    createTimelineChannels: function (i_campaign_timeline_id, i_viewers) {
        var self = this;
        var createdChanels = [];
        var i = -1;

        for (var i in i_viewers) {
            i++;
            var chanels = self.m_msdb.table_campaign_timeline_chanels();
            var chanel = chanels.createRecord();
            chanel.chanel_name = "CH" + i;
            chanel.campaign_timeline_id = i_campaign_timeline_id;
            chanels.addRecord(chanel);
            createdChanels.push(chanel['campaign_timeline_chanel_id']);
        }
        return createdChanels;
    },

    /////////////////////////////////////////////////////////
    //
    // createNewTemplate
    //
    //      create a new global template (screen divisions)
    //      and assign the new template to the given global
    //      board_id
    //
    // return object:
    //      board_template_id
    //      viewer ids created
    //
    /////////////////////////////////////////////////////////

    createNewTemplate: function (i_board_id, i_screenProps) {
        var self = this;

        var returnData = {
            board_template_id: -1,
            viewers: []
        };

        // create screen template under board_id
        var boardTemplates = self.m_msdb.table_board_templates();
        var boardTemplate = boardTemplates.createRecord();
        boardTemplate.template_name = "board template";
        boardTemplate.board_id = i_board_id; // bind screen template to board
        boardTemplates.addRecord(boardTemplate);

        var board_template_id = boardTemplate['board_template_id'];

        // add viewers (screen divisions)
        var viewers = self.m_msdb.table_board_template_viewers();
        var i = 0;
        for (var screenValues in i_screenProps) {
            i++;
            var viewer = viewers.createRecord();
            viewer.viewer_name = "Viewer" + i;
            viewer.pixel_width = i_screenProps[screenValues]['w'];
            viewer.pixel_height = i_screenProps[screenValues]['h'];
            viewer.pixel_x = i_screenProps[screenValues]['x'];
            viewer.pixel_y = i_screenProps[screenValues]['y'];
            viewer.board_template_id = boardTemplate.board_template_id; // bind screen division to screen template
            viewers.addRecord(viewer);
            returnData['viewers'].push(viewer['board_template_viewer_id']);
        }

        returnData['board_template_id'] = board_template_id

        return returnData;

    },

    /////////////////////////////////////////////////////////
    //
    // createNewTimeline
    //
    //      create a new timeline under the specified
    //      campaign_id and assign the specified
    //      i_board_template_id (screen division template)
    //      to that campaign
    //
    // return:
    //      campaign_timeline_id
    //
    /////////////////////////////////////////////////////////

    createNewTimeline: function (i_campaign_id, i_board_template_id) {
        var self = this;
        var timelines = self.m_msdb.table_campaign_timelines();
        var timeline = timelines.createRecord();
        timeline.campaign_id = i_campaign_id;
        timeline.timeline_name = "Timeline";
        timelines.addRecord(timeline);
        return timeline['campaign_timeline_id'];

    },

    /////////////////////////////////////////////////////////
    //
    // createNewPlayer
    //
    //      create a new player and add it to the specified
    //      channel_id
    //
    // return:
    //      player_id
    //
    /////////////////////////////////////////////////////////

    createNewPlayer: function (i_campaign_timeline_chanel_id, i_playerCode, i_offset) {
        var self = this;

        var timelinePlayers = self.m_msdb.table_campaign_timeline_chanel_players();
        var recTimelinePlayer = timelinePlayers.createRecord();
        recTimelinePlayer.player_data = '<Player player="' + i_playerCode + '"><Data><Resource Resource="' + i_playerCode + '" /></Data></Player>';
        recTimelinePlayer.campaign_timeline_chanel_id = i_campaign_timeline_chanel_id;
        recTimelinePlayer.player_duration = 10;
        recTimelinePlayer.player_offset_time = i_offset;
        timelinePlayers.addRecord(recTimelinePlayer);
        // todo: ask alon why can't add resource, only component addition works???

        return {
            campaign_timeline_chanel_player_id: recTimelinePlayer['campaign_timeline_chanel_player_id'],
            campaign_timeline_chanel_player_data: recTimelinePlayer['player_data']
        };
    },


    /////////////////////////////////////////////////////////
    //
    // assignTemplateToTimeline
    //
    //      bind the template (screen division template)
    //      to the specified timeline (i_campaign_timeline_id).
    //
    //      we need to also provide the board_template_id
    //      (screen template of the global board) as well as
    //      the campaign's board_id to complete the binding
    //
    // return:
    //      campaign_timeline_id
    //
    /////////////////////////////////////////////////////////

    assignTemplateToTimeline: function (i_campaign_timeline_id, i_board_template_id, i_campaign_board_id) {
        var self = this;
        var timelineTemplate = self.m_msdb.table_campaign_timeline_board_templates();
        timelineScreen = timelineTemplate.createRecord();
        timelineScreen.campaign_timeline_id = i_campaign_timeline_id;
        timelineScreen.board_template_id = i_board_template_id;
        timelineScreen.campaign_board_id = i_campaign_board_id;
        timelineTemplate.addRecord(timelineScreen);

        return timelineScreen['campaign_timeline_board_template_id'];
    },

    /////////////////////////////////////////////////////////
    //
    // assignViewersToTimelineChannels
    //
    //      assign viewers (division colors) on the timeline
    //      to screen divisions
    //
    // return
    //      none
    //
    /////////////////////////////////////////////////////////

    assignViewersToTimelineChannels: function (i_campaign_timeline_board_template_id, i_viewers, i_channels) {
        var self = this;
        var viewerChanels = self.m_msdb.table_campaign_timeline_board_viewer_chanels();
        for (var i in i_viewers) {
            var viewerChanel = viewerChanels.createRecord();
            viewerChanel.campaign_timeline_board_template_id = i_campaign_timeline_board_template_id;
            // viewerChanel.board_template_viewer_id = viewer_id.board_template_viewer_id;
            viewerChanel.board_template_viewer_id = i_viewers[i];
            viewerChanel.campaign_timeline_chanel_id = i_channels.shift();
            viewerChanels.addRecord(viewerChanel);
        }
    },


    /////////////////////////////////////////////////////////
    //
    // getCampaignTimelineSequencerIndex
    //
    //      get the sequence index of a timeline in campaign
    //
    // return
    //      sequenceIndex
    //
    /////////////////////////////////////////////////////////

    getCampaignTimelineSequencerIndex: function (i_campaign_timeline_id) {
        var self = this;
        var sequenceIndex = -1;

        $(self.m_msdb.table_campaign_timeline_sequences().getAllPrimaryKeys()).each(function (k, campaign_timeline_sequence_id) {
            var recCampaignTimelineSequence = self.m_msdb.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
            if (recCampaignTimelineSequence['campaign_timeline_id'] == i_campaign_timeline_id) {
                sequenceIndex = recCampaignTimelineSequence['sequence_index'];
            }
        });
        return sequenceIndex;
    },

    /////////////////////////////////////////////////////////
    //
    // setCampaignTimelineSequencerIndex
    //
    //      set the sequence index of a timeline in campaign
    //      if timeline is not found in sequencer, we insert
    //      it with supplied i_sequenceIndex
    //
    // return
    //      none
    //
    /////////////////////////////////////////////////////////

    setCampaignTimelineSequencerIndex: function (i_campaign_id, i_campaign_timeline_id, i_sequenceIndex) {
        var self = this;
        var updatedSequence = false;
        // todo does not save often when changing sequncer around ???

        $(self.m_msdb.table_campaign_timeline_sequences().getAllPrimaryKeys()).each(function (k, campaign_timeline_sequence_id) {
            var recCampaignTimelineSequence = self.m_msdb.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
            if (recCampaignTimelineSequence.campaign_timeline_id == i_campaign_timeline_id) {
                self.m_msdb.table_campaign_timeline_sequences().openForEdit(campaign_timeline_sequence_id);
                var recEditCampaignTimelineSequence = self.m_msdb.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
                recEditCampaignTimelineSequence.sequence_index = i_sequenceIndex;
                updatedSequence = true;
            }
        });

        // i_campaign_timeline_id was not found in the sequencer so create new record
        if (updatedSequence == false) {
            var table_campaign_timeline_sequences = self.m_msdb.table_campaign_timeline_sequences();
            var table_campaign_timeline_sequence = table_campaign_timeline_sequences.createRecord();
            table_campaign_timeline_sequence.sequence_index = i_sequenceIndex;
            table_campaign_timeline_sequence.campaign_timeline_id = i_campaign_timeline_id;
            table_campaign_timeline_sequence.campaign_id = i_campaign_id;
            table_campaign_timeline_sequences.addRecord(table_campaign_timeline_sequence);

        }
    },

    /////////////////////////////////////////////////////////
    //
    // getCampaignTimelineIdOfSequencerIndex
    //
    //      get the timeline id of the specifiec squence
    //      index offset (0 based)
    //
    // return
    //      sequenceIndex
    //
    /////////////////////////////////////////////////////////

    getCampaignTimelineIdOfSequencerIndex: function (i_campaign_id, i_sequence_index) {
        var self = this;
        var timeline_id = -1;
        $(self.m_msdb.table_campaign_timeline_sequences().getAllPrimaryKeys()).each(function (k, campaign_timeline_sequence_id) {
            var recCampaignTimelineSequence = self.m_msdb.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
            sequenceIndex = recCampaignTimelineSequence['sequence_index'];
            if (sequenceIndex == i_sequence_index && i_campaign_id == recCampaignTimelineSequence['campaign_id'])
                timeline_id = recCampaignTimelineSequence['campaign_timeline_id']
        });
        return timeline_id;
    },

    /////////////////////////////////////////////////////////
    //
    // getResources
    //
    //      get all none deleted (!=3) resources
    //
    // return array
    //      resources
    //
    /////////////////////////////////////////////////////////

    getResources: function () {
        var self = this;
        var resources = [];

        $(self.m_msdb.table_resources().getAllPrimaryKeys()).each(function (k, resource_id) {
            var recResource = self.m_msdb.table_resources().getRec(resource_id);
            // dont process deleted resources
            if (recResource['change_type'] == 3)
                return;
            var resourceName = resources.push(recResource);
        });
        return resources;
    },

    /////////////////////////////////////////////////////////
    //
    // getResourceRecordByNative
    //
    //      get all data of on related resource
    //
    // return
    //      resource record
    //
    /////////////////////////////////////////////////////////

    getResourceRecordByNative: function (i_native_id) {
        var self = this;
        var foundResourceRecord = undefined;

        $(self.m_msdb.table_resources().getAllPrimaryKeys()).each(function (k, resource_id) {
            var recResource = self.m_msdb.table_resources().getRec(resource_id);
            if (recResource['native_id'] == i_native_id) {
                foundResourceRecord = recResource;
                return;
            }
        });
        return foundResourceRecord;
    },

    getNativeByResoueceID: function (i_resource_id) {
        var self = this;
        var native_id = undefined;

        $(self.m_msdb.table_resources().getAllPrimaryKeys()).each(function (k, resource_id) {
            var recResource = self.m_msdb.table_resources().getRec(resource_id);
            if (recResource['resource_id'] == i_resource_id) {
                native_id = recResource['native_id'];
                return;
            }
        });
        return parseInt(native_id);
    },

    /////////////////////////////////////////////////////////
    //
    // getResourceRecord
    //
    //      get all data of on related resource
    //
    // return
    //      resource record
    //
    /////////////////////////////////////////////////////////

    getResourceRecord: function (i_resource_id) {
        var self = this;
        var foundResourceRecord = undefined;

        $(self.m_msdb.table_resources().getAllPrimaryKeys()).each(function (k, resource_id) {
            var recResource = self.m_msdb.table_resources().getRec(resource_id);
            if (recResource['resource_id'] == i_resource_id) {
                foundResourceRecord = recResource;
                return;
            }
        });
        return foundResourceRecord;
    },

    setResourceRecord: function (i_resource_id, i_key, i_value) {
        var self = this;

        $(self.m_msdb.table_resources().getAllPrimaryKeys()).each(function (k, resource_id) {
            var recResource = self.m_msdb.table_resources().getRec(resource_id);
            if (recResource['resource_id'] == i_resource_id) {
                recResource[i_key] = i_value;
                return;
            }
        });
    },

    getCampaignRecord: function (i_campaign_id) {
        var self = this;
        var foundCampaignRecord = undefined;

        $(self.m_msdb.table_campaigns().getAllPrimaryKeys()).each(function (k, campaign_id) {
            var recCampaign = self.m_msdb.table_campaigns().getRec(campaign_id);
            if (recCampaign['campaign_id'] == i_campaign_id) {
                foundCampaignRecord = recCampaign;
                return;
            }
        });
        return foundCampaignRecord;
    },

    setCampaignRecord: function (i_campaign_id, i_key, i_value) {
        var self = this;

        $(self.m_msdb.table_campaigns().getAllPrimaryKeys()).each(function (k, campaign_id) {
            var foundCampaignRecord = self.m_msdb.table_campaigns().getRec(campaign_id);
            if (foundCampaignRecord['campaign_id'] == i_campaign_id) {
                foundCampaignRecord[i_key] = i_value;
                return;
            }
        });
    },

    /////////////////////////////////////////////////////////
    //
    // getResourceType
    //
    //      return resource type of given i_native_id
    //
    // return
    //      resource type
    //
    /////////////////////////////////////////////////////////

    getResourceType: function (i_native_id) {
        var self = this;
        var resourceType = undefined;

        $(self.m_msdb.table_resources().getAllPrimaryKeys()).each(function (k, resource_id) {
            var recResource = self.m_msdb.table_resources().getRec(resource_id);
            if (recResource['native_id'] == i_native_id) {
                resourceType = recResource['resource_type'];
                return;
            }
        });
        return resourceType;
    },


    /////////////////////////////////////////////////////////
    //
    // getResourceType
    //
    //      return resource type of given i_native_id
    //
    // return
    //      resource type
    //
    /////////////////////////////////////////////////////////

    getResourceName: function (i_native_id) {
        var self = this;
        var resourceName = undefined;

        $(self.m_msdb.table_resources().getAllPrimaryKeys()).each(function (k, resource_id) {
            var recResource = self.m_msdb.table_resources().getRec(resource_id);
            if (recResource['native_id'] == i_native_id) {
                resourceName = recResource['resource_name'];
                return;
            }
        });
        return resourceName;
    },

    /////////////////////////////////////////////////////////
    //
    // uploadResources
    //
    //      upload files to server
    //
    // return
    //      resource list
    //
    /////////////////////////////////////////////////////////

    uploadResources: function (i_elementID) {
        var self = this;
        var resourceList = self.m_loaderManager.createResources(document.getElementById(i_elementID));
        alert('Be sure to Save your work to push the files to the servers');
        return resourceList;
    },

    /**
     set a block on the timeline_channel to specified length in seconds
     @method setBlockTimelineChannelBlockLength
     @param i_campaign_timeline_chanel_player_id {string} plyer / block id
     @param i_hours {number} total hours to play
     @param i_minutes {number} total minutes to play
     @param i_seconds {number} total seconds to play
     @return none
     **/

    setBlockTimelineChannelBlockLength: function (i_campaign_timeline_chanel_player_id, i_hours, i_minutes, i_seconds) {
        var self = this;

        var totalSecInMin = 60
        var totalSecInHour = totalSecInMin * 60
        var totalSeconds = parseInt(i_seconds) + (parseInt(i_minutes) * totalSecInMin) + (parseInt(i_hours) * totalSecInHour)

        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            if (campaign_timeline_chanel_player_id == i_campaign_timeline_chanel_player_id) {
                self.m_msdb.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                var recPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                recPlayer.player_duration = totalSeconds;
            }
        });
        // self.getBlockTimelineChannelBlockLength(i_campaign_timeline_chanel_player_id);
    },


    /**
     get a block's total hours / minutes / seconds playback length on timeline_channel
     @method getBlockTimelineChannelBlockLength
     @param i_campaign_timeline_chanel_player_id {string} player / block id
     @return {object} playbackLength as a json object with keys of hours minutes seconds
     **/

    getBlockTimelineChannelBlockLength: function (i_campaign_timeline_chanel_player_id) {
        var self = this;
        var seconds = 0;
        var minutes = 0;
        var hours = 0;


        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            if (campaign_timeline_chanel_player_id == i_campaign_timeline_chanel_player_id) {
                var totalSeconds = recCampaignTimelineChannelPlayer['player_duration'];
                if (totalSeconds >= 3600) {
                    hours = Math.floor(totalSeconds / 3600);
                    totalSeconds = totalSeconds - (hours * 3600);
                }
                if (totalSeconds >= 60) {
                    minutes = Math.floor(totalSeconds / 60);
                    seconds = totalSeconds - (minutes * 60);
                }
                if (hours == 0 && minutes == 0)
                    seconds = totalSeconds;
            }
        });
        var playbackLength = {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        }
        return playbackLength;
    },

    /**
     Get a player_id records from msdb by player_id primary key.
     @method getCampaignTimelineChannelPlayerRecord
     @param {number} i_player_id player id
     @return {object} player record
     **/

    getCampaignTimelineChannelPlayerRecord: function (i_player_id) {
        var self = this;
        var recPlayer = undefined;
        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            if (campaign_timeline_chanel_player_id == i_player_id)
                recPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
        });
        return recPlayer;
    },

    /**
     Set a player_id records from msdb on key with value
     @method setCampaignTimelineChannelPlayerRecord
     @param {number} i_player_id
     @param {string} i_key the key to set
     @param {string} i_value the value to set
     @return none
     **/

    setCampaignTimelineChannelPlayerRecord: function (i_player_id, i_key, i_value) {
        var self = this;
        self.m_msdb.table_campaign_timeline_chanel_players().openForEdit(i_player_id);
        var recPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(i_player_id);
        recPlayer[i_key] = i_value;
    },


    /**
     Get a channel_id record from msdb by channel_id primary key.
     @method getCampaignTimelineChannelRecord
     @param {number} i_channel_id player id
     @return {object} channel record
     **/

    getCampaignTimelineChannelRecord: function (i_channel_id) {
        var self = this;
        var recChannel = undefined;
        $(self.m_msdb.table_campaign_timeline_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_id) {
            if (campaign_timeline_chanel_id == i_channel_id)
                recChannel = self.m_msdb.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);
        });
        return recChannel;
    },

    /**
     Set a channel_id records from msdb on key with value
     @method setCampaignTimelineChannelRecord
     @param {number} i_channel_id
     @param {string} i_key the key to set
     @param {string} i_value the value to set
     @return none
     **/

    setCampaignTimelineChannelRecord: function (i_channel_id, i_key, i_value) {
        var self = this;
        self.m_msdb.table_campaign_timeline_chanels().openForEdit(i_channel_id);
        var recChannel = self.m_msdb.table_campaign_timeline_chanels().getRec(i_channel_id);
        recChannel[i_key] = i_value;
    },

    /**
     Get a timeline's record from msdb by i_campaign_timeline_id primary key.
     @method getCampaignTimelineRecord
     @param {number} i_campaign_timeline_id
     @return {object} player record
     **/

    getCampaignTimelineRecord: function (i_campaign_timeline_id) {
        var self = this;
        var recTimeline = undefined;
        $(self.m_msdb.table_campaign_timelines().getAllPrimaryKeys()).each(function (k, campaign_timeline_id) {
            if (campaign_timeline_id == i_campaign_timeline_id)
                recTimeline = self.m_msdb.table_campaign_timelines().getRec(campaign_timeline_id);
        });
        return recTimeline;
    },

    /**
     Set a timeline's records from msdb on key with value
     @method setCampaignTimelineRecord
     @param {number} i_player_id
     @param {string} i_key the key to set
     @param {string} i_value the value to set
     @return none
     **/

    setCampaignTimelineRecord: function (i_campaign_timeline_id, i_key, i_value) {
        var self = this;
        self.m_msdb.table_campaign_timelines().openForEdit(i_campaign_timeline_id);
        var recTimeline = self.m_msdb.table_campaign_timelines().getRec(i_campaign_timeline_id);
        recTimeline[i_key] = i_value;
    },

    /////////////////////////////////////////////////////////
    //
    // populateBoardTemplate
    //
    /////////////////////////////////////////////////////////

    populateBoardTemplate: function (i_campaign_timeline_board_template_id) {
        var self = this;

        var recCampaignTimelineBoardTemplate = self.m_msdb.table_campaign_timeline_board_templates().getRec(i_campaign_timeline_board_template_id);

        // Get global board > board template so we can get the total width / height resolution of the board

        var recBoardTemplate = self.m_msdb.table_board_templates().getRec(recCampaignTimelineBoardTemplate['board_template_id']);
        var recBoard = self.m_msdb.table_boards().getRec(recBoardTemplate['board_id']);

        $(self.m_msdb.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {
            var recCampaignTimelineBoardViewerChanel = self.m_msdb.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineBoardViewerChanel['campaign_timeline_board_template_id'] == i_campaign_timeline_board_template_id) {
                var recBoardTemplateViewer = self.m_msdb.table_board_template_viewers().getRec(recCampaignTimelineBoardViewerChanel['board_template_viewer_id']);
                // log(i_campaign_timeline_board_template_id);
            }
        });
    },

    /////////////////////////////////////////////////////////
    //
    // Viewer selected on Timeline so we reverse enumerate over
    // the mapping of viewers to channels:
    // campaign_timeline_viewer_chanels -> table_campaign_timeline_chanels
    // to find the channel selected
    //
    /////////////////////////////////////////////////////////

    getChannelIdFromCampaignTimelineBoardViewer: function (i_campaign_timeline_board_viewer_id, i_campaign_timeline_id) {
        var self = this;

        var recCampaignTimelineViewerChanelsFound = undefined;

        $(self.m_msdb.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {
            var recCampaignTimelineViewerChanels = self.m_msdb.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);

            // if true, we found the viewer selected uner table campaign_timeline_viewer_chanels
            if (recCampaignTimelineViewerChanels['board_template_viewer_id'] == i_campaign_timeline_board_viewer_id) {

                $(self.m_msdb.table_campaign_timeline_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_id) {
                    var recCampaignTimelineChannel = self.m_msdb.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);

                    // if true, we found the channel the viewer was assined to as long as it is part of the current selected timeline
                    if (recCampaignTimelineViewerChanels['campaign_timeline_chanel_id'] == campaign_timeline_chanel_id && recCampaignTimelineChannel['campaign_timeline_id'] == i_campaign_timeline_id) {
                        log('selected: timeline_id ' + i_campaign_timeline_id + ' view_id ' + i_campaign_timeline_board_viewer_id + ' on channel_id ' + recCampaignTimelineViewerChanels['campaign_timeline_chanel_id']);
                        recCampaignTimelineViewerChanelsFound = recCampaignTimelineViewerChanels;
                    }
                });
            }
        });

        return recCampaignTimelineViewerChanelsFound;
    },

    /////////////////////////////////////////////////////////
    //
    // populateCampaign
    //
    /////////////////////////////////////////////////////////

    populateCampaign: function () {

        var self = this;

        // Get all timelines
        $(self.m_msdb.table_campaign_timelines().getAllPrimaryKeys()).each(function (k, campaign_timeline_id) {

            var recCampaignTimeline = self.m_msdb.table_campaign_timelines().getRec(campaign_timeline_id);

            // if timeline belongs to selected campaign
            if (recCampaignTimeline['campaign_id'] == self.m_selected_campaign_id) {

                // get all campaign timeline board templates (screen divison inside output, gets all outputs, in our case only 1)
                $(self.m_msdb.table_campaign_timeline_board_templates().getAllPrimaryKeys()).each(function (k, table_campaign_timeline_board_template_id) {
                    var recCampaignTimelineBoardTemplate = self.m_msdb.table_campaign_timeline_board_templates().getRec(table_campaign_timeline_board_template_id);
                    if (recCampaignTimelineBoardTemplate['campaign_timeline_id'] == campaign_timeline_id) {
                        log(recCampaignTimelineBoardTemplate['campaign_timeline_id']);
                        self._populateBoardTemplate(table_campaign_timeline_board_template_id);
                    }
                });

                // get all channels that belong to timeline
                $(self.m_msdb.table_campaign_timeline_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_id) {
                    var recCampaignTimelineChannel = self.m_msdb.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);
                    if (campaign_timeline_id == recCampaignTimelineChannel['campaign_timeline_id']) {

                        // get all players / resources that belong timeline
                        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
                            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                            if (campaign_timeline_chanel_id == recCampaignTimelineChannelPlayer['campaign_timeline_chanel_id']) {
                                log(campaign_timeline_chanel_player_id);
                            }
                        });
                    }
                });
            }
        });
    },
}