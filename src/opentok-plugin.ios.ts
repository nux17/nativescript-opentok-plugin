import { Observable, fromObject } from 'tns-core-modules/data/observable';
import { topmost } from 'tns-core-modules/ui/frame';
import { View, layout } from 'tns-core-modules/ui/core/view';
import * as utils from 'tns-core-modules/utils/utils';

import { screen } from 'tns-core-modules/platform';

declare var OTSubscriber: any,
    OTStream: any,
    OTSubscriberKitDelegate: any,
    interop: any,
    CGRectMake: any;

export class TNSOTSubscriber extends View {
    private _subscriberKitDelegate: any;
    private _ios: any;
    nativeView: UIView;
    public createNativeView() {
        return UIView.new();
    }
    public initNativeView() {
        this._subscriberKitDelegate = TNSSubscriberKitDelegateImpl.initWithOwner(new WeakRef(this));
    }

    public disposeNativeView() {
        this._subscriberKitDelegate = null;
    }
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        const nativeView = this.nativeView;
        if (nativeView) {
            const width = layout.getMeasureSpecSize(widthMeasureSpec);
            const height = layout.getMeasureSpecSize(heightMeasureSpec);
            this.setMeasuredDimension(width, height);
        }
    }
    subscribe(session: any, stream: any) {
        this._ios = new OTSubscriber(stream, this._subscriberKitDelegate);
        this._ios.view.frame = this.nativeView.bounds;
        this.nativeView.addSubview(this._ios.view);
        let errorRef = new interop.Reference();

        if (session instanceof TNSOTSession) {
            session._ios.subscribeError(this._ios, errorRef);
        } else if (session instanceof OTSession) {
            session.subscribeError(this._ios, errorRef);
        }
        if (errorRef.value) {
            console.log(errorRef.value);
        }
    }

    unsubscribe(session: any) {
        try {
            let errorRef = new interop.Reference();
            session._ios.unsubscribeError(this._ios, errorRef);
            if (errorRef.value) {
                console.log(errorRef.value);
            }
        } catch (error) {
            console.log(error);
        }
    }

    get events(): Observable {
        return this._subscriberKitDelegate.events;
    }

    get ios(): any {
        return this._ios;
    }
}

class TNSSubscriberKitDelegateImpl extends NSObject {

    public static ObjCProtocols = [OTSubscriberKitDelegate];

    private _events: Observable;
    private _owner: WeakRef<any>;

    public static initWithOwner(owner: WeakRef<any>): TNSSubscriberKitDelegateImpl {
        let subscriberKiDelegate = new TNSSubscriberKitDelegateImpl();
        subscriberKiDelegate._events = new Observable();
        subscriberKiDelegate._owner = owner;
        return subscriberKiDelegate;
    }

    subscriberDidFailWithError(subscriber: any, error: any) {
        if (this._events) {
            this._events.notify({
                eventName: 'didFailWithError',
                object: fromObject({
                    subscriber: subscriber,
                    error: error
                })
            });
        }
    }

    subscriberDidConnectToStream(subscriber) {
        if (this._events) {
            this._events.notify({
                eventName: 'subscriberDidConnectToStream',
                object: fromObject({
                    subscriber: subscriber
                })
            });
        }
    }

    subscriberDidDisconnectFromStream(subscriber: any) {
        if (this._events) {
            this._events.notify({
                eventName: 'didDisconnectFromStream',
                object: fromObject({
                    subscriber: subscriber
                })
            });
        }
    }

    subscriberDidReconnectToStream(subscriber: any) {
        if (this._events) {
            this._events.notify({
                eventName: 'didReconnectToStream',
                object: fromObject({
                    subscriber: subscriber
                })
            });
        }
    }

    subscriberVideoDisableWarning(subscriber: any) {
        if (this._events) {
            this._events.notify({
                eventName: 'subscriberVideoDisableWarning',
                object: fromObject({
                    subscriber: subscriber
                })
            });
        }
    }

    subscriberVideoDisableWarningLifted(subscriber: any) {
        if (this._events) {
            this._events.notify({
                eventName: 'subscriberVideoDisableWarningLifted',
                object: fromObject({
                    subscriber: subscriber
                })
            });
        }
    }

    subscriberVideoDisabledReason(subscriber, reason) {
        if (this._events) {
            this._events.notify({
                eventName: 'subscriberVideoDisabledReason',
                object: fromObject({
                    subscriber: subscriber,
                    reason: reason
                })
            });
        }
    }

    subscriberVideoEnabledReason(subscriber, reason) {
        if (this._events) {
            this._events.notify({
                eventName: 'subscriberVideoEnabledReason',
                object: fromObject({
                    subscriber: subscriber,
                    reason: reason
                })
            });
        }
    }

    get events(): Observable {
        return this._events;
    }

}

declare var OTSession: any,
    OTSessionDelegate: any,
    interop: any,
    OTSessionErrorCode: any;

export class TNSOTSession extends NSObject {

    public static ObjCProtocols = [OTSessionDelegate];

    public _ios: any;

    private _events: Observable;
    private _subscriber: TNSOTSubscriber;

    public static initWithApiKeySessionId(apiKey: string, sessionId: string): TNSOTSession {
        let instance = <TNSOTSession>TNSOTSession.new();
        instance._events = fromObject({});
        instance._ios = OTSession.alloc().initWithApiKeySessionIdDelegate(apiKey.toString(), sessionId.toString(), instance);
        return instance;
    }

    public static requestPermission(): any {
    }

    connect(token: string): void {
        let errorRef = new interop.Reference();
        this._ios.connectWithTokenError(token, errorRef);
        if (errorRef.value) {
            console.log(errorRef.value);
        }
    }

    disconnect(): void {
        if (this._ios) {
            try {
                let errorRef = new interop.Reference();
                this._ios.disconnect(errorRef);
                if (errorRef.value) {
                    console.log(errorRef.value);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    sendSignal(type: string, message: string): void {
        if (this._ios) {
            try {
                let errorRef = new interop.Reference();
                this._ios.signalWithTypeStringConnectionError(type, message, null, errorRef);
                if (errorRef.value) {
                    console.log(errorRef.value);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    unsubscribe(subscriber: any): void {
        try {
            if (this._ios) {
                let errorRef = new interop.Reference();
                this._ios.unsubscribe(subscriber, errorRef);
                if (errorRef.value) {
                    console.log(errorRef.value);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    set subscriber(subscriber) {
        this._subscriber = subscriber;
    }

    get events(): Observable {
        return this._events;
    }

    sessionDidConnect(session: any) {
        if (this.events) {
            this.events.notify({
                eventName: 'sessionDidConnect',
                object: fromObject({
                    session: session
                })
            });
        }
    }

    sessionDidDisconnect(session: any) {
        if (this.events) {
            this.events.notify({
                eventName: 'sessionDidDisconnect',
                object: fromObject({
                    session: session
                })
            });
        }
    }

    sessionDidReconnect(session: any) {
        if (this.events) {
            this.events.notify({
                eventName: 'sessionDidReconnect',
                object: fromObject({
                    session: session
                })
            });
        }
    }

    sessionDidBeginReconnecting(session: any) {
        if (this.events) {
            this.events.notify({
                eventName: 'sessionDidBeginReconnecting',
                object: fromObject({
                    session: session
                })
            });
        }
    }

    sessionStreamCreated(session: any, stream: any) {
        if (this.events) {
            this.events.notify({
                eventName: 'streamCreated',
                object: fromObject({
                    session: session,
                    stream: stream
                })
            });
        }
        if (this._subscriber) {
            this._subscriber.subscribe(session, stream);
        }
    }

    sessionStreamDestroyed(session: any, stream: any) {
        if (this.events) {
            this.events.notify({
                eventName: 'streamDestroyed',
                object: fromObject({
                    session: session,
                    stream: stream
                })
            });
        }
    }

    sessionDidFailWithError(session: any, error: any) {
        if (this.events) {
            this.events.notify({
                eventName: 'didFailWithError',
                object: fromObject({
                    session: session,
                    error: error
                })
            });
        }
    }

    sessionConnectionDestroyed(session: any, connection: any) {
        if (this.events) {
            this.events.notify({
                eventName: 'connectionDestroyed',
                object: fromObject({
                    session: session,
                    connection: connection
                })
            });
        }
    }

    sessionConnectionCreated(session: any, connection: any) {
        if (this.events) {
            this.events.notify({
                eventName: 'connectionCreated',
                object: fromObject({
                    session: session,
                    connection: connection
                })
            });
        }
    }

    sessionArchiveStartedWithId(session: any, archiveId: string, name?: string) {
        if (this.events) {
            this.events.notify({
                eventName: 'archiveStartedWithId',
                object: fromObject({
                    session: session,
                    archiveId: archiveId,
                    name: name
                })
            });
        }
    }

    sessionArchiveStoppedWithId(session: any, archiveId: string) {
        if (this.events) {
            this.events.notify({
                eventName: 'archiveStoppedWithId',
                object: fromObject({
                    session: session,
                    archiveId: archiveId
                })
            });
        }
    }

    sessionReceivedSignalTypeFromConnectionWithString(session: any, type: any, connection: any, data: any) {
        if (this.events) {
            this.events.notify({
                eventName: 'signalReceived',
                object: fromObject({
                    session: session,
                    type: type,
                    data: data,
                    connection: connection
                })
            });
        }
    }

}


declare var OTPublisher: any,
    interop: any,
    OTPublisherKitDelegate: any,
    OTCameraCaptureResolution: any,
    OTCameraCaptureFrameRate: any,
    AVCaptureDevicePositionBack: any,
    AVCaptureDevicePositionFront: any;

export class TNSOTPublisher extends View {
    private _ios: any = {};
    nativeView: UIView;
    private _publisherKitDelegate: any;

    public createNativeView() {
        return UIView.new();
    }
    public initNativeView() {
        this._publisherKitDelegate = TNSPublisherKitDelegateImpl.initWithOwner(new WeakRef(this));
    }
    public disposeNativeView() {
        this._publisherKitDelegate = null;
    }
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        const nativeView = this.nativeView;
        if (nativeView) {
            const width = layout.getMeasureSpecSize(widthMeasureSpec);
            const height = layout.getMeasureSpecSize(heightMeasureSpec);
            this.setMeasuredDimension(width, height);
        }
    }
    publish(session: TNSOTSession, name?: string, cameraResolution?: string, cameraFrameRate?: string): void {
        this._ios = OTPublisher.alloc().initWithDelegateNameCameraResolutionCameraFrameRate(
            this._publisherKitDelegate,
            name ? name : '',
            this.getCameraResolution(cameraResolution),
            this.getCameraFrameRate(cameraFrameRate)
        );
        this._ios.view.frame = this.nativeView.bounds;
        this.nativeView.addSubview(this._ios.view);
        session.events.on('sessionDidConnect', (result) => {
            this._ios.publishAudio = true;
            let stream: any = result.object;
            this.setIdleTimer(true);
            try {
                stream.session.publish(this._ios);
            } catch (error) {
                console.log(error);
            }
        });
    }

    unpublish(session: TNSOTSession): void {
        try {
            if (session) {
                let errorRef = new interop.Reference();
                this.setIdleTimer(false);
                session._ios.unpublishError(this._ios, errorRef);
                if (errorRef.value) {
                    console.log(errorRef.value);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    get ios(): any {
        return this._ios;
    }

    private setIdleTimer(idleTimerDisabled: boolean) {
        let app: any;
        app = utils.ios.getter(UIApplication, UIApplication.sharedApplication);
        app.idleTimerDisabled = idleTimerDisabled;
    }

    private getCameraResolution(cameraResolution: string): any {
        if (cameraResolution) {
            switch (cameraResolution) {
                case 'LOW':
                    return OTCameraCaptureResolution.OTCameraCaptureResolutionLow;
                case 'MEDIUM':
                    return OTCameraCaptureResolution.OTCameraCaptureResolutionMedium;
                case 'HIGH':
                    return OTCameraCaptureResolution.OTCameraCaptureResolutionHigh;
            }
        }
        return OTCameraCaptureResolution.OTCameraCaptureResolutionMedium;
    }

    private getCameraFrameRate(cameraFrameRate: string): any {
        if (cameraFrameRate) {
            switch (Number(cameraFrameRate)) {
                case 30:
                    return OTCameraCaptureFrameRate.OTCameraCaptureFrameRate30FPS;
                case 15:
                    return OTCameraCaptureFrameRate.OTCameraCaptureFrameRate15FPS;
                case 7:
                    return OTCameraCaptureFrameRate.OTCameraCaptureFrameRate7FPS;
                case 1:
                    return OTCameraCaptureFrameRate.OTCameraCaptureFrameRate1FPS;
            }
        }
        return OTCameraCaptureFrameRate.OTCameraCaptureFrameRate30FPS;
    }

    cycleCamera(): void {
        if (this._ios) {
            if (this._ios.cameraPosition === AVCaptureDevicePositionBack) {
                this._ios.cameraPosition = AVCaptureDevicePositionFront;
            }
            else {
                this._ios.cameraPosition = AVCaptureDevicePositionBack;
            }
        }
    }

    toggleCamera(): void {
        if (this._ios) {
            this._ios.publishVideo = !this._ios.publishVideo;
        }
    }

    toggleMute(): void {
        if (this._ios) {
            this._ios.publishAudio = !this._ios.publishAudio;
        }
    }

    get events(): Observable {
        return this._publisherKitDelegate.events;
    }

}

class TNSPublisherKitDelegateImpl extends NSObject {

    public static ObjCProtocols = [OTPublisherKitDelegate];

    private _events: Observable;
    private _owner: WeakRef<any>;

    public static initWithOwner(owner: WeakRef<any>): TNSPublisherKitDelegateImpl {
        let publisherKitDelegate = new TNSPublisherKitDelegateImpl();
        publisherKitDelegate._events = new Observable();
        publisherKitDelegate._owner = owner;
        return publisherKitDelegate;
    }

    public publisherStreamCreated(publisher: any, stream: any) {
        if (this._events) {
            this._events.notify({
                eventName: 'streamCreated',
                object: fromObject({
                    publisher: publisher,
                    stream: stream
                })
            });
        }
    }

    public publisherStreamDestroyed(publisher: any, stream: any) {
        if (this._events) {
            this._events.notify({
                eventName: 'streamDestroyed',
                object: fromObject({
                    publisher: publisher,
                    stream: stream
                })
            });
        }
    }

    public publisherDidFailWithError(publisher: any, error: any) {
        if (this._events) {
            this._events.notify({
                eventName: 'didFailWithError',
                object: fromObject({
                    publisher: publisher,
                    error: error
                })
            });
        }
        console.log(error);
    }

    get events(): Observable {
        return this._events;
    }

}