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
    var pointerToScrubberCenterDelta; 
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

      // if the block of rearrangement is anchored to the beginning:

      if (!anyStationaryUpper) {
        first.previousItemIdentifier = null;
        itemIndex.identifierOfHeadItem = first.id;
      }

      // breaches always involve at last two items

      var prev = first;
      var curr = next();

      // correct each joint from top to bottom

      do {
        prev.twoWayJoinToNext( curr );
        prev = curr;
        curr = next();
      } while (curr);

      // if the block of rearrangement is anchored to the end:

      if (!anyStationaryLower) {
        prev.nextItemIdentifier = null;
      }

      // (otherwiswe whatever item used to follow it still follows it)
    }

    function __determineNewOrder() {

      var a = [];
      var a_, next, yes;

      var origOrd = [];

      var curr = movingItem;

      if (breachedUpper) {  // if you breached the upper threshold
        a.push( movingItem.id );  // then first item (new order) is the moving item

        // you will go backwards over each previously above item of the moved
        // item until you find one that was not passed over by the move.

        // because we are going backwards (upwards), we will need to reverse
        // these items when they are done so they are top-down.

        a_ = [];  // a temp array that will be reversed

        next = function() {
          curr = curr.previousItem();
          return curr;
        };

        yes = function( item ) {
          // the item should be displaced if its vert center is below scrubber
          return scrubberCenterY <= item.tileCenterY();
        };

        originalBottomItem = movingItem;

      } else {

        // since you breached the lower threshold, we will test each next item
        // that used to be below the moving piece in order until we find one we
        // didn't pass over.

        a_ = a;  // there is no temp array. write directly to target destination

        next = function() {
          origOrd.push( curr.id );  // tricky
          curr = curr.nextItem();
          return curr;
        };
        yes = function( item ) {
          // the item should be displaced if its vert center is above scrubber
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

        // the temp array is in reverse order of the desired order.
        // effectively reverse then concat the tmp ary onto destination ary.

        var i = a_.length;
        while (i--) {
          var d = a_[ i ];
          a.push( d );
          origOrd.push( d );
        }

        origOrd.push( movingItem.id );
      } else {

        originalBottomItem = items[ a[ a.length - 1 ] ];

        // when you breached lower, moving item is always the last item

        a.push( movingItem.id );
      }

      newOrder = a;
      origOrder = origOrd;
    }  // __determineNewOrder
  }  // __reorder

  function __calculateNewTopsAndAnimate( newOrd, oldOrd, idx ) {

   /* calculate and apply a new "top" for every displaced tile (including
      the tile that was dragged). using their intended final positions, we
      calculate these new tops from the topmost moved tile downwards, using
      appropriate addition at each step, taking into account each relevant
      height of the above tile and previous "gutter" as necessary.
    */

    var items = idx.items;

    function f( d ) { return items[ d ]; }

    // in the old order for N rearranged tiles, calculate a cached array of
    // N-1 "gutters" (the space between adjacent tiles). we do this in a
    // separate pass because we have to access the old tops.

    var next = streamViaMap( streamViaArray( oldOrd ), f );
    var gutters = [];

    var prev = next();  // orig top
    var curr = next();
    var origFirst = prev;
    do {

      gutters.push( curr.cachedTop - ( prev.cachedTop + prev.height() ) );

      prev = curr;
      curr = next();
    } while (curr);

    var nextGutter = streamViaArray( gutters );
    next = streamViaMap( streamViaArray( newOrd ), f );

    prev = next();  // new top
    curr = next();

    prev.prevTop = prev.cachedTop;
    prev.cachedTop = origFirst.cachedTop;  // let this be the last old top we use
    prev.whenNewTop();

    do {

      curr.prevTop = curr.cachedTop;
      curr.cachedTop = prev.cachedTop + prev.height() + nextGutter();

      curr.whenNewTop();  // animate now (but you could do it later instead)

      prev = curr;
      curr = next();
    } while (curr);

    return ACHIEVED;
  }

 /* # "animation" section

    ## conventions introduced:

    • "method" names with only a single leading underscore are private
      to the structure they are defined in.
  */

  function __animationMethods( o ) {

    o.whenPress = function() {

      // intended for the tile that is probably about to be dragged.

      var el = this.element();
      var tl = new TimelineLite();

      this.topBeforeDrag = this.cachedTop;

      this.hacky_original_Y_transform =
        __Y_transform_of( el.css( 'transform' ) );

      // "click" into the closer z-index before you tween

      tl.to( el, 0, { zIndex: 1 } );

      // tween to be slightly transparent and sligtly smaller, and with shadow

      tl.to( el,  __moment, {
        autoAlpha: 0.75,
        boxShadow: __shadow2,
        scale : 0.95,
      });

      this._playAsOnlyTimeline( tl );
    };

    o.snapToIntendedLocation = function() {

     /* the converse of the above method. the item has stopped moving now.
        it could be anywhere. get it from where it is to where it needs to be.

        ## the drift problem <a name='the-drift-problem'></a>

        EEK: bear in mind that the tile is now "anywhere" the user dragged
        it to, and it needs to go to its intended location. since this tile
        is by default "shrunken" (has a scale tranform on it), jQuery's
        `position()` method will (reasonably) take this scale into account
        when calculating the `position()`. (the "top" of a shrunken element
        will be a larger Y value than if the element were full-size, all
        other aspects being equal.)

        however, we are transforming it back to normal size as we move it.
        hence we don't want the scale tranform of the element to interfere
        with us getting a "pure" reading of this imaginary normal top hence
        we can't use jQuery's `position()` method. SO:

        1) we memoize what the Y transform was on the tile right before
           we started dragging it.

        2) take the Y value delta between where it used to be (before we
           started dragging it) and its intended location now (not where
           it actually is).

        3) apply this delta to the Y transform from (1) (with our code), then
           you have the *absolute* (not relative) transform necessary to move
           this piece to its intended location (right?).

        this sounds complicated, but without this accomodation we have a very
        real "drift" problem with each drag session, of by about 2.5% of the
        height of the moving tile.
      */

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

        // once it is back in place, bump the z-index down to zero so that
        // when future tiles are dragged over this one, that tile is closer

        tl.to( el, 0, {
          zIndex: 0
        });

        this._playAsOnlyTimeline( tl );
      }
    };

    o.whenNewTop = function() {

     /* this default implementation is intended for those tiles that are
        displaced but are not the tile being dragged. note that they may be
        in the middle of an existing animation when this message is received.
        note too that they may have existing transforms on them from previous
        moves, which is why we send the translation in relative terms.
     */

      // don't incur the cost of calculating the real top unless you have to..

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

   /* ### parse our own CSS :(

      (see [the drift problem] (#the-drift-problem))
    */

    // matrix( scale skew rotate alpha X Y )

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