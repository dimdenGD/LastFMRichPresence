/**
 * @name LastFMRichPresence
 * @version 0.0.1
 * @description Last.fm rich presence to show what you're listening to. Finally not just Spotify! Check out the [plugin's homepage](https://github.com/dimdenGD/LastFMRichPresence/) for how to make it work.
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

const changelog = {
    title: "LastFMRichPresence Update",
    version: "0.0.1",
    changelog: [
        {
            title: "v0.0.1: Creation",
            items: [
                "Hello.",
            ]
        }
    ]
};

class LastFMRichPresence {
    constructor() {
        this.initialized = false;
        this.settings = {};
    }
    getName() {
        return "LastFMRichPresence";
    }
    getDescription() {
        return "Last.fm presence to show what you're listening to. Finally not just Spotify! Check out the [plugin's homepage](https://github.com/dimdenGD/LastFMRichPresence/) for how to make it work.";
    }
    getVersion() {
        return "0.0.1";
    }
    getAuthor() {
        return "dimden#9900 (dimden.dev)";
    }
    async start() {
        if (typeof window.ZeresPluginLibrary === "undefined") {
            try {
                await this.askToDownloadZeresPluginLibrary();
                // Wait for ZeresPluginLibrary to load if it didn't load yet
                while (typeof window.ZeresPluginLibrary === "undefined") {
                    await this.delay(500);
                }
            } catch (e) {
                console.error(e);
                return BdApi.showToast('LastFMRichPresence: "ZeresPluginLibrary" was not downloaded, or the download failed. This plugin cannot start.', { type: "error" });
            }
        }
        this.initialize();
    }
    initialize() {
        console.log("Starting LastFMRichPresence");
        window.ZeresPluginLibrary?.PluginUpdater?.checkForUpdate?.("LastFMRichPresence", changelog.version, "https://raw.githubusercontent.com/dimdenGD/LastFMRichPresence/main/LastFMRichPresence.plugin.js");
        BdApi.showToast("LastFMRichPresence has started!");
        this.startTime = Date.now();
        this.settings = BdApi.loadData("LastFMRichPresence", "settings") || {};
        if (!this.settings.lastChangelogVersionSeen || versionCompare(changelog.version, this.settings.lastChangelogVersionSeen) === 1) {
            window.ZeresPluginLibrary.Modals.showChangelogModal(changelog.title, changelog.version, changelog.changelog);
            this.settings.lastChangelogVersionSeen = changelog.version;
            this.updateSettings();
        }
    }
    stop() {

    }
    updateSettings() {
        BdApi.saveData("LastFMRichPresence", "settings", this.settings);
    }
    askToDownloadZeresPluginLibrary() {
        return new Promise((resolve, reject) => {
          BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${this.constructor.name} is missing. Please click Download Now to install it.`, {
            confirmText: "Download Now",
            cancelText: "Cancel",
            onConfirm: () => {
              require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                if (error) {
                  console.error(error);
                  require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                  return reject();
                }
                try {
                  await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                  resolve();
                } catch (e) {
                  console.error(`${this.constructor.name}: `, e);
                  reject();
                }
              });
            },
            onCancel: reject
          });
        });
    }
    delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
}

module.exports = LastFMRichPresence;
