import * as  utils from "tns-core-modules/utils/utils";
import * as app from 'tns-core-modules/application';
import { Property, View, CssProperty, Style } from 'tns-core-modules/ui/content-view/content-view'
import { Observable, fromObject } from "tns-core-modules/data/observable";
import { RENDERSTYLE } from "./opentok-plugin.common";
declare var com: any, android: any;


const CameraListener = com.opentok.android.Publisher.CameraListener;
const PublisherListener = com.opentok.android.PublisherKit.PublisherListener;
const Publisher = com.opentok.android.Publisher;
const BaseVideoRenderer = com.opentok.android.BaseVideoRenderer;
const AbsoluteLayout = android.widget.AbsoluteLayout;
const RelativeLayout = android.widget.RelativeLayout;

const Session = com.opentok.android.Session;
const Subscriber = com.opentok.android.Subscriber;
const SessionListener = com.opentok.android.Session.SessionListener;
const SignalListener = com.opentok.android.Session.SignalListener;
const ReconnectionListener = com.opentok.android.Session.ReconnectionListener;
const ConnectionListener = com.opentok.android.Session.ConnectionListener;
const ArchiveListener = com.opentok.android.Session.ArchiveListener;

const MARSHMALLOW = 23;
const currentapiVersion = android.os.Build.VERSION.SDK_INT;
import permissions = require('nativescript-permissions');

import { ContentView } from 'tns-core-modules/ui/content-view';
declare var com: any, android: any;
const StreamListener = com.opentok.android.SubscriberKit.StreamListener;
const SubscriberListener = com.opentok.android.SubscriberKit.SubscriberListener;

const renderStyle = new CssProperty<Style, string>({
    name: 'renderStyle',
    cssName: 'render-style',
    defaultValue: 'fill',
    valueConverter: (v: RENDERSTYLE) => { return String(v) }
});

export class TNSOTSubscriber extends View {
    private _android: any;
    private _subscriber: any;
    private _events: Observable;
    public renderStyle: any;
    private _renderStyle: any;
    constructor() {
        super();
        this._events = fromObject({});
    }

    get android() {
        return this.nativeView;
    }
    get subscriber() {
        return this._subscriber;
    }

    public createNativeView() {
        return new android.widget.LinearLayout(utils.ad.getApplicationContext());
    }

    subscribe(session: any, stream: any) {
        const that = new WeakRef(this);
        this._subscriber = new com.opentok.android.Subscriber(utils.ad.getApplicationContext(), stream);
        //this._subscriber.getRenderer().setStyle(com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_SCALE, this.render_style);
        this.renderStyle = this._renderStyle;
        this._subscriber.setSubscriberListener(new com.opentok.android.SubscriberKit.SubscriberListener({
            owner: that.get(),
            onConnected(subscriber) {
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'subscriberDidConnectToStream',
                        object: fromObject({
                            subscriber: subscriber
                        })
                    });
                }
            },
            onDisconnected(subscriber) {
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'subscriberDidDisconnect',
                        object: fromObject({
                            subscriber: subscriber
                        })
                    });
                }
            },
            onError(subscriber, error) {
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'didFailWithError',
                        object: fromObject({
                            subscriber: subscriber,
                            error: error
                        })
                    });
                }
            },
        }));
        this._subscriber.setStreamListener(new com.opentok.android.SubscriberKit.StreamListener({
            owner: that.get(),
            onDisconnected(subscriber) {
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'didDisconnectFromStream',
                        object: fromObject({
                            subscriber: subscriber
                        })
                    });
                }
            },
            onReconnected(subscriber) {
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'didReconnectToStream',
                        object: fromObject({
                            subscriber: subscriber
                        })

                    });
                }
            }
        }));
        
        let sub = this._subscriber.getView();
        this.nativeView.addView(sub);

        if (session instanceof TNSOTSession) {
            session.session.subscribe(this._subscriber);
        } else {
            session.subscribe(this._subscriber);
        }

    }

    toggleVideo() {
        let _isEnabled = this._subscriber.getSubscribeToVideo();
        if (_isEnabled) {
            this.setVideoActive(false);
        } else {
            this.setVideoActive(true);
        }
    }

    setVideoActive(state: boolean) {
        this._subscriber.setSubscribeToVideo(state);
    }

    toggleAudio() {
        let _isEnabled = this._subscriber.getSubscribeToAudio();
        if (_isEnabled) {
            this.setAudioActive(false);
        } else {
            this.setAudioActive(true);
        }
    }

    setAudioActive(state: boolean) {
        this._subscriber.setSubscribeToAudio(state);
    }

    get events(): Observable {
        return this._events;
    }

    [renderStyle.setNative](value: string) {
        this._renderStyle = value;
        if (this._subscriber) {
            switch (value) {
                case 'fit':
                    this._subscriber.getRenderer().setStyle(com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_SCALE, com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_FIT);
                    break;
                case 'scale':
                    this._subscriber.getRenderer().setStyle(com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_SCALE, com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_SCALE);
                    break;
                default:
                    this._subscriber.getRenderer().setStyle(com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_SCALE, com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_FILL);
                    break;
            }

        }
    }
}
renderStyle.register(Style);


export class TNSOTSession {
    private apiKey: string;
    private config: any;
    public session: any;
    public publisher: any;
    private _sessionEvents: Observable;
    private options: any;
    private _subscriber: TNSOTSubscriber;

    public static initWithApiKeySessionId(apiKey: string, sessionId: string) {
        let tnsSession = new TNSOTSession();
        tnsSession._sessionEvents = new Observable();
        tnsSession.apiKey = apiKey;
        tnsSession.session = new Session(utils.ad.getApplicationContext(), apiKey, sessionId);
        tnsSession.session.setSessionListener(new SessionListener({
            onConnected(session: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'sessionDidConnect',
                        object: fromObject({
                            session: session
                        })
                    });
                }
            },
            onDisconnected(session: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'sessionDidDisconnect',
                        object: fromObject({
                            session: session
                        })
                    });
                }
            },
            onError(session: any, error: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'didFailWithError',
                        object: fromObject({
                            session: session,
                            error: error
                        })
                    });
                }
            },
            onStreamDropped(session: any, stream: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'streamDropped',
                        object: fromObject({
                            session: session,
                            stream: stream
                        })
                    })
                }
            },
            onStreamReceived(session: any, stream: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'streamReceived',
                        object: fromObject({
                            session: session,
                            stream: stream
                        })
                    });
                }
                if (tnsSession.subscriber) {
                    tnsSession.subscriber.subscribe(session, stream);
                }
            }

        }));

        tnsSession.session.setSignalListener(new SignalListener({
            onSignalReceived(session: any, type: any, data: any, connection: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
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

        }));

        tnsSession.session.setArchiveListener(new ArchiveListener({
            onArchiveStarted(session: any, id: any, name: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'archiveStartedWithId',
                        object: fromObject({
                            session: session,
                            archiveId: id,
                            name: name
                        })
                    });
                }
            }, onArchiveStopped(session: any, id: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'archiveStoppedWithId',
                        object: fromObject({
                            session: session,
                            archiveId: id
                        })
                    });
                }
            }
        }));
        tnsSession.session.setConnectionListener(new ConnectionListener({
            onConnectionCreated(session: any, connection: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'connectionCreated',
                        object: fromObject({
                            session: session,
                            connection: connection
                        })
                    })
                }
            },
            onConnectionDestroyed(session: any, connection: any) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'connectionDestroyed',
                        object: fromObject({
                            session: session,
                            connection: connection
                        })
                    })
                }
            }
        }));
        tnsSession.session.setReconnectionListener(new ReconnectionListener({
            onReconnected(session) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'sessionDidReconnect',
                        object: fromObject({
                            session: session
                        })
                    })
                }
            }, onReconnecting(session) {
                if (tnsSession._sessionEvents) {
                    tnsSession._sessionEvents.notify({
                        eventName: 'sessionDidBeginReconnecting',
                        object: fromObject({
                            session: session
                        })
                    })
                }
            }
        }));

        return tnsSession;
    }
    public static requestPermission(): any {
        if (currentapiVersion >= MARSHMALLOW) {
            const perms = [android.Manifest.permission.CAMERA, android.Manifest.permission.RECORD_AUDIO];
            return permissions.requestPermission(perms);
        }
    }

    /**
     * Asynchronously begins the session connect process. Some time later, we will
     * expect a delegate method to call us back with the results of this action.
     *
     * @param {string} token The OpenTok token to join an existing session
     * @returns {Promise<any>}
     */
    public connect(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let session = this.session;
            if (session) {
                try {
                    session.connect(token);
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            }
        });
    }

    public disconnect(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.session.disconnect();
                resolve();
            } catch (err) {
                reject(err)
            }
        });
    }

    public sendSignal(type: string, message: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let session = this.session;
            if (session) {
                try {
                    session.sendSignal(type, message);
                    resolve(true);
                } catch (err) {
                    reject(err);
                }

            }
        });

    }

    public subscribe(subInstance: any) {
        this.session.subscribe(subInstance);
    }

    get sessionEvents(): Observable {
        return this._sessionEvents;
    }

    get events(): Observable {
        return this._sessionEvents;
    }

    set subscriber(subscriber) {
        this._subscriber = subscriber;
    }

    get subscriber() {
        return this._subscriber;
    }

}

export class TNSOTPublisher extends View {
    private _publisher: any;
    public static toggleVideoEvent = "toggleVideo";
    public static toggleAudioEvent = "toggleAudio";
    public static cycleCameraEvent;
    private _events: any;
    private _renderStyle: any;
    public renderStyle: any;
    constructor() {
        super();
        this._events = fromObject({});
    }

    get android() {
        return this.nativeView;
    }

    public createNativeView() {
        return new android.widget.LinearLayout(this._context);
    }

    publish(session: TNSOTSession, name?: string, cameraResolution?: string, cameraFrameRate?: string) {
        const that = new WeakRef(this);
        this._publisher = new com.opentok.android.Publisher(
            utils.ad.getApplicationContext(),
            name ? name : '',
            TNSOTPublisher.getCameraResolution(cameraResolution),
            TNSOTPublisher.getCameraFrameRate(cameraFrameRate)
        );
        let pub = this._publisher.getView();
        this.nativeView.addView(pub);
        this.renderStyle = this._renderStyle;
        this._publisher.setPublisherListener(new PublisherListener({
            owner: that.get(),
            onError(publisher: any, error: any) {
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'didFailWithError',
                        object: fromObject({
                            publisher: publisher,
                            error: error
                        })
                    });
                }
            },
            onStreamCreated(publisher: any, stream: any) {
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'streamCreated',
                        object: fromObject({
                            publisher: publisher,
                            stream: stream
                        })
                    });
                }
            },
            onStreamDestroyed(publisher: any, stream: any) {
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'streamDestroyed',
                        object: fromObject({
                            publisher: publisher,
                            stream: stream
                        })
                    });
                }
            }
        }));
        this._publisher.setCameraListener(new CameraListener({
            owner: that.get(),
            onCameraChanged(publisher, newCameraId) {
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'cameraChanged',
                        object: fromObject({
                            publisher: publisher,
                            cameraId: newCameraId
                        })
                    });
                }
            }, onCameraError(publisher, error) {
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'cameraError',
                        object: fromObject({
                            publisher: publisher,
                            error: error
                        })
                    });
                }
            }
        }));
        session.events.on('sessionDidConnect', (result: any) => {
            try {
                let stream: any = result.object;
                session.session.publish(this._publisher);
            } catch (error) {
                console.log(error);
            }
        });

    }

    public static getCameraResolution(cameraResolution) {
        if (cameraResolution) {
            switch (cameraResolution.toString().toUpperCase()) {
                case 'LOW':
                    return com.opentok.android.Publisher.CameraCaptureResolution.LOW;
                case 'MEDIUM':
                    return com.opentok.android.Publisher.CameraCaptureResolution.MEDIUM;
                case 'HIGH':
                    return com.opentok.android.Publisher.CameraCaptureResolution.HIGH;
            }
        }
        return com.opentok.android.Publisher.CameraCaptureResolution.MEDIUM;
    }

    public static getCameraFrameRate(cameraFrameRate) {
        if (cameraFrameRate) {
            switch (Number(cameraFrameRate)) {
                case 30:
                    return com.opentok.android.Publisher.CameraCaptureFrameRate.FPS_30;
                case 15:
                    return com.opentok.android.Publisher.CameraCaptureFrameRate.FPS_15;
                case 7:
                    return com.opentok.android.Publisher.CameraCaptureFrameRate.FPS_7;
                case 1:
                    return com.opentok.android.Publisher.CameraCaptureFrameRate.FPS_1;
            }
        }
        return com.opentok.android.Publisher.CameraCaptureFrameRate.FPS_30;
    }

    get publisher() {
        return this._publisher;
    }

    get events(): Observable {
        return this._events;
    }

    toggleCamera() {
        this.publishVideo = !this.publishVideo;
    }

    toggleVideo() {
        this.publishVideo = !this.publishVideo;
    }

    toggleMute() {
        this.publishAudio = !this.publishAudio;
    }

    get publishVideo(): boolean {
        return this._publisher.getPublishVideo();
    }

    set publishVideo(state: boolean) {
        this._publisher.setPublishVideo(state);
    }

    get publishAudio(): boolean {
        return this._publisher.getPublishAudio();
    }

    set publishAudio(state: boolean) {
        this._publisher.setPublishAudio(state);
    }

    cycleCamera() {
        this._publisher.cycleCamera();
    }

    instance() {
        return this._publisher;
    }

    unpublish(session: TNSOTSession) {
        session.session.unpublish(this._publisher);
    }

}