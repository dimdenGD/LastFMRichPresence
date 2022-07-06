# LastFMRichPresence BetterDiscord Plugin
This plugin allows you to show what you're listening via Last.fm. You can set it up for Soundcloud, Youtube Music and lot of other sites, not just Spotify (with [Webscrobbler](https://chrome.google.com/webstore/detail/web-scrobbler/hhinaapppaileiechjoiifaancjggfjm?hl=en)).  
  
![Screenshot](https://lune.dimden.dev/4a48c3c3af.png)  
  
## Features
* Show what music you're listening with Last.fm. With [Webscrobbler](https://chrome.google.com/webstore/detail/web-scrobbler/hhinaapppaileiechjoiifaancjggfjm?hl=en) you can show music from 280+ different websites (see list [here](https://web-scrobbler.com/)).  
* Hide Last.fm Rich Presence when listening from Spotify (optional setting).  
* Shows 'Listen on YouTube' button when can find YouTube link.  
* You can also set up 'Listen on Soundcloud' button if you set Soundcloud Authorization key.  
* Easy setup. You can show scrobbles of any person.  
  
## Installation
* Download [this](https://raw.githubusercontent.com/dimdenGD/LastFMRichPresence/main/LastFMRichPresence.plugin.js) file and put it in BetterDiscord plugin folder.  
* Go to [Last.fm API](https://www.last.fm/api) and create API key (it only takes few minutes).  
* Put Last.fm key and your Last.fm username in plugin settings.  
* Wait a minute and it should start working  
  
![Option menu](https://lune.dimden.dev/29fcedb94f.png)  

## Getting Soundcloud Authorization key
You can get OAuth key by having Soundcloud app (but they stopped giving access) or by going to [any search page](https://soundcloud.com/search?q=test), opening DevTools Network tab and finding `search?` request and copying `Authorization` header.  
  
![Soundcloud](https://lune.dimden.dev/d037357515.png)  
  
## Will I get banned for using this?
This plugin uses RPC, which is official API used by lot of programs. It doesn't update your status and won't count as selfbotting.  
  
## Support
Join my [Discord server](https://discord.gg/TBAM6T7AYc) for support.  

## License
MIT
