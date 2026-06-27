# Raw screenshots (input to the storeship framer)

Drop raw, unframed 6.9" iPhone captures here, named to match the caption keys in
`../../../storeship.yml` (`brand.captions`):

- `01_scan.png` — scanner viewfinder, reticle on a QR code
- `02_link.png` — result sheet showing the decoded URL + domain
- `03_open.png` — result sheet with Open / Copy actions
- `04_wifi.png` — a Wi-Fi (or plain-text) scan result
- `05_privacy.png` — the camera-permission / "Nothing leaves your phone" screen

Capture them from an iPhone 17 Pro Max simulator (1320×2868) running the app:

    npx expo run:ios   # or: eas build --profile preview (simulator build), then drag the .app in
    xcrun simctl io booted screenshot store/screenshots/raw/01_scan.png

Then frame + caption onto the brand canvas:

    storeship style --config storeship.yml \
      --raw store/screenshots/raw --out store/screenshots/styled/en-US

The styled output in `../styled/en-US` is what `storeship ship` uploads.
