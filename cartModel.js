module.exports = CartModel = function () {
};

CartModel.prototype.sessions = [];

CartModel.prototype.cartById = function(cartId) {
    console.log(cartId)
    console.log(this.sessions)
    for(var i = 0; i < this.sessions.length; i++) {
        if(this.sessions[i].cartId === cartId)
            return this.sessions[i].cart;
    }
    return null;
};

CartModel.prototype.hasAlready = function(itemId, cartOfUser) {
    for(var i = 0; i < cartOfUser.length; i++) {
        if(cartOfUser[i].itemId === itemId) {
            return true;
        }
    }
    return false;
};

CartModel.prototype.addQuantity = function(itemId, cartOfUser, quantity) {
    for(var i = 0; i < cartOfUser.length; i++) {
        if(cartOfUser[i].itemId === itemId) {
            cartOfUser[i].quantity += quantity;
            break;
        }
    }
}

CartModel.prototype.add = function(cartId, itemId, quantity, imageUrl) {
    var cartOfUser = this.cartById(cartId);

    if(this.hasAlready(itemId, cartOfUser)){
        this.addQuantity(itemId, cartOfUser, quantity);
    } else {
        cartOfUser.push({itemId : itemId, quantity : quantity, imageUrl: imageUrl});
    }
};

CartModel.prototype.get = function(cartId) {
    for(var i = 0; i < this.sessions.length; i++) {
        if (this.sessions[i].cartId === cartId) {
            return this.sessions[i].cart;
        }
    }
    return null;
};

CartModel.prototype.put = function(cartId, itemId, quantity) {
    var cartToPutInto = this.cartById(cartId);

    for(var i = 0; i < cartToPutInto.length; i++) {
        if(cartToPutInto[i].itemId === itemId) {
            cartToPutInto[i].quantity = quantity;
            break;
        }
    }
};

CartModel.prototype.delete = function(cartId, itemId) {
    var cartToDeleteFrom = this.cartById(cartId);

    if(cartToDeleteFrom !== null) {
        for (var i = 0; i < cartToDeleteFrom.length; i++) {
            if (cartToDeleteFrom[i] === itemId) {
                cartToDeleteFrom.splice(i, 1);
                return true;
            }
        }
    }

    return false;
};