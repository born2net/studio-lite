/**
 The Helper SDK is a wrapper for the Soap API used to communicate with MediaSignage servers.
 The SDK makes programming easier by abstracting some of the tedious tasks such as enumeration.

 The msdb internal Database is the magic sauce as it maps against the actual mediaSERVER remote database via
 local generated handles (a.k.a IDs). Once a user saves the local configuration, the local Database is serialized
 and pushed onto the a remote mediaSERVER. This allows for the user to work offline without the need for constant network
 communication until a save is initiated.

 The internal database is referenced as msdb in both code and documentation.

 @class HelperSDK
 @constructor
 @return {Object} HelperSDK instance
 **/

function HelperSDK() {

    this.self = this;

    /**
     m_msdb hold reference to the internal db object used to serialize all app data.
     @property m_msdb
     @type Object
     */

    this.m_msdb = undefined;
    this.msdb = undefined;
};

HelperSDK.prototype = {
    constructor: HelperSDK,

    /**
     Init the helper sdk upon user authentication
     @method init
     @param {Object} i_loaderManager hold a reference to the loader manager instance that is used to communicate with MediaSignage servers.
     @param {Object} i_msdb hold a reference to the internal json formatted db.
     @return none
     **/
    init: function (i_loaderManager, i_msdb) {
        var self = this;
        self.m_loaderManager = i_loaderManager;
        self.m_msdb = i_msdb;
    },

    /**
     Create a new campaign in the local database
     @method createCampaign
     @param {Number} i_campgianName
     @return {Number} campaign id created
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
     @param {Number} i_boardName
     @param {Number} i_width of the board
     @param {Number} i_height of the board
     @return {Number} the board id
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

    /**
     Assign a campaign to a board, binding the to by referenced ids
     @method assignCampaignToBoard
     @param {Number} i_campaign_id the campaign id to assign to board
     @param {Number} i_board_id the board id to assign to campaign
     @return none
     **/
    assignCampaignToBoard: function (i_campaign_id, i_board_id) {
        var self = this;
        var campaign_boards = self.m_msdb.table_campaign_boards();
        var board = campaign_boards.createRecord();
        board.campaign_id = i_campaign_id;
        board.board_id = i_board_id;
        campaign_boards.addRecord(board);
    },

    /**
     Get the first board_id (output) that is assigned to the specified campaign_id
     @method getFirstBoardIDofCampaign
     @param {Number} i_campaign_id
     @return {Number} foundBoardID of the board, or -1 if none found
     **/
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

    /**
     Create channels and assign these channels to the timeline
     @method createTimelineChannels
     @param {Number} i_campaign_timeline_id the timeline id to assign channel to
     @param {Object} i_viewers we use viewer as a reference count to know how many channels to create (i.e.: one per channel)
     @return {Array} createdChanels array of channel ids created
     **/
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

    /**
     Create a new global template (screen and viewers) and assign the new template to the given global board_id
     @method createNewTemplate
     @param {Number} i_board_id
     @param {Object} i_screenProps json object with all the viewers and attributes to create in msdb
     @return {Object} returnData encapsulates the board_template_id and board_template_viewer_ids created
     **/
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

    /**
     Create a new timeline under the specified campaign_id
     @method createNewTimeline
     @param {Number} i_campaign_id
     @return {Number} campaign_timeline_id the timeline id created
     **/
    createNewTimeline: function (i_campaign_id) {
        var self = this;
        var timelines = self.m_msdb.table_campaign_timelines();
        var timeline = timelines.createRecord();
        timeline.campaign_id = i_campaign_id;
        timeline.timeline_name = "Timeline";
        timelines.addRecord(timeline);
        return timeline['campaign_timeline_id'];
    },

    /**
     Create a new player (a.k.a block) and add it to the specified channel_id
     @method createNewPlayer
     @param {Number} i_campaign_timeline_chanel_id is the channel id assign player to
     @param {Number} i_playerCode is a unique pre-set code that exists per type of block (see component list for all available code)
     @param {Number} i_offset set in seconds of when to begin playing the content with respect to timeline_channel
     @param {Number} i_nativeID optional param used when creating a block with embedded resource (i.e.: video / image / swf)
     @return {Object} campaign_timeline_chanel_player_id and campaign_timeline_chanel_player_data as json object
     **/
    createNewPlayer: function (i_campaign_timeline_chanel_id, i_playerCode, i_offset, i_nativeID) {
        var self = this;


        var timelinePlayers = self.m_msdb.table_campaign_timeline_chanel_players();
        var recTimelinePlayer = timelinePlayers.createRecord();
        recTimelinePlayer.player_data = model.getComponent(i_playerCode).getDefaultPlayerData(i_nativeID);

        /*
        if (i_playerCode==3130 || i_playerCode==3100){
            recTimelinePlayer.player_data = model.getComponent(i_playerCode).getDefaultPlayerData(i_nativeID);
        } else {
            recTimelinePlayer.player_data = '<Player player="' + i_playerCode + '"><Data><Resource Resource="' + i_playerCode + '" /></Data></Player>';
        }
        */

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

    /**
     Get all the campaign > timeline > board > template ids of a timeline
     @method getTemplatesOfTimeline
     @param {Number} i_campaign_timeline_id
     @return {Array} template ids
     **/
    getTemplatesOfTimeline: function (i_campaign_timeline_id) {
        var self = this;
        var foundTemplatesIDs = [];

        $(jalapeno.m_msdb.table_campaign_timeline_board_templates().getAllPrimaryKeys()).each(function (k, table_campaign_timeline_board_template_id) {
            var recCampaignTimelineBoardTemplate = jalapeno.m_msdb.table_campaign_timeline_board_templates().getRec(table_campaign_timeline_board_template_id);
            if (recCampaignTimelineBoardTemplate['campaign_timeline_id'] == i_campaign_timeline_id) {
                foundTemplatesIDs.push(table_campaign_timeline_board_template_id);
            }
        });
        return foundTemplatesIDs;
    },

    /**
     Get all the campaign > timeline > channels ids of a timeline
     @method getChannelsOfTimeline
     @param {Number} i_campaign_timeline_id
     @return {Array} channel ids
     **/
    getChannelsOfTimeline: function (i_campaign_timeline_id) {
        var self = this;
        var foundChannelsIDs = [];

        $(jalapeno.m_msdb.table_campaign_timeline_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_id) {
            var recCampaignTimelineChannel = jalapeno.m_msdb.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);
            if (i_campaign_timeline_id == recCampaignTimelineChannel['campaign_timeline_id']) {
                foundChannelsIDs.push(campaign_timeline_chanel_id);
            }
        });
        return foundChannelsIDs;
    },

    /**
     Get a block's record using it's block_id
     @method getBlockRecord
     @param {Number} i_block_id
     @return {Object} recBlock
     **/
    getBlockRecord: function (i_block_id) {
        var self = this;
        var recBlock = undefined;

        $(jalapeno.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            if (i_block_id == campaign_timeline_chanel_player_id) {
                recBlock = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            }
        });
        return recBlock;
    },

    /**
     Set a block's record using key value pair
     The method uses generic key / value fields so it can set any part of the record.
     @method setBlockRecord
     @param {Number} i_block_id
     @param {String} i_key
     @param {Number} i_value
     @return none
     **/
    setBlockRecord: function (i_block_id, i_key, i_value) {
        var self = this;
        jalapeno.m_msdb.table_campaign_timeline_chanel_players().openForEdit(i_block_id);
        var recEditBlock = self.m_msdb.table_campaign_timeline_chanel_players().getRec(i_block_id);
        recEditBlock[i_key] = i_value;
    },

    /**
     Get the total duration in seconds of all given block ids
     @method getTotalDurationOfBlocks
     @param {Array} i_blocks
     @return {Number} totalChannelLength
     **/
    getTotalDurationOfBlocks: function (i_blocks) {
        var self = this;
        var totalChannelLength = 0;

        for (var i = 0; i < i_blocks.length; i++) {
            var block_id = i_blocks[i];
            $(jalapeno.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
                if (block_id == campaign_timeline_chanel_player_id) {
                    var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                    var playerDuration = recCampaignTimelineChannelPlayer['player_duration']
                    jalapeno.m_msdb.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                    // log('player ' + block_id + ' offset ' + totalChannelLength + ' playerDuration ' + playerDuration);
                    totalChannelLength = totalChannelLength + parseFloat(playerDuration);
                }
            });
        }
        return totalChannelLength;
    },

    /**
     Get a global board record (not the board that assigned to a campaign, but global).
     Keep in mind that we only give as an argument the campaign > timeline > board > template id, so we have to query it and find
     out to which global board its pointing so we can grab the correct record for the correct global board.
     @method getGlobalBoardRecFromTemplate
     @param {Number} i_campaign_timeline_board_template_id to reverse map into global board
     @return {Object} global board record;
     **/
    getGlobalBoardRecFromTemplate: function (i_campaign_timeline_board_template_id) {
        var self = this;

        var recCampaignTimelineBoardTemplate = jalapeno.m_msdb.table_campaign_timeline_board_templates().getRec(i_campaign_timeline_board_template_id);
        var board_template_id = recCampaignTimelineBoardTemplate['board_template_id'];
        var recBoardTemplate = jalapeno.m_msdb.table_board_templates().getRec(board_template_id);
        var board_id = recBoardTemplate['board_id'];
        var recBoard = jalapeno.m_msdb.table_boards().getRec(board_id);
        return recBoard;
    },

    /**
     Bind the template (screen division template)to the specified timeline (i_campaign_timeline_id).
     We need to also provide the board_template_id (screen template of the global board) as well as
     the campaign's board_id to complete the binding
     @method assignTemplateToTimeline
     @param {Number} i_campaign_timeline_id to assign to template
     @param {Number} i_board_template_id is the global board id (does not belong to campaign) to assign to the template
     @param {Number} i_campaign_board_id is the campaign specific board id that will be bound to the template
     @return {Number} campaign_timeline_board_template_id
     **/
    assignTemplateToTimeline: function (i_campaign_timeline_id, i_board_template_id, i_campaign_board_id) {
        var self = this;
        var timelineTemplate = self.m_msdb.table_campaign_timeline_board_templates();
        var timelineScreen = timelineTemplate.createRecord();
        timelineScreen.campaign_timeline_id = i_campaign_timeline_id;
        timelineScreen.board_template_id = i_board_template_id;
        timelineScreen.campaign_board_id = i_campaign_board_id;
        timelineTemplate.addRecord(timelineScreen);

        return timelineScreen['campaign_timeline_board_template_id'];
    },

    /**
     Assign viewers (screen divisions) on the timeline to channels, so we get one viewer per channel
     @method assignViewersToTimelineChannels
     @param {Number} i_campaign_timeline_board_template_id
     @param {Object} i_viewers a json object with all viewers
     @param {Array} i_channels a json object with all channels
     @return none
     **/
    assignViewersToTimelineChannels: function (i_campaign_timeline_board_template_id, i_viewers, i_channels) {
        var self = this;
        var viewerChanels = self.m_msdb.table_campaign_timeline_board_viewer_chanels();
        for (var i in i_viewers) {
            var viewerChanel = viewerChanels.createRecord();
            viewerChanel.campaign_timeline_board_template_id = i_campaign_timeline_board_template_id;
            viewerChanel.board_template_viewer_id = i_viewers[i];
            viewerChanel.campaign_timeline_chanel_id = i_channels.shift();
            viewerChanels.addRecord(viewerChanel);
        }
    },

    /**
     Get the sequence index of a timeline in the specified campaign
     @method getCampaignTimelineSequencerIndex
     @param {Number} i_campaign_timeline_id
     @return {Number} sequenceIndex
     **/
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

    /**
     Set the sequence index of a timeline in campaign. If timeline is not found in sequencer, we insert it with the supplied i_sequenceIndex
     @method setCampaignTimelineSequencerIndex
     @param {Number} i_campaign_id
     @param {Number} i_campaign_timeline_id
     @param {Number} i_sequenceIndex is the index to use for the timeline so we can playback the timeline in the specified index order
     @return none
     **/
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

    /**
     Get the timeline id of the specific sequencer index offset (0 based) under the specified campaign
     @method getCampaignTimelineIdOfSequencerIndex
     @param {Number} i_campaign_id
     @param {Number} i_sequence_index
     @return {Number} timeline_id
     **/
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

    /**
     Get all none deleted (!=3) resources per current account
     @method getResources
     @return {Array} all records of all resources in current account
     **/
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

    /**
     Get the native id mapping of a resource_id.
     A native is is the actual primary key that is used on the remote server, compared to normal id
     which is an internal mapping of msdb to its native id.
     @method getNativeByResoueceID
     @param {Number} i_resource_id
     @return {Number} native_id
     **/
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

    /**
     Get a resource record via its resource_id.
     @method getResourceRecord
     @param {Number} i_resource_id
     @return {Object} foundResourceRecord
     **/
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

    /**
     Set a resource record via its resource_id.
     The method uses generic key / value fields so it can set any part of the record.
     @method setResourceRecord
     @param {Number} i_resource_id
     @param {Number} i_key
     @param {String} i_value
     @return {Object} foundResourceRecord
     **/
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

    /**
     Get a list of all campaigns per the account
     @method getCampaignIDs
     @return {Array} campaigns
     **/
    getCampaignIDs: function () {
        var self = this;
        var campaigns = [];

        $(self.m_msdb.table_campaigns().getAllPrimaryKeys()).each(function (k, campaign_id) {
            campaigns.push(campaign_id);
        });
        return campaigns;
    },

    /**
     Get a campaign table record for the specified i_campaign_id.
     @method getCampaignRecord
     @param {Number} i_campaign_id
     @return {Object} foundCampaignRecord
     **/
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

    /**
     Set a campaign table record for the specified i_campaign_id.
     The method uses generic key / value fields so it can set any part of the record.
     @method setCampaignRecord
     @param {Number} i_campaign_id
     @param {Number} i_key
     @param {String} i_value
     @return {Object} foundCampaignRecord
     **/
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

    /**
     Get the type of a resource (png/jpg...) for specified native_id
     @method getResourceType
     @param {Number} i_native_id
     @return {String} resourceType
     **/
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

    /**
     Get the name of a resource from the resources table using it's native_id
     @method getResourceName
     @param {Number} i_native_id
     @return {Number} resourceName
     **/
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

    /**
     Upload new resources onto the remote server and return matching ids.
     The element id is of an HTML id of a multi-part upload element.
     @method uploadResources
     @param {String} i_elementID
     @return {Array} list of resources created from newly attached files
     **/
    uploadResources: function (i_elementID) {
        var self = this;
        var resourceList = self.m_loaderManager.createResources(document.getElementById(i_elementID));
        alert('Be sure to Save your work to push the files to the servers');
        return resourceList;
    },

    /**
     Set a block (a.k.a player) on the timeline_channel to a specified length in total seconds.
     @method setBlockTimelineChannelBlockLength
     @param {Number} i_campaign_timeline_chanel_player_id {string} plyer / block id
     @param {Number} i_hours total hours to play
     @param {Number} i_minutes total minutes to play
     @param {Number} i_seconds total seconds to play
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
    },

    /**
     Get all the block IDs of a particular channel.
     Push them into an array so they are properly sorted by player offset time.
     @method getChannelBlocksIDs
     @param {Number} i_campaign_timeline_chanel_id
     @return {Array} foundBlocks
     **/
    getChannelBlocks: function (i_campaign_timeline_chanel_id) {
        var self = this;
        var foundBlocks = [];
        $(jalapeno.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            if (i_campaign_timeline_chanel_id == recCampaignTimelineChannelPlayer['campaign_timeline_chanel_id']) {
                foundBlocks.push(campaign_timeline_chanel_player_id);
            }
        });
        return foundBlocks;
    },

    /**
     Get a block's (a.k.a player) total hours / minutes / seconds playback length on the timeline_channel.
     @method getBlockTimelineChannelBlockLength
     @param {Number} i_campaign_timeline_chanel_player_id
     @return {Object} playbackLength as a json object with keys of hours minutes seconds
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
     Get a player_id record from msdb by player_id primary key.
     @method getCampaignTimelineChannelPlayerRecord
     @param {Number} i_player_id
     @return {Object} player record
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
     Set a player_id record in msdb on key with value
     The method uses generic key / value fields so it can set any part of the record.
     @method setCampaignTimelineChannelPlayerRecord
     @param {Number} i_player_id
     @param {Number} i_key
     @param {String} i_value
     @return none
     **/
    setCampaignTimelineChannelPlayerRecord: function (i_player_id, i_key, i_value) {
        var self = this;
        self.m_msdb.table_campaign_timeline_chanel_players().openForEdit(i_player_id);
        var recPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(i_player_id);
        recPlayer[i_key] = i_value;
    },

    /**
     Get a channel_id record from table channels msdb by channel_id
     @method getCampaignTimelineChannelRecord
     @param {Number} i_channel_id
     @return {Object} channel record
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
     Set a channel_id record in channels table using key and value
     The method uses generic key / value fields so it can set any part of the record.
     @method setCampaignTimelineChannelRecord
     @param {Number} i_channel_id
     @param {Number} i_key
     @param {String} i_value
     @return none
     **/
    setCampaignTimelineChannelRecord: function (i_channel_id, i_key, i_value) {
        var self = this;
        self.m_msdb.table_campaign_timeline_chanels().openForEdit(i_channel_id);
        var recChannel = self.m_msdb.table_campaign_timeline_chanels().getRec(i_channel_id);
        recChannel[i_key] = i_value;
    },

    /**
     Get a timeline record from msdb using i_campaign_timeline_id primary key.
     @method getCampaignTimelineRecord
     @param {Number} i_campaign_timeline_id
     @return {Object} player record
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
     Get all timeline ids for specified campaign
     @method getCampaignTimelines
     @param {Number} i_campaign_id
     @return {Array} timeline ids
     **/
    getCampaignTimelines: function (i_campaign_id) {
        var self = this;

        var timelineIDs = [];
        $(self.m_msdb.table_campaign_timelines().getAllPrimaryKeys()).each(function (k, campaign_timeline_id) {
            var recCampaignTimeline = self.m_msdb.table_campaign_timelines().getRec(campaign_timeline_id);
            if (recCampaignTimeline['campaign_id'] == i_campaign_id) {
                timelineIDs.push(campaign_timeline_id);
            }
        });
        return timelineIDs;
    },

    /**
     Build screenProps json object with all viewers and all of their respective attributes for the given timeline_id / template_id
     @method getTemplateViewersScreenProps
     @param {Number} i_campaign_timeline_id
     @param {Number} i_campaign_timeline_board_template_id
     @return {Object} screenProps all viewers and all their properties
     **/
    getTemplateViewersScreenProps: function (i_campaign_timeline_id, i_campaign_timeline_board_template_id) {
        var self = this;
        var counter = -1;
        var screenProps = {};

        $(jalapeno.m_msdb.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {

            var recCampaignTimelineBoardViewerChanel = self.m_msdb.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineBoardViewerChanel['campaign_timeline_board_template_id'] == i_campaign_timeline_board_template_id) {
                var recBoardTemplateViewer = self.m_msdb.table_board_template_viewers().getRec(recCampaignTimelineBoardViewerChanel['board_template_viewer_id']);
                // log(i_campaign_timeline_board_template_id + ' ' + recBoardTemplateViewer['board_template_viewer_id']);
                counter++;
                screenProps['sd' + counter] = {};
                screenProps['sd' + counter]['campaign_timeline_board_viewer_id'] = recBoardTemplateViewer['board_template_viewer_id'];
                screenProps['sd' + counter]['campaign_timeline_id'] = i_campaign_timeline_id;
                screenProps['sd' + counter]['x'] = recBoardTemplateViewer['pixel_x'];
                screenProps['sd' + counter]['y'] = recBoardTemplateViewer['pixel_y'];
                screenProps['sd' + counter]['w'] = recBoardTemplateViewer['pixel_width'];
                screenProps['sd' + counter]['h'] = recBoardTemplateViewer['pixel_height'];
            }
        });

        return screenProps;
    },

    /**
     Set a timeline records in msdb using i_campaign_timeline_id primary key.
     The method uses generic key / value fields so it can set any part of the record.
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

    /**
     Use a viewer_id to reverse enumerate over the mapping of viewers to channels via:
     campaign_timeline_viewer_chanels -> table_campaign_timeline_chanels
     so we can find the channel assigned to the viewer_id provided.
     @method getChannelIdFromCampaignTimelineBoardViewer
     @param {Number} i_campaign_timeline_board_viewer_id
     @param {Number} i_campaign_timeline_id
     @return {Object} recCampaignTimelineViewerChanelsFound
     **/
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

    /**
     Sample function to demonstrate how to enumerate over records to query for specified template_id
     @method populateBoardTemplate
     @param {Number} i_campaign_timeline_board_template_id
     @return none
     **/
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

    /**
     Sample function to demonstrate how to enumerate over records to query related tables of a campaign
     @method populateBoardTemplate
     @param {Number} i_campaign_timeline_board_template_id
     @return none
     **/
    populateCampaign: function () {
        var self = this;

        // demo campaign_id
        var campaign_id = 1;

        // Get all timelines
        $(self.m_msdb.table_campaign_timelines().getAllPrimaryKeys()).each(function (k, campaign_timeline_id) {

            var recCampaignTimeline = self.m_msdb.table_campaign_timelines().getRec(campaign_timeline_id);

            // if timeline belongs to selected campaign
            if (recCampaignTimeline['campaign_id'] == campaign_id) {

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
    }
}