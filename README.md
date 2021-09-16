# ScrollenPlus
A lightweight plugin for replacing the default scrollbars on browsers. This plugin supports both horizontal and vertical scrolling along with full support for native JS scroll API. The amazing thing about this plugin is that scroll motions are taken care of by the browser with some help from CSS, which decreases performance hits. This plugin is still being tested so, feel free to open an issue if ever come into any bugs or poor experience.

### Check the deme [here](https://codepen.io/salihkavaf/pen/ExXowqL)

## Usage
To make the scrollbar absolutely customizable, it was decided to use simple DIV element to build pieces, which requires a tiny setup on the HTML side, where the scrollable element is included within a container that also is going to include the scrollbar elements.
```HTML
<div id="container" class="scrollable">
    <div class="scroll-content">
        <!-- Your overflowing content here... -->
    </div>
</div>
```
On the JS side, it's just as simple to initialize the plugin:
```JS
const container = document.getElementById("container");
var scrln = new Scrollen(container);
```
The plugin requires yet one more step; we need to enable scrollbars on each axis. The reason for this additional step is to avoid unnecessary processing when either of the scrollbars isn't needed, which makes this step also valuable in terms of performance and speed.
```JS
scrln.enableVScroll();
scrln.enableHScroll();
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
