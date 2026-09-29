# JADO

JADO is a small, dependency-free dating and livestream UI prototype built with
HTML, CSS, and browser JavaScript.

## Run locally

1. Open a terminal in this project folder.
2. Start a local web server:

	```bash
	python3 -m http.server 8000
	```

3. Open [http://localhost:8000](http://localhost:8000) in your browser.
4. Use **Discover** to browse profiles, keep profiles for later, and like them.
	Kept profiles and mutual matches are saved in this browser across refreshes.
	Open **Live** to browse sample rooms or choose **Go live** to
	preview your camera. Allow camera access when the browser asks.

You can also use `npx serve .` if Python is not installed. Camera access needs a
secure context, so use `localhost` (or HTTPS), not a plain network address.

## Build the Android APK

Install Node.js, JDK 21, and Android Studio with the Android SDK (API 36).
Then run:

```bash
npm install
npm run android:build
```

The debug APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.

## What this prototype does not do

Profiles and rooms are sample data. Keeps and mutual matches are stored locally
in this browser; they are not synced to an account. Likes that are not mutual
exist only until you refresh the page; messaging is not implemented. The live rooms are sample UI,
and **Go live** only previews your camera on this device; it does not broadcast
to other users. A production app needs a backend for accounts and persistent
data, plus WebRTC signaling and a media server or SFU for multi-user streaming.
