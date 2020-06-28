ep_small_list
=============

A small script for [etherpad-lite](https://github.com/ether/etherpad-lite) which adds all pads to the index page.

## Installation
```console
npm install ep_small_list
```
Restart your etherpad-lite instance to recognice new addon.

## Configuration

The plugin works without configuration. But there are several configuration settings available. In your `settings.json`, add:

### Limit number of entries

```json
    "ep_small_list": {
        "limit": 10
    }
```

By default the number of entries is not limited ("limit": 0).

### Sort by last change

```json
    "ep_small_list": {
        "sortmode": "lastchange"
    }
```

Default is to sort by creation ("creation").

### Reverse order

```json
    "ep_small_list": {
        "order": "reverse"
    }
```

Default order is "normal".


## Features
* Supports [ep\_set\_title\_on\_pad](https://github.com/JohnMcLear/ep_set_title_on_pad)

