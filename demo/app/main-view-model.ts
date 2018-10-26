import { Observable } from 'tns-core-modules/data/observable';
import {TNSOTSession, TNSOTPublisher, TNSOTSubscriber} from 'nativescript-opentok-plugin';

export class HelloWorldModel extends Observable {

private _apiKey:string = 'API';
private _sessionId: string = 'SESSION';
private _token: string = 'TOKEN';

private publisher: TNSOTPublisher;
private subscriber: TNSOTSubscriber;

private session: TNSOTSession;

constructor(private page) {
   super();
   this.session = TNSOTSession.initWithApiKeySessionId(this._apiKey, this._sessionId);
   this.publisher = <TNSOTPublisher> this.page.getViewById('publisher');
   this.subscriber = <TNSOTSubscriber> this.page.getViewById('subscriber');
   this.initSubscriber();
   this.initPublisher();
}

initPublisher() {
   this.session.connect(this._token);
   this.publisher.publish(this.session, '', 'HIGH', '30');
   this.publisher.events.on('streamDestroyed', (result) => {
       console.log('publisher stream destroyed');
   });
}

initSubscriber() {
   this.session.events.on('streamReceived', (data: any) => {
    this.subscriber.subscribe(this.session,data.object.stream);
   });
}

subscriberConnect(){
  this.session.connect(this._token);
}
}
