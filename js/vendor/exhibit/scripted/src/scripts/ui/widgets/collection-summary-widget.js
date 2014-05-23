/**
 * @fileOverview Collection summary information
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.CollectionSummaryWidget = function(containerElmt, uiContext) {
    this._exhibit = uiContext.getMain();
    this._collection = uiContext.getCollection();
    this._uiContext = uiContext;
    this._div = containerElmt;

    var widget = this;
    this._onItemsChanged = function() {
        widget._reconstruct();
    };
    Exhibit.jQuery(this._collection.getElement()).bind(
        "onItemsChanged.exhibit",
        this._onItemsChanged
    );
};

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.CollectionSummaryWidget}
 */
Exhibit.CollectionSummaryWidget.create = function(configuration, containerElmt, uiContext) {
    var widget = new Exhibit.CollectionSummaryWidget(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    widget._initializeUI();
    return widget;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.CollectionSummaryWidget}
 */
Exhibit.CollectionSummaryWidget.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var widget = new Exhibit.CollectionSummaryWidget(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt : configElmt, 
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    widget._initializeUI();
    return widget;
};

/**
 *
 */
Exhibit.CollectionSummaryWidget.prototype.dispose = function() {
    Exhibit.jQuery(this._uiContext.getCollection().getElement()).unbind(
        "onItemsChanged.exhibit",
        this._onItemsChanged
    );
    Exhibit.jQuery(this._div).empty();
    
    this._noResultsDom = null;
    this._allResultsDom = null;
    this._filteredResultsDom = null;
    this._div = null;
    this._collection = null;
    this._exhibit = null;
};

/**
 *
 */
Exhibit.CollectionSummaryWidget.prototype._initializeUI = function() {
    var self, onClearFilters;
    self = this;
    
    onClearFilters = function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        self._resetCollection();
    };

    Exhibit.jQuery(this._div).hide();
    this._allResultsDom = Exhibit.jQuery.simileDOM(
        "string",
        "span",
        Exhibit._("%widget.collectionSummary.allResultsTemplate", "exhibit-collectionSummaryWidget-results")
    );
    this._filteredResultsDom = Exhibit.jQuery.simileDOM(
        "string", 
        "span",
        Exhibit._("%widget.collectionSummary.filteredResultsTemplate", "exhibit-collectionSummaryWidget-results"),
        {   resetActionLink: Exhibit.UI.makeActionLink(Exhibit._("%widget.collectionSummary.resetFiltersLabel"), onClearFilters)
        }
    );
    this._noResultsDom = Exhibit.jQuery.simileDOM(
        "string",
        "span",
        Exhibit._("%widget.collectionSummary.noResultsTemplate", "exhibit-collectionSummaryWidget-results", "exhibit-collectionSummaryWidget-count"),
        {   resetActionLink: Exhibit.UI.makeActionLink(Exhibit._("%widget.collectionSummary.resetFiltersLabel"), onClearFilters)
        }
    );
    Exhibit.jQuery(this._div).append(this._allResultsDom.elmt);
    Exhibit.jQuery(this._div).append(this._filteredResultsDom.elmt);
    Exhibit.jQuery(this._div).append(this._noResultsDom.elmt);
    this._reconstruct();
};

/**
 *
 */
Exhibit.CollectionSummaryWidget.prototype._reconstruct = function() {
    var originalSize, currentSize, database, dom, typeIDs, typeID, description;
    originalSize = this._collection.countAllItems();
    currentSize = this._collection.countRestrictedItems();
    database = this._uiContext.getDatabase();
    dom = this._dom;

    Exhibit.jQuery(this._div).hide();
    Exhibit.jQuery(this._allResultsDom.elmt).hide();
    Exhibit.jQuery(this._filteredResultsDom.elmt).hide();
    Exhibit.jQuery(this._noResultsDom.elmt).hide();
    
    if (originalSize > 0) {
        if (currentSize === 0) {
            Exhibit.jQuery(this._noResultsDom.elmt).show();
        } else {
            typeIDs = database.getTypeIDs(this._collection.readRestrictedItems()).toArray();
            typeID = typeIDs.length === 1 ? typeIDs[0] : "Item";
            
            description = 
                database.labelItemsOfType(currentSize, typeID, "exhibit-collectionSummaryWidget-count");
            
            if (currentSize === originalSize) {
                Exhibit.jQuery(this._allResultsDom.elmt).show();
                Exhibit.jQuery(this._allResultsDom.resultDescription).empty();
                Exhibit.jQuery(this._allResultsDom.resultDescription).append(description);
            } else {
                Exhibit.jQuery(this._filteredResultsDom.elmt).show();
                Exhibit.jQuery(this._filteredResultsDom.resultDescription).empty();
                Exhibit.jQuery(this._filteredResultsDom.resultDescription).append(description);
                Exhibit.jQuery(this._filteredResultsDom.originalCountSpan).html(originalSize);
            }
        }
    }

    Exhibit.jQuery(this._div).show();
};

/**
 *
 */
Exhibit.CollectionSummaryWidget.prototype._resetCollection = function() {
    var state, collection;
    collection = this._collection;

    Exhibit.jQuery(this._collection.getElement()).trigger("onResetAllFilters.exhibit");
    state = this._collection.clearAllRestrictions();

    Exhibit.History.pushState(
        state.data,
        Exhibit._("%widget.collectionSummary.resetActionTitle")
    );
};
