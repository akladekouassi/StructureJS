'use strict';
/*
 UMD Stuff
 @import ../util/Extend as Extend
 @import ../event/EventDispatcher as EventDispatcher
 @import ../event/LoaderEvent as LoaderEvent
 @export ImageLoader
 */
import IDataStore = require('../interfaces/IDataStore');
import EventDispatcher = require('../../vendor/structurejs/ts/event/EventDispatcher');
import LoaderEvent = require('../../vendor/structurejs/ts/event/LoaderEvent');

/**
 * The ImageLoader...
 *
 * @class ImageLoader
 * @module StructureJS
 * @submodule util
 * @constructor
 * @author Robert S. (www.codeBelt.com)
 */
class ImageLoader extends EventDispatcher implements IDataStore
{

    private _image:HTMLImageElement;

    public data:any;
    public src:string;
    public complete:boolean = false;

    constructor(path:string)
    {
        super();

        this.src = path;
        this.init();
    }

    private init():void
    {
        this._image = new Image();
        this._image.onload = (event:Event) => {
            this.onImageLoad();
        }
    }

    public load():void
    {
        this._image.src = this.src;
    }

    private onImageLoad():void
    {
        this.data = this._image;
        this.complete = true;
        this.dispatchEvent(LoaderEvent.COMPLETE);
    }
}

export = ImageLoader;
