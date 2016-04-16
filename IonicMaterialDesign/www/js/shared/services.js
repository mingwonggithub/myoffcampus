appControllers.factory('stars', [function() {

    /**
     * Draw wrapping rectangle
     *
     * @param ctx {Object} 2d context
     * @param dim {Number}
     * @param backColor {String}
     */
    function _drawRect(ctx, dim, backColor) {
        if (!ctx) throw Error('No Canvas context found!');
        ctx.save();
        ctx.width = dim;
        ctx.height = dim;
        ctx.fillStyle = backColor;
        ctx.fillRect(0, 0, dim, dim);
        ctx.restore();
    }

    /**
     * Draw one star with certain general params
     *
     * @param empty {Boolean} Draw transparent or filled star
     * @param ctx {Object} 2d context
     * @param x {Number}
     * @param y {Number}
     * @param r {Number}
     * @param p {Number}
     * @param m {Number}
     * @param style {String} Star background color (in case of filled star)
     * @private
     */
    function _star(empty, ctx, x, y, r, p, m, style) {
        if (!ctx) throw Error('No Canvas context found!');
        ctx.save();

        if (empty) {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.fillStyle = style || 'gold';
        }

        ctx.beginPath();
        ctx.translate(x, y);
        ctx.moveTo(0, 0 - r);
        for (var i = 0; i < p; i++) {
            ctx.rotate(Math.PI / p);
            ctx.lineTo(0, 0 - (r * m));
            ctx.rotate(Math.PI / p);
            ctx.lineTo(0, 0 - r);
        }
        ctx.fill();
        ctx.restore();
    }

    // Draw one empty star
    function emptyStar(ctx, r, rectBackColor) {
        _drawRect(ctx, r * 2, rectBackColor);
        _star(true, ctx, r, r, r, 5, 0.5);
    }

    // Draw one filled star
    function filledStar(ctx, r, rectBackColor, style) {
        _drawRect(ctx, r * 2, rectBackColor);
        _star(false, ctx, r, r, r, 5, 0.5, style);
    }

    // Current API
    return {
        emptyStar: emptyStar
    }
}]);

appControllers.factory('starsUtility', [function() {
    /**
     * Creates an array with index values
     *
     * @param n {Number}
     * @returns {Array}
     */
    var createRange = function(n) {
        var i = 0;
        var range = new Array(n);
        while (i < n) {
            range[i++] = i;
        }
        return range;
    };

    /**
     * Calculate percent of area to filled with color star
     *
     * @param attrs {Object}
     * @returns {Number}
     */
    var calculatePercent = function(attrs) {
        var percent, stars, selectedStars;
        if (!attrs) {
            return 0;
        } else if (attrs.ratingPercent) {
          console.log('calculateperce', attrs.ratingPercent);
            percent = parseInt(attrs.ratingPercent) ? parseInt(attrs.ratingPercent) : 0;
            return percent > 100 ? 100 : percent;
        } else if (attrs.ratingStars) {
            stars = parseInt(attrs.stars || 5);
            selectedStars = parseFloat(attrs.ratingStars) > stars ? stars : parseFloat(attrs.ratingStars);
            return (100 / stars) * selectedStars || 0.0;
        }
    };

    /**
     * Calculate how many stars should be filled (in percent)
     *
     * @param totalStars
     * @param totalWidth
     * @param starWidth
     * @param width
     * @returns {number}
     */
    var percentFullStars = function(totalStars, totalWidth, starWidth, width) {
        var pxPerOneStar = totalWidth / totalStars;
        var percentPerOneStar = 100 / totalStars;
        return Math.ceil(width / pxPerOneStar) * percentPerOneStar;
    };

    /**
     * Calculate stars in percents
     *
     * @param totalStars
     * @param percent
     * @param precision
     * @returns {string}
     */
    var starsByPercent = function(totalStars, percent, precision) {
        var percentPerOneStar = 100 / totalStars;
        return (percent / percentPerOneStar).toFixed(precision || 2);
    };


    return {
        createRange: createRange,
        calculatePercent: calculatePercent,
        percentFullStars: percentFullStars,
        starsByPercent: starsByPercent
    };
}]);