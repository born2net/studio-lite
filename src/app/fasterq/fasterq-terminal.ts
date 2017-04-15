import {AfterViewInit, Component, ElementRef, NgZone} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {ActivatedRoute} from "@angular/router";
import {FasterqLineModel} from "../../models/fasterq-line-model";
import {EFFECT_LOAD_FASTERQ_LINE, EFFECT_LOADED_FASTERQ_LINE, EFFECT_QUEUE_CALL_SAVE} from "../../store/effects/appdb.effects";
import * as _ from 'lodash';
import {timeout} from "../../decorators/timeout-decorator";
import {Http, RequestMethod, RequestOptionsArgs, Response} from "@angular/http";
import {Lib} from "../../Lib";
import {ToastsManager} from "ng2-toastr";
import {LocalStorage} from "../../services/LocalStorage";

@Component({
    selector: 'fasterq-terminal',
    styles: [`
        .largeFont2em {
            font-size: 2em;
        }

        .lPad {
            padding-left: 20px;
        }

        .carousel-inner {
            height: 400px;
        }
    `],
    template: `
        <small class="debug">{{me}}</small>

        <div *ngIf="m_appMode=='REMOTE_STATUS'" id="fqRemoteStatus" style="font-size: 2em; text-align: center">
            <h1>now serving {{m_currentlyServing}}</h1>

            <h3>you are {{m_fasterqLineModel.serviceId}} in line</h3>

            <h3>line name: {{m_fasterqLineModel?.lineName}}</h3>

            <h3>your verification number is {{m_fasterqLineModel?.verification}}</h3>

            <button (click)="_releaseSpot()" id="fqReleaseSpot" style="float: right; width: 50%" class="tn btn-lg btn-primary">release number</button>
            <button (click)="_getNewSpot()" id="fqGetNewNumber" style="float: right; width: 50%;" class="tn btn-lg btn-primary">renew number</button>
        </div>

        <div *ngIf="m_appMode=='CUSTOMER_TERMINAL'" id="fasterqCustomerTerminal">
            <div style="width: 100%">
                <h1 id="fqTakeNumberLineName" style="font-size: 10em; text-align: center" class="centerElement">{{m_fasterqLineModel?.lineName}}</h1>
            </div>

            <hr/>
            <h1 id="fasterQLineName"></h1>
            <hr/>

            <div id="printDiag" style="display: none">
                <h1>You number is 123</h1>

                <h3 id="printData">Oct 1 1973</h3>
            </div>

            <div id="terminalCarousel" class="carousel slide" data-interval="false" data-ride="carousel">
                <div class="carousel-inner">

                    <div class="item active">
                        <div style="width: 100%; text-align: center">
                            <i style="font-size: 3em; padding-right: 40px" class="carouselLargeHeader fa fa-print"></i>
                            <span class="carouselLargeHeader" style="font-size: 3em">Print your queue number</span>
                            <br/>
                            <br/>
                            <br/>
                            <a (click)="_onPrint($event)" id="fqPrintNumber" style="padding-left: 40px; padding-right: 40px; padding-top: 20px; padding-bottom: 20px" class="btn btn-large btn-danger" type="button" href="#">
                                <span class="largeFont2em" data-localize="printIt">PRINT IT</span>
                            </a>
                            <h1 id="fqDisplayPrintNumber">{{m_displayServiceId}}</h1>
                            <br/>
                            <br/>
                            <br/>
                        </div>
                    </div>

                    <div class="item">
                        <div style="width: 100%; text-align: center">
                            <i style="font-size: 3em; padding-right: 40px" class="carouselLargeHeader fa fa-qrcode"></i>
                            <span class="carouselLargeHeader" data-localize="scanMobile" style="font-size: 3em">Scan with your mobile device</span>
                            <br/>

                            <div class="centerElement" id="qrcode" style="text-align: center; width: 200px; height: 200px; margin-top:15px;"></div>
                            <br/>
                            <br/>
                            <br/>
                        </div>
                    </div>

                    <div class="item">
                        <div style="width: 100%; text-align: center">
                            <i style="font-size: 3em; padding-right: 40px" class="carouselLargeHeader fa fa-paper-plane"></i>
                            <span class="carouselLargeHeader" data-localize="notifyEmail" style="font-size: 3em">Notify via email</span>
                            <br/>
                            <br/>

                            <div style="text-align: center; width: 500px" class="centerElement">
                                <input [(ngModel)]="emailAddress" id="fqEnterEmail" type="text" style="font-size: 3em; height: 2em; text-align: center" class="form-control" data-localize="enterEmail" placeholder="enter email">
                            </div>
                            <br/>
                            <a (click)="_onSend($event)" id="fqSenditButton" style="padding-left: 40px; padding-right: 40px; padding-top: 20px; padding-bottom: 20px" class="btn btn-large btn-danger" type="button" href="#">
                                <span class="largeFont2em">SEND IT</span>
                            </a>
                            <br/>

                            <h1 id="fqDisplayEmailSent"></h1>
                            <br/>
                        </div>
                    </div>

                    <div class="item">
                        <div style="width: 100%; text-align: center">
                            <i style="font-size: 3em; padding-right: 40px" class="carouselLargeHeader fa fa-phone"></i>
                            <span class="carouselLargeHeader" style="font-size: 3em">Notify via Text Message</span>
                            <br/>
                            <br/>

                            <div style="text-align: center; width: 500px" class="centerElement">
                                <input [(ngModel)]="sms" id="fqEnterSMS" type="text" style="font-size: 3em; height: 2em; text-align: center" class="form-control" data-localize="enterSMS" placeholder="enter your phone number">
                            </div>
                            <br/>
                            <br/>
                            <a (click)="_onCall($event)" id="fqCallIt" style="padding-left: 40px; padding-right: 40px; padding-top: 20px; padding-bottom: 20px" class="btn btn-large btn-danger" type="button" href="#">
                                <span class="largeFont2em" data-localize="printIt">CALL IT</span>

                            </a>

                            <h1 id="fqDisplaySMSSent"></h1>
                            <br/>
                        </div>
                    </div>
                </div>
                <ul id="carouselItems" class="nav nav-pills nav-justified" style="border: 1px solid #9c9c9c">
                    <li data-target="#terminalCarousel" data-slide-to="0">
                        <a href="#"><i class="largeFont2em fa fa-print"></i><span class="lPad largeFont2em fasterQCarouselButtons">PRINT</span>
                        </a>
                    </li>
                    <li data-target="#terminalCarousel" data-slide-to="1">
                        <a href="#"><i class="largeFont2em fa fa-qrcode"></i><span class="lPad largeFont2em fasterQCarouselButtons">SCAN</span>
                        </a>
                    </li>
                    <li data-target="#terminalCarousel" data-slide-to="2">
                        <a href="#"><i class="largeFont2em fa fa-paper-plane"></i><span class="lPad largeFont2em fasterQCarouselButtons">E-MAIL</span>
                        </a>
                    </li>
                    <li data-target="#terminalCarousel" data-slide-to="3">
                        <a href="#"><i class="largeFont2em fa fa-phone"></i><span class="lPad largeFont2em fasterQCarouselButtons">Text Message</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `
})
export class FasterqTerminal extends Compbaser implements AfterViewInit {

    m_fasterqLineModel: FasterqLineModel;
    m_displayServiceId = '';
    appBaseUrlServices;
    emailAddress = ''
    m_appMode = '';
    m_baseUrl
    sms = ''
    m_remoteStatusServiceId;
    m_remoteStatusVerification;
    m_statusHandler;
    m_currentlyServing = 0;

    constructor(private toastr: ToastsManager, private http: Http, private yp: YellowPepperService, private router: ActivatedRoute, private el: ElementRef, private zone: NgZone, private simplestorage: LocalStorage) {
        super();
        // this.preventRedirect(true);
        this.cancelOnDestroy(
            this.yp.ngrxStore.select(store => store.appDb.fasterq.terminal)
                .filter(v => !_.isNull(v))
                .subscribe((i_fasterqLineModel: FasterqLineModel) => {
                    this.m_fasterqLineModel = i_fasterqLineModel;
                    switch (this.m_appMode) {
                        case 'CUSTOMER_TERMINAL': {
                            this._createQRcode();
                            break;
                        }
                        case 'REMOTE_STATUS': {
                            this.m_baseUrl = `${this.appBaseUrlServices}?mode=remoteStatus&param=`;
                            this._getServerDateTime(this._initServices);
                            // this._releaseSpot();
                            // this._getNewSpot();
                            break;
                        }
                        default: {
                            console.log('fasterq problem, did not get line id');
                        }
                    }

                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            this.yp.ngrxStore.select(store => store.appDb.appBaseUrlServices)
                .subscribe((i_appBaseUrlServices) => {
                    this.appBaseUrlServices = i_appBaseUrlServices;
                })
        )
    }

    ngOnInit() {
        this.cancelOnDestroy(
            this.router.params
                .take(1)
                .subscribe(i_params => {
                    if (i_params.id.indexOf('data') > -1) {
                        /** Terminal mode, coming from Studio link **/
                        var params = i_params['id'].split('=')[1] + '==';
                        var rc4v2 = new RC4V2();
                        var rcData: any = rc4v2.decrypt(params.replace(/=/ig, ''), '8547963624824263');
                        var data = JSON.parse(rcData);
                        this.m_appMode = 'CUSTOMER_TERMINAL';
                        this.yp.ngrxStore.dispatch({type: EFFECT_LOAD_FASTERQ_LINE, payload: {lineId: data.line_id, businessId: data.business_id}})
                    } else {
                        /** Remote status mode, coming server short url **/
                        var params: string = i_params['id'].split('=')[2].replace(/%3D/ig, '=');
                        var rcData = $.base64.decode(params);
                        var data = JSON.parse(rcData);
                        this.m_appMode = 'REMOTE_STATUS';
                        this.yp.ngrxStore.dispatch({type: EFFECT_LOADED_FASTERQ_LINE, payload: new FasterqLineModel(data)})

                    }
                }, (e) => console.error(e))
        )
    }

    ngAfterViewInit() {
    }

    /**
     Get current server date / time
     @method _getServerDateTime server:getDateTime
     @param {Function} i_cb
     **/
    _getServerDateTime(i_cb) {
        var self = this;
        $.ajax({
            url: `${self.appBaseUrlServices}/GetDateTime`,
            success: function (dateTime) {
                $.proxy(i_cb, self)(dateTime);
            },
            error: function (e) {
                console.log('error ajax ' + e);
            },
            dataType: 'json'
        });
    }

    /**
     Check if service id exists in local storage, if not get one from server
     @method _initServices
     **/
    _initServices(i_dateTime) {
        // STORAGE FIRST

        //debug; //this.simplestorage.removeItem('data');
        var storage = this.simplestorage.getItem('data');
        if (!_.isUndefined(storage)) {
            var storedDate = storage.date;
            if (storedDate != i_dateTime.date) {
                this.simplestorage.removeItem('data');
            } else {
                this.m_remoteStatusServiceId = storage.service_id;
                this.m_remoteStatusVerification = storage.verification;
                this._pollNowServicing();
                return;
            }
        }

        // EMAIL OR SMS
        var call_type = this.m_fasterqLineModel.callType;

        if (call_type == 'SMS' || call_type == 'EMAIL') {
            if (i_dateTime.date != this.m_fasterqLineModel.date) {
                bootbox.alert('your number expired on ' + this.m_fasterqLineModel.date + ', so we generated a new number for you...');
                this._getServiceID();
                return;
            }
            this._createStorage(this.m_fasterqLineModel.serviceId, this.m_fasterqLineModel.verification, this.m_fasterqLineModel.date);
            this._pollNowServicing();
        }

        // QR
        if (call_type == 'QR') {
            this._getServiceID();
        }
    }

    _createStorage(i_service_id, i_verification, i_date) {
        this.simplestorage.setItem('data', {
            service_id: i_service_id,
            date: i_date,
            verification: i_verification
        });
    }

    /**
     Forget spot in line
     @method _getNewSpot
     **/
    _getNewSpot() {
        bootbox.prompt('are you sure you want to get a new number (type yes or no)?', (i_answer) => {
            if (i_answer) {
                if (i_answer.toLowerCase() == 'yes') {
                    this.simplestorage.removeItem('data');
                    window.clearInterval(this.m_statusHandler);
                    var url = this._buildURL();
                    jQuery(location).attr('href', url);
                }
            }
        })
    }

    /**
     Forget spot in line
     @method _releaseSpot
     **/
    _releaseSpot() {
        bootbox.prompt('are you sure you want to let go of your spot (type yes or no)?', (i_answer) => {
            if (i_answer) {
                if (i_answer.toLowerCase() == 'yes') {
                    jQuery('#appEntry').html('<h1 style="text-align: center; padding: 100px">have a nice day</h1>');
                    this.simplestorage.removeItem('data');
                    window.clearInterval(this.m_statusHandler);
                }
            }
        })
    }

    /**
     Create queue in table as well as matching data in analytics
     @method _getServiceID server:setQueue
     **/
    _getServiceID() {
        var options: RequestOptionsArgs = this.createOptionArgs('/Queue', RequestMethod.Post, {
            line_id: this.m_fasterqLineModel.lineId,
            business_id: this.m_fasterqLineModel.businessId,
            email: this.m_fasterqLineModel.email,
            call_type: this.m_fasterqLineModel.callType,
        })
        return this.http.get(options.url, options)
            .catch((err) => {
                // return Observable.throw(err);
                return err;
            })
            .finally(() => {
            }).take(1)
            .subscribe((i_response: Response) => {
                var jData = i_response.json()
                var fasterqLineModel: FasterqLineModel = new FasterqLineModel(jData)
                this._createStorage(fasterqLineModel.serviceId, fasterqLineModel.verification, fasterqLineModel.date);
                this.yp.ngrxStore.dispatch({type: EFFECT_LOADED_FASTERQ_LINE, payload: fasterqLineModel})
                // this._populateCustomerInfo();
                this._pollNowServicing();
            }, (e) => console.error(e));
    }

    /**
     Get the last called service_id for line
     @method _pollNowServicing server:LastCalledQueue
     **/
    _pollNowServicing() {
        var self = this;
        var lastCalledQueue = () => {
            $.ajax({
                url: `${this.appBaseUrlServices}/LastCalledQueue`,
                data: {
                    business_id: this.m_fasterqLineModel.businessId,
                    line_id: this.m_fasterqLineModel.lineId
                },
                success: function (i_model) {
                    self.m_currentlyServing = i_model.service_id;

                },
                error: function (e) {
                    console.log('error ajax ' + e);
                },
                dataType: 'json'
            });
        };
        this.m_statusHandler = setInterval(function () {
            lastCalledQueue();
        }, 5000);
        lastCalledQueue();
    }

    _isValidEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    /**
     Listen to custom selection on queue id creator via QR scan
     @method _createQRcode
     **/
    @timeout(1000)
    _createQRcode() {
        jQuery('.carousel').carousel()
        var q: any = jQuery("#qrcode", this.el.nativeElement);
        q = q[0];
        var qrcode = new QRCode(q, {width: 200, height: 200});
        var url = this._buildURL();
        qrcode.makeCode(url);
    }

    _onCall($event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        const baseUrl = `${this.appBaseUrlServices}/studioweb/index.html?mode=remoteStatus&param=`;
        if (this.sms.length < 6)
            return this.toastr.error('The phone number entered is invalid');
        $.ajax({
            url: `${this.appBaseUrlServices}/SendQueueSMSEmail`,
            data: {
                business_id: this.m_fasterqLineModel.businessId,
                line_id: this.m_fasterqLineModel.lineId,
                line_name: this.m_fasterqLineModel.lineName,
                sms: this.sms,
                call_type: 'SMS',
                url: baseUrl
            },
            success: (e) => {
                this.toastr.info('Thank you')
                setTimeout(() => {
                    this.sms = ''
                }, 4000)
            },
            error: (e) => {
                console.log('error ajax ' + e);
            },
            dataType: 'json'
        });
    }

    _onSend($event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        const baseUrl = `${this.appBaseUrlServices}/studioweb/index.html?mode=remoteStatus&param=`;
        if (!this._isValidEmail(this.emailAddress))
            return this.toastr.error('The email address entered is invalid');
        $.ajax({
            url: `${this.appBaseUrlServices}/SendQueueSMSEmail`,
            data: {
                business_id: this.m_fasterqLineModel.businessId,
                line_id: this.m_fasterqLineModel.lineId,
                line_name: this.m_fasterqLineModel.lineName,
                email: this.emailAddress,
                call_type: 'EMAIL',
                url: baseUrl
            },
            success: (e) => {
                this.toastr.info('Thank you')
                setTimeout(() => {
                    this.emailAddress = ''
                }, 4000)
            },
            error: (e) => {
                console.log('error ajax ' + e);
            },
            dataType: 'json'
        });

    }

    _onPrint(event) {
        event.stopImmediatePropagation();
        event.preventDefault();

        // this.printToCart('printSectionId');
        // urlRoot: BB.CONSTS.ROOT_URL + '/',
        //     idAttribute: 'queue_id'
        // var url = `${this.appBaseUrlServices}/`;

        var options: RequestOptionsArgs = this.createOptionArgs('/Queue', RequestMethod.Post, {line_id: this.m_fasterqLineModel.lineId, business_id: this.m_fasterqLineModel.businessId})
        return this.http.get(options.url, options)
            .catch((err) => {
                // return Observable.throw(err);
                return err;
            })
            .finally(() => {
            }).take(1)
            .subscribe((i_response: Response) => {
                var jData = i_response.json()
                this.m_displayServiceId = jData.service_id;
                this._printNumber(jData.service_id, jData.name);
            }, (e) => console.error(e));
    }


    /**
     Print current customer service id
     @method _printNumber
     @param {Number} i_service_id
     **/
    _printNumber(i_service_id, name) {
        this.zone.runOutsideAngular(() => {
            var $printDiag = jQuery('#printDiag');
            //var div = document.getElementById("printerDiv");
            var p = function () {
                jQuery('body').append('<h2></h2>')
            }
            var arg = Lib.Base64Encode(i_service_id + ':_:' + name)
            $printDiag.html('<iframe src="print.html?serviceId=' + arg + '" onload="this.contentWindow.print();"></iframe>');
        })

        // $printDiag.find('h1').text('your number is ' + i_service_id);
        // $printDiag.find('h3').text('created on ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
        // var divContents = jQuery(Elements.PRINT_DIAG).html();
        // var printWindow = window.open('', '', 'height=250,width=450');
        // printWindow.document.write('<html><head><title>' + self.model.get('name') + '</title>');
        // printWindow.document.write('</head><body><center>');
        // printWindow.document.write(divContents);
        // printWindow.document.write('</center></body></html>');
        // printWindow.document.close();
        // printWindow.print();
    }

    private createOptionArgs(i_urlEndPoint, i_method, i_body): RequestOptionsArgs {
        var url = `${this.appBaseUrlServices}${i_urlEndPoint}`;
        return {
            url: url,
            method: i_method,
            body: i_body
        };
    }

    /**
     Create URL string to load customer terminal UI for FasterQ queue generation
     @method _buildURL
     @return {String} URL
     **/
    _buildURL() {
        var data = {
            line_id: this.m_fasterqLineModel.lineId,
            business_id: this.m_fasterqLineModel.businessId,
            call_type: 'QR'
        };
        data = $.base64.encode(JSON.stringify(data));
        return `${this.appBaseUrlServices}/studioweb/index.html?mode=remoteStatus&param=${data}`;
    }

    
}
