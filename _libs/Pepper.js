/**
 Pepper SDK is a collection of files that provide a wrapper for the Soap API used to communicate with MediaSignage servers.
 The SDK makes programming easier by abstracting some of the tedious tasks such as enumeration.

 The msdb internal Database is the magic sauce as it maps against the actual mediaSERVER remote database via
 local generated handles (a.k.a IDs). Once a user saves the local configuration, the local Database is serialized
 and pushed onto the a remote mediaSERVER. This allows for the user to work offline without the need for constant network
 communication until a save is initiated.

 The internal database is referenced as msdb in both code and documentation.

 Library requirements:
 composition: x2js, jQuery
 inheritance: ComBroker

 @class Pepper
 @constructor
 @return {Object} Pepper instance
 **/
function Pepper() {
    this.m_user = undefined;
    this.m_pass = undefined;
    this.m_msdb = undefined;
    this.m_loaderManager = undefined;
};

/**
 Custom event fired when a total timeline length (i.e.: channel content within specified timeline) has changed
 @event Pepper.TIMELINE_LENGTH_CHANGED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.SCENE_CREATED = 'SCENE_CREATED';

/**
 Custom event fired when a block is removed from a timeline channel
 @event Pepper.REMOVE_TIMELINE_CHANNEL_BLOCK
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.REMOVE_TIMELINE_CHANNEL_BLOCK = 'REMOVE_TIMELINE_CHANNEL_BLOCK';

/**
 Custom event fired when saving to server
 @event Pepper.SAVE_TO_SERVER
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.SAVE_TO_SERVER = 'SAVE_TO_SERVER';


/**
 Custom event fired when a total timeline length (i.e.: channel content within specified timeline) has changed
 @event Pepper.TIMELINE_LENGTH_CHANGED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.TIMELINE_LENGTH_CHANGED = 'TIMELINE_LENGTH_CHANGED';

/**
 Custom event fired when a total timeline length (i.e.: channel content within specified timeline) has changed
 @event Pepper.TIMELINE_LENGTH_CHANGED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.TEMPLATE_VIEWER_EDITED = 'TEMPLATE_VIEWER_EDITED';

/**
 Custom event fired when a timeline is removed from campaign
 @event Pepper.TIMELINE_DELETED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.TIMELINE_DELETED = 'TIMELINE_DELETED';

/**
 Custom event fired when a scheduale removed from timeline
 @event Pepper.TIMELINE_SCHEDULE_DELETED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.TIMELINE_SCHEDULE_DELETED = 'TIMELINE_SCHEDULE_DELETED';

/**
 Custom event fired when a new player (aka block) was created
 @event Pepper.NEW_PLAYER_CREATED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.NEW_PLAYER_CREATED = 'NEW_PLAYER_CREATED';

/**
 Custom event fired when a new campaign was created
 @event Pepper.NEW_CAMPAIGN_CREATED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.NEW_CAMPAIGN_CREATED = 'NEW_CAMPAIGN_CREATED';

/**
 Custom event fired when a new template (aka screen division layout in global) was created
 @event Pepper.NEW_TEMPLATE_CREATED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.NEW_TEMPLATE_CREATED = 'NEW_TEMPLATE_CREATED';


/**
 Custom event fired when a new timeline was created
 @event Pepper.NEW_TIMELINE_CREATED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.NEW_TIMELINE_CREATED = 'NEW_TIMELINE_CREATED';

/**
 Custom event fired when a new channel was created
 @event Pepper.NEW_CHANNEL_CREATED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.NEW_CHANNEL_CREATED = 'NEW_CHANNEL_CREATED';

/**
 Custom event fired when a new channel is added to an existing timeline
 @event Pepper.NEW_CHANNEL_ADDED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.NEW_CHANNEL_ADDED = 'NEW_CHANNEL_ADDED';

/**
 Custom event fired when a block (ie Player on channel) changes it's total playback length
 @event Pepper.BLOCK_LENGTH_CHANGED
 @param {This} caller
 @param {Event}
 @static
 @final
 **/
Pepper.BLOCK_LENGTH_CHANGED = 'BLOCK_LENGTH_CHANGED';

Pepper.prototype = {
    constructor: Pepper,

    /**
     Authenticate through mediaSERVER
     @method dbConnect
     @param {String} i_user
     @param {String} i_pass
     @param {Function} i_callBack
     @return none
     **/
    dbConnect: function (i_user, i_pass, i_callBack) {
        var self = this;
        self.m_user = i_user;
        self.m_pass = i_pass;
        self.m_loaderManager = new LoaderManager();
        self.m_msdb = self.m_loaderManager['m_dataBaseManager'];
        self.m_loaderManager.create(self.m_user, self.m_pass, function (i_result) {
            if (i_result.status) {
                self.m_authenticated = true;
                self.m_domain = self.m_loaderManager['m_domain'];
                var resellerInfo = self.m_loaderManager['m_resellerInfo'];
                self.m_whiteLabel = parseInt($(resellerInfo).find('WhiteLabel').attr('enabled'));
                self.m_resellerId = parseInt($(resellerInfo).find('BusinessInfo').attr('businessId'));
                self.m_resellerName = $(resellerInfo).find('BusinessInfo').attr('name');
                self.m_businessID = self.m_loaderManager['m_businessId'];
                self.m_eri = self.m_loaderManager['m_eri'];
                self.m_authTime = Date.now();
                self.m_components = {};

                // build list of allowed prime components
                var components = $(resellerInfo).find('InstalledApps').find('App');
                _.each(components, function (component) {
                    if ($(component).attr('installed') == 1)
                        self.m_components[$(component).attr('id')] = 1;
                });
            }
            i_callBack(i_result);
        });
    },

    /**
     Return all authenticated user data
     @method getUserData
     @return {Object} reference to all user data
     **/
    getUserData: function () {
        var self = this;
        return {
            userName: self.m_user,
            userPass: self.m_pass,
            domain: self.m_domain,
            businessID: self.m_businessID,
            eri: self.m_eri,
            authTime: self.m_authTime,
            whiteLabel: self.m_whiteLabel,
            resellerName: self.m_resellerName,
            resellerID: self.m_resellerId,
            components: self.m_components
        };
    },

    /**
     Returns a reference to the Pepper loader
     @method getLoader
     @return {Object} reference to loader
     **/
    getLoader: function () {
        var self = this;
        return self.m_loaderManager;
    },

    /**
     Serialize the local msdb and push to remote server
     @method save
     @return none
     **/
    save: function (i_callback) {
        var self = this;
        self.m_loaderManager.save(i_callback);
        pepper.fire(Pepper.SAVE_TO_SERVER);
    },

    /**
     Sync internal msdb to remote mediaSERVER account
     @method requestData
     @param {Function} i_callback
     **/
    sync: function (i_callBack) {
        var self = this;
        self.m_loaderManager.requestData(i_callBack);
    },

    /**
     Get proof of play stats report
     @method getProofOfPlayStats
     @param {Function} i_callBack
     @param {Number} i_year
     @param {Number} i_playerData
     @return {Number} i_month clientId.
     **/
    getProofOfPlayStats: function (i_year, i_month, i_callBack) {
        var self = this;
        self.m_loaderManager.requestAdsReport(function (data) {
            var report = $(data.report).find('Report');
            i_callBack(report);
        }, i_year, i_month)
    },

    /**
     Get list of all create account samples, both lite and pro
     @method getSampleList
     @param {Function} i_callBack
     **/
    getSampleList: function (i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/getResellerTemplates.ashx?callback=?';
        $.getJSON(url, function (data) {
            i_callBack(data);
        });
    },

    /**
     Push a command to remote station
     @method sendCommand
     @param {String} i_command
     @param {Number} i_stationId
     @param {Function} i_callBack
     **/
    sendCommand: function (i_command, i_stationId, i_callBack) {
        var url = window.g_protocol + pepper.getUserData().domain + '/WebService/sendCommand.ashx?i_user=' + pepper.getUserData().userName + '&i_password=' + pepper.getUserData().userPass + '&i_stationId=' + i_stationId + '&i_command=' + i_command + '&i_param1=' + 'SignageStudioLite' + '&i_param2=' + '&callback=?';
        console.log(url)
        $.getJSON(url, i_callBack);
    },

    /**
     Push an event to a local station / server for Location based content, see parms for details
     Keep in mind this supports both local and remote events
     @method sendLocalEventGPS
     @param {String} i_mode local or remote
     @param {Number} i_stationId
     @param {Number} i_lat
     @param {Number} i_lng
     @param {Function} i_callBack
     @return {String) short url
     **/
    sendLocalEventGPS: function (i_mode, i_lat, i_lng, i_id, i_ip, i_port, i_callBack) {
        var self = this;
        // example posts
        // curl "http://192.168.92.133:1024/sendLocalEvent?eventName=gps&eventParam=34.22447,-118.828"
        // https://sun.signage.me/WebService/sendCommand.ashx?i_user=d39@ms.com&i_password=xxxx&i_stationId=44&i_command=event&i_param1=gps&i_param2=34.22447,-118.828&callback=
        var url;
        var returnUrl;
        if (i_mode == "local") {
            url = 'http://' + i_ip + ':' + i_port + '/sendLocalEvent?eventName=gps&eventParam=' + i_lat + ',' + i_lng;
            returnUrl = url;
        } else {
            url = window.g_protocol + pepper.getUserData().domain + '/WebService/sendCommand.ashx?i_user=' + pepper.getUserData().userName + '&i_password=' + pepper.getUserData().userPass + '&i_stationId=' + i_id + '&i_command=event&i_param1=' + 'gps' + '&i_param2=' + i_lat + ',' + i_lng + '&callback=?';
            returnUrl = '//remoteServer' + '&i_stationId=' + i_id + '&i_command=event&i_param1=' + 'gps' + '&i_param2=' + i_lat + ',' + i_lng;
        }
        // log(url);
        if (i_mode == 'local')
            return returnUrl;

        try {
            $.ajax({
                url: url,
                dataType: "jsonp",
                type: "post",
                complete: function (response) {
                    if (i_callBack)
                        i_callBack(response.statusText);
                },
                error: function (jqXHR, exception) {
                    log(jqXHR, exception);
                    if (i_callBack)
                        i_callBack(exception);
                }
            });
        } catch (e) {
            log('error on ajax' + e);
        }
        return returnUrl;
    },

    /**
     Push a command to remote station
     @method getLocalization
     @param {String} i_command
     @param {Number} i_stationId
     @param {Function} i_callBack
     **/
    getLocalization: function (i_lang, i_callBack) {
        $.getJSON(window.g_protocol + window.g_masterDomain + '/WebService/getLocalList.ashx?callback=?', function (data) {
            data = _.invert(data);
            if (i_lang == 'zh')
                i_lang = 'zh-CN';
            var local = data[i_lang];
            var url = window.g_protocol + window.g_masterDomain + '/WebService/getResourceBundlesJson.ashx?local=' + local + '&bundleList=studiolite&callback=?';
            $.getJSON(url, function (data) {
                i_callBack(data);
            });
        });
    },

    /**
     Push a command to remote station, this v2 has a fall back and returns null on fails
     @method getLocalizationNew
     @param {String} i_command
     @param {Number} i_stationId
     @param {Function} i_callBack
     **/
    getLocalizationNew: function (i_lang, i_callBack) {
        $.getJSON(window.g_protocol + window.g_masterDomain + '/WebService/getLocalList.ashx?callback=?', function (data) {
            data = _.invert(data);
            if (i_lang == 'zh')
                i_lang = 'zh-CN';
            var local = data[i_lang];
            var url = window.g_protocol + window.g_masterDomain + '/WebService/getResourceBundlesJson.ashx?local=' + local + '&bundleList=studiolite&callback=?';
            $.getJSON(url, function (data) {
                i_callBack(data);
            }).error(function () {
                i_callBack(null);
            });
        }).error(function (e) {
            i_callBack(null);
        });
    },

    /**
     Return the url address of StudioLite
     @method getStudioLiteURL
     @return {String} url address
     **/
    getStudioLiteURL: function () {
        var protocol = window.g_protocol;
        if (window.g_masterDomain == 'galaxy.signage.me')
            protocol = 'https://';
        return protocol + window.g_masterDomain + '/_studiolite-dist/studiolite.html';
    },

    /**
     Return the url address of StudioPro
     @method getStudioProURL
     @return {String} url address
     **/
    getStudioProURL: function () {
        var protocol = window.g_protocol;
        return window.g_protocol + window.g_masterDomain + '/WebService/signagestudio_d.aspx';
    },

    /**
     Create a new mediaCLOUD account
     @method createAccount
     @param {Function} i_callBack
     **/
    createAccount: function (i_businessName, i_userName, i_password, i_templateBusinessId, i_resellerId, i_firstName, i_lastName, i_contactEmail, i_workPhone, i_cellPhone, i_address, i_city, i_state, i_contry, i_zipcode, i_callback) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=CreateCustomerAccount'
        url += '&businessName=' + i_businessName;
        url += '&userName=' + i_userName;
        url += '&password=' + i_password;
        url += '&templateBusinessId=' + i_templateBusinessId;
        url += '&resellerId=' + i_resellerId;
        url += '&firstName=' + i_firstName;
        url += '&lastName=' + i_lastName;
        url += '&contactEmail=' + i_contactEmail;
        url += '&workPhone=' + i_workPhone;
        url += '&cellPhone=' + i_cellPhone;
        url += '&address=' + i_address;
        url += '&city=' + i_city;
        url += '&state=' + i_state;
        url += '&contry=' + i_contry;
        url += '&zipcode=' + i_zipcode;
        url += '&callback=?';
        log(url);
        $.getJSON(url, i_callback);
    },

    /**
     Get business user info
     @method GetBusinessUserInfo
     @param {Function} i_callBack
     **/
    getAccountStatus: function (i_businessId, i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=GetAccountStatus&businessId=' + i_businessId + '&callback=?';
        $.getJSON(url, i_callBack);
    },

    /**
     Get business user info
     @method GetBusinessUserInfo
     @param {Function} i_callBack
     **/
    resetPassword: function (i_email, i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=ResetPassword&userName=' + i_email + '&callback=?';
        $.getJSON(url, i_callBack);
    },

    /**
     Get business user info
     @method ChangePassword
     @param {Function} i_callBack
     **/
    changePassword: function (i_email, i_oldPassword, i_newPassword, i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=ChangePassword&userName=' + i_email + '&oldPassword=' + i_oldPassword + '&newPassword=' + i_newPassword + '&callback=?';
        $.getJSON(url, i_callBack);
    },

    /**
     Get business user info
     @method ChangeBusinessName
     @param {Function} i_callBack
     **/
    changeBusinessName: function (i_email, i_password, i_businessName, i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=ChangeBusinessName&userName=' + i_email + '&password=' + i_password + '&busnessName=' + i_businessName + '&callback=?';
        $.getJSON(url, i_callBack);
    },

    /**
     Get business user info
     @method GetBusinessUserInfo
     @param {Function} i_callBack
     **/
    getBusinessUserInfo: function (i_user, i_pass, i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=GetBusinessUserInfo&userName=' + i_user + '&password=' + i_pass + '&callback=?';
        $.getJSON(url, i_callBack);
    },

    /**
     Get list of all create account samples, both lite and pro
     @method getSampleList
     @param {Function} i_callBack
     **/
    getSampleList: function (i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/getResellerTemplates.ashx?callback=?';
        $.getJSON(url, function (data) {
            i_callBack(data);
        });
    },

    /**
     Push an event to remote station
     @method sendEvent
     @param {String} i_eventName
     @param {Number} i_stationId
     @param {Function} i_callBack
     **/
    sendEvent: function (i_eventName, i_stationId, i_callBack) {
        var url = window.g_protocol + pepper.getUserData().domain + '/WebService/sendCommand.ashx?i_user=' + pepper.getUserData().userName + '&i_password=' + pepper.getUserData().userPass + '&i_stationId=' + i_stationId + '&i_command=event&i_param1=' + i_eventName + '&i_param2=' + '&callback=?';
        $.getJSON(url, i_callBack);
    },

    /**
     Send remote command to retrieve snapshot of a running station
     @method sendSnapshot
     @param {String} i_fileName
     @param {Number} i_quality
     @param {Number} i_stationId
     @param {Function} i_callBack
     @return {String} image path url
     **/
    sendSnapshot: function (i_fileName, i_quality, i_stationId, i_callBack) {
        var url = window.g_protocol + pepper.getUserData().domain + '/WebService/sendCommand.ashx?i_user=' + pepper.getUserData().userName + '&i_password=' + pepper.getUserData().userPass + '&i_stationId=' + i_stationId + '&i_command=' + 'captureScreen2' + '&i_param1=' + i_fileName + '&i_param2=' + i_quality + '&callback=?';
        $.getJSON(url, i_callBack);
        var path = window.g_protocol + pepper.getUserData().domain + '/Snapshots/business' + pepper.getUserData().businessID + "/station" + i_stationId + '/' + i_fileName + '.jpg';
        log(path);
        return path;
    },

    /**
     Build URL for player preview using supplied player parameters
     @method _livePreviewGetLink
     @param {String} i_playerParams
     @param {Number} i_bannerMode
     @return {String} url
     **/
    _livePreviewGetLink: function (i_playerParams, i_bannerMode) {
        var self = this;
        var rc4v2 = new RC4V2();
        var playerParams = rc4v2.encrypt(i_playerParams, '8547963624824263');
        var domain = pepper.getUserData().domain;
        var eri = pepper.getUserData().eri;
        var url = window.g_protocol + domain + '/WebService/SignagePlayerApp.html?eri=' + eri + '&playerParams=' + playerParams + '&banner=' + i_bannerMode;
        log(playerParams);
        return url;
    },

    /**
     Create a live preview URL for campaign
     @method livePreviewCampaign
     @param {Number} i_campaignID
     @param {Number} i_bannerMode
     @return {String} url
     **/
    livePreviewCampaign: function (i_campaignID, i_bannerMode) {
        var self = this;
        var campaignBoardId = pepper.getCampaignBoardIdFromCampaignId(i_campaignID);
        var recCampaignBoard = self.m_msdb.table_campaign_boards().getRec(campaignBoardId);
        var campaignNativeID = recCampaignBoard['native_id'];
        var playerParams = pepper.getUserData().businessID + ',1,' + campaignNativeID;
        return pepper._livePreviewGetLink(playerParams, i_bannerMode);
    },

    /**
     Create a live preview URL for campaign
     @method livePreviewTimeline
     @param {Number} i_campaignID
     @param {Number} i_timelineID
     @param {Number} i_bannerMode
     @return {String} url
     **/
    livePreviewTimeline: function (i_campaignID, i_timelineID, i_bannerMode) {
        var self = this;
        var campaignBoardId = pepper.getCampaignBoardIdFromCampaignId(i_campaignID);
        var recCampaignBoard = self.m_msdb.table_campaign_boards().getRec(campaignBoardId);
        var campaignNativeID = recCampaignBoard['native_id'];
        var recCampaignTimeline = pepper.getCampaignTimelineRecord(i_timelineID);
        var timelineNativeID = recCampaignTimeline['native_id'];
        var playerParams = pepper.getUserData().businessID + ',2,' + campaignNativeID + "," + timelineNativeID;
        return pepper._livePreviewGetLink(playerParams, i_bannerMode);
    },

    /**
     Create a live preview URL for a scene
     @method livePreviewScene
     @param {Number} i_scene_id
     @param {Number} i_bannerMode
     @return {String} url
     **/
    livePreviewScene: function (i_scene_id, i_bannerMode) {
        var self = this;
        var sceneID = pepper.getSceneIdFromPseudoId(i_scene_id);
        var recPlayerData = pepper.getScenePlayerRecord(sceneID);
        var nativeID = recPlayerData['native_id'];
        var playerParams = pepper.getUserData().businessID + ',3,' + nativeID;
        return pepper._livePreviewGetLink(playerParams, i_bannerMode);
    },

    /**
     get a scene's default length
     @method getSceneDuration
     @param {number} i_scene_id
     @return {number} total seconds
     **/
    getSceneDuration: function (i_scene_id) {
        var self = this;
        i_scene_id = pepper.sterilizePseudoId(i_scene_id);
        var seconds = 0;
        var minutes = 0;
        var hours = 0;
        var totalInSeconds = 0;

        var recPlayerData = pepper.getScenePlayerRecord(i_scene_id);
        var player_data = recPlayerData['player_data_value'];
        var domPlayerData = $.parseXML(player_data);
        var xSnippet = $(domPlayerData).find('Scene');
        var totalSeconds = parseInt(xSnippet.attr('defaultDuration'));

        totalInSeconds = totalSeconds;
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

        var playbackLength = {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            totalInSeconds: totalInSeconds
        };
        return playbackLength;
    },

    /**
     Set a scene's default length (can be overridden on timeline)
     @method setSceneDuration
     @param {number} i_scene_id
     @param {string} hours
     @param {string} minutes
     @param {string} seconds
     **/
    setSceneDuration: function (i_scene_id, i_hours, i_minutes, i_seconds) {
        var self = this;
        i_scene_id = pepper.sterilizePseudoId(i_scene_id);
        var totalSecInMin = 60
        var totalSecInHour = totalSecInMin * 60
        var totalSeconds = parseInt(i_seconds) + (parseInt(i_minutes) * totalSecInMin) + (parseInt(i_hours) * totalSecInHour);
        var recPlayerData = pepper.getScenePlayerRecord(i_scene_id);
        var player_data = recPlayerData['player_data_value'];
        var domPlayerData = $.parseXML(player_data)
        var xSnippet = $(domPlayerData).find('Scene');
        xSnippet.attr('defaultDuration', totalSeconds);
        var player_data = (new XMLSerializer()).serializeToString(domPlayerData);
        pepper.setScenePlayerData(i_scene_id, player_data);
    },

    /**
     Returns all scenes
     @method getSceneNames
     @param {Number} i_playerData
     @return {Object} scene names
     **/
    getSceneNames: function () {
        var self = this;
        var sceneNames = {};
        $(self.m_msdb.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
            var recPlayerData = self.m_msdb.table_player_data().getRec(player_data_id);
            var domPlayerData = $.parseXML(recPlayerData['player_data_value'])
            sceneNames[player_data_id] = {
                label: ($(domPlayerData).find('Player').attr('label')),
                mimeType: $(domPlayerData).find('Player').attr('mimeType')
            };
        });
        return sceneNames;
    },

    /**
     Returns all scenes
     @method getSceneMime
     @param {Number} i_sceneID
     @return {Object} scene names
     **/
    getSceneMime: function (i_sceneID) {
        var self = this;
        var mimeType = '';
        $(self.m_msdb.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
            var recPlayerData = self.m_msdb.table_player_data().getRec(player_data_id);
            var domPlayerData = $.parseXML(recPlayerData['player_data_value'])
            var id = $(domPlayerData).find('Player').attr('id');
            if (id == i_sceneID)
                mimeType = $(domPlayerData).find('Player').attr('mimeType');
        });
        return mimeType;
    },

    /**
     Create a new Scene
     If mimetype was give as an argument and it's of format
     Json.xxxx (i.e.: Json.weather, Json.spreadsheet ...) add it to scene table as well
     @method createScene
     @optional i_mimeType
     @optional i_name
     @return {Number} scene player_data id
     **/
    createScene: function (i_player_data, i_mimeType, i_name) {
        var self = this;
        var table_player_data = self.m_msdb.table_player_data();
        var recPlayerData = table_player_data.createRecord();
        if (i_mimeType && i_mimeType.match(/Json./)){
            i_player_data = $.parseXML(i_player_data);
            $(i_player_data).find('Player').attr('mimeType', i_mimeType);
            i_player_data = pepper.xmlToStringIEfix(i_player_data);
        }
        if (!_.isUndefined(i_name)){
            i_player_data = $.parseXML(i_player_data);
            $(i_player_data).find('Player').attr('label', i_name);
            i_player_data = pepper.xmlToStringIEfix(i_player_data);
        }
        recPlayerData['player_data_value'] = i_player_data;
        table_player_data.addRecord(recPlayerData);
        var scene_id = recPlayerData['player_data_id'];
        self.injectPseudoScenePlayersIDs(scene_id);
        pepper.fire(Pepper['SCENE_CREATED'], self, null, recPlayerData['player_data_id']);
        return self.getPseudoIdFromSceneId(scene_id);
    },

    /**
     Returns this model's attributes as...
     @method xmlToStringIEfix
     @param {Object} i_domPlayerData
     @return {String} xml string
     **/
    xmlToStringIEfix: function (i_domPlayerData) {
        var self = this;
        var player_data = (new XMLSerializer()).serializeToString(i_domPlayerData);
        return self.ieFixEscaped(player_data);
    },

    /**
     "Good" old IE, always a headache, jQuery workarounds....
     @method ieFixEscaped
     @param {String} escapedHTML
     @return {String}
     **/
    ieFixEscaped: function (escapedHTML) {
        return escapedHTML.replace(/xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, '').
            replace(/&lt;/g, '<').
            replace(/&gt;/g, '>').
            replace(/&amp;/g, '&').
            replace(/<rss/gi, '<Rss').replace(/rss>/g, 'Rss>').
            replace(/<background/gi, '<Background').replace(/background>/gi, 'Background>').
            replace(/<appearance/gi, '<Appearance').replace(/appearance>/gi, 'Appearance>').
            replace(/<gradientpoints/gi, '<GradientPoints').replace(/gradientpoints>/gi, 'GradientPoints>').
            replace(/<aspectratio/gi, '<AspectRatio').replace(/aspectratio>/gi, 'AspectRatio>').
            replace(/<layout/gi, '<Layout').replace(/layout>/gi, 'Layout>').
            replace(/<title/gi, '<Title').replace(/title>/gi, 'Title>').
            replace(/<description/gi, '<Description').replace(/description>/gi, 'Description>').
            replace(/<data/gi, '<Data').replace(/data>/gi, 'Data>').
            replace(/<player/gi, '<Player').replace(/player>/gi, 'Player>').
            replace(/<players/gi, '<Players').replace(/players>/gi, 'Players>').
            replace(/<text/gi, '<Text').replace(/text>/gi, 'Text>').
            replace(/<eventCommands/gi, '<EventCommands').replace(/eventCommands>/gi, 'EventCommands>').
            replace(/<eventCommand/gi, '<EventCommand').replace(/eventCommand>/gi, 'EventCommand>').
            replace(/<border/gi, '<Border').replace(/border>/gi, 'Border>').
            replace(/<scene/gi, '<Scene').replace(/scene>/gi, 'Scene>').
            replace(/<clock/gi, '<Clock').replace(/clock>/gi, 'Clock>').
            replace(/<point/gi, '<Point').replace(/point>/gi, 'Point>').
            replace(/<video/gi, '<Video').replace(/video>/gi, 'Video>').
            replace(/<image/gi, '<Image').replace(/image>/gi, 'Image>').
            replace(/<label/gi, '<Label').replace(/label>/gi, 'Label>').
            replace(/<font/gi, '<Font').replace(/font>/gi, 'Font>').
            replace(/fontsize/gi, 'fontSize').
            replace(/startdate/gi, 'startDate').
            replace(/enddate/gi, 'endDate').
            replace(/fontcolor/gi, 'fontColor').
            replace(/fontfamily/gi, 'fontFamily').
            replace(/fontweight/gi, 'fontWeight').
            replace(/fontstyle/gi, 'fontStyle').
            replace(/bordercolor/gi, 'borderColor').
            replace(/borderthickness/gi, 'borderThickness').
            replace(/cornerradius/gi, 'cornerRadius').
            replace(/textdecoration/gi, 'textDecoration').
            replace(/textalign/gi, 'textAlign').
            replace(/hdatasrc/gi, 'hDataSrc').
            replace(/minrefreshtime/gi, 'minRefreshTime').
            replace(/itemspath/gi, 'itemsPath').
            replace(/slideshow/gi, 'slideShow').
            replace(/iteminterval/gi, 'itemInterval').
            replace(/playvideoinfull/gi, 'playVideoInFull').
            replace(/randomorder/gi, 'randomOrder').
            replace(/providertype/gi, 'providerType').
            replace(/fieldname/gi, 'fieldName').
            replace(/fieldtype/gi, 'fieldType').
            replace(/gradienttype/gi, 'gradientType').
            replace(/autorewind/gi, 'autoRewind').
            replace(/clockformat/gi, 'clockFormat').
            replace(/clockmask/gi, 'clockMask').
            replace(/hresource/gi, 'hResource').
            replace(/videoidlist/gi, 'VideoIdList').
            replace(/<page/gi, '<Page').replace(/page>/gi, 'Page>').
            replace(/<gps/gi, '<GPS').replace(/gps>/gi, 'GPS>').
            replace(/<fixed/gi, '<Fixed').replace(/fixed>/gi, 'Fixed>').
            replace(/<xmlitem/gi, '<XmlItem').replace(/xmlitem>/gi, 'XmlItem>').
            replace(/<json/gi, '<Json').replace(/json>/gi, 'Json>').
            replace(/<locationbased/gi, '<LocationBased').replace(/locationbased>/gi, 'LocationBased>').
            replace(/<params/gi, '<Params').replace(/params>/gi, 'Params>').
            replace(/<url/gi, '<Url').replace(/url>/gi, 'Url>').
            replace(/maintainaspectratio/gi, 'maintainAspectRatio').
            replace(/<resource/gi, '<Resource').replace(/resource>/g, 'Resource>').
            // replace(/<htdata/gi, '<htData').replace(/htdata>/gi, 'htData>').
            replace(/<link/gi, '<LINK').replace(/link>/g, 'LINK>');
    },

    /**
     append scene player block to pepper player_data table
     @method appendScenePlayerBlock
     @param {Number} i_scene_id
     @param {XML} i_player_data
     **/
    appendScenePlayerBlock: function (i_scene_id, i_player_data) {
        var self = this;
        i_scene_id = pepper.sterilizePseudoId(i_scene_id);
        self.m_msdb.table_player_data().openForEdit(i_scene_id);
        var recPlayerData = self.m_msdb.table_player_data().getRec(i_scene_id);
        var scene_player_data = recPlayerData['player_data_value'];
        var sceneDomPlayerData = $.parseXML(scene_player_data);
        var playerData = $.parseXML(i_player_data);
        // use first child to overcome the removal by jquery of the HTML tag
        $(sceneDomPlayerData).find('Players').append(playerData.firstChild);
        // $(sceneDomPlayerData).find('Players').append($(i_player_data));
        var player_data = pepper.xmlToStringIEfix(sceneDomPlayerData);
        recPlayerData['player_data_value'] = player_data;
    },

    /**
     set entire scene playerdata
     @method setScenePlayerData
     @return {Number} scene player_data id
     **/
    setScenePlayerData: function (i_scene_id, i_player_data) {
        var self = this;
        i_scene_id = pepper.sterilizePseudoId(i_scene_id);
        self.m_msdb.table_player_data().openForEdit(i_scene_id);
        var recPlayerData = self.m_msdb.table_player_data().getRec(i_scene_id);
        recPlayerData['player_data_value'] = i_player_data;
    },

    /**
     Get a unique scene > player id
     @method generateSceneId
     @return {Number} Unique scene player id
     **/
    generateSceneId: function () {
        return ($.base64.encode(_.uniqueId('blockid'))).replace('=', '');
    },

    /**
     Sterilize pseudo id to scene id always returns scene_id as an integer rather pseudo id
     @method sterilizePseudoId
     @param {Number} i_id
     @return {Number} i_id
     **/
    sterilizePseudoId: function (i_id) {
        var self = this;
        var id = parseInt(i_id);
        if (_.isNaN(id))
            return pepper.getSceneIdFromPseudoId(i_id);
        return i_id;
    },

    /**
     Translate a scene id to its matching pseudo scene id
     @method getPseudoIdFromSceneId
     @param {Number} i_scene_id
     @return {Number} pseudo id
     **/
    getPseudoIdFromSceneId: function (i_scene_id) {
        var self = this;
        var found = undefined;
        var scenes = pepper.getScenes();
        _.each(scenes, function (domPlayerData, scene_id) {
            var injectedID = $(domPlayerData).find('Player').eq(0).attr('id');
            if (i_scene_id == scene_id)
                found = injectedID;
        });
        return found;
    },

    /**
     Translate an injected id to a table_player_data scene id
     @method createPseudoSceneID
     @param {Number} getSceneIdFromPseudoId
     @return {Number} scene id
     **/
    getSceneIdFromPseudoId: function (i_pseudo_id) {
        var self = this;
        var found = undefined;
        var scenes = pepper.getScenes();
        _.each(scenes, function (domPlayerData, scene_id) {
            var pseudo_id = $(domPlayerData).find('Player').eq(0).attr('id');
            if (pseudo_id == i_pseudo_id)
                found = scene_id;
        });
        return found;
    },

    /**
     Inject unique player ids for all players within a scene
     @method injectPseudoScenePlayersIDs
     @param {Number} i_scene_id
     **/
    injectPseudoScenePlayersIDs: function (i_scene_id) {
        var self = this;
        var scenes = {};
        if (!_.isUndefined(i_scene_id)) {
            var domPlayerData = self.getScenePlayerdataDom(i_scene_id);
            scenes[i_scene_id] = domPlayerData;
        } else {
            scenes = pepper.getScenes();
        }
        _.each(scenes, function (domPlayerData, scene_id) {
            $(domPlayerData).find('Player').eq(0).attr('id', pepper.generateSceneId());
            $(domPlayerData).find('Players').find('Player').each(function (i, player) {
                var blockID = pepper.generateSceneId();
                $(player).attr('id', blockID);
            });
            pepper.setScenePlayerData(scene_id, (new XMLSerializer()).serializeToString(domPlayerData));
        });
    },

    /**
     Remove all player ids from player_data inside a scene
     @method stripScenePlayersIDs
     **/
    stripScenePlayersIDs: function () {
        var self = this;
        self.m_tempScenePlayerIDs = {};
        var scenes = pepper.getScenes();
        _.each(scenes, function (domPlayerData, scene_id) {
            // $(domPlayerData).find('Player').eq(0).removeAttr('id');
            self.m_tempScenePlayerIDs[scene_id] = (new XMLSerializer()).serializeToString(domPlayerData);
            var players = $(domPlayerData).find('Players').find('Player').each(function (i, player) {
                // var blockID = pepper.generateSceneId();
                $(player).removeAttr('id');
            });
            pepper.setScenePlayerData(scene_id, (new XMLSerializer()).serializeToString(domPlayerData));
        });
    },

    /**
     Remove all player ids from i_domPlayerData
     @method stripPlayersID
     **/
    stripPlayersID: function (i_domPlayerData) {
        var self = this;
        $(i_domPlayerData).removeAttr('id');
        return i_domPlayerData;
    },

    /**
     Remove specific player id (i.e.: block) from scene player_data
     @method removeScenePlayer
     @param {Number} i_scene_id
     @param {Number} i_player_id
     **/
    removeScenePlayer: function (i_scene_id, i_player_data_id) {
        var self = this;
        i_scene_id = pepper.sterilizePseudoId(i_scene_id);
        self.m_msdb.table_player_data().openForEdit(i_scene_id);
        var recPlayerData = self.m_msdb.table_player_data().getRec(i_scene_id);
        var player_data = recPlayerData['player_data_value'];
        var domPlayerData = $.parseXML(player_data)
        $(domPlayerData).find('[id="' + i_player_data_id + '"]').remove();
        pepper.setScenePlayerData(i_scene_id, (new XMLSerializer()).serializeToString(domPlayerData));
    },

    /**
     Remove all scene players that use resources (3100 & 3130) and that include the specified resource id
     @method removeAllScenePlayersWithResource
     @param {Number} i_resource_id
     **/
    removeAllScenePlayersWithResource: function (i_resource_id) {
        var self = this;
        $(self.m_msdb.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
            var recPlayerData = self.m_msdb.table_player_data().getRec(player_data_id);
            var domSceneData = $.parseXML(recPlayerData['player_data_value']);
            var sceneID = $(domSceneData).find('Player').eq(0).attr('id');
            $(domSceneData).find('Player').each(function (i, playerData) {
                $(playerData).find('[player="3100"],[player="3130"],[player="3140"]').each(function (i, playeResourceData) {
                    var playerDataID = $(this).attr('id');
                    var hResource = $(playeResourceData).find('Resource').attr('hResource');
                    if (hResource == i_resource_id) {
                        pepper.removeScenePlayer(sceneID, playerDataID);
                    }
                });
            });
        });
    },

    /**
     Remove a scene
     @method removeScene
     **/
    removeScene: function (i_scene_player_data_id) {
        var self = this;
        var i_scene_id = pepper.sterilizePseudoId(i_scene_player_data_id);
        self.m_msdb.table_player_data().openForDelete(i_scene_id);
    },

    /**
     When we remove scene player ids we actually store them aside so we can restore them back after a save as the
     remote server expects a scene's player_data to have no player ids on its scene player_data
     @method restoreScenesWithPlayersIDs
     **/
    restoreScenesWithPlayersIDs: function () {
        var self = this;
        _.each(self.m_tempScenePlayerIDs, function (scene_player_data, scene_id) {
            pepper.setScenePlayerData(scene_id, scene_player_data);
        });
    },

    /**
     get a scene block playerdata
     @method getScenePlayerdataBlock
     @param {Number} i_scene_id
     @param {Number} i_player_data_id
     @return {Number} i_player_data_id
     **/
    getScenePlayerdataBlock: function (i_scene_id, i_player_data_id) {
        var self = this;
        i_scene_id = pepper.sterilizePseudoId(i_scene_id);
        self.m_msdb.table_player_data().openForEdit(i_scene_id);
        var recPlayerData = self.m_msdb.table_player_data().getRec(i_scene_id);
        var player_data = recPlayerData['player_data_value'];
        var domPlayerData = $.parseXML(player_data)
        var foundSnippet = $(domPlayerData).find('[id="' + i_player_data_id + '"]');
        return foundSnippet[0];
    },

    /**
     set a block id inside a scene with new player_data
     @method setScenePlayerdataBlock
     @param {Number} i_scene_id
     @param {Number} i_player_data_id
     @param {XML} player_data
     **/
    setScenePlayerdataBlock: function (i_scene_id, i_player_data_id, i_player_data) {
        var self = this;
        i_scene_id = pepper.sterilizePseudoId(i_scene_id);
        self.m_msdb.table_player_data().openForEdit(i_scene_id);
        var recPlayerData = self.m_msdb.table_player_data().getRec(i_scene_id);
        var player_data = recPlayerData['player_data_value'];
        var domPlayerData = $.parseXML(player_data);
        var playerData = $.parseXML(i_player_data);
        // use first child to overcome the removal by jquery of the HTML tag
        $(domPlayerData).find('[id="' + i_player_data_id + '"]').replaceWith(playerData.firstChild);
        player_data = pepper.xmlToStringIEfix(domPlayerData);
        self.setScenePlayerData(i_scene_id, player_data);
    },

    /**
     Get all Scenes and convert them to dom objects returning a hash of object literals
     @method getScenes
     @return {Object} all scenes as objects
     **/
    getScenes: function () {
        var self = this;
        var scenes = {};
        $(self.m_msdb.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
            var recPlayerData = self.m_msdb.table_player_data().getRec(player_data_id);
            var domPlayerData = $.parseXML(recPlayerData['player_data_value'])
            scenes[recPlayerData['player_data_id']] = domPlayerData;
        });
        return scenes;
    },

    /**
     Get Scene player record from player_data table
     @method getScenePlayerRecord
     @param {Number} i_sceneID
     @return {Object} XML playerdata
     **/
    getScenePlayerRecord: function (i_scene_id) {
        var self = this;
        return self.m_msdb.table_player_data().getRec(i_scene_id);
    },

    /**
     Get Scene player data
     @method getScenePlayerdata
     @param {Number} i_scene_id
     @return {Object} XML scene player data
     **/
    getScenePlayerdata: function (i_scene_id) {
        var self = this;
        i_scene_id = pepper.sterilizePseudoId(i_scene_id);
        return pepper.getScenePlayerRecord(i_scene_id)['player_data_value'];
    },

    /**
     Get Scene player data as dom
     @method getScenePlayerdataDom
     @param {Number} i_sceneID
     @return {Object} dom
     **/
    getScenePlayerdataDom: function (i_scene_id) {
        var self = this;
        i_scene_id = pepper.sterilizePseudoId(i_scene_id);
        var scene_player_data = pepper.getScenePlayerRecord(i_scene_id)['player_data_value'];
        return $.parseXML(scene_player_data)
    },

    /**
     Announce via event that a template view (screen layout) has been edited
     @method announceTemplateViewerEdited
     @param {Number} i_campaign_timeline_board_template_id
     **/
    announceTemplateViewerEdited: function (i_campaign_timeline_board_template_id) {
        var self = this;
        pepper.fire(Pepper['TEMPLATE_VIEWER_EDITED'], self, null, i_campaign_timeline_board_template_id);
    },

    /**
     Create a new campaign in the local database
     @method createCampaign
     @param {Number} i_campaginName
     @return {Number} campaign id created
     **/
    createCampaign: function (i_campaginName) {
        var self = this;
        var campaigns = self.m_msdb.table_campaigns();
        var campaign = campaigns.createRecord();
        campaign.campaign_name = i_campaginName;
        campaigns.addRecord(campaign);
        pepper.fire(Pepper['NEW_CAMPAIGN_CREATED'], self, null, campaign['campaign_id']);
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
     @return {Number} campain_board_id
     **/
    assignCampaignToBoard: function (i_campaign_id, i_board_id) {
        var self = this;
        var campaign_boards = self.m_msdb.table_campaign_boards();
        var campain_board = campaign_boards.createRecord();
        campain_board.campaign_id = i_campaign_id;
        campain_board.board_id = i_board_id;
        campaign_boards.addRecord(campain_board);
        return campain_board['campaign_board_id'];
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
        var foundCampainBoardID = -1;

        $(self.m_msdb.table_campaign_boards().getAllPrimaryKeys()).each(function (k, campaign_board_id) {
            var recCampaignBoard = self.m_msdb.table_campaign_boards().getRec(campaign_board_id);
            if (i_campaign_id == recCampaignBoard.campaign_id && totalBoardsFound == 0) {
                foundCampainBoardID = recCampaignBoard['campaign_board_id']
                totalBoardsFound++;
            }
        });

        return foundCampainBoardID;
    },

    /**
     Get a campaign_board into it's matching pair in global boards.
     @method getBoardFromCampaignBoard
     @param {Number} i_campaign_board_id
     @return {Number} board_id
     **/
    getBoardFromCampaignBoard: function (i_campaign_board_id) {
        var self = this;
        var recCampaignBoard = self.m_msdb.table_campaign_boards().getRec(i_campaign_board_id);
        return recCampaignBoard.board_id;
    },

    /**
     Get i_campaign_board_id into campaign_id using local table_campaign_boards (not global boards)
     @method getCampaignIdFromCampaignBoardId
     @param {Number} i_campaign_board_id
     @return {Number} campaign_id
     **/
    getCampaignIdFromCampaignBoardId: function (i_campaign_board_id) {
        var self = this;
        var recCampaignBoard = self.m_msdb.table_campaign_boards().getRec(i_campaign_board_id);
        return recCampaignBoard.campaign_id;
    },

    /**
     get a Campaign's play mode (sceduler / sequencer) from timeline id
     @method getCampaignPlayModeFromTimeline
     @param {Number} i_campaign_timeline_id
     @return {Number} play mode
     **/
    getCampaignPlayModeFromTimeline: function (i_campaign_timeline_id) {
        var recTimeline = pepper.getCampaignTimelineRecord(i_campaign_timeline_id);
        var campaign_id = recTimeline.campaign_id;
        var recCampaign = pepper.getCampaignRecord(campaign_id);
        return String(recCampaign['campaign_playlist_mode']);
    },

    /**
     Get i_campaign_id into campaign_board_id using local table_campaign_boards (not global boards)
     @method getCampaignIdFromCampaignBoardId
     @param {Number} i_campaign_board_id
     @return {Number} campaign_id
     **/
    getCampaignBoardIdFromCampaignId: function (i_campaign_id) {
        var self = this;
        var found_campaign_board_id = -1;
        $(self.m_msdb.table_campaign_boards().getAllPrimaryKeys()).each(function (k, campaign_board_id) {
            var recCampaignBoard = self.m_msdb.table_campaign_boards().getRec(campaign_board_id);
            if (recCampaignBoard['campaign_id'] == i_campaign_id)
                found_campaign_board_id = recCampaignBoard['campaign_board_id'];
        });
        return found_campaign_board_id;
    },

    /**
     Create channel and assign that channel to the specified timeline
     @method createTimelineChannel
     @param {Number} i_campaign_timeline_id the timeline id to assign channel to
     @return {Array} createdChanels array of channel ids created
     **/
    createTimelineChannel: function (i_campaign_timeline_id) {
        var self = this;
        var chanels = self.m_msdb.table_campaign_timeline_chanels();
        var chanel = chanels.createRecord();
        chanel.chanel_name = "CH";
        chanel.campaign_timeline_id = i_campaign_timeline_id;
        chanels.addRecord(chanel);
        pepper.fire(Pepper['NEW_CHANNEL_ADDED'], self, null, {
            chanel: chanel['campaign_timeline_chanel_id'],
            campaign_timeline_id: i_campaign_timeline_id
        });
        return chanel['campaign_timeline_chanel_id'];
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

        for (var i in i_viewers) {
            i++;
            var chanels = self.m_msdb.table_campaign_timeline_chanels();
            var chanel = chanels.createRecord();
            chanel.chanel_name = "CH" + i;
            chanel.campaign_timeline_id = i_campaign_timeline_id;
            chanels.addRecord(chanel);
            createdChanels.push(chanel['campaign_timeline_chanel_id']);
        }
        pepper.fire(Pepper['NEW_CHANNEL_CREATED'], self, null, createdChanels);
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
        pepper.fire(Pepper['NEW_TEMPLATE_CREATED'], self, null, returnData);
        return returnData;
    },

    /**
     Create a global viewer in an existing board_template
     @method createViewer
     @param {Number} board_template_id
     @param {Number} i_board_template_id
     @param {Object} i_props
     @return {Number} viewer id
     **/
    createViewer: function (i_board_template_id, i_props) {
        var self = this;
        var viewers = self.m_msdb.table_board_template_viewers();
        var viewer = viewers.createRecord();
        viewer.viewer_name = "Viewer";
        viewer.pixel_width = i_props['w'];
        viewer.pixel_height = i_props['h'];
        viewer.pixel_x = i_props['x'];
        viewer.pixel_y = i_props['y'];
        viewer.board_template_id = i_board_template_id;
        viewers.addRecord(viewer);
        return viewer['board_template_viewer_id'];
    },

    /**
     Change a viewer's (aka screen division) order (layer) z-order
     @method updateTemplateViewerOrder
     @param {number} i_board_template_viewer_id
     @param {number} i_view_order
     **/
    updateTemplateViewerOrder: function (i_board_template_viewer_id, i_view_order) {
        var self = this;
        self.m_msdb.table_board_template_viewers().openForEdit(i_board_template_viewer_id);
        var recEditBoardTemplateViewer = self.m_msdb.table_board_template_viewers().getRec(i_board_template_viewer_id);
        recEditBoardTemplateViewer['viewer_order'] = i_view_order;
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
        pepper.fire(Pepper['NEW_TIMELINE_CREATED'], self, null, timeline['campaign_timeline_id']);
        return timeline['campaign_timeline_id'];
    },

    /**
     Create a new player (a.k.a block) and add it to the specified channel_id
     @method createNewChannelPlayer
     @param {Number} i_campaign_timeline_chanel_id is the channel id assign player to
     @param {Number} i_playerCode is a unique pre-set code that exists per type of block (see component list for all available code)
     @param {Number} i_offset set in seconds of when to begin playing the content with respect to timeline_channel
     @param {Number} i_resourceID optional param used when creating a block with embedded resource (i.e.: video / image / swf)
     @param {Number} i_sceneID optional param used when creating a block with embedded scene
     @return {Object} campaign_timeline_chanel_player_id and campaign_timeline_chanel_player_data as json object
     **/
    createNewChannelPlayer: function (i_campaign_timeline_chanel_id, i_playerCode, i_offset, i_resourceID, i_sceneID) {
        var self = this;

        var timelinePlayers = self.m_msdb.table_campaign_timeline_chanel_players();
        var recTimelinePlayer = timelinePlayers.createRecord();
        var component = BB.PepperHelper.getBlockBoilerplate(i_playerCode);
        var player_data = component.getDefaultPlayerData(BB.CONSTS.PLACEMENT_CHANNEL, i_resourceID);

        // dealing with embedded scene, override player_data with scene handle
        if (!_.isUndefined(i_sceneID))
            player_data = '<Player hDataSrc="' + i_sceneID + '"/>';

        recTimelinePlayer.player_data = player_data;
        recTimelinePlayer.campaign_timeline_chanel_id = i_campaign_timeline_chanel_id;
        recTimelinePlayer.player_duration = 10;
        recTimelinePlayer.player_offset_time = i_offset;
        timelinePlayers.addRecord(recTimelinePlayer);

        var returnData = {
            campaign_timeline_chanel_player_id: recTimelinePlayer['campaign_timeline_chanel_player_id'],
            campaign_timeline_chanel_player_data: recTimelinePlayer['player_data']
        };
        pepper.fire(Pepper['NEW_PLAYER_CREATED'], self, null, returnData);
        return returnData;
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

        $(pepper.m_msdb.table_campaign_timeline_board_templates().getAllPrimaryKeys()).each(function (k, table_campaign_timeline_board_template_id) {
            var recCampaignTimelineBoardTemplate = pepper.m_msdb.table_campaign_timeline_board_templates().getRec(table_campaign_timeline_board_template_id);
            if (recCampaignTimelineBoardTemplate['campaign_timeline_id'] == i_campaign_timeline_id) {
                foundTemplatesIDs.push(table_campaign_timeline_board_template_id);
            }
        });
        return foundTemplatesIDs;
    },

    /**
     Set a Board Template Viewer props
     @method setBoardTemplateViewer
     @param {Number} i_board_template_viewer_id
     @return {Number} i_props
     **/
    setBoardTemplateViewer: function (i_campaign_timeline_board_template_id, i_board_template_viewer_id, i_props) {
        var self = this;
        var x = Math.round(i_props.x);
        var y = Math.round(i_props.y);
        var w = Math.round(i_props.w);
        var h = Math.round(i_props.h);

        // log('savings: template_id: ' + i_campaign_timeline_board_template_id + ' view_id: ' + i_board_template_viewer_id + ' ' + x + 'x' + y + ' ' + w + '/' + h);

        self.m_msdb.table_board_template_viewers().openForEdit(i_board_template_viewer_id);
        var recEditBoardTemplateViewer = self.m_msdb.table_board_template_viewers().getRec(i_board_template_viewer_id);
        recEditBoardTemplateViewer['pixel_x'] = x;
        recEditBoardTemplateViewer['pixel_y'] = y;
        recEditBoardTemplateViewer['pixel_width'] = w;
        recEditBoardTemplateViewer['pixel_height'] = h;
        pepper.announceTemplateViewerEdited(i_campaign_timeline_board_template_id);
    },

    /**
     Get a Board Template Viewer props
     @method getBoardTemplateViewer
     @param {Number} i_board_template_viewer_id
     @return {Number} i_props
     **/
    getBoardTemplateViewer: function (i_board_template_viewer_id) {
        var self = this;
        var recEditBoardTemplateViewer = self.m_msdb.table_board_template_viewers().getRec(i_board_template_viewer_id);
        return {
            x: recEditBoardTemplateViewer['pixel_x'],
            y: recEditBoardTemplateViewer['pixel_y'],
            w: recEditBoardTemplateViewer['pixel_width'],
            h: recEditBoardTemplateViewer['pixel_height']
        };
    },

    /**
     Get all the global board template ids of a timeline
     @method getGlobalTemplateIdOfTimeline
     @param {Number} i_campaign_timeline_id
     @return {Array} foundGlobalBoardTemplatesIDs global board template ids
     **/
    getGlobalTemplateIdOfTimeline: function (i_campaign_timeline_id) {
        var self = this;
        var found = [];
        $(pepper.m_msdb.table_campaign_timeline_board_templates().getAllPrimaryKeys()).each(function (k, table_campaign_timeline_board_template_id) {
            var recCampaignTimelineBoardTemplate = pepper.m_msdb.table_campaign_timeline_board_templates().getRec(table_campaign_timeline_board_template_id);
            if (recCampaignTimelineBoardTemplate['campaign_timeline_id'] == i_campaign_timeline_id) {
                found.push(recCampaignTimelineBoardTemplate['board_template_id']);
            }
        });
        return found[0];
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

        $(pepper.m_msdb.table_campaign_timeline_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_id) {
            var recCampaignTimelineChannel = pepper.m_msdb.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);
            if (i_campaign_timeline_id == recCampaignTimelineChannel['campaign_timeline_id']) {
                foundChannelsIDs.push(campaign_timeline_chanel_id);
            }
        });
        return foundChannelsIDs;
    },

    /**
     Get a block's record using it's block_id
     @method getBlockRecord
     @param {Object} i_block_id
     @return {Object} recBlock
     **/
    getBlockRecord: function (i_block_id) {
        var self = this;
        return self.m_msdb.table_campaign_timeline_chanel_players().getRec(i_block_id);
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
        pepper.m_msdb.table_campaign_timeline_chanel_players().openForEdit(i_block_id);
        var recEditBlock = self.m_msdb.table_campaign_timeline_chanel_players().getRec(i_block_id);
        recEditBlock[i_key] = i_value;
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
        var recCampaignTimelineBoardTemplate = pepper.m_msdb.table_campaign_timeline_board_templates().getRec(i_campaign_timeline_board_template_id);
        var board_template_id = recCampaignTimelineBoardTemplate['board_template_id'];
        var recBoardTemplate = pepper.m_msdb.table_board_templates().getRec(board_template_id);
        var board_id = recBoardTemplate['board_id'];
        var recBoard = pepper.m_msdb.table_boards().getRec(board_id);
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
     Assign viewer (screen division) on the timeline to channel
     @method assignViewerToTimelineChannel
     @param {Number} i_campaign_timeline_board_template_id
     @param {Object} i_viewers a json object with all viewers
     @param {Array} i_channels a json object with all channels
     @return none
     **/
    assignViewerToTimelineChannel: function (i_campaign_timeline_board_template_id, i_viewer_id, i_channel_id) {
        var self = this;
        var viewerChanels = self.m_msdb.table_campaign_timeline_board_viewer_chanels();
        var viewerChanel = viewerChanels.createRecord();
        viewerChanel.campaign_timeline_board_template_id = i_campaign_timeline_board_template_id;
        viewerChanel.board_template_viewer_id = i_viewer_id;
        viewerChanel.campaign_timeline_chanel_id = i_channel_id;
        viewerChanels.addRecord(viewerChanel);
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
     Get campaign schedule for timeline
     @method getCampaignsSchedules
     @param {Number} i_campaign_timeline_id
     @return {Object} schedule record
     **/
    getCampaignsSchedule: function (i_campaign_timeline_id) {
        var self = this;
        var found = -1;
        $(self.m_msdb.table_campaign_timeline_schedules().getAllPrimaryKeys()).each(function (k, campaign_timeline_schedule_id) {
            var recCampaignTimelineSchedule = self.m_msdb.table_campaign_timeline_schedules().getRec(campaign_timeline_schedule_id);
            if (recCampaignTimelineSchedule.campaign_timeline_id == i_campaign_timeline_id)
                found = recCampaignTimelineSchedule;
        });
        return found;
    },

    /**
     Get campaign schedule for timeline
     @method setCampaignsSchedule
     @param {Number} i_campaign_timeline_id
     @param {Object} i_key
     @param {Object} i_value
     **/
    setCampaignsSchedule: function (i_campaign_timeline_id, i_key, i_value) {
        var self = this;
        $(self.m_msdb.table_campaign_timeline_schedules().getAllPrimaryKeys()).each(function (k, campaign_timeline_schedule_id) {
            var recCampaignTimelineSchedule = self.m_msdb.table_campaign_timeline_schedules().getRec(campaign_timeline_schedule_id);
            if (recCampaignTimelineSchedule.campaign_timeline_id == i_campaign_timeline_id) {
                self.m_msdb.table_campaign_timeline_schedules().openForEdit(campaign_timeline_schedule_id);
                var recScheduler = self.m_msdb.table_campaign_timeline_schedules().getRec(campaign_timeline_schedule_id);
                recScheduler[i_key] = i_value;
            }
        });
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
        $(self.m_msdb.table_campaign_timeline_sequences().getAllPrimaryKeys()).each(function (k, campaign_timeline_sequence_id) {
            var recCampaignTimelineSequence = self.m_msdb.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
            if (recCampaignTimelineSequence.campaign_timeline_id == i_campaign_timeline_id) {
                self.m_msdb.table_campaign_timeline_sequences().openForEdit(campaign_timeline_sequence_id);
                var recEditCampaignTimelineSequence = self.m_msdb.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
                recEditCampaignTimelineSequence.sequence_index = i_sequenceIndex;
                recEditCampaignTimelineSequence.sequence_count = 0;
                updatedSequence = true;
            }
        });

        // i_campaign_timeline_id was not found in the sequencer so create new record
        if (updatedSequence == false) {
            var table_campaign_timeline_sequences = self.m_msdb.table_campaign_timeline_sequences();
            var recCampaignTimelineSequence = table_campaign_timeline_sequences.createRecord();
            recCampaignTimelineSequence.sequence_index = i_sequenceIndex;
            recCampaignTimelineSequence.sequence_count = 0;
            recCampaignTimelineSequence.campaign_timeline_id = i_campaign_timeline_id;
            recCampaignTimelineSequence.campaign_id = i_campaign_id;
            table_campaign_timeline_sequences.addRecord(recCampaignTimelineSequence);
        }
    },

    /**
     Check that every timeline within a campaign has a scheduler table entry, if not, create one with default values
     @method checkAndCreateCampaignTimelineScheduler
     @param {Number} i_campaign_id
     @return none
     **/
    checkAndCreateCampaignTimelineScheduler: function (i_campaign_id) {
        var self = this;
        $(self.m_msdb.table_campaign_timelines().getAllPrimaryKeys()).each(function (k, campaign_timeline_id) {
            var recCampaignTimeline = self.m_msdb.table_campaign_timelines().getRec(campaign_timeline_id);

            // if found a one timeline that belongs to i_campaign_id
            if (recCampaignTimeline['campaign_id'] == i_campaign_id) {
                var schedulerFound = 0;
                $(self.m_msdb.table_campaign_timeline_schedules().getAllPrimaryKeys()).each(function (k, campaign_timeline_schedule_id) {
                    var recCampaignTimelineSchedule = self.m_msdb.table_campaign_timeline_schedules().getRec(campaign_timeline_schedule_id);
                    if (recCampaignTimelineSchedule.campaign_timeline_id == campaign_timeline_id)
                        schedulerFound = 1;
                });
                if (!schedulerFound)
                    pepper.createCampaignTimelineScheduler(i_campaign_id, campaign_timeline_id);
            }
        });
    },

    /**
     Create a campaign timelime scheduler record for new timeline
     @method createCampaignTimelineScheduler
     @param {Number} i_campaign_id
     @param {Number} i_campaign_timeline_id
     @return none
     **/
    createCampaignTimelineScheduler: function (i_campaign_id, i_campaign_timeline_id) {
        var self = this;
        var startDate = new Date();
        var endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        var dateStart = startDate.getMonth() + 1 + '/' + startDate.getDate() + '/' + startDate.getFullYear() + ' 12:00 AM';
        var dateEnd = endDate.getMonth() + 1 + '/' + endDate.getDate() + '/' + endDate.getFullYear() + ' 12:00 AM';
        var table_campaign_timeline_schedules = self.m_msdb.table_campaign_timeline_schedules();
        var recCampaignTimelineSchedules = table_campaign_timeline_schedules.createRecord();
        recCampaignTimelineSchedules.campaign_timeline_id = i_campaign_timeline_id;
        recCampaignTimelineSchedules.custom_duration = 'True';
        recCampaignTimelineSchedules.duration = 3600;
        recCampaignTimelineSchedules.repeat_type = 1;
        recCampaignTimelineSchedules.week_days = 127;
        recCampaignTimelineSchedules.conflict = false;
        recCampaignTimelineSchedules.pattern_name = 'pattern';
        recCampaignTimelineSchedules.priority = 1;
        recCampaignTimelineSchedules.start_date = dateStart;
        recCampaignTimelineSchedules.end_date = dateEnd;
        table_campaign_timeline_schedules.addRecord(recCampaignTimelineSchedules);
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
            var sequenceIndex = recCampaignTimelineSequence['sequence_index'];
            if (sequenceIndex == i_sequence_index && i_campaign_id == recCampaignTimelineSequence['campaign_id'])
                timeline_id = recCampaignTimelineSequence['campaign_timeline_id']
        });
        return timeline_id;
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
     Get a resource record via its resource_id.
     @method getResourceRecord
     @param {Number} i_resource_id
     @return {Object} foundResourceRecord
     **/
    getResourceRecord: function (i_resource_id) {
        var self = this;
        return self.m_msdb.table_resources().getRec(i_resource_id);
    },

    /**
     Get the type of a resource (png/jpg...) for specified native_id
     @method getResourceType
     @param {Number} i_resource_id
     @return {String} resourceType
     **/
    getResourceType: function (i_resource_id) {
        var self = this;
        var recResource = self.m_msdb.table_resources().getRec(i_resource_id);
        return recResource['resource_type'];
    },

    /**
     Get the native resource id from handle
     @method getResourceNativeID
     @param {Number} i_resource_id
     @return {Number} nativeID
     **/
    getResourceNativeID: function (i_resource_id) {
        var self = this;
        var recResource = self.m_msdb.table_resources().getRec(i_resource_id);
        if (_.isNull(recResource))
            return null;
        return recResource['native_id'];
    },

    /**
     Get the name of a resource from the resources table using it's native_id
     @method getResourceName
     @param {Number} i_resource_id
     @return {Number} resourceName
     **/
    getResourceName: function (i_resource_id) {
        var self = this;
        var recResource = self.m_msdb.table_resources().getRec(i_resource_id);
        return recResource['resource_name'];
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
        self.m_msdb.table_resources().openForEdit(i_resource_id);
        var recResource = self.m_msdb.table_resources().getRec(i_resource_id);
        recResource[i_key] = i_value;
    },

    /**
     Remove a campaign record
     @method removeCampaign
     @param {Number} i_campaign_id
     @return none
     **/
    removeCampaign: function (i_campaign_id) {
        var self = this;
        self.m_msdb.table_campaigns().openForDelete(i_campaign_id);
    },

    /**
     Remove campaign board_id
     @method removeCampaignBoard
     @param {Number} i_campaign_id
     @return none
     **/
    removeCampaignBoard: function (i_campaign_id) {
        var self = this;
        $(self.m_msdb.table_campaign_boards().getAllPrimaryKeys()).each(function (k, campaign_board_id) {
            var recCampaignBoard = self.m_msdb.table_campaign_boards().getRec(campaign_board_id);
            if (recCampaignBoard['campaign_id'] == i_campaign_id) {
                self.m_msdb.table_campaign_boards().openForDelete(campaign_board_id);
            }
        });
    },

    /**
     Remove all boards in msdb
     @method removeAllBoards
     @return none
     **/
    removeAllBoards: function () {
        var self = this;

        $(self.m_msdb.table_boards().getAllPrimaryKeys()).each(function (k, board_id) {
            self.m_msdb.table_boards().openForDelete(board_id);
        });
    },

    /**
     Remove a block (i.e.: player) from campaign > timeline > channel
     @method removeBlockFromTimelineChannel
     @param {Number} i_block_id
     @return none
     **/
    removeBlockFromTimelineChannel: function (i_block_id) {
        var self = this;
        var status = self.m_msdb.table_campaign_timeline_chanel_players().openForDelete(i_block_id);
        pepper.fire(Pepper['REMOVE_TIMELINE_CHANNEL_BLOCK'], self, null, i_block_id);
    },

    /**
     Remove all blocks (i.e.: players) from campaign > timeline > channel
     @method removeBlocksFromTimelineChannel
     @param {Number} i_block_id
     @return none
     **/
    removeBlocksFromTimelineChannel: function (i_campaign_timeline_chanel_id) {
        var self = this;
        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            if (recCampaignTimelineChannelPlayer['campaign_timeline_chanel_id'] == i_campaign_timeline_chanel_id) {
                var status = self.m_msdb.table_campaign_timeline_chanel_players().openForDelete(campaign_timeline_chanel_player_id);
            }
        });
    },

    /**
     Remove a timeline from sequences
     @method removeTimelineFromSequences
     @param {Number} i_timeline_id
     @return none
     **/
    removeTimelineFromSequences: function (i_campaign_timeline_id) {
        var self = this;
        $(self.m_msdb.table_campaign_timeline_sequences().getAllPrimaryKeys()).each(function (k, campaign_timeline_sequence_id) {
            var recCampaignTimelineSequence = self.m_msdb.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
            if (recCampaignTimelineSequence['campaign_timeline_id'] == i_campaign_timeline_id) {
                self.m_msdb.table_campaign_timeline_sequences().openForDelete(campaign_timeline_sequence_id);
            }
        });
    },

    /**
     Remove board template from timeline
     @method removeBoardTemplateFromTimeline
     @param {Number} i_timeline_id
     @return {Number} campaign_timeline_board_template_id
     **/
    removeBoardTemplateFromTimeline: function (i_timeline_id) {
        var self = this;
        var campaign_timeline_board_template_id = pepper.getTemplatesOfTimeline(i_timeline_id)[0];
        self.m_msdb.table_campaign_timeline_board_templates().openForDelete(campaign_timeline_board_template_id);
        return campaign_timeline_board_template_id;
    },

    /**
     Remove board template
     @method removeBoardTemplate
     @param {Number} i_campaign_timeline_board_template_id
     **/
    removeBoardTemplate: function (i_board_template_id) {
        var self = this;
        self.m_msdb.table_board_templates().openForDelete(i_board_template_id);
        return i_board_template_id;
    },

    /**
     Remove board template viewers
     @method removeBoardTemplateViewers
     @param {Number} i_board_template_id
     @return {Array} boardTemplateViewerIDs
     **/
    removeBoardTemplateViewers: function (i_board_template_id) {
        var self = this;
        var boardTemplateViewerIDs = [];

        $(pepper.m_msdb.table_board_template_viewers().getAllPrimaryKeys()).each(function (k, board_template_viewer_id) {
            var recBoardTemplateViewers = self.m_msdb.table_board_template_viewers().getRec(board_template_viewer_id);
            if (recBoardTemplateViewers['board_template_id'] == i_board_template_id) {
                var a = self.m_msdb.table_board_template_viewers().openForDelete(board_template_viewer_id);
                boardTemplateViewerIDs.push(board_template_viewer_id);
            }
        });
        return boardTemplateViewerIDs;
    },

    /**
     Remove board template viewer
     @method removeBoardTemplateViewer
     @param {Number} i_board_template_id
     @param {Number} i_board_template_viewer_id
     **/
    removeBoardTemplateViewer: function (i_board_template_id, i_board_template_viewer_id) {
        var self = this;
        self.m_msdb.table_board_template_viewers().openForDelete(i_board_template_viewer_id);
    },

    /**
     Remove board template viewers
     @method removeTimelineBoardViewerChannels
     @param {Number} i_campaign_timeline_board_template_id
     @return none
     **/
    removeTimelineBoardViewerChannels: function (i_campaign_timeline_board_template_id) {
        var self = this;

        $(self.m_msdb.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {
            var recCampaignTimelineViewerChanels = self.m_msdb.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineViewerChanels['campaign_timeline_board_template_id'] == i_campaign_timeline_board_template_id) {
                self.m_msdb.table_campaign_timeline_board_viewer_chanels().openForDelete(campaign_timeline_board_viewer_chanel_id);
            }
        });
    },

    /**
     Remove the association between the screen division (aka viewer) and all channels that are assigned with that viewer
     @method removeTimelineBoardViewerChannel
     @param {Number} i_campaign_timeline_board_template_id
     @return {Number} return the channel that was de-associated with viewer
     **/
    removeTimelineBoardViewerChannel: function (i_board_template_viewer_id) {
        var self = this;
        var campaign_timeline_chanel_id = -1;
        $(self.m_msdb.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {
            var recCampaignTimelineViewerChanels = self.m_msdb.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineViewerChanels['board_template_viewer_id'] == i_board_template_viewer_id) {
                campaign_timeline_chanel_id = recCampaignTimelineViewerChanels['campaign_timeline_chanel_id'];
                self.m_msdb.table_campaign_timeline_board_viewer_chanels().openForDelete(campaign_timeline_board_viewer_chanel_id);
            }
        });
        return campaign_timeline_chanel_id;
    },

    /**
     Remove a channel from a timeline
     @method removeChannelFromTimeline
     @param {Number} i_channel_id
     @return {Boolean} status
     **/
    removeChannelFromTimeline: function (i_channel_id) {
        var self = this;
        return self.m_msdb.table_campaign_timeline_chanels().openForDelete(i_channel_id);
    },

    /**
     Remove blocks (a.k.a players) from all campaign that use the specified resource_id (native id)
     @method removeBlocksWithResourceID
     @param {Number} i_resource_id
     @return none
     **/
    removeBlocksWithResourceID: function (i_resource_id) {
        var self = this;
        // self.m_msdb.table_resources().openForDelete(i_resource_id);

        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var xPlayerData = x2js.xml_str2json(playerData);
            var resourceID = undefined;
            try {
                resourceID = xPlayerData['Player']['Data']['Resource']['_hResource'];
            } catch (e) {
            }
            if (resourceID != undefined && resourceID == i_resource_id) {
                pepper.removeBlockFromTimelineChannel(campaign_timeline_chanel_player_id);
            }
        });
    },

    /**
     Remove blocks (a.k.a players) from all campaign timeline  channels that use the specified scene_id
     @method removeBlocksWithSceneID
     @param {Number} i_scene_id
     @return none
     **/
    removeBlocksWithSceneID: function (i_scene_id) {
        var self = this;
        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var domPlayerData = $.parseXML(playerData);
            var scene_id = $(domPlayerData).find('Player').attr('hDataSrc');
            if (scene_id == i_scene_id)
                pepper.removeBlockFromTimelineChannel(campaign_timeline_chanel_player_id);
        });
    },

    /**
     Remove all refernce to a resource id from within Scenes > BlockCollections that refer to that particulat resource id
     In other words, check all scenes for existing block collections, and if they refer to resource id, remove that entry
     @method removeResourceFromBlockCollectionInScenes
     @param {Number} i_resource_id resource id to search for and remove in all scenes > BlockCollections
     **/
    removeResourceFromBlockCollectionInScenes: function (i_resource_id) {
        var self = this;
        $(self.m_msdb.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
            var recPlayerData = self.m_msdb.table_player_data().getRec(player_data_id);
            var domSceneData = $.parseXML(recPlayerData['player_data_value']);
            var currentSceneID = $(domSceneData).find('Player').eq(0).attr('id');
            $(domSceneData).find('Player').each(function (i, playerData) {
                $(playerData).find('[player="' + BB.CONSTS.BLOCKCODE_COLLECTION + '"]').each(function (i, playerDataBlockCollection) {
                    $(playerDataBlockCollection).find('Collection').children().each(function (k, page) {
                        var resource_id = $(page).find('Resource').attr('hResource');
                        if (i_resource_id == resource_id) {
                            $(page).remove();
                            currentSceneID = pepper.sterilizePseudoId(currentSceneID);
                            self.m_msdb.table_player_data().openForEdit(currentSceneID);
                            var player_data = pepper.xmlToStringIEfix(domSceneData);
                            recPlayerData['player_data_value'] = player_data;
                        }
                    });
                });
            });
        });
    },

    /**
     Remove all refernce to a scene id from within Scenes > BlockCollections that refer to that particulat scene id
     In other words, check all scenes for existing block collections, and if they refer to scene_id, remove that entry
     @method removeSceneFromBlockCollectionWithSceneId
     @param {Number} i_scene_id scene id to search for and remove in all scenes > BlockCollections
     **/
    removeSceneFromBlockCollectionInScenes: function (i_scene_id) {
        var self = this;
        $(self.m_msdb.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
            var recPlayerData = self.m_msdb.table_player_data().getRec(player_data_id);
            var domSceneData = $.parseXML(recPlayerData['player_data_value']);
            var currentSceneID = $(domSceneData).find('Player').eq(0).attr('id');
            $(domSceneData).find('Player').each(function (i, playerData) {
                $(playerData).find('[player="' + BB.CONSTS.BLOCKCODE_COLLECTION + '"]').each(function (i, playerDataBlockCollection) {
                    $(playerDataBlockCollection).find('Collection').children().each(function (k, page) {
                        var scene_id = $(page).find('Player').attr('hDataSrc');
                        if (scene_id == i_scene_id) {
                            $(page).remove();
                            currentSceneID = pepper.sterilizePseudoId(currentSceneID);
                            self.m_msdb.table_player_data().openForEdit(currentSceneID);
                            var player_data = pepper.xmlToStringIEfix(domSceneData);
                            recPlayerData['player_data_value'] = player_data;
                        }
                    });
                });
            });
        });
    },

    /**
     Remove the scene from any block collection which resides in campaign timeline channels that uses that scene in its collection list
     @method removeSceneFromBlockCollectionsInChannels
     @param {Number} i_scene_id
     @return none
     **/
    removeSceneFromBlockCollectionsInChannels: function (i_scene_id) {
        var self = this;
        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var domPlayerData = $.parseXML(playerData);
            var blockType = $(domPlayerData).find('Player').attr('player');
            if (blockType == BB.CONSTS.BLOCKCODE_COLLECTION) {
                $(domPlayerData).find('Collection').children().each(function (k, page) {
                    var scene_hDataSrc;
                    var type = $(page).attr('type');
                    if (type == 'scene') {
                        scene_hDataSrc = $(page).find('Player').attr('hDataSrc');
                        if (scene_hDataSrc == i_scene_id) {
                            $(page).remove();
                            var player_data = pepper.xmlToStringIEfix(domPlayerData)
                            pepper.m_msdb.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                            pepper.setCampaignTimelineChannelPlayerRecord(campaign_timeline_chanel_player_id, 'player_data', player_data);
                        }
                    }
                });
            }
        });
    },

    /**
     Remove the resource from any block collection which resides in campaign timeline channels that uses that resource in its collection list
     @method removeResourceFromBlockCollectionsInChannel
     @param {Number} i_resource_id
     @return none
     **/
    removeResourceFromBlockCollectionsInChannel: function (i_resource_id) {
        var self = this;
        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var domPlayerData = $.parseXML(playerData);
            var blockType = $(domPlayerData).find('Player').attr('player');
            if (blockType == BB.CONSTS.BLOCKCODE_COLLECTION) {
                $(domPlayerData).find('Collection').children().each(function (k, page) {
                    var resource_hResource;
                    var type = $(page).attr('type');
                    if (type == 'resource') {
                        resource_hResource = $(page).find('Resource').attr('hResource');
                        if (resource_hResource == i_resource_id) {
                            $(page).remove();
                            var player_data = pepper.xmlToStringIEfix(domPlayerData)
                            pepper.m_msdb.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                            pepper.setCampaignTimelineChannelPlayerRecord(campaign_timeline_chanel_player_id, 'player_data', player_data);
                        }
                    }
                });
            }
        });
    },

    /**
     Remove a timeline from a campaign.
     @method removeTimelineFromCampaign
     @param {Number} i_campaign_timeline_id
     @return none
     **/
    removeTimelineFromCampaign: function (i_campaign_timeline_id) {
        var self = this;
        self.m_msdb.table_campaign_timelines().openForDelete(i_campaign_timeline_id);
        pepper.fire(Pepper['TIMELINE_DELETED'], self, null, i_campaign_timeline_id);
    },

    /**
     Remove a schedule from timeline
     @method removeSchedulerFromTime
     @param {Number} i_campaign_timeline_id
     @return none
     **/
    removeSchedulerFromTime: function (i_campaign_timeline_id) {
        var self = this;
        $(self.m_msdb.table_campaign_timeline_schedules().getAllPrimaryKeys()).each(function (k, campaign_timeline_schedule_id) {
            var recCampaignTimelineSchedule = self.m_msdb.table_campaign_timeline_schedules().getRec(campaign_timeline_schedule_id);
            if (recCampaignTimelineSchedule.campaign_timeline_id == i_campaign_timeline_id) {
                self.m_msdb.table_campaign_timeline_schedules().openForDelete(campaign_timeline_schedule_id);
                pepper.fire(Pepper['TIMELINE_SCHEDULE_DELETED'], self, null, i_campaign_timeline_id);
            }
        });
    },

    /**
     Remove a timeline from a campaign.
     @method removeResource
     @param {Number} i_resource_id
     @return none
     **/
    removeResource: function (i_resource_id) {
        var self = this;
        self.m_msdb.table_resources().openForDelete(i_resource_id);
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
        return self.m_msdb.table_campaigns().getRec(i_campaign_id);
    },

    /**
     Set a campaign table record for the specified i_campaign_id.
     The method uses generic key / value fields so it can set any part of the record.
     @method setCampaignRecord
     @param {Number} i_campaign_id
     @param {Object} i_key
     @param {String} i_value
     @return {Object} foundCampaignRecord
     **/
    setCampaignRecord: function (i_campaign_id, i_key, i_value) {
        var self = this;
        self.m_msdb.table_campaigns().openForEdit(i_campaign_id);
        var recCampaign = self.m_msdb.table_campaigns().getRec(i_campaign_id);
        recCampaign[i_key] = i_value;
    },

    /**
     Returns all of the campaign IDs that all stations belonging to account are associated with
     @method getStationCampaignIDs
     @return {Array} array of campaign IDs
     **/
    getStationCampaignIDs: function () {
        var self = this;
        var campaignIDs = [];
        $(self.m_msdb.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = self.m_msdb.table_branch_stations().getRec(branch_station_id);
            var campaign_board_id = recBranchStation['campaign_board_id'];
            campaignIDs.push(self.getCampaignIdFromCampaignBoardId(campaign_board_id));
        });
        return campaignIDs;
    },

    /**
     Sync to pepper and get station name for station id, callback on server sync return
     @method getStationNameAsync
     @param {Number} i_stationID
     @param {Number} i_callBack
     **/
    getStationNameAsync: function (i_stationID, i_callBack) {
        pepper.sync(function () {
            $(pepper.m_msdb.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
                var recBranchStation = pepper.m_msdb.table_branch_stations().getRec(branch_station_id);
                if (recBranchStation['native_id'] == i_stationID) {
                    i_callBack(recBranchStation['station_name'])
                }
            });
        });
    },

    /**
     Get station name from msdb (no remote server async)
     @method getStationNameSync
     @param {Number} i_stationID
     @return {String} stationName
     **/
    getStationNameSync: function (i_stationID) {
        var self = this;
        var stationName = '';
        $(pepper.m_msdb.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = pepper.m_msdb.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_stationID) {
                var recBranch = self.m_msdb.table_branch_stations().getRec(branch_station_id);
                stationName = recBranch['station_name'];
            }
        });
        return stationName;
    },

    /**
     Get station name from msdb (no remote server async)
     @method getAdPackContNames
     @param {Number} i_ad_local_content_id
     @return {Object}
     **/
    getAdPackContNames: function (i_ad_local_content_id) {
        var self = this;
        var result = {
            contentName: '',
            packageName: ''
        };
        $(pepper.m_msdb.table_ad_local_contents().getAllPrimaryKeys()).each(function (k, ad_local_content_id) {
            var recAdLocalContent = pepper.m_msdb.table_ad_local_contents().getRec(ad_local_content_id);
            if (recAdLocalContent.native_id == i_ad_local_content_id) {
                var recAdLocalPackage = pepper.m_msdb.table_ad_local_packages().getRec(recAdLocalContent.ad_local_package_id);
                result = {
                    contentName: recAdLocalContent.content_name,
                    packageName: recAdLocalPackage.package_name
                };
            }
        });
        return result;
    },

    /**
     save new station name
     @method setStationName
     @param {Number} branch_station_id
     @param {String} i_callBack
     **/
    setStationName: function (i_stationID, i_name) {
        var self = this;
        $(pepper.m_msdb.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = pepper.m_msdb.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_stationID) {
                self.m_msdb.table_branch_stations().openForEdit(branch_station_id);
                var recBranch = self.m_msdb.table_branch_stations().getRec(branch_station_id);
                recBranch['station_name'] = i_name;
            }
        });
    },

    /**
     Returns the campaign id that a station is bound to
     @method getStationCampaignID
     @param {Number} i_native_station_id
     @return {Number} campaign_id
     **/
    getStationCampaignID: function (i_native_station_id) {
        var self = this;
        var campaignID = -1;
        $(self.m_msdb.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = self.m_msdb.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                var campaign_board_id = recBranchStation['campaign_board_id'];
                campaignID = self.getCampaignIdFromCampaignBoardId(campaign_board_id);
            }
        });
        return campaignID;
    },

    /**
     Returns the record for a station id
     @method getStationRecord
     @param {Number} i_native_station_id
     @return {Object} recBranchStation
     **/
    getStationRecord: function (i_native_station_id) {
        var self = this;
        var record;
        $(self.m_msdb.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = self.m_msdb.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                record = recBranchStation;
            }
        });
        return record;
    },

    /**
     Set a station record via object arg into msdb table_branch_stations
     @method getStationRecord
     @param {Number} i_native_station_id
     @param {Object} record
     **/
    setStationRecord: function (i_native_station_id, i_record) {
        var self = this;
        var record;
        $(self.m_msdb.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = self.m_msdb.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                self.m_msdb.table_branch_stations().openForEdit(branch_station_id);
                var recBranchStationEdit = self.m_msdb.table_branch_stations().getRec(branch_station_id);
                recBranchStationEdit = i_record;
            }
        });
    },

    /**
     Set a station so its bound to campaign_id
     @method SetStationCampaignID
     @param {Number} i_native_station_id
     @param {Number} i_campaign_id
     **/
    setStationCampaignID: function (i_native_station_id, i_campaign_id) {
        var self = this;
        $(self.m_msdb.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = self.m_msdb.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                self.m_msdb.table_branch_stations().openForEdit(branch_station_id);
                var recBranchStationEdit = self.m_msdb.table_branch_stations().getRec(branch_station_id);
                var campaign_board_id = self.getCampaignBoardIdFromCampaignId(i_campaign_id);
                recBranchStationEdit.campaign_board_id = campaign_board_id;
            }
        });
    },


    /**
     Set a station to server mode enable / disable
     @method setStationServerMode
     @param {Number} i_native_station_id
     @param {Boolean} i_mode
     **/
    setStationServerMode: function (i_native_station_id, i_enabled, i_lan_server_ip, i_port) {
        var self = this;
        $(self.m_msdb.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = self.m_msdb.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                self.m_msdb.table_branch_stations().openForEdit(branch_station_id);
                var recBranchStationEdit = self.m_msdb.table_branch_stations().getRec(branch_station_id);
                recBranchStationEdit.lan_server_enabled = i_enabled;
                recBranchStationEdit.lan_server_port = i_port;
                recBranchStationEdit.lan_server_ip = i_lan_server_ip;
            }
        });
    },

    /**
     Remove station, delete it from internal msdb and push to server on save
     @method removeStation
     @param {Number} i_station
     **/
    removeStation: function (i_native_station_id) {
        var self = this;
        $(self.m_msdb.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = self.m_msdb.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                self.m_msdb.table_branch_stations().openForDelete(branch_station_id);
                self.m_msdb.table_station_ads().openForDelete(branch_station_id);
            }
        });
    },

    /**
     Upload new resources onto the remote server and return matching ids.
     The element id is of an HTML id of a multi-part upload element.
     @method uploadResources
     @param {String} i_elementID
     @return {Array} list of resources created from newly attached files or empty array if not valid resource loaded
     **/
    uploadResources: function (i_elementID) {
        var self = this;
        var i_uploadFileElement = document.getElementById(i_elementID);
        var count = i_uploadFileElement.files.length;
        for (var iFile = 0; iFile < count; iFile++) {
            var fileName = i_uploadFileElement.files[iFile];
            var fileExtension = fileName.name.split('.')[1];
            var block = BB.PepperHelper.getBlockCodeFromFileExt(fileExtension);
            if (block == -1)
                return [];
        }
        var resourceList = self.m_loaderManager.createResources(document.getElementById(i_elementID));
        BB.comBroker.fire(BB.EVENTS.ADDED_RESOURCE);
        return resourceList;
    },

    /**
     Set a timeline's total duration
     @method setTimelineTotalDuration
     @param {Number} i_campaign_timeline_id
     @param {Number} i_totalDuration
     **/
    setTimelineTotalDuration: function (i_campaign_timeline_id, i_totalDuration) {
        var self = this;
        self.m_msdb.table_campaign_timelines().openForEdit(i_campaign_timeline_id);
        var recCampaignTimeline = self.m_msdb.table_campaign_timelines().getRec(i_campaign_timeline_id);
        recCampaignTimeline['timeline_duration'] = i_totalDuration;
    },

    /**
     Get a timeline's duration which is set as the total sum of all blocks within the longest running channel
     @method getTimelineTotalDuration
     @param {Number} i_campaign_timeline_id
     @return {Number} length in seconds
     **/
    getTimelineTotalDuration: function (i_campaign_timeline_id) {
        var self = this;
        var recCampaignTimeline = self.m_msdb.table_campaign_timelines().getRec(i_campaign_timeline_id);
        if (!recCampaignTimeline)
            return 0;
        return recCampaignTimeline['timeline_duration'];
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
            $(pepper.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
                if (block_id == campaign_timeline_chanel_player_id) {
                    var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                    var playerDuration = recCampaignTimelineChannelPlayer['player_duration']
                    pepper.m_msdb.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                    // log('player ' + block_id + ' offset ' + totalChannelLength + ' playerDuration ' + playerDuration);
                    totalChannelLength = totalChannelLength + parseFloat(playerDuration);
                }
            });
        }
        return totalChannelLength;
    },

    /**
     Update a timeline's duration which is set as the total sum of all blocks within the longest running channel
     @method calcTimelineTotalDuration
     @param {Number} i_campaign_timeline_id
     @return none
     **/
    calcTimelineTotalDuration: function (i_campaign_timeline_id) {
        var self = this;
        var longestChannelDuration = 0;
        // Get all timelines
        $(self.m_msdb.table_campaign_timelines().getAllPrimaryKeys()).each(function (k, campaign_timeline_id) {
            if (campaign_timeline_id == i_campaign_timeline_id) {
                // get all channels that belong to timeline
                $(self.m_msdb.table_campaign_timeline_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_id) {
                    var recCampaignTimelineChannel = self.m_msdb.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);
                    if (campaign_timeline_id == recCampaignTimelineChannel['campaign_timeline_id']) {

                        var timelineDuration = 0;
                        // get all players / resources that belong timeline
                        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
                            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                            if (campaign_timeline_chanel_id == recCampaignTimelineChannelPlayer['campaign_timeline_chanel_id']) {
                                // log(campaign_timeline_chanel_player_id + ' ' + recCampaignTimelineChannelPlayer['player_duration']);
                                timelineDuration += parseFloat(recCampaignTimelineChannelPlayer['player_duration']);
                                if (timelineDuration > longestChannelDuration)
                                    longestChannelDuration = timelineDuration;
                            }
                        });
                    }
                });
            }
        });
        pepper.setCampaignTimelineRecord(i_campaign_timeline_id, 'timeline_duration', longestChannelDuration);
        pepper.fire(Pepper['TIMELINE_LENGTH_CHANGED'], self, null, longestChannelDuration);
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

        var totalSecInMin = 60;
        var totalSecInHour = totalSecInMin * 60;
        var totalSeconds = parseInt(i_seconds) + (parseInt(i_minutes) * totalSecInMin) + (parseInt(i_hours) * totalSecInHour)

        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            if (campaign_timeline_chanel_player_id == i_campaign_timeline_chanel_player_id) {
                self.m_msdb.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                var recPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                recPlayer.player_duration = totalSeconds;
            }
        });
        var returnData = {
            campaignTimelineChanelPlayerID: i_campaign_timeline_chanel_player_id,
            totalSeconds: totalSeconds
        }
        pepper.fire(Pepper['BLOCK_LENGTH_CHANGED'], self, null, returnData);
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
        $(pepper.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
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
        var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(i_campaign_timeline_chanel_player_id);
        var totalSeconds = recCampaignTimelineChannelPlayer['player_duration'];
        return self.formatSecondsToObject(totalSeconds);
    },

    /**
     Format an object to seconds
     @method formatObjectToSeconds
     @param {Object} i_object with hours minutes and seconds key / values
     @return {Number}
     **/
    formatObjectToSeconds: function (i_object) {
        var seconds = i_object.seconds;
        var minutes = i_object.minutes;
        var hours = i_object.hours;
        hours = hours * 3600;
        minutes = minutes * 60;
        return seconds + minutes + hours;
    },

    /**
     Format a seconds value into an object broken into hours / minutes / seconds
     @method formatSecondsToObject
     @param {Number} i_totalSeconds
     @return {Object}
     **/
    formatSecondsToObject: function (i_totalSeconds) {
        var seconds = 0;
        var minutes = 0;
        var hours = 0;
        var totalInSeconds = i_totalSeconds;
        if (i_totalSeconds >= 3600) {
            hours = Math.floor(i_totalSeconds / 3600);
            i_totalSeconds = i_totalSeconds - (hours * 3600);
        }
        if (i_totalSeconds >= 60) {
            minutes = Math.floor(i_totalSeconds / 60);
            seconds = i_totalSeconds - (minutes * 60);
        }
        if (hours == 0 && minutes == 0)
            seconds = i_totalSeconds;
        var playbackLength = {
            hours: parseInt(hours),
            minutes: parseInt(minutes),
            seconds: parseInt(seconds),
            totalInSeconds: parseInt(totalInSeconds)
        };
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
        return self.m_msdb.table_campaign_timeline_chanel_players().getRec(i_player_id);
    },

    /**
     Set a player_id record in msdb on key with value
     The method uses generic key / value fields so it can set any part of the record.
     @method setCampaignTimelineChannelPlayerRecord
     @param {Number} i_player_id
     @param {Object} i_key
     @param {Object} i_value
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
        return self.m_msdb.table_campaign_timeline_chanels().getRec(i_channel_id);
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
        return self.m_msdb.table_campaign_timelines().getRec(i_campaign_timeline_id);
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
        var viewOrderIndexes = {};
        $(pepper.m_msdb.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {

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

                // make sure that every view_order we assign is unique and sequential
                var viewOrder = recBoardTemplateViewer['viewer_order'];
                if (!_.isUndefined(viewOrderIndexes[viewOrder])) {
                    for (var i = 0; i < 100; i++) {
                        if (_.isUndefined(viewOrderIndexes[i])) {
                            viewOrder = i;
                            break;
                        }
                    }
                }
                viewOrderIndexes[viewOrder] = true;
                screenProps['sd' + counter]['view_order'] = viewOrder;
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
     @param {Object} i_value the value to set
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

            // if true, we found the viewer selected under table campaign_timeline_viewer_chanels
            if (recCampaignTimelineViewerChanels['board_template_viewer_id'] == i_campaign_timeline_board_viewer_id) {

                $(self.m_msdb.table_campaign_timeline_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_id) {
                    var recCampaignTimelineChannel = self.m_msdb.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);

                    // if true, we found the channel the viewer was assined to as long as it is part of the current selected timeline
                    if (recCampaignTimelineViewerChanels['campaign_timeline_chanel_id'] == campaign_timeline_chanel_id && recCampaignTimelineChannel['campaign_timeline_id'] == i_campaign_timeline_id) {
                        // log('selected: timeline_id ' + i_campaign_timeline_id + ' view_id ' + i_campaign_timeline_board_viewer_id + ' on channel_id ' + recCampaignTimelineViewerChanels['campaign_timeline_chanel_id']);
                        recCampaignTimelineViewerChanelsFound = recCampaignTimelineViewerChanels;
                    }
                });
            }
        });

        return recCampaignTimelineViewerChanelsFound;
    },

    /**
     Get the assigned viewer id to the specified channel
     @method getAssignedViewerIdFromChannelId
     @param {Number} i_campaign_timeline_channel_id
     @return {Number} foundViewerID
     **/
    getAssignedViewerIdFromChannelId: function (i_campaign_timeline_channel_id) {
        var self = this;
        var foundViewerID;
        $(self.m_msdb.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {
            var recCampaignTimelineViewerChanels = self.m_msdb.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineViewerChanels['campaign_timeline_chanel_id'] == i_campaign_timeline_channel_id) {
                foundViewerID = recCampaignTimelineViewerChanels['board_template_viewer_id']
            }
        });
        return foundViewerID;
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
     The jQuery.Event constructor is exposed and can be used when calling trigger. The new operator is optional.
     @method event
     @param {Event} i_event
     @param {Object} i_context
     @param {Object} i_caller
     @param {Object} i_data
     @return none.

     event: function (i_event, i_context, i_caller, i_data) {
        return $.Event(i_event, {context: i_context, caller: i_caller, edata: i_data});
    },
     **/

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
                        // log(recCampaignTimelineBoardTemplate['campaign_timeline_id']);
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