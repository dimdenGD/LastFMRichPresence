/**
 * @name LastFMRichPresence
 * @version 0.0.1
 * @description Last.fm rich presence to show what you're listening to. Finally not just Spotify!
 * @website https://discord.gg/TBAM6T7AYc
 * @author dimden#9900 (dimden.dev)
 * @authorLink https://dimden.dev/
 * @updateUrl https://raw.githubusercontent.com/dimdenGD/LastFMRichPresence/main/LastFMRichPresence.plugin.js
 * @source https://github.com/dimdenGD/LastFMRichPresence/blob/main/LastFMRichPresence.plugin.js
 * @invite TBAM6T7AYc
 * @donate https://dimden.dev/donate/
 * @patreon https://www.patreon.com/dimdendev/
 */

// My library's code
/*
MIT License

Copyright (c) 2022 dimden

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Lot of code is taken from AutoStartRichPresence plugin, thank you friend
/*
MIT License

Copyright (c) 2018-2022 Mega-Mewthree

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

class LastFMRichPresence {
    constructor() {
        
    }
    getName() {
        return "LastFMRichPresence";
    }
    getDescription() {
        return "Last.fm presence to show what you're listening to. Finally not just Spotify!";
    }
    getVersion() {
        return "0.0.1";
    }
    getAuthor() {
        return "dimden#9900 (dimden.dev)";
    }
    start() {

    }
    stop() {

    }
}
