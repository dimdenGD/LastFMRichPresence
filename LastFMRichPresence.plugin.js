/**
 * @name LastFMRichPresence
 * @version 1.0.8
 * @description Last.fm rich presence to show what you're listening to. Finally not just Spotify!
 * @website https://discord.gg/TBAM6T7AYc
 * @author dimden, dzshn, __snaake
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

// deezer icon key: deezer

class Constants {
  static getClientID() {
    return '1052565934088405062';
  }

  static getDefaultSettings() {
    return {
      disableWhenSpotify: true,
      listeningTo: false,
      artistActivityName: false,
      lastfmButton: true,
      youtubeButton: true,
      assetIcon: true,
      artistBeforeAlbum: true,
      disableWhenActivity: false,
      userPlatform: null,
    };
  }

  static getUpdateInterval() {
    return 20000;
  }

  static getSomeLastFmSettingMissing() {
    return 'You need to set your Last.fm API key and username in the settings!';
  }
}

class AssetManager {
  static _instance = null;

  static getFromAssetManger() {
    if (!AssetManager._instance) {
      let filter = BdApi.Webpack.Filters.byStrings(
        'getAssetImage: size must === [number, number] for Twitch'
      );
      let assetManager = BdApi.Webpack.getModule(
        (m) => typeof m === 'object' && Object.values(m).some(filter)
      );
      for (const key in assetManager) {
        const member = assetManager[key];
        if (member.toString().includes('APPLICATION_ASSETS_FETCH')) {
          AssetManager._instance = member;
        }
      }
    }
    return AssetManager._instance;
  }

  static async getAsset(key) {
    return (
      await AssetManager.getFromAssetManger()(Constants.getClientID(), [
        key,
        undefined,
      ])
    )[0];
  }
}

class SettingsManager {
  static getSettings() {
    return BdApi.loadData('LastFMRichPresence', 'settings') || {};
  }

  static updateSettings(settings) {
    BdApi.saveData('LastFMRichPresence', 'settings', settings);
  }

  static initializeEmptySettings() {
    const settings = SettingsManager.getSettings();
    for (const setting of Object.keys(Constants.getDefaultSettings())) {
      if (typeof settings[setting] === 'undefined') {
        settings[setting] = Constants.getDefaultSettings()[setting];
      }
    }
    SettingsManager.updateSettings(settings);
  }
}

class RPCManager {
  static _instance = null;

  static getRPCManager() {
    if (!RPCManager._instance) {
      RPCManager._instance = BdApi.findModuleByProps(
        'dispatch',
        '_subscriptions'
      );
    }
    return RPCManager._instance;
  }

  static setActivity(activity) {
    if (activity) {
      activity = {
        ...activity,
        flags: 1,
        type: SettingsManager.getSettings().listeningTo ? 2 : 0,
      };
    }
    RPCManager.getRPCManager().dispatch({
      type: 'LOCAL_ACTIVITY_UPDATE',
      activity: activity,
    });
  }
}

class Switches {
  static async getSmallImage(trackData) {
    switch (SettingsManager.getSettings().userPlatform) {
      case 'lastfm':
        return await AssetManager.getAsset('lastfm');
      case 'youtube':
        return await AssetManager.getAsset('youtube');
      case 'soundcloud':
        return await AssetManager.getAsset('soundcloud');
      case 'deezer':
        return await AssetManager.getAsset('deezer');
    }
    // no preferred platform set
    if (trackData?.youtubeURL) {
      return await AssetManager.getAsset('youtube');
    }
    if (trackData?.soundCloudURL) {
      return await AssetManager.getAsset('soundcloud');
    }
    return await AssetManager.getAsset('lastfm');
  }

  static getPlatform(trackData) {
    switch (SettingsManager.getSettings().userPlatform) {
      case 'lastfm':
        return 'Last.fm';
      case 'youtube':
        return 'YouTube';
      case 'soundcloud':
        return 'SoundCloud';
      case 'deezer':
        return 'Deezer';
    }
    // no preferred platform set
    if (trackData?.youtubeURL) {
      return 'YouTube';
    }
    if (trackData?.soundCloudURL) {
      return 'SoundCloud';
    }
    return 'Last.fm';
  }
}

class Requests {
  static async getCurrentScrobble() {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${
        SettingsManager.getSettings().lastFMNickname
      }&api_key=${SettingsManager.getSettings().lastFMKey}&format=json`
    );
    const data = res.json();
    return data;
  }

  static async getTrackYoutubeUrl(trackUrl) {
    try {
      const res = await BdApi.Net.fetch(trackUrl);
      const text = await res.text();
      const match = text.match(/data-youtube-url="(.*?)"/)?.[1];
      if (!match) {
        throw new Error('No youtube link found');
      }
      return match;
    } catch (e) {
      console.error(e);
    }
  }

  static async getTrackSoundCloudUrl(trackData) {
    if (!trackData) return;
    try {
      const res = await fetch(
        encodeURI(
          `https://api-v2.soundcloud.com/search?q=${
            trackData.album?.['#text']
              ? `${trackData?.artist?.['#text']} - ${trackData?.album?.['#text']}`
              : trackData?.artist?.['#text']
          } - ${
            trackData.name
          }&facet=model&limit=1&offset=0&linked_partitioning=1&app_version=1657010671&app_locale=en`
        ),
        {
          headers: {
            Authorization:
              SettingsManager.getSettings()?.soundCloudKey.startsWith('OAuth ')
                ? this.settings?.soundCloudKey
                : `OAuth ${this.settings?.soundCloudKey}`,
          },
        }
      );
      const data = await res.json();
      if (data?.collection?.length === 0) {
        throw new Error('No tracks found');
      }
      let coll = data.collection[0];
      if (coll.kind === 'track') {
        if (coll.title.includes(trackData.name)) {
          return coll.permalink_url;
        }
      }
      if (coll.kind === 'playlist') {
        let tracks = coll.tracks;
        for (let i = 0; i < tracks.length; i++) {
          if (tracks[i].title.includes(trackData.name)) {
            return tracks[i].permalink_url;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

class Utilities {
  static isURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  static getButtons(trackData) {
    const settings = SettingsManager.getSettings();
    const button_urls = [],
      buttons = [];

    if (settings.lastfmButton && Utilities.isURL(trackData?.url)) {
      buttons.push('Open Last.fm');
      button_urls.push(trackData.url);
    }

    if (settings.youtubeButton && Utilities.isURL(trackData?.youtubeURL)) {
      buttons.push('Listen on YouTube');
      button_urls.push(trackData.youtubeURL);
    }

    if (trackData.soundCloudURL && Utilities.isURL(trackData?.soundCloudURL)) {
      buttons.push('Listen on Soundcloud');
      button_urls.push(trackData.soundCloudURL);
    }

    return { button_urls, buttons };
  }
}

class LastFMRichPresence {
  constructor() {
    this.settings = SettingsManager.getSettings();
    this.trackData = {};
    this.paused = false;
    this.startPlaying = Date.now();
    this.updateDataInterval = 0;
    this.timeoutPlaying;
    this.getLocalPresence =
      BdApi.findModuleByProps('getLocalPresence').getLocalPresence;
  }

  getName() {
    return 'LastFMRichPresence';
  }

  getDescription() {
    return "Last.fm presence to show what you're listening to. Finally not just Spotify!";
  }

  getVersion() {
    return '1.0.8';
  }

  getAuthor() {
    return 'dimden, dzshn, __snaake';
  }

  async start() {
    this.initialize();
  }

  initialize() {
    SettingsManager.initializeEmptySettings();
    if (!this.settings.lastFMKey || !this.settings.lastFMNickname) {
      BdApi.showToast(Constants.getSomeLastFmSettingMissing());
      return;
    }
    this.updateDataInterval = setInterval(
      () => this.updateData(),
      Constants.getUpdateInterval()
    );
  }

  resume() {
    this.paused = false;
  }

  async pause() {
    if (this.paused) return;
    this.trackData = {};
    this.paused = true;
    RPCManager.setActivity({});
  }

  async stop() {
    clearInterval(this.updateDataInterval);
    this.updateDataInterval = 0;
    this.pause();
  }

  async updateData() {
    if (this.settings.disableWhenSpotify) {
      const activities = this.getLocalPresence().activities;
      if (activities.find((a) => a.name === 'Spotify')) {
        if (
          activities.find((a) => a.application_id === Constants.getClientID())
        ) {
          RPCManager.setActivity({});
        }
        return;
      }
    }

    if (this.settings.disableWhenActivity) {
      const activities = this.getLocalPresence().activities;
      if (
        activities.filter((a) => a.application_id !== Constants.getClientID())
          .length
      ) {
        if (
          activities.find((a) => a.application_id === Constants.getClientID())
        ) {
          RPCManager.setActivity({});
        }
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

  async getLastFmData() {
    try {
      const data = await Requests.getCurrentScrobble();

      if (!data.recenttracks.track[0]) {
        throw new Error('No recent tracks found');
      }
      const track = data.recenttracks.track[0];

      if (!track) {
        throw new Error('No track found');
      }

      track.youtubeURL = await Requests.getTrackYoutubeUrl(track.url);

      if (this.settings.soundCloudKey) {
        track.soundCloudURL = await Requests.getTrackSoundCloudUrl(track);
      }

      if (track.name !== this.trackData.name) {
        this.startPlaying = Date.now();
        clearTimeout(this.timeoutPlaying);
        this.resume();
      }

      if (SettingsManager.getSettings().userPlatform === 'deezer') {
        const playedAt = new Date(track.date['#text']);
        // fix timezone
        playedAt.setHours(
          playedAt.getHours() - playedAt.getTimezoneOffset() / 60
        );
        if (Date.now() - playedAt.getTime() > 1000 * 60 * 7) {
          return;
        }

        this.trackData = track;
        this.timeoutPlaying = setTimeout(() => {
          this.pause();
        }, 1000 * 60 * 7);
      } else {
        if (track?.['@attr']?.nowplaying) {
          if (this.paused) this.resume();
          this.trackData = track;
        } else {
          this.trackData = {};
          if (!this.paused) this.pause();
        }
      }
      this.updateRichPresence();
    } catch (e) {
      console.error(e);
      return;
    }
  }

  async updateRichPresence() {
    if (this.paused || !this.trackData) {
      return;
    }

    const { button_urls, buttons } = Utilities.getButtons(this.trackData);

    const activity = {
      application_id: Constants.getClientID(),
      details: this.trackData.name,
      metadata: { button_urls },
      buttons,
    };

    if (this.settings.artistActivityName && this.trackData?.artist['#text']) {
      activity.name = this.trackData.artist['#text'];
    }

    if (this.trackData?.album['#text']) {
      activity.state = this.trackData.album['#text'];
      if (this.settings.artistBeforeAlbum && this.trackData.artist['#text']) {
        activity.state = `${this.trackData.artist['#text']} - ${activity.state}`;
      }
    }

    if (this.startPlaying) {
      activity.timestamps = {
        start: this.startPlaying,
      };
    } else {
      activity.timestamps = {
        start: Date.now(),
      };
    }

    if (this.settings.assetIcon) {
      activity.assets = {};
      activity.assets.small_image = await Switches.getSmallImage(
        this.trackData
      );
      activity.assets.small_text = Switches.getPlatform(this.trackData);
    }

    if (this.trackData?.image?.[1]['#text']) {
      activity.assets.large_image = await AssetManager.getAsset(
        this.trackData?.image[1]['#text']
      );
    }

    RPCManager.setActivity(activity);
  }

  getSettingsPanel() {
    const panel = document.createElement('form');
    panel.classList.add('form');
    panel.style.setProperty('width', '100%');
    return panel;
  }

  getSettingsPanel() {
    let template = document.createElement('template');
    template.innerHTML = `<div style="color: var(--header-primary);font-size: 16px;font-weight: 300;line-height: 22px;max-width: 550px;margin-top: 17px;">
  <b>Last.fm key</b><br>
  <span>Input your Last.fm API key. You can create it <a href="https://www.last.fm/api/account/create" target="_blank">here</a> in a minute.</span><br>
  <span>To create API key write anything you want about app, you don't need to provide callback or homepage.</span><br><br>
  <input class="lastfmkey inputDefault-Ciwd-S input-3O04eu" placeholder="last.fm key" style="width:80%">
  <br><br>
  <b>Last.fm Username</b><br>
  <span>Input your Last.fm username.</span><br><br>
  <input class="lastfmnickname inputDefault-Ciwd-S input-3O04eu" placeholder="last.fm username" style="width:80%">
  <br><br>
  <b>Disable RPC when Spotify is playing</b><br>
  <span>Disables Rich Presence when you play music from Spotify.<br>
  Useful when you want Last.fm to show when you listen to other sources but not Spotify.</span><br><br>
  <select class="disablewhenspotify inputDefault-Ciwd-S input-3O04eu" style="width:80%">
      <option value="false">OFF</option>
      <option value="true">ON</option>
  </select>
  <br><br>
  <b>Disable RPC when any other activity is detected</b><br>
  <span>Disables Rich Presence when any other activity is detected.<br>
  Useful when you only want to show your Last.fm status when you're not playing games.</span><br><br>
  <select class="disablewhenactivity inputDefault-Ciwd-S input-3O04eu" style="width:80%">
      <option value="false">OFF</option>
      <option value="true">ON</option>
  </select>
  <br><br>
  <b>Use "Listening to" instead of "Playing"</b><br>
  <span>Will show "Listening to" text in your activity, you're not really supposed to do this so it's disabled by default.</span><br><br>
  <select class="listeningto inputDefault-Ciwd-S input-3O04eu" style="width:80%">
      <option value="false">OFF</option>
      <option value="true">ON</option>
  </select>
  <br><br>
  <b>Soundcloud Button</b> (OPTIONAL)<br>
  Show 'Listen on Soundcloud' button in the RP when listening from Soundcloud.<br>
  Please visit <a href="https://github.com/dimdenGD/LastFMRichPresence" target="_blank">homepage</a> for info about getting this field.<br><br>
  <input class="soundCloudKey inputDefault-Ciwd-S input-3O04eu" placeholder="Soundcloud Authorization key" style="width:80%">
  <br><br>
  <b>Use artist name as activity name</b><br>
  <span>Displays artist name instead of the default "some music" activity name (e.g. "listening to Pink Floyd").</span><br><br>
  <select class="artistactivityname inputDefault-Ciwd-S input-3O04eu" style="width:80%">
      <option value="false">OFF</option>
      <option value="true">ON</option>
  </select>
  <br><br>
  <b>Add Last.fm button</b><br>
  <span>Adds button linking to the song's page on Last.fm.</span><br><br>
  <select class="lastfmbutton inputDefault-Ciwd-S input-3O04eu" style="width:80%">
      <option value="false">OFF</option>
      <option value="true">ON</option>
  </select>
  <br><br>
  <b>Add Youtube button</b><br>
  <span>Adds button linking to the song on YouTube.</span><br><br>
  <select class="ytbutton inputDefault-Ciwd-S input-3O04eu" style="width:80%">
      <option value="false">OFF</option>
      <option value="true">ON</option>
  </select>
  <br><br>
  <b>Show asset on cover art</b><br>
  <span>Shows asset (small icon) on cover art.</span><br><br>
  <select class="asseticon inputDefault-Ciwd-S input-3O04eu" style="width:80%">
      <option value="false">OFF</option>
      <option value="true">ON</option>
  </select>
  <br><br>
  <b>Display artist name before album name</b><br>
  <span>Shows artist name before the album name (e.g. Pink Floyd - Dark Side of the Moon).</span><br><br>
  <select class="artistbeforealbum inputDefault-Ciwd-S input-3O04eu" style="width:80%">
      <option value="false">OFF</option>
      <option value="true">ON</option>
  </select>
  <br><br>
  <b>Select your preferred platform (Fixes Deezer also)</b><br>
  <span>Shows platform image (IN PROGRESS: links the song to that platform)</span><br><br>
  <select class="userPlatform inputDefault-Ciwd-S input-3O04eu" style="width:80%">
      <option value="lastfm">Last.FM</option>
      <option value="youtube">Youtube</option>
      <option value="soundcloud">SoundCloud</option>
      <option value="deezer">Deezer</option>
  </select>
  </div>`;
    let keyEl =
      template.content.firstElementChild.getElementsByClassName('lastfmkey')[0];
    let nicknameEl =
      template.content.firstElementChild.getElementsByClassName(
        'lastfmnickname'
      )[0];
    let dwsEl =
      template.content.firstElementChild.getElementsByClassName(
        'disablewhenspotify'
      )[0];
    let listeningEl =
      template.content.firstElementChild.getElementsByClassName(
        'listeningto'
      )[0];
    let soundcloudEl =
      template.content.firstElementChild.getElementsByClassName(
        'soundCloudKey'
      )[0];
    let artistEl =
      template.content.firstElementChild.getElementsByClassName(
        'artistactivityname'
      )[0];
    let lastbtnEl =
      template.content.firstElementChild.getElementsByClassName(
        'lastfmbutton'
      )[0];
    let ytbtnEl =
      template.content.firstElementChild.getElementsByClassName('ytbutton')[0];
    let assetEl =
      template.content.firstElementChild.getElementsByClassName('asseticon')[0];
    let artistbeforeEl =
      template.content.firstElementChild.getElementsByClassName(
        'artistbeforealbum'
      )[0];
    let disableactEl =
      template.content.firstElementChild.getElementsByClassName(
        'disablewhenactivity'
      )[0];
    const userPlatformEl =
      template.content.firstElementChild.getElementsByClassName(
        'userPlatform'
      )[0];
    keyEl.value = this.settings.lastFMKey ?? '';
    nicknameEl.value = this.settings.lastFMNickname ?? '';
    soundcloudEl.value = this.settings.soundCloudKey ?? '';
    dwsEl.value = this.settings.disableWhenSpotify ? 'true' : 'false';
    listeningEl.value = this.settings.listeningTo ? 'true' : 'false';
    artistEl.value = this.settings.artistActivityName ? 'true' : 'false';
    lastbtnEl.value = this.settings.lastfmButton ? 'true' : 'false';
    ytbtnEl.value = this.settings.youtubeButton ? 'true' : 'false';
    assetEl.value = this.settings.assetIcon ? 'true' : 'false';
    artistbeforeEl.value = this.settings.artistBeforeAlbum ? 'true' : 'false';
    disableactEl.value = this.settings.disableWhenActivity ? 'true' : 'false';
    userPlatformEl.value = this.settings.userPlatform ?? 'lastfm';
    let updateKey = () => {
      this.settings.lastFMKey = keyEl.value;
      SettingsManager.updateSettings(this.settings);
    };
    let updateNick = () => {
      this.settings.lastFMNickname = nicknameEl.value;
      SettingsManager.updateSettings(this.settings);
    };
    let updateSoundcloudKey = () => {
      this.settings.soundCloudKey = soundcloudEl.value;
      SettingsManager.updateSettings(this.settings);
    };
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
      this.settings.disableWhenSpotify = dwsEl.value === 'true';
      SettingsManager.updateSettings(this.settings);
    };
    listeningEl.onchange = () => {
      this.settings.listeningTo = listeningEl.value === 'true';
      SettingsManager.updateSettings(this.settings);
    };
    artistEl.onchange = () => {
      this.settings.artistActivityName = artistEl.value === 'true';
      SettingsManager.updateSettings(this.settings);
    };
    lastbtnEl.onchange = () => {
      this.settings.lastfmButton = lastbtnEl.value === 'true';
      SettingsManager.updateSettings(this.settings);
    };
    ytbtnEl.onchange = () => {
      this.settings.youtubeButton = ytbtnEl.value === 'true';
      SettingsManager.updateSettings(this.settings);
    };
    assetEl.onchange = () => {
      this.settings.assetIcon = assetEl.value === 'true';
      SettingsManager.updateSettings(this.settings);
    };
    artistbeforeEl.onchange = () => {
      this.settings.artistBeforeAlbum = artistbeforeEl.value === 'true';
      SettingsManager.updateSettings(this.settings);
    };
    disableactEl.onchange = () => {
      this.settings.disableWhenActivity = disableactEl.value === 'true';
      SettingsManager.updateSettings(this.settings);
    };
    userPlatformEl.onchange = () => {
      this.settings.userPlatform = userPlatformEl.value;
      SettingsManager.updateSettings(this.settings);
    };
    return template.content.firstElementChild;
  }
}

module.exports = LastFMRichPresence;
