/**
 * @name LastFMRichPresence
 * @version 1.0.4
 * @description Last.fm rich presence to show what you're listening to. Finally not just Spotify!
 * @website https://discord.gg/TBAM6T7AYc
 * @author dimden#9999 (dimden.dev), dzshn#1312 (dzshn.xyz)
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

/*
* Copyright (c) 2022 Sofia Lima
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const ClientID = "1052565934088405062";

function isURL(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

class LastFMRichPresence {
    constructor() {
        this.initialized = false;
        this.settings = {};
        this.trackData = {};
        this.paused = false;
        this.startPlaying = Date.now();
        this.updateDataInterval = 0;
        this.rpc = {};

        let filter = BdApi.Webpack.Filters.byStrings("getAssetImage: size must === [number, number] for Twitch");
        let assetManager = BdApi.Webpack.getModule(m => typeof m === "object" && Object.values(m).some(filter));
        let getAsset;
        for (const key in assetManager) {
            const member = assetManager[key];
            if (member.toString().includes("apply(")) {
                getAsset = member;
                break;
            }
        }
        this.getAsset = async key => {
            return (await getAsset(ClientID, [key, undefined]))[0];
        };
    }
    getName() {
        return "LastFMRichPresence";
    }
    getDescription() {
        return "Last.fm presence to show what you're listening to. Finally not just Spotify!";
    }
    getVersion() {
        return "1.0.4";
    }
    getAuthor() {
        return "dimden#9999 (dimden.dev), dzshn#1312 (dzshn.xyz)";
    }
    async start() {
        this.initialize();
    }
    initialize() {
        console.log("Starting LastFMRichPresence");
        BdApi.showToast("LastFMRichPresence has started!");
        this.updateDataInterval = setInterval(() => this.updateData(), 20000); // i hope 20 seconds is enough
        this.settings = BdApi.loadData("LastFMRichPresence", "settings") || {};
        this.getLocalPresence = BdApi.findModuleByProps("getLocalPresence").getLocalPresence;
        this.rpc = BdApi.findModuleByProps("dispatch", "_subscriptions");
        this.rpcClientInfo = {};
        this.discordSetActivityHandler = null;
        this.paused = false;
        if (this.settings.lastFMKey && this.settings.lastFMNickname) {
            this.updateRichPresence();
        }
        this.initialized = true;
        this.request = require("request");
    }
    async stop() {
        clearInterval(this.updateDataInterval);
        this.updateDataInterval = 0;
        this.trackData = {};
        this.pause();
        this.initialized = false;
        BdApi.showToast("LastFMRichPresence is stopping!");
    }
    getSettingsPanel() {
        if (!this.initialized) return;
        this.settings = BdApi.loadData("LastFMRichPresence", "settings") || {};
        const panel = document.createElement("form");
        panel.classList.add("form");
        panel.style.setProperty("width", "100%");
        if (this.initialized) this.generateSettings(panel);
        return panel;
    }
    async updateData() {
        if (!this.initialized || !this.settings.lastFMKey || !this.settings.lastFMNickname) return;

        if(this.settings.disableWhenSpotify) {
            const activities = this.getLocalPresence().activities;
            if(activities.find(a => a.name === "Spotify")) {
                return;
            }
        }

        try {
            await this.getLastFmData();
        } catch (e) {
            console.error(e);
            return;
        }
    }
    getLastFmData() {
        return new Promise((resolve, reject) => {
            if (!this.settings.lastFMKey || !this.settings.lastFMNickname) {
                reject("No last.fm API key or username set");
                return;
            }
            this.request.get(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${this.settings.lastFMNickname}&api_key=${this.settings.lastFMKey}&format=json`, async (error, response, body) => {
                if(error) {
                    console.error(error);
                    return reject("Last.fm returned error.");
                }
                let res;
                try {
                    res = JSON.parse(body);
                } catch (e) {
                    return reject(e);
                }
                let trackData = res.recenttracks?.track?.[0];
                if (!trackData) return reject("Error getting track");
                trackData.youtubeUrl = this.trackData?.youtubeUrl;
                if (trackData.name !== this.trackData?.name) {
                    this.startPlaying = Date.now() - 10000;
                    trackData.youtubeUrl = await new Promise((resolve, reject) => {
                        // try getting youtube url
                        this.request.get(trackData.url, (error, response, body) => {
                            if (error) return resolve(undefined);
                            let match = body.match(/data-youtube-url="(.*?)"/)?.[1];
                            resolve(match);
                        });
                    });
                    if(!trackData.youtubeUrl && this.settings.soundcloudKey) {
                        // try getting soundcloud url
                        trackData.soundcloudUrl = await new Promise((resolve, reject) => {
                            this.request.get({
                                url: encodeURI(`https://api-v2.soundcloud.com/search?q=${(trackData?.album?.['#text'] ? `${trackData?.artist?.['#text']} - ${trackData?.album?.['#text']}` : trackData?.artist?.['#text'])} - ${trackData.name}&facet=model&limit=1&offset=0&linked_partitioning=1&app_version=1657010671&app_locale=en`),
                                headers: {
                                    Authorization: this.settings?.soundcloudKey?.startsWith("OAuth ") ? this.settings?.soundcloudKey : `OAuth ${this.settings?.soundcloudKey}`
                                }
                            }, (error, response, body) => {
                                if (error) return resolve(undefined);
                                try {
                                    body = JSON.parse(body);
                                } catch (e) {
                                    return resolve(undefined);
                                }
                                if(!body.collection || body.collection?.length === 0) return resolve(undefined);
                                let coll = body.collection[0];
                                if(coll.kind === "track") {
                                    if(coll.title.includes(trackData.name)) {
                                        resolve(coll.permalink_url);
                                    }
                                } else if(coll.kind === "playlist") {
                                    let tracks = coll.tracks;
                                    for(let i = 0; i < tracks.length; i++) {
                                        if(tracks[i].title.includes(trackData.name)) {
                                            resolve(tracks[i].permalink_url);
                                            break;
                                        }
                                    }

                                }
                                resolve(undefined);
                            });
                        });
                    }
                    setTimeout(() => this.updateRichPresence(), 50);
                }
                if (trackData?.['@attr']?.nowplaying) {
                    if (this.paused) this.resume();
                    this.trackData = trackData;
                } else {
                    this.trackData = {};
                    if (!this.paused) this.pause();
                }
                resolve(this.trackData);
            });
        })
    }
    async pause() {
        if (this.paused) return;
        this.trackData = {};
        this.paused = true;
        this.setActivity({});
    }
    getSettingsPanel() {
        this.settings = BdApi.loadData("LastFMRichPresence", "settings") || {};
        let template = document.createElement("template");
        template.innerHTML = `<div style="color: var(--header-primary);font-size: 16px;font-weight: 300;line-height: 22px;max-width: 550px;margin-top: 17px;">
<b>Last.fm key</b><br>
<span>Input your Last.fm API key. You can create it <a href="https://www.last.fm/api/account/create" target="_blank">here</a> in a minute.</span><br>
<span>To create API key write anything you want about app, you don't need to provide callback or homepage.</span><br><br>
<input class="lastfmkey inputDefault-3FGxgL input-2g-os5" placeholder="last.fm key" style="width:80%">
<br><br>
<b>Last.fm Username</b><br>
<span>Input your Last.fm username.</span><br><br>
<input class="lastfmnickname inputDefault-3FGxgL input-2g-os5" placeholder="last.fm username" style="width:80%">
<br><br>
<b>Disable RPC when Spotify is playing</b><br>
<span>Disables Rich Presence when you play music from Spotify.<br>
Useful when you want Last.fm to show when you listen to other sources but not Spotify.</span><br><br>
<select class="disablewhenspotify inputDefault-3FGxgL input-2g-os5" style="width:80%">
    <option value="false">OFF</option>
    <option value="true">ON</option>
</select>
<br><br>
<b>Soundcloud Button</b> (OPTIONAL)<br>
Show 'Listen on Soundcloud' button in the RP when listening from Soundcloud.<br>
Please visit <a href="https://github.com/dimdenGD/LastFMRichPresence" target="_blank">homepage</a> for info about getting this field.<br><br>
<input class="soundcloudkey inputDefault-3FGxgL input-2g-os5" placeholder="Soundcloud Authorization key" style="width:80%">
</div>`;
        let keyEl = template.content.firstElementChild.getElementsByClassName('lastfmkey')[0];
        let nicknameEl = template.content.firstElementChild.getElementsByClassName('lastfmnickname')[0];
        let dwsEl = template.content.firstElementChild.getElementsByClassName('disablewhenspotify')[0];
        let soundcloudEl = template.content.firstElementChild.getElementsByClassName('soundcloudkey')[0];
        keyEl.value = this.settings.lastFMKey ?? "";
        nicknameEl.value = this.settings.lastFMNickname ?? "";
        soundcloudEl.value = this.settings.soundcloudKey ?? "";
        dwsEl.value = this.settings.disableWhenSpotify ? "true" : "false";
        let updateKey = () => {
            this.settings.lastFMKey = keyEl.value;
            this.updateSettings();
        }
        let updateNick = () => {
            this.settings.lastFMNickname = nicknameEl.value;
            this.updateSettings();
        }
        let updateSoundcloudKey = () => {
            this.settings.soundcloudKey = soundcloudEl.value;
            this.updateSettings();
        }
        keyEl.onchange = updateKey;
        keyEl.onpaste = updateKey;
        keyEl.onkeydown = updateKey;
        nicknameEl.onchange = updateNick;
        nicknameEl.onpaste = updateNick;
        nicknameEl.onkeydown = updateNick;
        soundcloudEl.onchange = updateSoundcloudKey;
        soundcloudEl.onpaste = updateSoundcloudKey;
        soundcloudEl.onkeydown = updateSoundcloudKey;
        dwsEl.onchange = () => {
            this.settings.disableWhenSpotify = dwsEl.value === "true";
            this.updateSettings();
        };

        return template.content.firstElementChild;
    }
    resume() {
        this.paused = false;
    }
    setActivity(activity) {
        let obj = activity && Object.assign(activity, { flags: 1, type: 0 });
        console.log(obj);
        this.rpc.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: obj
        });
    }
    async updateRichPresence() {
        if (this.paused || !this.trackData?.name) {
            return;
        }
        if(this.settings.disableWhenSpotify) {
            const activities = this.getLocalPresence().activities;
            if(activities.find(a => a.name === "Spotify")) {
                if(activities.find(a => a.name === "some music")) {
                    this.setActivity({});
                }
                return;
            }
        }
        let button_urls = [], buttons = [];
        if(this.trackData.url && isURL(this.trackData.url)) {
            buttons.push("Open Last.fm");
            button_urls.push(this.trackData.url);
        }
        if(this.trackData.youtubeUrl && isURL(this.trackData.youtubeUrl)) {
            buttons.push("Listen on YouTube");
            button_urls.push(this.trackData.youtubeUrl);
        }
        if(this.trackData.soundcloudUrl && isURL(this.trackData.soundcloudUrl)) {
            buttons.push("Listen on Soundcloud");
            button_urls.push(this.trackData.soundcloudUrl);
        }
        let obj = {
            application_id: ClientID,
            name: "some music",
            details: this.trackData.name,
            state: this.trackData?.album?.['#text'] ? `${this.trackData?.artist?.['#text']} - ${this.trackData?.album?.['#text']}` : this.trackData?.artist?.['#text'],
            timestamps: { start: this.startPlaying ? Math.floor(this.startPlaying / 1000) : Math.floor(Date.now() / 1000) },
            assets: {
                small_image: this.trackData.youtubeUrl ? await this.getAsset("youtube") : this.trackData.soundcloudUrl ? await this.getAsset("soundcloud") : await this.getAsset("lastfm"),
                small_text: this.trackData.youtubeUrl ? "YouTube" : this.trackData.soundcloudUrl ? "SoundCloud" : "Last.fm",
            },
            metadata: { button_urls }, buttons
        }
        if(!obj.state) obj.state = "Unknown";
        if(!obj.details) obj.details = "Undefined";
        
        if(this.trackData?.image?.[1]?.['#text']) {
            obj.assets.large_image = await this.getAsset(this.trackData?.image?.[1]?.['#text']);
            obj.assets.large_text = this.trackData.name;
        }

        this.setActivity(obj);
    }
    
    updateSettings() {
        BdApi.saveData("LastFMRichPresence", "settings", this.settings);
    }
    delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
}

module.exports = LastFMRichPresence;
