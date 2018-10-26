import { View } from 'tns-core-modules/ui/content-view/content-view';
import { Observable } from "tns-core-modules/data/observable";
export declare class TNSOTSubscriber extends View {
    private _android;
    private _subscriber;
    private _events;
    renderStyle: any;
    private _renderStyle;
    constructor();
    readonly android: any;
    readonly subscriber: any;
    createNativeView(): any;
    subscribe(session: any, stream: any): void;
    toggleVideo(): void;
    setVideoActive(state: boolean): void;
    toggleAudio(): void;
    setAudioActive(state: boolean): void;
    readonly events: Observable;
}
export declare class TNSOTSession {
    private apiKey;
    private config;
    session: any;
    publisher: any;
    private _sessionEvents;
    private options;
    private _subscriber;
    static initWithApiKeySessionId(apiKey: string, sessionId: string): TNSOTSession;
    static requestPermission(): any;
    connect(token: string): Promise<any>;
    disconnect(): Promise<any>;
    sendSignal(type: string, message: string): Promise<any>;
    subscribe(subInstance: any): void;
    readonly sessionEvents: Observable;
    readonly events: Observable;
    subscriber: TNSOTSubscriber;
}
export declare class TNSOTPublisher extends View {
    private _publisher;
    static toggleVideoEvent: string;
    static toggleAudioEvent: string;
    static cycleCameraEvent: any;
    private _events;
    private _renderStyle;
    renderStyle: any;
    constructor();
    readonly android: any;
    createNativeView(): any;
    publish(session: TNSOTSession, name?: string, cameraResolution?: string, cameraFrameRate?: string): void;
    static getCameraResolution(cameraResolution: any): any;
    static getCameraFrameRate(cameraFrameRate: any): any;
    readonly publisher: any;
    readonly events: Observable;
    toggleCamera(): void;
    toggleVideo(): void;
    toggleMute(): void;
    publishVideo: boolean;
    publishAudio: boolean;
    cycleCamera(): void;
    instance(): any;
    unpublish(session: TNSOTSession): void;
}
