function SkylabSortableListCore( listElem ) {

  var ACHIEVED = true;
  var debug = true;
  var __shadow2 = "0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)";
  var __moment = 0.2;  // ~ cheeky names for amount of time
  var waltz = 0.35;

  $( '.scrubber', listElem ).mousedown( __onScrubberTouch );

  function __onScrubberTouch() {

    var scrubber = $( this );
    var movingTile;

    var ok;
    __findMovingTileFromScrubber();
    ok && __dragSessionIsNotAlreadyStarted();
    ok && __startDragSession( movingTile, scrubber );

    function __findMovingTileFromScrubber() {

      var current = scrubber;
      do {
        if ( current.hasClass( 'tile' ) ) {
          var found = current;
          break;
        }
        current = current.parent();

      } while ( current.length );

      if ( found ) {
        movingTile = found;
        ok = ACHIEVED;
      } else {
        ok = error( "parent tile of scrubber not found (no \"tile\" class)" );
      }
    }

    function __dragSessionIsNotAlreadyStarted() {

      var drg = Draggable.get( movingTile );
      if ( drg ) {
        ok = error( "drag already in session? ignoring touch." );
      } else {
        ok = ACHIEVED;
      }
    }
  }

  function __startDragSession( movingTile, scrubber ) {

    var itemIndex = __buildItemIndex();
    if (itemIndex) {
      __listen();
    }

    function __buildItemIndex(){

      var itemIndexAttempt = new __ItemIndex( movingTile, scrubber );
      var _ok = itemIndexAttempt.execute();
      if (_ok) {
        return itemIndexAttempt;
      }
    }

    var killable;
    function __listen(){

      killable = Draggable.create( movingTile, {
        bounds: listElem,
        onPress: __onPress,
        onDragStart: __onDragStart,
        onDrag: __onDrag,
        onRelease: __onRelease,
        zIndexBoost: false
      })[ 0 ];
    }


    var movingItem;
    var pointerToScrubberCenterDelta;  // a few pixels
    var scrubberCenterWaypoint;

    function __onPress() {

      movingItem = itemIndex.movingItem();

      var scrubberCenterY = movingItem.scrubberCenterY();
      scrubberCenterWaypoint = scrubberCenterY;
      pointerToScrubberCenterDelta = scrubberCenterY - this.pointerY;
      reestablishThresholds();

      movingItem.whenPress();
    }

    function __onDragStart() {
    }

    var checkUpperThreshold, checkLowerThreshold, scrubberCenterY;
    function __onDrag() {

      scrubberCenterY = this.pointerY + pointerToScrubberCenterDelta;

      if (scrubberCenterWaypoint > scrubberCenterY) {

        checkUpperThreshold();
      } else if (scrubberCenterWaypoint < scrubberCenterY) {

        checkLowerThreshold();
      }
    }

    function __onRelease(){

      stopListening(); 
      movingItem.snapToIntendedLocation();  
    }

    function reestablishThresholds() {

      var prevItem = movingItem.previousItem();
      var nextItem = movingItem.nextItem();

      if (prevItem) {

        var aboveTileCenterY = prevItem.tileCenterY();

        checkUpperThreshold = function() {

          if (aboveTileCenterY >= scrubberCenterY) {
            whenBreached( true );
          }
        }
      } else {
        checkUpperThreshold = whenNoThreshold;
      }

      if (nextItem) {

        var belowTileCenterY = nextItem.tileCenterY();

        checkLowerThreshold = function() {

          if ( belowTileCenterY <= scrubberCenterY ) {
            whenBreached( false );
          }
        }
      } else {
        checkLowerThreshold = whenNoThreshold;
      }

      if (debug) {
        var a = [];
        if (prevItem) {
          a.push( "upper t.h: " + aboveTileCenterY );
        } else {
          a.push( "no upper t.h." );
        }
        if (nextItem) {
          a.push( "lower t.h: " + belowTileCenterY );
        } else {
          a.push( "no lower t.h." );
        }
        console.log( a.join(' ') );
      }
    }

    function whenNoThreshold(){}

    function whenBreached( isUpper ) {

      var _ok = __reorder( isUpper, scrubberCenterY, itemIndex );
      if (_ok) {
        scrubberCenterWaypoint = movingItem.tileCenterY();
        reestablishThresholds();
      } else {
        error( "reordering not ok?" );
        stopListening();
      }
    }

    function stopListening() {
      killable.kill();
    }
  }


  function __reorder( breachedUpper, scrubberCenterY, itemIndex ) {

    var items = itemIndex.items;

    var movingItem = itemIndex.movingItem();

    var originalTopItem, originalBottomItem;

    var newOrder, origOrder;

    __determineNewOrder();

    __correctLinks();

    var _ok = __calculateNewTopsAndAnimate( newOrder, origOrder, itemIndex );

    return _ok;

    function __correctLinks() {

      var anyStationaryUpper = originalTopItem.previousItem();
      var anyStationaryLower = originalBottomItem.nextItem();
      var next, rest;

      var body = streamViaMap( streamViaArray( newOrder ), function( id ) {
        return items[ id ];
      });

      if (anyStationaryLower) {
        rest = function() {
          var x = body();
          if (x) {
            return x;
          } else {
            next = function(){ return null; };
            return anyStationaryLower;
          }
        }
      } else {
        rest = body;
      }

      if (anyStationaryUpper) {
        next = function() {
          next = rest;
          return anyStationaryUpper;
        };
      } else {
        next = rest;
      }

      var first = next();


      if (!anyStationaryUpper) {
        first.previousItemIdentifier = null;
        itemIndex.identifierOfHeadItem = first.id;
      }


      var prev = first;
      var curr = next();


      do {
        prev.twoWayJoinToNext( curr );
        prev = curr;
        curr = next();
      } while (curr);

     

      if (!anyStationaryLower) {
        prev.nextItemIdentifier = null;
      }

    }

    function __determineNewOrder() {

      var a = [];
      var a_, next, yes;

      var origOrd = [];

      var curr = movingItem;

      if (breachedUpper) {
        a.push( movingItem.id ); 

        a_ = [];  

        next = function() {
          curr = curr.previousItem();
          return curr;
        };

        yes = function( item ) {

          return scrubberCenterY <= item.tileCenterY();
        };

        originalBottomItem = movingItem;

      } else {


        a_ = a;  

        next = function() {
          origOrd.push( curr.id );  // tricky
          curr = curr.nextItem();
          return curr;
        };
        yes = function( item ) {
    
          return scrubberCenterY >= item.tileCenterY();
        };
        originalTopItem = movingItem;
      }

      var item;
      while (item = next()) {
        if ( yes( item ) ) {
          a_.push( item.id );
        } else {
          break;
        }
      }

      if (breachedUpper) {

        originalTopItem = items[ a_[ a_.length - 1 ] ];

        var i = a_.length;
        while (i--) {
          var d = a_[ i ];
          a.push( d );
          origOrd.push( d );
        }

        origOrd.push( movingItem.id );
      } else {

        originalBottomItem = items[ a[ a.length - 1 ] ];

        a.push( movingItem.id );
      }

      newOrder = a;
      origOrder = origOrd;
    }  
  }  

  function __calculateNewTopsAndAnimate( newOrd, oldOrd, idx ) {


    var items = idx.items;

    function f( d ) { return items[ d ]; }

    var next = streamViaMap( streamViaArray( oldOrd ), f );
    var gutters = [];

    var prev = next();
    var curr = next();
    var origFirst = prev;
    do {

      gutters.push( curr.cachedTop - ( prev.cachedTop + prev.height() ) );

      prev = curr;
      curr = next();
    } while (curr);

    var nextGutter = streamViaArray( gutters );
    next = streamViaMap( streamViaArray( newOrd ), f );

    prev = next();  
    curr = next();

    prev.prevTop = prev.cachedTop;
    prev.cachedTop = origFirst.cachedTop;  
    prev.whenNewTop();

    do {

      curr.prevTop = curr.cachedTop;
      curr.cachedTop = prev.cachedTop + prev.height() + nextGutter();

      curr.whenNewTop();  
      prev = curr;
      curr = next();
    } while (curr);

    return ACHIEVED;
  }

  function __animationMethods( o ) {

    o.whenPress = function() {

      var el = this.element();
      var tl = new TimelineLite();

      this.topBeforeDrag = this.cachedTop;

      this.hacky_original_Y_transform =
        __Y_transform_of( el.css( 'transform' ) );

      tl.to( el, 0, { zIndex: 1 } );


      tl.to( el,  __moment, {
        autoAlpha: 0.75,
        boxShadow: __shadow2,
        scale : 0.95,
      });

      this._playAsOnlyTimeline( tl );
    };

    o.snapToIntendedLocation = function() {

      var orig_Y_transform = this.hacky_original_Y_transform

      if ( false === orig_Y_transform ) {

        error( "fix me - no original Y transform value available." );

      } else {

        var el = this.element();
        var tl = new TimelineLite();

        var _cleanDelta = this.cachedTop - this.topBeforeDrag;
        var _intended_Y_transform = orig_Y_transform + _cleanDelta;

        // to the converse of the above - move it back etc.

        tl.to( el, waltz, {
          autoAlpha: 1, // 0.75,
          boxShadow: 'none', // __shadow2,
          scale : 1,  //0.95,
          x: 0,
          y: _intended_Y_transform,
        });

        tl.to( el, 0, {
          zIndex: 0
        });

        this._playAsOnlyTimeline( tl );
      }
    };

    o.whenNewTop = function() {

      if ( this.timeline ) {
        this._stopExistingTimeline();
        var _currentTop = this.element().position().top;
        var delta = this.cachedTop - _currentTop;
      } else {
        delta = this.cachedTop - this.prevTop;
      }

      var tl = new TimelineLite();

      var _s = __relativePixelsStringViaDelta( delta );

      tl.to( this.element(), waltz, {
        y: _s
      });

      this._playAsOnlyTimeline( tl );
    };

    o._playAsOnlyTimeline = function( tl ) {

      if ( this.timeline ) {
        this._stopExistingTimeline();
      }

      this.timeline = tl;

      var me = this;
      tl.eventCallback( "onComplete", function() {
        me.timeline = null;
      });

      tl.play();
    };

    o._stopExistingTimeline = function() {

      this.timeline.pause();  // there is no stop() for tweens..
      this.timeline = null;
    };

    var __Y_transform_of = __buildMatrixMatcher( 5 );

    function __buildMatrixMatcher( d ) {

      var f = function( s ) {
        f = __buildMatcher( d, 'matrix' );
        return f( s );
      };
      return function( s ) {
        return f( s );
      };
    }

    function __buildMatcher( d, termString ) {

      var rx = __buildRegExp( d, termString );

      return function( s ) {
        var md = rx.exec( s );
        if (md) {
          return Number( md[ 1 ] );
        } else {
          return false;
        }
      };
    }

    function __buildRegExp( d, s ) {

      var a = [ '^' + s + '\\(' ];
      var a_ = [];
      if ( 0 < d ) {
        var i = d;
        while (i--) {
          a_.push( numberRxs );
        }
      }

      a_.push( '(' + numberRxs + ')' );

      var d_ = 5 - d;
      if ( 0 < d_ ) {
        i = d_;
        while (i--) {
          a_.push( numberRxs );
        }
      }

      a.push( optionalSpaceRxs );
      a.push( a_.join( ',[ ]*' ) );
      a.push( optionalSpaceRxs );

      a.push( '\\)$' );

      return RegExp( a.join( '' ) );
    }

    var numberRxs = '-?\\d+(?:\\.\\d+)?(?:e-?\\d+)?';
    var optionalSpaceRxs = '[ ]*';

  };

  function __relativePixelsStringViaDelta( delta ) {

    if ( 0 > delta ) {
      return '-=' + ( -1 * delta ) + 'px';
    } else {
      return '+=' + ( delta ) + 'px';
    }
  }

 /* # "model" section - for modeling the items
  */

  function __ItemIndex( movingTile, scrubber ) {

    // items, identifierOfHeadItem, identifierOfMovingItem

    this.execute = function() {

      var ok = __catalogItems( this, movingTile, scrubber );
      ok && ( ok = __sortAndLinkItems( this ) );
      ok && debug && console.log( this.description() );
      this.execute = null;
      return ok;
    };

    Object.setPrototypeOf( this, __ItemIndexMethods );
  }

  var __ItemIndexMethods = {

    description: function() {
      var a = []
      var curr = this.headItem();
      while (curr) {
        a.push( curr.description() );
        curr = curr.nextItem();
      }
      return '(' + a.join( ',' ) + ')'
    },

    headItem: function() {
      return this.items[ this.identifierOfHeadItem ];
    },

    movingItem: function() {
      return this.items[ this.identifierOfMovingItem ];
    }
  };

  function __catalogItems( results, movingTile, scrubber ) {

    // we store values that we consider to be "immutable" (in some regard)
    // separate from mutable, in case that ends up becoming useful..

    var mutables = [];  // elements are struct-like
    var immutables = [];  // parallel with above, elements are object-like

    var moving_DOM_element = movingTile[ 0 ];
    var next = streamViaArray( listElem.children() );

    var itemPrototype = {  // defined here because closes around above

      description: __describeItemMethod,

      tileCenterY: function() {
        return this.cachedTop + immutables[ this.id ].radius;
      },

      radius: function() {
        return immutables[ this.id ].radius;
      },

      height: function() {
        return immutables[ this.id ].height;
      },

      element: function() {
        return immutables[ this.id ].element;
      }
    };

    function __lookup( id ) {
      if ( null == id ) {
        return null;
      } else {
        return mutables[ id ];
      }
    }

    __linkedListMethods( itemPrototype, __lookup );
    __animationMethods( itemPrototype );

    var identifierOfMovingItem = null;

    // catalog each item when we don't know which is the moving item

    var tile;
    while ( tile = next() ) {

      if ( moving_DOM_element == tile ) {
        __addMovingItem();
        break;
      } else {
        addNonMovingItem();
      }
    }

    // because we've found the moving item we don't have to look for it.

    while ( tile = next() ) {
      addNonMovingItem();
    }

    function __addMovingItem() {

      var d = beginItem();
      immutables[ d ].element = movingTile;
      finishItem( d );
      var item = mutables[ d ]

      var __scrubberCenterDepthInItem_ = __scrubberCenterDepthInItem( item );
      item.scrubberCenterY = function() {
        return item.cachedTop + __scrubberCenterDepthInItem_;
      };

      item.whenNewTop = function() {
        // the tile being dragged does nothing with the
        // notification of a new top *at this point*.
      }

      identifierOfMovingItem = d;
    }

    function __scrubberCenterDepthInItem( item ) {

     /* WARNING - what "top" means is CSS dependant - the below calcuation
        asssumes that the tiles are `position: relative`. (they must be so
        so that their z-index is honored.) when the tiles were not, the below
        reported "top" was a top in our "normal" coordinates.
      */

      var _localTop = scrubber.position().top;  // when tile is pos:relative.
      // you would have to subtract `item.cachedTop` if tile were not.

      var _ht = scrubber.height();
      return _localTop + ( _ht / 2 );
    }

    function addNonMovingItem() {

      var d = beginItem();
      immutables[ d ].element = $( tile );
      finishItem( d );
    }

    function beginItem() {

      var d = immutables.length;
      immutables[ d ] = {};
      mutables[ d ] = { id: d };
      return d;
    }

    function finishItem( d ) {

      var im = immutables[ d ];
      var mu = mutables[ d ];

      var el = im.element;

      var h = el.height();
      im.height = h;
      im.radius = h / 2;

      var top = el.position().top;
      mu.cachedTop = top;

      Object.setPrototypeOf( mu, itemPrototype );
    }

    if ( null == identifierOfMovingItem ) {
      return error( "moving item not found" );
    } else {
      results.items = mutables;
      results.identifierOfMovingItem = identifierOfMovingItem;
      return ACHIEVED;
    }
  }  // __catalogItems

  function __sortAndLinkItems( self ) {  // set identifierOfMovingItem

    var items = self.items;

    // let "a" be an array of ID's to items, sorted by cachedTop ascending.
    // we can't sort the items array itself because item indexes must persist.

    var a = mapViaStream( streamViaArray( items ), function( item ) {
      return item.id;
    });

    a.sort( function( d, d_ ){
      var top = items[ d ].cachedTop,
          top_ = items[ d_ ].cachedTop;

      if ( top < top_ ) {
        return -1;
      } else if ( top > top_ ) {
        return 1;
      } else {
        return 0;
      }
    });

    // doubly-link the items

    var next = streamViaMap( streamViaArray( a ), function( id ) {
      return items[ id ];
    });

    var headItem = next();
    if (headItem) {
      headItem.previousItemIdentifier = null;  // aesthetics
      var curr = next();
      if (curr) {
        var prev = headItem;
        do {
          prev.twoWayJoinToNext( curr );
          prev = curr;
          curr = next();
        } while (curr);
        prev.nextItemIdentifier = null;  // aesthetics
      }
    }

    if (headItem) {
      self.identifierOfHeadItem = headItem.id;
      return ACHIEVED;
    } else {
      return error( "zero items?" );
    }
  } // __sortAndLinkItems

  function __describeItemMethod() {
    return "(" + this.id + ":" + this.cachedTop + ")";
  }

  function __linkedListMethods( o, lookup ) {

    o.nextItem = function() {
      return lookup( this.nextItemIdentifier );
    };

    o.previousItem = function() {
      return lookup( this.previousItemIdentifier );
    };

    o.twoWayJoinToAnyPrevious = function( prv ) {
      if (prv) {
        prv.twoWayJoinToNext( this );
      } else {
        this.previousItemIdentifier = null;
      }
    };

    o.twoWayJoinToAnyNext = function( nxt ) {
      if (nxt) {
        this.twoWayJoinToNext( nxt );
      } else {
        this.nextItemIdentifier = null;
      }
    };

    o.twoWayJoinToNext = function( item ) {
      item.previousItemIdentifier = this.id;
      this.nextItemIdentifier = item.id;
    };
  };

  // # support - "streams": null always indicates the end of the stream

  function mapViaStream( next, f ) {

    var a = [];
    var next_ = streamViaMap( next, f );
    var curr = next_();
    while ( null !== curr ) {
      a.push( curr );
      curr = next_();
    }
    return a;
  }

  function streamViaMap( next, f ) {

    return function() {
      var curr = next();
      if ( null === curr ) {
        return null;
      } else {
        return f( curr );
      }
    };
  }

  function streamViaArray( a ) {

    var lastIndex = a.length - 1;
    var d = -1;

    return function() {
      if ( lastIndex == d ) {
        return null;
      } else {
        d += 1;
        return a[ d ];
      }
    };
  }

  // # ~

  function error( msg ) {
    console.log( msg );
    return false;
  }
}
// ABOVE is the last line of the library. below is for the codepen demo
SkylabSortableListCore( $( '#list' ) );
// end codepen demo