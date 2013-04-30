## leaflet osm notes

Pull notes from OpenStreetMap into Leaflet.

## example

```js
var notesLayer = new leafletOsmNotes();
notesLayer.addTo(map);
```

## api

`var notesLayer = new leafletOsmNotes()`

Makes a notes layer. You can customize the underlying `L.geoJson` instance
by its exposed `notesLayer.notesLayer` property.
