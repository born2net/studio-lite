import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {Compbaser, NgmslibService} from "ng-mslib";
import {urlRegExp} from "../../Lib";
import * as _ from "lodash";

@Component({
    selector: 'block-prop-mrss',
    host: {'(input-blur)': 'saveToStore($event)'},
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div class="row">
                <ul class="list-group">
                    <li class="list-group-item">
                        <span i18n>maintain aspect ratio</span>
                        <div class="material-switch pull-right">
                            <input #imageRatio (change)="_toggleAspectRatio(imageRatio.checked)"
                                   [formControl]="m_contGroup.controls['maintain']"
                                   class="default-prop-width"
                                   id="imageRatio"
                                   name="imageRatio" type="checkbox"/>
                            <label for="imageRatio" class="label-primary"></label>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <select #sceneSelection class="default-prop-width" (change)="_onRssSelected($event)" formControlName="rssSelection">
                            <option [value]="rss.url" *ngFor="let rss of m_mrssLinksData">{{rss.label}}</option>
                        </select>
                    </li>
                    <li *ngIf="m_showCustomUrl" class="list-group-item">
                        <input class="default-prop-width" type="text" formControlName="url"/>
                    </li>
                </ul>
            </div>
        </form>
    `
})
export class BlockPropMrss extends Compbaser implements AfterViewInit {
    m_formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;
    m_showCustomUrl = false;
    m_mrssLinksData = [];
    m_mrssLinks = '<TextRss>' +
        '<Rss label="CNN Showbiz" url="http://rss.cnn.com/services/podcasting/ShowbizTonight/rss.xml"/>' +
        '<Rss label="CNN News " url="http://rss.cnn.com/services/podcasting/cnnnewsroom/rss.xml"/>' +
        '<Rss label="CNN missed it " url="http://rss.cnn.com/services/podcasting/incaseyoumissed/rss.xml"/>' +
        '<Rss label="CNN Latino " url="http://rss.cnn.com/services/podcasting/inamerica/rss.xmll"/>' +
        '<Rss label="CNN Amanpour" url="http://rss.cnn.com/services/podcasting/amanpour_video/rss"/>' +
        '<Rss label="CNN Student" url="http://rss.cnn.com/services/podcasting/studentnews/rss.xml"/>' +
        '<Rss label="CNN King" url="http://rss.cnn.com/services/podcasting/lkl/rss.xml"/>' +
        '<Rss label="CNN Meade" url="http://rss.cnn.com/services/podcasting/robinmeade/rss.xml"/>' +
        '<Rss label="CNN Absurd" url="http://rss.cnn.com/services/podcasting/absurd/rss.xml"/>' +
        '<Rss label="CNN Health" url="http://rss.cnn.com/services/podcasting/gupta/rss.xml"/>' +
        '<Rss label="CNN Fareed" url="http://rss.cnn.com/services/podcasting/fareedzakaria/rss.xml"/>' +
        '<Rss label="CNN Screening" url="http://rss.cnn.com/services/podcasting/thescreeningroom/rss.xml"/>' +
        '<Rss label="CNN Politics" url="http://rss.cnn.com/services/podcasting/bestpolitics/rss.xml"/>' +
        '<Rss label="ABC World News" url="http://feeds.abcnews.com/abcnews/worldnewsvideopodcast"/>' +
        '<Rss label="ABC 20/20" url="http://feeds.abcnews.com/abcnews/2020intouchvideopodcast"/>' +
        '<Rss label="ABC Medical Minute" url="http://feeds.abcnews.com/abcnews/medicalminutevideoppodcast"/>' +
        '<Rss label="ABC Popcorn" url="http://feeds.abcnews.com/abcnews/popcornvideopodcast"/>' +
        '<Rss label="ABC Buzz" url="http://feeds.abcnews.com/abcnews/whatsthebuzzvideopodcast"/>' +
        '<Rss label="ABC Nightline" url="http://feeds.abcnews.com/abcnews/nightlinevideopodcast"/>' +
        '<Rss label="ABC Health" url="http://feeds.abcnews.com/abcnews/gmahealthvideopodcast"/>' +
        '<Rss label="ABC Money Minute" url="http://feeds.abcnews.com/abcnews/moneyminutevideopodcast"/>' +
        '<Rss label="ABC Extreme" url="http://feeds.abcnews.com/abcnews/extremevideopodcast"/>' +
        '<Rss label="ABC Top Line" url="http://feeds.abcnews.com/abcnews/toplinevideopodcast"/>' +
        '<Rss label="ABC Curve" url="http://feeds.abcnews.com/abcnews/aheadofthecurvevideopodcast"/>' +
        '<Rss label="ABC Interview" url="http://feeds.abcnews.com/abcnews/blausteinreviewsvideopodcast"/>' +
        '<Rss label="NBC Press" url="http://podcast.msnbc.com/audio/podcast/MSNBC-MTP-NETCAST-M4V.xml"/>' +
        '<Rss label="NBC Nightly" url="http://podcast.msnbc.com/audio/podcast/MSNBC-NN-NETCAST-M4V.xml"/>' +
        '<Rss label="NBC Today" url="http://podcast.msnbc.com/audio/podcast/MSNBC-TDY-PODCAST-M4V.xml"/>' +
        '<Rss label="NBC Countdown" url="http://podcast.msnbc.com/audio/podcast/MSNBC-COUNTDOWN-NETCAST-M4V.xml"/>' +
        '<Rss label="NBC meadow" url="http://podcast.msnbc.com/audio/podcast/MSNBC-MADDOW-NETCAST-M4V.xml"/>' +
        '<Rss label="NBC Zeitgeist" url="http://podcast.msnbc.com/audio/podcast/MSNBC-MADDOW-NETCAST-M4V.xml"/>' +
        '<Rss label="NBC Business" url="http://podcast.msnbc.com/audio/podcast/MSNBC-YB-NETCAST-M4V.xml"/>' +
        '<Rss label="Discovery" url="http://www.discovery.com/radio/xml/discovery_video.xml"/>' +
        '<Rss label="NOVA " url="http://www.pbs.org/wgbh/nova/rss/nova-vodcast-pb.xml"/>' +
        '<Rss label="Link Tv" url="http://www.linktv.org/rss/hq/globalpulse.xml"/>' +
        '<Rss label="Geek Brief" url="http://geekbrief.podshow.com/feed.xml"/>' +
        '<Rss label="Dig Nation" url="http://feeds.feedburner.com/diggnationvideo"/>' +
        '<Rss label="Tiki Bar" url="http://feeds.feedburner.com/TikiBarTV"/>' +
        '<Rss label="Fox lips and ears" url="http://video.foxnews.com/v/feed/playlist/86876.xml?template=rss.xml?template=rss"/>' +
        '<Rss label="Fox Hollyowood" url="http://video.foxnews.com/v/feed/playlist/86878.xml?template=rss.xml?template=rss"/>' +
        '<Rss label="Fox showbiz" url="http://video.foxnews.com/v/feed/playlist/86871.xml?template=rss.xml?template=rss"/>' +
        '<Rss label="Fox Us new" url="http://video.foxnews.com/v/feed/playlist/86856.xml?template=rss.xml?template=rss"/>' +
        '<Rss label="Fox lates news" url="http://video.foxnews.com/v/feed/playlist/87249.xml?template=rss.xml?template=rss"/>' +
        '<Rss label="Fox Business" url="http://video.foxnews.com/v/feed/playlist/86927.xml?template=rss"/>' +
        '<Rss label="Fox world news" url="http://video.foxnews.com/v/feed/playlist/86857.xml?template=rss.xml?template=rss"/>' +
        '<Rss label="Fox politics" url="http://video.foxnews.com/v/feed/playlist/86858.xml?template=rss.xml?template=rss"/>' +
        '<Rss label="Fox Health" url="http://video.foxnews.com/v/feed/playlist/86859.xml?template=rss.xml?template=rss"/>' +
        '<Rss label="CBS Face The Nation" url="http://feeds.cbsnews.com/podcast_nation_video_1"/>' +
        '<Rss label="CBS Evening News" url="http://feeds.cbsnews.com/podcast_eveningnews_video_1"/>' +
        '<Rss label="TED TALKS" url="http://feeds.feedburner.com/tedtalks_video"/>' +
        '<Rss label="CNET.COM Always On" url="http://feeds.feedburner.com/AlwaysOnsd"/>' +
        '<Rss label="CNET.COM ApleByte" url="http://feeds2.feedburner.com/cnet/applebyte"/>' +
        '<Rss label="CNET.COM  Cars" url="http://feeds.feedburner.com/CnetOnCarssd"/>' +
        '<Rss label="CNET.COM  Crave " url="http://feeds.feedburner.com/cnet/cravehq"/>' +
        '<Rss label="CNET.COM  UPDATE" url="http://feeds.feedburner.com/CNETUpdateSD"/>' +
        '<Rss label="CNET.COM  News" url="http://feeds.feedburner.com/cnet/news"/>' +
        '<Rss label="CNET.COM  CarTech" url="http://feeds2.feedburner.com/cnet/cartechvideo"/>' +
        '<Rss label="CNET.COM  CrackingOpen" url="http://feeds.feedburner.com/CrackingOpenSD"/>' +
        '<Rss label="CNET.COM  Conversations" url="http://feeds.feedburner.com/cnet/conversations"/>' +
        '<Rss label="CNET.COM  Top5" url="http://feeds2.feedburner.com/cnet/top5"/>' +
        '<Rss label="CNET.COM FirstLook" url="http://feeds.feedburner.com/cnet/firstlook"/>' +
        '<Rss label="CNET.COM  InsideScoop" url="http://feeds.feedburner.com/InsideScoopsd"/>' +
        '<Rss label="CNET.COM 404" url="http://feeds.feedburner.com/cnet/the404video"/>' +
        '<Rss label="CNET.COM HowTo" url="http://feeds2.feedburner.com/cnet/howto"/>' +
        '<Rss label="CNET.COM  PrizeFight" url="http://feeds2.feedburner.com/cnet/prizefight"/>' +
        '<Rss label="CNET.COM  RumorHasIt" url="http://feeds.feedburner.com/RumorHasItsd"/>' +
        '<Rss label="CNET.COM  TapThatApp" url="http://feeds.feedburner.com/cnet/tapthatapp"/>' +
        '<Rss label="LINKTV  EartFocus" url="http://www.linktv.org/rss/general/earth.xml"/>' +
        '<Rss label="LINKTV  Explore" url="http://www.linktv.org/rss/general/explorespecial1.xml"/>' +
        '<Rss label="LINKTV  GlobalPulse" url="http://www.linktv.org/rss/general/globalpulse.xml"/>' +
        '<Rss label="LINKTV  LatinPulse" url="http://www.linktv.org/rss/general/latin_pulse.xml"/>' +
        '<Rss label="LINKTV  MosaicIR" url="http://www.linktv.org/rss/general/MIR.xml"/>' +
        '<Rss label="LINKTV MosaicNews" url="http://www.linktv.org/rss/general/mosaic.xml"/>' +
        '<Rss label="LINKTV  Best" url="http://www.linktv.org/rss/general/best.xml"/>' +
        '<Rss label="NOVA Video" url="http://feeds.pbs.org/pbs/wgbh/nova-video"/>' +
        '<Rss label="Washington Post Video" url="http://www.washingtonpost.com/wp-srv/mmedia/vipod.xml"/>' +
        '<Rss label="CBC  TheNational" url="http://www.cbc.ca/podcasting/includes/thenational-video-podcast.xml"/>' +
        '<Rss label="CBC  AtIssue" url="http://www.cbc.ca/mediafeeds/rss/cbc/atissue-video-podcast.xml"/>' +
        '<Rss label="CBC  Rex Murphy" url="http://www.cbc.ca/mediafeeds/rss/cbc/rexmurphy-video-podcast.xml"/>' +
        '<Rss label="IMORE Show" url="http://feeds.feedburner.com/iphonelivevideo"/>' +
        '<Rss label="IMORE  MobileNations" url="http://feeds.feedburner.com/mobilenationsvideo"/>' +
        '<Rss label="IMORE  AndroidCentral" url="http://feeds.feedburner.com/androidcentralvideo"/>' +
        '<Rss label="IMORE  ZenAndTech" url="http://feeds.feedburner.com/zenandtechvideo"/>' +
        '<Rss label="REUTERS  Financial" url="http://feeds.reuters.com/reuters/video/companyus/rss/mp4/"/>' +
        '<Rss label="REUTERS  BrakingNews" url="http://feeds.reuters.com/reuters/video/breakingviews/rss/mp4/"/>' +
        '<Rss label="REUTERS  Chrystia Freeland" url="http://feeds.reuters.com/reuters/video/chrystiafreeland/rss/mp4/"/>' +
        '<Rss label="REUTERS  Entertainment" url="http://feeds.reuters.com/reuters/video/entertainment/rss/mp4/"/>' +
        '<Rss label="REUTERS  Felix Salmon" url="http://feeds.reuters.com/reuters/video/felixsalmon/rss/mp4/"/>' +
        '<Rss label="REUTERS  Newsmaker" url="http://feeds.reuters.com/reuters/video/newsmakerus/rss/mp4/"/>' +
        '<Rss label="REUTERS  Odly Enough" url="http://feeds.reuters.com/reuters/video/andfinally/rss/m4v/"/>' +
        '<Rss label="REUTERS  PersonalFinance" url="http://feeds.reuters.com/reuters/video/personalfinance/rss/mp4/"/>' +
        '<Rss label="REUTERS  Technology" url="http://feeds.reuters.com/reuters/video/technology/rss/mp4/"/>' +
        '<Rss label="REUTERS  QuickCut" url="http://feeds.reuters.com/reuters/video/quickcut/rss/mp4/"/>' +
        '<Rss label="REUTERS  TopNews" url="http://feeds.reuters.com/reuters/USVideoTopNews"/>' +
        '<Rss label="REUTERS  Politics" url="http://feeds.reuters.com/reuters/USVideoPolitics"/>' +
        '<Rss label="REUTERS  Rough Cuts" url="http://feeds.reuters.com/reuters/USVideoRoughCuts"/>' +
        '<Rss label="REUTERS  World News" url="http://feeds.reuters.com/reuters/USVideoWorldNews"/>' +
        '<Rss label="REUTERS  Small Business" url="http://feeds.reuters.com/reuters/USVideoSmallBusiness"/>' +
        '<Rss label="REUTERS  GigaOM" url="http://feeds.reuters.com/reuters/USVideoGigaom"/>' +
        '<Rss label="REUTERS  Envinroment" url="http://feeds.reuters.com/reuters/USVideoEnvironment"/>' +
        '<Rss label="REUTERS  Latest Video" url="http://feeds.reuters.com/reuters/USVideoLatest"/>' +
        '<Rss label="AL JAZEERA  World" url="http://feeds.aljazeera.net/podcasts/aljazeeraworld"/>' +
        '<Rss label="AL JAZEERA  Correspondent" url="http://feeds.aljazeera.net/podcasts/aljazeeracorrespondent"/>' +
        '<Rss label="AL JAZEERA  Indian Hospital" url="http://feeds.aljazeera.net/podcasts/indianhospital"/>' +
        '<Rss label="AL JAZEERA  The Cure" url="http://feeds.aljazeera.net/podcasts/thecure"/>' +
        '<Rss label="AL JAZEERA LivingTheLanguage" url="http://feeds.aljazeera.net/podcasts/livingthelanguage"/>' +
        '<Rss label="AL JAZEERA  Slavery" url="http://feeds.aljazeera.net/podcasts/slavery"/>' +
        '<Rss label="AL JAZEERA Africa Investigates" url="http://feeds.aljazeera.net/podcasts/africainvestigates"/>' +
        '<Rss label="AL JAZEERA  Artscape" url="http://feeds.aljazeera.net/podcasts/artscape"/>' +
        '<Rss label="AL JAZEERA  Earthrise" url="http://feeds.aljazeera.net/podcasts/earthrise"/>' +
        '<Rss label="AL JAZEERA  Faultlines" url="http://feeds.aljazeera.net/podcasts/faultlines"/>' +
        '<Rss label="AL JAZEERA  Documentaries" url="http://feeds.aljazeera.net/podcasts/featureddocumentaries"/>' +
        '<Rss label="AL JAZEERA  PeopleAndPower" url="http://feeds.aljazeera.net/podcasts/peopleandpower"/>' +
        '<Rss label="AL JAZEERA  TheStream" url="http://feeds.aljazeera.net/podcasts/thestream"/>' +
        '<Rss label="AL JAZEERA  SurprisingEurope" url="http://feeds.aljazeera.net/podcasts/surprisingeurope"/>' +
        '<Rss label="AL JAZEERA  Activate" url="http://feeds.aljazeera.net/podcasts/activate"/>' +
        '<Rss label="NASA  Vodcast" url="http://www.nasa.gov/rss/dyn/NASAcast_vodcast.rss"/>' +
        '<Rss label="DEMOCRACY NOW" url="http://www.democracynow.org/podcast-video.xml"/>' +
        '<Rss label="KQED  Check Please" url="http://www.kqed.org/rss/checkplease.xml"/>' +
        '<Rss label="KQED  Quest Video" url="http://www.kqed.org/rss/questvideo.xml"/>' +
        '<Rss label="KQED  Science On Spot" url="http://www.kqed.org/rss/quest_sots_HD.xml"/>' +
        '<Rss label="KQED This Week" url="http://feeds.feedburner.com/kqedthisweek"/>' +
        '<Rss label="KQED  TrueCaShorts" url="http://feeds.feedburner.com/KqedTrulyCaShorts"/>' +
        '<Rss label="CFR Podcasts" url="http://feeds.cfr.org/publication/video"/>' +
        '<Rss label="DOCTOR FLOYD" url="http://www.doctorfloyd.com/video/rss.xml"/>' +
        '<Rss label="ESRI  Events" url="http://feeds.feedburner.com/EsriVideo-Eventssmall"/>' +
        '<Rss label="ESRI  People" url="http://feeds.feedburner.com/EsriVideo-Peoplesmall"/>' +
        '<Rss label="ESRI  Products" url="http://feeds.feedburner.com/EsriVideo-Productssmall"/>' +
        '<Rss label="KCM" url="http://www.kcm.org/feed/en/itunes/webcast/video"/>' +
        '<Rss label="EURONEWS  NoComment" url="http://feeds.feedburner.com/euronews/en/Euronews-NoComment/"/>' +
        '<Rss label="DIVEFILM  Diving Films" url="http://divefilm.com/podcasts/podcast.xml"/>' +
        '<Rss label="CARNEGIE COUNCIL" url="http://www.carnegiecouncil.org/resources/video/rss/feed.xml"/>' +
        '<Rss label="AMAZINGFACTS Presents" url="http://feeds.feedburner.com/AmazingFactsPresents"/>' +
        '<Rss label="CSH" url="http://feeds.feedburner.com/CSHVideo"/>' +
        '<Rss label="CALIFORNIA ACADEMY" url="http://www.calacademy.org/rss/feed/?id=2"/>' +
        '<Rss label="TIMES OF INDIA 1" url="http://timesofindia.feedsportal.com/c/33039/f/534004/index.rss"/>' +
        '<Rss label="AMEINFO.COM Latest" url="http://www.ameinfo.com/rss/ame_video_mp4.xml"/>' +
        '<Rss label="AMEINFO.COM Industry" url="http://www.ameinfo.com/rss/italk_mp4.xml"/>' +
        '<Rss label="AMEINFO.COM Aviation" url="http://www.ameinfo.com/rssfeeds/11168.xml"/>' +
        '<Rss label="AMEINFO.COM Business" url="http://www.ameinfo.com/rssfeeds/3191.xml"/>' +
        '<Rss label="AMEINFO.COM Conferences" url="http://www.ameinfo.com/rssfeeds/3187.xml"/>' +
        '<Rss label="AMEINFO.COM Face to Face" url="http://www.ameinfo.com/rssfeeds/9992.xml"/>' +
        '<Rss label="AMEINFO.COM Gitex" url="http://www.ameinfo.com/rssfeeds/10587.xml"/>' +
        '<Rss label="AMEINFO.COM IT, Internet, and Telcos" url="http://www.ameinfo.com/rssfeeds/3184.xml"/>' +
        '<Rss label="AMEINFO.COM Luxury" url="http://www.ameinfo.com/rssfeeds/9617.xml"/>' +
        '<Rss label="AMEINFO.COM Media, PR, Advertisement" url="http://www.ameinfo.com/rssfeeds/3974.xml"/>' +
        '<Rss label="AMEINFO.COM Mobile, Electronics" url="http://www.ameinfo.com/rssfeeds/3185.xml"/>' +
        '<Rss label="AMEINFO.COM Test Drive" url="http://www.ameinfo.com/rssfeeds/3289.xml"/>' +
        '<Rss label="AMEINFO.COM Property Report" url="http://www.ameinfo.com/rssfeeds/3188.xml"/>' +
        '<Rss label="AMEINFO.COM Retail" url="http://www.ameinfo.com/rssfeeds/3190.xml"/>' +
        '<Rss label="AMEINFO.COM Technology" url="http://www.ameinfo.com/rssfeeds/10660.xml"/>' +
        '<Rss label="AMEINFO.COM  Travel" url="http://www.ameinfo.com/rssfeeds/3183.xml"/>' +
        '<Rss label="CATEGORY 5" url="http://rss.cat5.tv/sd"/>' +
        '<Rss label="1 UP Show" url="http://feeds.feedburner.com/1UP/1upShow"/>' +
        '<Rss label="1 UP Broken Pixels" url="http://www.1up.com/flat/Podcasts/brokenpixels.xml"/>' +
        '<Rss label="I UP Espn" url="http://www.1up.com/flat/Podcasts/espn.xml"/>' +
        '<Rss label="1UP Retro" url="http://www.1up.com/flat/Podcasts/retrobonusstage.xml"/>' +
        '<Rss label="64MM - Skateboarding" url="http://feeds.feedburner.com/64mmVlog"/>' +
        '<Rss label="FEM - Blogs" url="http://feeds.feedburner.com/FEMvideoblogs"/>' +
        '<Rss label="Bringing Disneyland Home" url="http://www.oakfan.com/BDHVodcast.xml"/>' +
        '<Rss label="Ricky Gervais" url="http://podcast.rickygervais.com/podcast.xml"/>' +
        '<Rss label="Terra Videos" url="http://feeds.feedburner.com/Terravideos"/>' +
        '<Rss label="PLAYHOUSE TV" url="http://playhousetv.podomatic.com/rss2.xml"/>' +
        '<Rss label="DLTV" url="http://feeds2.feedburner.com/ziffdavis/dltvipodpspvideo"/>' +
        '<Rss label="ADOBE CREATIVE SUITE " url="http://creativesuitepodcast.com/rss"/>' +
        '<Rss label="COMMAND N" url="http://feeds.feedburner.com/commandN_pod"/>' +
        '<Rss label="GEEK BRIEF TV" url="http://geekbrief.podshow.com/feed.xml"/>' +
        '<Rss label="One Minute Tip (Photoshop)" url="http://www.newmediamanuals.com/podcast/ivideos/video.xml"/>' +
        '<Rss label="PHOTOSHOP TV" url="http://feeds.feedburner.com/photoshoptv"/>' +
        '<Rss label="LDS.ORH   Mormon Church " url="http://feeds.lds.org/cesfiresidesvideo"/>' +
        '<Rss label="LDS.ORH   Conferences" url="http://feeds.lds.org/lds-general-conference-sd-eng"/>' +
        '<Rss label="UCL London" url="http://itunes.ucl.ac.uk/rss-feeds/introducing/provost/rss"/>' +
        '<Rss label="UCL News" url="http://itunes.ucl.ac.uk/rss-feeds/news/news4/rss"/>' +
        '<Rss label="UCL Fine arts" url="http://itunes.ucl.ac.uk/rss-feeds/news/news5/rss"/>' +
        '<Rss label="UCL Torture Team" url="http://itunes.ucl.ac.uk/rss-feeds/news/news6/rss"/>' +
        '<Rss label="UCL Donor Reception" url="http://itunes.ucl.ac.uk/rss-feeds/news/news7/rss"/>' +
        '<Rss label="UCL Research" url="http://itunes.ucl.ac.uk/rss-feeds/research/price/rss"/>' +
        '<Rss label="UCL Research China" url="http://itunes.ucl.ac.uk/rss-feeds/research/boxing/rss"/>' +
        '<Rss label="UCL Health" url="http://itunes.ucl.ac.uk/rss-feeds/global-health/governance/rss"/>' +
        '<Rss label="VH1 BestWeek" url="http://feeds.feedburner.com/vh1_bestweekever"/>' +
        '<Rss label="VH1 BestOf" url="http://feeds.feedburner.com/vh1_bestof"/>' +
        '<Rss label="VH1 Celebreality" url="http://feeds.feedburner.com/vh1_celebreality"/>' +
        '<Rss label="VH1 FlavorOfLove" url="http://feeds.feedburner.com/vh1_flavoroflove"/>' +
        '<Rss label="TWIT TV" url="http://feeds.twit.tv/twit_video_large"/>' +
        '<Rss label="NBC MONTANA" url="http://www.nbcmontana.com/-/14594424/15193836/-/format/rss_2.0/view/asFeed/-/7ht7wl/-/index.xml"/>' +
        '<Rss label="ItunesPoadcast Tutorial" url="http://www.feedforall.com/rss-video-tutorials.xml"/>' +
        '<Rss label="BEST OF YOUTUBE" url="http://mevio.com/feeds/bestofyoutube.xml"/>' +
        '<Rss label="Custom" url=""/>' +
        '</TextRss>'

    constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private bs: BlockService, private ngmslibService: NgmslibService) {
        super();
        this.m_contGroup = fb.group({
            'url': ['', [Validators.pattern(urlRegExp)]],
            'rssSelection': [],
            'maintain': []
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.m_formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })
        var links = jXML(jXML.parseXML(this.m_mrssLinks)).find('Rss');
        _.forEach(links, (k, v) => {
            this.m_mrssLinksData.push({
                url: jXML(k).attr('url'),
                label: jXML(k).attr('label')
            })
        });
    }

    @Input()
    set setBlockData(i_blockData) {
        if (this.m_blockData && this.m_blockData.blockID != i_blockData.blockID) {
            this.m_blockData = i_blockData;
            this._render();
        } else {
            this.m_blockData = i_blockData;
        }
    }

    @Input() external: boolean = false;

    /**
     Toggle maintain aspect ratio
     **/
    _toggleAspectRatio(i_value) {
        i_value = StringJS(i_value).booleanToNumber()
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Rss');
        jXML(xSnippet).attr('maintainAspectRatio', i_value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }

    _isUrlCustom(i_url): boolean {
        var feed = this.m_mrssLinksData.find(o => o.url == i_url);
        if (feed && feed.label == 'Custom') return true;
        if (feed) return false;
        return true;
    }

    _onRssSelected(event) {
        this.m_showCustomUrl = this._isUrlCustom(event.target.value);
    }

    private _render() {
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom
        var xSnippet = jXML(domPlayerData).find('Rss');
        var url = xSnippet.attr('url');
        var maintain = StringJS(jXML(xSnippet).attr('maintainAspectRatio')).booleanToNumber();
        this.m_formInputs['maintain'].setValue(maintain);

        if (this._isUrlCustom(url)) {
            this.m_showCustomUrl = true;
            this.m_formInputs['rssSelection'].setValue('');
            this.m_formInputs['url'].setValue(url);
        } else {
            this.m_showCustomUrl = false;
            this.m_formInputs['rssSelection'].setValue(url);
        }
        this.cd.markForCheck();
    }

    ngAfterViewInit() {
        this._render();
    }

    private saveToStore() {
        // con(this.m_contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.m_contGroup.value)));
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Rss');
        if (this.m_contGroup.value.rssSelection == ''){
            jXML(xSnippet).attr('url', this.m_contGroup.value.url);
        } else {
            jXML(xSnippet).attr('url', this.m_contGroup.value.rssSelection);
        }
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}