module.exports = CartModel = function () {
};

CartModel.prototype.sessions = [];

CartModel.prototype.cartById = function(cartId) {

    var sessionToReturn = this.sessions.find(function(session) {
        return session.cartId === cartId;
    });

    if(sessionToReturn === undefined)
        return undefined;
    else
        return sessionToReturn.cart;

};

CartModel.prototype.hasAlready = function(itemId, cartOfUser) {
    var hasAlready = cartOfUser.find(function(item) {
        return item.itemId === itemId;
    });

    if(hasAlready === undefined)
        return false;
    else
        return true;
};

CartModel.prototype.addQuantity = function(itemId, cartOfUser, quantity) {

    var foundItem = cartOfUser.find(function(item) {
        return item.itemId === itemId;
    });

    if(foundItem !== undefined)
        foundItem.quantity += quantity;

};

CartModel.prototype.add = function(cartId, itemId, quantity, imageUrl) {
    var cartOfUser = this.cartById(cartId);

    if(cartOfUser === undefined) {
        this.sessions.push({cartId: cartId, cart: [{itemId: itemId, quantity: quantity, imageUrl: imageUrl}]});
    } else {
        if (this.hasAlready(itemId, cartOfUser)) {
            this.addQuantity(itemId, cartOfUser, quantity);
        } else {
            cartOfUser.push({itemId: itemId, quantity: quantity, imageUrl: imageUrl});
        }
    }
};

CartModel.prototype.get = function(cartId) {

    var sessionToReturn = this.sessions.find(function(session) {
        return session.cartId === cartId;
    });

    if(sessionToReturn === undefined)
        return undefined;
    else
        return sessionToReturn.cart;

};

CartModel.prototype.put = function(cartId, itemId, quantity) {
    var cartToPutInto = this.cartById(cartId),
        itemFound = cartToPutInto.find(function(item) {
        return item.itemId === itemId;
    });

    if(itemFound !== undefined)
        itemFound.quantity = quantity;
};

CartModel.prototype.delete = function(cartId, itemId) {
    var cartToDeleteFrom = this.cartById(cartId);

    if(cartToDeleteFrom !== undefined) {
        var itemToDelete = cartToDeleteFrom.find(function(item) {
            return item.itemId === itemId;
        });

        cartToDeleteFrom.splice(cartToDeleteFrom.indexOf(itemToDelete), 1);

        return true;
    }

    return false;
};