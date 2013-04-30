var reqwest = require('reqwest');


module.exports = window.L.LayerGroup.extend({
    API: 'http://api.openstreetmap.org/api/0.6/notes.json',
    icon: function(fp) {
        fp = fp || {};

        var sizes = {
                small: [20, 50],
                medium: [30, 70],
                large: [35, 90]
            },
            size = fp['marker-size'] || 'medium',
            symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '',
            color = (fp['marker-color'] || '7e7e7e').replace('#', '');

        return L.icon({
            iconUrl: 'http://a.tiles.mapbox.com/v3/marker/' +
                'pin-' + size.charAt(0) + symbol + '+' + color +
                // detect and use retina markers, which are x2 resolution
                ((L.Browser.retina) ? '@2x' : '') + '.png',
            iconSize: sizes[size],
            iconAnchor: [sizes[size][0] / 2, sizes[size][1] / 2],
            popupAnchor: [0, -sizes[size][1] / 2]
        });
    },
    onAdd: function(map) {
        this._map = map;

        this.notesLayer = L.geoJson({
            type: 'FeatureCollection',
            features: []
        }, {
            pointToLayer: L.bind(function(p) {
                var marker = L.marker([
                    p.geometry.coordinates[1],
                    p.geometry.coordinates[0]
                ], {
                    icon: this.icon(p.properties)
                });
                marker.bindPopup('<h1>' + p.properties.title + '</h1>' +
                    '<div>' +
                    p.properties.description +
                    '</div>');
                return marker;
            }, this)
        });
        this.addLayer(this.notesLayer);
        map
            .on('viewreset', this._load, this)
            .on('moveend', this._load, this);
        this._load();
    },
    boundsString: function(map) {
        var b = map.getBounds();
        var sw = b.getSouthWest();
        var ne = b.getNorthEast();
        return [sw.lng, sw.lat, ne.lng, ne.lat];
    },
    template: function(p) {
        p.title = p.date_created;
        p.description = '';
        p['marker-color'] = {
            closed: '11f',
            open: 'f11'
        }[p.status];
        p['marker-symbol'] = {
            closed: 'circle-stroked',
            open: 'circle'
        }[p.status];
        for (var i = 0; i < p.comments.length; i++) {
            p.description += p.comments[i].date +
                (p.comments[i].user || 'anon') +
                p.comments[i].html;
        }
        return p;
    },
    _load: function(map) {
        reqwest({
            url: this.API + '?bbox=' + this.boundsString(this._map),
            type: 'json',
            success: L.bind(function(resp) {
                this.notesLayer.eachLayer(L.bind(function(l) {
                    this.notesLayer.removeLayer(l);
                }, this));
                for (var i = 0; i < resp.features.length; i++) {
                    resp.features[i].properties = this.template(resp.features[i].properties);
                }
                this.notesLayer.addData(resp);
            }, this),
            error: function() { }
        });
    }
});
